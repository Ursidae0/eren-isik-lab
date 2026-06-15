"use client";

import { Fragment, type ReactNode } from "react";

import { useLanguage } from "@/components/preferences-provider";

function withEmphasis(line: string, emphasis: string): ReactNode {
  if (!emphasis || !line.includes(emphasis)) {
    return line;
  }

  const [before, ...rest] = line.split(emphasis);
  return (
    <>
      {before}
      <em>{emphasis}</em>
      {rest.join(emphasis)}
    </>
  );
}

export function Hero() {
  const { content } = useLanguage();
  const { hero } = content;

  return (
    <section id="top" className="hero">
      <div className="hero-inner">
        <p className="eyebrow">{hero.eyebrow}</p>

        <h1>
          {hero.headlineLines.map((line, index) => (
            <Fragment key={line}>
              {index > 0 ? <br /> : null}
              {withEmphasis(line, hero.headlineEmphasis)}
            </Fragment>
          ))}
        </h1>

        <div className="hero-summary">
          <p>{hero.summary}</p>

          <div className="button-row">
            <a href={hero.primaryCta.href} className="button-primary">
              {hero.primaryCta.label} <span aria-hidden="true">↓</span>
            </a>
            <a href={hero.secondaryCta.href} className="button-secondary">
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
