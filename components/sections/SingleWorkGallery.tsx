"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { CldImage } from "next-cloudinary";
import {
  Camera,
  Film,
  ArrowLeft,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import {
  fetchAlbumBySlugAction,
  fetchAlbumPhotosAction,
  type SingleAlbumData,
  type AlbumPhotoItem,
} from "@/app/works/actions";

export interface SingleWorkGalleryProps {
  slug: string;
  initialAlbum?: SingleAlbumData;
  className?: string;
}

const PAGE_SIZE = 12;

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
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
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

function getYouTubeVideoId(url?: string | null): string | null {
  if (!url) return null;
  const regExp =
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[1].length === 11 ? match[1] : null;
}

/**
 * TopLoadingBar
 * Minimalist hairline progress bar at the top of the viewport.
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
 * SingleWorkGallery
 *
 * Implements the single album gallery view adhering to 02-single-work.md:
 * 1. Top loading bar indicating data loading progress.
 * 2. Cinematic intro sequence: sequential fade-in and hold of album title, description, and date,
 *    followed by an unhurried reading pause and smooth blur/fade-out transition.
 * 3. Pinterest-type masonry photo grid (2-column on mobile, multi-column on tablet/desktop).
 * 4. Infinite scroll & pagination fetching photos from the Cloudinary folder with newly loaded
 *    photos appended to the bottom while already loaded photos remain in position.
 * 5. YouTube video presentation for album video links.
 * 6. Fixed bottom tab bar filtering photos and videos with a faded gradient backdrop.
 */
export function SingleWorkGallery({
  slug,
  initialAlbum,
  className,
}: SingleWorkGalleryProps) {
  // Phase state machine: "loading" -> "intro" -> "ready"
  const [phase, setPhase] = useState<"loading" | "intro" | "ready">("loading");
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [showTopLoadingBar, setShowTopLoadingBar] = useState(true);

  // Album metadata
  const [album, setAlbum] = useState<SingleAlbumData>(initialAlbum ?? null);
  const [albumNotFound, setAlbumNotFound] = useState(false);

  // Photos state & pagination
  const [photos, setPhotos] = useState<AlbumPhotoItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMorePhotos, setHasMorePhotos] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Active filter tab: "photos" | "videos"
  const [activeTab, setActiveTab] = useState<"photos" | "videos">("photos");

  // Lightbox modal state
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(
    null,
  );

  // Refs for GSAP cinematic intro
  const introContainerRef = useRef<HTMLDivElement>(null);
  const introTitleRef = useRef<HTMLHeadingElement>(null);
  const introDescRef = useRef<HTMLParagraphElement>(null);
  const introDateRef = useRef<HTMLParagraphElement>(null);

  // Sentinel ref for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Extracted album data
  const title = album?.title || "Untitled Archive";
  const description =
    typeof album?.description === "string"
      ? album.description.trim()
      : extractPlainText(album?.description).trim();

  const formattedDate = formatAlbumDate(album?.eventDate || album?.publishedAt);
  const categoryTitle = album?.category?.title || "";
  const youtubeLinks = (album?.youtubeVideoLinks || []).filter(
    Boolean,
  ) as string[];

  // ---------------------------------------------------------------------------
  // Phase 1: Initial Load (Fetch Album details + first batch of Cloudinary photos)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    const progressTimer1 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(45);
    }, 200);

    const progressTimer2 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(75);
    }, 450);

    const loadInitialData = async () => {
      try {
        let currentAlbum = initialAlbum ?? null;
        if (!currentAlbum && slug) {
          currentAlbum = await fetchAlbumBySlugAction(slug);
        }

        if (isCancelled) return;

        if (!currentAlbum) {
          setAlbumNotFound(true);
          setLoadingProgress(100);
          setShowTopLoadingBar(false);
          setPhase("ready");
          return;
        }

        setAlbum(currentAlbum);

        // Fetch initial batch of photos from Cloudinary folder if configured
        const folderName = currentAlbum.cloudinaryFolderName;
        if (folderName) {
          const photoRes = await fetchAlbumPhotosAction(
            folderName,
            null,
            PAGE_SIZE,
          );
          if (!isCancelled) {
            setPhotos(photoRes.photos);
            setNextCursor(photoRes.nextCursor);
            setHasMorePhotos(photoRes.hasMore);
          }
        }

        setLoadingProgress(100);
        setTimeout(() => {
          if (!isCancelled) {
            setShowTopLoadingBar(false);
            setPhase("intro");
          }
        }, 300);
      } catch (err) {
        console.error("Failed to load single work data:", err);
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
  }, [slug, initialAlbum]);

  // ---------------------------------------------------------------------------
  // Phase 2: Cinematic Intro Sequence (Title -> Description -> Date -> Fade Out)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (phase !== "intro") return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const timer = setTimeout(() => {
        setPhase("ready");
      }, 700);
      return () => clearTimeout(timer);
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setPhase("ready");
        },
      });

      // Reset initial styles
      gsap.set(introTitleRef.current, {
        opacity: 0,
        filter: "blur(14px)",
        y: 20,
      });

      if (introDescRef.current) {
        gsap.set(introDescRef.current, {
          opacity: 0,
          filter: "blur(10px)",
          y: 16,
        });
      }

      if (introDateRef.current) {
        gsap.set(introDateRef.current, {
          opacity: 0,
          filter: "blur(8px)",
          y: 12,
        });
      }

      // Step 1: Title fade in blur-to-clear
      tl.to(introTitleRef.current, {
        opacity: 1,
        filter: "blur(0px)",
        y: 0,
        duration: 0.85,
        ease: "power2.out",
      });

      // Step 2: Description fade in
      if (introDescRef.current) {
        tl.to(
          introDescRef.current,
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 0.75,
            ease: "power2.out",
          },
          "-=0.35",
        );
      }

      // Step 3: Date fade in
      if (introDateRef.current) {
        tl.to(
          introDateRef.current,
          {
            opacity: 1,
            filter: "blur(0px)",
            y: 0,
            duration: 0.65,
            ease: "power2.out",
          },
          "-=0.25",
        );
      }

      // Step 4: Reading pause
      tl.to({}, { duration: 1.35 });

      // Step 5: Smooth cinematic fade out
      tl.to(introContainerRef.current, {
        opacity: 0,
        filter: "blur(12px)",
        scale: 1.02,
        duration: 0.7,
        ease: "power2.inOut",
      });
    }, introContainerRef);

    return () => ctx.revert();
  }, [phase]);

  // ---------------------------------------------------------------------------
  // Phase 3: Infinite Scroll for Photos
  // Newly loaded photos append to bottom; first loaded photos stay in position.
  // ---------------------------------------------------------------------------
  const handleLoadMorePhotos = useCallback(async () => {
    if (!album?.cloudinaryFolderName || !hasMorePhotos || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const res = await fetchAlbumPhotosAction(
        album.cloudinaryFolderName,
        nextCursor,
        PAGE_SIZE,
      );

      setPhotos((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueIncoming = res.photos.filter((p) => !existingIds.has(p.id));
        return [...prev, ...uniqueIncoming];
      });

      setNextCursor(res.nextCursor);
      setHasMorePhotos(res.hasMore);
    } catch (err) {
      console.error("Failed to load additional photos:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [album, hasMorePhotos, isLoadingMore, nextCursor]);

  useEffect(() => {
    if (phase !== "ready" || activeTab !== "photos" || !hasMorePhotos) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          handleLoadMorePhotos();
        }
      },
      { rootMargin: "400px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [phase, activeTab, hasMorePhotos, isLoadingMore, handleLoadMorePhotos]);

  // ---------------------------------------------------------------------------
  // Lightbox Keyboard Navigation (Esc to close, Arrow keys to navigate)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (activeLightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveLightboxIndex(null);
      } else if (e.key === "ArrowRight") {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev < photos.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === "ArrowLeft") {
        setActiveLightboxIndex((prev) =>
          prev !== null && prev > 0 ? prev - 1 : prev,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLightboxIndex, photos.length]);

  // ---------------------------------------------------------------------------
  // Fallback / 404 state
  // ---------------------------------------------------------------------------
  if (albumNotFound) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif text-copy-primary mb-4">
          Archive Not Found
        </h1>
        <p className="text-copy-secondary max-w-md mb-8">
          The requested album archive could not be located or may have been
          moved.
        </p>
        <Link
          href="/works"
          className="inline-flex items-center gap-2 px-6 py-3 border border-surface-border/80 text-copy-primary hover:text-brand transition-colors text-xs uppercase tracking-widest font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to All Works</span>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative min-h-screen bg-background text-copy-primary",
        className,
      )}
    >
      {/* Top Hairline Loading Bar */}
      <TopLoadingBar progress={loadingProgress} isVisible={showTopLoadingBar} />

      {/* -----------------------------------------------------------------------
          CINEMATIC INTRO OVERLAY
          Sequential fade-in and hold of Title -> Description -> Date -> Fade Out
         ----------------------------------------------------------------------- */}
      {phase === "intro" && (
        <div
          ref={introContainerRef}
          aria-live="polite"
          className="fixed inset-0 z-30 flex flex-col items-center justify-center bg-background px-6 text-center select-none"
        >
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            {/* Cinematic Title */}
            <h1
              ref={introTitleRef}
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-normal tracking-tight text-copy-primary leading-[1.08]"
            >
              {title}
            </h1>

            {/* Cinematic Description */}
            {description && (
              <p
                ref={introDescRef}
                className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-copy-secondary max-w-2xl font-light leading-relaxed font-sans"
              >
                {description}
              </p>
            )}

            {/* Cinematic Date */}
            {formattedDate && (
              <p
                ref={introDateRef}
                className="mt-8 sm:mt-10 text-xs sm:text-sm uppercase tracking-[0.28em] text-copy-secondary/80 font-mono"
              >
                {formattedDate}
              </p>
            )}
          </div>
        </div>
      )}

      {/* -----------------------------------------------------------------------
          MAIN READY CONTENT
         ----------------------------------------------------------------------- */}
      <div
        className={cn(
          "transition-opacity duration-700 pb-36",
          phase === "ready" ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Top Header Bar with Back Link */}
        <div className="pt-24 sm:pt-28 md:pt-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between border-b border-surface-border/40 pb-6 mb-10">
            <Link
              href="/works"
              data-cursor="expand"
              className="group inline-flex items-center gap-2.5 text-xs sm:text-sm uppercase tracking-widest text-copy-secondary hover:text-copy-primary transition-colors font-mono"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Works</span>
            </Link>

            {categoryTitle && (
              <span className="text-xs uppercase tracking-widest text-copy-secondary/80 font-mono">
                {categoryTitle}
              </span>
            )}
          </div>

          {/* Album Title & Metadata Header — Centered Title, then Description, then Date only */}
          <header className="mb-14 sm:mb-20 flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif tracking-tight text-copy-primary">
              {title}
            </h1>

            {description && (
              <p className="mt-5 sm:mt-6 text-md  text-copy-secondary max-w-2xl leading-relaxed ">
                {description}
              </p>
            )}

            {formattedDate && (
              <p className="mt-5 text-xs sm:text-sm uppercase tracking-[0.25em] text-copy-secondary/80 font-mono">
                {formattedDate}
              </p>
            )}
          </header>
        </div>

        {/* ---------------------------------------------------------------------
            TAB 1: PHOTOS (Pinterest-style Masonry Grid)
            Mobile: 2 columns strictly.
            Desktop: 3 to 4 columns.
           --------------------------------------------------------------------- */}
        {activeTab === "photos" && (
          <section
            aria-label="Album Photographs"
            className="px-4 sm:px-8 lg:px-12 max-w-[1700px] mx-auto"
          >
            {photos.length > 0 ? (
              <>
                {/* Pinterest type multi-column masonry grid */}
                <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 [column-fill:_balance]">
                  {photos.map((photo, index) => {
                    const cloudName = resolveCloudName(photo.secureUrl);
                    const isCloudinary =
                      photo.secureUrl.includes("res.cloudinary.com");

                    return (
                      <figure
                        key={photo.id || index}
                        onClick={() => setActiveLightboxIndex(index)}
                        data-cursor="expand"
                        className="group relative break-inside-avoid mb-3 sm:mb-4 overflow-hidden bg-surface-subtle border border-surface-border/40 cursor-pointer transition-transform duration-300 hover:border-surface-border"
                      >
                        <div
                          className="relative w-full overflow-hidden"
                          style={{
                            aspectRatio: photo.aspectRatio || "3 / 4",
                          }}
                        >
                          {isCloudinary ? (
                            <CldImage
                              src={photo.secureUrl}
                              alt={photo.alt}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                              config={{ cloud: { cloudName } }}
                            />
                          ) : (
                            <Image
                              src={photo.secureUrl}
                              alt={photo.alt}
                              fill
                              unoptimized
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                            />
                          )}

                          {/* Hover Scrim */}
                          <div className="absolute inset-0 bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
                        </div>
                      </figure>
                    );
                  })}
                </div>

                {/* Infinite Scroll Sentinel */}
                <div
                  ref={sentinelRef}
                  className="h-14 w-full flex items-center justify-center my-6"
                >
                  {isLoadingMore && (
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-copy-secondary/80 font-mono animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                      <span>Loading more photographs...</span>
                    </div>
                  )}

                  {!hasMorePhotos && photos.length > 0 && (
                    <p className="text-xs uppercase tracking-widest text-copy-secondary/60 font-mono">
                      End of collection • {photos.length} photographs
                    </p>
                  )}
                </div>
              </>
            ) : (
              /* Empty state if folder has no photos yet */
              <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-surface-border/40 max-w-2xl mx-auto p-12">
                <Camera className="w-8 h-8 text-copy-secondary/60 mb-4 stroke-[1.25]" />
                <h3 className="text-lg font-serif text-copy-primary mb-2">
                  No Photographs Available
                </h3>
                <p className="text-xs sm:text-sm text-copy-secondary max-w-md">
                  No photographs have been cataloged in this collection folder
                  yet.
                </p>
              </div>
            )}
          </section>
        )}

        {/* ---------------------------------------------------------------------
            TAB 2: VIDEOS (YouTube Embeds)
           --------------------------------------------------------------------- */}
        {activeTab === "videos" && (
          <section
            aria-label="Album Videos"
            className="px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto"
          >
            {youtubeLinks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {youtubeLinks.map((videoUrl, idx) => {
                  const videoId = getYouTubeVideoId(videoUrl);

                  return (
                    <article
                      key={idx}
                      className="flex flex-col bg-surface-subtle border border-surface-border/40 overflow-hidden shadow-lg"
                    >
                      {/* Responsive 16:9 YouTube Embed */}
                      <div className="relative aspect-video w-full bg-black">
                        {videoId ? (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                            title={`Video ${idx + 1} — ${title}`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                            className="absolute inset-0 w-full h-full border-0"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-copy-secondary text-xs font-mono">
                            Invalid Video Link
                          </div>
                        )}
                      </div>

                      {/* Video Card Footer */}
                      <div className="p-4 sm:p-5 flex items-center justify-between border-t border-surface-border/40">
                        <span className="text-xs uppercase tracking-widest text-copy-secondary font-mono">
                          Film {String(idx + 1).padStart(2, "0")}
                        </span>

                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-copy-secondary hover:text-brand transition-colors font-mono uppercase tracking-wider"
                        >
                          <span>Watch on YouTube</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Empty state if album has no YouTube links */
              <div className="py-20 text-center flex flex-col items-center justify-center border border-dashed border-surface-border/40 max-w-2xl mx-auto p-12">
                <Film className="w-8 h-8 text-copy-secondary/60 mb-4 stroke-[1.25]" />
                <h3 className="text-lg font-serif text-copy-primary mb-2">
                  No Video Records
                </h3>
                <p className="text-xs sm:text-sm text-copy-secondary max-w-md mb-6">
                  This collection contains still photography archives only.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("photos")}
                  className="px-5 py-2.5 border border-surface-border text-xs uppercase tracking-widest text-copy-primary hover:text-brand transition-colors font-mono"
                >
                  View Photographs
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* -----------------------------------------------------------------------
          FIXED BOTTOM TABS WITH FADED GRADIENT
          "Create tabs for photos and videos to filter photos and videos.
           Fixed bottom with a fadeded gradient."
         ----------------------------------------------------------------------- */}
      {phase === "ready" && (
        <nav
          aria-label="Media Type Filter"
          className="fixed bottom-0 inset-x-0 z-40 pointer-events-none flex justify-center pb-6 sm:pb-8 pt-16 bg-gradient-to-t from-background via-background/90 to-transparent backdrop-blur-[2px]"
        >
          <div
            role="tablist"
            className="pointer-events-auto flex items-center p-1.5 rounded-full bg-surface/90 border border-surface-border/60 backdrop-blur-md shadow-2xl transition-all"
          >
            <button
              role="tab"
              aria-selected={activeTab === "photos"}
              onClick={() => setActiveTab("photos")}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300",
                activeTab === "photos"
                  ? "bg-brand text-white dark:text-zinc-950 font-semibold shadow-md"
                  : "text-copy-secondary hover:text-copy-primary hover:bg-surface-subtle",
              )}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photos</span>
              {photos.length > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full ml-0.5",
                    activeTab === "photos"
                      ? "bg-black/20 dark:bg-white/25"
                      : "bg-surface-subtle text-copy-secondary",
                  )}
                >
                  {photos.length}
                </span>
              )}
            </button>

            <button
              role="tab"
              aria-selected={activeTab === "videos"}
              onClick={() => setActiveTab("videos")}
              className={cn(
                "relative flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wider uppercase transition-all duration-300",
                activeTab === "videos"
                  ? "bg-brand text-white dark:text-zinc-950 font-semibold shadow-md"
                  : "text-copy-secondary hover:text-copy-primary hover:bg-surface-subtle",
              )}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos</span>
              {youtubeLinks.length > 0 && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full ml-0.5",
                    activeTab === "videos"
                      ? "bg-black/20 dark:bg-white/25"
                      : "bg-surface-subtle text-copy-secondary",
                  )}
                >
                  {youtubeLinks.length}
                </span>
              )}
            </button>
          </div>
        </nav>
      )}

      {/* -----------------------------------------------------------------------
          LIGHTBOX MODAL FOR PHOTOGRAPHS
         ----------------------------------------------------------------------- */}
      {activeLightboxIndex !== null && photos[activeLightboxIndex] && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photograph Lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 sm:p-8"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setActiveLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-surface/80 border border-surface-border text-copy-primary hover:text-brand transition-colors z-10"
            aria-label="Close Lightbox"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Navigation Controls */}
          {activeLightboxIndex > 0 && (
            <button
              type="button"
              onClick={() =>
                setActiveLightboxIndex((prev) =>
                  prev !== null ? prev - 1 : null,
                )
              }
              className="absolute left-4 sm:left-6 p-2.5 rounded-full bg-surface/80 border border-surface-border text-copy-primary hover:text-brand transition-colors z-10"
              aria-label="Previous photograph"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {activeLightboxIndex < photos.length - 1 && (
            <button
              type="button"
              onClick={() =>
                setActiveLightboxIndex((prev) =>
                  prev !== null ? prev + 1 : null,
                )
              }
              className="absolute right-4 sm:right-6 p-2.5 rounded-full bg-surface/80 border border-surface-border text-copy-primary hover:text-brand transition-colors z-10"
              aria-label="Next photograph"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Active Image */}
          <div className="relative max-w-5xl max-h-[82vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[75vh]">
              {photos[activeLightboxIndex].secureUrl.includes(
                "res.cloudinary.com",
              ) ? (
                <CldImage
                  src={photos[activeLightboxIndex].secureUrl}
                  alt={photos[activeLightboxIndex].alt}
                  fill
                  className="object-contain"
                  config={{
                    cloud: {
                      cloudName: resolveCloudName(
                        photos[activeLightboxIndex].secureUrl,
                      ),
                    },
                  }}
                />
              ) : (
                <Image
                  src={photos[activeLightboxIndex].secureUrl}
                  alt={photos[activeLightboxIndex].alt}
                  fill
                  unoptimized
                  className="object-contain"
                />
              )}
            </div>

            {/* Counter */}
            <div className="mt-4 text-xs font-mono text-copy-secondary uppercase tracking-widest">
              {activeLightboxIndex + 1} / {photos.length} —{" "}
              {photos[activeLightboxIndex].title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SingleWorkGallery;
