import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getWork, rememberDraft } from "./data.js";
import { Logo, Art, Modal, About } from "./components.jsx";
import Home from "./Home.jsx";
import Gallery from "./Gallery.jsx";
import ExportCard from "./ExportCard.jsx";
import { Adoption, MemoryPage } from "./Experience.jsx";
import { readRoute } from "./router.js";
import artDimensions from "./art-dimensions.json";
import "./styles.css";
function Detail({ work, onShare, preferredSpec }) {
  const [failed, setFailed] = useState(false),
    [version, setVersion] = useState(0),
    [zoom, setZoom] = useState(false),
    [enlarged, setEnlarged] = useState(false);
  return (
    <section className="detail page">
      <a href="#/gallery" className="back">
        ‹ 返回画廊，继续看画
      </a>
      <div className="detail-layout">
        <div className="detail-piece">
          <button
            className="detail-art"
            style={{
              "--art-ratio": (artDimensions[work.id]?.[0] || 900) /
                (artDimensions[work.id]?.[1] || 1200),
            }}
            onClick={() => {
              if (failed) setVersion((v) => v + 1);
              else setZoom(true);
            }}
            aria-label={
              failed ? "重新加载作品图片" : `放大查看${work.title}完整画作`
            }
          >
            <span className="detail-frame">
              <span className="detail-mat">
                <Art work={work} version={version} onFailure={setFailed} />
              </span>
            </span>
            <span className="detail-view-label">
              {failed ? "重新加载作品图片" : "＋ 完整看画"}
            </span>
          </button>
          <p className="source">课程原作修复素材 · {work.code}</p>
          {failed && (
            <p className="error" role="alert">
              图片暂未载入。请恢复网络后点击上方重新加载，作品信息仍可查看。
            </p>
          )}
        </div>
        <div className="detail-info">
          <p className="intro-note">从作品，认识 {work.artist}</p>
          <h1>{work.title}</h1>
          <p className="artist">画者 {work.artist}</p>
          <p className="description">{work.description}</p>
          <p className="note">
            以上为画面描述。素材来自课程提供的“原作修复及共创／0001-原作修复”。
          </p>
          <div className="detail-paths">
            <button className="primary" onClick={onShare}>
              分享这幅画
            </button>
            <a
              className="secondary"
              href={`#/adopt/${work.id}?spec=${preferredSpec}`}
            >
              体验认购，制作纪念卡
            </a>
            <p className="note">
              无需认购即可分享。认购为课堂演示，不产生扣款。
            </p>
          </div>
        </div>
      </div>
      {zoom && (
        <Modal
          title="完整看画"
          onClose={() => {
            setZoom(false);
            setEnlarged(false);
          }}
          wide
        >
          <div className="zoom-view">
            <div className={enlarged ? "zoom-scroll enlarged" : "zoom-scroll"}>
              <Art work={work} />
            </div>
            <h3>{work.title}</h3>
            <p>画者 {work.artist} · 保留原作完整比例</p>
            <button
              className="secondary"
              onClick={() => setEnlarged((v) => !v)}
            >
              {enlarged ? "适应窗口" : "放大查看细节"}
            </button>
            <p className="note">放大后可滚动看细节；手机也可双指缩放。</p>
          </div>
        </Modal>
      )}
    </section>
  );
}
function App() {
  const [route, setRoute] = useState(readRoute),
    [modal, setModal] = useState(null),
    [drafts, setDrafts] = useState({}),
    [memories, setMemories] = useState({}),
    [online, setOnline] = useState(navigator.onLine);
  const activeRoute = useRef(route),
    galleryPosition = useRef(0),
    returnFocus = useRef(),
    main = useRef();
  const work = getWork(route.id),
    draft = drafts[route.id] || {
      nickname: "",
      confirmed: false,
      spec: route.spec,
    };
  useEffect(() => {
    const hash = () => {
      if (activeRoute.current.page === "gallery")
        galleryPosition.current = window.scrollY;
      const next = readRoute();
      activeRoute.current = next;
      setModal(null);
      setRoute(next);
    };
    addEventListener("hashchange", hash);
    const network = () => setOnline(navigator.onLine);
    addEventListener("online", network);
    addEventListener("offline", network);
    return () => {
      removeEventListener("hashchange", hash);
      removeEventListener("online", network);
      removeEventListener("offline", network);
    };
  }, []);
  useLayoutEffect(() => {
    document.title = work
      ? `${work.title} · 爱分你微型画廊`
      : "爱分你 · 纸上来信微型画廊";
    main.current?.focus({ preventScroll: true });
    if (route.page === "gallery") {
      window.scrollTo(0, galleryPosition.current);
      if (returnFocus.current?.isConnected)
        returnFocus.current.focus({ preventScroll: true });
      returnFocus.current = null;
    } else window.scrollTo(0, 0);
  }, [route.page, route.id]);
  useEffect(() => {
    if (route.page !== "adopt") return;
    setDrafts((previous) =>
      previous[route.id]?.spec === route.spec
        ? previous
        : rememberDraft(previous, route.id, {
            spec: route.spec,
            confirmed: false,
          }),
    );
  }, [route.page, route.id, route.spec]);
  function go(path) {
    if (route.page === "gallery") galleryPosition.current = window.scrollY;
    location.hash = path;
  }
  function openWork(id, trigger) {
    returnFocus.current = trigger;
    go(`/work/${id}`);
  }
  function setDraft(part) {
    setDrafts((previous) => rememberDraft(previous, route.id, part));
  }
  function showModal(kind, selected = work || getWork("moon")) {
    setModal({ kind, work: selected });
  }
  const unknown =
    !["home", "gallery", "work", "adopt", "memory"].includes(route.page) ||
    (["work", "adopt", "memory"].includes(route.page) && !work);
  return (
    <>
      <a
        href="#main-content"
        className="skip"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        跳到主要内容
      </a>
      <header className="site-header">
        <a href="#/" className="brand" aria-label="爱分你首页">
          <Logo />
          <span className="brand-wordmark" aria-hidden="true">
            <strong>爱分你</strong>
            <span lang="en">Share Love Society</span>
          </span>
        </a>
        <nav aria-label="主导航">
          <a
            href="#/gallery"
            aria-current={route.page === "gallery" ? "page" : undefined}
          >
            逛画廊
          </a>
          <button className="text-button" onClick={() => showModal("about")}>
            项目与支持机制
          </button>
        </nav>
        <span className="postmark" aria-hidden="true">
          微型画廊
          <br />
          随咖啡抵达
        </span>
      </header>
      <div className="demo-line">课程交互演示 · 不发生真实扣款或作品交付</div>
      {!online && (
        <div className="offline-banner" role="status">
          当前已断网。可继续看已加载的内容；清晰图片或卡片如未能生成，请恢复网络后重试。不承诺首次离线加载。
        </div>
      )}
      <main id="main-content" ref={main} tabIndex="-1">
        {route.page === "home" && <Home showModal={showModal} />}
        <Gallery
          active={route.page === "gallery"}
          blocked={!!modal}
          onOpen={openWork}
        />
        {!unknown && work && route.page === "work" && (
          <>
            {route.legacy && (
              <p className="legacy-note">
                旧版交易入口已调整。可直接分享作品，或体验下方的简化演示认购。
              </p>
            )}
            <Detail
              preferredSpec={draft.spec}
              key={work.id}
              work={work}
              onShare={() => showModal("share")}
            />
          </>
        )}
        {!unknown && work && route.page === "adopt" && (
          <Adoption
            key={work.id}
            work={work}
            spec={route.spec}
            draft={draft}
            onDraft={setDraft}
            onSpec={(spec) => {
              setDraft({ spec, confirmed: false });
              go(`/adopt/${work.id}?spec=${spec}`);
            }}
            onComplete={(memory) => {
              setMemories((p) => ({ ...p, [work.id]: memory }));
              go(`/memory/${work.id}`);
            }}
          />
        )}
        {!unknown && work && route.page === "memory" && (
          <MemoryPage
            work={work}
            memory={memories[work.id]}
            onAbout={() => showModal("about")}
            onShare={() => showModal("share")}
          />
        )}
        {unknown && (
          <section className="page narrow empty">
            <h1>这幅画暂时没找到。</h1>
            <p>作品链接可能不完整，画廊里的 24 幅作品仍在等你。</p>
            <a className="primary" href="#/gallery">
              回到画廊
            </a>
          </section>
        )}
      </main>
      <footer className="site-footer">
        <span>爱分你 · 把喜欢分给下一位</span>
        <button className="text-button" onClick={() => showModal("about")}>
          项目与演示说明
        </button>
      </footer>
      {modal && (
        <Modal
          title={
            modal.kind === "about"
              ? "爱分你与支持机制"
              : modal.kind === "zoom"
                ? "完整看画"
                : "分享这幅画"
          }
          onClose={() => setModal(null)}
          wide={modal.kind === "zoom"}
        >
          {modal.kind === "about" ? (
            <About />
          ) : modal.kind === "share" ? (
            <ExportCard work={modal.work} />
          ) : (
            <div className="zoom-view">
              <div className="zoom-scroll">
                <Art work={modal.work} />
              </div>
              <h3>{modal.work.title}</h3>
              <p>画者 {modal.work.artist} · 完整原比例</p>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
