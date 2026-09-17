import { MediaLibrary } from "@/components/media-library";
import media from "@/data/media.json";

export const metadata = { title: "Media library · Oxagen GTM" };

export default function LibraryPage() {
  return (
    <div className="wrap-wide">
      <p className="eyebrow">Media library</p>
      <h1>Everything the brand has already made.</h1>
      <p className="lede">
        {media.count} files mirrored from the house brand kit: campaign ads in four placements, social images, content
        cards, wallpapers, wordmarks, icons and badges. Vectors are the originals. If you need a size that is not here,
        generate it in a studio rather than stretching one of these.
      </p>
      <MediaLibrary />
    </div>
  );
}
