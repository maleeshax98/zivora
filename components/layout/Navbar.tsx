"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileMenu, type NavItem } from "@/components/layout/MobileMenu";
import { cn } from "@/lib/utils";

const NAV_LINKS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Works", href: "/works" },
  { label: "Packages", href: "/packages" },
  { label: "Contact", href: "/contact" },
];

/**
 * Navbar
 * Smart sticky navigation bar for ZIVORA.
 *
 * Key Capabilities:
 * 1. Smart Scroll Behavior: Hides on scroll-down (-translate-y-full), smoothly reveals on scroll-up (translate-y-0)
 * 2. Past-Hero Atmospheric Transition: Transparent over hero, transitions to theme surface with backdrop blur once scrolled past Hero Section
 * 3. Desktop Layout: Editorial navigation links (left), centered brand mark (center), theme toggle (right)
 * 4. Responsive Mobile Design: Centered brand mark with touch-optimized hamburger trigger and full-screen overlay menu
 * 5. Accessibility & Motion: Complete keyboard navigation, visible focus rings, reduced-motion compliant
 */
export function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const lastScrollYRef = useRef(0);
  const headerRef = useRef<HTMLElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  const evaluateScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollYRef.current;
    const deltaThreshold = 8; // Filter out microscopic scroll jitters

    // Determine whether the user has scrolled past the Hero Section (if present)
    const heroSection = document.querySelector<HTMLElement>(
      'section[aria-label="Immersive Hero Section"]'
    );
    const headerHeight = headerRef.current?.offsetHeight ?? 80;
    const pastHero = heroSection
      ? heroSection.getBoundingClientRect().bottom <= headerHeight + 16
      : currentScrollY > 40;

    setIsScrolled(pastHero);

    // Always keep navbar visible near the very top
    if (currentScrollY <= 80) {
      setIsVisible(true);
      lastScrollYRef.current = currentScrollY;
      return;
    }

    // Keep navbar visible when the mobile menu is active
    if (isMobileMenuOpen) {
      setIsVisible(true);
      lastScrollYRef.current = currentScrollY;
      return;
    }

    // Scroll direction detection with delta threshold
    if (Math.abs(scrollDelta) >= deltaThreshold) {
      if (scrollDelta > 0 && currentScrollY > 120) {
        // Scrolling down -> translate off-screen upwards
        setIsVisible(false);
      } else if (scrollDelta < 0) {
        // Scrolling up -> translate back into view
        setIsVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;
    const rafId = window.requestAnimationFrame(evaluateScroll);

    window.addEventListener("scroll", evaluateScroll, { passive: true });
    window.addEventListener("resize", evaluateScroll, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", evaluateScroll);
      window.removeEventListener("resize", evaluateScroll);
    };
  }, [evaluateScroll, pathname]);

  const handleCloseMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
    window.requestAnimationFrame(() => {
      if (hamburgerButtonRef.current && hamburgerButtonRef.current.offsetParent !== null) {
        hamburgerButtonRef.current.focus();
      }
    });
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        role="banner"
        className={cn(
          "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          isVisible ? "translate-y-0" : "-translate-y-full",
          isScrolled
            ? "bg-surface/85 backdrop-blur-md border-b border-surface-border/40 shadow-xs py-3.5 sm:py-4"
            : "bg-transparent border-b border-transparent py-5 sm:py-7"
        )}
      >
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 flex items-center justify-between relative">
          {/* Left: Desktop Navigation Links / Mobile Hamburger Toggle */}
          <div className="flex items-center">
            {/* Desktop Navigation Links */}
            <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => {
                const isActive =
                  link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:bg-brand after:transition-all after:duration-300 motion-reduce:transition-none motion-reduce:after:transition-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm",
                      isActive
                        ? "text-copy-primary after:w-full"
                        : "text-copy-secondary hover:text-copy-primary after:w-0 hover:after:w-full"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Hamburger Button */}
            <button
              ref={hamburgerButtonRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
              className="md:hidden h-11 w-11 -ml-2.5 flex flex-col justify-center items-center gap-1.5 text-copy-primary hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-xl"
            >
              <span className="w-5 h-[1.5px] bg-current transition-transform motion-reduce:transition-none" />
              <span className="w-5 h-[1.5px] bg-current transition-transform motion-reduce:transition-none" />
              <span className="sr-only">Toggle navigation menu</span>
            </button>
          </div>

          {/* Center: Brand Mark */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
            <Link
              href="/"
              className="font-serif text-xl sm:text-2xl font-bold tracking-[0.3em] uppercase text-copy-primary hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm select-none"
            >
              ZIVORA
            </Link>
          </div>

          {/* Right: Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMenu}
        links={NAV_LINKS}
      />
    </>
  );
}
