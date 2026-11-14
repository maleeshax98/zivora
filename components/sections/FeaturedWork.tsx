"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export interface FeaturedProjectItem {
  id: string;
  title: string;
  category: string;
  year: string;
  imageUrl: string;
  imageAlt: string;
  href: string;
}

export interface FeaturedWorkProps {
  items?: FeaturedProjectItem[];
  className?: string;
}

function resolveCloudName(src: string): string {
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

function chunkIntoPairs(
  items: FeaturedProjectItem[],
): FeaturedProjectItem[][] {
  const pairs: FeaturedProjectItem[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

/**
 * FeaturedWork
 * Full-viewport editorial showcase presenting featured works two per viewport row
 * (1-column stack on mobile, 2-column grid on desktop) in natural page-scroll flow.
 * Smoothly fades out the section title as the initial pair enters to fill the viewport.
 */
export function FeaturedWork({
  items = [],
  className,
}: FeaturedWorkProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const firstRowRef = useRef<HTMLUListElement>(null);

  const activeItems = useMemo(() => {
    return items ?? [];
  }, [items]);

  const rows = useMemo(() => chunkIntoPairs(activeItems), [activeItems]);

  useEffect(() => {
    const section = sectionRef.current;
    const header = headerRef.current;
    const firstRow = firstRowRef.current;
    if (!section || !header || !firstRow) return;

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
          gsap.set(header, { clearProps: "opacity,transform" });
          return;
        }

        // Smoothly fade out the section title as the first pair occupies the viewport
        gsap.fromTo(
          header,
          { opacity: 1, y: 0 },
          {
            opacity: 0,
            y: -18,
            ease: "none",
            scrollTrigger: {
              trigger: firstRow,
              start: "top 35%",
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
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
  }, [rows.length]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="featured-work"
      aria-labelledby="featured-work-heading"
      className={cn(
        "relative z-20 flex w-full flex-col bg-background text-foreground",
        className,
      )}
    >
      <header
        ref={headerRef}
        className="flex flex-col gap-2 border-t border-surface-border/70 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:py-7 lg:px-10 will-change-[transform,opacity]"
      >
        <h2
          id="featured-work-heading"
          className="font-serif text-[clamp(1.75rem,1.25rem+2.2vw,3rem)] font-light leading-[1.1] tracking-[-0.02em] text-copy-primary text-balance"
        >
          Featured <span className="italic text-brand">Works</span>
        </h2>
        <p className="max-w-md font-serif text-sm italic leading-relaxed text-copy-secondary sm:text-right sm:text-base text-pretty">
          Where fleeting light settles into quiet, enduring frames.
        </p>
      </header>

      <div className="flex w-full flex-col border-l border-surface-border/70">
        {rows.map((pair, rowIndex) => {
          const isSingleCardRow = pair.length === 1;

          return (
            <ul
              key={pair.map((p) => p.id).join("-")}
              ref={rowIndex === 0 ? firstRowRef : undefined}
              role="list"
              className={cn(
                "m-0 grid min-h-[100dvh] w-full list-none auto-rows-[minmax(auto,1fr)] p-0",
                rowIndex === 0 && "border-t border-surface-border/70",
                isSingleCardRow ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
              )}
            >
              {pair.map((project) => (
                <li key={project.id} className="flex min-h-0 min-w-0">
                  <article className="group relative flex w-full flex-col justify-end overflow-hidden border-r border-b border-surface-border/70 bg-surface-subtle">
                    <CldImage
                      src={project.imageUrl}
                      alt={project.imageAlt}
                      fill
                      sizes={
                        isSingleCardRow
                          ? "100vw"
                          : "(max-width: 767px) 100vw, 50vw"
                      }
                      config={{
                        cloud: {
                          cloudName: resolveCloudName(project.imageUrl),
                        },
                      }}
                      className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />

                    {/* Dual-theme bottom gradient scrim preserving WCAG contrast over imagery */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-background/95 via-background/70 to-transparent"
                    />

                    {/* Bottom-left anchored editorial copy and underlined text link */}
                    <div className="relative z-10 flex max-w-xl flex-col items-start gap-2 p-6 sm:gap-2.5 sm:p-8 lg:p-10 [@media(forced-colors:active)]:bg-[Canvas]">
                      <p className="font-mono text-xs uppercase tracking-[0.22em] text-copy-secondary">
                        {project.category} · {project.year}
                      </p>

                      <h3 className="font-serif text-[clamp(1.5rem,1.05rem+1.7vw,2.75rem)] font-light leading-[1.15] tracking-[-0.02em] text-copy-primary text-balance">
                        {project.title}
                      </h3>

                      <Link
                        href={project.href}
                        data-cursor="expand"
                        className="mt-1 inline-flex min-h-6 items-center font-mono text-xs lowercase tracking-[0.18em] text-copy-primary underline decoration-brand decoration-1 underline-offset-[0.375rem] transition-colors duration-200 hover:text-copy-secondary hover:decoration-copy-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring motion-reduce:transition-none sm:text-sm [@media(pointer:coarse)]:min-h-11"
                      >
                        view project
                        <span className="sr-only"> — {project.title}</span>
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturedWork;
