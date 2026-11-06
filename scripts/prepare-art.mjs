import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { works } from "../src/data.js";
const source = new URL(
    "../../作业资源/原作修复及共创/0001-原作修复/",
    import.meta.url,
  ),
  output = new URL("../public/art/", import.meta.url);
await mkdir(new URL("thumb/", output), { recursive: true });
const map = [];
for (const w of works) {
  const input = fileURLToPath(new URL(w.source, source));
  const meta = await sharp(input).metadata();
  await sharp(input)
    .rotate()
    .resize({
      width: 1400,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 86 })
    .toFile(fileURLToPath(new URL(`${w.id}.webp`, output)));
  await sharp(input)
    .rotate()
    .resize({
      width: 320,
      height: 360,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 72 })
    .toFile(fileURLToPath(new URL(`thumb/${w.id}.webp`, output)));
  map.push({
    id: w.id,
    row: w.row,
    title: w.title,
    artist: w.artist,
    code: w.code,
    version: "课程提供的0001原作修复版（同画不重复计数）",
    source: `作业资源/原作修复及共创/0001-原作修复/${w.source}`,
    sha256: createHash("sha256")
      .update(await readFile(input))
      .digest("hex"),
    detail: `public/art/${w.id}.webp`,
    thumbnail: `public/art/thumb/${w.id}.webp`,
    originalWidth: meta.width,
    originalHeight: meta.height,
  });
}
if (new Set(map.map((x) => x.sha256)).size !== 24)
  throw new Error("存在重复素材");
await writeFile(
  new URL("../素材映射.json", import.meta.url),
  JSON.stringify(map, null, 2) + "\n",
);
