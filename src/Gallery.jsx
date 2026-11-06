import React, { useState, useEffect } from "react";
import { works, galleryRows } from "./data.js";
import { Art } from "./components.jsx";
import "./gallery-frame.css";
export default function Gallery({ active, blocked, onOpen }) {
  const [paused, setPaused] = useState(false),
    [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false),
    [pageHidden, setPageHidden] = useState(document.hidden),
    [reduced, setReduced] = useState(
      matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)"),
      change = () => setReduced(q.matches);
    q.addEventListener("change", change);
    const visibility = () => setPageHidden(document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      q.removeEventListener("change", change);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const stop =
    !active || blocked || paused || hovered || focused || reduced || pageHidden;
  function open(e, w) {
    if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
    e.preventDefault();
    onOpen(
      w.id,
      e.currentTarget.closest(".track-group")
        ? e.currentTarget.closest(".exhibition")
        : e.currentTarget,
    );
  }
  return (
    <section
      className="gallery"
      hidden={!active}
      aria-labelledby="gallery-heading"
      onFocusCapture={(e) =>
        setFocused(Boolean(e.target.closest(".exhibition, .catalog")))
      }
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <div className="gallery-header">
        <div>
          <p className="intro-note">把一幅画的相遇，继续下去</p>
          <h1 id="gallery-heading" tabIndex="-1">
            慢慢逛，
            <br />
            总有一幅让你停留。
          </h1>
          <p>24 幅独立作品，三行各 8 幅。喜欢就点开看看。</p>
        </div>
        <div className="gallery-controls">
          <button
            className="secondary"
            aria-pressed={paused}
            disabled={reduced}
            onClick={() => setPaused((x) => !x)}
          >
            {reduced
              ? "已按系统设置静止"
              : paused
                ? "继续画廊运动"
                : "暂停画廊运动"}
          </button>
          <a
            className="text-button"
            href="#catalog-heading"
            onClick={(e) => {
              e.preventDefault();
              setPaused(true);
              const heading = document.getElementById("catalog-heading");
              heading.focus();
              heading.scrollIntoView({ block: "start" });
            }}
          >
            手动浏览 24 幅作品
          </a>
        </div>
      </div>
      <p className="note gallery-hint" role="status">
        {reduced
          ? "减少动态效果已开启。"
          : paused
            ? "画廊已暂停。"
            : focused || hovered
              ? "操作时暂时停留，移开焦点后继续。"
              : "三行画框缓缓向右移动。"}{" "}
        下方完整目录支持触摸、点击与键盘浏览。
      </p>
      <div
        className="exhibition"
        tabIndex="-1"
        role="group"
        aria-label="动态画框展示；下方完整作品目录提供键盘浏览"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={() => setPaused(true)}
      >
        {galleryRows.map((row, r) => (
          <div className="art-row" data-row={r + 1} key={r}>
            <div
              className="moving-track"
              style={{
                animationPlayState: stop ? "paused" : "running",
                animationDuration: `${(160 + r * 18) / 1.5}s`,
              }}
            >
              {[0, 1].map((copy) => (
                <div className="track-group" key={copy} aria-hidden="true">
                  {row.map((w) => (
                    <a
                      className="frame"
                      tabIndex="-1"
                      href={`#/work/${w.id}`}
                      onClick={(e) => open(e, w)}
                      aria-label={`查看${w.title}`}
                      key={w.id}
                    >
                      <span className="frame-mat">
                        <Art work={w} small loading="lazy" />
                        <span className="frame-label">
                          <b>{w.title}</b>
                          <span>画者 {w.artist}</span>
                        </span>
                      </span>

                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="catalog">
        <div className="section-heading">
          <h2 id="catalog-heading" tabIndex="-1">
            完整作品目录
          </h2>
          <span className="note">24 幅 · 无需认购也可分享</span>
        </div>
        <div className="catalog-grid">
          {works.map((w) => (
            <a
              className="catalog-item frame"
              key={w.id}
              href={`#/work/${w.id}`}
              onClick={(e) => open(e, w)}
            >
              <span className="frame-mat">
                <Art work={w} small loading="lazy" />
                <span className="frame-label">
                  <b>{w.title}</b>
                  <span>画者 {w.artist}</span>
                  <small>{w.code}</small>
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
