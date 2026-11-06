import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import QRCode from 'qrcode';
import { works } from '../src/data.js';
import { validPublicBase, workLink } from '../src/config.js';

const [site, destination] = process.argv.slice(2);
const base = validPublicBase(site);
if (!base || !destination) {
  throw new Error('Usage: node scripts/export-qrcodes.mjs <public HTTPS site> <output directory>');
}
const output = path.resolve(destination);
await mkdir(output, { recursive: true });
const entries = [
  { id: 'entry', title: '网站首页', artist: '', url: `${base}/` },
  ...works.map(({ id, title, artist, code }) => ({ id, title, artist, code, url: workLink(id, base) })),
];
for (const entry of entries) {
  const options = {
    margin: 4,
    errorCorrectionLevel: 'M',
    width: 1024,
    color: { dark: '#254b43', light: '#ffffff' },
  };
  await QRCode.toFile(path.join(output, `${entry.id}.png`), entry.url, options);
  await writeFile(path.join(output, `${entry.id}.svg`), await QRCode.toString(entry.url, { ...options, type: 'svg' }));
  entry.png = `${entry.id}.png`;
  entry.svg = `${entry.id}.svg`;
}
await writeFile(path.join(output, '链接映射.json'), JSON.stringify({ site: `${base}/`, entries }, null, 2) + '\n');
const escape = (value = '') => `"${String(value).replaceAll('"', '""')}"`;
await writeFile(path.join(output, '链接映射.csv'), '\ufeff' + [
  ['标识', '画名', '画者', '原作编号', 'URL', 'PNG', 'SVG'],
  ...entries.map(e => [e.id, e.title, e.artist, e.code, e.url, e.png, e.svg]),
].map(row => row.map(escape).join(',')).join('\n') + '\n');
await writeFile(path.join(output, 'README.md'), [
  '# 正式链接与二维码', '', `网站入口：${base}/`, '',
  'entry 为吊牌入口，与首页《月亮上的小女孩》承接。其余 24 个二维码各自进入对应作品详情。',
  'PNG 为 1024px；SVG 为矢量，均保留四模块静区。不要裁去白边、覆盖图案或拉伸。', '',
  '| 作品 | 画者 | 链接 |', '| --- | --- | --- |',
  ...entries.map(e => `| ${e.title} | ${e.artist} | [打开](${e.url}) |`), '',
].join('\n'));
console.log(`Exported ${entries.length} real QR codes to ${output}`);
