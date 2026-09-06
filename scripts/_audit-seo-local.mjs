import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createJiti } from 'jiti';

const ROOT = process.cwd();
const jiti = createJiti(import.meta.url, { alias: { '@': join(ROOT, 'src') } });
const { analyzePost } = await jiti.import(join(ROOT, 'src/lib/seo-analysis.ts'));

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const [, head, body] = match;
  const data = {};
  for (const line of head.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const at = line.indexOf(':');
    const key = line.slice(0, at).trim();
    let value = line.slice(at + 1).trim();
    if (value.length > 1 && value[0] === value[value.length - 1] && (value[0] === '"' || value[0] === "'")) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }
  return { data, body: body.trim() };
}

const ONLY = process.argv[2];
const dirs = readdirSync(join(ROOT, 'content/posts'), { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name)
  .sort();

let totalBad = 0, totalWarn = 0, totalGood = 0, filesWithIssues = 0;

for (const key of dirs) {
  if (ONLY && key !== ONLY) continue;
  for (const locale of ['es', 'en']) {
    const file = join(ROOT, 'content/posts', key, `${locale}.md`);
    const { data, body } = parseFrontmatter(readFileSync(file, 'utf8'));
    const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;

    const input = {
      keyphrase: data.focusKeyphrase ?? '',
      title: data.title ?? '',
      seoTitle: data.seoTitle ?? '',
      description: data.seoDescription || data.excerpt || '',
      slug: data.slug ?? '',
      body
    };
    const checks = analyzePost(input);
    const bad = checks.filter(c => c.status === 'bad');
    const warn = checks.filter(c => c.status === 'warning');
    const good = checks.filter(c => c.status === 'good');
    totalBad += bad.length; totalWarn += warn.length; totalGood += good.length;

    const effTitle = data.seoTitle || data.title || '';
    const effDesc = data.seoDescription || data.excerpt || '';

    if (bad.length + warn.length > 0) {
      filesWithIssues++;
      console.log(`\n=== ${key} [${locale}] === words=${words} title_len=${effTitle.length} desc_len=${effDesc.length}`);
      for (const c of [...bad, ...warn]) console.log(`  [${c.status}] ${c.id}: ${c.message}`);
    }
  }
}

console.log(`\n--- TOTAL: bad=${totalBad} warning=${totalWarn} good=${totalGood} (${filesWithIssues} archivos con algo que mirar) ---`);
