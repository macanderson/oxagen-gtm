import type { Metadata } from "next";
import "./globals.css";
import { Topbar } from "@/components/topbar";

export const metadata: Metadata = {
  title: "Oxagen GTM playbook",
  description:
    "The go-to-market playbook for Oxagen: the message registry, the ad library, the media library, and the studios that generate banners, video frames, device shots, illustrations and textures.",
  icons: { icon: "/brand/oxagen-favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script
          // Theme is a per-viewer convenience. Read before paint so the page never flashes.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ox-gtm-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        <div className="shell">
          <Topbar />
          <main className="main">{children}</main>
          <footer className="footer">
            <div className="footer-inner">
              <span>
                Oxagen GTM playbook. Copy is governed by the message registry in{" "}
                <code>oxagenai/oxagen-brand</code>; when this site and the registry disagree, the registry wins.
              </span>
              <span>Mission Control for an autonomous agent workforce.</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
