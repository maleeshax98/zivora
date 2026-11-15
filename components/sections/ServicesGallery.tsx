"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import {
  fetchServicesCategoriesAction,
  type ServiceCategoryItem,
} from "@/app/services/actions";

export interface ServicesGalleryProps {
  initialCategories?: ServiceCategoryItem[];
  className?: string;
}

function resolveCloudName(src: string): string {
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

function extractPlainText(blocks: unknown): string {
  if (typeof blocks === "string") return blocks;
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  return blocks
    .map((block) => {
      if (block?._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children
        .map((child: { text?: string }) => child?.text || "")
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

function getEditorialDescription(title: string, rawText?: string): string {
  if (rawText && rawText.trim().length > 0) {
    return rawText.trim();
  }
  const lower = title.toLowerCase();
  if (lower.includes("wedding")) {
    return "Documenting raw intimacy, quiet gestures, and profound celebrations with a cinematic documentary sensibility.";
  }
  if (lower.includes("birthday") || lower.includes("celebration")) {
    return "Preserving vibrant milestones and candid human emotion with natural light and timeless editorial framing.";
  }
  if (lower.includes("portrait")) {
    return "Intimate character studies exploring subtle nuance, architectural silhouettes, and enduring presence.";
  }
  if (lower.includes("creative") || lower.includes("direction")) {
    return "Shaping cohesive visual narratives from initial moodboard curation to final post-production color mastery.";
  }
  return "Bespoke visual documentation crafted with meticulous attention to light, composition, and human connection.";
}

/**
 * TopLoadingBar
 * Minimalist hairline progress bar positioned at the top of the viewport
 * indicating initial data load progress.
 */
function TopLoadingBar({
  progress,
  isVisible,
}: {
  progress: number;
  isVisible: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none bg-surface-border/20 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
      )}
    >
      <div
        className="h-full bg-brand transition-all duration-300 ease-out shadow-[0_0_8px_var(--color-brand)]"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}

export function ServicesGallery({
  initialCategories = [],
  className,
}: ServicesGalleryProps) {
  const [categories, setCategories] =
    useState<ServiceCategoryItem[]>(initialCategories);
  const [cldFailedImages, setCldFailedImages] = useState<
    Record<string, boolean>
  >({});
  const [finalFailedImages, setFinalFailedImages] = useState<
    Record<string, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);
  const [loadingProgress, setLoadingProgress] = useState(
    initialCategories.length > 0 ? 100 : 30,
  );
  const [showLoadingBar, setShowLoadingBar] = useState(
    initialCategories.length === 0,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerEyebrowRef = useRef<HTMLParagraphElement>(null);
  const headerTitleRef = useRef<HTMLHeadingElement>(null);
  const headerScrollHintRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);

  // Fetch categories client-side if not supplied initially via SSR
  useEffect(() => {
    if (categories.length > 0) return;

    let isCancelled = false;
    const progressTimer1 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(65);
    }, 150);
    const progressTimer2 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(85);
    }, 400);

    async function loadCategories() {
      try {
        const data = await fetchServicesCategoriesAction();
        console.log(data);
        if (isCancelled) return;
        if (data && data.length > 0) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to load services categories:", err);
      } finally {
        if (!isCancelled) {
          setLoadingProgress(100);
          setTimeout(() => {
            if (!isCancelled) {
              setShowLoadingBar(false);
              setIsLoading(false);
            }
          }, 300);
        }
      }
    }

    loadCategories();

    return () => {
      isCancelled = true;
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
    };
  }, [categories.length]);

  // Motion setup: Entrance timeline & ScrollTrigger block reveals
  useEffect(() => {
    const container = containerRef.current;
    const header = headerRef.current;
    const eyebrow = headerEyebrowRef.current;
    const title = headerTitleRef.current;
    const scrollHint = headerScrollHintRef.current;

    if (!container || !header) return;

    const mm = gsap.matchMedia(container);

    mm.add(
      {
        isReduced: "(prefers-reduced-motion: reduce)",
        isMotionSafe: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isReduced: reduced } = context.conditions as {
          isReduced: boolean;
          isMotionSafe: boolean;
        };

        const activeBlocks = blockRefs.current.filter(
          (el): el is HTMLElement => el !== null,
        );

        if (reduced || prefersReducedMotion()) {
          if (eyebrow)
            gsap.set(eyebrow, { clearProps: "all", opacity: 1, y: 0 });
          if (title)
            gsap.set(title, { clearProps: "all", opacity: 1, y: 0, scale: 1 });
          if (scrollHint)
            gsap.set(scrollHint, { clearProps: "all", opacity: 1, y: 0 });
          if (activeBlocks.length > 0) {
            gsap.set(activeBlocks, { clearProps: "all", opacity: 1, y: 0 });
          }
          return;
        }

        // 1. Header entrance animation (on viewport entry)
        const headerTl = gsap.timeline({
          scrollTrigger: {
            trigger: header,
            start: "top 80%",
            once: true,
          },
        });

        if (eyebrow) {
          headerTl.fromTo(
            eyebrow,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
          );
        }

        if (title) {
          headerTl.fromTo(
            title,
            { opacity: 0, y: 44, scale: 0.98 },
            { opacity: 1, y: 0, scale: 1, duration: 1.15, ease: "power3.out" },
            "-=0.55",
          );
        }

        if (scrollHint) {
          headerTl.fromTo(
            scrollHint,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
            "-=0.4",
          );
        }

        // 2. Sequentially stacked service blocks scroll-reveal
        activeBlocks.forEach((block) => {
          gsap.fromTo(
            block,
            { opacity: 0, y: 38 },
            {
              opacity: 1,
              y: 0,
              duration: 1.05,
              ease: "power2.out",
              scrollTrigger: {
                trigger: block,
                start: "top 82%",
                once: true,
              },
            },
          );
        });
      },
    );

    return () => mm.revert();
  }, [categories]);

  const handleCldImageError = (id: string) => {
    setCldFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleFinalImageError = (id: string) => {
    setFinalFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div
      ref={containerRef}
      className={cn("w-full bg-background text-copy-primary", className)}
    >
      <TopLoadingBar progress={loadingProgress} isVisible={showLoadingBar} />

      {/* 1. Expansive Editorial Header (min-h-[100dvh]) */}
      <header
        ref={headerRef}
        aria-label="Services Header"
        className="relative min-h-[100dvh] w-full flex flex-col justify-between items-center px-6 sm:px-12 py-20 text-center select-none overflow-hidden"
      >
        {/* Massive Fluid Typography Centerpiece */}
        <div className="flex-1 flex items-center justify-center my-auto">
          <h1
            ref={headerTitleRef}
            className="font-serif text-[clamp(3.5rem,15vw,16.5rem)] font-light tracking-[-0.035em] leading-[0.92] text-copy-primary"
          >
            SERVICES<span className="italic font-serif text-brand">.</span>
          </h1>
        </div>

        {/* Minimalist Scroll Indicator */}
        <div
          ref={headerScrollHintRef}
          className="pb-4 flex flex-col items-center gap-3 text-copy-secondary/70"
        >
          <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.25em]">
            EXPLORE
          </span>
          <div className="w-[1px] h-8 bg-surface-border animate-pulse" />
        </div>
      </header>

      {/* 2. Sequentially Stacked Asymmetrical Service Blocks */}
      <section
        id="service-offerings"
        aria-label="Service Offerings"
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pb-28 sm:pb-40 lg:pb-52 flex flex-col gap-28 sm:gap-40 lg:gap-56"
      >
        {isLoading && categories.length === 0 ? (
          // Elegant Skeleton Loading State (preserves layout geometry)
          <div className="flex flex-col gap-28 sm:gap-40 lg:gap-56">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={cn(
                  "w-full grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 lg:gap-20 items-center animate-pulse",
                  idx % 2 === 1 && "md:flex-row-reverse",
                )}
              >
                <div
                  className={cn(
                    "w-full md:col-span-7 bg-surface-subtle/50 border border-surface-border/30",
                    idx % 3 === 1
                      ? "aspect-[16/10]"
                      : idx % 3 === 2
                        ? "aspect-[3/2]"
                        : "aspect-[4/5] sm:aspect-[16/11]",
                  )}
                />
                <div className="w-full md:col-span-5 flex flex-col gap-4">
                  <div className="w-24 h-3 bg-surface-subtle/70" />
                  <div className="w-48 h-8 bg-surface-subtle/70" />
                  <div className="w-full h-16 bg-surface-subtle/50" />
                  <div className="flex gap-4 mt-4">
                    <div className="w-36 h-11 bg-surface-subtle/60" />
                    <div className="w-32 h-11 bg-surface-subtle/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          categories.map((service, index) => {
            const serviceId = service._id;
            const serviceTitle = service.title || "Discipline";
            const serviceSlug = service.slug?.current || "";
            const rawDescription =
              typeof service.description === "string"
                ? service.description
                : extractPlainText(service.description);
            const description = getEditorialDescription(
              serviceTitle,
              rawDescription,
            );
            const formattedNumber = String(index + 1).padStart(2, "0");
            const hasCldError = cldFailedImages[serviceId];
            const hasFinalError = finalFailedImages[serviceId];

            // Alternating asymmetrical rhythm
            const isReversed = index % 2 === 1;

            return (
              <article
                key={serviceId}
                ref={(el) => {
                  blockRefs.current[index] = el;
                }}
                aria-labelledby={`service-heading-${serviceId}`}
                className={cn(
                  "group relative w-full grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 lg:gap-20 items-center",
                  // Subtle alternating vertical offset for an editorial layout
                  index % 3 === 2 && "lg:pt-6",
                )}
              >
                {/* Media Block: CldImage from next-cloudinary */}
                <div
                  className={cn(
                    "w-full",
                    // Asymmetrical column distributions
                    isReversed
                      ? "md:col-span-7 md:order-2"
                      : "md:col-span-7 md:order-1",
                  )}
                >
                  <div
                    className={cn(
                      "relative w-full overflow-hidden bg-surface-subtle border border-surface-border/40",
                      // Varied editorial aspect ratios across blocks
                      index % 3 === 1
                        ? "aspect-[16/10]"
                        : index % 3 === 2
                          ? "aspect-[3/2]"
                          : "aspect-[4/5] sm:aspect-[16/11]",
                    )}
                  >
                    {hasFinalError || !service.coverImage ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-surface-subtle">
                        <span className="font-serif text-2xl text-copy-primary/40 italic">
                          ZIVORA
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-copy-secondary/60 mt-2">
                          {serviceTitle}
                        </span>
                      </div>
                    ) : hasCldError ||
                      !service.coverImage.includes("res.cloudinary.com") ? (
                      <Image
                        src={service.coverImage}
                        alt={`${serviceTitle} - ZIVORA Editorial Service`}
                        fill
                        unoptimized
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                        onError={() => handleFinalImageError(serviceId)}
                      />
                    ) : (
                      <CldImage
                        src={service.coverImage}
                        alt={`${serviceTitle} - ZIVORA Editorial Service`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
                        config={{
                          cloud: {
                            cloudName: resolveCloudName(service.coverImage),
                          },
                        }}
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                        onError={() => handleCldImageError(serviceId)}
                      />
                    )}
                  </div>
                </div>

                {/* Text & Redirection Actions Block */}
                <div
                  className={cn(
                    "w-full flex flex-col justify-center",
                    isReversed
                      ? "md:col-span-5 md:order-1 md:pr-4 lg:md:pr-8"
                      : "md:col-span-5 md:order-2 md:pl-4 lg:md:pl-8",
                  )}
                >
                  {/* Discipline Index */}
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-brand font-medium">
                    {formattedNumber} / SERVICE
                  </span>

                  {/* Service Title */}
                  <h2
                    id={`service-heading-${serviceId}`}
                    className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light tracking-[-0.02em] text-copy-primary mt-3 sm:mt-4 leading-[1.12]"
                  >
                    {serviceTitle}
                  </h2>

                  {/* Precise Editorial Description */}
                  <p className="font-sans text-sm sm:text-base dark:text-copy-secondary leading-relaxed font-light mt-4 sm:mt-6 max-w-lg">
                    {description}
                  </p>

                  {/* Navigation Buttons for Works and Packages by Service */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-5 mt-8 sm:mt-10">
                    {/* View Packages Button */}
                    <Link
                      href={
                        serviceSlug
                          ? `/packages?category=${encodeURIComponent(serviceSlug)}`
                          : "/packages"
                      }
                      data-cursor="expand"
                      className="group/btn inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-surface-border text-xs uppercase tracking-[0.2em] font-mono text-copy-primary hover:border-brand hover:text-brand transition-colors duration-300 min-h-[44px]"
                    >
                      <span>VIEW PACKAGES</span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 text-copy-secondary group-hover/btn:text-brand"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </Link>

                    {/* Explore Works Button */}
                    <Link
                      href={
                        serviceSlug
                          ? `/works?category=${encodeURIComponent(serviceSlug)}`
                          : "/works"
                      }
                      data-cursor="expand"
                      className="group/link inline-flex items-center justify-center gap-2 px-4 py-3.5 text-xs uppercase tracking-[0.2em] font-mono text-copy-secondary hover:text-copy-primary transition-colors duration-300 min-h-[44px] underline underline-offset-4 decoration-surface-border hover:decoration-brand"
                    >
                      <span>EXPLORE WORKS</span>
                      <ArrowUpRight
                        className="w-3.5 h-3.5 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 text-copy-secondary group-hover/link:text-copy-primary"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

export default ServicesGallery;
