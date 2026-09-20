// Rebuild with: node scripts/build-pdfjs-bundle.mjs <extracted pdfjs-dist package>
// No optional Node/native PDF.js dependencies are installed or executed.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2];
if (!root || JSON.parse(readFileSync(join(root, 'package.json'))).version !== '6.3.289') {
  throw new Error('Expected an extracted pdfjs-dist 6.3.289 package');
}
const binary = {};
const licenses = { PDFJS: readFileSync(join(root, 'LICENSE'), 'utf8') };
for (const directory of ['cmaps', 'standard_fonts', 'wasm', 'iccs']) {
  for (const file of readdirSync(join(root, directory))) {
    if (file.startsWith('LICENSE')) licenses[directory + '/' + file] = readFileSync(join(root, directory, file), 'utf8');
    else if (!file.endsWith('.js')) binary[directory + '/' + file] = readFileSync(join(root, directory, file)).toString('base64');
  }
}
const bundle = {
  version: '6.3.289', licenses, binary,
  engine: readFileSync(join(root, 'legacy/build/pdf.mjs'), 'utf8'),
  worker: readFileSync(join(root, 'legacy/build/pdf.worker.mjs'), 'utf8'),
};
writeFileSync(new URL('../assets/readora-pdfjs.json', import.meta.url), JSON.stringify(bundle));
console.log('Bundled trusted PDF.js engine, worker, binary resources and licenses.');
