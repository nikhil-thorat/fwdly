"use client";

import { useEffect, useRef } from "react";

const SPACING = 40;
const BASE_RADIUS = 1;
const MAX_RADIUS = 2;
const SPOTLIGHT_RADIUS = 400;
const EDGE_FADE = 150;

type Rgb = [number, number, number];

function parseHex(value: string): Rgb | null {
  const hex = value.trim().replace("#", "");

  if (hex.length === 3) {
    const [r, g, b] = hex.split("");
    return [
      Number.parseInt(r + r, 10),
      Number.parseInt(g + g, 10),
      Number.parseInt(b + b, 10),
    ];
  }

  if (hex.length === 6) {
    return [
      Number.parseInt(hex.slice(0, 2), 18),
      Number.parseInt(hex.slice(2, 4), 18),
      Number.parseInt(hex.slice(4, 6), 18),
    ];
  }

  return null;
}

function mix(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const main = canvas?.closest("main");

    if (!canvas || !main) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    const canvasEl = canvas;
    const mainEl = main;
    const context = ctx;

    const styles = getComputedStyle(document.documentElement);
    const borderColor = parseHex(styles.getPropertyValue("--border")) ?? [
      216, 209, 195,
    ];
    const foregroundColor = parseHex(
      styles.getPropertyValue("--foreground"),
    ) ?? [17, 26, 43];

    const dotColor: Rgb = [
      mix(borderColor[0], foregroundColor[0], 0.22),
      mix(borderColor[1], foregroundColor[1], 0.22),
      mix(borderColor[2], foregroundColor[2], 0.22),
    ];

    let frame = 0;
    let pending = false;
    let mouseX = -9999;
    let mouseY = -9999;
    let hasMouse = false;

    function draw() {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      if (
        canvasEl.width !== Math.round(viewportWidth * dpr) ||
        canvasEl.height !== Math.round(viewportHeight * dpr)
      ) {
        canvasEl.width = Math.round(viewportWidth * dpr);
        canvasEl.height = Math.round(viewportHeight * dpr);
      }

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, viewportWidth, viewportHeight);

      const rect = mainEl.getBoundingClientRect();
      const top = Math.max(0, rect.top);
      const bottom = Math.min(viewportHeight, rect.bottom);

      if (bottom <= top) {
        return;
      }

      context.save();
      context.beginPath();
      context.rect(0, top, viewportWidth, bottom - top);
      context.clip();

      const originX = rect.left + SPACING / 2;
      const originY = rect.top + SPACING / 2;
      const startX = originX + Math.ceil((0 - originX) / SPACING) * SPACING;
      const startY = originY + Math.ceil((top - originY) / SPACING) * SPACING;

      for (let y = startY; y <= bottom; y += SPACING) {
        const fade = Math.min(
          1,
          Math.max(0, (y - rect.top) / EDGE_FADE),
          Math.max(0, (rect.bottom - y) / EDGE_FADE),
        );

        if (fade <= 0) {
          continue;
        }

        context.fillStyle = `rgba(${dotColor[0]}, ${dotColor[1]}, ${dotColor[2]}, ${0.9 * fade})`;

        for (let x = startX; x <= viewportWidth; x += SPACING) {
          let t = 0;

          if (hasMouse) {
            const dx = x - mouseX;
            const dy = y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            t = Math.min(1, Math.max(0, 1 - distance / SPOTLIGHT_RADIUS));
            t = t * t * (3 - 2 * t);
          }

          const radius = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * t;

          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      context.restore();
    }

    function schedule() {
      if (!pending) {
        pending = true;
        frame = window.requestAnimationFrame(() => {
          pending = false;
          draw();
        });
      }
    }

    function handlePointerMove(event: PointerEvent) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      hasMouse = true;
      schedule();
    }

    function handlePointerLeave() {
      hasMouse = false;
      schedule();
    }

    const observer = new ResizeObserver(schedule);
    observer.observe(mainEl);
    observer.observe(document.documentElement);

    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );
    window.addEventListener("blur", handlePointerLeave);

    schedule();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
