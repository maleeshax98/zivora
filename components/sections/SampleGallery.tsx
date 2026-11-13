"use client";

import React, { useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export type SampleGalleryMediaType = "photo" | "video";

export interface SampleGalleryItem {
  id: string;
  title?: string;
  category?: string;
  mediaType?: SampleGalleryMediaType;
  imageUrl: string;
  imageAlt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  href?: string;
}

export interface SampleGallerySkeletonProps {
  className?: string;
}

export interface SampleGalleryProps {
  items?: SampleGalleryItem[];
  className?: string;
}

interface FloatingPhotoConfig {
  id: string;
  imageUrl: string;
  imageAlt: string;
  aspectRatio: string;
  width: number;
  height: number;
  href: string;
  desktopPositionClass: string;
  desktopWidthClass: string;
  parallax: {
    y: [number, number];
    scrub: number;
  };
  float: {
    x: number;
    y: number;
    rotation: number;
    duration: number;
  };
}

const DEFAULT_GALLERY_IMAGE_URL =
  "https://res.cloudinary.com/pso8u1zy/image/upload/v1794419553/ij0uyatmtd17wz1jdosz.jpg";

function resolveCloudName(src: string): string {
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

/**
 * 16 Curated Photography items for balanced 2-column mobile grid (8 rows)
 * and rich, tightly-spaced desktop floating scatter (eliminating large voids).
 */
const DEFAULT_FLOATING_PHOTOS: FloatingPhotoConfig[] = [
  {
    id: "amber-colonnade",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Warm architectural light casting quiet shadows across limestone surfaces in Amber Colonnade",
    aspectRatio: "4 / 5",
    width: 960,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[2%] left-[5%]",
    desktopWidthClass: "md:w-[230px] lg:w-[270px] xl:w-[310px]",
    parallax: {
      y: [60, -100],
      scrub: 0.8,
    },
    float: {
      x: 10,
      y: -14,
      rotation: -2.0,
      duration: 4.8,
    },
  },
  {
    id: "quiet-monolith",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Vertical medium-format portrait composed against textured stone in Quiet Monolith",
    aspectRatio: "3 / 4",
    width: 900,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[3%] left-[40%]",
    desktopWidthClass: "md:w-[250px] lg:w-[290px] xl:w-[330px]",
    parallax: {
      y: [-40, 50],
      scrub: 1.3,
    },
    float: {
      x: -12,
      y: 15,
      rotation: 2.2,
      duration: 6.2,
    },
  },
  {
    id: "vesper-silhouette",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Analog film frame capturing subtle dusk contrast in Vesper Silhouette",
    aspectRatio: "1 / 1",
    width: 1000,
    height: 1000,
    href: "/works",
    desktopPositionClass: "top-[2%] left-[73%]",
    desktopWidthClass: "md:w-[220px] lg:w-[250px] xl:w-[280px]",
    parallax: {
      y: [70, -110],
      scrub: 0.9,
    },
    float: {
      x: 8,
      y: -12,
      rotation: -1.8,
      duration: 5.4,
    },
  },
  {
    id: "linen-and-limestone",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Tall vertical study pairing natural fabric textures with warm daylight",
    aspectRatio: "2 / 3",
    width: 800,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[13%] left-[19%]",
    desktopWidthClass: "md:w-[200px] lg:w-[230px] xl:w-[260px]",
    parallax: {
      y: [-30, 40],
      scrub: 1.4,
    },
    float: {
      x: -9,
      y: 14,
      rotation: 1.6,
      duration: 5.9,
    },
  },
  {
    id: "stillness-in-oak",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Measured architectural interior frame balancing shadow depth and warm timber",
    aspectRatio: "4 / 5",
    width: 960,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[14%] left-[58%]",
    desktopWidthClass: "md:w-[260px] lg:w-[300px] xl:w-[340px]",
    parallax: {
      y: [90, -130],
      scrub: 0.7,
    },
    float: {
      x: 12,
      y: -16,
      rotation: -2.4,
      duration: 4.6,
    },
  },
  {
    id: "obsidian-drape",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Sculptural studio portraiture framed in soft directional lighting",
    aspectRatio: "3 / 4",
    width: 900,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[25%] left-[4%]",
    desktopWidthClass: "md:w-[250px] lg:w-[290px] xl:w-[320px]",
    parallax: {
      y: [80, -120],
      scrub: 0.85,
    },
    float: {
      x: -14,
      y: -18,
      rotation: 2.0,
      duration: 4.4,
    },
  },
  {
    id: "atelier-light",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Soft morning window light across minimalist studio forms in Atelier Light",
    aspectRatio: "1 / 1",
    width: 960,
    height: 960,
    href: "/works",
    desktopPositionClass: "top-[26%] left-[38%]",
    desktopWidthClass: "md:w-[210px] lg:w-[240px] xl:w-[270px]",
    parallax: {
      y: [-50, 60],
      scrub: 1.2,
    },
    float: {
      x: 11,
      y: 16,
      rotation: -1.7,
      duration: 6.5,
    },
  },
  {
    id: "travertine-echo",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Tall vertical architectural detail highlighting stone grain and shadow line",
    aspectRatio: "4 / 5",
    width: 800,
    height: 1000,
    href: "/works",
    desktopPositionClass: "top-[25%] left-[74%]",
    desktopWidthClass: "md:w-[240px] lg:w-[280px] xl:w-[310px]",
    parallax: {
      y: [60, -90],
      scrub: 1.0,
    },
    float: {
      x: -10,
      y: 13,
      rotation: 2.3,
      duration: 5.2,
    },
  },
  {
    id: "sienna-fragment",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Warm sienna tones reflected in textured plaster and curved architectural geometry",
    aspectRatio: "4 / 5",
    width: 960,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[38%] left-[16%]",
    desktopWidthClass: "md:w-[270px] lg:w-[320px] xl:w-[360px]",
    parallax: {
      y: [90, -140],
      scrub: 0.75,
    },
    float: {
      x: 13,
      y: -15,
      rotation: -2.1,
      duration: 4.9,
    },
  },
  {
    id: "dusk-pavilion",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Dusk light filtering through architectural slatted pavilion in soft contrast",
    aspectRatio: "2 / 3",
    width: 800,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[39%] left-[56%]",
    desktopWidthClass: "md:w-[210px] lg:w-[240px] xl:w-[270px]",
    parallax: {
      y: [-40, 50],
      scrub: 1.3,
    },
    float: {
      x: -11,
      y: 17,
      rotation: 1.9,
      duration: 6.1,
    },
  },
  {
    id: "solitude-in-ochre",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Minimalist analog study of natural earth pigments and tactile ceramics",
    aspectRatio: "1 / 1",
    width: 1000,
    height: 1000,
    href: "/works",
    desktopPositionClass: "top-[50%] left-[6%]",
    desktopWidthClass: "md:w-[220px] lg:w-[250px] xl:w-[280px]",
    parallax: {
      y: [-30, 40],
      scrub: 1.35,
    },
    float: {
      x: 9,
      y: 12,
      rotation: -1.5,
      duration: 5.6,
    },
  },
  {
    id: "monochrome-arch",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Fine art architectural framing capturing high contrast monochrome shadows",
    aspectRatio: "3 / 4",
    width: 900,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[51%] left-[36%]",
    desktopWidthClass: "md:w-[260px] lg:w-[300px] xl:w-[340px]",
    parallax: {
      y: [80, -130],
      scrub: 0.8,
    },
    float: {
      x: -13,
      y: -19,
      rotation: 2.5,
      duration: 4.5,
    },
  },
  {
    id: "ceramic-study",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Curated still life study balancing hand-thrown pottery with organic shadow lines",
    aspectRatio: "4 / 5",
    width: 960,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[50%] left-[71%]",
    desktopWidthClass: "md:w-[250px] lg:w-[290px] xl:w-[320px]",
    parallax: {
      y: [70, -100],
      scrub: 0.9,
    },
    float: {
      x: 10,
      y: -14,
      rotation: -2.2,
      duration: 5.0,
    },
  },
  {
    id: "elysian-shadow",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Delicate afternoon daylight carving geometric planes across concrete walls",
    aspectRatio: "2 / 3",
    width: 800,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[63%] left-[18%]",
    desktopWidthClass: "md:w-[220px] lg:w-[250px] xl:w-[280px]",
    parallax: {
      y: [-50, 60],
      scrub: 1.2,
    },
    float: {
      x: -12,
      y: 16,
      rotation: 2.0,
      duration: 6.4,
    },
  },
  {
    id: "tuscan-portico",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Editorial composition of weathered classical masonry and afternoon warmth",
    aspectRatio: "4 / 5",
    width: 960,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[64%] left-[55%]",
    desktopWidthClass: "md:w-[270px] lg:w-[320px] xl:w-[350px]",
    parallax: {
      y: [90, -140],
      scrub: 0.7,
    },
    float: {
      x: 14,
      y: -16,
      rotation: -2.6,
      duration: 4.7,
    },
  },
  {
    id: "mineral-horizon",
    imageUrl: DEFAULT_GALLERY_IMAGE_URL,
    imageAlt:
      "Minimalist horizon portraiture reflecting subtle muted tones and natural grain",
    aspectRatio: "3 / 4",
    width: 900,
    height: 1200,
    href: "/works",
    desktopPositionClass: "top-[74%] left-[28%]",
    desktopWidthClass: "md:w-[260px] lg:w-[300px] xl:w-[330px]",
    parallax: {
      y: [70, -110],
      scrub: 0.9,
    },
    float: {
      x: -10,
      y: 15,
      rotation: 1.8,
      duration: 5.8,
    },
  },
];

export function SampleGallerySkeleton({ className }: SampleGallerySkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading gallery photos"
      className={cn(
        "relative w-full overflow-hidden bg-background px-4 py-8 sm:px-6 md:h-[180vh] lg:h-[200vh]",
        className,
      )}
    >
      <span className="sr-only">Loading floating gallery photos…</span>
    </div>
  );
}

/**
 * SampleGallery
 * Floating Photo Gallery Redesign per context/feature-specs/07-floating-sample-gallery.md:
 * - Mobile: Clean, responsive 2-column grid (`grid grid-cols-2`) with natural document flow.
 * - Desktop: Free-form, dynamic floating & flying visual experience with dense photo distribution
 *   eliminating large voids between images.
 * - Strictly photography with ZERO text, titles, descriptions, or video UI overlays.
 * - Strictly uses `CldImage` from `next-cloudinary` for responsive sizing and optimal delivery.
 * - Continuous GSAP float (subtle randomized x/y translations and slight rotations, yoyo: true, repeat: -1).
 * - Multi-layer ScrollTrigger parallax scrub with varying speeds for cinematic depth.
 */
export function SampleGallery({ items, className }: SampleGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRefs = useRef<(HTMLDivElement | null)[]>([]);
  const floatRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter to strictly photos (no video elements or tags)
  const photoConfigs = useMemo<FloatingPhotoConfig[]>(() => {
    if (!items || items.length === 0) {
      return DEFAULT_FLOATING_PHOTOS;
    }

    const photoOnlyItems = items.filter((item) => item.mediaType !== "video");
    if (photoOnlyItems.length === 0) {
      return DEFAULT_FLOATING_PHOTOS;
    }

    return photoOnlyItems.map((item, index) => {
      const baseConfig =
        DEFAULT_FLOATING_PHOTOS[index % DEFAULT_FLOATING_PHOTOS.length];
      return {
        ...baseConfig,
        id: item.id || baseConfig.id,
        imageUrl: item.imageUrl || baseConfig.imageUrl,
        imageAlt: item.imageAlt || baseConfig.imageAlt,
        aspectRatio:
          item.aspectRatio ||
          (item.width && item.height
            ? `${item.width} / ${item.height}`
            : baseConfig.aspectRatio),
        width: item.width || baseConfig.width,
        height: item.height || baseConfig.height,
        href: item.href || baseConfig.href,
      };
    });
  }, [items]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let isActive = true;
    const mm = gsap.matchMedia(section);

    mm.add(
      {
        isDesktop:
          "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isDesktop, reduceMotion } = context.conditions ?? {};

        if (reduceMotion) {
          parallaxRefs.current.forEach((el) => {
            if (el) gsap.set(el, { clearProps: "transform,opacity" });
          });
          floatRefs.current.forEach((el) => {
            if (el) gsap.set(el, { clearProps: "transform,opacity" });
          });
          return;
        }

        if (isDesktop) {
          photoConfigs.forEach((config, index) => {
            const parallaxEl = parallaxRefs.current[index];
            const floatEl = floatRefs.current[index];
            if (!parallaxEl || !floatEl) return;

            // 1. Scroll Parallax Scrub
            gsap.fromTo(
              parallaxEl,
              { y: config.parallax.y[0] },
              {
                y: config.parallax.y[1],
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: config.parallax.scrub,
                  invalidateOnRefresh: true,
                },
              },
            );

            // 2. Continuous Idle Float with subtle x, y, and rotation
            gsap.to(floatEl, {
              x: config.float.x,
              y: config.float.y,
              rotation: config.float.rotation,
              duration: config.float.duration,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          });
        }
      },
    );

    // Refresh ScrollTrigger once fonts/layout are ready
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
  }, [photoConfigs]);

  return (
    <section
      ref={sectionRef}
      id="sample-gallery"
      aria-label="Floating Sample Gallery"
      className={cn(
        "relative z-20 w-full border-t border-surface-border/70 bg-background",
        className,
      )}
    >
      {/* Mobile Screen: 2-Column Responsive Grid */}
      <div className="block md:hidden w-full px-3.5 py-10 sm:px-6 sm:py-14">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {photoConfigs.map((photo) => (
            <div key={`mobile-${photo.id}`} className="relative w-full">
              {photo.href ? (
                <Link
                  href={photo.href}
                  data-cursor="expand"
                  aria-label={photo.imageAlt}
                  className="group block w-full touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  <div
                    className="relative w-full overflow-hidden rounded-none border border-surface-border/70 bg-surface-subtle shadow-sm transition-transform duration-500 ease-out active:scale-[0.98]"
                    style={{ aspectRatio: photo.aspectRatio }}
                  >
                    <CldImage
                      src={photo.imageUrl}
                      alt={photo.imageAlt}
                      fill
                      sizes="(max-width: 767px) 50vw, 300px"
                      config={{
                        cloud: {
                          cloudName: resolveCloudName(photo.imageUrl),
                        },
                      }}
                      className="object-cover object-center"
                    />
                  </div>
                </Link>
              ) : (
                <div
                  className="relative w-full overflow-hidden rounded-none border border-surface-border/70 bg-surface-subtle shadow-sm"
                  style={{ aspectRatio: photo.aspectRatio }}
                >
                  <CldImage
                    src={photo.imageUrl}
                    alt={photo.imageAlt}
                    fill
                    sizes="(max-width: 767px) 50vw, 300px"
                    config={{
                      cloud: {
                        cloudName: resolveCloudName(photo.imageUrl),
                      },
                    }}
                    className="object-cover object-center"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Screen: Dense Floating & Flying Asymmetrical Gallery */}
      <div className="hidden md:block relative h-[175vh] lg:h-[190vh] xl:h-[200vh] w-full overflow-hidden">
        {photoConfigs.map((photo, index) => {
          const imageCard = (
            <div
              className={cn(
                "relative overflow-hidden rounded-none border border-surface-border/70 bg-surface-subtle shadow-md transition-transform duration-700 ease-out hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100",
                photo.desktopWidthClass,
              )}
              style={{ aspectRatio: photo.aspectRatio }}
            >
              <CldImage
                src={photo.imageUrl}
                alt={photo.imageAlt}
                fill
                sizes="(max-width: 1023px) 25vw, 360px"
                config={{
                  cloud: {
                    cloudName: resolveCloudName(photo.imageUrl),
                  },
                }}
                className="object-cover object-center"
              />
            </div>
          );

          return (
            <div
              key={`desktop-${photo.id}`}
              ref={(el) => {
                parallaxRefs.current[index] = el;
              }}
              className={cn(
                "absolute pointer-events-auto",
                photo.desktopPositionClass,
              )}
            >
              <div
                ref={(el) => {
                  floatRefs.current[index] = el;
                }}
                className="will-change-transform"
              >
                {photo.href ? (
                  <Link
                    href={photo.href}
                    data-cursor="expand"
                    aria-label={photo.imageAlt}
                    className="group block touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  >
                    {imageCard}
                  </Link>
                ) : (
                  <div data-cursor="expand" className="group block">
                    {imageCard}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SampleGallery;
