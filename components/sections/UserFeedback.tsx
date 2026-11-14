"use client";

// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * UserFeedback Section for ZIVORA — Cinematic Camera Sequence.
 *
 * Simulates a massive virtual wall holding 5 distinct tactile sticky cards:
 * 1. Initial State (Wide Overview): Shows all 5 sticky cards in the screen simultaneously
 *    so the user takes in the complete moodboard composition.
 * 2. Sequential Dive: As the user scrolls, the camera zooms into each card one by one
 *    (Card 1 -> Card 2 -> Card 3 -> Card 4 -> Card 5), centering each card dead-center
 *    with unhurried reading holds, fluid motion graphic glides, and rack focusing.
 *
 * Integrates flawlessly with Lenis smooth scrolling, dual-theme tokens,
 * and provides an accessible static fallback for prefers-reduced-motion: reduce.
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface FeedbackCardItem {
  id: string;
  tag: string;
  quote: string;
  author: string;
  role: string;
  project: string;
  rotation: number; // organic sticky note rotation in degrees
  coords: {
    // Relative position across the virtual wall (percentages)
    leftPercent: number;
    topPercent: number;
  };
  zoomScale: {
    desktop: number;
    mobile: number;
  };
}

export interface UserFeedbackProps {
  cards?: FeedbackCardItem[];
  className?: string;
}

const DEFAULT_FEEDBACK_CARDS: FeedbackCardItem[] = [
  {
    id: "card-01",
    tag: "VERIFIED COMMISSION // NO. 01",
    quote:
      "ZIVORA captures light not merely as illumination, but as pure spatial architecture. Every frame holds a deliberate stillness and emotional clarity that elevated our retrospective into an enduring legacy.",
    author: "Elena Vance",
    role: "Design Director, Studio Arcos",
    project: "Architectural Retrospective // Milan",
    rotation: -2.2,
    coords: { leftPercent: 18, topPercent: 18 }, // Top-Left Quadrant
    zoomScale: { desktop: 1.05, mobile: 0.96 },
  },
  {
    id: "card-02",
    tag: "EXHIBITION CURATION // NO. 02",
    quote:
      "The analog discipline and pacing in their videography is exceedingly rare today. They understand the weight of negative space and allow brutalist concrete and natural textures to breathe.",
    author: "Julian Thorne",
    role: "Senior Curator, Gallerie Lumière",
    project: "Solo Exhibition // Berlin",
    rotation: 2.4,
    coords: { leftPercent: 62, topPercent: 16 }, // Top-Right Quadrant
    zoomScale: { desktop: 1.05, mobile: 0.96 },
  },
  {
    id: "card-03",
    tag: "EDITORIAL CAMPAIGN // NO. 03",
    quote:
      "A masterclass in shadow, contour, and cinematic restraint. Working with ZIVORA redefined how our ateliers present haute couture and architectural materials in a single unified narrative.",
    author: "Sophie Marchand",
    role: "Creative Director, Atelier Vesper",
    project: "Archival Campaign & Film // Paris",
    rotation: -1.2,
    coords: { leftPercent: 40, topPercent: 44 }, // Center Stage
    zoomScale: { desktop: 1.04, mobile: 0.95 },
  },
  {
    id: "card-04",
    tag: "SPATIAL NARRATIVE // NO. 04",
    quote:
      "Their documentation of our pavilion was not just photography; it was an authentic translation of space, air, and materials into pure poetry. The compositions speak with profound architectural literacy.",
    author: "Marcus Chen",
    role: "Principal Architect, Studio Forma",
    project: "Pavilion Monograph // Tokyo",
    rotation: 1.8,
    coords: { leftPercent: 16, topPercent: 68 }, // Bottom-Left Quadrant
    zoomScale: { desktop: 1.06, mobile: 0.96 },
  },
  {
    id: "card-05",
    tag: "PRINT RETROSPECTIVE // NO. 05",
    quote:
      "In an era of fleeting visual noise, ZIVORA creates imagery that demands unhurried contemplation. Their medium-format prints and deliberate camera movements stay with you long after viewing.",
    author: "Claire Delacroix",
    role: "Editorial Director, Revues d'Art",
    project: "Print Retrospective // London",
    rotation: -1.8,
    coords: { leftPercent: 64, topPercent: 66 }, // Bottom-Right Quadrant
    zoomScale: { desktop: 1.05, mobile: 0.96 },
  },
];

export function UserFeedback({
  cards = DEFAULT_FEEDBACK_CARDS,
  className,
}: UserFeedbackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  // -1 indicates Overview (All cards), 0..4 indicates Card 1..5
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  useEffect(() => {
    const section = sectionRef.current;
    const wall = wallRef.current;
    if (!section || !wall || cards.length === 0) return;

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

        // Accessible static fallback for reduced motion
        if (reduceMotion) {
          gsap.set(wall, { clearProps: "all" });
          cardElementsRef.current.forEach((el) => {
            if (el) gsap.set(el, { clearProps: "all", opacity: 1 });
          });
          return;
        }

        const isMobileOrTouch = Boolean(isTouch || isNarrow || !isDesktop);

        // Transform origin for the virtual wall must strictly be top-left (0,0)
        // so camera offset transformations remain mathematically invariant under scale.
        gsap.set(wall, {
          transformOrigin: "0px 0px",
        });

        // =================================================================
        // CAMERA MATHEMATICS: Invariant Offsets
        // =================================================================

        // Helper 1: Calculate camera state for the Wide Overview (All cards visible)
        const getOverviewCameraState = () => {
          const validCards = cardElementsRef.current.filter(
            (el): el is HTMLDivElement => el !== null
          );
          if (validCards.length === 0) {
            return { x: 0, y: 0, scale: 0.4 };
          }

          let minX = Infinity;
          let maxX = -Infinity;
          let minY = Infinity;
          let maxY = -Infinity;

          validCards.forEach((cardEl) => {
            const left = cardEl.offsetLeft;
            const right = cardEl.offsetLeft + cardEl.offsetWidth;
            const top = cardEl.offsetTop;
            const bottom = cardEl.offsetTop + cardEl.offsetHeight;

            if (left < minX) minX = left;
            if (right > maxX) maxX = right;
            if (top < minY) minY = top;
            if (bottom > maxY) maxY = bottom;
          });

          const clusterWidth = Math.max(maxX - minX, 600);
          const clusterHeight = Math.max(maxY - minY, 500);
          const clusterCenterX = (minX + maxX) / 2;
          const clusterCenterY = (minY + maxY) / 2;

          const vw = window.innerWidth;
          const vh = window.innerHeight;

          // Fit the entire cluster into the viewport with generous aesthetic margins
          // Mobile: 88% width, 80% height; Desktop: 86% width, 78% height
          const marginW = isMobileOrTouch ? 0.88 : 0.86;
          const marginH = isMobileOrTouch ? 0.8 : 0.78;

          const scaleX = (vw * marginW) / clusterWidth;
          const scaleY = (vh * marginH) / clusterHeight;
          const overviewScale = Math.min(scaleX, scaleY, isMobileOrTouch ? 0.42 : 0.52);

          const overviewX = vw / 2 - clusterCenterX * overviewScale;
          const overviewY = vh / 2 - clusterCenterY * overviewScale;

          return { x: overviewX, y: overviewY, scale: overviewScale };
        };

        // Helper 2: Calculate camera state for close-up focus on card index i
        const getCardCameraState = (index: number) => {
          const cardEl = cardElementsRef.current[index];
          const cardData = cards[index];
          if (!cardEl || !cardData) {
            return { x: 0, y: 0, scale: 1 };
          }

          const targetScale = isMobileOrTouch
            ? cardData.zoomScale.mobile
            : cardData.zoomScale.desktop;

          const cardCenterX = cardEl.offsetLeft + cardEl.offsetWidth / 2;
          const cardCenterY = cardEl.offsetTop + cardEl.offsetHeight / 2;

          const vw = window.innerWidth;
          const vh = window.innerHeight;

          // ScreenX = WallX + cardCenterX * targetScale = vw / 2
          // -> WallX = vw / 2 - cardCenterX * targetScale
          const targetX = vw / 2 - cardCenterX * targetScale;
          const targetY = vh / 2 - cardCenterY * targetScale;

          return { x: targetX, y: targetY, scale: targetScale };
        };

        // Position camera immediately at the Wide Overview showing all cards
        const initialOverview = getOverviewCameraState();
        gsap.set(wall, {
          x: initialOverview.x,
          y: initialOverview.y,
          scale: initialOverview.scale,
        });

        // In overview, all 5 cards are crisp and visible
        cardElementsRef.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, {
            opacity: 1,
            filter: "blur(0px)",
          });
        });

        // =================================================================
        // MASTER SCROLLTRIGGER TIMELINE: Overview -> Card 1 -> ... -> Card 5
        // =================================================================
        const masterTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // Pin across 460% viewport scroll on desktop, 360% on touch for unhurried pacing
            end: isMobileOrTouch ? "+=360%" : "+=460%",
            pin: true,
            pinSpacing: true,
            scrub: isMobileOrTouch ? 0.6 : 0.85,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (!isActive) return;
              const p = self.progress;

              // Determine active step for telemetry HUD:
              // 0.00 -> 0.16: Overview (-1)
              // 0.16 -> 0.33: Card 1 (0)
              // 0.33 -> 0.50: Card 2 (1)
              // 0.50 -> 0.67: Card 3 (2)
              // 0.67 -> 0.84: Card 4 (3)
              // 0.84 -> 1.00: Card 5 (4)
              let currentStep = -1;
              if (p < 0.16) {
                currentStep = -1;
              } else if (p < 0.33) {
                currentStep = 0;
              } else if (p < 0.5) {
                currentStep = 1;
              } else if (p < 0.67) {
                currentStep = 2;
              } else if (p < 0.84) {
                currentStep = 3;
              } else {
                currentStep = 4;
              }

              setActiveStepIndex((prev) =>
                prev !== currentStep ? currentStep : prev
              );
            },
          },
        });

        // Phase 0: Establishing shot reading hold (all cards visible together)
        masterTimeline.to(
          wall,
          {
            scale: () => getOverviewCameraState().scale * 1.015,
            duration: 0.3,
            ease: "sine.inOut",
          },
          "overview-hold"
        );

        // Phase 1: Dive in from Overview into Card 1
        const card1State = () => getCardCameraState(0);
        masterTimeline.to(
          wall,
          {
            x: () => card1State().x,
            y: () => card1State().y,
            scale: () => card1State().scale,
            duration: 0.75,
            ease: "power2.inOut",
          },
          "dive-to-card-0"
        );

        // Background cards rack-focus dimming as camera zooms into Card 1
        cardElementsRef.current.forEach((el, idx) => {
          if (!el) return;
          if (idx !== 0) {
            masterTimeline.to(
              el,
              {
                opacity: 0.38,
                filter: "blur(1.5px)",
                duration: 0.5,
                ease: "power1.out",
              },
              "dive-to-card-0+=0.2"
            );
          }
        });

        // Reading hold on Card 1
        masterTimeline.to(
          wall,
          {
            scale: () => getCardCameraState(0).scale * 1.012,
            duration: 0.3,
            ease: "sine.inOut",
          },
          "card-0-hold"
        );

        // Phase 2 to 5: Sequential transitions from Card i to Card i + 1
        for (let i = 0; i < cards.length - 1; i++) {
          const fromCard = cardElementsRef.current[i];
          const toCard = cardElementsRef.current[i + 1];
          const nextIndex = i + 1;

          // Camera flight: Accelerate out of current card and ease into next card
          masterTimeline.to(
            wall,
            {
              x: () => getCardCameraState(nextIndex).x,
              y: () => getCardCameraState(nextIndex).y,
              scale: () => getCardCameraState(nextIndex).scale,
              duration: 0.8,
              ease: "power2.inOut",
            },
            `flight-${i}-to-${nextIndex}`
          );

          // Rack-focus: dim previous card, focus and brighten incoming card
          if (fromCard) {
            masterTimeline.to(
              fromCard,
              {
                opacity: 0.38,
                filter: "blur(1.5px)",
                duration: 0.45,
                ease: "power1.out",
              },
              `flight-${i}-to-${nextIndex}`
            );
          }

          if (toCard) {
            masterTimeline.to(
              toCard,
              {
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.55,
                ease: "power2.in",
              },
              `flight-${i}-to-${nextIndex}+=0.25`
            );
          }

          // Reading hold on the newly centered card
          masterTimeline.to(
            wall,
            {
              scale: () => getCardCameraState(nextIndex).scale * 1.012,
              duration: 0.3,
              ease: "sine.inOut",
            },
            `card-${nextIndex}-hold`
          );
        }

        return () => {
          isActive = false;
        };
      }
    );

    // Refresh ScrollTrigger once fonts load so offsetLeft / offsetWidth are pixel-exact
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (isActive) {
          ScrollTrigger.refresh();
        }
      });
    }

    return () => {
      mm.revert();
    };
  }, [cards]);

  return (
    <section
      ref={sectionRef}
      id="feedback"
      aria-label="User Feedback & Client Testimonials"
      className={cn(
        "relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-background select-none",
        // Fallback for reduced motion: regular vertical document flow
        "motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:py-24",
        className
      )}
    >
      {/* ============================================================== */}
      {/* CINEMATIC CAMERA VIEWFINDER HUD (Fixed in Viewport)            */}
      {/* ============================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-5 sm:p-8 md:p-12 text-copy-secondary/50 motion-reduce:hidden"
      >
        {/* Top Viewfinder Bar */}
        <div className="flex items-center justify-between font-mono text-[10px] sm:text-xs uppercase tracking-[0.26em]">
          <div className="flex items-center gap-2.5">
            <span className="inline-block w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-copy-primary font-semibold">CAM-A // REC</span>
            <span className="hidden sm:inline text-copy-secondary/40">|</span>
            <span className="hidden sm:inline">35MM ANAMORPHIC</span>
          </div>

          <div className="flex items-center gap-2">
            <span>SEQUENCE</span>
            <span className="text-brand font-semibold">
              {activeStepIndex === -1 ? (
                "[ ALL / 05 ] — OVERVIEW"
              ) : (
                `[ 0${activeStepIndex + 1} / 0${cards.length} ]`
              )}
            </span>
          </div>
        </div>

        {/* Framing Crosshairs & Framing Bracket Boundaries */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
          {/* Subtle Center Reticle */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="w-full h-px bg-copy-secondary/70" />
            <div className="h-full w-px bg-copy-secondary/70 absolute" />
            <div className="w-3 h-3 rounded-full border border-copy-secondary/70 absolute" />
          </div>

          {/* Corner Framing Brackets */}
          <div className="absolute inset-7 sm:inset-12 md:inset-16 border border-copy-secondary/15 pointer-events-none" />
        </div>

        {/* Bottom Viewfinder Bar: Telemetry & Interactive Progress Dots */}
        <div className="flex items-end justify-between font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em]">
          <div className="flex flex-col gap-1">
            <span className="text-copy-primary/70">
              {activeStepIndex === -1
                ? "VIRTUAL WALL // OVERVIEW SHOT"
                : "VIRTUAL WALL // 240VW × 240VH"}
            </span>
            <span className="text-[9px] sm:text-[10px] text-copy-secondary/50">
              {activeStepIndex === -1
                ? "SCROLL TO DIVE IN ONE BY ONE"
                : "CONTINUOUS CAMERA FLIGHT"}
            </span>
          </div>

          {/* Sequence Position Indicators: [ALL] dot + 5 Card dots */}
          <div className="flex items-center gap-2">
            {/* Overview / All Cards Pill */}
            <span
              title="Overview"
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 font-mono text-[8px] flex items-center justify-center",
                activeStepIndex === -1
                  ? "w-8 bg-brand shadow-xs text-background font-bold"
                  : "w-2 bg-surface-border/80"
              )}
            />

            {/* Individual Card Dots */}
            {cards.map((card, idx) => (
              <span
                key={card.id}
                title={`Card ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  activeStepIndex === idx
                    ? "w-6 bg-brand shadow-xs"
                    : "w-1.5 bg-surface-border/80"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* THE VIRTUAL WALL CANVAS (240vw by 240vh Plane)                 */}
      {/* Panned, scaled, and translated via GSAP ScrollTrigger camera   */}
      {/* ============================================================== */}
      <div
        ref={wallRef}
        className={cn(
          "absolute top-0 left-0 w-[240vw] h-[240vh] min-w-[2000px] min-h-[1600px] will-change-transform",
          // Background wall texture & architectural grid lines
          "bg-background text-foreground transition-colors duration-500",
          // Reduced motion: fallback to natural centered document flow
          "motion-reduce:static motion-reduce:w-full motion-reduce:h-auto motion-reduce:min-w-0 motion-reduce:min-h-0 motion-reduce:transform-none"
        )}
      >
        {/* Subtle Architectural Grid Lines & Markings on the Virtual Wall */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-20 motion-reduce:hidden"
        >
          {/* Vertical Coordinate Grid Lines */}
          <div className="absolute top-0 left-[20%] w-px h-full bg-surface-border/50" />
          <div className="absolute top-0 left-[50%] w-px h-full bg-surface-border/70" />
          <div className="absolute top-0 left-[80%] w-px h-full bg-surface-border/50" />

          {/* Horizontal Coordinate Grid Lines */}
          <div className="absolute top-[20%] left-0 w-full h-px bg-surface-border/50" />
          <div className="absolute top-[50%] left-0 w-full h-px bg-surface-border/70" />
          <div className="absolute top-[80%] left-0 w-full h-px bg-surface-border/50" />

          {/* Ambient Wall Stamps & Architectural Markers */}
          <div className="absolute top-[10%] left-[8%] font-mono text-xs tracking-[0.3em] uppercase text-copy-secondary/40">
            WALL MOODBOARD // TESTIMONIAL CONSTELLATION
          </div>
          <div className="absolute top-[48%] left-[6%] font-mono text-xs tracking-[0.3em] uppercase text-copy-secondary/40">
            ZIVORA ARCHIVE // 35MM CINEMATIC SEQUENCE
          </div>
          <div className="absolute top-[90%] left-[45%] font-mono text-xs tracking-[0.3em] uppercase text-copy-secondary/40">
            CAMERA ORIGIN // MOTION GRAPHIC INTERLUDE
          </div>
        </div>

        {/* ============================================================ */}
        {/* ASYMMETRICALLY SCATTERED STICKY CARDS (5 Focal Points)       */}
        {/* ============================================================ */}
        <div className="relative w-full h-full motion-reduce:max-w-4xl motion-reduce:mx-auto motion-reduce:px-6 motion-reduce:space-y-12">
          {cards.map((card, idx) => (
            <div
              key={card.id}
              ref={(el) => {
                cardElementsRef.current[idx] = el;
              }}
              style={{
                // Position card at non-overlapping coordinates across the virtual wall
                left: `${card.coords.leftPercent}%`,
                top: `${card.coords.topPercent}%`,
                transform: `rotate(${card.rotation}deg)`,
              }}
              className={cn(
                // Positioning & Geometry on the canvas
                "absolute w-[84vw] sm:w-[440px] md:w-[480px] lg:w-[520px]",
                // Reduced motion: standard in-flow card block
                "motion-reduce:static motion-reduce:w-full motion-reduce:rotate-0",
                // Sticky Card Tactile Styling
                "rounded-none bg-surface p-6 sm:p-8 md:p-10",
                "border border-surface-border/90",
                // Deep layered drop shadow for authentic physical lift off the wall
                "shadow-[0_18px_45px_rgba(41,40,36,0.14)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.58)]",
                "transition-[background-color,border-color,opacity,filter] duration-500",
                "will-change-transform"
              )}
            >
              {/* Simulated Translucent Tape Strip Pinned at Top Center */}
              <div
                aria-hidden="true"
                className={cn(
                  "absolute -top-3 left-1/2 -translate-x-1/2 w-24 sm:w-32 h-5 sm:h-6",
                  "bg-surface-subtle/80 backdrop-blur-[2px]",
                  "border-t border-b border-surface-border/70",
                  "rotate-[-1.2deg] shadow-xs pointer-events-none select-none",
                  "opacity-95"
                )}
              />

              {/* Card Header: Editorial Tag & Rating Glyph */}
              <div className="flex items-center justify-between border-b border-surface-border/50 pb-3.5 mb-5">
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] text-copy-secondary">
                  {card.tag}
                </span>
                <span className="font-mono text-[10px] sm:text-xs tracking-[0.2em] text-brand">
                  ✦ ✦ ✦ ✦ ✦
                </span>
              </div>

              {/* Testimonial Quote */}
              <blockquote className="space-y-4 mb-6">
                <p className="font-serif italic text-copy-primary text-[clamp(1rem,0.85rem+0.8vw,1.45rem)] leading-[1.45] text-balance">
                  &ldquo;{card.quote}&rdquo;
                </p>
              </blockquote>

              {/* Card Footer: Attribution & Project Details */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between pt-3.5 border-t border-surface-border/50 gap-2 sm:gap-0">
                <div>
                  <cite className="not-italic block font-serif font-medium text-copy-primary text-sm sm:text-base">
                    {card.author}
                  </cite>
                  <span className="block font-sans text-xs text-copy-secondary mt-0.5">
                    {card.role}
                  </span>
                </div>

                <div className="text-left sm:text-right">
                  <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-[0.16em] text-copy-secondary/80">
                    {card.project}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UserFeedback;
