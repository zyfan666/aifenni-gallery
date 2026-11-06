import test from "node:test";
import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import {
  works,
  galleryRows,
  specs,
  allocation,
  validateDraft,
  makeMemory,
  getWork,
} from "../src/data.js";
import { readRoute } from "../src/router.js";
import { validPublicBase, workLink } from "../src/config.js";
test("24幅独立作品三行各8幅，原作编号与源文件哈希无重复", async () => {
  const map = JSON.parse(
    await readFile(new URL("../素材映射.json", import.meta.url)),
  );
  assert.equal(works.length, 24);
  assert.deepEqual(
    galleryRows.map((r) => r.length),
    [8, 8, 8],
  );
  for (const key of ["id", "code", "source", "sha256"])
    assert.equal(new Set(map.map((w) => w[key])).size, 24);
  assert.deepEqual(
    map.map((w) => w.id),
    galleryRows.flat().map((w) => w.id),
  );
  assert.equal(getWork("invalid"), undefined);
  assert.ok(works.every((w) => !("stock" in w)));
});
test("全部缩略图与清晰图随源码交付，缩略图体积更小", async () => {
  for (const w of works) {
    const small = await stat(
        new URL(`../public/art/thumb/${w.id}.webp`, import.meta.url),
      ),
      large = await stat(
        new URL(`../public/art/${w.id}.webp`, import.meta.url),
      );
    assert.ok(small.size > 0 && small.size < large.size);
    assert.ok(small.size < 90000);
  }
});
test("金额以分分配，总和始终与演示金额一致", () => {
  for (const cents of [
    0,
    1,
    2,
    3,
    99,
    101,
    9901,
    2900,
    9900,
    ...Object.values(specs).map((s) => s.priceCents),
  ]) {
    const split = allocation(cents);
    assert.equal(
      split.reduce((n, x) => n + x.cents, 0),
      cents,
    );
    assert.ok(split.every((x) => Number.isInteger(x.cents)));
  }
  assert.deepEqual(
    allocation(2900).map((x) => x.cents),
    [1450, 870, 580],
  );
  assert.throws(() => allocation(0.1));
});
test("昵称可留空，无手机号字段，同意状态必须确认", () => {
  assert.deepEqual(validateDraft({ nickname: "", confirmed: true }), {});
  assert.deepEqual(validateDraft({ nickname: "月", confirmed: true }), {});
  assert.ok(
    validateDraft({ nickname: "月".repeat(13), confirmed: true }).nickname,
  );
  assert.ok(validateDraft({ nickname: "", confirmed: false }).confirmed);
});
test("纪念卡冻结作品规格昵称金额与上海日期，默认昵称正确", () => {
  const now = new Date("2026-11-05T20:00:00Z"),
    a = makeMemory("moon", "postcard", "  ", now, "ABC"),
    b = makeMemory("garden", "print", "来信", now, "DEF");
  assert.equal(a.nickname, "爱画的朋友");
  assert.equal(a.date, "2026-11-06");
  assert.equal(a.priceCents, 2900);
  assert.equal(b.nickname, "来信");
  assert.equal(b.workId, "garden");
  assert.equal(b.priceCents, 9900);
  assert.notEqual(a.id, b.id);
  assert.throws(() => makeMemory("missing", "print", ""));
});
test("每件作品独立直达，旧支付证书链接收敛到作品而非交易页面", () => {
  for (const w of works)
    for (const page of ["work", "adopt", "memory"])
      assert.deepEqual(readRoute(`#/${page}/${w.id}?spec=postcard`), {
        page,
        id: w.id,
        spec: "postcard",
        legacy: false,
      });
  for (const old of ["checkout", "pay", "certificate"])
    assert.equal(readRoute(`#/${old}/moon`).page, "work");
  assert.equal(readRoute("").page, "home");
  assert.equal(readRoute("#/adopt/moon?spec=invalid").spec, "print");
});
test("正式地址只接受公开HTTPS，本地不生成正式入口", () => {
  for (const bad of [
    "",
    "http://example.com",
    "https://localhost",
    "https://127.0.0.1",
    "https://192.168.1.1",
    "https://foo.test",
    "https://user:pass@example.com",
    "https://example.com/?token=x",
  ])
    assert.equal(validPublicBase(bad), "");
  assert.equal(
    validPublicBase("https://gallery.example.org/exhibit/"),
    "https://gallery.example.org/exhibit",
  );
  assert.equal(
    workLink("garden", "https://gallery.example.org/exhibit"),
    "https://gallery.example.org/exhibit/#/work/garden",
  );
});

test("取消后草稿保留所选规格与昵称，不串入另一幅作品", async () => {
  const { rememberDraft } = await import("../src/data.js");
  const initial = {};
  const a = rememberDraft(initial, "moon", {
    spec: "postcard",
    nickname: "月光",
  });
  const b = rememberDraft(a, "garden", { nickname: "花草" });
  const c = rememberDraft(b, "moon", { confirmed: true });
  assert.equal(c.moon.spec, "postcard");
  assert.equal(c.moon.nickname, "月光");
  assert.equal(c.garden.spec, "print");
  assert.equal(c.garden.nickname, "花草");
  assert.deepEqual(initial, {});
  assert.equal(a.moon.confirmed, false);
});
