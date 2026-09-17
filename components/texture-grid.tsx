"use client";

import { useEffect, useRef, useState } from "react";
import { TEXTURES } from "@/lib/textures";
import { COLORS, ensureFonts, type Theme } from "@/lib/compose";

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
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
        </div>
      </div>

      <div className="grid grid-3">
        {TEXTURES.map((t) => (
          <figure key={t.id} className="card" style={{ margin: 0 }}>
            <Preview id={t.id} theme={theme} />
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

function Preview({ id, theme }: { id: string; theme: Theme }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const w = 640;
    const h = 360;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const tex = TEXTURES.find((t) => t.id === id);
    if (!ctx || !tex) return;
    const c = COLORS[theme];
    // the preview magnifies the pattern (scale above 1) so a texture built to stay
    // quiet at 4K is still legible in a 640px card
    tex.paint({
      ctx,
      w,
      h,
      scale: 1.35,
      theme,
      colors: { bg: c.bg, bgDeep: c.bgDeep, panel: c.panel, line: c.line, rule: c.rule, text: c.text, muted: c.muted, gold: c.gold, goldDeep: c.goldDeep },
    });
    // a sample line, because the only question that matters is whether type survives on it
    ensureFonts().then(() => {
      ctx.fillStyle = c.text;
      ctx.font = '700 40px "Space Grotesk", Helvetica, Arial, sans-serif';
      ctx.fillText("Mission Control", 34, h / 2);
      ctx.fillStyle = c.muted;
      ctx.font = '400 20px "Space Grotesk", Helvetica, Arial, sans-serif';
      ctx.fillText("for your autonomous agents.", 34, h / 2 + 32);
    });
  }, [id, theme]);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}
