"use client";

import { useEffect, useRef, useState } from "react";
import { TEXTURES } from "@/lib/textures";
import { COLORS, ensureFonts, type Theme } from "@/lib/compose";

/** How much the card magnifies a pattern relative to an export of the same pixel count. */
const PREVIEW_MAGNIFY = 3;

const SIZES = [
  { label: "Desktop 4K", w: 3840, h: 2160 },
  { label: "Desktop 6K", w: 6144, h: 3456 },
  { label: "Phone", w: 1290, h: 2796 },
  { label: "Slide", w: 1920, h: 1080 },
  { label: "Square", w: 2048, h: 2048 },
  { label: "Open graph", w: 1200, h: 630 },
];

export function TextureGrid() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [size, setSize] = useState(SIZES[0]);
  // These textures are held at 0.06-0.12 alpha on purpose, which is right for a
  // background and wrong for a picker: shown honestly, most of the tiles below
  // are indistinguishable from `flat`. The boost amplifies each preview's
  // departure from the base colour so you can tell them apart. It is a property
  // of the card only — the PNG a download produces is always unboosted.
  const [boost, setBoost] = useState(true);

  function download(id: string) {
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    const tex = TEXTURES.find((t) => t.id === id);
    if (!ctx || !tex) return;
    const c = COLORS[theme];
    tex.paint({
      ctx,
      w: size.w,
      h: size.h,
      scale: size.w / 1000,
      theme,
      colors: { bg: c.bg, bgDeep: c.bgDeep, panel: c.panel, line: c.line, rule: c.rule, text: c.text, muted: c.muted, gold: c.gold, goldDeep: c.goldDeep },
    });
    canvas.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oxagen-texture-${id}-${theme}-${size.w}x${size.h}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2500);
    });
  }

  return (
    <>
      <div className="card" style={{ margin: "20px 0 22px" }}>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
          <div>
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
              <option value="dark">Ink</option>
              <option value="light">Paper</option>
            </select>
          </div>
          <div>
            <label>Download size</label>
            <select
              value={size.label}
              onChange={(e) => setSize(SIZES.find((s) => s.label === e.target.value) || SIZES[0])}
            >
              {SIZES.map((s) => (
                <option key={s.label} value={s.label}>
                  {s.label} · {s.w}x{s.h}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="tex-boost">Preview</label>
            <label className="row small" style={{ gap: 8, alignItems: "center", paddingBottom: 8 }}>
              <input
                id="tex-boost"
                type="checkbox"
                checked={boost}
                onChange={(e) => setBoost(e.target.checked)}
                style={{ width: "auto", margin: 0 }}
              />
              Boost contrast
            </label>
          </div>
        </div>
        <p className="small" style={{ margin: "10px 0 0" }}>
          {boost
            ? "Previews are contrast-boosted so the patterns are tellable apart. Downloads are unboosted."
            : "Previews show true contrast — most textures are meant to be this quiet."}
        </p>
      </div>

      <div className="grid grid-3">
        {TEXTURES.map((t) => (
          <figure key={t.id} className="card" style={{ margin: 0 }}>
            <Preview id={t.id} theme={theme} boost={boost} />
            <figcaption style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: "var(--step-0)", marginBottom: 4 }}>{t.title}</h3>
              <p className="small" style={{ marginBottom: 10 }}>
                {t.description}
              </p>
              <div className="row" style={{ gap: 6 }}>
                <span className="tag mono">{t.id}</span>
                <button className="btn btn-sm" onClick={() => download(t.id)}>
                  PNG {size.w}x{size.h}
                </button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}

/**
 * Pushes every pixel further from the base colour so a texture held at 0.06-0.12
 * alpha is visible in a small card. Preview only — `download()` never calls it,
 * so the exported PNG keeps the contrast the texture was designed with.
 */
function amplify(ctx: CanvasRenderingContext2D, w: number, h: number, baseHex: string): void {
  const clean = baseHex.replace("#", "");
  const base = [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
  const K = 6;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      const v = base[ch] + (d[i + ch] - base[ch]) * K;
      d[i + ch] = v < 0 ? 0 : v > 255 ? 255 : v;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function Preview({ id, theme, boost }: { id: string; theme: Theme; boost: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  // These textures carry their pattern in single-pixel strokes at alpha 0.06-0.12.
  // A fixed 640x360 buffer scaled down into a ~224px card averaged every one of
  // them back into the background, so each tile read as a flat rectangle and the
  // gallery could not tell one texture from another. Painting into a buffer that
  // matches the element's real device pixels keeps a hairline one pixel wide.
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const tex = TEXTURES.find((t) => t.id === id);
    if (!tex) return;

    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      const cssW = Math.max(1, Math.round(rect.width));
      const cssH = Math.max(1, Math.round(cssW * (9 / 16)));
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const w = Math.round(cssW * dpr);
      const h = Math.round(cssH * dpr);
      canvas.style.height = `${cssH}px`;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const c = COLORS[theme];
      // The preview magnifies the pattern relative to an export of the same
      // pixel count, so a texture tuned to stay quiet at 4K still reads in a card.
      const scale = (w / 1000) * PREVIEW_MAGNIFY;
      tex.paint({
        ctx,
        w,
        h,
        scale,
        theme,
        colors: { bg: c.bg, bgDeep: c.bgDeep, panel: c.panel, line: c.line, rule: c.rule, text: c.text, muted: c.muted, gold: c.gold, goldDeep: c.goldDeep },
      });
      if (boost) amplify(ctx, w, h, c.bg);
      // a sample line, because the only question that matters is whether type survives on it
      ensureFonts().then(() => {
        const pad = 22 * dpr;
        ctx.fillStyle = c.text;
        ctx.font = `700 ${Math.round(17 * dpr)}px "Space Grotesk", Helvetica, Arial, sans-serif`;
        ctx.fillText("Mission Control", pad, h / 2);
        ctx.fillStyle = c.muted;
        ctx.font = `400 ${Math.round(10 * dpr)}px "Space Grotesk", Helvetica, Arial, sans-serif`;
        ctx.fillText("for your autonomous agents.", pad, h / 2 + 16 * dpr);
      });
    };

    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [id, theme, boost]);

  return <canvas ref={ref} style={{ width: "100%", display: "block", borderRadius: 8 }} />;
}
