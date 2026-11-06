import React, { useState, useEffect } from "react";
import { publicBase, workLink } from "./config.js";
export default function ExportCard({ work, kind = "share", memory }) {
  const [url, setUrl] = useState(""),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [feedback, setFeedback] = useState(""),
    [retry, setRetry] = useState(0);
  const isMemory = kind === "memory";
  useEffect(() => {
    let disposed = false,
      objectUrl;
    setBusy(true);
    setUrl("");
    setError("");
    setFeedback("");
    import("./poster.js")
      .then((m) =>
        isMemory ? m.createMemoryCard(work, memory) : m.createPoster(work),
      )
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        if (disposed) URL.revokeObjectURL(objectUrl);
        else setUrl(objectUrl);
      })
      .catch(() => {
        if (!disposed)
          setError(
            "图片未能生成，请检查网络或浏览器图片导出权限后重试。当前作品和已选信息仍在。",
          );
      })
      .finally(() => {
        if (!disposed) setBusy(false);
      });
    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [work.id, memory?.id, kind, retry]);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(workLink(work.id));
      setFeedback("作品链接已复制，把这幅画带给下一位看画的人。");
    } catch {
      setFeedback("链接未能自动复制。请长按或选中下方作品链接，使用系统复制。");
    }
  }
  return (
    <div className="share-content export-card" data-card-kind={kind}>
      {busy && (
        <p role="status">
          {isMemory ? "正在制作作品纪念卡…" : "正在制作作品分享卡…"}
        </p>
      )}
      {error && (
        <div className="export-error" role="alert">
          <p>{error}</p>
          <button className="secondary" onClick={() => setRetry((x) => x + 1)}>
            重新生成{isMemory ? "纪念卡" : "分享卡"}
          </button>
        </div>
      )}
      {url && !busy && (
        <>
          <p className="generation-status" role="status">
            {isMemory ? "作品纪念卡已生成" : "作品分享卡已生成"}
          </p>
          <img
            className="poster"
            src={url}
            width="1080"
            alt={`${work.artist}《${work.title}》${isMemory ? `作品纪念卡，署名${memory.nickname}` : "普通作品分享海报，无认购信息"}`}
          />
          <a
            className="primary"
            href={url}
            download={`爱分你-${work.title}-${isMemory ? "作品纪念卡" : "作品分享卡"}.png`}
            onClick={() =>
              setFeedback(
                "已请求下载图片；请在浏览器下载列表查看。若打开图片预览，可长按保存。",
              )
            }
          >
            {isMemory ? "下载作品纪念卡" : "下载作品分享卡"}
          </a>
          <a
            className="text-button preview-link"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            打开图片预览，长按保存
          </a>
        </>
      )}
      <button className="secondary" onClick={copyLink}>
        复制这幅画的链接
      </button>
      <label className="link-label">
        当前作品链接
        <input
          name="work-link"
          readOnly
          value={workLink(work.id)}
          onFocus={(e) => e.target.select()}
        />
      </label>
      <p className="note">
        {publicBase
          ? "扫码可打开这幅作品，也可以复制下方链接。"
          : "本地链接仅供当前设备查看。正式扫码入口待发布。"}
      </p>
      <p className="note">
        分享作品，让更多人有机会认识画者。生成图片不代表已保存到相册或发送给朋友。
      </p>
      <p className="action-feedback" role="status">
        {feedback}
      </p>
    </div>
  );
}
