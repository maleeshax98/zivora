"use client";

import React, { useEffect, useRef, useSyncExternalStore } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * CustomMouseCursor
 * Replaces the default pointer with a smooth trailing dot/ring cursor powered by GSAP quickTo.
 * Features:
 * - High performance 60+ FPS trailing ring via gsap.quickTo
 * - Fluid expansion and accent highlighting when hovering interactive elements
 * - Automatically disabled on touch-enabled devices and when reduced motion is preferred
 * - Global CSS class integration that cleanly hides native cursor on desktop
 */
export function CustomCursor() {
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMounted) return;

    // Detect touch-based or non-mouse devices
    const isTouch =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(hover: none)").matches);

    const isReduced = prefersReducedMotion();

    if (isTouch || isReduced) {
      return;
    }

    const container = containerRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;

    if (!container || !dot || !ring) return;

    // Apply global cursor-none styling to body on desktop
    document.documentElement.classList.add("custom-cursor-enabled");

    let isVisible = false;
    let isHovering = false;

    // Initialize GSAP quickTo setters for instant & delayed trailing motion
    const setDotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3" });
    const setDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3" });
    const setRingX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power2.out" });
    const setRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power2.out" });

    // Set initial position offscreen
    gsap.set([dot, ring], {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
      scale: 1,
    });

    const handlePointerMove = (e: PointerEvent) => {
      // Discard touch pointer events
      if (e.pointerType === "touch") return;

      const { clientX, clientY } = e;

      setDotX(clientX);
      setDotY(clientY);
      setRingX(clientX);
      setRingY(clientY);

      if (!isVisible) {
        isVisible = true;
        gsap.to([dot, ring], {
          opacity: 1,
          duration: 0.25,
          ease: "power2.out",
        });
      }
    };

    const handlePointerLeave = () => {
      isVisible = false;
      gsap.to([dot, ring], {
        opacity: 0,
        duration: 0.25,
        ease: "power2.out",
      });
    };

    const handlePointerOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor='pointer'], [data-cursor='expand'], [data-cursor-interactive]"
      );

      if (interactive && !isHovering) {
        isHovering = true;
        gsap.to(ring, {
          scale: 1.85,
          borderColor: "var(--accent)",
          backgroundColor: "rgba(181, 155, 126, 0.12)",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 0.5,
          opacity: 0.6,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    };

    const handlePointerOut = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor='pointer'], [data-cursor='expand'], [data-cursor-interactive]"
      );

      if (interactive && isHovering) {
        // Check if leaving into another interactive element
        const related = e.relatedTarget as HTMLElement | null;
        if (
          related &&
          related.closest(
            "a, button, input, textarea, select, [role='button'], [data-cursor='pointer'], [data-cursor='expand'], [data-cursor-interactive]"
          )
        ) {
          return;
        }

        isHovering = false;
        gsap.to(ring, {
          scale: 1,
          borderColor: "currentColor",
          backgroundColor: "transparent",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 1,
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        });
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    document.addEventListener("pointerover", handlePointerOver, { passive: true });
    document.addEventListener("pointerout", handlePointerOut, { passive: true });

    return () => {
      document.documentElement.classList.remove("custom-cursor-enabled");
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
    };
  }, [isMounted]);

  if (!isMounted) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none"
    >
      {/* Outer Springy Ring */}
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 h-9 w-9 rounded-full border border-copy-primary/60 transition-[border-color,background-color] duration-150 will-change-transform"
      />
      {/* Center Precise Dot */}
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 h-2 w-2 rounded-full bg-accent will-change-transform"
      />
    </div>
  );
}

export default CustomCursor;
