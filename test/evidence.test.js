'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {spawn} = require('node:child_process');
const cli = path.resolve(__dirname, '../bin/tram');

async function exercise(tests, opts = {}) {
  const requests=[];
  const server=http.createServer(async(req,res)=>{
    const chunks=[]; for await(const c of req) chunks.push(c);
    requests.push({url:req.url, method:req.method, body:Buffer.concat(chunks).toString(),headers:req.headers});
    res.setHeader('content-type','application/json');
    res.setHeader('x-trace-id','trace-evidence');
    res.setHeader('set-cookie','session=secret-cookie');
    res.end(JSON.stringify({ok:true,id:42}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tram-evidence-'));
  try {
    const manifest={manifestVersion:'0.2',name:'Evidence regression',config:{baseUrl:`http://127.0.0.1:${server.address().port}`},tests:tests.map((x,i)=>({id:`evidence-${i}`,name:`Evidence ${i}`,method:'GET',path:'/resource',expect:{status:200},...x}))};
    const file=path.join(dir,'manifest.json'),report=path.join(dir,'report.json'),transcript=path.join(dir,'transcript.http');
    fs.writeFileSync(file,JSON.stringify(manifest));
    const args=[cli,file,'--report',opts.reportPath || report,'--transcript',opts.transcriptPath || transcript];
    const result=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,args);let stdout='',stderr='';child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr}));});
    return {result,requests,report:fs.existsSync(report)?JSON.parse(fs.readFileSync(report,'utf8')):null,transcript:fs.existsSync(transcript)?fs.readFileSync(transcript,'utf8'):null};
  } finally {fs.rmSync(dir,{recursive:true,force:true});await new Promise(resolve=>server.close(resolve));}
}

test('successful run produces structured JSON report and HTTP transcript',async()=>{
  const x=await exercise([{path:'/items?limit=2',headers:{'x-test':'visible'}}]);
  assert.equal(x.result.code,0,x.result.stderr);assert.equal(x.report.name,'Evidence regression');
  assert.deepEqual(x.report.summary,{total:1,passed:1,failed:0,skipped:0});
  assert.equal(x.report.results[0].request.method,'GET');assert.equal(x.report.results[0].response.status,200);
  assert.match(x.transcript,/GET \/items\?limit=2 HTTP\/1\.1/);assert.match(x.transcript,/< HTTP\/1\.1 200/);
  assert.match(x.transcript,/x-trace-id: trace-evidence/i);
});
test('failed assertion retains request, response, and assertion evidence',async()=>{
  const x=await exercise([{expect:{status:201}}]);assert.equal(x.result.code,1);
  assert.equal(x.report.summary.failed,1);assert.equal(x.report.results[0].passed,false);
  assert.equal(x.report.results[0].response.status,200);
  assert.ok(x.report.results[0].assertions.some(a=>a.passed===false));
  assert.match(x.transcript,/HTTP\/1\.1 200/);
});
test('skipped tests are counted and omitted from HTTP transcript',async()=>{
  const x=await exercise([{enabled:false,path:'/skipped'},{path:'/active'}]);
  assert.equal(x.result.code,0,x.result.stderr);assert.equal(x.report.summary.skipped,1);
  assert.equal(x.requests.length,1);assert.doesNotMatch(x.transcript,/\/skipped/);assert.match(x.transcript,/\/active/);
});
test('HTTP transcript redacts credential headers',async()=>{
  const x=await exercise([{headers:{Authorization:'Bearer super-secret','x-api-key':'api-secret',Cookie:'session=request-secret'}}]);
  assert.equal(x.result.code,0,x.result.stderr);
  assert.match(x.transcript,/authorization: \[redacted\]/i);
  assert.match(x.transcript,/x-api-key: \[redacted\]/i);
  assert.match(x.transcript,/set-cookie: \[redacted\]/i);
  for(const secret of ['super-secret','api-secret','request-secret','secret-cookie'])assert.doesNotMatch(x.transcript,new RegExp(secret));
});
test('JSON report currently retains sensitive header values (known beta issue)',async()=>{
  const x=await exercise([{headers:{Authorization:'Bearer super-secret','x-api-key':'api-secret'}}]);
  assert.equal(x.result.code,0,x.result.stderr);
  const raw=JSON.stringify(x.report);
  assert.match(raw,/super-secret/);assert.match(raw,/api-secret/);assert.match(raw,/secret-cookie/);
});
test('invalid report directory is rejected before any HTTP request',async()=>{
  const x=await exercise([{}],{reportPath:path.join(os.tmpdir(),'tram-nonexistent-dir-987654321','report.json')});
  assert.equal(x.result.code,1);assert.equal(x.requests.length,0);assert.match(x.result.stderr,/Report directory does not exist/);
});
test('invalid transcript directory is rejected before any HTTP request',async()=>{
  const x=await exercise([{}],{transcriptPath:path.join(os.tmpdir(),'tram-nonexistent-dir-987654321','transcript.http')});
  assert.equal(x.result.code,1);assert.equal(x.requests.length,0);assert.match(x.result.stderr,/Transcript directory does not exist/);
});
