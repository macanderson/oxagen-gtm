// Standalone preview script for surfaces-preview.html.
//
// This is a plain-JS copy of lib/textures.ts and lib/devices.ts, compiled by
// hand (stripped of type annotations only — the logic is byte-for-byte the
// same) so the preview page can run straight from a file:// URL with no
// build step. If you change the source .ts files, bring this copy in line.

// ---------------------------------------------------------------------------
// textures

function resolveTextureColors(theme) {
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

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function rgba(hex, alpha) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintFlat(t) {
  const { ctx, w, h, colors } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

function paintHairlineGrid(t) {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const size = 40 * scale;
  const alpha = theme === "dark" ? 0.08 : 0.06;
  ctx.strokeStyle = rgba(colors.line, alpha);
  ctx.lineWidth = Math.max(1, scale * 0.6);
  ctx.beginPath();
  for (let x = 0; x <= w; x += size) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += size) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

function paintDotField(t) {
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

function paintBlueprint(t) {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const size = 32 * scale;
  const minorAlpha = theme === "dark" ? 0.08 : 0.06;
  const majorAlpha = theme === "dark" ? 0.22 : 0.18;

  ctx.lineWidth = Math.max(1, scale * 0.6);
  ctx.strokeStyle = rgba(colors.line, minorAlpha);
  ctx.beginPath();
  for (let x = 0, col = 0; x <= w; x += size, col++) {
    if (col % 5 === 0) continue;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0, row = 0; y <= h; y += size, row++) {
    if (row % 5 === 0) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  ctx.lineWidth = Math.max(1, scale * 0.9);
  ctx.strokeStyle = rgba(colors.rule, majorAlpha);
  ctx.beginPath();
  for (let x = 0, col = 0; x <= w; x += size, col++) {
    if (col % 5 !== 0) continue;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0, row = 0; y <= h; y += size, row++) {
    if (row % 5 !== 0) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

function paintTopo(t) {
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

function paintLedgerRows(t) {
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
  ctx.strokeStyle = rgba(colors.rule, ruleAlpha);
  ctx.lineWidth = Math.max(1, scale * 0.6);
  ctx.beginPath();
  for (let y = 0; y <= h; y += rowH) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
  ctx.restore();
}

function paintNodeLattice(t) {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);

  const rand = mulberry32(0x0ffee5);
  const cell = 130 * scale;
  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;
  const nodes = [];
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

function paintVignette(t) {
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

function paintCornerGlow(t) {
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

function paintDiagonalWeave(t) {
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

function paintPanelSplit(t) {
  const { ctx, w, h, scale, colors, theme } = t;
  ctx.save();
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, w, h);
  const bandW = w * 0.28;
  const bandAlpha = theme === "dark" ? 0.1 : 0.07;
  ctx.fillStyle = rgba(colors.panel, bandAlpha);
  ctx.fillRect(w - bandW, 0, bandW, h);

  ctx.strokeStyle = rgba(colors.rule, theme === "dark" ? 0.14 : 0.1);
  ctx.lineWidth = Math.max(1, scale);
  ctx.beginPath();
  ctx.moveTo(w - bandW, 0);
  ctx.lineTo(w - bandW, h);
  ctx.stroke();
  ctx.restore();
}

function paintOrbitRings(t) {
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

export const TEXTURES = [
  { id: "flat", title: "Flat", paint: paintFlat },
  { id: "hairline-grid", title: "Hairline grid", paint: paintHairlineGrid },
  { id: "dot-field", title: "Dot field", paint: paintDotField },
  { id: "blueprint", title: "Blueprint", paint: paintBlueprint },
  { id: "topo", title: "Topo", paint: paintTopo },
  { id: "ledger-rows", title: "Ledger rows", paint: paintLedgerRows },
  { id: "node-lattice", title: "Node lattice", paint: paintNodeLattice },
  { id: "vignette", title: "Vignette", paint: paintVignette },
  { id: "corner-glow", title: "Corner glow", paint: paintCornerGlow },
  { id: "diagonal-weave", title: "Diagonal weave", paint: paintDiagonalWeave },
  { id: "panel-split", title: "Panel split", paint: paintPanelSplit },
  { id: "orbit-rings", title: "Orbit rings", paint: paintOrbitRings },
];

export function renderTexture(canvas, texture, theme) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  texture.paint({ ctx, w, h, scale: w / 1000, theme, colors: resolveTextureColors(theme) });
}

// ---------------------------------------------------------------------------
// devices

function roundedRectPath(x, y, w, h, r) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M${x + rr},${y}`,
    `H${x + w - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w},${y + rr}`,
    `V${y + h - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}`,
    `H${x + rr}`,
    `A${rr},${rr} 0 0 1 ${x},${y + h - rr}`,
    `V${y + rr}`,
    `A${rr},${rr} 0 0 1 ${x + rr},${y}`,
    "Z",
  ].join(" ");
}

function bezelRing(outer, screen) {
  const outerPath = roundedRectPath(outer.x, outer.y, outer.w, outer.h, outer.r);
  const innerPath = roundedRectPath(screen.x, screen.y, screen.w, screen.h, screen.radius);
  return `<path fill-rule="evenodd" fill="currentColor" d="${outerPath} ${innerPath}"/>`;
}

const laptop16Lid = { x: 40, y: 24, w: 920, h: 608, r: 26 };
const laptop16Screen = { x: 64, y: 48, w: 872, h: 545, radius: 6 };
const laptop13Lid = { x: 40, y: 24, w: 780, h: 515, r: 22 };
const laptop13Screen = { x: 60, y: 44, w: 740, h: 462.5, radius: 5 };
const desktop27Lid = { x: 40, y: 24, w: 920, h: 552, r: 18 };
const desktop27Screen = { x: 68, y: 52, w: 864, h: 486, radius: 4 };
const tabletLandscapeLid = { x: 73.5, y: 60, w: 753, h: 580, r: 34 };
const tabletLandscapeScreen = { x: 103.5, y: 90, w: 693, h: 520, radius: 8 };
const tabletPortraitLid = { x: 60, y: 73.5, w: 580, h: 753, r: 34 };
const tabletPortraitScreen = { x: 90, y: 103.5, w: 520, h: 693, radius: 8 };
const phoneLid = { x: 16, y: 47.5, w: 368, h: 765, r: 48 };
const phoneScreen = { x: 30, y: 61.5, w: 340, h: 737, radius: 38 };
const browserScreen = { x: 0, y: 57, w: 1000, h: 625, radius: 0 };
const browserAddressBar = { x: 110, y: 14, w: 780, h: 28 };

export const DEVICE_FRAMES = [
  {
    id: "laptop-16",
    title: "MacBook Pro",
    viewBox: "0 0 1000 660",
    screen: laptop16Screen,
    aspect: "16:10",
    svg: `
${bezelRing(laptop16Lid, laptop16Screen)}
<circle cx="500" cy="36" r="3" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.5"/>
<rect x="40" y="632" width="920" height="6" fill="#000000" fill-opacity="0.22"/>
<path d="M40,638 L960,638 L920,660 L80,660 Z" fill="#000000" fill-opacity="0.14"/>
`.trim(),
  },
  {
    id: "laptop-13",
    title: "MacBook Air",
    viewBox: "0 0 860 600",
    screen: laptop13Screen,
    aspect: "16:10",
    svg: `
${bezelRing(laptop13Lid, laptop13Screen)}
<circle cx="430" cy="34" r="2.6" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.3"/>
<rect x="40" y="539" width="780" height="6" fill="#000000" fill-opacity="0.22"/>
<path d="M40,545 L820,545 L790,600 L70,600 Z" fill="#000000" fill-opacity="0.14"/>
`.trim(),
  },
  {
    id: "desktop-27",
    title: "27-inch display",
    viewBox: "0 0 1000 720",
    screen: desktop27Screen,
    aspect: "16:9",
    svg: `
${bezelRing(desktop27Lid, desktop27Screen)}
<circle cx="500" cy="38" r="2.6" fill="none" stroke="#000000" stroke-opacity="0.3" stroke-width="1.3"/>
<rect x="460" y="576" width="80" height="90" fill="currentColor"/>
<rect x="340" y="666" width="320" height="26" rx="13" fill="currentColor"/>
`.trim(),
  },
  {
    id: "tablet-landscape",
    title: "Tablet, landscape",
    viewBox: "0 0 900 700",
    screen: tabletLandscapeScreen,
    aspect: "4:3",
    svg: `
${bezelRing(tabletLandscapeLid, tabletLandscapeScreen)}
<circle cx="811.5" cy="350" r="4" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.5"/>
`.trim(),
  },
  {
    id: "tablet-portrait",
    title: "Tablet, portrait",
    viewBox: "0 0 700 900",
    screen: tabletPortraitScreen,
    aspect: "3:4",
    svg: `
${bezelRing(tabletPortraitLid, tabletPortraitScreen)}
<circle cx="350" cy="88.5" r="4" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.5"/>
`.trim(),
  },
  {
    id: "phone",
    title: "Phone",
    viewBox: "0 0 400 860",
    screen: phoneScreen,
    aspect: "19.5:9",
    svg: `
${bezelRing(phoneLid, phoneScreen)}
<rect x="170" y="52" width="60" height="8" rx="4" fill="#000000" fill-opacity="0.28"/>
`.trim(),
  },
  {
    id: "browser",
    title: "Browser window",
    viewBox: "0 0 1000 682",
    screen: browserScreen,
    aspect: "16:10",
    addressBar: browserAddressBar,
    svg: `
<rect x="0" y="0" width="1000" height="56" fill="currentColor"/>
<circle cx="28" cy="28" r="7" fill="currentColor" fill-opacity="0.55"/>
<circle cx="52" cy="28" r="7" fill="currentColor" fill-opacity="0.55"/>
<circle cx="76" cy="28" r="7" fill="currentColor" fill-opacity="0.55"/>
<rect x="${browserAddressBar.x}" y="${browserAddressBar.y}" width="${browserAddressBar.w}" height="${browserAddressBar.h}" rx="14" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25" stroke-width="1"/>
<line x1="0" y1="56" x2="1000" y2="56" stroke="currentColor" stroke-opacity="0.3" stroke-width="1"/>
`.trim(),
  },
];
