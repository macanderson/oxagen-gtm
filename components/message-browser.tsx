"use client";

import { useMemo, useState } from "react";
import data from "@/data/messages.json";

interface Entry {
  id: string;
  brand: string;
  kind: string;
  group: string;
  title: string;
  short?: string;
  long?: string;
  cta?: string;
  kicker?: string;
  subline?: string;
  before?: string;
  after?: string;
  audience: string[];
  clause: string;
  surfaces?: string[];
  status: string;
  release?: string;
  qualifier?: string;
  evidence?: string;
  owner: string;
  review_by?: string;
  findings: string[];
  replaced_by?: string | null;
  notes?: string;
  rows?: { label: string; text: string }[];
  path?: string;
}

interface Finding {
  id: string;
  priority: string;
  title: string;
  rule: string;
}

const entries = data.entries as Entry[];
const findings = data.findings as Finding[];

const GROUPS = [...new Set(entries.map((e) => e.group))].sort();
const AUDIENCES = [...new Set(entries.flatMap((e) => e.audience))].sort();
const CLAUSES = [...new Set(entries.map((e) => e.clause))].sort();
const KINDS = [...new Set(entries.map((e) => e.kind))].sort();

export function MessageBrowser() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("");
  const [audience, setAudience] = useState("");
  const [clause, setClause] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return entries.filter((e) => {
      if (group && e.group !== group) return false;
      if (audience && !e.audience.includes(audience)) return false;
      if (clause && e.clause !== clause) return false;
      if (kind && e.kind !== kind) return false;
      if (status && e.status !== status) return false;
      if (!needle) return true;
      return [e.title, e.short, e.long, e.id, e.notes, e.cta].filter(Boolean).join(" ").toLowerCase().includes(needle);
    });
  }, [q, group, audience, clause, kind, status]);

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(id);
        setTimeout(() => setCopied(null), 1400);
      },
      () => undefined,
    );
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="field" style={{ marginBottom: 12 }}>
          <input
            type="search"
            placeholder="Search the registry"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search the registry"
          />
        </div>
        <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
          <Select label="Group" value={group} setValue={setGroup} options={GROUPS} />
          <Select label="Audience" value={audience} setValue={setAudience} options={AUDIENCES} />
          <Select label="Clause" value={clause} setValue={setClause} options={CLAUSES} />
          <Select label="Kind" value={kind} setValue={setKind} options={KINDS} />
          <Select label="Status" value={status} setValue={setStatus} options={["approved", "candidate", "retired"]} />
        </div>
        <p className="tiny dim" style={{ margin: "12px 0 0" }}>
          {filtered.length} of {entries.length} entries
        </p>
      </div>

      <div className="grid grid-2">
        {filtered.map((e) => {
          const expanded = open === e.id;
          return (
            <article key={e.id} className="card">
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span className="tag" data-state={e.status}>
                  {e.status}
                  {e.release === "held" ? " · held" : ""}
                </span>
                <span className="tiny dim mono">{e.id}</span>
              </div>
              <h3 style={{ fontSize: "var(--step-0)", marginBottom: 8 }}>{e.title}</h3>
              {e.kicker ? <p className="tiny dim" style={{ margin: "0 0 6px" }}>Kicker: {e.kicker}</p> : null}
              {e.short ? (
                <p className="small" style={{ marginBottom: 8 }}>
                  {e.short}
                </p>
              ) : null}
              {e.before && e.after ? (
                <div className="small" style={{ marginBottom: 8 }}>
                  <p style={{ margin: "0 0 4px", color: "var(--dim)", textDecoration: "line-through" }}>{e.before}</p>
                  <p style={{ margin: 0, color: "var(--text)" }}>{e.after}</p>
                </div>
              ) : null}
              {expanded ? (
                <div className="small" style={{ color: "var(--body)" }}>
                  {e.long ? <p>{e.long}</p> : null}
                  {e.rows?.length ? (
                    <table className="table" style={{ marginBottom: 12 }}>
                      <tbody>
                        {e.rows.map((r) => (
                          <tr key={r.label}>
                            <td style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{r.label}</td>
                            <td>{r.text}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : null}
                  {e.cta ? (
                    <p>
                      <strong style={{ color: "var(--text)" }}>Action:</strong> {e.cta}
                    </p>
                  ) : null}
                  {e.qualifier ? (
                    <p>
                      <strong style={{ color: "var(--text)" }}>Qualifier every short form keeps:</strong> {e.qualifier}
                    </p>
                  ) : null}
                  {e.evidence ? (
                    <p>
                      <strong style={{ color: "var(--text)" }}>Evidence before it runs:</strong> {e.evidence}
                    </p>
                  ) : null}
                  {e.replaced_by ? (
                    <p>
                      <strong style={{ color: "var(--text)" }}>Replaced by:</strong> {e.replaced_by}
                    </p>
                  ) : null}
                  {e.notes ? <p className="dim">{e.notes}</p> : null}
                  {e.findings?.length ? (
                    <div style={{ marginTop: 10 }}>
                      {e.findings.map((f) => {
                        const finding = findings.find((x) => x.id === f);
                        return (
                          <p key={f} className="tiny dim" style={{ margin: "0 0 6px" }}>
                            Finding {f}: {finding ? finding.rule : "see the review"}
                          </p>
                        );
                      })}
                    </div>
                  ) : null}
                  <p className="tiny dim" style={{ marginBottom: 0 }}>
                    Owner {e.owner}
                    {e.review_by ? ` · review by ${e.review_by}` : ""}
                    {e.path ? ` · ${e.path}` : ""}
                  </p>
                </div>
              ) : null}
              <div className="row" style={{ marginTop: 10 }}>
                <span className="tag">{e.group}</span>
                <span className="tag">{e.kind}</span>
                {e.clause !== "none" ? <span className="tag">{e.clause}</span> : null}
                {e.audience.map((a) => (
                  <span key={a} className="tag">
                    {a}
                  </span>
                ))}
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-sm" onClick={() => setOpen(expanded ? null : e.id)}>
                  {expanded ? "Less" : "Detail"}
                </button>
                <button className="btn btn-sm" onClick={() => copy(e.long || e.short || e.title, e.id)}>
                  {copied === e.id ? "Copied" : "Copy copy"}
                </button>
                <button className="btn btn-sm" onClick={() => copy(e.title, `${e.id}-t`)}>
                  {copied === `${e.id}-t` ? "Copied" : "Copy line"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}

function Select({
  label,
  value,
  setValue,
  options,
}: {
  label: string;
  value: string;
  setValue: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
