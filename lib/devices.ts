/**
 * Generic device frames for compositing an app screenshot inside hardware.
 *
 * Each frame's `svg` is inner SVG markup with a transparent screen opening —
 * the `screen` rect is cut out of the bezel fill via an evenodd path built
 * from the SAME numbers reported in `screen`, so the opening can never drift
 * from the reported rect. The site paints the screenshot first, then draws
 * this frame on top; nothing here paints over the screen area.
 *
 * Frame bodies use `currentColor` so the site themes them (dark hardware /
 * light hardware). Structural detail lines (hinge, camera dot, keyboard
 * deck, phone island) use a fixed low-contrast black overlay instead, since
 * a same-color detail on an opaque `currentColor` body would be invisible.
 * No gold anywhere in these frames, and no brand logos or wordmarks.
 */

export interface DeviceFrame {
  id: string;
  title: string;
  kind: "laptop" | "desktop" | "tablet" | "phone" | "browser";
  viewBox: string;
  screen: { x: number; y: number; w: number; h: number; radius: number };
  aspect: string;
  svg: string;
  shadow?: boolean;
  /** browser only: the blank address-field rect, in the same viewBox units. */
  addressBar?: { x: number; y: number; w: number; h: number };
}

function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M${x + rr},${y}`,
    `H${x + w - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w},${y + rr}`,
    `V${y + h - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}`,
    `H${x + rr}`,
    `A${rr},${rr} 0 0 1 ${x},${y + h - rr}`,
    `V${y + rr}`,
    `A${rr},${rr} 0 0 1 ${x + rr},${y}`,
    "Z",
  ].join(" ");
}

/** A bezel ring: the outer body shape with the screen rect cut out (evenodd). */
function bezelRing(
  outer: { x: number; y: number; w: number; h: number; r: number },
  screen: { x: number; y: number; w: number; h: number; radius: number },
): string {
  const outerPath = roundedRectPath(outer.x, outer.y, outer.w, outer.h, outer.r);
  const innerPath = roundedRectPath(screen.x, screen.y, screen.w, screen.h, screen.radius);
  return `<path fill-rule="evenodd" fill="currentColor" d="${outerPath} ${innerPath}"/>`;
}

// ---------------------------------------------------------------------------
// laptop-16

const laptop16Lid = { x: 40, y: 24, w: 920, h: 608, r: 26 };
const laptop16Screen = { x: 64, y: 48, w: 872, h: 545, radius: 6 };
const laptop16: DeviceFrame = {
  id: "laptop-16",
  title: "MacBook Pro",
  kind: "laptop",
  viewBox: "0 0 1000 660",
  screen: laptop16Screen,
  aspect: "16:10",
  shadow: true,
  svg: `
${bezelRing(laptop16Lid, laptop16Screen)}
<circle cx="500" cy="36" r="3" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.5"/>
<rect x="40" y="632" width="920" height="6" fill="#000000" fill-opacity="0.22"/>
<path d="M40,638 L960,638 L920,660 L80,660 Z" fill="#000000" fill-opacity="0.14"/>
`.trim(),
};

// ---------------------------------------------------------------------------
// laptop-13

const laptop13Lid = { x: 40, y: 24, w: 780, h: 515, r: 22 };
const laptop13Screen = { x: 60, y: 44, w: 740, h: 462.5, radius: 5 };
const laptop13: DeviceFrame = {
  id: "laptop-13",
  title: "MacBook Air",
  kind: "laptop",
  viewBox: "0 0 860 600",
  screen: laptop13Screen,
  aspect: "16:10",
  shadow: true,
  svg: `
${bezelRing(laptop13Lid, laptop13Screen)}
<circle cx="430" cy="34" r="2.6" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.3"/>
<rect x="40" y="539" width="780" height="6" fill="#000000" fill-opacity="0.22"/>
<path d="M40,545 L820,545 L790,600 L70,600 Z" fill="#000000" fill-opacity="0.14"/>
`.trim(),
};

// ---------------------------------------------------------------------------
// desktop-27

const desktop27Lid = { x: 40, y: 24, w: 920, h: 552, r: 18 };
const desktop27Screen = { x: 68, y: 52, w: 864, h: 486, radius: 4 };
const desktop27: DeviceFrame = {
  id: "desktop-27",
  title: "27-inch display",
  kind: "desktop",
  viewBox: "0 0 1000 720",
  screen: desktop27Screen,
  aspect: "16:9",
  shadow: true,
  svg: `
${bezelRing(desktop27Lid, desktop27Screen)}
<circle cx="500" cy="38" r="2.6" fill="none" stroke="#000000" stroke-opacity="0.3" stroke-width="1.3"/>
<rect x="460" y="576" width="80" height="90" fill="currentColor"/>
<rect x="340" y="666" width="320" height="26" rx="13" fill="currentColor"/>
`.trim(),
};

// ---------------------------------------------------------------------------
// tablet-landscape

const tabletLandscapeLid = { x: 73.5, y: 60, w: 753, h: 580, r: 34 };
const tabletLandscapeScreen = { x: 103.5, y: 90, w: 693, h: 520, radius: 8 };
const tabletLandscape: DeviceFrame = {
  id: "tablet-landscape",
  title: "Tablet, landscape",
  kind: "tablet",
  viewBox: "0 0 900 700",
  screen: tabletLandscapeScreen,
  aspect: "4:3",
  shadow: true,
  svg: `
${bezelRing(tabletLandscapeLid, tabletLandscapeScreen)}
<circle cx="811.5" cy="350" r="4" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.5"/>
`.trim(),
};

// ---------------------------------------------------------------------------
// tablet-portrait

const tabletPortraitLid = { x: 60, y: 73.5, w: 580, h: 753, r: 34 };
const tabletPortraitScreen = { x: 90, y: 103.5, w: 520, h: 693, radius: 8 };
const tabletPortrait: DeviceFrame = {
  id: "tablet-portrait",
  title: "Tablet, portrait",
  kind: "tablet",
  viewBox: "0 0 700 900",
  screen: tabletPortraitScreen,
  aspect: "3:4",
  shadow: true,
  svg: `
${bezelRing(tabletPortraitLid, tabletPortraitScreen)}
<circle cx="350" cy="88.5" r="4" fill="none" stroke="#000000" stroke-opacity="0.35" stroke-width="1.5"/>
`.trim(),
};

// ---------------------------------------------------------------------------
// phone

const phoneLid = { x: 16, y: 47.5, w: 368, h: 765, r: 48 };
const phoneScreen = { x: 30, y: 61.5, w: 340, h: 737, radius: 38 };
const phone: DeviceFrame = {
  id: "phone",
  title: "Phone",
  kind: "phone",
  viewBox: "0 0 400 860",
  screen: phoneScreen,
  aspect: "19.5:9",
  shadow: true,
  svg: `
${bezelRing(phoneLid, phoneScreen)}
<rect x="170" y="52" width="60" height="8" rx="4" fill="#000000" fill-opacity="0.28"/>
`.trim(),
};

// ---------------------------------------------------------------------------
// browser

const browserScreen = { x: 0, y: 57, w: 1000, h: 625, radius: 0 };
const browserAddressBar = { x: 110, y: 14, w: 780, h: 28 };
const browser: DeviceFrame = {
  id: "browser",
  title: "Browser window",
  kind: "browser",
  viewBox: "0 0 1000 682",
  screen: browserScreen,
  aspect: "16:10",
  shadow: true,
  addressBar: browserAddressBar,
  svg: `
<rect x="0" y="0" width="1000" height="56" fill="currentColor"/>
<circle cx="28" cy="28" r="7" fill="currentColor" fill-opacity="0.55"/>
<circle cx="52" cy="28" r="7" fill="currentColor" fill-opacity="0.55"/>
<circle cx="76" cy="28" r="7" fill="currentColor" fill-opacity="0.55"/>
<rect x="${browserAddressBar.x}" y="${browserAddressBar.y}" width="${browserAddressBar.w}" height="${browserAddressBar.h}" rx="14" fill="currentColor" fill-opacity="0.08" stroke="currentColor" stroke-opacity="0.25" stroke-width="1"/>
<line x1="0" y1="56" x2="1000" y2="56" stroke="currentColor" stroke-opacity="0.3" stroke-width="1"/>
`.trim(),
};

export const DEVICE_FRAMES: DeviceFrame[] = [
  laptop16,
  laptop13,
  desktop27,
  tabletLandscape,
  tabletPortrait,
  phone,
  browser,
];
