"use client";

// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * UserFeedback Section for ZIVORA — Cinematic Camera Sequence.
 *
 * Simulates a massive virtual wall holding responsive tactile sticky cards:
 * 1. Initial State (Wide Overview): Shows all sticky cards in the screen simultaneously
 *    so the user takes in the complete moodboard composition.
 * 2. Sequential Dive: As the user scrolls, the camera zooms into each card one by one
 *    (Card 1 -> Card 2 -> ...), centering each card dead-center with unhurried reading holds,
 *    fluid motion graphic glides, and rack focusing.
 *
 * Responsively adapts coordinates, camera bounding box, timeline duration, and viewfinder
 * telemetry based on the number of feedback items (1 to 5).
 *
 * Integrates flawlessly with Lenis smooth scrolling, dual-theme tokens,
 * and provides an accessible static fallback for prefers-reduced-motion: reduce.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface FeedbackCardItem {
  id: string;
  tag?: string;
  quote: string;
  author: string;
  role?: string;
  project?: string;
  imageUrl?: string;
  rotation?: number; // organic sticky note rotation in degrees
  coords?: {
    // Relative position across the virtual wall (percentages)
    leftPercent: number;
    topPercent: number;
  };
  zoomScale?: {
    desktop: number;
    mobile: number;
  };
}

export interface UserFeedbackProps {
  cards?: FeedbackCardItem[];
  className?: string;
}

interface ResponsiveLayoutSlot {
  coords: { leftPercent: number; topPercent: number };
  rotation: number;
  zoomScale: { desktop: number; mobile: number };
}

// Organic layout presets based on the exact count of cards (1 to 5)
// ensuring balanced composition without voids or overlapping cards.
const RESPONSIVE_LAYOUT_PRESETS: Record<number, ResponsiveLayoutSlot[]> = {
  1: [
    {
      coords: { leftPercent: 38, topPercent: 36 },
      rotation: -1.2,
      zoomScale: { desktop: 1.06, mobile: 0.96 },
    },
  ],
  2: [
    {
      coords: { leftPercent: 24, topPercent: 36 },
      rotation: -2.2,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 56, topPercent: 42 },
      rotation: 2.4,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
  ],
  3: [
    {
      coords: { leftPercent: 22, topPercent: 26 },
      rotation: -2.2,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 58, topPercent: 28 },
      rotation: 2.4,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 40, topPercent: 58 },
      rotation: -1.2,
      zoomScale: { desktop: 1.04, mobile: 0.95 },
    },
  ],
  4: [
    {
      coords: { leftPercent: 20, topPercent: 22 },
      rotation: -2.2,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 60, topPercent: 20 },
      rotation: 2.4,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 20, topPercent: 64 },
      rotation: 1.8,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 60, topPercent: 62 },
      rotation: -1.8,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
  ],
  5: [
    {
      coords: { leftPercent: 18, topPercent: 18 },
      rotation: -2.2,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 62, topPercent: 16 },
      rotation: 2.4,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 40, topPercent: 44 },
      rotation: -1.2,
      zoomScale: { desktop: 1.04, mobile: 0.95 },
    },
    {
      coords: { leftPercent: 16, topPercent: 68 },
      rotation: 1.8,
      zoomScale: { desktop: 1.06, mobile: 0.96 },
    },
    {
      coords: { leftPercent: 64, topPercent: 66 },
      rotation: -1.8,
      zoomScale: { desktop: 1.05, mobile: 0.96 },
    },
  ],
};

function resolveCloudName(src: string): string {
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

function isCloudinaryUrl(src: string): boolean {
  return /^https?:\/\/res\.cloudinary\.com\//i.test(src);
}

export function UserFeedback({ cards = [], className }: UserFeedbackProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const cardElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  // -1 indicates Overview (All cards), 0..N indicates Card 1..N
  const [activeStepIndex, setActiveStepIndex] = useState<number>(-1);

  // Normalize and apply responsive layout presets up to 5 cards
  const activeCards = useMemo(() => {
    if (!cards || cards.length === 0) return [];
    const total = Math.min(cards.length, 5);
    const slots =
      RESPONSIVE_LAYOUT_PRESETS[total] || RESPONSIVE_LAYOUT_PRESETS[5];

    return cards.slice(0, 5).map((card, idx) => {
      const slot = slots[idx] || slots[0];
      return {
        ...card,
        coords: card.coords || slot.coords,
        rotation:
          typeof card.rotation === "number" ? card.rotation : slot.rotation,
        zoomScale: card.zoomScale || slot.zoomScale,
      };
    });
  }, [cards]);

  useEffect(() => {
    const section = sectionRef.current;
    const wall = wallRef.current;
    if (!section || !wall || activeCards.length === 0) return;

    cardElementsRef.current = cardElementsRef.current.slice(0, activeCards.length);

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
        const totalCards = activeCards.length;

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
            (el): el is HTMLDivElement => el !== null,
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

          const clusterWidth = Math.max(maxX - minX, 520);
          const clusterHeight = Math.max(maxY - minY, 400);
          const clusterCenterX = (minX + maxX) / 2;
          const clusterCenterY = (minY + maxY) / 2;

          const vw = window.innerWidth;
          const vh = window.innerHeight;

          // Fit the cluster into viewport with generous aesthetic margins
          const marginW = isMobileOrTouch ? 0.88 : 0.86;
          const marginH = isMobileOrTouch ? 0.8 : 0.78;

          const scaleX = (vw * marginW) / clusterWidth;
          const scaleY = (vh * marginH) / clusterHeight;

          // Responsive overview cap based on count so 1-2 cards don't look tiny
          const maxOverviewScale =
            totalCards <= 1
              ? isMobileOrTouch
                ? 0.7
                : 0.85
              : totalCards <= 2
                ? isMobileOrTouch
                  ? 0.6
                  : 0.72
                : totalCards <= 3
                  ? isMobileOrTouch
                    ? 0.5
                    : 0.6
                  : isMobileOrTouch
                    ? 0.42
                    : 0.52;

          const overviewScale = Math.min(scaleX, scaleY, maxOverviewScale);

          const overviewX = vw / 2 - clusterCenterX * overviewScale;
          const overviewY = vh / 2 - clusterCenterY * overviewScale;

          return { x: overviewX, y: overviewY, scale: overviewScale };
        };

        // Helper 2: Calculate camera state for close-up focus on card index i
        const getCardCameraState = (index: number) => {
          const cardEl = cardElementsRef.current[index];
          const cardData = activeCards[index];
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

        // In overview, all cards are crisp and visible
        cardElementsRef.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, {
            opacity: 1,
            filter: "blur(0px)",
          });
        });

        // =================================================================
        // MASTER SCROLLTRIGGER TIMELINE: Responsive Duration & Steps
        // =================================================================
        const scrollEnd = isMobileOrTouch
          ? totalCards <= 1
            ? "+=180%"
            : totalCards <= 2
              ? "+=280%"
              : totalCards <= 3
                ? "+=320%"
                : "+=360%"
          : totalCards <= 1
            ? "+=240%"
            : totalCards <= 2
              ? "+=360%"
              : totalCards <= 3
                ? "+=410%"
                : "+=460%";

        const masterTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: scrollEnd,
            pin: true,
            pinSpacing: true,
            scrub: isMobileOrTouch ? 0.6 : 0.85,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (!isActive) return;
              const p = self.progress;

              // Telemetry tracking: first fraction is Overview,
              // remaining scroll progress is divided evenly across all cards.
              if (p < 0.08) {
                setActiveStepIndex(-1);
              } else {
                const cardProgress = (p - 0.08) / 0.92;
                const step = Math.min(
                  totalCards - 1,
                  Math.max(0, Math.floor(cardProgress * totalCards)),
                );
                setActiveStepIndex((prev) => (prev !== step ? step : prev));
              }
            },
          },
        });

        // Phase 0: Establishing shot reading hold (all cards visible together)
        masterTimeline.to(
          wall,
          {
            scale: () => getOverviewCameraState().scale * 1.015,
            duration: 0.35,
            ease: "sine.inOut",
          },
          "overview-hold",
        );

        if (totalCards > 0) {
          // Phase 1: Dive in from Overview into Card 0
          const card0State = () => getCardCameraState(0);
          masterTimeline.to(
            wall,
            {
              x: () => card0State().x,
              y: () => card0State().y,
              scale: () => card0State().scale,
              duration: 0.75,
              ease: "power2.inOut",
            },
            "dive-to-card-0",
          );

          // Background cards rack-focus dimming as camera zooms into Card 0
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
                "dive-to-card-0+=0.2",
              );
            }
          });

          // Reading hold on Card 0
          masterTimeline.to(
            wall,
            {
              scale: () => getCardCameraState(0).scale * 1.012,
              duration: 0.35,
              ease: "sine.inOut",
            },
            "card-0-hold",
          );

          // Phase 2..N: Sequential transitions between cards
          for (let i = 0; i < totalCards - 1; i++) {
            const fromCard = cardElementsRef.current[i];
            const toCard = cardElementsRef.current[i + 1];
            const nextIndex = i + 1;

            masterTimeline.to(
              wall,
              {
                x: () => getCardCameraState(nextIndex).x,
                y: () => getCardCameraState(nextIndex).y,
                scale: () => getCardCameraState(nextIndex).scale,
                duration: 0.8,
                ease: "power2.inOut",
              },
              `flight-${i}-to-${nextIndex}`,
            );

            if (fromCard) {
              masterTimeline.to(
                fromCard,
                {
                  opacity: 0.38,
                  filter: "blur(1.5px)",
                  duration: 0.45,
                  ease: "power1.out",
                },
                `flight-${i}-to-${nextIndex}`,
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
                `flight-${i}-to-${nextIndex}+=0.25`,
              );
            }

            masterTimeline.to(
              wall,
              {
                scale: () => getCardCameraState(nextIndex).scale * 1.012,
                duration: 0.35,
                ease: "sine.inOut",
              },
              `card-${nextIndex}-hold`,
            );
          }

          // Gentle exit hold on the final card before releasing pin
          masterTimeline.to(
            wall,
            {
              duration: 0.25,
            },
            "exit-hold",
          );
        }

        return () => {
          isActive = false;
        };
      },
    );

    // Refresh ScrollTrigger across the entire page once layout settles
    ScrollTrigger.refresh();
    const rafId = requestAnimationFrame(() => {
      if (isActive) {
        ScrollTrigger.refresh();
      }
    });

    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (isActive) {
          ScrollTrigger.refresh();
        }
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      mm.revert();
    };
  }, [activeCards]);

  if (!activeCards || activeCards.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="feedback"
      aria-label="User Feedback & Client Testimonials"
      className={cn(
        "relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-background select-none",
        // Fallback for reduced motion: regular vertical document flow
        "motion-reduce:h-auto motion-reduce:min-h-0 motion-reduce:py-24",
        className,
      )}
    >
      {/* ============================================================== */}
      {/* CINEMATIC CAMERA VIEWFINDER HUD (Fixed in Viewport)            */}
      {/* ============================================================== */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 flex flex-col justify-between p-5 sm:p-8 md:p-12 text-copy-secondary/50 motion-reduce:hidden"
      >
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
          {/* Sequence Position Indicators: [ALL] pill + Card dots */}
          <div className="flex items-center gap-2">
            {/* Overview / All Cards Pill */}
            <span
              title="Overview"
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 font-mono text-[8px] flex items-center justify-center",
                activeStepIndex === -1
                  ? "w-8 bg-brand shadow-xs text-background font-bold"
                  : "w-2 bg-surface-border/80",
              )}
            />

            {/* Individual Card Dots */}
            {activeCards.map((card, idx) => (
              <span
                key={card.id}
                title={`Card ${idx + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  activeStepIndex === idx
                    ? "w-6 bg-brand shadow-xs"
                    : "w-1.5 bg-surface-border/80",
                )}
              />
            ))}
          </div>

          {/* Dynamic Sequence Telemetry Readout */}
          <div className="text-right text-copy-secondary/80 font-mono text-[10px] sm:text-xs tracking-[0.2em]">
            {activeStepIndex === -1
              ? `[ ALL / ${String(activeCards.length).padStart(2, "0")} ] — OVERVIEW`
              : `[ ${String(activeStepIndex + 1).padStart(2, "0")} / ${String(activeCards.length).padStart(2, "0")} ] — ${activeCards[activeStepIndex]?.author || "FOCAL"}`}
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
          "motion-reduce:static motion-reduce:w-full motion-reduce:h-auto motion-reduce:min-w-0 motion-reduce:min-h-0 motion-reduce:transform-none",
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
        {/* ASYMMETRICALLY SCATTERED STICKY CARDS                        */}
        {/* ============================================================ */}
        <div className="relative w-full h-full motion-reduce:max-w-4xl motion-reduce:mx-auto motion-reduce:px-6 motion-reduce:space-y-12">
          {activeCards.map((card, idx) => (
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
                "will-change-transform",
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
                  "opacity-95",
                )}
              />

              {/* Card Header: Editorial Tag & Rating Glyph */}
              <div className="flex items-center justify-between border-b border-surface-border/50 pb-3.5 mb-5">
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.22em] text-copy-secondary">
                  {card.tag ||
                    `FEEDBACK // NO. ${String(idx + 1).padStart(2, "0")}`}
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

              {/* Card Footer: Attribution & Image */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between pt-3.5 border-t border-surface-border/50 gap-3">
                <div className="flex items-center gap-3">
                  {card.imageUrl ? (
                    <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0 overflow-hidden rounded-full border border-surface-border/80 bg-surface-subtle">
                      {isCloudinaryUrl(card.imageUrl) ? (
                        <CldImage
                          src={card.imageUrl}
                          alt={card.author}
                          width={56}
                          height={56}
                          config={{
                            cloud: {
                              cloudName: resolveCloudName(card.imageUrl),
                            },
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Image
                          src={card.imageUrl}
                          alt={card.author}
                          width={56}
                          height={56}
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ) : null}
                  <div>
                    <cite className="not-italic block font-serif font-medium text-copy-primary text-sm sm:text-base">
                      {card.author}
                    </cite>
                    {card.role ? (
                      <span className="block font-sans text-xs text-copy-secondary mt-0.5">
                        {card.role}
                      </span>
                    ) : null}
                  </div>
                </div>

                {card.project ? (
                  <div className="text-left sm:text-right">
                    <span className="block font-mono text-[10px] sm:text-xs uppercase tracking-[0.16em] text-copy-secondary/80">
                      {card.project}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UserFeedback;
