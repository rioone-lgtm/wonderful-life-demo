// src/pages/*.html を共通レイアウト（src/layout.html）に流し込み、ルートに書き出す。
// 各ページ先頭の <!--{ ... }--> に title / desc / nav / spcta を書く。
//   node tools/build.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const layout = readFileSync(join(root, 'src/layout.html'), 'utf8');
const SITE = 'わんだふるライフ｜千葉県佐倉市の犬の保育園';
const SPCTA = `<div class="sp-cta">
  <a class="btn btn--tel" href="tel:0432357988" aria-label="電話する（043-235-7988）"><span aria-hidden="true">☎</span>電話</a>
  <a class="btn btn--cta" href="/trial#form">体験入園を申し込む</a>
</div>`;

for (const file of readdirSync(join(root, 'src/pages')).filter((f) => f.endsWith('.html'))) {
  const src = readFileSync(join(root, 'src/pages', file), 'utf8');
  const m = src.match(/^<!--(\{[\s\S]*?\})-->\n?/);
  if (!m) throw new Error(`${file}: 先頭に <!--{...}--> がありません`);
  const meta = JSON.parse(m[1]);
  const html = layout
    .replace('{{title}}', meta.title ? `${meta.title}｜${SITE}` : SITE)
    .replace('{{desc}}', meta.desc || '')
    .replace(/\{\{cur:(\w+)\}\}/g, (_, k) => (k === meta.nav ? ' aria-current="page"' : ''))
    .replace('{{spcta}}', meta.spcta === false ? '' : SPCTA)
    .replace('{{content}}', src.slice(m[0].length).trim());
  writeFileSync(join(root, file), html);
  console.log('built', file);
}
