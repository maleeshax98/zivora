"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion, cinematicEase } from "@/lib/gsap";
import { CldImageWrapper } from "@/components/cloudinary-image";

export interface HeroImageItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  category?: string;
  aspectRatio?: string;
}

export interface HeroSectionProps {
  title?: string;
  eyebrow?: string;
  description?: string;
  items?: HeroImageItem[];
  scrollTarget?: string;
  className?: string;
}

/**
 * Extracts Cloudinary cloud name safely from a Cloudinary URL or falls back to env/default.
 */
function resolveCloudName(url: string): string {
  const match = url.match(/cloudinary\.com\/([^/]+)\//);
  return (
    match?.[1] || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy"
  );
}

/**
 * HeroSection
 * Redesigned ZIVORA landing hero section featuring:
 * 1. Sequential GSAP Master Timeline:
 *    - Step 1: Letter-by-letter blur-to-clear reveal of 'ZIVORA'
 *    - Step 2: Entrance of the horizontal image line (fade + vertical translation / scale-up)
 *    - Step 3: Fade-in of the anchoring descriptive text block
 * 2. Asymmetrical Desktop/Tablet Layout:
 *    - Top Left: Large fluid 'ZIVORA' brand title
 *    - Mid-Left: Dynamically calculated horizontal image line fitting the viewport width
 *    - Bottom Right: Well-balanced anchoring editorial text block
 * 3. Centered & Stacked Mobile Layout:
 *    - Centered headline and description text with horizontal scroll / responsive fit image line below
 * 4. Dual-Theme Design Tokens:
 *    - Warm Light (#EAE6DF) and Cinematic Dark (#20211F) with zero pure black or pure white
 * 5. Media Integration (`CldImage` via shared `CldImageWrapper`):
 *    - Strict 3:4 aspect ratio containers with skeleton loading and zero CLS
 */
export function HeroSection({
  title = "ZIVORA",
  description = "Capturing architectural stillness and fleeting light through intentional frames. An editorial archive of contemporary spaces, material forms, and cinematic narratives.",
  items = [],
  className,
}: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleContainerRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const imageLineContainerRef = useRef<HTMLDivElement>(null);
  const imageRowRef = useRef<HTMLDivElement>(null);
  const imageItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const descRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  // Split title into individual letter characters
  const letters = useMemo(() => title.split(""), [title]);

  // Active items from props
  const activeItems = useMemo(() => {
    return items ?? [];
  }, [items]);

  // Responsive card dimension states
  const [metrics, setMetrics] = useState<{
    cardWidth: number;
    gap: number;
    visibleCount: number;
  }>({
    cardWidth: 220,
    gap: 20,
    visibleCount: 4, // SSR default
  });

  // Calculate dynamic image count and dimensions based on viewport & container width
  const updateLayoutMetrics = useCallback(() => {
    if (typeof window === "undefined") return;

    const windowWidth = window.innerWidth;
    const isMobile = windowWidth < 768;
    const isTablet = windowWidth >= 768 && windowWidth < 1024;

    const cardWidth = isMobile ? 140 : isTablet ? 190 : 230;
    const gap = isMobile ? 12 : isTablet ? 16 : 20;

    // Measure available container width or compute from window margins
    const container = imageRowRef.current || imageLineContainerRef.current;
    const availableWidth = container
      ? container.clientWidth
      : isMobile
        ? windowWidth - 32
        : isTablet
          ? windowWidth - 64
          : windowWidth - 128;

    // Dynamically calculate exact number of full images that fit the available width (capped at 6)
    const exactFit =
      activeItems.length > 0
        ? Math.max(
            1,
            Math.min(
              6,
              activeItems.length,
              Math.floor((availableWidth + gap) / (cardWidth + gap)),
            ),
          )
        : 0;

    setMetrics({
      cardWidth,
      gap,
      visibleCount: exactFit,
    });
  }, [activeItems.length]);

  // Handle ResizeObserver and window resize
  useEffect(() => {
    updateLayoutMetrics();

    let resizeObserver: ResizeObserver | null = null;
    const rowEl = imageRowRef.current || imageLineContainerRef.current;

    if (typeof ResizeObserver !== "undefined" && rowEl) {
      resizeObserver = new ResizeObserver(() => {
        updateLayoutMetrics();
      });
      resizeObserver.observe(rowEl);
    }

    window.addEventListener("resize", updateLayoutMetrics, { passive: true });

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateLayoutMetrics);
    };
  }, [updateLayoutMetrics]);

  // Orchestrate Master GSAP Sequential Timeline
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Filter valid element refs
    const validLetters = letterRefs.current.filter(
      Boolean,
    ) as HTMLSpanElement[];
    const validImageItems = imageItemRefs.current.filter(
      Boolean,
    ) as HTMLDivElement[];
    const descElement = descRef.current;

    const ctx = gsap.context(() => {
      const isReduced = prefersReducedMotion();

      // If user prefers reduced motion, render in final state without blur or transforms
      if (isReduced) {
        gsap.set(
          [...validLetters, ...validImageItems, descElement].filter(Boolean),
          {
            opacity: 1,
            filter: "none",
            clearProps: "all",
          },
        );
        hasAnimatedRef.current = true;
        return;
      }

      // If entrance animation has already completed in this session, keep items visible
      if (hasAnimatedRef.current) {
        gsap.set(
          [...validLetters, ...validImageItems, descElement].filter(Boolean),
          {
            opacity: 1,
            filter: "none",
            clearProps: "filter,transform",
          },
        );
        return;
      }

      // =========================================================================
      // MASTER ENTRANCE TIMELINE
      // Step 1: Title Reveal (Blur to Clear)
      // Step 2: Image Line Reveal (once title has come into clear focus)
      // Step 3: Description Reveal (fades in, anchoring the composition)
      // =========================================================================
      const masterTl = gsap.timeline({
        defaults: { ease: cinematicEase },
        onComplete: () => {
          hasAnimatedRef.current = true;
        },
      });

      // Step 1: Staggered Blur-to-Clear Title Reveal
      if (validLetters.length > 0) {
        masterTl.fromTo(
          validLetters,
          {
            opacity: 0,
            filter: "blur(10px)",
            y: 18,
          },
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 0.85,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "filter,transform",
          },
        );
      }

      // Step 2: Horizontal Image Line Reveal
      if (validImageItems.length > 0) {
        masterTl.fromTo(
          validImageItems,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            ease: "sine.inOut",
            clearProps: "transform",
          },
          "+=0.05", // Triggers right as title completes clear focus
        );
      }

      // Step 3: Anchoring Description Reveal
      if (descElement) {
        masterTl.fromTo(
          descElement,
          {
            opacity: 0,
          },
          {
            opacity: 1,
            ease: "sine.inOut",
            clearProps: "transform",
          },
          "-=0.15", // Concludes sequence as image line settles
        );
      }
    }, section);

    return () => ctx.revert();
  }, [letters.length, metrics.visibleCount, activeItems]);

  // Display items:
  // On desktop/tablet, slice to the exact calculated count fitting the viewport (capped at 6).
  // On mobile (< 768px), allow up to 4 items in a touch-friendly horizontal scroll track
  // to prevent overflow while giving mobile users fluid swipe access.
  const isMobileViewport =
    typeof window !== "undefined" ? window.innerWidth < 768 : false;
  const displayedItems = activeItems.slice(
    0,
    isMobileViewport
      ? Math.min(activeItems.length, 4)
      : Math.min(6, metrics.visibleCount),
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Immersive Hero Section"
      className={cn(
        "relative flex min-h-[100dvh] w-full flex-col justify-center md:justify-between overflow-hidden bg-background text-foreground select-none",
        "pt-24 sm:pt-28 md:pt-32 lg:pt-36",
        "pb-10 sm:pb-12 md:pb-14",
        "px-6 sm:px-10 lg:px-16 xl:px-20",
        className,
      )}
    >
      {/* =========================================================================
          1. BRAND HEADLINE (ZIVORA)
          Desktop/Tablet: Top Left fluid brand text
          Mobile: Centered brand headline
         ========================================================================= */}
      <div className="w-full md:flex justify-center md:justify-start text-center md:text-left order-1">
        <h1
          ref={titleContainerRef}
          aria-label={title}
          className="w-full flex items-center justify-center md:justify-start font-sans font-bold uppercase tracking-tight text-copy-primary leading-[0.82] text-5xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem] 2xl:text-[13rem] text-center md:text-left mx-auto md:mx-0"
        >
          {letters.map((char, idx) => (
            <span
              key={idx}
              ref={(el) => {
                letterRefs.current[idx] = el;
              }}
              data-cursor="expand"
              className="inline-block transform-gpu will-change-[filter,opacity,transform] cursor-default transition-colors duration-200 hover:text-brand"
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </h1>
      </div>

      {/* =========================================================================
          2. ANCHORING DESCRIPTION TEXT BLOCK
          Desktop/Tablet: Bottom Right (md:order-3, md:mt-auto, md:text-right)
          Mobile: Centered and stacked directly below the headline (order-2)
         ========================================================================= */}
      <div
        ref={descRef}
        className={cn(
          "w-full flex flex-col transition-opacity",
          // Mobile: centered directly beneath headline (order-2)
          "order-2 items-center text-center mt-4 sm:mt-6",
          // Desktop: bottom-right aligned anchoring the composition (order-3)
          "md:order-3 md:items-end md:text-right md:mt-auto md:pt-10",
        )}
      >
        <div className="flex flex-col gap-2.5 sm:gap-3 max-w-md lg:max-w-lg">
          <p className="font-sans text-xs md:text-sm ">{description}</p>
        </div>
      </div>

      {/* =========================================================================
          3. RESPONSIVE HORIZONTAL IMAGE LINE
          Desktop/Tablet: Mid-Left below title (md:order-2, md:mt-10 lg:mt-12)
          Mobile: Positioned directly below the centered text (order-3, mt-6 sm:mt-8)
         ========================================================================= */}
      <div
        ref={imageLineContainerRef}
        className={cn(
          "w-full",
          // Mobile: below the centered text (order-3)
          "order-3 mt-6 sm:mt-8",
          // Desktop: mid-left below title (order-2)
          "md:order-2 md:mt-10 lg:mt-12",
        )}
      >
        <div
          ref={imageRowRef}
          className={cn(
            "flex w-full items-center",
            // Mobile: centered or horizontally scrollable if overflowing
            "justify-center",
            "overflow-x-auto no-scrollbar touch-pan-x py-2 -mx-2 px-2",
          )}
          style={{
            gap: `${metrics.gap}px`,
          }}
        >
          {displayedItems.map((item, idx) => (
            <div
              key={item.id}
              ref={(el) => {
                imageItemRefs.current[idx] = el;
              }}
              data-cursor="expand"
              className="group relative shrink-0 overflow-hidden rounded-none border border-surface-border/70 bg-surface-subtle shadow-sm transition-all duration-300 hover:border-brand/70"
              style={{
                width: `${metrics.cardWidth}px`,
                aspectRatio: item.aspectRatio || "3 / 4",
              }}
            >
              <CldImageWrapper
                src={item.src}
                alt={item.alt}
                aspectRatio={item.aspectRatio || "3 / 4"}
                width={460}
                height={613}
                sizes="(max-width: 640px) 140px, (max-width: 1024px) 190px, 230px"
                config={{
                  cloud: {
                    cloudName: resolveCloudName(item.src),
                  },
                }}
                wrapperClassName="rounded-none"
                className="h-full w-full object-cover rounded-none transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Subtle Editorial Gradient & Caption on Hover */}
              <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-background/95 via-background/30 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-none">
                {item.title && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-copy-primary font-medium">
                    {item.title}
                  </span>
                )}
                {item.category && (
                  <span className="font-mono text-[9px] uppercase tracking-wider text-copy-secondary">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
