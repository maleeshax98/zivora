"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface CinematicTextProps {
  phrase?: string;
  className?: string;
}

const DEFAULT_PHRASE =
  "Capturing fleeting light and timeless architectural forms.";

/**
 * CinematicText
 * Scroll-bound pinned editorial statement section for the ZIVORA homepage.
 *
 * Key Capabilities:
 * - Viewport-pinned GSAP ScrollTrigger scrub synchronized with Lenis smooth scroll
 * - Staggered word-by-word reveal with a continuous subtle camera push and clean fade-out before unpinning
 * - Fluid clamp() typography with balanced line wrapping and zero mid-word breaks
 * - Responsive touch/mobile start & end adjustments to prevent scroll trapping
 * - Reduced-motion accessible static presentation without pinning or hidden text
 */
export function CinematicText({
  phrase = DEFAULT_PHRASE,
  className,
}: CinematicTextProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const words = useMemo(
    () => phrase.trim().split(/\s+/).filter(Boolean),
    [phrase]
  );

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const validWords = wordRefs.current
      .slice(0, words.length)
      .filter((el): el is HTMLSpanElement => el !== null);

    if (validWords.length === 0) return;

    let isActive = true;
    const mm = gsap.matchMedia(section);

    mm.add(
      {
        isDesktop: "(min-width: 768px) and (hover: hover) and (pointer: fine)",
        isTouch: "(pointer: coarse), (hover: none)",
        isNarrow: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, isTouch, isNarrow, reduceMotion } =
          context.conditions ?? {};

        if (reduceMotion) {
          gsap.set([stage, ...validWords], {
            clearProps: "opacity,transform",
          });
          return;
        }

        const isTouchOrMobile = Boolean(isTouch || isNarrow || !isDesktop);

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: isTouchOrMobile ? "center center" : "top top",
            end: isTouchOrMobile ? "+=85%" : "+=175%",
            pin: true,
            pinSpacing: true,
            scrub: isTouchOrMobile ? 0.6 : 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Subtle continuous camera push spanning the entire pinned sequence
        tl.fromTo(
          stage,
          {
            scale: isTouchOrMobile ? 0.97 : 0.95,
            y: isTouchOrMobile ? 14 : 24,
          },
          {
            scale: isTouchOrMobile ? 1.02 : 1.04,
            y: isTouchOrMobile ? -10 : -18,
            duration: 2.4,
            ease: "none",
          },
          0
        );

        // Deliberate word-by-word fade-in
        tl.fromTo(
          validWords,
          {
            opacity: 0,
            y: isTouchOrMobile ? 18 : 28,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: { amount: 0.42 },
            ease: "power2.out",
          },
          0
        );

        // Complete fade-out before unpinning
        // tl.to(
        //   validWords,
        //   {
        //     opacity: 0,
        //     y: isTouchOrMobile ? -12 : -20,
        //     duration: 0.5,
        //     stagger: { amount: 0.28 },
        //     ease: "power2.in",
        //   },
        //   1.62
        // );
      }
    );

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => {
        if (isActive) {
          ScrollTrigger.refresh();
        }
      });
    }

    return () => {
      isActive = false;
      mm.revert();
    };
  }, [words]);

  return (
    <section
      ref={sectionRef}
      aria-label="Editorial Statement"
      className={cn(
        "relative z-10 flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-background px-6 py-24 text-foreground sm:px-10 md:px-16",
        className
      )}
    >
      <div
        ref={stageRef}
        className="mx-auto flex w-full max-w-5xl items-center justify-center text-center will-change-transform transform-gpu"
      >
        <h2 className="font-serif text-[clamp(1.75rem,0.9rem+3.6vw,4.375rem)] font-light leading-[1.2] tracking-[-0.02em] text-copy-primary text-balance">
          <span className="sr-only">{phrase}</span>
          <span aria-hidden="true">
            {words.map((word, index) => (
              <React.Fragment key={`${word}-${index}`}>
                <span
                  ref={(el) => {
                    wordRefs.current[index] = el;
                  }}
                  className="inline-block whitespace-nowrap will-change-[transform,opacity] transform-gpu"
                >
                  {word}
                </span>
                {index < words.length - 1 ? " " : null}
              </React.Fragment>
            ))}
          </span>
        </h2>
      </div>
    </section>
  );
}

export default CinematicText;
