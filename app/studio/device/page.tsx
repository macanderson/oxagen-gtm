import { Composer } from "@/components/composer";
import { AD_SIZES } from "@/lib/presets";
import { DeviceNote } from "@/components/device-note";

export const metadata = { title: "Device shots · Oxagen GTM" };

export default function DeviceStudio() {
  return (
    <div className="wrap-wide">
      <p className="eyebrow">Device shots</p>
      <h1>The app, in the hardware a buyer uses.</h1>
      <p className="lede">
        Real screenshots of Oxagen, composited into a generic laptop, desktop, tablet, phone, or plain browser chrome.
        The frames carry no maker's badge, so nothing in the image claims an endorsement.
      </p>
      <DeviceNote />
      <Composer
        mode="device"
        sizes={AD_SIZES}
        storageKey="ox-gtm-device"
        filenamePrefix="oxagen-device"
        initial={{
          layout: "device",
          eyebrow: "",
          headline: "Mission Control for your autonomous agents.",
          body: "",
          cta: "",
          ctaStyle: "none",
          qualifier: "",
          goldRule: false,
          texture: "vignette",
        }}
      />
    </div>
  );
}
