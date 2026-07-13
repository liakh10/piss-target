"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CA, TICKER, PUMP_URL, DEX_URL, isRealCA } from "../config";
import { TARGET_TYPES, TARGET_LABEL } from "../art/targets";

const SECTIONS = [
  { id: "overview", label: "What is Piss Target?" },
  { id: "controls", label: "Gameplay & Controls" },
  { id: "targets", label: "The Targets" },
  { id: "scoring", label: "Scoring & Combos" },
  { id: "token", label: `${TICKER} Token` },
  { id: "local", label: "Local & Free" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="docs-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function DocsContent() {
  const [active, setActive] = useState("overview");
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => { for (const e of entries) if (e.isIntersecting) setActive(e.target.id); },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    for (const s of SECTIONS) { const el = refs.current[s.id]; if (el) io.observe(el); }
    return () => io.disconnect();
  }, []);

  const real = isRealCA();

  return (
    <>
      <header className="nav">
        <Link href="/#top" className="brand"><Image src="/art/pisser.png" alt="" width={26} height={26} className="brand-mascot" /> <b>Piss Target</b> <span className="brand-ticker">{TICKER}</span></Link>
        <nav className="nav-links">
          <Link href="/#play">Play</Link>
          <Link href="/#how">How</Link>
          <Link href="/#gallery">Targets</Link>
          <span className="docs-nav-crumb">Docs</span>
        </nav>
        <div className="nav-actions">
          <Link href="/#play" className="btn btn-neon btn-sm">Play</Link>
        </div>
      </header>

      <div className="docs-shell">
        <aside className="docs-side">
          <span className="docs-kicker">Field Manual</span>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={`docs-nav-link ${active === s.id ? "active" : ""}`}>{s.label}</a>
          ))}
        </aside>

        <main className="docs-main">
          <div className="docs-hero">
            <h1>Piss Target Docs</h1>
            <p>Everything about the shooting-gallery arcade, scoring, targets, and {TICKER} — in one page.</p>
          </div>

          <section id="overview" ref={(el) => { refs.current.overview = el; }} className="docs-section">
            <h2>What is Piss Target?</h2>
            <p>
              Piss Target is a 60-second arcade shooting gallery, playable instantly in the browser — no
              download, no signup. Aim anywhere on the stage and fire an arced stream at drifting targets
              before the clock runs out.
            </p>
            <div className="docs-table">
              <Row label="Ticker">{TICKER} (Solana, fair launch)</Row>
              <Row label="Format">Single-player timed shooting gallery, tap-to-aim</Row>
              <Row label="Round length">60 seconds</Row>
              <Row label="Cost to play">Free, unlimited, no wallet required</Row>
            </div>
          </section>

          <section id="controls" ref={(el) => { refs.current.controls = el; }} className="docs-section">
            <h2>Gameplay & Controls</h2>
            <p>One input: tap where you want the stream to land — physics handles the rest.</p>
            <div className="docs-table">
              <Row label="Aim & fire">Tap or click anywhere on the stage — the stream arcs there under simulated gravity</Row>
              <Row label="Travel time">Farther shots take longer to land — lead moving targets accordingly</Row>
              <Row label="One hit per shot">A stream lands on the first target it touches — it doesn&apos;t punch through to others</Row>
              <Row label="Round end">The run ends automatically when the 60-second clock hits zero — no lives, no crashes</Row>
            </div>
          </section>

          <section id="targets" ref={(el) => { refs.current.targets = el; }} className="docs-section">
            <h2>The Targets</h2>
            <p>Five target types drift back and forth across the stage and despawn if left alone too long.</p>
            <div className="docs-table">
              {TARGET_TYPES.map((t) => <Row key={t} label={TARGET_LABEL[t]}>Drifts side to side, despawns unharmed after a few seconds if never hit</Row>)}
            </div>
          </section>

          <section id="scoring" ref={(el) => { refs.current.scoring = el; }} className="docs-section">
            <h2>Scoring & Combos</h2>
            <p>Smaller targets pay more, and a clean streak multiplies everything.</p>
            <div className="docs-table">
              <Row label="Base hit">10 points, scaled up for smaller (farther) targets</Row>
              <Row label="Combo">Each consecutive hit raises a multiplier, up to a cap around 25 hits</Row>
              <Row label="Miss">A shot that lands without hitting anything resets the combo to zero — no other penalty</Row>
              <Row label="Best score / best streak">Both saved locally — only new records overwrite them</Row>
            </div>
          </section>

          <section id="token" ref={(el) => { refs.current.token = el; }} className="docs-section">
            <h2>{TICKER} Token</h2>
            <p>The game has no in-game currency or shop — {TICKER} is a separate community token that doesn&apos;t affect gameplay, target spawns, or scoring in any way.</p>
            <div className="docs-table">
              <Row label="Contract">{real ? <code className="mono">{CA}</code> : "SOON — not launched yet"}</Row>
              <Row label="Launch style">Fair launch on Pump Fun, no presale, no team allocation</Row>
              <Row label="Buy links">
                <a href={real ? PUMP_URL + CA : PUMP_URL} target="_blank" rel="noreferrer">Pump Fun</a>
                {" · "}
                <a href={real ? DEX_URL + CA : DEX_URL} target="_blank" rel="noreferrer">DexScreener</a>
              </Row>
            </div>
          </section>

          <section id="local" ref={(el) => { refs.current.local = el; }} className="docs-section">
            <h2>Local & Free</h2>
            <p>No backend, no account, no wallet gate on the game itself. Your records live only in this browser.</p>
            <div className="docs-table">
              <Row label="Storage">Best score and best streak saved to this browser&apos;s localStorage</Row>
              <Row label="Device-local">Clearing site data or switching browsers/devices resets your records</Row>
              <Row label="No leaderboard">Scores aren&apos;t submitted anywhere — the Hall of Fame is a personal record only</Row>
            </div>
            <p className="docs-note">Cross-device syncing, shared leaderboards, and any real-money mechanic are not built — see Roadmap below.</p>
          </section>

          <section id="roadmap" ref={(el) => { refs.current.roadmap = el; }} className="docs-section">
            <h2>Roadmap</h2>
            <div className="docs-table">
              <Row label="Live">Timed shooting gallery, 5 target types, combo scoring, local best score & streak</Row>
              <Row label="Planned">New target types, harder/longer round modes</Row>
              <Row label="Token">{TICKER} fair launch — CA appears here and on the buy links the moment it&apos;s live</Row>
            </div>
          </section>

          <section id="faq" ref={(el) => { refs.current.faq = el; }} className="docs-section">
            <h2>FAQ</h2>
            <dl className="docs-faq">
              <dt>Do I need a wallet to play?</dt>
              <dd>No. Piss Target is fully playable free, with no connection of any kind.</dd>
              <dt>Does the round ever end early?</dt>
              <dd>No — there are no lives or crashes, only the 60-second clock.</dd>
              <dt>Is {TICKER} live yet?</dt>
              <dd>Not yet. The contract address on this page reads &quot;SOON&quot; until it launches.</dd>
              <dt>Can one shot hit multiple targets?</dt>
              <dd>No — a shot resolves against the first target it touches, then it&apos;s spent.</dd>
            </dl>
          </section>
        </main>
      </div>
    </>
  );
}
