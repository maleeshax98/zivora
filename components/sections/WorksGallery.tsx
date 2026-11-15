"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import {
  fetchWorksAlbumsAction,
  fetchWorksCategoriesAction,
  type CategoryItem,
} from "@/app/works/actions";
import type { WORKS_PAGE_ALBUMS_QUERY_RESULT } from "@/sanity.types";

export type AlbumItem = WORKS_PAGE_ALBUMS_QUERY_RESULT[number];

export interface CategoryTab {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
}

export interface WorksGalleryProps {
  className?: string;
}

const PAGE_SIZE = 4;

function resolveCloudName(src?: string | null): string {
  if (!src) return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

function formatAlbumDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * TopLoadingBar
 * Minimalist hairline progress bar positioned at the top of the site
 * indicating data load progress.
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

/**
 * AlbumCard
 * Renders an individual album card featuring cover image, category, date, and title.
 * Cover image and title both link to `/works/${slug}` (single album page).
 */
export function AlbumCard({
  album,
  priority = false,
}: {
  album: AlbumItem;
  priority?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [cldError, setCldError] = useState(false);
  const slug = album.slug?.current || album._id;
  const isCloudinary =
    typeof album.coverImage === "string" &&
    album.coverImage.includes("res.cloudinary.com");
  const formattedDate = formatAlbumDate(album.eventDate || album.publishedAt);
  const categoryTitle = album.category?.title || "";

  return (
    <article className="group flex flex-col">
      {/* Cover image linked to single album page */}
      <Link
        href={`/works/${slug}`}
        data-cursor="expand"
        aria-label={`View album: ${album.title || "Untitled"}`}
        className="relative block aspect-[4/5] w-full overflow-hidden bg-surface-subtle border border-surface-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        {album.coverImage && !imageError ? (
          isCloudinary && !cldError ? (
            <CldImage
              src={album.coverImage}
              alt={album.title || "Album Cover"}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 50vw"
              config={{
                cloud: {
                  cloudName: resolveCloudName(album.coverImage),
                },
              }}
              onError={() => setCldError(true)}
              className="object-cover object-center w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          ) : (
            <Image
              src={album.coverImage}
              alt={album.title || "Album Cover"}
              fill
              unoptimized
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 50vw"
              onError={() => setImageError(true)}
              className="object-cover object-center w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          )
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3 sm:p-6 text-center bg-surface text-copy-secondary">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-brand">
              ZIVORA
            </span>
            <span className="font-serif text-sm sm:text-lg text-copy-primary mt-1.5 sm:mt-2 line-clamp-2">
              {album.title}
            </span>
          </div>
        )}

        {/* Subtle hover gradient scrim */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-background/0 transition-colors duration-500 group-hover:bg-background/10"
        />
      </Link>

      {/* Album metadata below the image */}
      <div className="mt-3 sm:mt-4 md:mt-5 flex flex-col gap-1 sm:gap-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.12em] sm:tracking-[0.18em] text-copy-secondary">
          <span className="truncate">{categoryTitle}</span>
          {formattedDate && <span className="shrink-0">{formattedDate}</span>}
        </div>

        <Link
          href={`/works/${slug}`}
          data-cursor="expand"
          className="group/title inline-block focus-visible:outline-none focus-visible:underline"
        >
          <h2 className="font-serif text-[clamp(1.125rem,0.9rem+0.8vw,2.25rem)] font-light leading-snug tracking-[-0.01em] text-copy-primary group-hover/title:text-brand transition-colors duration-300">
            {album.title}
          </h2>
        </Link>
      </div>
    </article>
  );
}

/**
 * WorksGallery
 *
 * Implements the full Works page sequence:
 * 1. Initial loading: Top loading bar animates across the top of the site.
 * 2. When loaded: Cinematic entrance text ("ALL WORKS") reveals with blur-to-clear and fades out.
 * 3. Shows categories at top with "ALL" and options from Sanity.
 * 4. Shareable URL parameters (`?category=slug`) to filter albums.
 * 5. When category is active, displays the category cover image and name.
 * 6. Responsive album card grid displaying cover image, name, and date.
 * 7. Infinite scroll: IntersectionObserver sentinel triggers subsequent page loads.
 * 8. While loading next albums: Keeps existing albums untouched and displays a bottom loading indicator.
 */
export function WorksGallery({ className }: WorksGalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read active category from URL parameter, defaulting to 'all'
  const categoryParam = searchParams.get("category");
  const activeCategorySlug =
    categoryParam && categoryParam.trim() !== "" ? categoryParam : "all";

  const [phase, setPhase] = useState<"loading" | "entrance" | "ready">(
    "loading",
  );
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [showTopLoadingBar, setShowTopLoadingBar] = useState(true);

  const [categories, setCategories] = useState<CategoryTab[]>([]);
  const [albums, setAlbums] = useState<AlbumItem[]>([]);
  const [nextStart, setNextStart] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isCategorySwitching, setIsCategorySwitching] = useState(false);
  const [cldFailedCovers, setCldFailedCovers] = useState<
    Record<string, boolean>
  >({});

  const entranceRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const initialCategorySlugRef = useRef(activeCategorySlug);

  // Phase 1: Initial Load (Categories + Initial Albums for URL category) & Top Loading Bar
  useEffect(() => {
    let isCancelled = false;

    const progressTimer1 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(45);
    }, 200);
    const progressTimer2 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(75);
    }, 500);

    const loadInitialData = async () => {
      try {
        const [categoriesData, albumsData] = await Promise.all([
          fetchWorksCategoriesAction(),
          fetchWorksAlbumsAction(0, PAGE_SIZE, initialCategorySlugRef.current),
        ]);

        if (isCancelled) return;

        const mappedCategories: CategoryTab[] = (categoriesData ?? [])
          .filter((cat: CategoryItem) => cat.slug?.current)
          .map((cat: CategoryItem) => ({
            id: cat._id,
            title: cat.title || "",
            slug: cat.slug?.current || cat._id,
            coverImage: cat.coverImage,
          }));

        setCategories(mappedCategories);
        setAlbums(albumsData.albums);
        setNextStart(albumsData.nextStart);
        setHasMore(albumsData.hasMore);

        setLoadingProgress(100);
        setTimeout(() => {
          if (!isCancelled) {
            setShowTopLoadingBar(false);
            setPhase("entrance");
          }
        }, 300);
      } catch (err) {
        console.error("Failed to load initial works data:", err);
        if (!isCancelled) {
          setLoadingProgress(100);
          setShowTopLoadingBar(false);
          setPhase("ready");
        }
      }
    };

    loadInitialData();

    return () => {
      isCancelled = true;
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
    };
  }, []); // Run once on mount

  // Phase 2: Cinematic Entrance Text Animation ("ALL WORKS")
  useEffect(() => {
    if (phase !== "entrance" || !entranceRef.current) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setPhase("ready");
      }, 400);
      return () => clearTimeout(timer);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setPhase("ready");
        },
      });

      tl.fromTo(
        entranceRef.current,
        {
          opacity: 0,
          filter: "blur(14px)",
          scale: 0.96,
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
        },
      )
        .to({}, { duration: 1.1 }) // Reading pause
        .to(entranceRef.current, {
          opacity: 0,
          filter: "blur(12px)",
          scale: 1.04,
          duration: 0.65,
          ease: "power2.in",
        });
    }, entranceRef);

    return () => ctx.revert();
  }, [phase]);

  // Handle Category Switch when user clicks or URL parameter changes (after ready phase)
  useEffect(() => {
    if (phase !== "ready") return;

    let isCancelled = false;
    const fetchCategoryAlbums = async () => {
      setIsCategorySwitching(true);
      try {
        const result = await fetchWorksAlbumsAction(
          0,
          PAGE_SIZE,
          activeCategorySlug,
        );
        if (!isCancelled) {
          setAlbums(result.albums);
          setNextStart(result.nextStart);
          setHasMore(result.hasMore);
        }
      } catch (error) {
        console.error("Failed to fetch category albums:", error);
      } finally {
        if (!isCancelled) {
          setIsCategorySwitching(false);
        }
      }
    };

    fetchCategoryAlbums();

    return () => {
      isCancelled = true;
    };
  }, [activeCategorySlug, phase]);

  const handleCategorySelect = (slug: string) => {
    if (slug === activeCategorySlug) return;

    if (slug === "all") {
      router.push("/works", { scroll: false });
    } else {
      router.push(`/works?category=${encodeURIComponent(slug)}`, {
        scroll: false,
      });
    }
  };

  // Phase 4: Infinite Scroll with non-clearing subsequent loads
  const loadNextPage = useCallback(async () => {
    if (
      isFetchingRef.current ||
      !hasMore ||
      isLoadingMore ||
      isCategorySwitching
    )
      return;

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    try {
      const result = await fetchWorksAlbumsAction(
        nextStart,
        PAGE_SIZE,
        activeCategorySlug,
      );

      setAlbums((prev) => {
        const existingIds = new Set(prev.map((a) => a._id));
        const uniqueNew = result.albums.filter((a) => !existingIds.has(a._id));
        return [...prev, ...uniqueNew];
      });

      setNextStart(result.nextStart);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Failed to load more albums:", error);
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [
    activeCategorySlug,
    hasMore,
    isCategorySwitching,
    isLoadingMore,
    nextStart,
  ]);

  useEffect(() => {
    if (phase !== "ready" || !hasMore || isLoadingMore || isCategorySwitching)
      return;

    const currentSentinel = sentinelRef.current;
    if (!currentSentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: "250px",
        threshold: 0.05,
      },
    );

    observer.observe(currentSentinel);

    return () => {
      observer.disconnect();
    };
  }, [phase, hasMore, isLoadingMore, isCategorySwitching, loadNextPage]);

  // Find active category item if filtered
  const activeCategory =
    activeCategorySlug !== "all"
      ? categories.find((c) => c.slug === activeCategorySlug)
      : null;

  return (
    <section
      className={cn("relative w-full min-h-screen bg-background", className)}
    >
      {/* Top Loading Progress Bar */}
      <TopLoadingBar progress={loadingProgress} isVisible={showTopLoadingBar} />

      {/* Cinematic Entrance Text ("ALL WORKS") */}
      {phase === "entrance" && (
        <div
          ref={entranceRef}
          aria-live="polite"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-background px-6 text-center pointer-events-none select-none"
        >
          <h1 className="font-serif text-[clamp(2.75rem,8vw,7rem)] font-light tracking-[-0.02em] text-copy-primary">
            ALL WORKS
          </h1>
        </div>
      )}

      {/* Main Works Content Stage */}
      <div
        className={cn(
          "max-w-7xl mx-auto px-4 sm:px-8 md:px-12 lg:px-20 pt-28 sm:pt-36 lg:pt-44 pb-20 sm:pb-28 transition-opacity duration-700",
          phase === "ready" ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Category Filter Navigation */}
        <nav
          aria-label="Filter works by category"
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-3 border-b border-surface-border/30 mb-10 sm:mb-14 flex-wrap justify-between"
        >
          <button
            type="button"
            onClick={() => handleCategorySelect("all")}
            className={cn(
              "text-xs sm:text-sm uppercase tracking-[0.18em] whitespace-nowrap transition-colors duration-200 pb-2 -mb-[13px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
              activeCategorySlug === "all"
                ? "text-copy-primary font-medium border-b-2 border-brand"
                : "text-copy-secondary hover:text-copy-primary",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategorySelect(cat.slug)}
              className={cn(
                "text-xs sm:text-sm uppercase tracking-[0.18em] whitespace-nowrap transition-colors duration-200 pb-2 -mb-[13px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
                activeCategorySlug === cat.slug
                  ? "text-copy-primary font-medium border-b-2 border-brand"
                  : "text-copy-secondary hover:text-copy-primary",
              )}
            >
              {cat.title}
            </button>
          ))}
        </nav>

        {/* Category Hero: Faded Cover Image with Gradient Overlay and Overlaid Category Name */}
        {activeCategory ? (
          <div className="relative w-full h-[30vh] sm:h-[38vh] md:h-[44vh] min-h-[220px] max-h-[400px] overflow-hidden mb-12 sm:mb-16 flex items-center justify-center text-center px-6">
            {activeCategory.coverImage && (
              <>
                {/* Faded background cover image */}
                <div className="absolute inset-0">
                  {typeof activeCategory.coverImage === "string" &&
                  activeCategory.coverImage.includes("res.cloudinary.com") &&
                  !cldFailedCovers[
                    activeCategory.slug || activeCategory.title
                  ] ? (
                    <CldImage
                      src={activeCategory.coverImage}
                      alt={activeCategory.title}
                      fill
                      sizes="100vw"
                      priority
                      config={{
                        cloud: {
                          cloudName: resolveCloudName(
                            activeCategory.coverImage,
                          ),
                        },
                      }}
                      onError={() =>
                        setCldFailedCovers((prev) => ({
                          ...prev,
                          [activeCategory.slug || activeCategory.title]: true,
                        }))
                      }
                      className="object-cover object-center w-full h-full opacity-40 dark:opacity-35 transition-opacity duration-700"
                    />
                  ) : (
                    <Image
                      src={activeCategory.coverImage}
                      alt={activeCategory.title}
                      fill
                      unoptimized
                      priority
                      sizes="100vw"
                      className="object-cover object-center w-full h-full opacity-40 dark:opacity-35 transition-opacity duration-700"
                    />
                  )}
                </div>

                {/* Soft gradient overlays fading the image seamlessly into the page background */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-transparent to-background"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-background/25"
                />
              </>
            )}

            {/* Category name displayed on top of the faded image */}
            <h1 className="relative z-10 font-serif text-[clamp(2.5rem,1.8rem+3.2vw,5.5rem)] font-light leading-[1.08] tracking-[-0.02em] text-copy-primary text-balance">
              {activeCategory.title}
            </h1>
          </div>
        ) : (
          <header className="mb-10 sm:mb-14">
            <h1 className="font-serif text-[clamp(2.5rem,1.8rem+2.8vw,5rem)] font-light leading-[1.08] tracking-[-0.02em] text-copy-primary">
              All Works
            </h1>
          </header>
        )}

        {/* Albums Grid */}
        {albums.length > 0 ? (
          <div
            className={cn(
              "grid grid-cols-2 gap-x-3.5 sm:gap-x-6 md:gap-x-8 lg:gap-x-12 gap-y-8 sm:gap-y-12 md:gap-y-16 lg:gap-y-24 transition-opacity duration-300",
              isCategorySwitching ? "opacity-50" : "opacity-100",
            )}
          >
            {albums.map((album, index) => (
              <AlbumCard key={album._id} album={album} priority={index < 4} />
            ))}
          </div>
        ) : (
          !isCategorySwitching && (
            <div className="py-24 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-copy-secondary">
                No albums found in this category.
              </p>
            </div>
          )
        )}

        {/* Infinite Scroll Sentinel */}
        {hasMore && (
          <div ref={sentinelRef} className="h-10 w-full pointer-events-none" />
        )}

        {/* Bottom Loading Indicator (while loading next albums without clearing the page) */}
        {isLoadingMore && (
          <div
            aria-live="polite"
            className="py-12 sm:py-16 flex flex-col items-center justify-center gap-2.5"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-copy-secondary">
              Loading more works...
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default WorksGallery;
