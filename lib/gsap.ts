import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });
}

/**
 * Checks whether the user has requested reduced motion.
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

gsap.config({
  nullTargetWarn: false,
});

export const cinematicEase = "power2.out";
export const cinematicDuration = 0.8;

/**
 * Cinematic fade & subtle rise entrance animation respecting reduced-motion preferences.
 */
export function animateEntrance(
  target: gsap.DOMTarget,
  options: gsap.TweenVars = {}
) {
  if (prefersReducedMotion()) {
    return gsap.fromTo(
      target,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        ease: "none",
        ...options,
      }
    );
  }

  return gsap.fromTo(
    target,
    {
      opacity: 0,
      y: 24,
    },
    {
      opacity: 1,
      y: 0,
      duration: cinematicDuration,
      ease: cinematicEase,
      clearProps: "transform",
      ...options,
    }
  );
}

/**
 * Cinematic stagger entrance for card grids, gallery items, and editorial content.
 */
export function animateStagger(
  targets: gsap.DOMTarget,
  options: gsap.TweenVars = {}
) {
  if (prefersReducedMotion()) {
    return gsap.fromTo(
      targets,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
        ease: "none",
        ...options,
      }
    );
  }

  return gsap.fromTo(
    targets,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.08,
      ease: cinematicEase,
      clearProps: "transform",
      ...options,
    }
  );
}

export { gsap, ScrollTrigger };
