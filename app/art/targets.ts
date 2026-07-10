// Shared target silhouettes — drawn with canvas primitives, reused by the
// live game (GameCanvas) and the static gallery on the marketing page.
export type TargetType = "bottle" | "can" | "duck" | "roach" | "paper";
export const TARGET_TYPES: TargetType[] = ["bottle", "can", "duck", "roach", "paper"];
export const TARGET_LABEL: Record<TargetType, string> = {
  bottle: "Bottle", can: "Can", duck: "Rubber Duck", roach: "Roach", paper: "TP Roll",
};

export function drawTargetShape(ctx: CanvasRenderingContext2D, type: TargetType, R: number, wobble: number) {
  ctx.save();
  ctx.rotate(Math.sin(wobble) * 0.08);
  if (type === "bottle") {
    ctx.fillStyle = "#2e7d4f";
    ctx.beginPath(); ctx.roundRect(-R * 0.42, -R * 0.15, R * 0.84, R * 1.15, R * 0.22); ctx.fill();
    ctx.fillRect(-R * 0.16, -R * 0.85, R * 0.32, R * 0.75);
    ctx.fillStyle = "#1c5236"; ctx.fillRect(-R * 0.18, -R * 1.0, R * 0.36, R * 0.2);
    ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.fillRect(-R * 0.3, -R * 0.05, R * 0.14, R * 0.9);
  } else if (type === "can") {
    ctx.fillStyle = "#c7d0d6";
    ctx.beginPath(); ctx.roundRect(-R * 0.46, -R * 0.75, R * 0.92, R * 1.5, R * 0.12); ctx.fill();
    ctx.fillStyle = "#e0384f"; ctx.fillRect(-R * 0.46, -R * 0.15, R * 0.92, R * 0.4);
    ctx.fillStyle = "#8f9aa1"; ctx.beginPath(); ctx.ellipse(0, -R * 0.75, R * 0.46, R * 0.1, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.fillRect(-R * 0.3, -R * 0.7, R * 0.1, R * 1.4);
  } else if (type === "duck") {
    ctx.fillStyle = "#ffd400";
    ctx.beginPath(); ctx.ellipse(0, R * 0.12, R * 0.55, R * 0.42, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(R * 0.28, -R * 0.28, R * 0.32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#ff8a1e";
    ctx.beginPath(); ctx.moveTo(R * 0.55, -R * 0.28); ctx.lineTo(R * 0.86, -R * 0.2); ctx.lineTo(R * 0.55, -R * 0.12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#241f14"; ctx.beginPath(); ctx.arc(R * 0.36, -R * 0.36, R * 0.06, 0, Math.PI * 2); ctx.fill();
  } else if (type === "roach") {
    ctx.fillStyle = "#4a3324";
    ctx.beginPath(); ctx.ellipse(0, 0, R * 0.6, R * 0.34, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-R * 0.55, 0, R * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#2c1e15"; ctx.lineWidth = Math.max(1, R * 0.05); ctx.lineCap = "round";
    for (const s of [-1, 1]) {
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(-R * 0.1 + i * R * 0.24, s * R * 0.28);
        ctx.lineTo(-R * 0.1 + i * R * 0.24 + s * R * 0.22, s * R * 0.58); ctx.stroke();
      }
    }
    ctx.beginPath(); ctx.moveTo(-R * 0.72, -R * 0.06); ctx.lineTo(-R * 1.0, -R * 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-R * 0.72, R * 0.06); ctx.lineTo(-R * 1.0, R * 0.3); ctx.stroke();
  } else {
    ctx.fillStyle = "#f5f2e8";
    ctx.beginPath(); ctx.roundRect(-R * 0.5, -R * 0.62, R, R * 1.24, R * 0.14); ctx.fill();
    ctx.fillStyle = "#d8d2bf"; ctx.beginPath(); ctx.ellipse(0, -R * 0.62, R * 0.5, R * 0.14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9a9480"; ctx.beginPath(); ctx.ellipse(0, -R * 0.62, R * 0.2, R * 0.06, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.08)"; ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-R * 0.5, -R * 0.3 + i * R * 0.32); ctx.lineTo(R * 0.5, -R * 0.3 + i * R * 0.32); ctx.stroke(); }
  }
  ctx.restore();
}
