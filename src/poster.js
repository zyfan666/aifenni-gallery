import QRCode from "qrcode";
import { publicBase, workLink } from "./config.js";
import { specs, memoryDisclaimer } from "./data.js";
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const timer = setTimeout(() => {
      image.onload = null;
      image.onerror = null;
      reject(new Error("图片加载超时，请检查网络后重试"));
    }, 12000);
    image.onload = () => {
      clearTimeout(timer);
      resolve(image);
    };
    image.onerror = () => {
      clearTimeout(timer);
      reject(new Error("图片未能载入，请检查网络后重试"));
    };
    image.src = src;
  });
function lines(ctx, text, x, y, width, height) {
  let line = "";
  for (const character of text) {
    if (ctx.measureText(line + character).width > width) {
      ctx.fillText(line, x, y);
      y += height;
      line = "";
    }
    line += character;
  }
  if (line) ctx.fillText(line, x, y);
  return y + height;
}
async function renderCard(work, memory) {
  if (memory && memory.workId !== work.id)
    throw new Error("纪念卡与当前作品不一致");
  const [image, logo] = await Promise.all([
    loadImage(work.image),
    loadImage(`${import.meta.env.BASE_URL}logo.png`),
  ]);
  // Lay out against the artwork's real aspect ratio; no fixed empty image slot.
  const c = document.createElement("canvas");
  c.width = 1080;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("浏览器不支持图片导出");
  const imageY = 224, imageWidth = 932;
  const imageHeight = Math.round(imageWidth * image.height / image.width);
  const contentY = imageY + imageHeight + 56;
  const wrappedHeight = (text, font, width, lineHeight) => {
    ctx.font = font;
    let count = 1, line = "";
    for (const char of text) {
      if (ctx.measureText(line + char).width > width) { count++; line = ""; }
      line += char;
    }
    return count * lineHeight;
  };
  const titleFont = '44px "Songti SC",serif';
  const titleHeight = wrappedHeight(work.title, titleFont, 932, 58);
  const descriptionHeight = wrappedHeight(work.description, "26px sans-serif", 932, 38);
  const rule = contentY + titleHeight + (memory ? 264 : 60 + descriptionHeight);
  const footer = rule + (publicBase ? 248 : 148);
  c.height = Math.ceil(footer + (memory ? 112 : 62));
  ctx.fillStyle = "#f6f1e6";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = "#cbd0bf";
  ctx.strokeRect(34, 34, 1012, c.height - 68);
  ctx.fillStyle = "#254b43";
  ctx.drawImage(logo, 74, 58, 30, 60);
  ctx.font = "26px sans-serif";
  ctx.fillText("爱分你 · 微型画廊", 126, 98);
  ctx.font = '48px "Songti SC",serif';
  ctx.fillText(memory ? "一份喜欢，留作纪念。" : "我发现了一幅画，分你一半。", 74, 178);
  ctx.drawImage(image, 74, imageY, imageWidth, imageHeight);
  ctx.font = titleFont;
  const y = lines(ctx, work.title, 74, contentY, 932, 58);
  ctx.font = "28px sans-serif";
  ctx.fillText(`画者 ${work.artist}`, 74, y);
  if (memory) {
    ctx.font = '34px "Songti SC",serif';
    ctx.fillText(`留给 ${memory.nickname}`, 74, y + 58);
    ctx.font = "27px sans-serif";
    ctx.fillText(`演示规格：${specs[memory.spec].label} · ${specs[memory.spec].size}`, 74, y + 108);
    ctx.fillText(`纪念日期：${memory.dateText}`, 74, y + 154);
    ctx.font = "23px sans-serif";
    ctx.fillText(`本地纪念编号：${memory.id}`, 74, y + 200);
  } else {
    ctx.font = "26px sans-serif";
    lines(ctx, work.description, 74, y + 52, 932, 38);
  }
  ctx.strokeStyle = "#a9b3a3";
  ctx.beginPath(); ctx.moveTo(74, rule); ctx.lineTo(1006, rule); ctx.stroke();
  if (publicBase) {
    const qr = await QRCode.toDataURL(workLink(work.id), {
      width: 180, margin: 4, errorCorrectionLevel: "M",
      color: { dark: "#254b43", light: "#fffdf5" },
    });
    ctx.drawImage(await loadImage(qr), 826, rule + 26, 180, 180);
    ctx.font = "28px sans-serif";
    ctx.fillText("扫码看这幅画，再逛一会儿。", 74, rule + 80);
    ctx.font = "23px sans-serif";
    ctx.fillText("让更多人有机会认识画者。", 74, rule + 128);
  } else {
    ctx.font = "28px sans-serif";
    ctx.fillText("扫码入口待发布", 74, rule + 54);
    ctx.font = "24px sans-serif";
    ctx.fillText("正式地址确定后接入；本地可通过作品链接浏览。", 74, rule + 98);
  }
  if (memory) {
    ctx.font = "23px sans-serif";
    ctx.fillText(memoryDisclaimer, 74, footer + 10);
    ctx.font = "21px sans-serif";
    ctx.fillText("未实际扣款 · 规格为课堂方案设定 · 不代表原作或版权转让", 74, footer + 52);
  } else {
    ctx.font = "21px sans-serif";
    ctx.fillText(`课程原作修复素材 ${work.code} · 分享不代表认购`, 74, footer);
  }
  return new Promise((resolve, reject) => {
    try {
      c.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("图片导出失败，请重试")),
        "image/png",
      );
    } catch (e) {
      reject(e);
    }
  });
}
export const createPoster = (work) => renderCard(work);
export const createMemoryCard = (work, memory) => renderCard(work, memory);
