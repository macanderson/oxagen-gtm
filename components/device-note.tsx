"use client";

import shots from "@/data/screenshots.json";

export function DeviceNote() {
  const list = Array.isArray(shots) ? (shots as { file: string }[]) : [];
  if (list.length) return null;
  return (
    <div className="card" style={{ borderStyle: "dashed", margin: "16px 0 24px" }}>
      <p className="small" style={{ margin: 0 }}>
        No screenshots are bundled yet. The frames still render with an empty screen, and any PNG dropped into{" "}
        <code>public/screenshots/</code> with a row in <code>data/screenshots.json</code> appears in the picker.
      </p>
    </div>
  );
}
