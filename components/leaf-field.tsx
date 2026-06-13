"use client";

import { useEffect, useRef } from "react";

import { useAmbient } from "@/components/ambient-provider";
import {
  defaultAmbientConditions,
  getParticleProfile,
  getWindVector,
  type AmbientPhase,
  type AmbientSeason,
  type AmbientWeatherMode,
} from "@/lib/ambient";

type Leaf = {
  x: number;
  y: number;
  size: number;
  speed: number;
  sway: number;
  phase: number;
  phaseSpeed: number;
  rotation: number;
  rotationSpeed: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  color: string;
  opacity: number;
  variant: number;
};

type RainDrop = {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
};

type Snowflake = {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
  opacity: number;
};

const palettes: Record<AmbientPhase | "default", string[]> = {
  dawn: ["#87795f", "#9a8666", "#778062", "#b19a70"],
  day: ["#718263", "#82906d", "#9f986f", "#b0a477"],
  dusk: ["#76694f", "#8f7654", "#6f7555", "#a17d56"],
  night: ["#596e65", "#667b70", "#6f7865", "#7f876d"],
  default: ["#718263", "#82906d", "#9f986f", "#b0a477"],
};
const seasonalPalettes: Partial<Record<AmbientSeason, string[]>> = {
  spring: ["#769468", "#8ca878", "#a4b981", "#66865f"],
  autumn: ["#9b6845", "#b57b48", "#826244", "#c08d55"],
};

function createLeaf(
  width: number,
  height: number,
  colors: string[],
  randomY = true,
): Leaf {
  const size = 12 + Math.random() * 13;

  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -size - Math.random() * 120,
    size,
    speed: 22 + Math.random() * 32,
    sway: 22 + Math.random() * 52,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.28 + Math.random() * 0.34,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.75,
    offsetX: 0,
    offsetY: 0,
    velocityX: 0,
    velocityY: 0,
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: 0.28 + Math.random() * 0.2,
    variant: Math.floor(Math.random() * 3),
  };
}

function createRainDrop(
  width: number,
  height: number,
  intensity: number,
  randomY = true,
): RainDrop {
  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -20 - Math.random() * 100,
    length: 8 + intensity * 13 + Math.random() * (9 + intensity * 10),
    speed: 290 + intensity * 180 + Math.random() * (170 + intensity * 130),
    opacity: 0.14 + intensity * 0.25 + Math.random() * 0.16,
  };
}

function createSnowflake(
  width: number,
  height: number,
  intensity: number,
  randomY = true,
): Snowflake {
  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -8 - Math.random() * 80,
    radius: 1.1 + intensity * 1.2 + Math.random() * (1.7 + intensity),
    speed: 16 + intensity * 12 + Math.random() * (24 + intensity * 14),
    phase: Math.random() * Math.PI * 2,
    opacity: 0.32 + intensity * 0.3 + Math.random() * 0.22,
  };
}

function drawLeaf(
  context: CanvasRenderingContext2D,
  leaf: Leaf,
  x: number,
  y: number,
) {
  const scale = leaf.size / 42;

  context.save();
  context.translate(x, y);
  context.rotate(leaf.rotation);
  context.scale(scale, scale * (leaf.variant === 1 ? 0.82 : 1));
  context.translate(-21, -14);
  context.globalAlpha = leaf.opacity;
  context.fillStyle = leaf.color;
  context.shadowColor = "rgba(17, 30, 22, 0.16)";
  context.shadowBlur = 7;
  context.shadowOffsetY = 4;

  context.beginPath();
  if (leaf.variant === 2) {
    context.moveTo(2, 23);
    context.bezierCurveTo(10, 6, 24, 1, 40, 5);
    context.bezierCurveTo(33, 19, 20, 27, 2, 23);
  } else if (leaf.variant === 1) {
    context.moveTo(3, 27);
    context.bezierCurveTo(5, 12, 16, 3, 38, 1);
    context.bezierCurveTo(36, 16, 24, 27, 3, 27);
  } else {
    context.moveTo(2, 25);
    context.bezierCurveTo(6, 9, 19, 1, 40, 2);
    context.bezierCurveTo(37, 18, 25, 27, 2, 25);
  }
  context.closePath();
  context.fill();

  context.shadowColor = "transparent";
  context.strokeStyle = "rgba(238, 235, 214, 0.42)";
  context.lineWidth = 1.15;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(4, 24);
  context.bezierCurveTo(14, 16, 23, 10, 37, 5);
  context.stroke();
  context.restore();
}

function getParticlePalette(
  phase: AmbientPhase,
  season: AmbientSeason,
  weather: AmbientWeatherMode,
  localWeather: boolean,
) {
  if (!localWeather) {
    return palettes.default;
  }

  if (weather === "snow") {
    return palettes.night;
  }

  const seasonalPalette = seasonalPalettes[season];
  if (seasonalPalette) {
    return seasonalPalette;
  }

  return palettes[phase];
}

export function LeafField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { conditions } = useAmbient();

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!canvas || !context) {
      context?.clearRect(0, 0, canvas?.width ?? 0, canvas?.height ?? 0);
      return;
    }

    const localWeather = conditions.available;
    const activeConditions = localWeather
      ? conditions
      : defaultAmbientConditions;
    const wind = getWindVector(
      activeConditions.windDirectionDeg,
      activeConditions.windSpeedKmh,
    );
    const profile = getParticleProfile(
      localWeather ? activeConditions.weather : "clear",
      activeConditions.precipitationMm,
      activeConditions.windGustKmh,
    );
    const precipitationIntensity = Math.min(
      1,
      activeConditions.precipitationMm / 4,
    );
    const colors = getParticlePalette(
      activeConditions.phase,
      activeConditions.season,
      activeConditions.weather,
      localWeather,
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    const narrowViewport = window.matchMedia("(max-width: 700px)");
    const saveData =
      (
        navigator as Navigator & {
          connection?: { saveData?: boolean };
        }
      ).connection?.saveData ?? false;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let leaves: Leaf[] = [];
    let rain: RainDrop[] = [];
    let snow: Snowflake[] = [];
    let animationFrame = 0;
    let previousTime = performance.now();
    let isRunning = false;
    let pointerX = -1000;
    let pointerY = -1000;
    let pointerActive = false;
    let windClock = 0;

    const resetParticles = () => {
      const baseLeafDensity = narrowViewport.matches ? 9 : 17;
      const precipitationFactor = narrowViewport.matches ? 0.78 : 1;
      const seasonalLeafFactor =
        localWeather && activeConditions.season === "winter" ? 0 : 1;
      const leafDensity =
        profile.leafFactor === 0 || seasonalLeafFactor === 0
          ? 0
          : Math.max(
              4,
              Math.round(
                baseLeafDensity *
                  profile.leafFactor *
                  seasonalLeafFactor,
              ),
            );
      leaves = Array.from(
        { length: leafDensity },
        () => createLeaf(width, height, colors),
      );
      rain = Array.from(
        { length: Math.round(profile.rainDensity * precipitationFactor) },
        () => createRainDrop(width, height, precipitationIntensity),
      );
      snow = Array.from(
        { length: Math.round(profile.snowDensity * precipitationFactor) },
        () => createSnowflake(width, height, precipitationIntensity),
      );
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        narrowViewport.matches ? 1.25 : 1.5,
      );

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      resetParticles();
    };

    const drawFrame = (time: number) => {
      if (!isRunning) {
        return;
      }

      const delta = Math.min((time - previousTime) / 1000, 0.04);
      previousTime = time;
      windClock += delta;
      context.clearRect(0, 0, width, height);

      const gust =
        0.72 +
        Math.sin(windClock * 0.48) * 0.16 +
        Math.sin(windClock * 0.19 + 1.7) * 0.12;
      const windX = wind.x * (34 + profile.turbulence * 28) * gust;
      const windY = Math.max(-8, wind.y * 14);

      for (const leaf of leaves) {
        leaf.x += windX * delta;
        leaf.y += (leaf.speed + windY) * delta;
        leaf.phase +=
          leaf.phaseSpeed * delta * (0.8 + profile.turbulence * 0.4);
        leaf.rotation +=
          (leaf.rotationSpeed + wind.x * profile.turbulence * 0.22) * delta;

        const naturalSway =
          Math.sin(leaf.phase) * leaf.sway +
          Math.sin(leaf.phase * 0.43 + leaf.variant) * leaf.sway * 0.38;

        let forceX = -leaf.offsetX * 11;
        let forceY = -leaf.offsetY * 11;
        const actualX = leaf.x + naturalSway + leaf.offsetX;
        const actualY = leaf.y + leaf.offsetY;

        if (pointerActive && !coarsePointer.matches) {
          const deltaX = actualX - pointerX;
          const deltaY = actualY - pointerY;
          const distance = Math.hypot(deltaX, deltaY);
          const radius = 130;

          if (distance < radius) {
            const strength = Math.pow((radius - distance) / radius, 2) * 900;
            forceX += (deltaX / Math.max(distance, 1)) * strength;
            forceY += (deltaY / Math.max(distance, 1)) * strength;
          }
        }

        leaf.velocityX += forceX * delta;
        leaf.velocityY += forceY * delta;
        const damping = Math.exp(-5.2 * delta);
        leaf.velocityX *= damping;
        leaf.velocityY *= damping;
        leaf.offsetX += leaf.velocityX * delta;
        leaf.offsetY += leaf.velocityY * delta;
        leaf.rotation += leaf.velocityX * delta * 0.006;

        drawLeaf(context, leaf, actualX, actualY);

        const exitedBottom =
          leaf.y + leaf.offsetY > height + leaf.size * 2;
        const exitedSide =
          leaf.x + leaf.offsetX < -180 ||
          leaf.x + leaf.offsetX > width + 180;

        if (exitedBottom || exitedSide) {
          Object.assign(
            leaf,
            createLeaf(width, height, colors, exitedSide && !exitedBottom),
          );

          if (exitedSide && !exitedBottom) {
            leaf.x = wind.x < 0 ? width + 120 : -120;
          }
        }
      }

      context.lineWidth = 1;
      context.lineCap = "round";
      for (const drop of rain) {
        drop.x += windX * 1.7 * delta;
        drop.y += drop.speed * delta;

        context.strokeStyle = "rgb(26 45 44)";
        context.globalAlpha = drop.opacity * 0.34;
        context.lineWidth = 2.2;
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(
          drop.x - wind.x * drop.length * 0.7,
          drop.y - drop.length,
        );
        context.stroke();

        context.strokeStyle = "rgb(222 239 235)";
        context.globalAlpha = drop.opacity;
        context.lineWidth = 0.9;
        context.beginPath();
        context.moveTo(drop.x, drop.y);
        context.lineTo(
          drop.x - wind.x * drop.length * 0.7,
          drop.y - drop.length,
        );
        context.stroke();

        if (
          drop.y > height + drop.length ||
          drop.x < -80 ||
          drop.x > width + 80
        ) {
          Object.assign(
            drop,
            createRainDrop(width, height, precipitationIntensity, false),
          );
        }
      }

      for (const flake of snow) {
        flake.phase += delta * (0.7 + profile.turbulence * 0.4);
        flake.x +=
          (windX * 0.45 + Math.sin(flake.phase) * 12) * delta;
        flake.y += (flake.speed + Math.max(0, windY * 0.4)) * delta;
        context.fillStyle = "rgb(38 55 51)";
        context.globalAlpha = flake.opacity * 0.22;
        context.beginPath();
        context.arc(
          flake.x,
          flake.y,
          flake.radius + 1.4,
          0,
          Math.PI * 2,
        );
        context.fill();

        context.fillStyle = "#fbfcf6";
        context.globalAlpha = flake.opacity;
        context.beginPath();
        context.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        context.fill();

        if (
          flake.y > height + flake.radius ||
          flake.x < -50 ||
          flake.x > width + 50
        ) {
          Object.assign(
            flake,
            createSnowflake(width, height, precipitationIntensity, false),
          );
        }
      }
      context.globalAlpha = 1;

      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    const stop = () => {
      isRunning = false;
      window.cancelAnimationFrame(animationFrame);
    };

    const start = () => {
      if (
        isRunning ||
        reducedMotion.matches ||
        saveData ||
        document.visibilityState !== "visible"
      ) {
        return;
      }

      isRunning = true;
      previousTime = performance.now();
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    const handleEnvironmentChange = () => {
      if (
        reducedMotion.matches ||
        saveData ||
        document.visibilityState !== "visible"
      ) {
        stop();
        context.clearRect(0, 0, width, height);
      } else {
        start();
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerActive = true;
    };

    const handlePointerLeave = () => {
      pointerActive = false;
    };

    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    document.addEventListener("visibilitychange", handleEnvironmentChange);
    reducedMotion.addEventListener("change", handleEnvironmentChange);

    return () => {
      stop();
      context.clearRect(0, 0, width, height);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      document.removeEventListener("visibilitychange", handleEnvironmentChange);
      reducedMotion.removeEventListener("change", handleEnvironmentChange);
    };
  }, [conditions]);

  return <canvas ref={canvasRef} aria-hidden="true" className="leaf-canvas" />;
}
