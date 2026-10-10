'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const {spawn} = require('node:child_process');
const cli = path.resolve(__dirname, '../bin/tram');

async function exercise(data, cases) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const raw = Buffer.concat(chunks).toString();
    let body = raw;
    if (req.headers['content-type']?.includes('application/json')) {
      try { body = JSON.parse(raw); } catch {}
    }
    requests.push({method:req.method, url:req.url, headers:req.headers, body});
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ok:true}));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tram-runtime-'));
  try {
    const manifest = {manifestVersion:'0.2', name:'Runtime regression',
      config:{baseUrl:`http://127.0.0.1:${server.address().port}`}, data,
      tests:cases.map((entry,i)=>({id:`runtime-${i}`,name:`Runtime ${i}`,method:'POST',path:'/echo',expect:{status:200},...entry}))};
    const manifestFile = path.join(dir,'manifest.json');
    const reportFile = path.join(dir,'report.json');
    fs.writeFileSync(manifestFile,JSON.stringify(manifest));
    const result = await new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[cli,manifestFile,'--report',reportFile]);
      let stdout='',stderr='';
      child.stdout.on('data',x=>stdout+=x);
      child.stderr.on('data',x=>stderr+=x);
      child.on('error',reject);
      child.on('close',code=>resolve({code,stdout,stderr}));
    });
    return {result,requests,report:fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile,'utf8')):null};
  } finally {
    fs.rmSync(dir,{recursive:true,force:true});
    await new Promise(resolve=>server.close(resolve));
  }
}
const good = x => assert.equal(x.result.code,0,x.result.stderr+'\n'+x.result.stdout);

test('typed $data references preserve JSON types and nested values', async()=>{
  const x=await exercise({user:{id:42,active:true},tags:['a','b'],empty:null},[{body:{id:'$data.user.id',active:'$data.user.active',tags:'$data.tags',empty:'$data.empty'}}]);
  good(x);
  assert.deepEqual(x.requests[0].body,{id:42,active:true,tags:['a','b'],empty:null});
});

test('embedded data tokens resolve in path, query, headers, and body', async()=>{
  const x=await exercise({user:{id:42},label:'hello'},[{path:'/users/${data.user.id}',query:{q:'item-${data.label}'},headers:{'x-label':'prefix-${data.label}'},body:{note:'value-${data.user.id}'}}]);
  good(x);
  assert.equal(x.requests[0].url,'/users/42?q=item-hello');
  assert.equal(x.requests[0].headers['x-label'],'prefix-hello');
  assert.equal(x.requests[0].body.note,'value-42');
});

test('built-in tokens generate recognizable values in initialized data', async()=>{
  const x=await exercise({id:'${uuid}',date:'${timestamp}',email:'${randomEmail}',random:'${randomId}'},[{body:{id:'$data.id',date:'$data.date',email:'$data.email',random:'$data.random'}}]);
  good(x);
  const b=x.requests[0].body;
  assert.match(b.id,/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.ok(!Number.isNaN(Date.parse(b.date)));
  assert.match(b.email,/^test-[a-z0-9]+@example\.com$/);
  assert.match(b.random,/^[a-z0-9]+$/);
});

test('initialized token is reused consistently across requests', async()=>{
  const x=await exercise({id:'${uuid}'},[{body:{id:'$data.id'}},{body:{id:'$data.id'}}]);
  good(x);
  assert.equal(x.requests[0].body.id,x.requests[1].body.id);
});

test('unknown built-in token remains literal', async()=>{
  const x=await exercise({},[{body:{value:'${unrecognizedToken}'}}]);
  good(x);
  assert.equal(x.requests[0].body.value,'${unrecognizedToken}');
});

test('missing $data reference aborts execution before report generation', async()=>{
  const x=await exercise({},[{body:{value:'$data.missing'}}]);
  assert.equal(x.result.code,1);
  assert.equal(x.requests.length,0);
  // Currently buildRequest throws before the runTest catch block, so no report is written.
  assert.match(x.result.stderr,/Data reference not found/);
});

test('missing embedded data reference fails before sending request', async()=>{
  const x=await exercise({},[{path:'/items/${data.missing}'}]);
  assert.equal(x.result.code,1);
  assert.equal(x.requests.length,0);
  assert.match(x.result.stderr,/Data reference not found/);
});
