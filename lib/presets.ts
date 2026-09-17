// Sizes, channel rules and the copy-field vocabulary the studios use.
// Field names follow ad-industry usage so a spec handed to a media buyer reads normally:
//   Eyebrow  = kicker / overline
//   Headline = the leading text, the one line a reader takes away
//   Body     = body copy / supporting copy (LinkedIn calls its own field "Introductory text")
//   CTA      = call to action
//   Qualifier= the scope line that keeps a control claim honest

export interface SizePreset {
  id: string;
  label: string;
  w: number;
  h: number;
  channel: string;
  note?: string;
}

export const FIELD_GUIDE = [
  { field: "Eyebrow", alias: "Kicker, overline", rule: "Uppercase, tracked, 2 to 6 words. Names the category or the audience. Optional." },
  { field: "Headline", alias: "Leading text, hook", rule: "One sentence, 40 to 48 characters for a LinkedIn headline. The line the reader takes away." },
  { field: "Body", alias: "Body copy, supporting copy, LinkedIn 'Introductory text'", rule: "One to three sentences. Pairs the feature with what it does for the reader. Keep the first 150 characters self-contained; LinkedIn truncates there." },
  { field: "CTA", alias: "Call to action, action", rule: "Verb first, 2 to 5 words. It must lead to the thing it promises." },
  { field: "Qualifier", alias: "Scope line, disclosure", rule: "The sentence that scopes a control claim: 'For actions routed through Oxagen.' Required whenever the headline claims control." },
] as const;

export const AD_SIZES: SizePreset[] = [
  // LinkedIn
  { id: "li-single", label: "Single image ad", w: 1200, h: 627, channel: "LinkedIn", note: "1.91:1. The workhorse. Headline 70 chars max, description 70, intro text 150 before truncation." },
  { id: "li-square", label: "Square ad", w: 1080, h: 1080, channel: "LinkedIn", note: "Takes more feed height than 1.91:1 on mobile." },
  { id: "li-portrait", label: "Portrait ad", w: 1080, h: 1350, channel: "LinkedIn", note: "4:5. The tallest still allowed in the feed." },
  { id: "li-carousel", label: "Carousel card", w: 1080, h: 1080, channel: "LinkedIn", note: "2 to 10 cards, each 1080x1080." },
  { id: "li-banner", label: "Company page banner", w: 1128, h: 191, channel: "LinkedIn" },
  { id: "li-doc", label: "Document ad page", w: 1080, h: 1350, channel: "LinkedIn", note: "Rendered as a PDF page in the feed." },
  // Open graph and social
  { id: "og", label: "Open graph", w: 1200, h: 630, channel: "Web & social", note: "Link previews everywhere." },
  { id: "x-post", label: "X post image", w: 1600, h: 900, channel: "Web & social" },
  { id: "x-header", label: "X header", w: 1500, h: 500, channel: "Web & social" },
  { id: "ig-square", label: "Instagram square", w: 1080, h: 1080, channel: "Web & social" },
  { id: "story", label: "Story / Reel still", w: 1080, h: 1920, channel: "Web & social", note: "9:16. Keep copy inside the safe area." },
  // IAB display
  { id: "mpu", label: "Medium rectangle", w: 300, h: 250, channel: "Display (IAB)", note: "The MPU. Two short lines and a mark, nothing more." },
  { id: "leaderboard", label: "Leaderboard", w: 728, h: 90, channel: "Display (IAB)" },
  { id: "billboard", label: "Billboard", w: 970, h: 250, channel: "Display (IAB)" },
  { id: "half-page", label: "Half page", w: 300, h: 600, channel: "Display (IAB)" },
  { id: "skyscraper", label: "Wide skyscraper", w: 160, h: 600, channel: "Display (IAB)" },
  { id: "mobile-banner", label: "Mobile banner", w: 320, h: 50, channel: "Display (IAB)", note: "Headline only. Drop everything else." },
  { id: "mobile-mpu", label: "Mobile large", w: 320, h: 250, channel: "Display (IAB)" },
  // Owned surfaces
  { id: "email-header", label: "Email header", w: 1200, h: 400, channel: "Owned", note: "Renders at 600pt wide in most clients." },
  { id: "slide", label: "Slide", w: 1920, h: 1080, channel: "Owned" },
  { id: "print-a4", label: "A4 at 150dpi", w: 1754, h: 2480, channel: "Owned" },
];

export interface VideoPreset extends SizePreset {
  aspect: string;
  tier: "6K" | "4K" | "1440p" | "1080p" | "720p" | "thumbnail";
}

export const VIDEO_SIZES: VideoPreset[] = [
  // 16:9 masters
  { id: "h-6k", label: "6K master", w: 6144, h: 3456, aspect: "16:9", tier: "6K", channel: "Horizontal", note: "Master for reframing. Deliver a downscale, not this." },
  { id: "h-4k", label: "4K UHD", w: 3840, h: 2160, aspect: "16:9", tier: "4K", channel: "Horizontal", note: "YouTube's best-quality tier." },
  { id: "h-1440", label: "1440p QHD", w: 2560, h: 1440, aspect: "16:9", tier: "1440p", channel: "Horizontal" },
  { id: "h-1080", label: "1080p FHD", w: 1920, h: 1080, aspect: "16:9", tier: "1080p", channel: "Horizontal", note: "LinkedIn's practical ceiling for feed video." },
  { id: "h-720", label: "720p HD", w: 1280, h: 720, aspect: "16:9", tier: "720p", channel: "Horizontal", note: "LinkedIn video ad minimum is 640x360." },
  // 9:16 verticals
  { id: "v-4k", label: "4K vertical", w: 2160, h: 3840, aspect: "9:16", tier: "4K", channel: "Vertical" },
  { id: "v-1080", label: "1080x1920", w: 1080, h: 1920, aspect: "9:16", tier: "1080p", channel: "Vertical", note: "Shorts, Reels, LinkedIn vertical video." },
  { id: "v-720", label: "720x1280", w: 720, h: 1280, aspect: "9:16", tier: "720p", channel: "Vertical" },
  // feed shapes
  { id: "sq-1080", label: "Square 1080", w: 1080, h: 1080, aspect: "1:1", tier: "1080p", channel: "Feed", note: "LinkedIn square video." },
  { id: "p-1080", label: "Portrait 1080x1350", w: 1080, h: 1350, aspect: "4:5", tier: "1080p", channel: "Feed" },
  // stills for video
  { id: "yt-thumb", label: "YouTube thumbnail", w: 1280, h: 720, aspect: "16:9", tier: "thumbnail", channel: "Still", note: "Under 2MB. Legible at 210x118." },
  { id: "li-thumb", label: "LinkedIn video thumbnail", w: 1920, h: 1080, aspect: "16:9", tier: "thumbnail", channel: "Still" },
  { id: "v-thumb", label: "Vertical cover", w: 1080, h: 1920, aspect: "9:16", tier: "thumbnail", channel: "Still" },
];

export type FrameRole = "thumbnail" | "first" | "last" | "divider" | "lower-third" | "watermark";

export interface FrameKind {
  role: FrameRole;
  label: string;
  description: string;
  layout: "centered" | "stack" | "divider" | "end-card" | "bare";
  defaults: { goldRule: boolean; ctaStyle: "button" | "text" | "none"; align: "left" | "center" };
}

export const FRAME_KINDS: FrameKind[] = [
  {
    role: "thumbnail",
    label: "Thumbnail",
    description: "The still a viewer decides on. Biggest type in the kit, no body copy, one idea.",
    layout: "centered",
    defaults: { goldRule: true, ctaStyle: "none", align: "center" },
  },
  {
    role: "first",
    label: "First frame",
    description: "Frame one of the cut. It must say what this is before a word is spoken.",
    layout: "centered",
    defaults: { goldRule: true, ctaStyle: "none", align: "center" },
  },
  {
    role: "divider",
    label: "Divider frame",
    description: "A section break inside the video. Number it and name the section.",
    layout: "divider",
    defaults: { goldRule: true, ctaStyle: "none", align: "center" },
  },
  {
    role: "lower-third",
    label: "Lower third",
    description: "A name and role strip for the bottom of the frame. Transparent background.",
    layout: "stack",
    defaults: { goldRule: false, ctaStyle: "none", align: "left" },
  },
  {
    role: "last",
    label: "End card",
    description: "The last frame. One action, the mark, and the scope line.",
    layout: "end-card",
    defaults: { goldRule: true, ctaStyle: "button", align: "center" },
  },
  {
    role: "watermark",
    label: "Watermark overlay",
    description: "A transparent PNG to lay over the whole cut in the editor.",
    layout: "bare",
    defaults: { goldRule: false, ctaStyle: "none", align: "left" },
  },
];
