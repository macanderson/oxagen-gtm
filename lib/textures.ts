/**
 * Deterministic background textures for marketing banners and video frames.
 *
 * Every texture paints onto a plain HTML canvas at any size (300x250 up to
 * 6144x3456) with no raster assets and no `Math.random` — the one texture
 * that needs pseudo-randomness (`node-lattice`) uses the seeded PRNG below
 * so the same size always renders the same pixels.
 *
 * Palette source: house-tokens.css (oxagenai/oxagen-brand). Gold appears in
 * exactly one texture (`corner-glow`) per the branding rule that gold is
 * identity, never a surface fill.
 */

export interface TextureCtx {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  /** w / 1000 — scale line weights and spacing so textures hold up at any size. */
  scale: number;
  theme: "dark" | "light";
  colors: {
    bg: string;
    bgDeep: string;
    panel: string;
    line: string;
    rule: string;
    text: string;
    muted: string;
    gold: string;
    goldDeep: string;
  };
}

export interface Texture {
  id: string;
  title: string;
  description: string;
  paint: (t: TextureCtx) => void;
}

/** Resolves the house palette for a theme. Use to build a TextureCtx. */
export function resolveTextureColors(theme: "dark" | "light"): TextureCtx["colors"] {
  return theme === "dark"
    ? {
        bg: "#10100F",
        bgDeep: "#0A0A09",
        panel: "#181715",
        line: "#292722",
        rule: "#34322D",
        text: "#F2EEE5",
        muted: "#9B958A",
        gold: "#D6962C",
        goldDeep: "#8B5E1A",
      }
    : {
        bg: "#F2EEE5",
        bgDeep: "#C9BFAE",
        panel: "#F8F5EE",
        line: "#D8CDBD",
        rule: "#C9BFAE",
        text: "#10100F",
        muted: "#6B665C",
        gold: "#D6962C",
        goldDeep: "#8B5E1A",
      };
}

/** Convenience for creating a TextureCtx from a canvas 2D context. */
export function createTextureCtx(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  theme: "dark" | "light",
): TextureCtx {
  return { ctx, w, h, scale: w / 1000, theme, colors: resolveTextureColors(theme) };
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function rgba(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Small seeded PRNG (mulberry32) — deterministic, no Math.random. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Canvas centres a stroke on its coordinate, so a 1px line drawn on an integer
 * coordinate splits across two pixel columns and each gets half the coverage.
 * At the low alphas these textures run on (0.06–0.12) that halved coverage
 * composites back to the exact background value and the line vanishes:
 * `hairline-grid` rendered pixel-identical to `flat`. Snapping an odd-width
 * stroke onto the half-pixel grid lands it inside one whole pixel, which is
 * also what keeps a hairline crisp rather than blurred at export sizes.
 */
function crispWidth(lineWidth: number): number {
  return Math.max(1, Math.round(lineWidth));
}

/** Aligns a stroke coordinate to the pixel grid for the given line width. */
function snap(v: number, lineWidth: number): number {
  const lw = crispWidth(lineWidth);
  return lw % 2 === 1 ? Math.round(v) + 0.5 : Math.round(v);
}

function paintFlat(t: TextureCtx): void {
  const { ctx, w, h, colors } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function paintHairlineGrid(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const size = 40 * scale;
  const alpha = theme === "dark" ? 0.08 : 0.06;
  const lw = crispWidth(scale * 0.6);
  ctx.strokeStyle = rgba(colors.line, alpha);
  ctx.lineWidth = lw;
  ctx.beginPath();
  for (let x = 0; x <= w; x += size) {
    ctx.moveTo(snap(x, lw), 0);
    ctx.lineTo(snap(x, lw), h);
  }
  for (let y = 0; y <= h; y += size) {
    ctx.moveTo(0, snap(y, lw));
    ctx.lineTo(w, snap(y, lw));
  }
  ctx.stroke();
  ctx.restore();
}

function paintDotField(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const spacing = 32 * scale;
  const r = Math.max(0.6, 1 * scale);
  const alpha = theme === "dark" ? 0.12 : 0.08;
  ctx.fillStyle = rgba(colors.line, alpha);
  for (let y = spacing / 2; y < h; y += spacing) {
    for (let x = spacing / 2; x < w; x += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function paintBlueprint(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const size = 32 * scale;
  const minorAlpha = theme === "dark" ? 0.08 : 0.06;
  const majorAlpha = theme === "dark" ? 0.22 : 0.18;

  const minorW = crispWidth(scale * 0.6);
  ctx.lineWidth = minorW;
  ctx.strokeStyle = rgba(colors.line, minorAlpha);
  ctx.beginPath();
  for (let x = 0, col = 0; x <= w; x += size, col++) {
    if (col % 5 === 0) continue;
    ctx.moveTo(snap(x, minorW), 0);
    ctx.lineTo(snap(x, minorW), h);
  }
  for (let y = 0, row = 0; y <= h; y += size, row++) {
    if (row % 5 === 0) continue;
    ctx.moveTo(0, snap(y, minorW));
    ctx.lineTo(w, snap(y, minorW));
  }
  ctx.stroke();

  const majorW = crispWidth(scale * 0.9);
  ctx.lineWidth = majorW;
  ctx.strokeStyle = rgba(colors.rule, majorAlpha);
  ctx.beginPath();
  for (let x = 0, col = 0; x <= w; x += size, col++) {
    if (col % 5 !== 0) continue;
    ctx.moveTo(snap(x, majorW), 0);
    ctx.lineTo(snap(x, majorW), h);
  }
  for (let y = 0, row = 0; y <= h; y += size, row++) {
    if (row % 5 !== 0) continue;
    ctx.moveTo(0, snap(y, majorW));
    ctx.lineTo(w, snap(y, majorW));
  }
  ctx.stroke();
  ctx.restore();
}

function paintTopo(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const cx = w * 0.5;
  const cy = h * 0.45;
  const contours = 8;
  const step = 46 * scale;
  const alpha = theme === "dark" ? 0.1 : 0.07;
  ctx.strokeStyle = rgba(colors.line, alpha);
  ctx.lineWidth = Math.max(1, scale);
  for (let i = 1; i <= contours; i++) {
    const baseR = i * step;
    const points = 96;
    ctx.beginPath();
    for (let p = 0; p <= points; p++) {
      const a = (p / points) * Math.PI * 2;
      const wobble = Math.sin(a * 3 + i * 0.7) * step * 0.18 + Math.sin(a * 5 - i * 1.3) * step * 0.08;
      const r = baseR + wobble;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r * 0.62;
      if (p === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function paintLedgerRows(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const rowH = 28 * scale;
  const liftedIndex = Math.floor(h / rowH / 2);
  const liftAlpha = theme === "dark" ? 0.1 : 0.07;
  ctx.fillStyle = rgba(colors.panel, liftAlpha);
  ctx.fillRect(0, liftedIndex * rowH, w, rowH);

  const ruleAlpha = theme === "dark" ? 0.16 : 0.12;
  const ruleW = crispWidth(scale * 0.6);
  ctx.strokeStyle = rgba(colors.rule, ruleAlpha);
  ctx.lineWidth = ruleW;
  ctx.beginPath();
  for (let y = 0; y <= h; y += rowH) {
    ctx.moveTo(0, snap(y, ruleW));
    ctx.lineTo(w, snap(y, ruleW));
  }
  ctx.stroke();
  ctx.restore();
}

function paintNodeLattice(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);

  const rand = mulberry32(0x0ffee5);
  const cell = 130 * scale;
  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;
  const nodes: Array<{ x: number; y: number }> = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const jx = (rand() - 0.5) * cell * 0.6;
      const jy = (rand() - 0.5) * cell * 0.6;
      nodes.push({ x: c * cell + jx, y: r * cell + jy });
    }
  }

  const edgeAlpha = theme === "dark" ? 0.12 : 0.08;
  const nodeAlpha = theme === "dark" ? 0.13 : 0.09;
  const maxDist = cell * 0.9;

  ctx.strokeStyle = rgba(colors.line, edgeAlpha);
  ctx.lineWidth = Math.max(1, scale);
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  ctx.fillStyle = rgba(colors.muted, nodeAlpha);
  const nodeR = Math.max(1.2, 1.6 * scale);
  for (const n of nodes) {
    ctx.beginPath();
    ctx.arc(n.x, n.y, nodeR, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintVignette(t: TextureCtx): void {
  const { ctx, w, h, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h / 2;
  const radius = Math.max(w, h) * 0.75;
  const edgeAlpha = theme === "dark" ? 0.13 : 0.09;
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
  grad.addColorStop(0, rgba(colors.bgDeep, 0));
  grad.addColorStop(1, rgba(colors.bgDeep, edgeAlpha));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function paintCornerGlow(t: TextureCtx): void {
  const { ctx, w, h, colors } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const cx = w * 0.86;
  const cy = h * 0.14;
  const radius = Math.max(w, h) * 0.55;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  grad.addColorStop(0, rgba(colors.goldDeep, 0.09));
  grad.addColorStop(1, rgba(colors.goldDeep, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function paintDiagonalWeave(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const spacing = 18 * scale;
  const alpha = theme === "dark" ? 0.09 : 0.06;
  ctx.strokeStyle = rgba(colors.line, alpha);
  ctx.lineWidth = Math.max(1, scale * 0.6);
  const diag = w + h;
  ctx.beginPath();
  for (let d = -h; d <= diag; d += spacing) {
    ctx.moveTo(d, 0);
    ctx.lineTo(d + h, h);
  }
  ctx.stroke();
  ctx.restore();
}

function paintPanelSplit(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const bandW = w * 0.28;
  const bandAlpha = theme === "dark" ? 0.1 : 0.07;
  ctx.fillStyle = rgba(colors.panel, bandAlpha);
  ctx.fillRect(w - bandW, 0, bandW, h);

  const seamW = crispWidth(scale);
  ctx.strokeStyle = rgba(colors.rule, theme === "dark" ? 0.14 : 0.1);
  ctx.lineWidth = seamW;
  ctx.beginPath();
  ctx.moveTo(snap(w - bandW, seamW), 0);
  ctx.lineTo(snap(w - bandW, seamW), h);
  ctx.stroke();
  ctx.restore();
}

function paintOrbitRings(t: TextureCtx): void {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const cx = w * 1.08;
  const cy = h * -0.12;
  const alpha = theme === "dark" ? 0.11 : 0.08;
  ctx.strokeStyle = rgba(colors.line, alpha);
  const radii = [0.4, 0.62, 0.86].map((f) => Math.max(w, h) * f);
  for (const r of radii) {
    ctx.lineWidth = Math.max(1, scale * 0.8);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export const TEXTURES: Texture[] = [
  {
    id: "flat",
    title: "Flat",
    description: "The plain canvas colour, nothing else.",
    paint: paintFlat,
  },
  {
    id: "hairline-grid",
    title: "Hairline grid",
    description: "A fine square grid at low contrast.",
    paint: paintHairlineGrid,
  },
  {
    id: "dot-field",
    title: "Dot field",
    description: "A quiet lattice of small dots.",
    paint: paintDotField,
  },
  {
    id: "blueprint",
    title: "Blueprint",
    description: "A technical-drawing grid with a heavier rule every fifth line.",
    paint: paintBlueprint,
  },
  {
    id: "topo",
    title: "Topo",
    description: "Soft concentric contour lines, like a topographic map.",
    paint: paintTopo,
  },
  {
    id: "ledger-rows",
    title: "Ledger rows",
    description: "Evenly spaced horizontal rules with one lifted row band.",
    paint: paintLedgerRows,
  },
  {
    id: "node-lattice",
    title: "Node lattice",
    description: "Sparse nodes joined by short edges, seeded and deterministic.",
    paint: paintNodeLattice,
  },
  {
    id: "vignette",
    title: "Vignette",
    description: "Base colour with a soft radial darkening at the edges.",
    paint: paintVignette,
  },
  {
    id: "corner-glow",
    title: "Corner glow",
    description: "A single soft gold-deep glow in one corner, held under 0.10 alpha.",
    paint: paintCornerGlow,
  },
  {
    id: "diagonal-weave",
    title: "Diagonal weave",
    description: "Fine 45-degree hatching.",
    paint: paintDiagonalWeave,
  },
  {
    id: "panel-split",
    title: "Panel split",
    description: "A base field with a panel-coloured band along one edge.",
    paint: paintPanelSplit,
  },
  {
    id: "orbit-rings",
    title: "Orbit rings",
    description: "Large thin concentric circles bleeding off-canvas.",
    paint: paintOrbitRings,
  },
];
