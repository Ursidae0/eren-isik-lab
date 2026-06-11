export function Hero() {
  return (
    <section id="top" className="hero">
      <div className="hero-inner">
        <p className="eyebrow">Robotics and GPU systems engineer</p>

        <h1>
          Building systems
          <br />
          that <em>move.</em>
        </h1>

        <div className="hero-summary">
          <p>
            I design high-performance software where code meets the physical
            world, from real-time rover control to CUDA kernels and edge AI.
          </p>

          <div className="button-row">
            <a href="#projects" className="button-primary">
              Explore my work <span aria-hidden="true">↓</span>
            </a>
            <a href="#contact" className="button-secondary">
              Start a conversation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
