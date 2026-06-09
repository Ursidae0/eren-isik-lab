const links = [
  { label: "Projects", href: "/#projects" },
  { label: "Resume", href: "/#resume" },
  { label: "Contact", href: "/#mission-control" },
];

export function Navigation() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
      <nav
        aria-label="Primary navigation"
        className="glass-nav mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        <a
          href="/#top"
          className="group flex items-center gap-3"
          aria-label="EI, Eren Isik Lab home"
        >
          <span className="grid size-9 place-items-center rounded-lg border border-terminal/20 bg-terminal/5 font-mono text-sm font-semibold text-terminal shadow-terminal transition-colors group-hover:bg-terminal/10">
            EI
          </span>
          <span className="hidden sm:block">
            <span className="block text-sm font-semibold tracking-tight text-mist-100">
              Eren Isik Lab
            </span>
            <span className="block font-mono text-[10px] tracking-[0.16em] text-mist-600">
              COMPUTE / CONTROL / EDGE
            </span>
          </span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-2 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-mist-300 transition-colors hover:bg-white/5 hover:text-terminal sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.12em] text-mist-600 lg:flex">
          <span className="status-dot" aria-hidden="true" />
          AVAILABLE
        </div>
      </nav>
    </header>
  );
}
