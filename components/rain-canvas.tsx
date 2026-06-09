"use client";

import { useEffect, useRef } from "react";

type RainDrop = {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
};

function createDrop(width: number, height: number, randomY = true): RainDrop {
  const opacity = 0.08 + Math.random() * 0.18;

  return {
    x: Math.random() * width,
    y: randomY ? Math.random() * height : -24 - Math.random() * 80,
    length: 9 + Math.random() * 16,
    speed: 150 + Math.random() * 130,
    color: `rgba(180, 214, 199, ${opacity})`,
  };
}

export function RainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!canvas || !context) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const saveData =
      (
        navigator as Navigator & {
          connection?: { saveData?: boolean };
        }
      ).connection?.saveData ?? false;
    const targetFps = isMobile ? 15 : 30;
    const frameInterval = 1000 / targetFps;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let drops: RainDrop[] = [];
    let animationFrame = 0;
    let animationTimer = 0;
    let previousTime = 0;
    let isRunning = false;

    const resetDrops = () => {
      const density = isMobile
        ? Math.min(24, Math.max(14, Math.round(width / 26)))
        : Math.min(64, Math.max(26, Math.round(width / 30)));
      drops = Array.from({ length: density }, () =>
        createDrop(width, height),
      );
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      const pixelRatio = Math.min(
        window.devicePixelRatio || 1,
        isMobile ? 1.25 : 1.5,
      );

      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      resetDrops();
    };

    const drawFrame = (time: number) => {
      if (!isRunning) {
        return;
      }

      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.05);
      previousTime = time;
      context.clearRect(0, 0, width, height);
      context.lineWidth = 0.75;
      context.lineCap = "round";

      for (const drop of drops) {
        context.beginPath();
        context.strokeStyle = drop.color;
        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x + 0.7, drop.y + drop.length);
        context.stroke();

        drop.y += drop.speed * deltaSeconds;

        if (drop.y > height + drop.length) {
          Object.assign(drop, createDrop(width, height, false));
        }
      }

      animationTimer = window.setTimeout(() => {
        animationFrame = window.requestAnimationFrame(drawFrame);
      }, frameInterval);
    };

    const stop = () => {
      isRunning = false;
      window.clearTimeout(animationTimer);
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

    resize();
    start();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", handleEnvironmentChange);
    reducedMotion.addEventListener("change", handleEnvironmentChange);

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleEnvironmentChange);
      reducedMotion.removeEventListener("change", handleEnvironmentChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 opacity-75"
    />
  );
}
