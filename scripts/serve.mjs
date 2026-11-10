import {createServer} from 'node:http';
import worker from '../worker/index.js';
createServer(async(req,res)=>{try{const r=await worker.fetch(new Request('http://localhost'+req.url,{method:req.method}),{},{});res.writeHead(r.status,Object.fromEntries(r.headers));res.end(Buffer.from(await r.arrayBuffer()));}catch{res.writeHead(500);res.end('Unable to serve request');}}).listen(Number(process.argv[process.argv.indexOf('--port')+1])||Number(process.env.PORT)||3000,'0.0.0.0');
