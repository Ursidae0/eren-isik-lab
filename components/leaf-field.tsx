"use client";

import { useEffect, useRef } from "react";

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

const colors = ["#718263", "#82906d", "#9f986f", "#b0a477"];

function createLeaf(width: number, height: number, randomY = true): Leaf {
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

export function LeafField() {
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
    let animationFrame = 0;
    let previousTime = performance.now();
    let isRunning = false;
    let pointerX = -1000;
    let pointerY = -1000;
    let pointerActive = false;

    const resetLeaves = () => {
      const density = narrowViewport.matches ? 9 : 17;
      leaves = Array.from({ length: density }, () =>
        createLeaf(width, height),
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
      resetLeaves();
    };

    const drawFrame = (time: number) => {
      if (!isRunning) {
        return;
      }

      const delta = Math.min((time - previousTime) / 1000, 0.04);
      previousTime = time;
      context.clearRect(0, 0, width, height);

      for (const leaf of leaves) {
        leaf.y += leaf.speed * delta;
        leaf.phase += leaf.phaseSpeed * delta;
        leaf.rotation += leaf.rotationSpeed * delta;

        const wind =
          Math.sin(leaf.phase) * leaf.sway +
          Math.sin(leaf.phase * 0.43 + leaf.variant) * leaf.sway * 0.38;

        let forceX = -leaf.offsetX * 11;
        let forceY = -leaf.offsetY * 11;
        const actualX = leaf.x + wind + leaf.offsetX;
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

        if (
          leaf.y + leaf.offsetY > height + leaf.size * 2 ||
          leaf.x + leaf.offsetX < -160 ||
          leaf.x + leaf.offsetX > width + 160
        ) {
          Object.assign(leaf, createLeaf(width, height, false));
        }
      }

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
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      document.removeEventListener("visibilitychange", handleEnvironmentChange);
      reducedMotion.removeEventListener("change", handleEnvironmentChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="leaf-canvas"
    />
  );
}
