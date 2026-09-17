import { VideoStudio } from "@/components/video-studio";

export const metadata = { title: "Video studio · Oxagen GTM" };

export default function VideoStudioPage() {
  return (
    <div className="wrap-wide">
      <p className="eyebrow">Video studio</p>
      <h1>A frame kit for one cut.</h1>
      <p className="lede">
        Build the stills a video needs: the thumbnail a viewer decides on, the first frame, numbered divider cards for
        the sections, a lower third, an end card, and a transparent watermark to lay over the whole cut. Choose 16:9 or
        9:16 and a resolution from 6K down to 720p, then export the kit as one zip your editor can drop in.
      </p>
      <VideoStudio />
    </div>
  );
}
