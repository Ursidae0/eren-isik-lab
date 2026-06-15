"use client";

import { AtmosphereStatus } from "@/components/atmosphere-control";
import { LanguageToggle } from "@/components/language-toggle";
import { LeafToggle } from "@/components/leaf-toggle";
import { useLanguage } from "@/components/preferences-provider";

export function Navigation() {
  const { content } = useLanguage();
  const { nav } = content;

  return (
    <header className="site-nav-wrap">
      <nav aria-label="Primary navigation" className="site-nav">
        <a
          href="/#top"
          className="site-nav-logo"
          aria-label={nav.homeAriaLabel}
        >
          {nav.logoLabel}
        </a>

        <div className="site-nav-links">
          {nav.links.map((link) => (
            <a key={link.href} href={link.href} className="site-nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="nav-controls">
          <LanguageToggle />
          <LeafToggle />
          <AtmosphereStatus />
        </div>
      </nav>
    </header>
  );
}
