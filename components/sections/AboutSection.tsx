"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { CldImageWrapper } from "@/components/cloudinary-image";
import { cn } from "@/lib/utils";
import {
  cinematicEase,
  gsap,
  prefersReducedMotion,
  ScrollTrigger,
} from "@/lib/gsap";

export interface AboutSectionProps {
  greeting?: string;
  roleText?: string;
  ctaText?: string;
  ctaHref?: string;
  paragraphs?: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: string;
  className?: string;
}

const DEFAULT_PORTRAIT_URL =
  "https://res.cloudinary.com/pso8u1zy/image/upload/v1794707520/ggu1avmmko3s07ptylre.jpg";

const DEFAULT_PARAGRAPHS = [
  "Based between metropolitan architectures and quiet coastal landscapes, my work explores the interplay of natural light, raw texture, and human presence.",
  "With an editorial approach rooted in analog discipline, I craft deliberate still imagery and cinematic motion that translate fleeting moments into lasting visual memories.",
];

function resolveCloudName(src: string): string {
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

/**
 * AboutSection
 * 3-Column editorial "About Me" section for the ZIVORA homepage.
 *
 * Layout:
 * - Desktop/Tablet: 3 columns aligned items-center and distributed justify-between:
 *   1. Left: Sharp-edged portrait image container (zero border-radius: rounded-none).
 *   2. Middle: Large editorial typography ("Hi, I'm Sazii. A photographer and a video grapher.")
 *      with a minimalist "view works" button directly below.
 *   3. Right: Refined descriptive text block detailing creative background.
 * - Mobile: Fluidly collapses into a single, vertically stacked, center-aligned column.
 *
 * Motion & Pinned Hold:
 * - Staggered entrance animation as the section scrolls into view (top 80%).
 * - Pinned ScrollTrigger hold at "top top" keeping the user inside the section for a
 *   deliberate, unhurried reading duration before releasing to the next section.
 * - Subtle camera breathing zoom on the portrait and a hairline progress indicator during the hold.
 * - Accessible static fallback under prefers-reduced-motion: reduce with zero pinning.
 */
export function AboutSection({
  greeting = "Hi, I'm Sazii.",
  roleText = "A photographer and a video grapher.",
  ctaText = "view works",
  ctaHref = "/works",
  paragraphs = DEFAULT_PARAGRAPHS,
  imageUrl = DEFAULT_PORTRAIT_URL,
  imageAlt = "Editorial portrait of Sazii — photographer and videographer",
  imageWidth = 800,
  imageHeight = 1000,
  aspectRatio = "4 / 5",
  className,
}: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const imageColRef = useRef<HTMLDivElement>(null);
  const middleColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const imageCol = imageColRef.current;
    const middleCol = middleColRef.current;
    const rightCol = rightColRef.current;
    const figure = figureRef.current;
    const progressBar = progressBarRef.current;

    if (!section || !imageCol || !middleCol || !rightCol) return;

    const columns = [imageCol, middleCol, rightCol];

    if (prefersReducedMotion()) {
      gsap.set(columns, { opacity: 1, y: 0, clearProps: "all" });
      return;
    }

    let isActive = true;
    const mm = gsap.matchMedia(section);

    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce)",
        allowMotion: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { reduceMotion } = context.conditions ?? {};

        if (reduceMotion) {
          gsap.set(columns, { clearProps: "opacity,transform" });
          if (figure) gsap.set(figure, { clearProps: "transform" });
          if (progressBar) gsap.set(progressBar, { clearProps: "transform" });
          return;
        }

        // 1. Staggered entrance animation as the section scrolls into view
        gsap.fromTo(
          columns,
          {
            opacity: 0,
            y: 28,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.15,
            ease: cinematicEase,
            clearProps: "transform",
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              once: true,
              invalidateOnRefresh: true,
            },
          },
        );

        // 2. Pinned hold: Keep the user in the About section for a while before releasing to the next section
        const pinDistance = Math.round(window.innerHeight * 1.0);

        const pinTl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${pinDistance}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        // Subtle, tactile breathing zoom on the portrait during the pinned reading hold
        if (figure) {
          pinTl.fromTo(
            figure,
            { scale: 1 },
            { scale: 1.035, ease: "none", duration: 1 },
            0,
          );
        }

        // Subtle progress indicator tracking the hold duration
        if (progressBar) {
          pinTl.fromTo(
            progressBar,
            { scaleX: 0 },
            { scaleX: 1, ease: "none", duration: 1 },
            0,
          );
        }
      },
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
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-labelledby="about-heading"
      className={cn(
        "relative z-20 flex w-full border-t border-surface-border/70 bg-background text-foreground",
        "motion-safe:h-[100dvh] motion-safe:min-h-[100dvh] motion-safe:flex-col motion-safe:justify-between motion-safe:overflow-hidden",
        "motion-reduce:min-h-[80dvh] motion-reduce:py-20",
        className,
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col justify-between px-6 pt-14 pb-6 sm:px-8 sm:pt-16 sm:pb-8 md:px-10 md:pt-16 md:pb-10 lg:px-12">
        {/* 3-Column Layout: Portrait (Left) | Greeting & CTA (Middle) | Background Copy (Right) */}
        <div className="my-auto flex w-full flex-col items-center justify-between gap-8 sm:gap-10 md:flex-row md:items-center md:gap-6 lg:gap-10 xl:gap-14">
          {/* Left Column: Sharp-edged portrait image (strictly rounded-none) */}
          <div
            ref={imageColRef}
            className="flex w-full shrink-0 justify-center md:w-[26%] lg:w-[26%] xl:w-[24%] md:justify-start"
          >
            <figure
              ref={figureRef}
              className="m-0 w-full max-w-[200px] overflow-hidden rounded-none border border-surface-border/70 bg-surface-subtle shadow-none will-change-transform sm:max-w-[240px] md:max-w-none"
            >
              <CldImageWrapper
                src={imageUrl}
                alt={imageAlt}
                width={imageWidth}
                height={imageHeight}
                aspectRatio={aspectRatio}
                sizes="(max-width: 767px) 70vw, (max-width: 1024px) 26vw, 320px"
                config={{
                  cloud: {
                    cloudName: resolveCloudName(imageUrl),
                  },
                }}
                wrapperClassName="w-full rounded-none"
                className="h-full w-full rounded-none object-cover object-center transition-transform duration-700 ease-out hover:scale-[1.02] motion-reduce:transition-none motion-reduce:hover:scale-100"
              />
            </figure>
          </div>

          {/* Middle Column: Large editorial typography greeting + minimalist 'view works' button */}
          <div
            ref={middleColRef}
            className="flex w-full shrink-0 flex-col items-center justify-center gap-5 text-center sm:gap-6 md:w-[42%] lg:w-[40%] xl:w-[38%]"
          >
            <h2
              id="about-heading"
              className="font-serif text-[clamp(1.75rem,1.25rem+1.6vw,2.875rem)] font-light leading-[1.18] tracking-[-0.015em] text-copy-primary text-balance"
            >
              {greeting}
              <span className="mt-2 block font-serif text-[clamp(1.2rem,0.9rem+1.1vw,1.875rem)] font-light leading-[1.25] text-copy-secondary">
                {roleText === "A photographer and a video grapher." ? (
                  <>
                    A photographer and a{" "}
                    <span className="italic text-brand font-serif">
                      video grapher
                    </span>
                    .
                  </>
                ) : (
                  roleText
                )}
              </span>
            </h2>

            <div>
              <Link
                href={ctaHref}
                data-cursor="expand"
                className="inline-flex min-h-11 items-center justify-center rounded-none border border-copy-primary/40 px-8 py-3.5 font-mono text-xs uppercase tracking-[0.22em] text-copy-primary transition-all duration-300 ease-out hover:border-copy-primary hover:bg-copy-primary hover:text-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring active:scale-[0.98] motion-reduce:transition-none"
              >
                {ctaText}
              </Link>
            </div>
          </div>

          {/* Right Column: Refined descriptive text block explaining creative background */}
          <div
            ref={rightColRef}
            className="flex w-full shrink-0 flex-col items-center gap-3.5 text-center md:w-[26%] lg:w-[26%] xl:w-[24%] md:items-start md:text-left"
          >
            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="font-sans text-[clamp(0.85rem,0.8rem+0.18vw,0.95rem)] leading-relaxed text-copy-secondary text-pretty"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
