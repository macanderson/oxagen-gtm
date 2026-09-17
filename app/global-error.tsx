"use client";

/**
 * Last-resort error screen: the only boundary that still renders when the root
 * layout itself throws, so it has to ship its own <html> and <body>.
 *
 * It also has to exist. Without this file Next prerenders its own built-in
 * default for /_global-error, and on 16.3.1 that export dies with
 * "Cannot read properties of null (reading 'useContext')" and takes the whole
 * build with it. Owning the boundary is the right answer regardless — the
 * built-in default is unstyled and says nothing about where you are.
 *
 * Styles are inline because globals.css is not guaranteed to have loaded by the
 * time this renders.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" data-theme="dark">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#10100F",
          color: "#F2EEE5",
          fontFamily: '"Space Grotesk", Helvetica, Arial, sans-serif',
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: 520, textAlign: "left" }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#9B958A",
            }}
          >
            Oxagen GTM
          </p>
          <h1 style={{ margin: "0 0 12px", fontSize: 28, lineHeight: 1.15 }}>
            This page stopped before it finished.
          </h1>
          <p style={{ margin: "0 0 20px", color: "#9B958A", lineHeight: 1.55 }}>
            Nothing you made was saved to a server, so reloading loses only what
            was on screen. The studios keep their last composition in this
            browser.
          </p>
          {error.digest ? (
            <p
              style={{
                margin: "0 0 20px",
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                fontSize: 12,
                color: "#6E6A62",
              }}
            >
              digest {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#D6962C",
              color: "#10100F",
              border: 0,
              borderRadius: 8,
              padding: "10px 18px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
