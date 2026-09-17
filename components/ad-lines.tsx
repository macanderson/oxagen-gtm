"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import adlines from "@/data/adlines.json";
import { defaultSpec } from "@/lib/compose";

interface Line {
  text: string;
  chars: number;
  audience: string[];
  clause: string;
  family: string;
  status: string;
  form: string;
  source: string;
  registry?: string;
  note?: string;
}

const lines = adlines.lines as Line[];
const FAMILIES = [...new Set(lines.map((l) => l.family))];
const AUDIENCES = [...new Set(lines.flatMap((l) => l.audience))].sort();

export function AdLines() {
  const router = useRouter();
  const [family, setFamily] = useState("");
  const [audience, setAudience] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const shown = useMemo(
    () => lines.filter((l) => (!family || l.family === family) && (!audience || l.audience.includes(audience))),
    [family, audience],
  );

  const byFamily = useMemo(() => {
    const map = new Map<string, Line[]>();
    for (const l of shown) {
      const list = map.get(l.family) || [];
      list.push(l);
      map.set(l.family, list);
    }
    return [...map.entries()];
  }, [shown]);

  function copy(text: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(text);
        setTimeout(() => setCopied(null), 1300);
      },
      () => undefined,
    );
  }

  /** Hand the line to the banner studio, which restores its last spec on load. */
  function sendToStudio(line: Line) {
    const spec = defaultSpec({
      headline: line.text,
      eyebrow: line.family === "Primary" ? "The control plane for your agent workforce" : "",
      body: "",
      qualifier: line.clause === "none" ? "" : "For actions routed through Oxagen.",
    });
    try {
      localStorage.setItem("ox-gtm-banner", JSON.stringify(spec));
    } catch {
      /* the studio still opens, just without the line */
    }
    router.push("/studio/banner");
  }

  return (
    <>
      <div className="chips" style={{ marginTop: 22 }}>
        <button className="chip" data-on={family === ""} onClick={() => setFamily("")}>
          All families
        </button>
        {FAMILIES.map((f) => (
          <button key={f} className="chip" data-on={family === f} onClick={() => setFamily(f)}>
            {f}
          </button>
        ))}
      </div>
      <div className="chips">
        <button className="chip" data-on={audience === ""} onClick={() => setAudience("")}>
          Any audience
        </button>
        {AUDIENCES.map((a) => (
          <button key={a} className="chip" data-on={audience === a} onClick={() => setAudience(a)}>
            {a}
          </button>
        ))}
      </div>

      {byFamily.map(([name, list]) => (
        <section key={name} style={{ marginTop: 30 }}>
          <h2 style={{ fontSize: "var(--step-1)" }}>{name}</h2>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: "48%" }}>Line</th>
                <th>Chars</th>
                <th>Status</th>
                <th>Audience</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {list.map((l) => (
                <tr key={l.text}>
                  <td style={{ color: "var(--text)" }}>
                    {l.text}
                    {l.note ? (
                      <div className="tiny dim" style={{ marginTop: 4 }}>
                        {l.note}
                      </div>
                    ) : null}
                  </td>
                  <td className="mono dim">{l.chars}</td>
                  <td>
                    <span className="tag" data-state={l.status}>
                      {l.status}
                    </span>
                    {l.registry ? (
                      <div className="tiny dim mono" style={{ marginTop: 4 }}>
                        {l.registry}
                      </div>
                    ) : null}
                  </td>
                  <td className="dim tiny">{l.audience.join(", ")}</td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button className="btn btn-sm" onClick={() => copy(l.text)}>
                      {copied === l.text ? "Copied" : "Copy"}
                    </button>{" "}
                    <button className="btn btn-sm" onClick={() => sendToStudio(l)}>
                      Studio
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </>
  );
}
