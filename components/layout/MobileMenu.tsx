"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLenis } from "@/components/smooth-scroll";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
}

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: NavItem[];
}

/**
 * MobileMenu
 * Immersive full-screen overlay navigation menu for ZIVORA on mobile viewports.
 *
 * Features:
 * - Fullscreen atmospheric overlay with theme-aware background & backdrop blur
 * - Staggered GSAP line-reveal entrance and smooth exit animations
 * - Keyboard focus trap, Escape key support, and screen-reader dialog semantics
 * - Lenis scroll locking to prevent background page scroll while open
 * - Respects system preferences for reduced motion
 */
export function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  const pathname = usePathname();
  const { getLenis } = useLenis();
  const overlayRef = useRef<HTMLDivElement>(null);
  const linksContainerRef = useRef<HTMLUListElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const wasOpenRef = useRef(false);

  // 1. Lock/unlock page scroll (Lenis & native) when menu opens/closes
  useEffect(() => {
    const lenis = getLenis();
    let focusTimer: number | undefined;

    if (isOpen) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
      focusTimer = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 60);
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }

    return () => {
      if (focusTimer !== undefined) {
        window.clearTimeout(focusTimer);
      }
      lenis?.start();
      document.body.style.overflow = "";
    };
  }, [isOpen, getLenis]);

  // 2. Keyboard listener for Escape key and Tab focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && overlayRef.current) {
        const focusable = Array.from(
          overlayRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // 3. GSAP entrance and exit animations
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    const isReduced = prefersReducedMotion();
    const linkElements = linksContainerRef.current?.querySelectorAll("li");
    const innerSpans = linkElements
      ? Array.from(linkElements)
          .map((li) => li.querySelector(".menu-item-inner"))
          .filter(Boolean)
      : [];

    gsap.killTweensOf([overlay, ...innerSpans, footerRef.current].filter(Boolean));

    if (isOpen) {
      wasOpenRef.current = true;
      gsap.set(overlay, { visibility: "visible", pointerEvents: "auto" });

      if (isReduced) {
        gsap.fromTo(
          overlay,
          { opacity: 0 },
          { opacity: 1, duration: 0.2, ease: "none" }
        );
        if (innerSpans.length > 0) {
          gsap.set(innerSpans, { opacity: 1, yPercent: 0 });
        }
        if (footerRef.current) {
          gsap.set(footerRef.current, { opacity: 1, y: 0 });
        }
      } else {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          overlay,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.35, clearProps: "transform" }
        );

        if (innerSpans.length > 0) {
          tl.fromTo(
            innerSpans,
            { yPercent: 120, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.5,
              stagger: 0.07,
              ease: "power3.out",
              clearProps: "transform",
            },
            "-=0.2"
          );
        }

        if (footerRef.current) {
          tl.fromTo(
            footerRef.current,
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.4, clearProps: "transform" },
            "-=0.3"
          );
        }
      }
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;

      if (isReduced) {
        gsap.to(overlay, {
          opacity: 0,
          duration: 0.15,
          ease: "none",
          onComplete: () => {
            gsap.set(overlay, { visibility: "hidden", pointerEvents: "none" });
          },
        });
      } else {
        gsap.to(overlay, {
          opacity: 0,
          y: -12,
          duration: 0.25,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(overlay, {
              visibility: "hidden",
              pointerEvents: "none",
              clearProps: "transform",
            });
          },
        });
      }
    }
  }, [isOpen]);

  return (
    <div
      ref={overlayRef}
      id="mobile-navigation-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation Menu"
      aria-hidden={!isOpen}
      className="fixed inset-0 z-[60] flex flex-col justify-between p-6 sm:p-10 bg-background/95 backdrop-blur-2xl opacity-0 invisible pointer-events-none"
    >
      {/* Top Header Row: Close Button, Centered Brand Mark, Theme Toggle */}
      <div className="w-full flex items-center justify-between relative border-b border-surface-border/30 pb-5">
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="h-11 w-11 flex items-center justify-center -ml-2 rounded-xl text-copy-primary hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <X className="h-6 w-6" strokeWidth={1.75} />
          <span className="sr-only">Close menu</span>
        </button>

        {/* Brand Mark */}
        <Link
          href="/"
          onClick={onClose}
          className="font-serif text-xl font-bold tracking-[0.3em] uppercase text-copy-primary hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
        >
          ZIVORA
        </Link>

        {/* Theme Toggle in Menu */}
        <div className="flex items-center -mr-1">
          <ThemeToggle />
        </div>
      </div>

      {/* Center Navigation Links */}
      <nav aria-label="Mobile Navigation Links" className="flex flex-col justify-center my-auto py-8">
        <ul ref={linksContainerRef} className="space-y-6 sm:space-y-8">
          {links.map((link, index) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <li key={link.href} className="overflow-hidden">
                <div className="menu-item-inner">
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={isActive ? "page" : undefined}
                    className="group flex items-baseline gap-4 py-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-lg transition-transform duration-300 active:scale-95 motion-reduce:transition-none"
                  >
                    <span
                      className={cn(
                        "font-mono text-xs sm:text-sm tracking-widest transition-colors",
                        isActive
                          ? "text-brand"
                          : "text-copy-secondary group-hover:text-brand"
                      )}
                    >
                      0{index + 1}
                    </span>
                    <span
                      className={cn(
                        "font-serif text-3xl sm:text-5xl font-light italic tracking-tight transition-all duration-300 motion-reduce:transition-none",
                        isActive
                          ? "text-brand"
                          : "text-copy-primary group-hover:text-brand group-hover:translate-x-2 motion-reduce:group-hover:translate-x-0"
                      )}
                    >
                      {link.label}
                    </span>
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Editorial Details */}
      <div
        ref={footerRef}
        className="w-full border-t border-surface-border/40 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono tracking-widest text-copy-secondary uppercase"
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          <span>LOS ANGELES // WORLDWIDE</span>
        </div>
        <div>
          <a
            href="mailto:hello@zivora.studio"
            className="hover:text-copy-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
          >
            HELLO@ZIVORA.STUDIO
          </a>
        </div>
      </div>
    </div>
  );
}
