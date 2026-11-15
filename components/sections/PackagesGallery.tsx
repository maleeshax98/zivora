"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchPackageCategoriesAction,
  fetchPackagesByCategoryAction,
  type CategoryItem,
  type PackageItem,
} from "@/app/packages/actions";

export interface CategoryTab {
  id: string;
  title: string;
  slug: string;
  coverImage?: string | null;
}

export interface PackagesGalleryProps {
  className?: string;
}

function resolveCloudName(src?: string | null): string {
  if (!src) return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
  const match = src.match(/^https?:\/\/res\.cloudinary\.com\/([^/]+)\//i);
  if (match?.[1]) {
    return match[1];
  }
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "pso8u1zy";
}

/**
 * TopLoadingBar
 * Minimalist hairline progress bar positioned at the top of the viewport
 * indicating initial data load progress.
 */
function TopLoadingBar({ progress, isVisible }: { progress: number; isVisible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 h-[2.5px] pointer-events-none bg-surface-border/20 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0"
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
 * PackageCard
 * Renders a single package card with title, pricing, deliverables list, badge,
 * and high-contrast styling when highlighted.
 */
export function PackageCard({ pkg }: { pkg: PackageItem }) {
  const isHighlighted = Boolean(pkg.isHighlited);

  // WhatsApp click-to-chat URL (+94 77 051 2373)
  const whatsappNumber = "94770512373";
  const packageName = pkg.title || "selected";
  const categoryName = pkg.category?.title;
  const packagePrice = pkg.price;

  let inquiryMessage = `Hello ZIVORA, I would like to inquire about the ${packageName} package`;
  if (categoryName) {
    inquiryMessage += ` for ${categoryName}`;
  }
  if (packagePrice) {
    inquiryMessage += ` (${packagePrice})`;
  }
  inquiryMessage += ".";

  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    inquiryMessage
  )}`;

  return (
    <article
      className={cn(
        "group relative flex flex-col justify-between transition-all duration-500",
        isHighlighted
          ? "bg-surface/75 border-2 border-brand/90 p-8 sm:p-10 shadow-[0_8px_32px_rgba(181,155,126,0.14)]"
          : "bg-surface/40 border border-surface-border/50 p-8 sm:p-10 hover:border-surface-border/90"
      )}
    >
      <div>
        {/* Top Header: Badge and highlighted indicator */}
        <div className="flex items-center justify-between min-h-[28px] mb-6">
          {pkg.badge ? (
            <span
              className={cn(
                "inline-block font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.22em] px-2.5 py-1",
                isHighlighted
                  ? "bg-brand text-background font-semibold"
                  : "bg-surface-subtle text-brand border border-surface-border/60"
              )}
            >
              {pkg.badge}
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-copy-secondary/60">
              PACKAGE
            </span>
          )}

          {isHighlighted && (
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-brand font-medium">
              FEATURED
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif text-3xl sm:text-4xl font-light tracking-[-0.01em] text-copy-primary">
          {pkg.title}
        </h3>

        {/* Price */}
        {pkg.price ? (
          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light text-brand">
              {pkg.price}
            </span>
          </div>
        ) : (
          <div className="mt-4">
            <span className="font-serif text-2xl font-light text-copy-secondary italic">
              Custom Quote
            </span>
          </div>
        )}

        {/* Hairline Divider */}
        <div className="border-b border-surface-border/40 my-6 sm:my-8" />

        {/* Deliverables */}
        {Array.isArray(pkg.deliverables) && pkg.deliverables.length > 0 && (
          <div className="mb-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-copy-secondary/80 mb-4">
              Included Deliverables
            </p>
            <ul className="flex flex-col gap-3.5">
              {pkg.deliverables.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm sm:text-[15px] text-copy-secondary leading-relaxed"
                >
                  <Check
                    aria-hidden="true"
                    className="h-4 w-4 text-brand shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Action CTA Link */}
      <div className="pt-4 mt-auto">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="expand"
          className={cn(
            "block w-full py-4 px-6 text-center font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            isHighlighted
              ? "bg-brand text-background hover:bg-brand/90 font-medium"
              : "border border-surface-border hover:border-brand hover:text-brand text-copy-primary"
          )}
        >
          Inquire Package
        </a>
      </div>
    </article>
  );
}

/**
 * PackagesGallery
 *
 * Implements the Packages page:
 * 1. Fetches categories and packages based on category.
 * 2. Reads category from URL parameters (e.g. `?category=wedding-photography`).
 * 3. When a user clicks a category, displays the category cover image as a faded background
 *    with a smooth gradient overlay melting into the canvas, and renders the category name directly on top of it.
 * 4. Updates and maintains the active category in URL parameters so the view is shareable.
 * 5. Smoothly transitions package cards with highlighted card support and deliverables checklist.
 */
export function PackagesGallery({ className }: PackagesGalleryProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL query parameter for category
  const categoryParam = searchParams.get("category");

  const [categories, setCategories] = useState<CategoryTab[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isCategorySwitching, setIsCategorySwitching] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(25);
  const [showTopLoadingBar, setShowTopLoadingBar] = useState(true);

  const initialParamRef = useRef(categoryParam);

  // Derive active category slug: from URL parameter if valid, otherwise first available category
  const activeCategorySlug =
    categoryParam && categories.some((c) => c.slug === categoryParam)
      ? categoryParam
      : categories[0]?.slug || "";

  // Phase 1: Load categories on mount and resolve initial packages
  useEffect(() => {
    let isCancelled = false;

    const progressTimer1 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(55);
    }, 150);
    const progressTimer2 = setTimeout(() => {
      if (!isCancelled) setLoadingProgress(85);
    }, 400);

    const initCategoriesAndPackages = async () => {
      try {
        const categoriesData = await fetchPackageCategoriesAction();
        if (isCancelled) return;

        const mapped: CategoryTab[] = (categoriesData ?? [])
          .filter((cat: CategoryItem) => cat.slug?.current)
          .map((cat: CategoryItem) => ({
            id: cat._id,
            title: cat.title || "",
            slug: cat.slug?.current || cat._id,
            coverImage: cat.coverImage,
          }));

        setCategories(mapped);

        // Resolve target category slug from initial param or first category
        const targetSlug =
          mapped.find((c) => c.slug === initialParamRef.current)?.slug ||
          mapped[0]?.slug ||
          "";

        if (targetSlug) {
          const initialPackages = await fetchPackagesByCategoryAction(targetSlug);
          if (isCancelled) return;
          setPackages(initialPackages);
        }

        setLoadingProgress(100);
        setTimeout(() => {
          if (!isCancelled) {
            setShowTopLoadingBar(false);
            setIsReady(true);
          }
        }, 250);
      } catch (error) {
        console.error("Failed to load initial packages data:", error);
        if (!isCancelled) {
          setLoadingProgress(100);
          setShowTopLoadingBar(false);
          setIsReady(true);
        }
      }
    };

    initCategoriesAndPackages();

    return () => {
      isCancelled = true;
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
    };
  }, []);

  // Phase 2: React to category switch (when activeCategorySlug changes and isReady)
  useEffect(() => {
    if (!isReady || !activeCategorySlug) return;

    let isCancelled = false;
    const fetchCategoryPackages = async () => {
      setIsCategorySwitching(true);
      try {
        const pkgs = await fetchPackagesByCategoryAction(activeCategorySlug);
        if (!isCancelled) {
          setPackages(pkgs);
        }
      } catch (error) {
        console.error("Failed to switch category packages:", error);
      } finally {
        if (!isCancelled) {
          setIsCategorySwitching(false);
        }
      }
    };

    fetchCategoryPackages();

    return () => {
      isCancelled = true;
    };
  }, [activeCategorySlug, isReady]);

  // Handle user clicking a category tab
  const handleCategoryClick = (slug: string) => {
    if (slug === activeCategorySlug) return;
    // Maintain active category in URL parameter so the view is shareable
    router.push(`/packages?category=${encodeURIComponent(slug)}`, { scroll: false });
  };

  // Identify currently active category object
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);

  return (
    <section className={cn("relative w-full min-h-screen bg-background", className)}>
      {/* Top Hairline Loading Progress Bar */}
      <TopLoadingBar progress={loadingProgress} isVisible={showTopLoadingBar} />

      <div
        className={cn(
          "max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-28 sm:pt-36 lg:pt-44 pb-24 sm:pb-32 transition-opacity duration-700",
          isReady ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Category Navigation Bar */}
        {categories.length > 0 && (
          <nav
            aria-label="Filter packages by service category"
            className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar pb-3 border-b border-surface-border/30 mb-10 sm:mb-14"
          >
            {categories.map((cat) => {
              const isActive = cat.slug === activeCategorySlug;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={cn(
                    "text-xs sm:text-sm uppercase tracking-[0.18em] whitespace-nowrap transition-colors duration-200 pb-2 -mb-[13px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand",
                    isActive
                      ? "text-copy-primary font-medium border-b-2 border-brand"
                      : "text-copy-secondary hover:text-copy-primary"
                  )}
                >
                  {cat.title}
                </button>
              );
            })}
          </nav>
        )}

        {/* Category Cover Hero: Faded Background Image with Smooth Gradient Overlay & Name On Top */}
        {activeCategory && (
          <div className="relative w-full h-[32vh] sm:h-[40vh] md:h-[46vh] min-h-[240px] max-h-[440px] overflow-hidden mb-12 sm:mb-16 flex items-center justify-center text-center px-6">
            {activeCategory.coverImage && (
              <>
                {/* Faded Background Cover Image */}
                <div className="absolute inset-0">
                  {typeof activeCategory.coverImage === "string" &&
                  activeCategory.coverImage.includes("res.cloudinary.com") ? (
                    <CldImage
                      src={activeCategory.coverImage}
                      alt={activeCategory.title || "Category Cover"}
                      fill
                      priority
                      sizes="100vw"
                      config={{
                        cloud: {
                          cloudName: resolveCloudName(activeCategory.coverImage),
                        },
                      }}
                      className="object-cover object-center w-full h-full opacity-40 dark:opacity-35 transition-opacity duration-700"
                    />
                  ) : (
                    <Image
                      src={activeCategory.coverImage}
                      alt={activeCategory.title || "Category Cover"}
                      fill
                      unoptimized
                      priority
                      sizes="100vw"
                      className="object-cover object-center w-full h-full opacity-40 dark:opacity-35 transition-opacity duration-700"
                    />
                  )}
                </div>

                {/* Smooth Gradient Overlays Melting Seamlessly into Canvas */}
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

            {/* Category Name Rendered Directly on Top */}
            <h1 className="relative z-10 font-serif text-[clamp(2.5rem,1.8rem+3.2vw,5.5rem)] font-light leading-[1.08] tracking-[-0.02em] text-copy-primary text-balance">
              {activeCategory.title}
            </h1>
          </div>
        )}

        {/* Packages Grid */}
        <div
          className={cn(
            "transition-opacity duration-300",
            isCategorySwitching ? "opacity-50 pointer-events-none" : "opacity-100"
          )}
        >
          {packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-8 lg:gap-8 xl:gap-10">
              {packages.map((pkg) => (
                <PackageCard key={pkg._id} pkg={pkg} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-surface-border/40 p-12 bg-surface/20">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
                CUSTOM COMMISSIONS
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-copy-primary mt-3 font-light">
                Tailored Proposals & Bespoke Coverage
              </h2>
              <p className="max-w-md mx-auto text-sm sm:text-[15px] text-copy-secondary mt-3 leading-relaxed">
                Currently, no fixed packages are listed for this category. We craft customized quotes
                and coverage options based on your exact vision and schedule.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={`https://wa.me/94770512373?text=${encodeURIComponent(
                    `Hello ZIVORA, I would like to inquire about bespoke coverage${
                      activeCategory?.title ? ` for ${activeCategory.title}` : ""
                    }.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="expand"
                  className="inline-block py-3 px-8 font-mono text-xs uppercase tracking-[0.18em] border border-brand bg-brand text-background hover:bg-brand/90 transition-colors duration-300"
                >
                  Inquire on WhatsApp
                </a>
                <Link
                  href="/contact"
                  data-cursor="expand"
                  className="inline-block py-3 px-8 font-mono text-xs uppercase tracking-[0.18em] border border-surface-border text-copy-primary hover:border-brand hover:text-brand transition-colors duration-300"
                >
                  Contact Form
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default PackagesGallery;
