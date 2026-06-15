"use client";

import { useLanguage } from "@/components/preferences-provider";
import {
  getEducation,
  getExperience,
  getTechnicalSkills,
} from "@/lib/projects";

export function ProfileSnapshot() {
  const { content, locale } = useLanguage();
  const { about } = content;
  const role = getExperience(locale)[0];
  const school = getEducation(locale)[0];
  const featuredSkills = [
    ...getTechnicalSkills(locale).programming,
    ...about.featuredSkills,
  ];

  return (
    <section id="about" className="paper-section">
      <div className="section-shell profile-grid">
        <div>
          <p className="section-kicker">{about.kicker}</p>
          <h2 className="profile-lead">{about.lead}</h2>
          <p className="profile-copy">{about.bio}</p>
          <a href={about.resumeHref} className="text-link" download>
            {about.resumeLabel} <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="profile-aside">
          <div className="profile-block">
            <span className="profile-label">{about.nowLabel}</span>
            <h3>
              {role.role}
              <br />
              {about.atPreposition} {role.organization}
            </h3>
            <p>
              {role.program} · {role.period}
            </p>
          </div>

          <div className="profile-block">
            <span className="profile-label">{about.educationLabel}</span>
            <h3>{school.degree}</h3>
            <p>
              {school.institution} · {school.period}
            </p>
          </div>

          <div className="profile-block">
            <span className="profile-label">{about.workingWithLabel}</span>
            <div className="skill-list">
              {featuredSkills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
