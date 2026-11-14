"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { CldImage } from "next-cloudinary";
import { useLenis } from "@/components/smooth-scroll";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  description?: string;
  deliverables?: string[];
  imageUrl: string;
  imageAlt: string;
}

export interface ServicesSectionProps {
  eyebrow?: string;
  headingPrefix?: string;
  headingAccent?: string;
  headingSuffix?: string;
  services?: ServiceItem[];
  className?: string;
}

function resolveCloudName(src: string): string {
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

/**
 * ServicesSection
 * Interactive "Services" scroll-reveal section with top flex index and 3-column layout
 * per Feature Spec 06 (10):
 * - Top Index: Horizontal flex container listing all service titles with touch-friendly mobile scroll and active state sync.
 * - Single Service Content: Refined 3-column layout (title left, editorial description middle, cinematic Cloudinary image right).
 * - Mobile: Fluidly collapses into a single, vertically stacked column.
 * - Media & Theming: Strictly uses CldImage from next-cloudinary with ZIVORA dual-theme tokens.
 * - Architecture: Direct export from components/sections/ServicesSection.tsx (zero barrel files).
 */
export function ServicesSection({
  services = [],
  className,
}: ServicesSectionProps) {
  const activeServices = React.useMemo(
    () => services ?? [],
    [services],
  );

  const sectionUid = useId();
  const headingId = `${sectionUid}-heading`;

  const { getLenis } = useLenis();

  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const progressBar = progressBarRef.current;
    const cards = cardRefs.current
      .slice(0, activeServices.length)
      .filter((el): el is HTMLDivElement => el !== null);

    if (!section || cards.length === 0) return;

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
          gsap.set(cards, { clearProps: "all" });
          if (progressBar) gsap.set(progressBar, { clearProps: "all" });
          return;
        }

        // Set initial card states
        cards.forEach((card, i) => {
          if (i === 0) {
            gsap.set(card, {
              opacity: 1,
              y: 0,
              autoAlpha: 1,
              pointerEvents: "auto",
            });
          } else {
            gsap.set(card, {
              opacity: 0,
              y: 28,
              autoAlpha: 0,
              pointerEvents: "none",
            });
          }
        });

        // Compute scroll distance proportional to the number of service transitions
        const scrollDistance = Math.max(
          Math.round(window.innerHeight * (cards.length - 1) * 1.35),
          Math.round(window.innerHeight * 1.8),
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${scrollDistance}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const progress = self.progress;
              // Divide progress into segments for each service
              const currentIdx = Math.min(
                cards.length - 1,
                Math.max(0, Math.floor(progress * cards.length)),
              );

              if (currentIdx !== activeIndexRef.current) {
                activeIndexRef.current = currentIdx;
                setActiveIndex(currentIdx);

                // Smoothly center the active tab in the mobile top flex list
                const activeTab = tabRefs.current[currentIdx];
                if (activeTab) {
                  activeTab.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center",
                  });
                }
              }
            },
          },
        });

        scrollTriggerRef.current = tl.scrollTrigger ?? null;

        // Animate sequential transitions between active service panels
        if (cards.length > 1) {
          const holdRatio = 0.35;
          const transitionRatio = 0.65;

          for (let i = 0; i < cards.length - 1; i++) {
            const currentCard = cards[i];
            const nextCard = cards[i + 1];

            // Hold beat so the active service is stable and readable
            tl.to({}, { duration: holdRatio });

            // Cross-transition beat: current card exits upward, next card enters from below
            tl.to(
              currentCard,
              {
                opacity: 0,
                y: -24,
                autoAlpha: 0,
                pointerEvents: "none",
                duration: transitionRatio,
                ease: "power2.inOut",
              },
              `step-${i}`,
            );

            tl.to(
              nextCard,
              {
                opacity: 1,
                y: 0,
                autoAlpha: 1,
                pointerEvents: "auto",
                duration: transitionRatio,
                ease: "power2.inOut",
              },
              `step-${i}`,
            );
          }

          // Final settle beat so the last card stays in clear view before unpinning
          tl.to({}, { duration: 0.45 });
        }

        // Scrub bottom progress bar in sync with the full timeline
        if (progressBar) {
          tl.fromTo(
            progressBar,
            { scaleX: 0 },
            { scaleX: 1, ease: "none", duration: tl.duration() },
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
      scrollTriggerRef.current = null;
      mm.revert();
    };
  }, [activeServices.length]);

  const handleTabClick = (index: number) => {
    const st = scrollTriggerRef.current;
    if (!st) {
      activeIndexRef.current = index;
      setActiveIndex(index);
      const targetCard = cardRefs.current[index];
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      return;
    }

    const progressRatio = index / Math.max(1, activeServices.length - 1);
    const targetScroll = st.start + progressRatio * (st.end - st.start);

    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(targetScroll, { duration: 1.1 });
    } else {
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    }
  };

  if (activeServices.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="services"
      aria-labelledby={headingId}
      className={cn(
        "relative z-20 w-full border-t border-surface-border/70 bg-background text-foreground",
        "motion-safe:flex motion-safe:h-[100dvh] motion-safe:min-h-[100dvh] motion-safe:flex-col motion-safe:justify-between motion-safe:overflow-hidden",
        "motion-reduce:py-20",
        className,
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col justify-between px-6 pt-14 pb-6 sm:px-8 sm:pt-16 sm:pb-8 md:px-10 md:pt-16 md:pb-10 lg:px-12">
        {/* Top Header & Flex Index */}
        <header className="flex flex-col gap-3.5 border-b border-surface-border/70 pb-3 sm:gap-4 sm:pb-4">
          {/* Top Index: Horizontal flex container listing all service titles */}
          <nav aria-label="Services index" className="relative w-full">
            <div
              role="tablist"
              aria-label="Services discipline selection"
              className="no-scrollbar touch-pan-x flex flex-wrap items-center gap-6 overflow-x-auto py-1 sm:gap-8 md:gap-10"
            >
              {activeServices.map((service, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={service.id}
                    id={`service-tab-${service.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`service-panel-${service.id}`}
                    tabIndex={isActive ? 0 : -1}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    onClick={() => handleTabClick(index)}
                    className={cn(
                      "group relative shrink-0 cursor-pointer select-none pb-2 text-left transition-colors duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
                      isActive
                        ? "text-copy-primary font-normal"
                        : "text-copy-secondary/60 hover:text-copy-secondary",
                    )}
                    data-cursor="expand"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-mono text-xs transition-colors duration-300",
                          isActive
                            ? "text-brand"
                            : "text-copy-secondary/50 group-hover:text-copy-secondary",
                        )}
                      >
                        {service.number} {service.title}
                      </span>
                    </div>

                    {/* Animated active underline synced to the active service */}
                    <span
                      className={cn(
                        "absolute bottom-0 left-0 h-[2px] w-full bg-brand transition-all duration-300 ease-out",
                        isActive
                          ? "scale-x-100 opacity-100"
                          : "scale-x-0 opacity-0",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </nav>
        </header>

        {/* Active Service Content Display Area (Refined 3-Column Layout) */}
        <div
          className={cn(
            "relative my-auto flex w-full flex-1 items-center justify-center",
            "motion-safe:min-h-[440px] motion-safe:sm:min-h-[480px] motion-safe:md:min-h-[500px]",
            "motion-reduce:my-10 motion-reduce:min-h-0 motion-reduce:flex-col motion-reduce:gap-20",
          )}
        >
          {activeServices.map((service, index) => {
            return (
              <div
                key={service.id}
                id={`service-panel-${service.id}`}
                role="tabpanel"
                aria-labelledby={`service-tab-${service.id}`}
                ref={(el) => {
                  cardRefs.current[index] = el;
                }}
                className={cn(
                  "w-full",
                  "motion-safe:absolute motion-safe:inset-0 motion-safe:flex motion-safe:h-full motion-safe:items-center",
                  "motion-reduce:relative motion-reduce:inset-auto motion-reduce:opacity-100 motion-reduce:visible motion-reduce:pointer-events-auto",
                )}
              >
                {/* 3-Column Layout: Title (Left) | Description (Middle) | Cinematic Image (Right) */}
                <div className="grid w-full grid-cols-1 items-center gap-6 sm:gap-8 md:grid-cols-12 md:gap-8 lg:gap-12 xl:gap-16">
                  {/* Left Column: Active service title using large fluid typography */}
                  <div className="flex flex-col justify-center space-y-2 text-center sm:space-y-3 md:col-span-4 md:text-left lg:col-span-4">
                    <h3 className="font-serif text-[clamp(1.85rem,1.3rem+2.4vw,4rem)] font-light leading-[1.08] tracking-[-0.02em] text-copy-primary text-balance">
                      {service.title}
                    </h3>
                  </div>

                  {/* Middle Column: Concise editorial description block */}
                  {service.description ? (
                    <div className="flex flex-col justify-center space-y-3 text-center sm:space-y-4 md:col-span-4 md:text-left lg:col-span-4">
                      <p className="text-[clamp(0.9rem,0.86rem+0.2vw,1.0625rem)] leading-relaxed text-copy-secondary text-pretty">
                        {service.description}
                      </p>

                      {service.deliverables && service.deliverables.length > 0 ? (
                        <ul className="flex flex-wrap justify-center gap-2 border-t border-surface-border/60 pt-3 md:flex-col md:justify-start">
                          {service.deliverables.map((item) => (
                            <li
                              key={item}
                              className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-copy-secondary/80"
                            >
                              <span className="h-1 w-1 rounded-full bg-brand" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : (
                    <div className="hidden md:flex md:col-span-4 lg:col-span-4" />
                  )}

                  {/* Right Column: Cinematic preview image using shared CldImage */}
                  <div className="flex items-center justify-center md:col-span-4 lg:col-span-4">
                    <figure className="group relative aspect-[16/10] max-h-[28dvh] w-full max-w-md overflow-hidden rounded-none border border-surface-border/70 bg-surface-subtle shadow-sm sm:aspect-[4/3] sm:max-h-[34dvh] md:aspect-[4/5] md:max-h-none md:max-w-none">
                      <CldImage
                        src={service.imageUrl}
                        alt={service.imageAlt}
                        width={800}
                        height={1000}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                        config={{
                          cloud: {
                            cloudName: resolveCloudName(service.imageUrl),
                          },
                        }}
                        className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </figure>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
