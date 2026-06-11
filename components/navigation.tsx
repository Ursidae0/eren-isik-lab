const links = [
  { label: "Work", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/#contact" },
];

export function Navigation() {
  return (
    <header className="site-nav-wrap">
      <nav aria-label="Primary navigation" className="site-nav">
        <a href="/#top" className="site-nav-logo" aria-label="Eren Isik home">
          Eren Isik
        </a>

        <div className="site-nav-links">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="site-nav-link">
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
