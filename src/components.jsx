import artDimensions from "./art-dimensions.json";
import React, { useEffect, useRef, useState } from "react";
import { allocation, money, specs, demoDisclaimer } from "./data.js";
export function Logo() {
  return (
    <img
      className="logo"
      src={`${import.meta.env.BASE_URL}logo.png`}
      width="28"
      height="56"
      alt="爱分你"
    />
  );
}
export function Art({
  work,
  small = false,
  version = 0,
  className = "",
  onFailure,
  ...props
}) {
  const [failed, setFailed] = useState(false);
  const source = small ? work.thumbnail : work.image;
  const src = version ? `${source}?retry=${version}` : source;
  useEffect(() => setFailed(false), [src]);
  return (
    <>
      <img
        className={className}
        src={src}
        alt={`${work.artist}《${work.title}》完整画作`}
        width={artDimensions[work.id]?.[0] || 900}
        height={artDimensions[work.id]?.[1] || 1200}
        decoding="async"
        style={failed ? { display: "none" } : undefined}
        onError={() => {
          setFailed(true);
          onFailure?.(true);
        }}
        onLoad={() => {
          setFailed(false);
          onFailure?.(false);
        }}
        {...props}
      />
      {failed && (
        <span
          className="art-unavailable"
          role="img"
          aria-label={`${work.title}图片暂未载入`}
        >
          作品图片暂未载入
          <br />
          <small>可打开详情重新加载</small>
        </span>
      )}
    </>
  );
}
export function Funds({ cents }) {
  return (
    <div className="funds">
      {allocation(cents).map((f) => (
        <div key={f.label}>
          <span>
            {f.label} {f.percent}%
          </span>
          <strong>{money(f.cents)}</strong>
        </div>
      ))}
    </div>
  );
}
export function WorkSummary({ work, spec }) {
  return (
    <div className="order">
      <Art work={work} small />
      <div>
        <h2>{work.title}</h2>
        <p>画者 {work.artist}</p>
        <p>
          {specs[spec].label} · {specs[spec].size}
        </p>
        <strong>
          {money(specs[spec].priceCents)} <small>演示价格</small>
        </strong>
      </div>
    </div>
  );
}
export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef();
  useEffect(() => {
    const d = ref.current,
      previous = document.activeElement,
      y = window.scrollY;
    d.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      d.close();
      document.body.style.overflow = "";
      if (previous?.isConnected) {
        previous.focus({ preventScroll: true });
        window.scrollTo(0, y);
      }
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      aria-labelledby="dialog-title"
      onKeyDown={(e) => {
        if (e.key !== "Tab") return;
        const controls = [
          ...ref.current.querySelectorAll(
            'button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
          ),
        ].filter((el) => el.getClientRects().length);
        const first = controls[0],
          last = controls.at(-1);
        if (
          first &&
          ((e.shiftKey && document.activeElement === first) ||
            (!e.shiftKey && document.activeElement === last))
        ) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        }
      }}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-top">
        <h2 id="dialog-title">{title}</h2>
        <button className="text-button" onClick={onClose} autoFocus>
          关闭 ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function About() {
  return (
    <div className="about">
      <p className="intro-note">从咖啡吊牌，走进一幅画。</p>
      <h3>让创作，被更多人看见。</h3>
      <p>
        老师提供的项目背景资料介绍：爱分你以孤独症公益为方向，希望通过“产品 ×
        艺术”的联名方式，让具备艺术创作能力的伙伴的作品被更多人认识，为持续创作提供支持。
      </p>
      <p>
        这间微型画廊是本课程的入口设计方案：从咖啡吊牌上的同一幅画开始，认识作品与画者，继续欣赏
        24 幅作品。你可以直接分享，也可以体验一种支持画者的方式。
      </p>
      <h3>本方案中的支持机制</h3>
      <p>
        作品认购 → 画者稿酬与课程支持（方案设定）。演示预计分配为 50%
        画者稿酬、30% 课程基金、20% 制作与物流。
      </p>
      <p className="notice">
        {demoDisclaimer} 制作物流不属于公益捐款，演示金额不等于全额捐赠。
      </p>
      <h3>资料来源与边界</h3>
      <ul>
        <li>
          老师提供《爱分你 孤独商店 微信小程序（近期工作背景资料）》第 1
          页，介绍项目背景与“产品 ×
          艺术”的思路。资料自身注明仅作背景，不代表本期要实现完整商店。
        </li>
        <li>
          画作来自老师提供的“原作修复及共创／0001-原作修复”。每幅详情标示原作编号；介绍为画面描述，没有补写个人年龄、经历或诊断。
        </li>
      </ul>
      <p>
        本期免注册、不收手机号或地址、不扣款、不发货。实体规格与价格仅为课堂方案，不代表售卖原作或转让版权；作品纪念卡不构成付款或捐赠证明。这里没有款项到账、受助成果或传播人数的实绩数据。
      </p>
    </div>
  );
}
