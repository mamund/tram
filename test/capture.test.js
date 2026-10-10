'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {spawn} = require('node:child_process');
const cli = path.resolve(__dirname, '../bin/tram');

async function exercise(cases) {
  const requests=[];
  const server=http.createServer(async(req,res)=>{
    const chunks=[]; for await(const c of req) chunks.push(c);
    let body=Buffer.concat(chunks).toString();
    try {body=JSON.parse(body);}catch{}
    requests.push({url:req.url,headers:req.headers,body});
    res.setHeader('content-type','application/json');
    res.setHeader('x-trace-id','trace-123');
    res.end(JSON.stringify({id:42, nested:{token:'abc'}, items:[{name:'first'}]}));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'tram-capture-'));
  try {
    const manifest={manifestVersion:'0.2',name:'Capture regression',config:{baseUrl:`http://127.0.0.1:${server.address().port}`},tests:cases.map((c,i)=>({id:`capture-${i}`,name:`Capture ${i}`,method:'POST',path:'/echo',expect:{status:200},...c}))};
    const file=path.join(dir,'manifest.json'),reportFile=path.join(dir,'report.json');
    fs.writeFileSync(file,JSON.stringify(manifest));
    const result=await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[cli,file,'--report',reportFile]);let stdout='',stderr='';
      child.stdout.on('data',x=>stdout+=x);child.stderr.on('data',x=>stderr+=x);
      child.on('error',reject);child.on('close',code=>resolve({code,stdout,stderr}));
    });
    return {result,requests,report:fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile,'utf8')):null};
  }finally{fs.rmSync(dir,{recursive:true,force:true});await new Promise(resolve=>server.close(resolve));}
}
const good=x=>assert.equal(x.result.code,0,x.result.stderr+'\n'+x.result.stdout);

test('captures response body and reuses typed values in next request',async()=>{
  const x=await exercise([{capture:{id:'body.id',token:'body.nested.token'}},{path:'/items/${capture.id}',body:{id:'$capture.id',token:'$capture.token'}}]);
  good(x);assert.equal(x.requests[1].url,'/items/42');assert.deepEqual(x.requests[1].body,{id:42,token:'abc'});
});
test('captures response status and header',async()=>{
  const x=await exercise([{capture:{status:'status',trace:'headers.x-trace-id'}},{headers:{'x-from-capture':'${capture.trace}'},body:{status:'$capture.status'}}]);
  good(x);assert.equal(x.requests[1].headers['x-from-capture'],'trace-123');assert.equal(x.requests[1].body.status,200);
});
test('captures nested array values',async()=>{
  const x=await exercise([{capture:{name:'body.items.0.name'}},{body:{name:'$capture.name'}}]);
  good(x);assert.equal(x.requests[1].body.name,'first');
});
test('optional missing capture is non-failing and recorded',async()=>{
  const x=await exercise([{capture:{missing:{from:'body.absent',optional:true}}}]);
  good(x);assert.match(JSON.stringify(x.report),/Optional capture skipped/);
});
test('required missing capture fails suite and is recorded',async()=>{
  const x=await exercise([{capture:{missing:'body.absent'}}]);
  assert.equal(x.result.code,1);assert.ok(x.report);assert.match(JSON.stringify(x.report),/Capture failed/);
});
test('failed expectations prevent capture from being applied',async()=>{
  const x=await exercise([{expect:{status:201},capture:{id:'body.id'}}]);
  assert.equal(x.result.code,1);assert.ok(x.report);assert.doesNotMatch(JSON.stringify(x.report),/Captured id from/);
});
test('missing capture reference aborts before report generation (known issue)',async()=>{
  const x=await exercise([{body:{id:'$capture.unknown'}}]);
  assert.equal(x.result.code,1);assert.equal(x.requests.length,0);assert.equal(x.report,null);
  assert.match(x.result.stderr,/Capture reference not found/);
});
