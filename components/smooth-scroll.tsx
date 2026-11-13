"use client";

import React, { createContext, useContext, useEffect, useRef } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

interface LenisContextValue {
  getLenis: () => Lenis | null;
}

const LenisContext = createContext<LenisContextValue>({
  getLenis: () => null,
});

export function useLenis() {
  return useContext(LenisContext);
}

interface SmoothScrollProps {
  children: React.ReactNode;
}

export function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Accessibility check: do not initialize smooth scroll if user prefers reduced motion
    if (prefersReducedMotion()) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      syncTouch: false, // Preserves native touch scrolling and gesture handling on mobile devices
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;

    // Synchronize Lenis scroll progress with GSAP ScrollTrigger on every GSAP tick
    const unsubscribeScroll = lenis.on("scroll", ScrollTrigger.update);
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    let isCleanedUp = false;
    const teardownLenis = () => {
      if (isCleanedUp) return;
      isCleanedUp = true;
      gsap.ticker.remove(updateLenis);
      unsubscribeScroll();
      lenis.destroy();
      lenisRef.current = null;
    };

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        teardownLenis();
      }
    };

    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
      teardownLenis();
    };
  }, []);

  const contextValue = React.useMemo<LenisContextValue>(
    () => ({
      getLenis: () => lenisRef.current,
    }),
    []
  );

  return (
    <LenisContext.Provider value={contextValue}>
      {children}
    </LenisContext.Provider>
  );
}
