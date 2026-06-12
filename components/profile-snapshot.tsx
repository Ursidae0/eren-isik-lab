import { education, experience, technicalSkills } from "@/lib/projects";

const featuredSkills = [
  ...technicalSkills.programming,
  "NumPy",
  "SciPy",
  "scikit-learn",
  "ROS 2",
  "Raspberry Pi Pico",
  "Docker",
];

export function ProfileSnapshot() {
  const role = experience[0];
  const school = education[0];

  return (
    <section id="about" className="paper-section">
      <div className="section-shell profile-grid">
        <div>
          <p className="section-kicker">About</p>
          <h2 className="profile-lead">
            I like difficult constraints and tangible outcomes.
          </h2>
          <p className="profile-copy">
            I am a computer engineering student at Izmir Institute of
            Technology, drawn to problems where software has to respect
            physics, timing, and noisy real-world data. My work spans real-time
            embedded firmware, signal processing and machine learning,
            numerical simulation, and GPU and parallel computing. Recently I
            rewrote our TEKNOFEST rover&apos;s drive firmware into a 1 kHz
            real-time control loop, and built leakage-safe ML and physics-based
            simulations on the software side. I care about measured results and
            honest evaluation more than big-sounding numbers.
          </p>
          <a
            href="/eren-isik-resume-2026.pdf"
            className="text-link"
            download
          >
            Download full resume <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="profile-aside">
          <div className="profile-block">
            <span className="profile-label">Now</span>
            <h3>
              {role.role}
              <br />
              at {role.organization}
            </h3>
            <p>
              {role.program} · {role.period}
            </p>
          </div>

          <div className="profile-block">
            <span className="profile-label">Education</span>
            <h3>{school.degree}</h3>
            <p>
              {school.institution} · {school.period}
            </p>
          </div>

          <div className="profile-block">
            <span className="profile-label">Working with</span>
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
