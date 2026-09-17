import { IllustrationGrid } from "@/components/illustration-grid";

export const metadata = { title: "Illustrations · Oxagen GTM" };

export default function IllustrationsPage() {
  return (
    <div className="wrap-wide">
      <p className="eyebrow">Line drawings</p>
      <h1>The mechanism, drawn.</h1>
      <p className="lede">
        An agent asking, a rule answering, a mandate, a meter row, a fleet. Even-weight line work with one gold accent
        per drawing, built to sit beside the type in a product explainer rather than decorate it. Every drawing is a
        vector and takes the page theme.
      </p>
      <IllustrationGrid />
    </div>
  );
}
