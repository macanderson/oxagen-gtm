"use client";

import { useMemo, useState } from "react";
import media from "@/data/media.json";

interface Item {
  id: string;
  group: string;
  groupSlug: string;
  note: string;
  file: string;
  name: string;
  format: string;
  bytes: number;
  brand: string;
  theme: string;
  w: number | null;
  h: number | null;
  dims: string | null;
  tags: string[];
}

const items = media.items as Item[];
const GROUPS = [...new Set(items.map((i) => i.group))];

function kb(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export function MediaLibrary() {
  const [group, setGroup] = useState(GROUPS[0]);
  const [brand, setBrand] = useState("oxagen");
  const [theme, setTheme] = useState("");
  const [format, setFormat] = useState("");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<Item | null>(null);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => {
      if (group && i.group !== group) return false;
      if (brand && i.brand !== brand) return false;
      if (theme && i.theme !== theme) return false;
      if (format && i.format !== format) return false;
      if (needle && !i.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [group, brand, theme, format, q]);

  const note = items.find((i) => i.group === group)?.note;

  return (
    <>
      <div className="chips" style={{ marginTop: 20 }}>
        {GROUPS.map((g) => (
          <button key={g} className="chip" data-on={group === g} onClick={() => setGroup(g)}>
            {g}
          </button>
        ))}
      </div>
      {note ? <p className="small dim">{note}</p> : null}

      <div className="card" style={{ margin: "14px 0 20px" }}>
        <div className="grid" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10 }}>
          <div>
            <label>Search</label>
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="File name" />
          </div>
          <div>
            <label>Brand</label>
            <select value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Both</option>
              <option value="oxagen">oxagen</option>
              <option value="stella">stella</option>
            </select>
          </div>
          <div>
            <label>Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="">Any</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="either">Adaptive</option>
            </select>
          </div>
          <div>
            <label>Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="">Any</option>
              <option value="svg">SVG</option>
              <option value="png">PNG</option>
              <option value="ico">ICO</option>
            </select>
          </div>
        </div>
        <p className="tiny dim" style={{ margin: "12px 0 0" }}>
          {shown.length} files
        </p>
      </div>

      <div className="grid grid-4">
        {shown.map((i) => (
          <figure key={i.id} className="card" style={{ margin: 0, padding: 12 }}>
            <button
              onClick={() => setPreview(i)}
              style={{
                display: "block",
                width: "100%",
                border: 0,
                padding: 0,
                background: i.theme === "light" ? "#F2EEE5" : "#0A0A09",
                borderRadius: 6,
                cursor: "zoom-in",
              }}
              title="Open"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={i.file}
                alt={i.name}
                loading="lazy"
                style={{ display: "block", width: "100%", height: 120, objectFit: "contain", padding: 8 }}
              />
            </button>
            <figcaption className="tiny" style={{ marginTop: 8 }}>
              <div style={{ color: "var(--text)", wordBreak: "break-all" }}>{i.name}</div>
              <div className="dim">
                {i.dims || "vector"} · {i.format.toUpperCase()} · {kb(i.bytes)}
              </div>
              <div className="row" style={{ marginTop: 8, gap: 6 }}>
                <a className="btn btn-sm" href={i.file} download>
                  Download
                </a>
                <a className="btn btn-sm" href={i.file} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      {preview ? (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10,10,9,0.86)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 40,
            zIndex: 90,
            cursor: "zoom-out",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview.file} alt={preview.name} style={{ maxWidth: "90vw", maxHeight: "82vh", objectFit: "contain" }} />
          <div className="toast" style={{ bottom: 28 }}>
            {preview.name} · {preview.dims || "vector"}
          </div>
        </div>
      ) : null}
    </>
  );
}
