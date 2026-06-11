import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <p>© {new Date().getFullYear()} Eren Isik</p>
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
