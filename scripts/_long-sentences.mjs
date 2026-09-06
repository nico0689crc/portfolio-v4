import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const [key, locale] = process.argv.slice(2);

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return match[2].trim();
}

function toPlainText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const file = join(ROOT, 'content/posts', key, `${locale}.md`);
const body = parseFrontmatter(readFileSync(file, 'utf8'));
const plain = toPlainText(body);
const sentences = plain.split(/[.!?]+\s/).filter(Boolean);
const countWords = (t) => t.split(/\s+/).filter(Boolean).length;
const long = sentences.filter(s => countWords(s) > 25);

console.log(`Total oraciones: ${sentences.length}, largas (>25 palabras): ${long.length} (${Math.round(long.length*100/sentences.length)}%)`);
console.log(`Necesita bajar a menos de ${Math.ceil(sentences.length * 0.25)} largas para estar en verde.\n`);
long.forEach((s, i) => console.log(`[${countWords(s)}w] ${s.slice(0, 220)}\n`));
