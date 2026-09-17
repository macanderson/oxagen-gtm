// Copies the house brand kit into public/media and writes the data files the site reads.
// Source of truth stays in oxagenai/oxagen-brand; this only mirrors it.
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { homedir } from "node:os";

const KIT = process.env.OXAGEN_HOUSE_BRAND || join(homedir(), "Projects/oxagen-brand");
const ROOT = join(import.meta.dirname, "..");
const MEDIA = join(ROOT, "public/media");

if (!existsSync(KIT)) {
  console.error(`house brand kit not found at ${KIT}`);
  process.exit(1);
}

/** groups copied wholesale (svg + png), and groups where png is too heavy to ship */
const GROUPS = [
  { dir: "ads", label: "Ads", png: true, note: "Generated campaign ads, four placements per campaign." },
  { dir: "social", label: "Social", png: true, note: "Profile, banner, and open-graph images." },
  { dir: "content", label: "Content cards", png: true, note: "Essay, field note, release, and changelog cards." },
  { dir: "logo/svg", label: "Logo", png: false, note: "Wordmarks and marks, both brands, both themes." },
  { dir: "logo/png", label: "Logo", png: true, note: "Raster wordmarks and marks." },
  { dir: "icons", label: "Icons", png: true, note: "Favicons, app icons, web manifests." },
  { dir: "github-badges", label: "Badges", png: true, note: "Repository badges." },
  { dir: "spinners", label: "Spinners", png: true, note: "Loading marks." },
  { dir: "wallpapers/desktop", label: "Wallpapers", png: false, note: "Desktop wallpapers. Render a PNG at any size in the browser." },
  { dir: "wallpapers/phone", label: "Wallpapers", png: false, note: "Phone wallpapers. Render a PNG at any size in the browser." },
];

function pngSize(buf) {
  // PNG: 8-byte signature, then IHDR length(4) type(4) width(4) height(4)
  if (buf.length < 24 || buf.readUInt32BE(12) !== 0x49484452) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

function svgSize(text) {
  const vb = text.match(/viewBox\s*=\s*["']([-\d.\s]+)["']/);
  if (vb) {
    const p = vb[1].trim().split(/[\s,]+/).map(Number);
    if (p.length === 4) return { w: Math.round(p[2]), h: Math.round(p[3]) };
  }
  const w = text.match(/\swidth\s*=\s*["'](\d+)/);
  const h = text.match(/\sheight\s*=\s*["'](\d+)/);
  return w && h ? { w: Number(w[1]), h: Number(h[1]) } : null;
}

function describe(name) {
  const brand = name.startsWith("stella") ? "stella" : "oxagen";
  const theme = /-dark\b|-dark\./.test(name) ? "dark" : /-light\b|-light\./.test(name) ? "light" : "either";
  const dims = name.match(/(\d{3,4})x(\d{3,4})/);
  const tokens = basename(name, extname(name)).split("-").filter((t) => t !== brand && t !== theme);
  return { brand, theme, tokens, declared: dims ? `${dims[1]}x${dims[2]}` : null };
}

const items = [];
mkdirSync(MEDIA, { recursive: true });

for (const group of GROUPS) {
  const src = join(KIT, group.dir);
  if (!existsSync(src)) continue;
  const slug = group.dir.replace(/\//g, "-");
  const outDir = join(MEDIA, slug);
  mkdirSync(outDir, { recursive: true });
  for (const name of readdirSync(src)) {
    const ext = extname(name).toLowerCase();
    if (![".svg", ".png", ".ico", ".webmanifest"].includes(ext)) continue;
    if (ext === ".png" && !group.png) continue;
    const from = join(src, name);
    if (!statSync(from).isFile()) continue;
    cpSync(from, join(outDir, name));
    const buf = readFileSync(from);
    const size = ext === ".png" ? pngSize(buf) : ext === ".svg" ? svgSize(buf.toString("utf8")) : null;
    const meta = describe(name);
    items.push({
      id: `${slug}/${name}`,
      group: group.label,
      groupSlug: slug,
      note: group.note,
      file: `/media/${slug}/${name}`,
      name,
      format: ext.slice(1),
      bytes: buf.length,
      brand: meta.brand,
      theme: meta.theme,
      w: size?.w ?? null,
      h: size?.h ?? null,
      dims: size ? `${size.w}x${size.h}` : meta.declared,
      tags: meta.tokens,
    });
  }
}

// fonts + logo for the studio renderer
mkdirSync(join(ROOT, "public/fonts"), { recursive: true });
for (const f of readdirSync(join(KIT, "fonts"))) {
  if (f.endsWith(".woff2")) cpSync(join(KIT, "fonts", f), join(ROOT, "public/fonts", f));
}
mkdirSync(join(ROOT, "public/brand"), { recursive: true });
for (const f of readdirSync(join(KIT, "logo/svg"))) {
  cpSync(join(KIT, "logo/svg", f), join(ROOT, "public/brand", f));
}
cpSync(join(KIT, "tokens/house-tokens.css"), join(ROOT, "public/brand/house-tokens.css"));

writeFileSync(join(ROOT, "data/media.json"), JSON.stringify({ generated: new Date().toISOString().slice(0, 10), count: items.length, items }, null, 2));

// message registry
const index = JSON.parse(readFileSync(join(KIT, "messages/index.json"), "utf8"));
writeFileSync(join(ROOT, "data/messages.json"), JSON.stringify(index, null, 2));

const groups = items.reduce((acc, i) => ((acc[i.group] = (acc[i.group] || 0) + 1), acc), {});
console.log(`media: ${items.length} files`, groups);
console.log(`messages: ${index.entries.length} entries, ${index.findings.length} findings`);
