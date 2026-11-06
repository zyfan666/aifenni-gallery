import React, { useEffect, useRef, useState } from "react";
import {
  specs,
  money,
  validateDraft,
  makeMemory,
  demoDisclaimer,
  memoryDisclaimer,
} from "./data.js";
import { WorkSummary, Funds } from "./components.jsx";
import ExportCard from "./ExportCard.jsx";
export function Adoption({ work, spec, draft, onDraft, onSpec, onComplete }) {
  const [busy, setBusy] = useState(false),
    [errors, setErrors] = useState({});
  const lock = useRef(false),
    timer = useRef(),
    summary = useRef();
  useEffect(() => {
    setBusy(false);
    lock.current = false;
    return () => {
      clearTimeout(timer.current);
      lock.current = false;
    };
  }, [work.id, spec]);
  function cancel() {
    clearTimeout(timer.current);
    lock.current = false;
  }
  function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    const found = validateDraft(draft);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => summary.current?.focus());
      return;
    }
    const snapshot = { ...draft };
    lock.current = true;
    setBusy(true);
    timer.current = setTimeout(() => {
      onComplete(makeMemory(work.id, spec, snapshot.nickname));
    }, 900);
  }
  return (
    <section className="checkout page narrow">
      <a className="back" href={`#/work/${work.id}`} onClick={cancel}>
        ‹ 取消并返回作品
      </a>
      <p className="intro-note">体验支持画者的一种方式</p>
      <h1>
        把喜欢，
        <br />
        留作一份纪念。
      </h1>
      <p className="notice">
        课堂原型演示，不产生实际扣款。不收手机号、地址或真实支付信息。
      </p>
      <WorkSummary work={work} spec={spec} />
      <form noValidate onSubmit={submit}>
        <fieldset className="specs" disabled={busy}>
          <legend>选择演示规格</legend>
          {Object.entries(specs).map(([key, value]) => (
            <label
              className={`spec ${spec === key ? "selected" : ""}`}
              key={key}
            >
              <input
                type="radio"
                name="demo-spec"
                checked={spec === key}
                value={key}
                onChange={() => onSpec(key)}
              />
              <span>
                <strong>{value.label}</strong>
                <small>{value.size}</small>
              </span>
              <b>{money(value.priceCents)}</b>
            </label>
          ))}
        </fieldset>
        <p className="note">
          实体规格与价格为方案设定，不代表实际售卖原作或转让版权。
        </p>
        <div
          className="error-summary"
          ref={summary}
          tabIndex="-1"
          hidden={!Object.values(errors).some(Boolean)}
          role="alert"
        >
          <h2>请检查演示信息</h2>
          {Object.entries(errors)
            .filter(([, text]) => text)
            .map(([key, text]) => (
              <a
                href={`#${key}`}
                key={key}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(key)?.focus();
                }}
              >
                {text}
              </a>
            ))}
        </div>
        <label htmlFor="nickname">纪念卡上的昵称（选填）</label>
        <input
          id="nickname"
          name="nickname"
          autoComplete="off"
          maxLength="24"
          disabled={busy}
          value={draft.nickname}
          onChange={(e) => {
            onDraft({ nickname: e.target.value });
            setErrors((p) => {
              const n = { ...p };
              delete n.nickname;
              return n;
            });
          }}
          aria-invalid={!!errors.nickname}
          aria-describedby="nickname-help nickname-error"
        />
        <p className="note" id="nickname-help">
          最多 12
          个字符，留空使用“爱画的朋友”。只在当前页面内存中用于制卡，刷新后清空。
        </p>
        <p className="error" id="nickname-error" aria-live="polite">
          {errors.nickname}
        </p>
        <label className="agreement" htmlFor="confirmed">
          <input
            id="confirmed"
            required
            name="demo-confirmation"
            type="checkbox"
            disabled={busy}
            checked={draft.confirmed}
            onChange={(e) => {
              onDraft({ confirmed: e.target.checked });
              setErrors((p) => {
                const n = { ...p };
                delete n.confirmed;
                return n;
              });
            }}
            aria-invalid={!!errors.confirmed}
            aria-describedby="confirmation-error"
          />
          <span>
            我已了解这是课堂演示，不发生实际扣款或作品交付；纪念卡不构成付款或捐赠证明。
          </span>
        </label>
        <p className="error" id="confirmation-error" aria-live="polite">
          {errors.confirmed}
        </p>
        <div className="total">
          <span>本次演示金额</span>
          <strong>{money(specs[spec].priceCents)}</strong>
        </div>
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "正在完成演示…" : "确认演示，生成作品纪念卡"}
        </button>
        <p role="status" className="note">
          {busy
            ? "正在处理本地演示，请稍候；仍可取消返回作品。"
            : "全程免注册，普通作品分享始终独立可用。"}
        </p>
        <a href={`#/work/${work.id}`} className="secondary" onClick={cancel}>
          {busy ? "取消处理中并返回作品" : "取消，继续看画"}
        </a>
      </form>
    </section>
  );
}
export function MemoryPage({ work, memory, onAbout, onShare }) {
  return (
    <section className="page narrow memory-page">
      {memory ? (
        <>
          <p className="intro-note">谢谢你体验支持画者的一种方式</p>
          <h1>演示认购已完成</h1>
          <p>未实际扣款。下面是这次体验的预计支持去向与个人作品纪念卡。</p>
          <section className="support-summary" aria-labelledby="support-title">
            <h2 id="support-title">这份支持将去向哪里</h2>
            <p>本次演示预计分配 · {money(memory.priceCents)}</p>
            <p className="notice">{demoDisclaimer}</p>
            <Funds cents={memory.priceCents} />
            <p className="note">
              制作与物流不属于公益捐款；演示金额不等于全额捐赠。这里没有真实到账或支出记录。
            </p>
            <button className="text-button" onClick={onAbout}>
              了解项目与支持机制
            </button>
          </section>
          <section className="memory-export" aria-labelledby="memory-heading">
            <h2 id="memory-heading">你的作品纪念卡</h2>
            <p>
              {memory.nickname} · {work.artist}《{work.title}》<br />
              {specs[memory.spec].label} · {memory.dateText}
            </p>
            <p className="notice">{memoryDisclaimer}</p>
            <ExportCard work={work} kind="memory" memory={memory} />
          </section>
          <button className="secondary" onClick={onShare}>
            分享这幅画（普通作品海报）
          </button>
          <a className="secondary" href="#/gallery">
            继续逛微型画廊
          </a>
        </>
      ) : (
        <div className="empty">
          <h1>
            这份纪念，
            <br />
            还未生成。
          </h1>
          <p>纪念卡在完成当前作品的演示后生成，刷新不会保留昵称或演示记录。</p>
          <a className="primary" href={`#/adopt/${work.id}`}>
            重新体验，制作纪念卡
          </a>
          <a className="secondary" href={`#/work/${work.id}`}>
            返回作品，可直接分享
          </a>
        </div>
      )}
    </section>
  );
}
