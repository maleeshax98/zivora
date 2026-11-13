"use client";

// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * ConsistencyBreakText Section for ZIVORA.
 *
 * Cinematic editorial interlude designed to deliberately break the consistency
 * of the standard page flow. Emulates a high-end movie title sequence with
 * extreme asymmetrical and centered alignments, sequential text transitions,
 * GSAP ScrollTrigger pinning, fluid typography, and seamless Lenis integration.
 *
 * Reference: file named "ZIVORA" verbatim.
 */

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface ConsistencyBreakSequence {
  id?: string;
  tag?: string;
  headline: string;
  subline?: string;
  alignment?: "left" | "center" | "right";
}

export interface ConsistencyBreakTextProps {
  sequences?: ConsistencyBreakSequence[];
  className?: string;
}

const DEFAULT_SEQUENCES: ConsistencyBreakSequence[] = [
  {
    id: "seq-1",
    tag: "INTERLUDE 01 // STILLNESS",
    headline: "LIGHT IS NOT PASSIVE",
    subline: "It sculpts form and permanence out of transient shadow.",
    alignment: "left",
  },
  {
    id: "seq-2",
    tag: "INTERLUDE 02 // MONUMENT",
    headline: "ARCHITECTURE IN SILENCE",
    subline: "Spaces defined by geometry, air, and deliberate restraint.",
    alignment: "right",
  },
  {
    id: "seq-3",
    tag: "INTERLUDE 03 // ZIVORA",
    headline: "WHAT TIME LEAVES BEHIND",
    subline: "ZIVORA ARCHIVE — ANALOG DISCIPLINE & TIMELESS MOTION",
    alignment: "center",
  },
];

export function ConsistencyBreakText({
  sequences = DEFAULT_SEQUENCES,
  className,
}: ConsistencyBreakTextProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sequenceRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    const validSequenceEls = sequenceRefs.current
      .slice(0, sequences.length)
      .filter((el): el is HTMLDivElement => el !== null);

    if (validSequenceEls.length === 0) return;

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

        // Accessible fallback: skip pinning and transforms when reduced motion is preferred
        if (reduceMotion) {
          gsap.set(validSequenceEls, {
            clearProps: "all",
            opacity: 1,
            visibility: "visible",
          });
          return;
        }

        const isTouchOrMobile = Boolean(isTouch || isNarrow || !isDesktop);

        // Hide all sequences initially
        gsap.set(validSequenceEls, {
          opacity: 0,
          autoAlpha: 0,
        });

        // Pinning duration scales comfortably with the number of sequences
        // Desktop: 95% viewport height per sequence to ensure unhurried reading
        // Mobile: 70% viewport height per sequence for natural touch-scroll cadence
        const scrollDistancePerSeq = isTouchOrMobile ? 70 : 95;
        const totalScrollDistance = sequences.length * scrollDistancePerSeq;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: `+=${totalScrollDistance}%`,
            pin: true,
            pinSpacing: true,
            scrub: isTouchOrMobile ? 0.6 : 0.9,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Sequence segment duration math
        // Each sequence gets:
        // 1. Smooth Fade-in + translation / subtle scale (0.35)
        // 2. Reading hold / gentle camera push (0.35)
        // 3. Complete Fade-out + rise / scale before the next sequence (0.30)
        // Followed by a brief pause (0.10) between sequences
        const stepIn = 0.35;
        const stepHold = 0.35;
        const stepOut = 0.3;
        const stepPause = 0.1;
        const sequenceTotalDuration = stepIn + stepHold + stepOut;

        validSequenceEls.forEach((el, index) => {
          const startTime = index * (sequenceTotalDuration + stepPause);

          // Step 1: Smooth fade-in (opacity 0 -> 1) with subtle vertical translation and scale
          tl.fromTo(
            el,
            {
              opacity: 0,
              autoAlpha: 0,
              y: isTouchOrMobile ? 20 : 32,
              scale: isTouchOrMobile ? 0.97 : 0.95,
            },
            {
              opacity: 1,
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: stepIn,
              ease: "power2.out",
            },
            startTime,
          );

          // Step 2: Reading hold with gentle cinematic drift / camera push
          tl.to(
            el,
            {
              y: isTouchOrMobile ? -6 : -10,
              scale: isTouchOrMobile ? 1.015 : 1.025,
              duration: stepHold,
              ease: "none",
            },
            startTime + stepIn,
          );

          // Step 3: Complete fade-out (opacity 1 -> 0) before next sequence begins
          tl.to(
            el,
            {
              opacity: 0,
              autoAlpha: 0,
              y: isTouchOrMobile ? -24 : -36,
              scale: isTouchOrMobile ? 1.03 : 1.045,
              duration: stepOut,
              ease: "power2.in",
            },
            startTime + stepIn + stepHold,
          );
        });

        // Subtle buffer at the very end to let the final fade resolve cleanly before unpinning
        tl.to({}, { duration: 0.15 });
      },
    );

    // Refresh ScrollTrigger when web fonts are ready to ensure pin calculations are exact
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
  }, [sequences]);

  return (
    <section
      ref={sectionRef}
      aria-label="Cinematic Editorial Interlude"
      className={cn(
        "relative z-20 flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-background px-6 py-20 text-foreground sm:px-10 md:px-16",
        // Reduced-motion: unpin and render in normal vertical document flow
        "motion-reduce:min-h-0 motion-reduce:py-24",
        className,
      )}
    >
      {/* Screen reader continuous narrative summary */}
      <h2 className="sr-only">
        ZIVORA Editorial Interlude:{" "}
        {sequences.map((s) => `${s.headline}. ${s.subline || ""}`).join(" ")}
      </h2>

      {/* Ambient background watermark to accentuate the movie-title aesthetic */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03] select-none"
      >
        <span className="font-serif text-[clamp(12rem,22vw,30rem)] font-black tracking-tighter uppercase">
          ZIVORA
        </span>
      </div>

      {/* Pinned Stage Container */}
      <div
        ref={stageRef}
        className={cn(
          "relative mx-auto flex h-[100dvh] w-full max-w-7xl items-center justify-center",
          "motion-reduce:h-auto motion-reduce:flex-col motion-reduce:gap-24",
        )}
      >
        {sequences.map((sequence, index) => {
          const alignment = sequence.alignment ?? "center";

          return (
            <div
              key={sequence.id || `seq-${index}`}
              ref={(el) => {
                sequenceRefs.current[index] = el;
              }}
              className={cn(
                // Motion safe: absolute overlay positioned across the 100dvh viewport stage
                "absolute inset-0 flex flex-col justify-center px-4 sm:px-8 md:px-12 will-change-[transform,opacity] transform-gpu",
                // Reduced motion: static block in vertical stack
                "motion-reduce:relative motion-reduce:inset-auto motion-reduce:opacity-100 motion-reduce:visible",
                // Asymmetrical & centered alignments emulating film title sequences
                alignment === "left" &&
                  "items-start text-left md:max-w-3xl md:mr-auto",
                alignment === "right" &&
                  "items-end text-right md:max-w-3xl md:ml-auto",
                alignment === "center" &&
                  "items-center text-center max-w-4xl mx-auto",
              )}
            >
              {/* Striking Bold Editorial Headline */}
              <h3 className="font-serif text-[clamp(2.1rem,1.25rem+4.2vw,5.5rem)] font-light leading-[1.06] tracking-[-0.03em] text-copy-primary text-balance uppercase">
                {sequence.headline}
              </h3>

              {/* High-end Film Subtitle / Descriptor */}
              {sequence.subline ? (
                <p
                  className={cn(
                    "mt-4 font-sans text-[clamp(0.9rem,0.82rem+0.35vw,1.25rem)] font-light leading-relaxed tracking-wide text-copy-secondary text-pretty sm:mt-6",
                    alignment === "left" && "max-w-xl",
                    alignment === "right" && "max-w-xl ml-auto",
                    alignment === "center" && "max-w-2xl mx-auto",
                  )}
                >
                  {sequence.subline}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ConsistencyBreakText;
