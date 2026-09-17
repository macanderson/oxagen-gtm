"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  COLORS,
  canvasBlob,
  defaultSpec,
  downloadCanvas,
  renderComposition,
  slugify,
  type CompositionSpec,
  type LayoutId,
  type Theme,
} from "@/lib/compose";
import { TEXTURES } from "@/lib/textures";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { DEVICE_FRAMES } from "@/lib/devices";
import type { SizePreset } from "@/lib/presets";
import adlines from "@/data/adlines.json";
import screenshots from "@/data/screenshots.json";

const LAYOUTS: { id: LayoutId; label: string }[] = [
  { id: "stack", label: "Stack, bottom left" },
  { id: "centered", label: "Centered" },
  { id: "illustration-right", label: "Illustration right" },
  { id: "illustration-left", label: "Illustration left" },
  { id: "illustration-above", label: "Illustration above" },
  { id: "device", label: "Device shot" },
  { id: "divider", label: "Divider card" },
  { id: "end-card", label: "End card" },
  { id: "bare", label: "Bare (overlay only)" },
];

export interface ComposerProps {
  mode: "banner" | "video" | "device";
  sizes: SizePreset[];
  initial?: Partial<CompositionSpec>;
  storageKey: string;
  filenamePrefix: string;
  /** shown above the stage */
  children?: React.ReactNode;
}

type Shot = { file: string; title: string; route?: string; theme?: string };
const SHOTS: Shot[] = Array.isArray(screenshots) ? (screenshots as Shot[]) : [];

export function Composer({ mode, sizes, initial, storageKey, filenamePrefix, children }: ComposerProps) {
  const first = sizes[0];
  const defaultDevice = {
    frameId: DEVICE_FRAMES[0]?.id ?? "laptop-16",
    screenshot: SHOTS[0] ? `/screenshots/${SHOTS[0].file}` : null,
    url: "app.oxagen.sh",
    fill: 0.86,
    offsetY: 0,
  };
  const [spec, setSpec] = useState<CompositionSpec>(() =>
    defaultSpec({
      w: first.w,
      h: first.h,
      layout: mode === "device" ? "device" : "stack",
      device: mode === "device" ? defaultDevice : null,
      ...initial,
    }),
  );
  const [sizeId, setSizeId] = useState(first.id);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [overflow, setOverflow] = useState(false);
  const [showLines, setShowLines] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // restore the last spec: a per-viewer convenience, never required for the page to work
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setSpec((s) => ({ ...s, ...JSON.parse(raw) }));
    } catch {
      /* private window or blocked storage */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(spec));
    } catch {
      /* ignore */
    }
  }, [spec, storageKey]);

  const set = useCallback(<K extends keyof CompositionSpec>(key: K, value: CompositionSpec[K]) => {
    setSpec((s) => ({ ...s, [key]: value }));
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }, []);

  useEffect(() => {
    if (spec.layout === "device" && !spec.device) setSpec((s) => ({ ...s, device: defaultDevice }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec.layout, spec.device]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    renderComposition(canvas, spec)
      .then((r) => {
        if (!cancelled) setOverflow(r.overflow);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [spec]);

  function pickSize(id: string) {
    const preset = sizes.find((s) => s.id === id);
    if (!preset) return;
    setSizeId(id);
    setSpec((s) => ({ ...s, w: preset.w, h: preset.h }));
  }

  const grouped = useMemo(() => {
    const map = new Map<string, SizePreset[]>();
    for (const s of sizes) {
      const list = map.get(s.channel) || [];
      list.push(s);
      map.set(s.channel, list);
    }
    return [...map.entries()];
  }, [sizes]);

  const activeSize = sizes.find((s) => s.id === sizeId);
  const filename = `${filenamePrefix}-${slugify(spec.headline || "untitled")}-${spec.w}x${spec.h}-${spec.theme}.png`;

  async function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    await downloadCanvas(canvas, filename);
    flash(`Saved ${spec.w}x${spec.h}`);
  }

  async function copyImage() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await canvasBlob(canvas);
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      flash("Image copied");
    } catch {
      flash("Clipboard refused. Use Save PNG.");
    }
  }

  async function exportChannel() {
    if (!activeSize) return;
    setBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const targets = sizes.filter((s) => s.channel === activeSize.channel);
      const off = document.createElement("canvas");
      for (const t of targets) {
        await renderComposition(off, { ...spec, w: t.w, h: t.h });
        const blob = await canvasBlob(off);
        zip.file(`${filenamePrefix}-${slugify(spec.headline)}-${t.id}-${t.w}x${t.h}.png`, blob);
      }
      zip.file(
        "spec.json",
        JSON.stringify({ generated: new Date().toISOString(), channel: activeSize.channel, spec }, null, 2),
      );
      const out = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filenamePrefix}-${slugify(spec.headline)}-${slugify(activeSize.channel)}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      flash(`${targets.length} sizes exported`);
    } finally {
      setBusy(false);
    }
  }

  const lines = adlines.lines as { text: string; chars: number; family: string; status: string; audience: string[] }[];

  return (
    <div className="studio">
      <aside className="panel">
        <h3>Size</h3>
        <div className="field">
          <select value={sizeId} onChange={(e) => pickSize(e.target.value)}>
            {grouped.map(([channel, list]) => (
              <optgroup key={channel} label={channel}>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} · {s.w}x{s.h}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {activeSize?.note ? <p className="tiny dim" style={{ marginTop: -6 }}>{activeSize.note}</p> : null}
        <div className="field-row">
          <div className="field">
            <label>Width</label>
            <input type="number" value={spec.w} min={64} max={8000} onChange={(e) => set("w", Number(e.target.value) || 64)} />
          </div>
          <div className="field">
            <label>Height</label>
            <input type="number" value={spec.h} min={64} max={8000} onChange={(e) => set("h", Number(e.target.value) || 64)} />
          </div>
        </div>

        <h3>Copy</h3>
        <div className="field">
          <label>Eyebrow · kicker</label>
          <input type="text" value={spec.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        </div>
        <div className="field">
          <label>
            Headline · leading text <span className="dim">{spec.headline.length} chars</span>
          </label>
          <textarea rows={2} value={spec.headline} onChange={(e) => set("headline", e.target.value)} />
          <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={() => setShowLines((v) => !v)}>
            {showLines ? "Hide the line library" : "Pick an approved line"}
          </button>
          {showLines ? (
            <div style={{ maxHeight: 220, overflowY: "auto", marginTop: 8 }}>
              {lines.map((l) => (
                <button
                  key={l.text}
                  className="line-item"
                  onClick={() => {
                    set("headline", l.text);
                    setShowLines(false);
                  }}
                >
                  <span>{l.text}</span>
                  <span className="len">{l.chars}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="field">
          <label>
            Body · supporting copy <span className="dim">{spec.body.length} chars</span>
          </label>
          <textarea rows={3} value={spec.body} onChange={(e) => set("body", e.target.value)} />
        </div>
        <div className="field">
          <label>Call to action</label>
          <input type="text" value={spec.cta} onChange={(e) => set("cta", e.target.value)} />
        </div>
        <div className="field">
          <label>CTA treatment</label>
          <select value={spec.ctaStyle} onChange={(e) => set("ctaStyle", e.target.value as CompositionSpec["ctaStyle"])}>
            <option value="button">Gold button</option>
            <option value="text">Gold text with a rule</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="field">
          <label>Qualifier · scope line</label>
          <input type="text" value={spec.qualifier} onChange={(e) => set("qualifier", e.target.value)} />
          <p className="tiny dim" style={{ margin: "5px 0 0" }}>
            Every control claim carries its scope. Leave this in unless the headline claims nothing.
          </p>
        </div>

        <h3>Layout</h3>
        <div className="field">
          <select value={spec.layout} onChange={(e) => set("layout", e.target.value as LayoutId)}>
            {LAYOUTS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label>Theme</label>
            <select value={spec.theme} onChange={(e) => set("theme", e.target.value as Theme)}>
              <option value="dark">Ink</option>
              <option value="light">Paper</option>
            </select>
          </div>
          <div className="field">
            <label>Align</label>
            <select value={spec.align} onChange={(e) => set("align", e.target.value as "left" | "center")}>
              <option value="left">Left</option>
              <option value="center">Center</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Padding {spec.padScale.toFixed(2)}x</label>
          <input type="range" min={0.5} max={1.8} step={0.05} value={spec.padScale} onChange={(e) => set("padScale", Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Headline size {spec.headlineScale.toFixed(2)}x</label>
          <input type="range" min={0.5} max={1.6} step={0.05} value={spec.headlineScale} onChange={(e) => set("headlineScale", Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Headline lines, at most</label>
          <input type="number" min={1} max={8} value={spec.maxHeadlineLines} onChange={(e) => set("maxHeadlineLines", Number(e.target.value) || 1)} />
        </div>
        <div className="check">
          <input id="goldRule" type="checkbox" checked={spec.goldRule} onChange={(e) => set("goldRule", e.target.checked)} />
          <label htmlFor="goldRule">Gold rule under the headline</label>
        </div>

        <h3>Texture</h3>
        <div className="swatches">
          {TEXTURES.map((t) => (
            <button
              key={t.id}
              className="swatch"
              data-on={spec.texture === t.id}
              title={t.description}
              onClick={() => set("texture", t.id)}
            >
              <TextureThumb id={t.id} theme={spec.theme} />
              <span>{t.title}</span>
            </button>
          ))}
        </div>

        <h3>Illustration</h3>
        <div className="field">
          <select value={spec.illustration || ""} onChange={(e) => set("illustration", e.target.value || null)}>
            <option value="">None</option>
            {ILLUSTRATIONS.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
          <p className="tiny dim" style={{ margin: "5px 0 0" }}>
            Shown by the illustration layouts.
          </p>
        </div>

        {mode === "device" || spec.layout === "device" ? (
          <>
            <h3>Device</h3>
            <div className="field">
              <label>Frame</label>
              <select
                value={spec.device?.frameId || DEVICE_FRAMES[0]?.id}
                onChange={(e) =>
                  set("device", {
                    frameId: e.target.value,
                    screenshot: spec.device?.screenshot ?? (SHOTS[0] ? `/screenshots/${SHOTS[0].file}` : null),
                    url: spec.device?.url ?? "app.oxagen.sh",
                    fill: spec.device?.fill ?? 0.86,
                    offsetY: spec.device?.offsetY ?? 0,
                  })
                }
              >
                {DEVICE_FRAMES.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title} · {f.aspect}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Screenshot</label>
              <select
                value={spec.device?.screenshot || ""}
                onChange={(e) =>
                  set("device", {
                    frameId: spec.device?.frameId || DEVICE_FRAMES[0].id,
                    screenshot: e.target.value || null,
                    url: spec.device?.url ?? "app.oxagen.sh",
                    fill: spec.device?.fill ?? 0.86,
                    offsetY: spec.device?.offsetY ?? 0,
                  })
                }
              >
                <option value="">Empty screen</option>
                {SHOTS.map((s) => (
                  <option key={s.file} value={`/screenshots/${s.file}`}>
                    {s.title}
                    {s.theme ? ` · ${s.theme}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Address bar</label>
              <input
                type="text"
                value={spec.device?.url || ""}
                onChange={(e) =>
                  set("device", {
                    frameId: spec.device?.frameId || DEVICE_FRAMES[0].id,
                    screenshot: spec.device?.screenshot ?? null,
                    url: e.target.value,
                    fill: spec.device?.fill ?? 0.86,
                    offsetY: spec.device?.offsetY ?? 0,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Device size {(spec.device?.fill ?? 0.86).toFixed(2)}</label>
              <input
                type="range"
                min={0.4}
                max={1}
                step={0.02}
                value={spec.device?.fill ?? 0.86}
                onChange={(e) =>
                  set("device", {
                    frameId: spec.device?.frameId || DEVICE_FRAMES[0].id,
                    screenshot: spec.device?.screenshot ?? null,
                    url: spec.device?.url ?? "app.oxagen.sh",
                    fill: Number(e.target.value),
                    offsetY: spec.device?.offsetY ?? 0,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Vertical offset {(spec.device?.offsetY ?? 0).toFixed(2)}</label>
              <input
                type="range"
                min={-0.3}
                max={0.3}
                step={0.01}
                value={spec.device?.offsetY ?? 0}
                onChange={(e) =>
                  set("device", {
                    frameId: spec.device?.frameId || DEVICE_FRAMES[0].id,
                    screenshot: spec.device?.screenshot ?? null,
                    url: spec.device?.url ?? "app.oxagen.sh",
                    fill: spec.device?.fill ?? 0.86,
                    offsetY: Number(e.target.value),
                  })
                }
              />
            </div>
          </>
        ) : null}

        <h3>Mark and watermark</h3>
        <div className="field">
          <label>Mark</label>
          <select value={spec.logo} onChange={(e) => set("logo", e.target.value as CompositionSpec["logo"])}>
            <option value="lockup">Lockup</option>
            <option value="icon">Icon</option>
            <option value="none">None</option>
          </select>
        </div>
        <div className="field">
          <label>Mark position</label>
          <select value={spec.logoPosition} onChange={(e) => set("logoPosition", e.target.value as CompositionSpec["logoPosition"])}>
            <option value="top-left">Top left</option>
            <option value="top-right">Top right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="bottom-right">Bottom right</option>
          </select>
        </div>
        <div className="check">
          <input
            id="wm"
            type="checkbox"
            checked={spec.watermark.on}
            onChange={(e) => set("watermark", { ...spec.watermark, on: e.target.checked })}
          />
          <label htmlFor="wm">Watermark</label>
        </div>
        {spec.watermark.on ? (
          <>
            <div className="field-row">
              <div className="field">
                <label>Kind</label>
                <select
                  value={spec.watermark.kind}
                  onChange={(e) => set("watermark", { ...spec.watermark, kind: e.target.value as CompositionSpec["watermark"]["kind"] })}
                >
                  <option value="lockup">Lockup</option>
                  <option value="icon">Icon</option>
                  <option value="text">Text</option>
                </select>
              </div>
              <div className="field">
                <label>Corner</label>
                <select
                  value={spec.watermark.position}
                  onChange={(e) =>
                    set("watermark", { ...spec.watermark, position: e.target.value as CompositionSpec["watermark"]["position"] })
                  }
                >
                  <option value="bottom-right">Bottom right</option>
                  <option value="bottom-left">Bottom left</option>
                  <option value="top-right">Top right</option>
                  <option value="top-left">Top left</option>
                </select>
              </div>
            </div>
            {spec.watermark.kind === "text" ? (
              <div className="field">
                <label>Watermark text</label>
                <input
                  type="text"
                  value={spec.watermark.text}
                  onChange={(e) => set("watermark", { ...spec.watermark, text: e.target.value })}
                />
              </div>
            ) : null}
            <div className="field">
              <label>Opacity {Math.round(spec.watermark.opacity * 100)}%</label>
              <input
                type="range"
                min={0.05}
                max={1}
                step={0.05}
                value={spec.watermark.opacity}
                onChange={(e) => set("watermark", { ...spec.watermark, opacity: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Size {spec.watermark.scale.toFixed(2)}x</label>
              <input
                type="range"
                min={0.4}
                max={3}
                step={0.05}
                value={spec.watermark.scale}
                onChange={(e) => set("watermark", { ...spec.watermark, scale: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Inset {spec.watermark.margin.toFixed(2)}x</label>
              <input
                type="range"
                min={0.2}
                max={3}
                step={0.05}
                value={spec.watermark.margin}
                onChange={(e) => set("watermark", { ...spec.watermark, margin: Number(e.target.value) })}
              />
            </div>
          </>
        ) : null}

        <h3>Guides</h3>
        <div className="field">
          <select value={spec.safeArea} onChange={(e) => set("safeArea", e.target.value as CompositionSpec["safeArea"])}>
            <option value="none">No safe area</option>
            <option value="vertical-social">9:16 safe area</option>
            <option value="youtube">YouTube badge zone</option>
          </select>
          <p className="tiny dim" style={{ margin: "5px 0 0" }}>
            Guides are drawn into the export. Switch them off before you ship the file.
          </p>
        </div>
      </aside>

      <section>
        {children}
        <div className="stage">
          <canvas ref={canvasRef} />
          <div className="stage-meta">
            {spec.w} x {spec.h} · {(spec.w * spec.h) / 1e6 > 1 ? `${((spec.w * spec.h) / 1e6).toFixed(1)}MP` : `${Math.round((spec.w * spec.h) / 1000)}kpx`} · {spec.theme}
          </div>
          {overflow ? (
            <p className="tiny" style={{ color: "#F1C364", margin: 0 }}>
              The copy is being shrunk to fit. Cut words, raise the line limit, or pick a taller size.
            </p>
          ) : null}
          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn btn-gold" onClick={exportPng}>
              Save PNG
            </button>
            <button className="btn" onClick={copyImage}>
              Copy image
            </button>
            <button className="btn" onClick={exportChannel} disabled={busy}>
              {busy ? "Rendering…" : `Export every ${activeSize?.channel} size`}
            </button>
            <button
              className="btn"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(spec, null, 2)).then(
                  () => flash("Spec copied"),
                  () => flash("Clipboard refused"),
                );
              }}
            >
              Copy spec
            </button>
          </div>
        </div>
      </section>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}

function TextureThumb({ id, theme }: { id: string; theme: Theme }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    canvas.width = 180;
    canvas.height = 104;
    const ctx = canvas.getContext("2d");
    const tex = TEXTURES.find((t) => t.id === id);
    if (!ctx || !tex) return;
    const c = COLORS[theme];
    tex.paint({
      ctx,
      w: 180,
      h: 104,
      scale: 0.95,
      theme,
      colors: { bg: c.bg, bgDeep: c.bgDeep, panel: c.panel, line: c.line, rule: c.rule, text: c.text, muted: c.muted, gold: c.gold, goldDeep: c.goldDeep },
    });
  }, [id, theme]);
  return <canvas ref={ref} />;
}
