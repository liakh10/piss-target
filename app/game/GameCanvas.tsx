"use client";

import { useEffect, useRef, useState } from "react";
import { Game, NOZZLE } from "./engine";
import { drawTargetShape } from "../art/targets";
import { ScoreIcon, ComboIcon, TimerIcon, TrophyIcon } from "../art/icons";
import { getSfx } from "../sfx";
import { getMusic } from "../music";
import { getBestScore, saveBestScore, saveBestCombo } from "../store";

interface Hud { phase: "idle" | "playing" | "over"; score: number; combo: number; bestCombo: number; timeLeft: number; }
const IDLE_HUD: Hud = { phase: "idle", score: 0, combo: 0, bestCombo: 0, timeLeft: 60 };

export default function GameCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [hud, setHud] = useState<Hud>(IDLE_HUD);
  const [best, setBest] = useState(() => getBestScore());

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;

    const game = new Game(); gameRef.current = game;
    const img = new Image(); img.src = "/art/pisser.png"; imgRef.current = img;

    const s = getSfx();
    game.onScore = () => s.hit();
    game.onMiss = () => s.miss();
    game.onOver = (finalScore) => {
      s.over();
      const newBest = saveBestScore(finalScore);
      saveBestCombo(game.bestCombo);
      if (newBest) setBest(finalScore); else setBest(getBestScore());
      window.dispatchEvent(new Event("piss:update"));
    };

    if (process.env.NODE_ENV !== "production") (window as unknown as { __game?: Game }).__game = game;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0, lastFireAt = -1000;

    const pt = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { nx: (e.clientX - r.left) / Math.max(1, r.width), ny: (e.clientY - r.top) / Math.max(1, r.height) };
    };
    const down = (e: PointerEvent) => {
      if (gameRef.current?.phase !== "playing") return;
      const { nx, ny } = pt(e);
      gameRef.current.fire(nx, ny);
      s.squirt();
      lastFireAt = performance.now();
    };
    canvas.addEventListener("pointerdown", down);

    let last = "";
    const syncHud = () => {
      const st = game.state();
      const key = `${st.phase}|${st.score}|${st.combo}|${st.bestCombo}|${Math.ceil(st.timeLeft)}`;
      if (key !== last) { last = key; setHud({ phase: st.phase, score: st.score, combo: st.combo, bestCombo: st.bestCombo, timeLeft: st.timeLeft }); }
    };

    let raf = 0, prev = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(50, now - prev); prev = now;
      const r = wrap.getBoundingClientRect();
      W = r.width; H = r.height;
      const wantW = Math.round(W * dpr), wantH = Math.round(H * dpr);
      if (canvas.width !== wantW || canvas.height !== wantH) {
        canvas.width = wantW; canvas.height = wantH;
        canvas.style.width = W + "px"; canvas.style.height = H + "px";
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // bathroom backdrop
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#1a1c22"); grad.addColorStop(0.72, "#20232b"); grad.addColorStop(1, "#262a33");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,212,0,0.06)"; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 34) { ctx.beginPath(); ctx.moveTo(x, H * 0.86); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.strokeStyle = "rgba(255,212,0,0.16)"; ctx.beginPath(); ctx.moveTo(0, H * 0.86); ctx.lineTo(W, H * 0.86); ctx.stroke();

      game.update(dt);
      const scale = Math.min(W, H);

      // splashes (behind targets/stream, on floor/at hit point)
      for (const sp of game.splashes) {
        const age = now - sp.bornAt; const T = 500; const a = 1 - age / T;
        const px = sp.x * W, py = sp.y * H;
        if (sp.kind === "hit") {
          ctx.strokeStyle = `rgba(255,212,0,${Math.max(0, a * 0.8)})`; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(px, py, (age / T) * scale * 0.09, 0, Math.PI * 2); ctx.stroke();
          if (sp.amount) {
            ctx.fillStyle = `rgba(255,247,214,${Math.max(0, a)})`;
            ctx.font = `700 ${Math.round(scale * 0.045)}px system-ui, sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(`+${sp.amount}`, px, py - (age / T) * 26);
          }
        } else {
          ctx.fillStyle = `rgba(120,150,170,${Math.max(0, a * 0.5)})`;
          ctx.beginPath(); ctx.ellipse(px, Math.min(H * 0.94, py), scale * 0.05 * (0.5 + age / T), scale * 0.018, 0, 0, Math.PI * 2); ctx.fill();
        }
      }

      // targets
      for (const tg of game.targets) {
        const px = tg.x * W, py = tg.y * H;
        const R = tg.r * scale;
        let alpha = 1, pop = 1;
        if (tg.hitAt != null) { const a2 = (now - tg.hitAt) / 260; pop = 1 + a2 * 0.7; alpha = Math.max(0, 1 - a2); }
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(px, py); ctx.scale(pop, pop);
        drawTargetShape(ctx, tg.type, R, now / 400 + tg.id);
        ctx.restore();
      }

      // active pee streams
      for (const sh of game.activeShots) {
        const n = sh.trail.length;
        for (let i = 0; i < n; i++) {
          const p = sh.trail[i]; const f = (i + 1) / n;
          ctx.fillStyle = `rgba(255,214,40,${0.25 + f * 0.6})`;
          ctx.beginPath(); ctx.arc(p.x * W, p.y * H, Math.max(1.4, scale * 0.014 * f), 0, Math.PI * 2); ctx.fill();
        }
      }

      // nozzle character
      const im = imgRef.current;
      if (im && im.complete && im.naturalWidth > 0) {
        const IH = scale * 0.4, IW = IH * (im.naturalWidth / im.naturalHeight);
        const recoil = now - lastFireAt < 120 ? 0.9 : 1;
        const nx = NOZZLE.x * W, ny = NOZZLE.y * H;
        ctx.save();
        ctx.translate(nx, ny); ctx.scale(1, recoil); ctx.translate(-nx, -ny);
        ctx.drawImage(im, nx - IW * 0.86, ny - IH * 0.72, IW, IH);
        ctx.restore();
      }

      syncHud();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); canvas.removeEventListener("pointerdown", down); };
  }, []);

  const start = () => {
    getSfx().start();
    try { getMusic().play(); } catch { /* */ }
    gameRef.current?.start();
  };

  const secs = Math.max(0, Math.ceil(hud.timeLeft));

  return (
    <div className="game">
      <div className="game-hud">
        <div className="hud-score"><ScoreIcon size={17} /> {hud.score.toLocaleString()}</div>
        {hud.combo >= 2 && <div className="hud-combo"><ComboIcon size={15} /> {hud.combo}× streak</div>}
        <div className="hud-timer"><TimerIcon size={16} /> 0:{secs.toString().padStart(2, "0")}</div>
        <div className="hud-best"><TrophyIcon size={14} /> best {best.toLocaleString()}</div>
      </div>

      <div className="game-stage" ref={wrapRef}>
        <canvas ref={canvasRef} className="game-canvas" />
        {hud.phase === "idle" && (
          <div className="game-overlay">
            <h3>Aim. Fire. Soak &apos;em.</h3>
            <p>Tap anywhere to unleash the stream. Hit every bottle, can, duck and roach before the tank runs dry — 60 seconds, no refills.</p>
            <button className="btn btn-neon btn-lg" onClick={start}>Let it flow</button>
          </div>
        )}
        {hud.phase === "over" && (
          <div className="game-overlay">
            <h3>Tank&apos;s empty.</h3>
            <div className="over-row"><span><ScoreIcon size={17} /> {hud.score.toLocaleString()}</span><span><ComboIcon size={15} /> {hud.bestCombo}× best streak</span></div>
            <p className="over-best">{hud.score >= best && hud.score > 0 ? "new high score!" : `best ${best.toLocaleString()}`}</p>
            <button className="btn btn-neon btn-lg" onClick={start}>Go again</button>
          </div>
        )}
      </div>
    </div>
  );
}
