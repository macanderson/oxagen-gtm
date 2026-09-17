// The one composition renderer. Banner studio, video studio and device shots all
// draw through this, so a change to type, spacing or the gold rule lands everywhere.
//
// Everything is drawn in target pixels. Sizes derive from `u`, the geometric mean
// of the canvas divided by 1000, so a 300x250 MPU and a 6144x3456 video frame get
// proportionate type without per-size tuning.

import { TEXTURES, type Texture } from "./textures";
import { DEVICE_FRAMES, type DeviceFrame } from "./devices";
import { ILLUSTRATIONS } from "./illustrations";

export type Theme = "dark" | "light";

export interface Colors {
  bg: string;
  bgDeep: string;
  panel: string;
  line: string;
  rule: string;
  text: string;
  body: string;
  muted: string;
  dim: string;
  gold: string;
  goldBright: string;
  goldDeep: string;
}

export const COLORS: Record<Theme, Colors> = {
  dark: {
    bg: "#10100F",
    bgDeep: "#0A0A09",
    panel: "#181715",
    line: "#292722",
    rule: "#34322D",
    text: "#F2EEE5",
    body: "#DDD8CD",
    muted: "#9B958A",
    dim: "#6E6A62",
    gold: "#D6962C",
    goldBright: "#F1C364",
    goldDeep: "#8B5E1A",
  },
  light: {
    bg: "#F2EEE5",
    bgDeep: "#EAE5D9",
    panel: "#F8F5EE",
    line: "#D8CDBD",
    rule: "#C9BFAE",
    text: "#10100F",
    body: "#2A2823",
    muted: "#6B665C",
    dim: "#8C877C",
    gold: "#D6962C",
    goldBright: "#F1C364",
    goldDeep: "#8B5E1A",
  },
};

export type LayoutId =
  | "stack"
  | "centered"
  | "illustration-right"
  | "illustration-left"
  | "illustration-above"
  | "quote"
  | "device"
  | "divider"
  | "end-card"
  | "lower-third"
  | "bare";

export interface Watermark {
  on: boolean;
  kind: "lockup" | "icon" | "text";
  text: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  opacity: number; // 0.05 - 1
  scale: number; // relative to default
  margin: number; // relative to default
}

export interface DeviceSpec {
  frameId: string;
  screenshot: string | null; // url
  url: string; // shown in the browser address field
  fill: number; // how much of the canvas the device occupies, 0.5 - 1
  offsetY: number; // -0.3 .. 0.3 of canvas height
}

export interface CompositionSpec {
  w: number;
  h: number;
  theme: Theme;
  texture: string;
  layout: LayoutId;
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  ctaStyle: "button" | "text" | "none";
  qualifier: string;
  logo: "lockup" | "icon" | "none";
  logoPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  illustration: string | null;
  align: "left" | "center";
  goldRule: boolean;
  padScale: number;
  headlineScale: number;
  maxHeadlineLines: number;
  watermark: Watermark;
  device: DeviceSpec | null;
  safeArea: "none" | "vertical-social" | "youtube";
  /** transparent background, for overlays an editor lays over footage */
  transparent?: boolean;
}

export const DEFAULT_WATERMARK: Watermark = {
  on: false,
  kind: "lockup",
  text: "oxagen.sh",
  position: "bottom-right",
  opacity: 0.55,
  scale: 1,
  margin: 1,
};

export function defaultSpec(partial: Partial<CompositionSpec> = {}): CompositionSpec {
  return {
    w: 1200,
    h: 628,
    theme: "dark",
    texture: "hairline-grid",
    layout: "stack",
    eyebrow: "The control plane for your agent workforce",
    headline: "Mission Control for your autonomous agents.",
    body: "Give each agent an identity. Set its authority, budget, tools and skills. Oxagen keeps the record of the actions it governs.",
    cta: "Explore Mission Control",
    ctaStyle: "button",
    qualifier: "For actions routed through Oxagen.",
    logo: "lockup",
    logoPosition: "top-left",
    illustration: null,
    align: "left",
    goldRule: true,
    padScale: 1,
    headlineScale: 1,
    maxHeadlineLines: 4,
    watermark: { ...DEFAULT_WATERMARK },
    device: null,
    safeArea: "none",
    ...partial,
  };
}

/* ---------------- asset loading ---------------- */

const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = imageCache.get(src);
  if (hit) return hit;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${src}`));
    img.src = src;
  });
  imageCache.set(src, p);
  return p;
}

/** An inner-SVG string becomes a themed image. currentColor is resolved here because canvas does not inherit it. */
export function svgImage(inner: string, viewBox: string, color: string, width: number): Promise<HTMLImageElement> {
  const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
  const height = Math.round((width * vh) / vw);
  const resolved = inner.replace(/currentColor/g, color);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${resolved}</svg>`;
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return loadImage(url);
}

export function logoSrc(kind: "lockup" | "icon", theme: Theme): string {
  return kind === "lockup" ? `/brand/oxagen-lockup-${theme}.svg` : `/brand/oxagen-icon-${theme}.svg`;
}

let fontsReady: Promise<void> | null = null;
export function ensureFonts(): Promise<void> {
  if (fontsReady) return fontsReady;
  fontsReady = (async () => {
    if (typeof document === "undefined" || !("fonts" in document)) return;
    await Promise.all([
      document.fonts.load('400 64px "Space Grotesk"'),
      document.fonts.load('500 64px "Space Grotesk"'),
      document.fonts.load('600 64px "Space Grotesk"'),
      document.fonts.load('700 64px "Space Grotesk"'),
    ]);
    await document.fonts.ready;
  })();
  return fontsReady;
}

/* ---------------- text helpers ---------------- */

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push("");
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const candidate = `${line} ${words[i]}`;
      if (ctx.measureText(candidate).width <= maxWidth) line = candidate;
      else {
        out.push(line);
        line = words[i];
      }
    }
    out.push(line);
  }
  return out;
}

/** Largest size at which the text wraps into at most maxLines and fits maxHeight. */
export function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  opts: { maxWidth: number; maxHeight: number; maxLines: number; weight: number; lineHeight: number; min: number; max: number },
): { size: number; lines: string[] } {
  let lo = opts.min;
  let hi = opts.max;
  let best = { size: opts.min, lines: [text] };
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    ctx.font = `${opts.weight} ${mid}px "Space Grotesk", Helvetica, Arial, sans-serif`;
    const lines = wrapText(ctx, text, opts.maxWidth);
    const height = lines.length * mid * opts.lineHeight;
    if (lines.length <= opts.maxLines && height <= opts.maxHeight) {
      best = { size: mid, lines };
      lo = mid;
    } else {
      hi = mid;
    }
  }
  ctx.font = `${opts.weight} ${best.size}px "Space Grotesk", Helvetica, Arial, sans-serif`;
  best.lines = wrapText(ctx, text, opts.maxWidth);
  return best;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function textureFor(id: string): Texture {
  return TEXTURES.find((t) => t.id === id) || TEXTURES[0];
}

export function frameFor(id: string): DeviceFrame | undefined {
  return DEVICE_FRAMES.find((f) => f.id === id);
}

/* ---------------- the renderer ---------------- */

export interface RenderResult {
  overflow: boolean; // true when copy had to be shrunk past the comfortable floor
}

export async function renderComposition(canvas: HTMLCanvasElement, spec: CompositionSpec): Promise<RenderResult> {
  await ensureFonts();
  const { w, h } = spec;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return { overflow: false };
  const c = COLORS[spec.theme];
  const u = Math.sqrt(w * h) / 1000; // the unit
  const short = Math.min(w, h);
  const pad = Math.max(short * 0.07, 16) * spec.padScale;

  ctx.clearRect(0, 0, w, h);
  if (!spec.transparent) {
    textureFor(spec.texture).paint({ ctx, w, h, scale: w / 1000, theme: spec.theme, colors: { bg: c.bg, bgDeep: c.bgDeep, panel: c.panel, line: c.line, rule: c.rule, text: c.text, muted: c.muted, gold: c.gold, goldDeep: c.goldDeep } });
  }

  let overflow = false;

  if (spec.layout === "lower-third") {
    drawLowerThird(ctx, spec, c, u, pad);
    await drawWatermark(ctx, spec, c, u, pad);
    drawSafeArea(ctx, spec, c);
    return { overflow };
  }

  // ---- device layer sits behind the copy ----
  if (spec.layout === "device" && spec.device) {
    await drawDevice(ctx, spec, c);
  }

  // ---- logo ----
  let logoBox = { x: 0, y: 0, w: 0, h: 0 };
  if (spec.logo !== "none" && spec.layout !== "bare") {
    try {
      const img = await loadImage(logoSrc(spec.logo, spec.theme));
      const targetH = spec.logo === "lockup" ? Math.max(u * 26, 14) : Math.max(u * 34, 16);
      const ratio = img.naturalWidth / img.naturalHeight || 4;
      const lw = targetH * ratio;
      const x = spec.logoPosition.endsWith("left") ? pad : w - pad - lw;
      const y = spec.logoPosition.startsWith("top") ? pad : h - pad - targetH;
      ctx.drawImage(img, x, y, lw, targetH);
      logoBox = { x, y, w: lw, h: targetH };
    } catch {
      /* a missing mark must not take the whole composition down */
    }
  }

  if (spec.layout === "bare") {
    await drawWatermark(ctx, spec, c, u, pad);
    drawSafeArea(ctx, spec, c);
    return { overflow };
  }

  // ---- content box ----
  const logoTop = spec.logo !== "none" && spec.logoPosition.startsWith("top");
  const logoBottom = spec.logo !== "none" && !spec.logoPosition.startsWith("top");
  let boxX = pad;
  let boxY = pad + (logoTop ? logoBox.h + u * 34 : 0);
  let boxW = w - pad * 2;
  let boxH = h - boxY - pad - (logoBottom ? logoBox.h + u * 26 : 0);

  // ---- illustration ----
  const ill = spec.illustration ? ILLUSTRATIONS.find((i) => i.id === spec.illustration) : undefined;
  if (ill && (spec.layout === "illustration-right" || spec.layout === "illustration-left")) {
    const illW = boxW * 0.38;
    const img = await svgImage(ill.svg, ill.viewBox, c.muted, Math.round(illW));
    const illH = (illW * img.naturalHeight) / img.naturalWidth;
    const iy = boxY + (boxH - illH) / 2;
    const ix = spec.layout === "illustration-right" ? boxX + boxW - illW : boxX;
    ctx.drawImage(img, ix, iy, illW, illH);
    if (spec.layout === "illustration-right") boxW = boxW * 0.56;
    else {
      boxX = boxX + boxW * 0.44;
      boxW = boxW * 0.56;
    }
  } else if (ill && spec.layout === "illustration-above") {
    const illH = boxH * 0.4;
    const img = await svgImage(ill.svg, ill.viewBox, c.muted, Math.round(illH * 1.33));
    const illW = (illH * img.naturalWidth) / img.naturalHeight;
    const ix = spec.align === "center" ? boxX + (boxW - illW) / 2 : boxX;
    ctx.drawImage(img, ix, boxY, illW, illH);
    boxY += illH + u * 30;
    boxH -= illH + u * 30;
  }

  const centered = spec.align === "center" || spec.layout === "centered" || spec.layout === "divider" || spec.layout === "end-card";
  const anchorX = centered ? boxX + boxW / 2 : boxX;
  ctx.textAlign = centered ? "center" : "left";
  ctx.textBaseline = "alphabetic";

  // ---- measure the block, then place it ----
  type Block = { draw: (y: number) => number; height: number };
  const blocks: Block[] = [];

  const eyebrowSize = Math.max(u * 15, 9);
  if (spec.eyebrow.trim()) {
    ctx.font = `500 ${eyebrowSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
    const letter = eyebrowSize * 0.08;
    const text = spec.eyebrow.toUpperCase();
    const width = measureTracked(ctx, text, letter);
    const gap = eyebrowSize * 1.5;
    blocks.push({
      height: eyebrowSize + gap,
      draw: (y) => {
        ctx.fillStyle = c.muted;
        ctx.font = `500 ${eyebrowSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
        drawTracked(ctx, text, centered ? anchorX - width / 2 : anchorX, y + eyebrowSize, letter);
        return y + eyebrowSize + gap;
      },
    });
  }

  const isDivider = spec.layout === "divider";
  const headlineWeight = 700;
  const headlineMax = Math.max((isDivider ? u * 108 : u * 74) * spec.headlineScale, 14);
  const headlineMin = Math.max(u * 15, 11);
  const fitted = fitText(ctx, spec.headline, {
    maxWidth: boxW,
    maxHeight: boxH * (spec.body.trim() || spec.cta.trim() ? 0.6 : 0.86),
    maxLines: spec.maxHeadlineLines,
    weight: headlineWeight,
    lineHeight: 1.08,
    min: headlineMin,
    max: headlineMax,
  });
  if (fitted.size <= headlineMin * 1.02) overflow = true;
  const hlLineHeight = fitted.size * 1.08;
  const hlGap = fitted.size * 0.42;
  blocks.push({
    height: fitted.lines.length * hlLineHeight + hlGap,
    draw: (y) => {
      ctx.fillStyle = c.text;
      ctx.font = `${headlineWeight} ${fitted.size}px "Space Grotesk", Helvetica, Arial, sans-serif`;
      let cursor = y;
      for (const line of fitted.lines) {
        cursor += fitted.size;
        ctx.fillText(line, anchorX, cursor);
        cursor += hlLineHeight - fitted.size;
      }
      return y + fitted.lines.length * hlLineHeight + hlGap;
    },
  });

  if (spec.goldRule) {
    const rw = Math.max(u * 54, 26);
    const rh = Math.max(u * 3, 2);
    const gap = rh + u * 26;
    blocks.push({
      height: gap,
      draw: (y) => {
        ctx.fillStyle = c.gold;
        ctx.fillRect(centered ? anchorX - rw / 2 : anchorX, y, rw, rh);
        return y + gap;
      },
    });
  }

  if (spec.body.trim()) {
    const bodySize = Math.min(Math.max(u * 21, 10), fitted.size * 0.52);
    ctx.font = `400 ${bodySize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
    const lines = wrapText(ctx, spec.body, boxW * (centered ? 0.86 : 0.94)).slice(0, 6);
    const lh = bodySize * 1.42;
    const gap = bodySize * 1.3;
    blocks.push({
      height: lines.length * lh + gap,
      draw: (y) => {
        ctx.fillStyle = c.body;
        ctx.font = `400 ${bodySize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
        let cursor = y;
        for (const line of lines) {
          cursor += bodySize;
          ctx.fillText(line, anchorX, cursor);
          cursor += lh - bodySize;
        }
        return y + lines.length * lh + gap;
      },
    });
  }

  if (spec.cta.trim() && spec.ctaStyle !== "none") {
    const ctaSize = Math.max(u * 19, 9);
    ctx.font = `600 ${ctaSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
    const tw = ctx.measureText(spec.cta).width;
    const padX = ctaSize * 1.15;
    const padY = ctaSize * 0.72;
    const bw = tw + padX * 2;
    const bh = ctaSize + padY * 2;
    const gap = ctaSize * 1.1;
    blocks.push({
      height: bh + gap,
      draw: (y) => {
        ctx.font = `600 ${ctaSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
        const bx = centered ? anchorX - bw / 2 : anchorX;
        if (spec.ctaStyle === "button") {
          ctx.fillStyle = c.gold;
          roundRect(ctx, bx, y, bw, bh, ctaSize * 0.6);
          ctx.fill();
          ctx.fillStyle = "#10100F";
          ctx.textAlign = "center";
          ctx.fillText(spec.cta, bx + bw / 2, y + padY + ctaSize * 0.82);
          ctx.textAlign = centered ? "center" : "left";
        } else {
          ctx.fillStyle = c.gold;
          ctx.fillText(spec.cta, anchorX, y + padY + ctaSize * 0.82);
          const uw = ctx.measureText(spec.cta).width;
          ctx.fillRect(centered ? anchorX - uw / 2 : anchorX, y + padY + ctaSize * 1.12, uw, Math.max(u * 1.6, 1));
        }
        return y + bh + gap;
      },
    });
  }

  if (spec.qualifier.trim()) {
    const qSize = Math.max(u * 14, 8);
    const gap = qSize * 0.9;
    blocks.push({
      height: qSize + gap,
      draw: (y) => {
        ctx.fillStyle = c.dim;
        ctx.font = `400 ${qSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
        ctx.fillText(spec.qualifier, anchorX, y + qSize);
        return y + qSize + gap;
      },
    });
  }

  const total = blocks.reduce((sum, b) => sum + b.height, 0);
  if (total > boxH) overflow = true;
  const startY = centered || spec.layout === "divider" ? boxY + Math.max((boxH - total) / 2, 0) : boxY + Math.max(boxH - total, 0);

  let y = startY;
  for (const block of blocks) y = block.draw(y);

  await drawWatermark(ctx, spec, c, u, pad);
  drawSafeArea(ctx, spec, c);
  return { overflow };
}

/** A name-and-role strip for the bottom of a frame. Drawn on transparent by default. */
function drawLowerThird(ctx: CanvasRenderingContext2D, spec: CompositionSpec, c: Colors, u: number, pad: number) {
  const nameSize = Math.max(u * 34 * spec.headlineScale, 12);
  const roleSize = nameSize * 0.52;
  const barW = Math.max(u * 5, 3);
  const innerPad = nameSize * 0.7;

  ctx.font = `700 ${nameSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
  const nameW = ctx.measureText(spec.headline).width;
  ctx.font = `400 ${roleSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
  const roleW = spec.body.trim() ? ctx.measureText(spec.body).width : 0;

  const panelW = Math.max(nameW, roleW) + innerPad * 2 + barW;
  const panelH = nameSize * 1.15 + (spec.body.trim() ? roleSize * 1.7 : 0) + innerPad * 1.4;
  const x = spec.align === "center" ? (spec.w - panelW) / 2 : pad;
  const y = spec.h - pad - panelH;

  ctx.save();
  ctx.fillStyle = spec.theme === "dark" ? "rgba(16,16,15,0.86)" : "rgba(248,245,238,0.9)";
  roundRect(ctx, x, y, panelW, panelH, Math.max(u * 12, 6));
  ctx.fill();
  ctx.fillStyle = c.gold;
  roundRect(ctx, x, y, barW, panelH, barW / 2);
  ctx.fill();
  ctx.textAlign = "left";
  ctx.fillStyle = c.text;
  ctx.font = `700 ${nameSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
  ctx.fillText(spec.headline, x + barW + innerPad, y + innerPad * 0.7 + nameSize);
  if (spec.body.trim()) {
    ctx.fillStyle = c.muted;
    ctx.font = `400 ${roleSize}px "Space Grotesk", Helvetica, Arial, sans-serif`;
    ctx.fillText(spec.body, x + barW + innerPad, y + innerPad * 0.7 + nameSize + roleSize * 1.5);
  }
  ctx.restore();
}

function measureTracked(ctx: CanvasRenderingContext2D, text: string, letter: number): number {
  let width = 0;
  for (const ch of text) width += ctx.measureText(ch).width + letter;
  return width - letter;
}

function drawTracked(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, letter: number) {
  const align = ctx.textAlign;
  ctx.textAlign = "left";
  let cursor = x;
  for (const ch of text) {
    ctx.fillText(ch, cursor, y);
    cursor += ctx.measureText(ch).width + letter;
  }
  ctx.textAlign = align;
}

async function drawWatermark(ctx: CanvasRenderingContext2D, spec: CompositionSpec, c: Colors, u: number, pad: number) {
  const wm = spec.watermark;
  if (!wm.on) return;
  const margin = pad * 0.75 * wm.margin;
  ctx.save();
  ctx.globalAlpha = Math.max(0.04, Math.min(1, wm.opacity));
  if (wm.kind === "text") {
    const size = Math.max(u * 17 * wm.scale, 9);
    ctx.font = `500 ${size}px "Space Grotesk", Helvetica, Arial, sans-serif`;
    ctx.fillStyle = c.muted;
    ctx.textAlign = wm.position.endsWith("left") ? "left" : "right";
    ctx.textBaseline = wm.position.startsWith("top") ? "top" : "bottom";
    const x = wm.position.endsWith("left") ? margin : spec.w - margin;
    const y = wm.position.startsWith("top") ? margin : spec.h - margin;
    ctx.fillText(wm.text, x, y);
  } else {
    try {
      const img = await loadImage(logoSrc(wm.kind === "icon" ? "icon" : "lockup", spec.theme));
      const targetH = Math.max(u * (wm.kind === "icon" ? 30 : 22) * wm.scale, 12);
      const ratio = img.naturalWidth / img.naturalHeight || 4;
      const lw = targetH * ratio;
      const x = wm.position.endsWith("left") ? margin : spec.w - margin - lw;
      const y = wm.position.startsWith("top") ? margin : spec.h - margin - targetH;
      ctx.drawImage(img, x, y, lw, targetH);
    } catch {
      /* ignore */
    }
  }
  ctx.restore();
}

function drawSafeArea(ctx: CanvasRenderingContext2D, spec: CompositionSpec, c: Colors) {
  if (spec.safeArea === "none") return;
  ctx.save();
  ctx.strokeStyle = "#FF3B6B";
  ctx.setLineDash([12, 10]);
  ctx.lineWidth = Math.max(spec.w / 500, 2);
  if (spec.safeArea === "vertical-social") {
    const top = spec.h * 0.12;
    const bottom = spec.h * 0.8;
    ctx.strokeRect(spec.w * 0.05, top, spec.w * 0.9, bottom - top);
    ctx.fillStyle = "rgba(255,59,107,0.10)";
    ctx.fillRect(0, 0, spec.w, top);
    ctx.fillRect(0, bottom, spec.w, spec.h - bottom);
  } else {
    // YouTube: the duration badge and progress bar sit bottom-right
    ctx.strokeRect(spec.w * 0.04, spec.h * 0.04, spec.w * 0.92, spec.h * 0.86);
    ctx.fillStyle = "rgba(255,59,107,0.10)";
    ctx.fillRect(spec.w * 0.72, spec.h * 0.84, spec.w * 0.28, spec.h * 0.16);
  }
  ctx.restore();
}

async function drawDevice(ctx: CanvasRenderingContext2D, spec: CompositionSpec, c: Colors) {
  const dev = spec.device;
  if (!dev) return;
  const frame = frameFor(dev.frameId);
  if (!frame) return;
  const [, , fw, fh] = frame.viewBox.split(/\s+/).map(Number);

  const fill = Math.max(0.35, Math.min(1, dev.fill));
  const avail = { w: spec.w * fill, h: spec.h * fill };
  const scale = Math.min(avail.w / fw, avail.h / fh);
  const dw = fw * scale;
  const dh = fh * scale;
  const dx = (spec.w - dw) / 2;
  const dy = (spec.h - dh) / 2 + spec.h * dev.offsetY;

  const sx = dx + frame.screen.x * scale;
  const sy = dy + frame.screen.y * scale;
  const sw = frame.screen.w * scale;
  const sh = frame.screen.h * scale;

  ctx.save();
  ctx.shadowColor = spec.theme === "dark" ? "rgba(0,0,0,0.55)" : "rgba(16,16,15,0.22)";
  ctx.shadowBlur = dh * 0.09;
  ctx.shadowOffsetY = dh * 0.03;
  ctx.fillStyle = spec.theme === "dark" ? "#000" : "#fff";
  roundRect(ctx, sx, sy, sw, sh, frame.screen.radius * scale);
  ctx.fill();
  ctx.restore();

  if (dev.screenshot) {
    try {
      const shot = await loadImage(dev.screenshot);
      ctx.save();
      roundRect(ctx, sx, sy, sw, sh, frame.screen.radius * scale);
      ctx.clip();
      // cover
      const ar = shot.naturalWidth / shot.naturalHeight;
      const boxAr = sw / sh;
      let rw = sw;
      let rh = sh;
      if (ar > boxAr) rw = sh * ar;
      else rh = sw / ar;
      ctx.drawImage(shot, sx + (sw - rw) / 2, sy, rw, rh);
      ctx.restore();
    } catch {
      /* no screenshot: the empty screen still reads as a device */
    }
  }

  const frameImg = await svgImage(frame.svg, frame.viewBox, spec.theme === "dark" ? "#2A2825" : "#CFC5B5", Math.round(dw));
  ctx.drawImage(frameImg, dx, dy, dw, dh);

  if (frame.addressBar && dev.url) {
    const ab = frame.addressBar;
    const size = ab.h * scale * 0.52;
    ctx.save();
    ctx.font = `400 ${size}px "Space Grotesk", Helvetica, Arial, sans-serif`;
    ctx.fillStyle = c.muted;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(dev.url, dx + (ab.x + ab.h * 0.45) * scale, dy + (ab.y + ab.h / 2) * scale);
    ctx.restore();
  }
}

/* ---------------- export ---------------- */

export function canvasBlob(canvas: HTMLCanvasElement, type = "image/png", quality = 0.94): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("export failed"))), type, quality);
  });
}

export async function downloadCanvas(canvas: HTMLCanvasElement, filename: string, type = "image/png") {
  const blob = await canvasBlob(canvas, type);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 46);
}
