import {readFile,writeFile} from 'node:fs/promises';
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const [page,client,market,baseline]=await Promise.all(['page.html','client.js','market.js','quotes-baseline.json'].map(read));
const source='const PAGE = '+JSON.stringify(page)+';\nconst CLIENT = '+JSON.stringify(client)+';\nconst BASELINES = '+baseline+';\n'+market;
await writeFile(new URL('../worker/index.js',import.meta.url),source);
