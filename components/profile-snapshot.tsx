import { experience, technicalSkills } from "@/lib/projects";

const skillGroups = [
  { label: "Programming", skills: technicalSkills.programming },
  { label: "Libraries", skills: technicalSkills.libraries },
  { label: "Toolchain", skills: technicalSkills.developerTools },
  { label: "Platforms", skills: technicalSkills.platformsAndSystems },
];

export function ProfileSnapshot() {
  const role = experience[0];

  return (
    <section
      id="experience"
      className="relative z-20 px-6 pb-24 sm:px-10 lg:px-12"
    >
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="glass-card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal">
                Current field experience
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-mist-100">
                {role.role} / {role.organization}
              </h2>
              <p className="mt-1 text-sm text-mist-600">{role.program}</p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mist-600">
              {role.period}
            </p>
          </div>

          <ul className="mt-8 space-y-4">
            {role.highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex gap-3 text-sm leading-6 text-mist-300"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-terminal shadow-terminal" />
                {highlight}
              </li>
            ))}
          </ul>
        </article>

        <article className="glass-card p-6 sm:p-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-terminal">
            Technical index
          </p>
          <div className="mt-6 space-y-6">
            {skillGroups.map((group) => (
              <div key={group.label}>
                <h3 className="font-mono text-[10px] uppercase tracking-[0.12em] text-mist-600">
                  {group.label}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 text-xs text-mist-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

