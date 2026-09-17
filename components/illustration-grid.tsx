"use client";

import { useMemo, useState } from "react";
import { ILLUSTRATIONS } from "@/lib/illustrations";

export function IllustrationGrid() {
  const [q, setQ] = useState("");
  const [size, setSize] = useState(320);
  const [copied, setCopied] = useState<string | null>(null);

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return ILLUSTRATIONS;
    return ILLUSTRATIONS.filter((i) => [i.id, i.title, i.caption, ...i.tags].join(" ").toLowerCase().includes(n));
  }, [q]);

  function fullSvg(id: string) {
    const ill = ILLUSTRATIONS.find((i) => i.id === id)!;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ill.viewBox}" fill="none">${ill.svg}</svg>`;
  }

  function downloadSvg(id: string) {
    const blob = new Blob([fullSvg(id)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `oxagen-${id}.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  async function downloadPng(id: string, width = 1600) {
    const ill = ILLUSTRATIONS.find((i) => i.id === id)!;
    const [, , vw, vh] = ill.viewBox.split(/\s+/).map(Number);
    const height = Math.round((width * vh) / vw);
    const color = getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#F2EEE5";
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#10100F";
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ill.viewBox}" width="${width}" height="${height}">${ill.svg.replace(/currentColor/g, color)}</svg>`;
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    canvas.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oxagen-${id}-${width}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    });
  }

  return (
    <>
      <div className="card" style={{ margin: "20px 0 22px" }}>
        <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 12 }}>
          <div>
            <label>Search</label>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="access, meter, fleet…" />
          </div>
          <div>
            <label>Preview size {size}px</label>
            <input type="range" min={140} max={520} step={20} value={size} onChange={(e) => setSize(Number(e.target.value))} />
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: `repeat(auto-fill,minmax(${size}px,1fr))` }}>
        {shown.map((i) => (
          <figure key={i.id} className="card" style={{ margin: 0 }}>
            <div
              style={{ color: "var(--text)", background: "var(--bg-deep)", borderRadius: 8, padding: 10 }}
              dangerouslySetInnerHTML={{
                __html: `<svg viewBox="${i.viewBox}" fill="none" style="width:100%;height:auto;display:block">${i.svg}</svg>`,
              }}
            />
            <figcaption style={{ marginTop: 12 }}>
              <h3 style={{ fontSize: "var(--step-0)", marginBottom: 4 }}>{i.title}</h3>
              <p className="small" style={{ marginBottom: 8 }}>
                {i.caption}
              </p>
              <div className="row" style={{ gap: 6, marginBottom: 8 }}>
                {i.tags.map((t) => (
                  <span key={t} className="tag">
                    {t}
                  </span>
                ))}
              </div>
              <div className="row" style={{ gap: 6 }}>
                <button className="btn btn-sm" onClick={() => downloadSvg(i.id)}>
                  SVG
                </button>
                <button className="btn btn-sm" onClick={() => downloadPng(i.id, 1600)}>
                  PNG 1600
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(fullSvg(i.id)).then(
                      () => {
                        setCopied(i.id);
                        setTimeout(() => setCopied(null), 1300);
                      },
                      () => undefined,
                    );
                  }}
                >
                  {copied === i.id ? "Copied" : "Copy markup"}
                </button>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </>
  );
}
