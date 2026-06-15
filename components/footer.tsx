"use client";

import { useLanguage } from "@/components/preferences-provider";
import { siteConfig } from "@/lib/site";

export function Footer() {
  const { content } = useLanguage();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>
          © {new Date().getFullYear()} {content.footer.copyrightName}
        </p>
        <div className="flex gap-5">
          <a href={siteConfig.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={siteConfig.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
