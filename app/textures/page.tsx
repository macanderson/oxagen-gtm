import { TextureGrid } from "@/components/texture-grid";

export const metadata = { title: "Textures · Oxagen GTM" };

export default function TexturesPage() {
  return (
    <div className="wrap-wide">
      <p className="eyebrow">Backgrounds</p>
      <h1>Surfaces that stay under the headline.</h1>
      <p className="lede">
        Each texture is drawn by code, so it renders at 300x250 and at 6144x3456 without a stretched pixel. They are
        held at low contrast on purpose: a background that competes with the line is a background that failed.
      </p>
      <TextureGrid />
    </div>
  );
}
