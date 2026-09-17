import { Composer } from "@/components/composer";
import { AD_SIZES, FIELD_GUIDE } from "@/lib/presets";

export const metadata = { title: "Banner studio · Oxagen GTM" };

export default function BannerStudio() {
  return (
    <div className="wrap-wide">
      <p className="eyebrow">Banner studio</p>
      <h1>Any message, on any placement.</h1>
      <p className="lede">
        Pick the placement, write the four copy fields, choose a layout and a texture, and export. Nothing here invents
        a claim: the line library only offers lines the registry backs or this playbook drafted, and the qualifier field
        keeps the scope attached to a control claim.
      </p>

      <details className="card" style={{ margin: "18px 0 24px" }}>
        <summary style={{ cursor: "pointer", color: "var(--text)", fontWeight: 500 }}>
          What each copy field is called, and what it is for
        </summary>
        <table className="table" style={{ marginTop: 14 }}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Also called</th>
              <th>Rule</th>
            </tr>
          </thead>
          <tbody>
            {FIELD_GUIDE.map((f) => (
              <tr key={f.field}>
                <td style={{ color: "var(--text)", fontWeight: 500, whiteSpace: "nowrap" }}>{f.field}</td>
                <td className="dim">{f.alias}</td>
                <td>{f.rule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <Composer mode="banner" sizes={AD_SIZES} storageKey="ox-gtm-banner" filenamePrefix="oxagen-ad" />
    </div>
  );
}
