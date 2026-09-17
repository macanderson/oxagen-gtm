"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  canvasBlob,
  defaultSpec,
  downloadCanvas,
  renderComposition,
  slugify,
  type CompositionSpec,
  type Theme,
} from "@/lib/compose";
import { TEXTURES } from "@/lib/textures";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { VIDEO_SIZES, FRAME_KINDS, type FrameRole } from "@/lib/presets";
import adlines from "@/data/adlines.json";

interface Frame {
  key: string;
  role: FrameRole;
  label: string;
  eyebrow: string;
  headline: string;
  body: string;
  cta: string;
  illustration: string | null;
}

let seq = 0;
const nextKey = () => `f${++seq}`;

function starterKit(): Frame[] {
  return [
    {
      key: nextKey(),
      role: "thumbnail",
      label: "Thumbnail",
      eyebrow: "Mission Control",
      headline: "Which rule answered? Who signed?",
      body: "",
      cta: "",
      illustration: null,
    },
    {
      key: nextKey(),
      role: "first",
      label: "First frame",
      eyebrow: "The control plane for your agent workforce",
      headline: "Mission Control for your autonomous agents.",
      body: "",
      cta: "",
      illustration: null,
    },
    {
      key: nextKey(),
      role: "divider",
      label: "Section 01",
      eyebrow: "01",
      headline: "The agent asks.",
      body: "",
      cta: "",
      illustration: "agent-asks",
    },
    {
      key: nextKey(),
      role: "divider",
      label: "Section 02",
      eyebrow: "02",
      headline: "A rule you wrote answers.",
      body: "",
      cta: "",
      illustration: "rule-answers",
    },
    {
      key: nextKey(),
      role: "lower-third",
      label: "Lower third",
      eyebrow: "",
      headline: "Mac Anderson",
      body: "Founder, Oxagen",
      cta: "",
      illustration: null,
    },
    {
      key: nextKey(),
      role: "last",
      label: "End card",
      eyebrow: "",
      headline: "See the record behind one governed action.",
      body: "",
      cta: "oxagen.sh",
      illustration: null,
    },
    {
      key: nextKey(),
      role: "watermark",
      label: "Watermark overlay",
      eyebrow: "",
      headline: "",
      body: "",
      cta: "",
      illustration: null,
    },
  ];
}

export function VideoStudio() {
  const [formatId, setFormatId] = useState("h-1080");
  const [theme, setTheme] = useState<Theme>("dark");
  const [texture, setTexture] = useState("topo");
  const [qualifier, setQualifier] = useState("For actions routed through Oxagen.");
  const [safeArea, setSafeArea] = useState<CompositionSpec["safeArea"]>("none");
  const [headlineScale, setHeadlineScale] = useState(1);
  const [frames, setFrames] = useState<Frame[]>(starterKit);
  const [activeKey, setActiveKey] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showLines, setShowLines] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!activeKey && frames.length) setActiveKey(frames[0].key);
  }, [frames, activeKey]);

  const format = VIDEO_SIZES.find((f) => f.id === formatId) || VIDEO_SIZES[0];
  const active = frames.find((f) => f.key === activeKey) || frames[0];

  const flash = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 1800);
  }, []);

  const specFor = useCallback(
    (frame: Frame, size = { w: format.w, h: format.h }): CompositionSpec => {
      const kind = FRAME_KINDS.find((k) => k.role === frame.role)!;
      const transparent = frame.role === "watermark" || frame.role === "lower-third";
      return defaultSpec({
        w: size.w,
        h: size.h,
        theme,
        texture,
        transparent,
        layout: frame.role === "lower-third" ? "lower-third" : frame.illustration && kind.layout === "centered" ? "illustration-above" : kind.layout,
        eyebrow: frame.eyebrow,
        headline: frame.headline,
        body: frame.body,
        cta: frame.cta,
        ctaStyle: kind.defaults.ctaStyle,
        qualifier: frame.role === "watermark" || frame.role === "lower-third" ? "" : qualifier,
        logo: frame.role === "watermark" ? "none" : frame.role === "last" ? "lockup" : "lockup",
        logoPosition: frame.role === "last" ? "top-left" : "top-left",
        illustration: frame.illustration,
        align: kind.defaults.align,
        goldRule: kind.defaults.goldRule,
        headlineScale: frame.role === "thumbnail" ? headlineScale * 1.25 : headlineScale,
        maxHeadlineLines: frame.role === "thumbnail" ? 3 : 4,
        safeArea,
        watermark: {
          on: frame.role === "watermark",
          kind: "lockup",
          text: "oxagen.sh",
          position: "bottom-right",
          opacity: 0.6,
          scale: 1,
          margin: 1,
        },
      });
    },
    [format.w, format.h, theme, texture, qualifier, safeArea, headlineScale],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    // preview at a workable size; export always renders at the real resolution
    const previewW = Math.min(format.w, 1600);
    const previewH = Math.round((previewW * format.h) / format.w);
    renderComposition(canvas, { ...specFor(active), w: previewW, h: previewH }).catch(() => undefined);
  }, [active, specFor, format.w, format.h]);

  function update<K extends keyof Frame>(key: K, value: Frame[K]) {
    setFrames((list) => list.map((f) => (f.key === active.key ? { ...f, [key]: value } : f)));
  }

  function addFrame(role: FrameRole) {
    const kind = FRAME_KINDS.find((k) => k.role === role)!;
    const dividerCount = frames.filter((f) => f.role === "divider").length;
    const frame: Frame = {
      key: nextKey(),
      role,
      label: role === "divider" ? `Section ${String(dividerCount + 1).padStart(2, "0")}` : kind.label,
      eyebrow: role === "divider" ? String(dividerCount + 1).padStart(2, "0") : "",
      headline: role === "divider" ? "Name the section." : kind.label,
      body: "",
      cta: role === "last" ? "oxagen.sh" : "",
      illustration: null,
    };
    setFrames((list) => [...list, frame]);
    setActiveKey(frame.key);
  }

  function removeFrame(key: string) {
    setFrames((list) => (list.length > 1 ? list.filter((f) => f.key !== key) : list));
  }

  function move(key: string, delta: number) {
    setFrames((list) => {
      const i = list.findIndex((f) => f.key === key);
      const j = i + delta;
      if (i < 0 || j < 0 || j >= list.length) return list;
      const copy = [...list];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  }

  async function exportOne() {
    const off = document.createElement("canvas");
    await renderComposition(off, specFor(active));
    await downloadCanvas(off, `oxagen-${active.role}-${slugify(active.headline || active.label)}-${format.w}x${format.h}.png`);
    flash(`Saved at ${format.w}x${format.h}`);
  }

  async function exportKit() {
    setBusy(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const off = document.createElement("canvas");
      const manifest: Record<string, unknown>[] = [];
      let n = 0;
      for (const frame of frames) {
        n += 1;
        await renderComposition(off, specFor(frame));
        const blob = await canvasBlob(off);
        const name = `${String(n).padStart(2, "0")}-${frame.role}-${slugify(frame.headline || frame.label)}.png`;
        zip.file(name, blob);
        manifest.push({
          order: n,
          file: name,
          role: frame.role,
          label: frame.label,
          headline: frame.headline,
          body: frame.body,
          transparent: frame.role === "watermark" || frame.role === "lower-third",
        });
      }
      zip.file(
        "manifest.json",
        JSON.stringify(
          { generated: new Date().toISOString(), format: { id: format.id, w: format.w, h: format.h, aspect: format.aspect }, theme, texture, qualifier, frames: manifest },
          null,
          2,
        ),
      );
      zip.file(
        "README.txt",
        [
          `Oxagen video frame kit`,
          `${format.label} · ${format.w}x${format.h} · ${format.aspect}`,
          ``,
          `Frames are numbered in running order.`,
          `The watermark and lower-third PNGs have transparent backgrounds: lay them over the footage.`,
          `The scope line on the cards reads: ${qualifier || "(none set)"}`,
          ``,
          `Every control claim in the voiceover carries the same scope. A claim without it is not shippable.`,
        ].join("\n"),
      );
      const out = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(out);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oxagen-video-kit-${format.id}-${theme}.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      flash(`${frames.length} frames exported`);
    } finally {
      setBusy(false);
    }
  }

  /** A short animated build of the current frame, recorded straight off a canvas. */
  async function exportIntro() {
    setBusy(true);
    try {
      const off = document.createElement("canvas");
      const w = Math.min(format.w, 1920);
      const h = Math.round((w * format.h) / format.w);
      off.width = w;
      off.height = h;
      const ctx = off.getContext("2d");
      const stream = off.captureStream(30);
      const type = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const rec = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 12_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const done = new Promise<void>((resolve) => {
        rec.onstop = () => resolve();
      });
      rec.start();

      const still = document.createElement("canvas");
      await renderComposition(still, { ...specFor(active), w, h });
      const frameCount = 90; // three seconds at 30fps
      for (let i = 0; i < frameCount; i++) {
        const t = i / (frameCount - 1);
        const ease = t < 0.25 ? t / 0.25 : 1; // fade in over the first 0.75s
        if (!ctx) break;
        ctx.clearRect(0, 0, w, h);
        ctx.globalAlpha = 1;
        ctx.fillStyle = theme === "dark" ? "#10100F" : "#F2EEE5";
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = ease;
        const lift = (1 - ease) * h * 0.02;
        ctx.drawImage(still, 0, lift, w, h);
        ctx.globalAlpha = 1;
        await new Promise((r) => requestAnimationFrame(r));
      }
      rec.stop();
      await done;
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `oxagen-intro-${slugify(active.headline || active.label)}-${w}x${h}.webm`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      flash("Intro recorded");
    } catch {
      flash("This browser refused the recording. The PNG frames still export.");
    } finally {
      setBusy(false);
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, typeof VIDEO_SIZES>();
    for (const s of VIDEO_SIZES) {
      const list = map.get(s.channel) || [];
      list.push(s);
      map.set(s.channel, list);
    }
    return [...map.entries()];
  }, []);

  const lines = adlines.lines as { text: string; chars: number }[];

  return (
    <div className="studio">
      <aside className="panel">
        <h3>Format</h3>
        <div className="field">
          <select value={formatId} onChange={(e) => setFormatId(e.target.value)}>
            {grouped.map(([channel, list]) => (
              <optgroup key={channel} label={channel}>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label} · {s.w}x{s.h} · {s.aspect}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        {format.note ? (
          <p className="tiny dim" style={{ marginTop: -6 }}>
            {format.note}
          </p>
        ) : null}

        <h3>Kit</h3>
        {frames.map((f, i) => (
          <div key={f.key} className="row" style={{ gap: 4, marginBottom: 6, flexWrap: "nowrap" }}>
            <button
              className="line-item"
              data-on={f.key === active?.key}
              style={{ margin: 0, borderColor: f.key === active?.key ? "var(--ox-gold)" : undefined }}
              onClick={() => setActiveKey(f.key)}
            >
              <span>
                <span className="dim mono tiny">{String(i + 1).padStart(2, "0")} </span>
                {f.label}
              </span>
              <span className="len">{f.role}</span>
            </button>
            <button className="btn btn-sm" title="Move up" onClick={() => move(f.key, -1)}>
              ↑
            </button>
            <button className="btn btn-sm" title="Move down" onClick={() => move(f.key, 1)}>
              ↓
            </button>
            <button className="btn btn-sm" title="Remove" onClick={() => removeFrame(f.key)}>
              ×
            </button>
          </div>
        ))}
        <div className="chips" style={{ marginTop: 10 }}>
          {FRAME_KINDS.map((k) => (
            <button key={k.role} className="chip" onClick={() => addFrame(k.role)} title={k.description}>
              + {k.label}
            </button>
          ))}
        </div>

        {active ? (
          <>
            <h3>This frame</h3>
            <p className="tiny dim" style={{ marginTop: -4 }}>
              {FRAME_KINDS.find((k) => k.role === active.role)?.description}
            </p>
            <div className="field">
              <label>Label, used in the file name</label>
              <input type="text" value={active.label} onChange={(e) => update("label", e.target.value)} />
            </div>
            <div className="field">
              <label>{active.role === "divider" ? "Section number" : "Eyebrow"}</label>
              <input type="text" value={active.eyebrow} onChange={(e) => update("eyebrow", e.target.value)} />
            </div>
            <div className="field">
              <label>
                {active.role === "lower-third" ? "Name" : "Headline"} <span className="dim">{active.headline.length}</span>
              </label>
              <textarea rows={2} value={active.headline} onChange={(e) => update("headline", e.target.value)} />
              <button className="btn btn-sm" style={{ marginTop: 6 }} onClick={() => setShowLines((v) => !v)}>
                {showLines ? "Hide the line library" : "Pick an approved line"}
              </button>
              {showLines ? (
                <div style={{ maxHeight: 200, overflowY: "auto", marginTop: 8 }}>
                  {lines.map((l) => (
                    <button
                      key={l.text}
                      className="line-item"
                      onClick={() => {
                        update("headline", l.text);
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
              <label>{active.role === "lower-third" ? "Role" : "Body"}</label>
              <textarea rows={2} value={active.body} onChange={(e) => update("body", e.target.value)} />
            </div>
            {active.role === "last" ? (
              <div className="field">
                <label>Action</label>
                <input type="text" value={active.cta} onChange={(e) => update("cta", e.target.value)} />
              </div>
            ) : null}
            <div className="field">
              <label>Illustration</label>
              <select value={active.illustration || ""} onChange={(e) => update("illustration", e.target.value || null)}>
                <option value="">None</option>
                {ILLUSTRATIONS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        <h3>Whole kit</h3>
        <div className="field-row">
          <div className="field">
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
              <option value="dark">Ink</option>
              <option value="light">Paper</option>
            </select>
          </div>
          <div className="field">
            <label>Safe area</label>
            <select value={safeArea} onChange={(e) => setSafeArea(e.target.value as CompositionSpec["safeArea"])}>
              <option value="none">Off</option>
              <option value="vertical-social">9:16</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Texture</label>
          <select value={texture} onChange={(e) => setTexture(e.target.value)}>
            {TEXTURES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Headline size {headlineScale.toFixed(2)}x</label>
          <input type="range" min={0.6} max={1.5} step={0.05} value={headlineScale} onChange={(e) => setHeadlineScale(Number(e.target.value))} />
        </div>
        <div className="field">
          <label>Qualifier on every card</label>
          <input type="text" value={qualifier} onChange={(e) => setQualifier(e.target.value)} />
        </div>
      </aside>

      <section>
        <div className="stage">
          <canvas ref={canvasRef} />
          <div className="stage-meta">
            {active?.label} · exports at {format.w} x {format.h} · {format.aspect}
            {active?.role === "watermark" || active?.role === "lower-third" ? " · transparent" : ""}
          </div>
          <div className="row" style={{ justifyContent: "center" }}>
            <button className="btn btn-gold" onClick={exportKit} disabled={busy}>
              {busy ? "Rendering…" : "Export the kit (zip)"}
            </button>
            <button className="btn" onClick={exportOne}>
              Save this frame
            </button>
            <button className="btn" onClick={exportIntro} disabled={busy}>
              Record a 3s intro (webm)
            </button>
          </div>
          <p className="tiny dim" style={{ maxWidth: "62ch", textAlign: "center", margin: 0 }}>
            The preview is scaled to fit. Every export renders at the full {format.w}x{format.h}. A 6K master takes a
            moment per frame.
          </p>
        </div>
      </section>
      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
