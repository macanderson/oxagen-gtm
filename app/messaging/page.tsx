import { MessageBrowser } from "@/components/message-browser";

export const metadata = { title: "Messaging · Oxagen GTM" };

export default function MessagingPage() {
  return (
    <div className="wrap-wide">
      <p className="eyebrow">Message registry</p>
      <h1>Every line, and what it is allowed to claim.</h1>
      <p className="lede">
        Mirrored from <code>messages/</code> in the house brand kit. Each entry carries the audience it is written for,
        the mandate clause it serves, the scope qualifier a short form has to keep, the evidence the claim needs before
        it runs, and the review findings that shaped it. Retired lines stay visible with their replacement.
      </p>
      <MessageBrowser />
    </div>
  );
}
