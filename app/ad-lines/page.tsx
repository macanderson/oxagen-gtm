import { AdLines } from "@/components/ad-lines";
import adlines from "@/data/adlines.json";

export const metadata = { title: "Ad lines · Oxagen GTM" };

export default function AdLinesPage() {
  return (
    <div className="wrap">
      <p className="eyebrow">Short form</p>
      <h1>Lines that fit a headline field.</h1>
      <p className="lede">
        {adlines.note} Sorted by the audience that owns the mandate clause the line speaks to. Send any of them straight
        into the banner studio.
      </p>
      <AdLines />

      <div className="card" style={{ marginTop: 40, borderStyle: "dashed" }}>
        <h3>{adlines.cannotWrite.title}</h3>
        <p className="small">{adlines.cannotWrite.reason}</p>
        <ul className="small dim" style={{ paddingLeft: 18 }}>
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
