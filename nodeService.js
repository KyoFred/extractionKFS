import { Service } from 'node-windows';
import path from 'path';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
console.log("-->",__filename, __dirname);

const sRV = new Service({
    name: 'Extraction KFS',
    script: path.join( 'c:/projects/extractionKFS/src/index.js')
});

sRV.on('install', () => {
    sRV.start();
});

sRV.install();