"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { CA, TICKER, X_URL, PUMP_URL, DEX_URL, isRealCA } from "./config";
import { XIcon, ComboIcon, TrophyIcon } from "./art/icons";
import { TARGET_TYPES, TARGET_LABEL, drawTargetShape, type TargetType } from "./art/targets";
import { getSfx } from "./sfx";
import { getMusic } from "./music";
import { getBestScore, getBestCombo } from "./store";
import Enter from "./Enter";

const GameCanvas = dynamic(() => import("./game/GameCanvas"), { ssr: false });

const NAV = [
  { href: "#play", label: "Play" },
  { href: "#how", label: "How" },
  { href: "#gallery", label: "Targets" },
  { href: "/docs", label: "Docs" },
];

const HOW = [
  ["Aim", "Tap anywhere on the tank to fire — the stream arcs toward wherever you point, gravity and all."],
  ["Soak the target", "Land the stream on a bottle, can, duck, roach or roll before it scurries off. Smaller ones pay more."],
  ["Chain streaks", "Consecutive hits build a combo multiplier. One dry miss and the streak resets to zero."],
];

const NOTES = [
  { h: "wtf is this", b: "One guy, one tank, sixty seconds. Everything in the bathroom is a target now." },
  { h: "the targets", b: "Bottles, cans, a rubber duck, a roach, a roll of paper — they drift, you don't miss. $PISS fuels the tank." },
  { h: "the clock", b: "No lives, no crashes — just a timer. Chain hits before it hits zero for the real score." },
];

function TargetGlyph({ type, size = 64 }: { type: TargetType; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = size * dpr; c.height = size * dpr;
    c.style.width = size + "px"; c.style.height = size + "px";
    const ctx = c.getContext("2d"); if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(size / 2, size / 2);
    drawTargetShape(ctx, type, size * 0.34, 0);
  }, [type, size]);
  return <canvas ref={ref} />;
}

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function CABlock() {
  const [copied, setCopied] = useState(false);
  const real = isRealCA();
  const copy = () => navigator.clipboard?.writeText(CA).then(() => { setCopied(true); getSfx().click(); setTimeout(() => setCopied(false), 1400); }).catch(() => {});
  return (
    <div className="ca">
      <span className="ca-label">CA</span>
      <code className="ca-value">{real ? CA : "SOON"}</code>
      {real && <button className="ca-copy" onClick={copy}>{copied ? "copied" : "copy"}</button>}
    </div>
  );
}

function BuyLinks({ small }: { small?: boolean }) {
  const cls = small ? "btn btn-sm" : "btn";
  return (
    <div className="buy">
      <a className={`${cls} btn-neon`} href={isRealCA() ? PUMP_URL + CA : PUMP_URL} target="_blank" rel="noreferrer">Pump Fun</a>
      <a className={`${cls} btn-ghost`} href={isRealCA() ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
    </div>
  );
}

function HallOfFame() {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  useEffect(() => {
    const refresh = () => { setScore(getBestScore()); setCombo(getBestCombo()); };
    refresh();
    window.addEventListener("piss:update", refresh);
    window.addEventListener("piss:awake", refresh);
    window.addEventListener("focus", refresh);
    return () => { window.removeEventListener("piss:update", refresh); window.removeEventListener("piss:awake", refresh); window.removeEventListener("focus", refresh); };
  }, []);
  return (
    <div className="records">
      <div className="record-card reveal"><TrophyIcon size={26} /><b>{score.toLocaleString()}</b><span>best score</span></div>
      <div className="record-card reveal"><ComboIcon size={22} /><b>{combo}×</b><span>best streak</span></div>
    </div>
  );
}

export default function Home() {
  useReveal();
  const [muted, setMutedState] = useState(false);
  useEffect(() => {
    const onAwake = () => setMutedState(getMusic().muted);
    window.addEventListener("piss:awake", onAwake);
    return () => window.removeEventListener("piss:awake", onAwake);
  }, []);
  const toggleMute = () => { const m = !muted; setMutedState(m); getMusic().setMuted(m); getSfx().setEnabled(!m); if (!m) getMusic().play(); };

  return (
    <>
      <Enter />
      <main>
        <header className="nav">
          <a href="#top" className="brand"><Image src="/art/pisser.png" alt="" width={26} height={26} className="brand-mascot" /> <b>Piss Target</b> <span className="brand-ticker">{TICKER}</span></a>
          <nav className="nav-links">{NAV.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}</nav>
          <div className="nav-actions">
            <button className="icon-btn" onClick={toggleMute} title="sound">{muted ? "off" : "on"}</button>
            <a href={X_URL} target="_blank" rel="noreferrer" className="icon-btn" aria-label="X"><XIcon size={15} /></a>
            <a href="#play" className="btn btn-neon btn-sm">Play</a>
          </div>
        </header>

        <div className="hazard" />

        <section id="top" className="hero">
          <span className="pill reveal">arcade tir · one tank · on Solana</span>
          <h1 className="hero-title reveal">PISS TARGET</h1>
          <p className="hero-sub reveal">Aim anywhere. Fire a stream. Soak every target before the tank runs dry.</p>
          <div id="play" className="reveal"><GameCanvas /></div>
          <div className="hero-token reveal"><CABlock /><BuyLinks small /></div>
        </section>

        <div className="hazard" />

        <section id="how" className="section">
          <div className="section-head reveal"><span className="pill">How to Play</span><h2 className="section-title">Aim. Soak. Streak.</h2></div>
          <div className="how">
            {HOW.map(([h, b], i) => (
              <div className="how-item reveal" key={h}><span className="how-n">{i + 1}</span><h3>{h}</h3><p>{b}</p></div>
            ))}
          </div>
        </section>

        <section className="section section-gallery">
          <div className="section-head reveal"><span className="pill">Hall of Fame</span><h2 className="section-title">Your best run</h2><p className="section-lead">Records saved on your device.</p></div>
          <HallOfFame />
        </section>

        <section id="gallery" className="section">
          <div className="section-head reveal"><span className="pill">Targets</span><h2 className="section-title">What&apos;s in the tank&apos;s way</h2><p className="section-lead">Smaller targets are worth more — they&apos;re farther off in the tank.</p></div>
          <div className="gallery reveal">
            {TARGET_TYPES.map((t) => (
              <div className="target-card" key={t}>
                <TargetGlyph type={t} />
                <span className="target-name">{TARGET_LABEL[t]}</span>
                <span className="target-pts">score varies</span>
              </div>
            ))}
          </div>
        </section>

        <section id="notes" className="section">
          <div className="section-head reveal"><span className="pill">Notes</span><h2 className="section-title">Field notes</h2></div>
          <div className="notes-wall">
            {NOTES.map((n, i) => <article className={`note note-${i % 3} reveal`} key={n.h}><h3>{n.h}</h3><p>{n.b}</p></article>)}
          </div>
        </section>

        <footer className="footer">
          <div className="footer-top reveal">
            <a href="#top" className="brand"><Image src="/art/pisser.png" alt="" width={22} height={22} className="brand-mascot" /> <b>Piss Target</b></a>
            <div className="footer-links"><a href="#play">Play</a><a href="#how">How</a><a href="#gallery">Targets</a><a href="/docs">Docs</a><a href={X_URL} target="_blank" rel="noreferrer" className="footer-x" aria-label="X"><XIcon size={14} /></a></div>
          </div>
          <div className="footer-buy reveal"><CABlock /><BuyLinks small /></div>
          <p className="footer-bottom">© {new Date().getFullYear()} {TICKER} · aim responsibly</p>
        </footer>
      </main>
    </>
  );
}
