"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/", label: "Playbook" },
  { href: "/messaging", label: "Messaging" },
  { href: "/ad-lines", label: "Ad lines" },
  { href: "/studio/banner", label: "Banner studio" },
  { href: "/studio/video", label: "Video studio" },
  { href: "/studio/device", label: "Device shots" },
  { href: "/illustrations", label: "Illustrations" },
  { href: "/textures", label: "Textures" },
  { href: "/library", label: "Media library" },
  { href: "/guidelines", label: "Guidelines" },
];

export function Topbar() {
  const pathname = usePathname() || "/";
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (() => {
      try {
        return localStorage.getItem("ox-gtm-theme");
      } catch {
        return null;
      }
    })();
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function flip() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ox-gtm-theme", next);
    } catch {
      /* private window: the page still renders, the choice just is not remembered */
    }
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          {/* the adaptive mark paints with currentColor, which an <img> cannot inherit, so the theme picks the file */}
          <img className="on-ink" src="/brand/oxagen-lockup-dark.svg" alt="oxagen" />
          <img className="on-paper" src="/brand/oxagen-lockup-light.svg" alt="" aria-hidden="true" />
          <span className="sep">/</span>
          <span className="gtm">GTM</span>
        </Link>
        <nav className="nav">
          {NAV.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} data-active={active}>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="topbar-right">
          <button className="btn btn-sm" onClick={flip} title="Switch the page theme">
            {theme === "dark" ? "Paper" : "Ink"}
          </button>
        </div>
      </div>
    </header>
  );
}
