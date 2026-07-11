// Piss Target — arcade shooting-gallery sim. All state lives in normalized
// coordinates (0..1 across the stage); GameCanvas converts to pixels at draw
// time so physics never depends on the current canvas size.
import { TARGET_TYPES, type TargetType } from "../art/targets";

const TYPES: TargetType[] = TARGET_TYPES;
export type { TargetType };

export interface PTarget {
  id: number;
  type: TargetType;
  x: number; y: number; r: number;
  vx: number;
  bornAt: number;
  life: number;      // ms before it despawns unharmed
  hitAt: number | null; // set when popped, drives the pop animation then removal
}

export interface Shot {
  id: number;
  ox: number; oy: number;
  vx: number; vy0: number;
  t0: number; T: number; // seconds
  trail: { x: number; y: number }[];
  done: boolean;
}

export interface Splash { x: number; y: number; bornAt: number; kind: "hit" | "miss"; amount?: number; }

export type Phase = "idle" | "playing" | "over";

export const NOZZLE = { x: 0.1, y: 0.13 };
const G = 2.05;
const ROUND_TIME = 60;
const MAX_TARGETS = 4;
const SPAWN_GAP = 900; // ms between spawn attempts
const HIT_PAD = 1.15;  // hit-radius multiplier vs drawn radius (a little forgiving)

let uid = 1;

export class Game {
  phase: Phase = "idle";
  score = 0;
  combo = 0;
  bestCombo = 0;
  timeLeft = ROUND_TIME;
  hits = 0;
  shots = 0;
  targets: PTarget[] = [];
  activeShots: Shot[] = [];
  splashes: Splash[] = [];
  private lastSpawn = 0;
  private now = 0;
  onScore?: (delta: number, combo: number) => void;
  onMiss?: () => void;
  onOver?: (finalScore: number) => void;

  start() {
    this.phase = "playing";
    this.score = 0; this.combo = 0; this.bestCombo = 0; this.hits = 0; this.shots = 0;
    this.timeLeft = ROUND_TIME;
    this.targets = []; this.activeShots = []; this.splashes = [];
    this.now = 0; this.lastSpawn = -SPAWN_GAP;
    for (let i = 0; i < 3; i++) this.spawnTarget(-i * 260);
  }

  private spawnTarget(atMs = this.now) {
    const r = 0.045 + Math.random() * 0.032;
    const x = 0.28 + Math.random() * 0.6;
    const y = 0.16 + Math.random() * 0.44;
    const vx = (Math.random() < 0.5 ? -1 : 1) * (0.02 + Math.random() * 0.05);
    this.targets.push({
      id: uid++, type: TYPES[Math.floor(Math.random() * TYPES.length)],
      x, y, r, vx, bornAt: atMs, life: 5200 + Math.random() * 2600, hitAt: null,
    });
  }

  fire(tx: number, ty: number) {
    if (this.phase !== "playing") return;
    const dx = tx - NOZZLE.x, dy = ty - NOZZLE.y;
    const T = Math.min(1.05, Math.max(0.38, 0.4 + Math.abs(dx) * 0.55));
    const vx = dx / T;
    const vy0 = (dy - 0.5 * G * T * T) / T;
    this.activeShots.push({ id: uid++, ox: NOZZLE.x, oy: NOZZLE.y, vx, vy0, t0: this.now, T, trail: [], done: false });
    this.shots++;
  }

  private resolveShot(s: Shot) {
    let hitSomething = false;
    for (const tg of this.targets) {
      if (tg.hitAt != null) continue;
      const last = s.trail[s.trail.length - 1];
      if (!last) continue;
      const d = Math.hypot(last.x - tg.x, last.y - tg.y);
      if (d < tg.r * HIT_PAD) {
        tg.hitAt = this.now;
        this.combo++;
        this.bestCombo = Math.max(this.bestCombo, this.combo);
        this.hits++;
        const sizeMult = 1 + (0.077 - tg.r) / 0.032 * 1.5;
        const comboMult = 1 + Math.min(this.combo, 25) * 0.12;
        const gained = Math.round(10 * Math.max(0.6, sizeMult) * comboMult);
        this.score += gained;
        this.splashes.push({ x: tg.x, y: tg.y, bornAt: this.now, kind: "hit", amount: gained });
        this.onScore?.(gained, this.combo);
        hitSomething = true;
        s.done = true; // the stream lands on its target — it doesn't punch through to others
        break;
      }
    }
    if (!hitSomething && s.done) {
      const last = s.trail[s.trail.length - 1];
      if (last) this.splashes.push({ x: last.x, y: Math.min(0.92, last.y), bornAt: this.now, kind: "miss" });
      this.combo = 0;
      this.onMiss?.();
    }
  }

  update(dtMs: number) {
    if (this.phase !== "playing") return;
    this.now += dtMs;

    if (this.now - this.lastSpawn > SPAWN_GAP && this.targets.length < MAX_TARGETS) {
      this.spawnTarget();
      this.lastSpawn = this.now;
    }
    for (const tg of this.targets) {
      if (tg.hitAt == null) {
        tg.x += tg.vx * (dtMs / 1000);
        if (tg.x < 0.2 || tg.x > 0.95) tg.vx *= -1;
        tg.x = Math.min(0.95, Math.max(0.2, tg.x));
      }
    }
    this.targets = this.targets.filter((tg) => {
      if (tg.hitAt != null) return this.now - tg.hitAt < 260;
      return this.now - tg.bornAt < tg.life;
    });

    for (const s of this.activeShots) {
      if (s.done) continue;
      const t = (this.now - s.t0) / 1000;
      const tt = Math.min(t, s.T);
      const x = s.ox + s.vx * tt;
      const y = s.oy + s.vy0 * tt + 0.5 * G * tt * tt;
      s.trail.push({ x, y });
      if (s.trail.length > 16) s.trail.shift();
      if (t >= s.T) s.done = true;
      this.resolveShot(s);
    }
    this.activeShots = this.activeShots.filter((s) => !s.done || this.now - s.t0 < s.T * 1000 + 260);
    this.splashes = this.splashes.filter((sp) => this.now - sp.bornAt < 500);

    this.timeLeft = Math.max(0, ROUND_TIME - this.now / 1000);
    if (this.timeLeft <= 0) {
      this.phase = "over";
      this.onOver?.(this.score);
    }
  }

  state() {
    return {
      phase: this.phase, score: this.score, combo: this.combo, bestCombo: this.bestCombo,
      timeLeft: this.timeLeft, hits: this.hits, shots: this.shots, targets: this.targets.length,
    };
  }

  // dev-only headless helpers, mirrored on window.__game
  debugFire(tx: number, ty: number) { this.fire(tx, ty); }
  debugAdvance(dtMs: number) { this.update(dtMs); }
  debugSpawnAt(x: number, y: number, r = 0.06) {
    this.targets.push({ id: uid++, type: "can", x, y, r, vx: 0, bornAt: this.now, life: 999999, hitAt: null });
  }
}
