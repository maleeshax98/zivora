"use client";

// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * FooterSection for ZIVORA — Feature Spec 15 (Footer Section).
 *
 * Implements a minimal, cinematic Footer section serving as the elegant final
 * anchor of the website, adhering to established whitespace design principles.
 * Prominently features the required "developed by VINZI" developer credit.
 *
 * Key Capabilities:
 * 1. Generous Whitespace: Spacious, unhurried container (py-20 sm:py-28 lg:py-36)
 *    enforcing generous negative space without unnecessary visual clutter.
 * 2. Developer Credit: Prominently positions "developed by VINZI" at the very bottom
 *    of the footer using the muted, secondary text token (text-copy-secondary) to maintain visual balance.
 * 3. Minimalist Brand Elements: Subtle fluid brand mark ("ZIVORA"), essential navigation anchors,
 *    and a smooth-scrolling "BACK TO TOP" action.
 * 4. Fluid Typography & Theming: Strictly adheres to Warm Light (#EAE6DF) and
 *    Cinematic Dark (#20211F) environments using CSS custom property tokens, avoiding
 *    pure black and pure white.
 * 5. Purposeful Motion: Staggered GSAP scroll entrance with static fallback for
 *    prefers-reduced-motion: reduce.
 *
 * Reference: file named "ZIVORA" verbatim.
 */

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useLenis } from "@/components/smooth-scroll";

export interface FooterSectionProps {
  className?: string;
  brandName?: string;
  developerCredit?: string;
}

export function FooterSection({
  className,
  brandName = "ZIVORA",
  developerCredit = "developed by VINZI",
}: FooterSectionProps) {
  const footerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { getLenis } = useLenis();

  const handleScrollToTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.4 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const footer = footerRef.current;
    const content = contentRef.current;
    if (!footer || !content) return;

    const mm = gsap.matchMedia(footer);

    mm.add(
      {
        isReduced: "(prefers-reduced-motion: reduce)",
        isMotionSafe: "(prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isReduced: reduced } = context.conditions as {
          isReduced?: boolean;
          isMotionSafe?: boolean;
        };

        if (reduced || prefersReducedMotion()) {
          gsap.set(content, { opacity: 1, y: 0, clearProps: "all" });
          return;
        }

        gsap.fromTo(
          content,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footer,
              start: "top 92%",
              once: true,
            },
          }
        );
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      id="footer"
      aria-label="Footer"
      className={cn(
        "relative w-full bg-background text-copy-primary border-t border-surface-border/40 transition-colors duration-300",
        "py-20 sm:py-28 lg:py-36 px-6 sm:px-12 lg:px-20",
        className
      )}
    >
      <div
        ref={contentRef}
        className="max-w-7xl mx-auto flex flex-col justify-between gap-16 sm:gap-24 lg:gap-32"
      >
        {/* Top Tier: Minimalist Brand Anchor & Essential Links */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 sm:gap-16">
          {/* Brand Mark & Tagline */}
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.28em] text-copy-secondary">
              ARCHIVE & STUDIO
            </span>
            <Link
              href="/"
              data-cursor="expand"
              className="inline-block font-serif text-[clamp(2rem,6vw,4.5rem)] font-light tracking-[-0.03em] leading-none text-copy-primary hover:text-brand transition-colors duration-300"
            >
              {brandName}
            </Link>
          </div>

          {/* Navigation Links & Back to Top */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 sm:gap-12 lg:gap-16">
            <nav aria-label="Footer Navigation" className="flex items-center gap-6 sm:gap-8">
              <Link
                href="/works"
                data-cursor="expand"
                className="font-mono text-xs sm:text-sm uppercase tracking-[0.18em] text-copy-secondary hover:text-copy-primary transition-colors"
              >
                WORKS
              </Link>
              <Link
                href="/#services"
                data-cursor="expand"
                className="font-mono text-xs sm:text-sm uppercase tracking-[0.18em] text-copy-secondary hover:text-copy-primary transition-colors"
              >
                SERVICES
              </Link>
              <Link
                href="/#about"
                data-cursor="expand"
                className="font-mono text-xs sm:text-sm uppercase tracking-[0.18em] text-copy-secondary hover:text-copy-primary transition-colors"
              >
                ABOUT
              </Link>
              <Link
                href="/#contact"
                data-cursor="expand"
                className="font-mono text-xs sm:text-sm uppercase tracking-[0.18em] text-copy-secondary hover:text-copy-primary transition-colors"
              >
                CONTACT
              </Link>
            </nav>

            <button
              type="button"
              onClick={handleScrollToTop}
              data-cursor="expand"
              aria-label="Scroll back to top"
              className="group inline-flex items-center gap-2 font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-copy-secondary hover:text-brand transition-colors cursor-pointer bg-transparent border-0 p-0"
            >
              <span>BACK TO TOP</span>
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-1"
              >
                &uarr;
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Tier: Copyright, Visual Balance, and Developer Credit */}
        <div className="pt-8 sm:pt-12 border-t border-surface-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
          {/* Copyright Year */}
          <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-copy-secondary/80">
            &copy; 2026 {brandName}. ALL RIGHTS RESERVED.
          </p>

          {/* Developer Credit: verbatim "developed by VINZI" positioned at very bottom */}
          <p className="font-mono text-[11px] sm:text-xs tracking-[0.16em] text-copy-secondary/80">
            {developerCredit}
          </p>
        </div>
      </div>
    </footer>
  );
}

export { FooterSection as Footer };
export default FooterSection;
