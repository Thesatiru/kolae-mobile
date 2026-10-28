// Converte os arquivos de idioma do site (lang/*.php) para JSON do i18next.
// Uso: node tools/convert-lang.mjs ../Kolae/lang
import fs from 'node:fs';
import path from 'node:path';

const srcDir = process.argv[2] ?? '../Kolae/lang';
const outDir = path.resolve('src/i18n/locales/site');
fs.mkdirSync(outDir, { recursive: true });

// Captura 'chave' => 'valor' ou "valor", respeitando aspas escapadas.
const entry = /['"]([\w.-]+)['"]\s*=>\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)")/g;

for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.php'))) {
  const php = fs.readFileSync(path.join(srcDir, file), 'utf8');
  const out = {};
  for (const m of php.matchAll(entry)) {
    out[m[1]] = (m[2] ?? m[3]).replace(/\\(['"\\])/g, '$1');
  }
  const name = file.replace('.php', '.json');
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(out, null, 2) + '\n');
  console.log(`${name}: ${Object.keys(out).length} chaves`);
}
