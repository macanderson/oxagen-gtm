import Link from "next/link";
import messages from "@/data/messages.json";
import media from "@/data/media.json";
import adlines from "@/data/adlines.json";
import { AD_SIZES, VIDEO_SIZES } from "@/lib/presets";
import { ILLUSTRATIONS } from "@/lib/illustrations";
import { TEXTURES } from "@/lib/textures";
import { DEVICE_FRAMES } from "@/lib/devices";

const SECTIONS = [
  {
    href: "/messaging",
    title: "Messaging",
    blurb: "Every approved, candidate and retired line, with the audience it is for, the mandate clause it serves, the evidence it needs and the review finding that shaped it.",
    stat: (m: number) => `${m} entries`,
  },
  {
    href: "/ad-lines",
    title: "Ad lines",
    blurb: "Short-form headlines sized for a LinkedIn single-image ad, grouped by audience, with the claims this playbook will not write and what would unlock them.",
    stat: () => `${(adlines.lines as unknown[]).length} lines, 40 to 48 chars`,
  },
  {
    href: "/studio/banner",
    title: "Banner studio",
    blurb: "Any message on any placement. Pick a size, write the eyebrow, headline, body and call to action, choose a texture and a layout, export one PNG or every size in the channel.",
    stat: () => `${AD_SIZES.length} placements`,
  },
  {
    href: "/studio/video",
    title: "Video studio",
    blurb: "Thumbnails, first and last frames, numbered divider cards, lower thirds and a transparent watermark overlay. 16:9 and 9:16, 6K down to 720p.",
    stat: () => `${VIDEO_SIZES.length} formats`,
  },
  {
    href: "/studio/device",
    title: "Device shots",
    blurb: "Put a real screenshot of the app inside a laptop, a desktop, a tablet, a phone or plain browser chrome, on any background.",
    stat: () => `${DEVICE_FRAMES.length} frames`,
  },
  {
    href: "/illustrations",
    title: "Illustrations",
    blurb: "Line drawings of the mechanism: an agent asking, a rule answering, a mandate, a meter row, a fleet. Built to sit beside the type, not to decorate it.",
    stat: () => `${ILLUSTRATIONS.length} drawings`,
  },
  {
    href: "/textures",
    title: "Textures",
    blurb: "Backgrounds that stay quiet under a headline. Rendered live at any size, in ink and in paper.",
    stat: () => `${TEXTURES.length} textures`,
  },
  {
    href: "/library",
    title: "Media library",
    blurb: "Everything the house brand kit has already generated: campaign ads, social images, content cards, wallpapers, logos, icons and badges.",
    stat: (m: number) => `${m} files`,
  },
  {
    href: "/guidelines",
    title: "Guidelines",
    blurb: "The six rules that never bend, the words to use and avoid, the scope every control claim carries, and the checklist an asset passes before it ships.",
    stat: () => "Read before you write",
  },
];

export default function Home() {
  const entries = messages.entries as { status: string; group: string }[];
  const approved = entries.filter((e) => e.status === "approved").length;
  const retired = entries.filter((e) => e.status === "retired").length;

  return (
    <div className="wrap">
      <p className="eyebrow">The control plane for your agent workforce</p>
      <h1 style={{ maxWidth: "16ch" }}>The Oxagen go-to-market playbook.</h1>
      <p className="lede">
        One place to read the messaging, browse every asset the brand has already produced, and generate a new one that
        obeys the same rules. The message registry in <code>oxagenai/oxagen-brand</code> is the source of truth; this
        site reads it and never overrides it.
      </p>
      <div className="hero-rule" />

      <div className="row" style={{ gap: 28, marginBottom: 36 }}>
        <Stat n={String(approved)} label="approved lines" />
        <Stat n={String(retired)} label="retired, with the reason" />
        <Stat n={String(media.count)} label="media files" />
        <Stat n={String(AD_SIZES.length + VIDEO_SIZES.length)} label="output sizes" />
      </div>

      <div className="grid grid-3">
        {SECTIONS.map((s) => (
          <Link key={s.href} href={s.href} className="card card-link">
            <h3 style={{ marginBottom: 6 }}>{s.title}</h3>
            <p className="small" style={{ color: "var(--body)", marginBottom: 10 }}>
              {s.blurb}
            </p>
            <span className="tag">{s.stat(s.href === "/messaging" ? entries.length : media.count)}</span>
          </Link>
        ))}
      </div>

      <h2 style={{ marginTop: 56 }}>How a campaign gets made here</h2>
      <ol className="small" style={{ color: "var(--body)", maxWidth: "70ch", lineHeight: 1.7 }}>
        <li>
          Pick the audience and the mandate clause it owns. Security reads access first, finance reads budget first,
          engineering reads equipment first.
        </li>
        <li>
          Take the line from <Link href="/messaging" style={{ color: "var(--ox-gold)" }}>Messaging</Link> or{" "}
          <Link href="/ad-lines" style={{ color: "var(--ox-gold)" }}>Ad lines</Link>. If the line you want is not there,
          add it to the registry with its evidence and owner before it runs.
        </li>
        <li>Generate the asset in the studio. The qualifier field stays filled whenever the headline claims control.</li>
        <li>
          Check it against the <Link href="/guidelines" style={{ color: "var(--ox-gold)" }}>shipping checklist</Link>.
          One gold action at most, state shown by shape, no em dashes, sentence case.
        </li>
      </ol>

      <div className="card" style={{ marginTop: 32, borderStyle: "dashed" }}>
        <h3>What this playbook will not generate</h3>
        <p className="small" style={{ color: "var(--body)" }}>{adlines.cannotWrite.reason}</p>
        <ul className="small dim" style={{ margin: "0 0 12px", paddingLeft: 18 }}>
          {adlines.cannotWrite.banned.map((b: string) => (
            <li key={b} style={{ textDecoration: "line-through" }}>
              {b}
            </li>
          ))}
        </ul>
        <p className="small" style={{ margin: 0 }}>
          <strong style={{ color: "var(--text)" }}>Unlocks when:</strong> {adlines.cannotWrite.unlocks}
        </p>
      </div>
    </div>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div style={{ fontSize: "var(--step-4)", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{n}</div>
      <div className="tiny dim">{label}</div>
    </div>
  );
}
