import http from 'node:http';
import path from 'node:path';
import {readFile, stat} from 'node:fs/promises';
import {watch} from 'node:fs';
import {build,root} from './build.mjs';

const port=Number(process.env.PORT || 4173);
const outDir=path.join(root,'dist');
await build({preview:true,siteUrl:`http://localhost:${port}`});
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2','.xml':'application/xml','.md':'text/markdown; charset=utf-8','.excalidraw':'application/json'};
const server=http.createServer(async(req,res)=>{
  let pathname;
  try {pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400);res.end('Invalid URL');return;}
  if(pathname==='/__preview/graphics'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    res.end(`<!doctype html><html><head><title>Graphics verification</title></head><body style="margin:0"><div><button id="lose">Lose context</button><button id="restore">Restore context</button><output id="result">Ready</output></div><iframe title="Graph preview" src="/" style="width:100%;height:850px;border:0"></iframe><script>
      const frame=document.querySelector('iframe');let recovery;
      document.querySelector('#lose').onclick=()=>{const canvas=frame.contentDocument.querySelector('.graph-depth');recovery=canvas?.getContext('webgl')?.getExtension('WEBGL_lose_context');if(!recovery){document.querySelector('#result').value='Context-loss extension unavailable';return;}recovery.loseContext();document.querySelector('#result').value='Context loss requested';};
      document.querySelector('#restore').onclick=()=>{if(!recovery)return;recovery.restoreContext();document.querySelector('#result').value='Context restoration requested';};
    </script></body></html>`);
    return;
  }
  if(pathname==='/__preview/phone'){
    res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    res.end('<!doctype html><html><head><title>Phone preview</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#eeedf0;display:flex;justify-content:center"><iframe title="390px phone preview" src="/" width="390" height="844" style="border:0;flex:none"></iframe></body></html>');
    return;
  }
  let file=path.resolve(outDir,'.'+pathname);
  if(!file.startsWith(outDir+path.sep)&&file!==outDir){res.writeHead(403);res.end('Forbidden');return;}
  try {
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store'});res.end(body);
  } catch(error) {
    if(error.code!=='ENOENT'&&error.code!=='ENOTDIR'){console.error(error);res.writeHead(500);res.end('Unable to read page');return;}
    res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(outDir,'404.html')));
  }
});
let timer;
let chain=Promise.resolve();
for(const directory of ['content','public'])watch(path.join(root,directory),{recursive:true},()=>{
  clearTimeout(timer);
  timer=setTimeout(()=>{chain=chain.then(()=>build({preview:true,siteUrl:`http://localhost:${port}`})).catch(error=>console.error('Build failed:',error));},150);
});
server.listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
