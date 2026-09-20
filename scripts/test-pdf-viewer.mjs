// Optional real-browser smoke test. Run against an isolated headless Chrome CDP port.
// node scripts/test-pdf-viewer.mjs <public PDF URL> [CDP port]
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import vm from 'node:vm';
import ts from 'typescript';

const pdfUrl = process.argv[2];
assert.ok(pdfUrl && new URL(pdfUrl).protocol === 'https:', 'Provide a public HTTPS test PDF, never a JWT');
const vendor = JSON.parse(readFileSync(new URL('../assets/readora-pdfjs.json', import.meta.url)));
const source = readFileSync(new URL('../src/components/reader/pdf-viewer-html.ts', import.meta.url), 'utf8')
  .replace(/^import vendor.*$/m, 'const vendor = globalThis.vendor;');
const module = { exports:{} };
vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,
  {exports:module.exports, vendor, URL});
const html = module.exports.pdfViewerHtml(pdfUrl, 2, '#FDF8EF');
assert.ok(!html.includes('cdn.jsdelivr.net'));
assert.ok(!html.includes('Authorization'));
const server = createServer((req,res) => {res.setHeader('Content-Type','text/html');res.end(html);});
await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
const tabs = await (await fetch(`http://127.0.0.1:${process.argv[3] ?? 9229}/json`)).json();
const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open',resolve,{once:true}));
let nextId = 0;
const pending = new Map();
socket.addEventListener('message',event => {
  const response = JSON.parse(event.data);
  if (!response.id) return;
  const callback = pending.get(response.id);
  if (callback) {
    pending.delete(response.id);
    if (response.error) callback.reject(new Error(response.error.message));
    else callback.resolve(response.result);
  }
});
const call = (method,params={}) => new Promise((resolve,reject) => {
  const id = ++nextId; pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));
});
const evaluate = async expression => (await call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result.value;
const waitPage = async (predicate, after=0) => {
  const deadline = Date.now()+45000;
  while (Date.now()<deadline) {
    const messages = await evaluate('window.testMessages || []');
    if (messages.some(value => value.type === 'error')) throw new Error('PDF viewer reported a rendering/loading error');
    const pages = messages.filter(value => value.type === 'page');
    if (pages.length>after && predicate(pages.at(-1))) return pages.at(-1);
    await new Promise(resolve => setTimeout(resolve,100));
  }
  throw new Error('PDF browser test timed out');
};
try {
  await call('Page.enable'); await call('Runtime.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:2,mobile:true});
  await call('Page.addScriptToEvaluateOnNewDocument',{source:'window.testMessages=[];window.ReactNativeWebView={postMessage:value=>window.testMessages.push(JSON.parse(value))};'});
  await call('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/`});
  const first = await waitPage(value => value.currentPage === Math.min(2,value.totalPages));
  assert.ok(first.totalPages>0);
  const next = Math.min(first.totalPages, first.currentPage+1);
  await evaluate(`window.readoraCommand({type:'page',page:${next}})`);
  await waitPage(value => value.currentPage === next,1);
  await evaluate(`window.readoraCommand({type:'zoom',zoom:1.5})`);
  await waitPage(value => value.zoom === 1.5,2);
  await evaluate(`window.readoraCommand({type:'page',page:1})`);
  await waitPage(value => value.currentPage === 1,3);
  const size = await evaluate('({width:document.querySelector(\'canvas\').width,height:document.querySelector(\'canvas\').height})');
  assert.ok(size.width>0 && size.height>0 && size.width*size.height<=6000000);
  console.log(`PASS: restored page, real ${first.totalPages}-page PDF, next/previous, zoom and bounded mobile canvas. No JWT or runtime CDN.`);
} finally {
  await call('Page.navigate',{url:'about:blank'});
  socket.close();server.closeAllConnections();server.close();
}
