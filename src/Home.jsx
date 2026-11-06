import React, { useState } from "react";
import { works } from "./data.js";
import { Art } from "./components.jsx";
export default function Home({ showModal }) {
  const [homeWork, setHomeWork] = useState(works[0]);
  const [flipped, setFlipped] = useState(false);
  return (
    <section className="home">
      <div className="home-letter">
        <p className="intro-note">致，愿意为一幅画停留的你</p>
        <h1>
          给你，
          <br />
          一小片月光。
        </h1>
        <p className="subtitle">从一张吊牌开始，认识画画的人。</p>
        <div className="desktop-letter-note">
          <span className="tiny-rule" />
          <p>
            你手里的那幅画，
            <br />
            在这里继续。
          </p>
        </div>
      </div>
      <div className="home-art">
        <div className="letter-object">
          <div className="letter-shadow" aria-hidden="true" />
          <button
            className={`postcard ${flipped ? "flipped" : ""}`}
            onClick={() => setFlipped((v) => !v)}
            aria-label={flipped ? "翻回明信片正面" : "翻到明信片背面"}
            aria-pressed={flipped}
          >
            <span className="postcard-inner">
              <span className="postcard-front" aria-hidden={flipped}>
                <Art work={homeWork} fetchPriority="high" />
                <span>来自爱分你的微型画廊</span>
              </span>
              <span className="postcard-back" aria-hidden={!flipped}>
                <span className="stamp">
                  一份
                  <br />
                  喜欢
                </span>
                <strong>
                  很高兴，
                  <br />
                  你看见了这幅画。
                </strong>
                <span>画名：{homeWork.title}</span>
                <span>画者：{homeWork.artist}</span>
                <span className="postcard-note">
                  一幅画，是认识一位创作者的开始。可以继续看画，也可以把喜欢分给下一位。
                </span>
                <span className="signature">爱分你 微型画廊</span>
              </span>
            </span>
          </button>
        </div>
        <div className="flip-row">
          <span>把一幅画，放进口袋。</span>
          <button className="text-button" onClick={() => setFlipped((v) => !v)}>
            {flipped ? "翻回正面" : "翻到背面"} ↻
          </button>
        </div>
        <div className="ticket">
          <div>
            <p className="note">你正在看的作品</p>
            <h2>{homeWork.title}</h2>
            <p>画者 {homeWork.artist}</p>
          </div>
          <button
            className="square"
            aria-label="放大查看完整画作"
            onClick={() => showModal("zoom", homeWork)}
          >
            ＋
          </button>
        </div>
      </div>
      <div className="home-actions">
        <a className="primary" href="#/gallery">
          走进微型画廊 <span aria-hidden="true">↗</span>
        </a>
        <div className="thumbs" aria-label="首页作品选择">
          {[works[0], works[1], works[3]].map((item) => (
            <button
              key={item.id}
              aria-label={`首页查看${item.title}`}
              aria-pressed={item.id === homeWork.id}
              onClick={() => {
                setHomeWork(item);
                setFlipped(false);
              }}
            >
              <Art work={item} small />
            </button>
          ))}
        </div>
        <button className="text-button" onClick={() => showModal("about")}>
          了解爱分你与支持机制
        </button>
      </div>
    </section>
  );
}
