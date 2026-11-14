"use client";

// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * ContactSection for ZIVORA — Creative Minimal Contact Redesign.
 *
 * Implements a dramatic, whitespace-driven finale utilizing massive typography
 * centered in the viewport and a directly embedded, asymmetrical minimal contact form
 * anchored to the bottom-right corner.
 *
 * Key Capabilities:
 * 1. Expansive Whitespace: Full-viewport container (`min-h-[100dvh]`) creating a clean,
 *    uncluttered editorial atmosphere.
 * 2. Absolute Visual Center: Massive fluid typography call-to-action ("LET'S TALK.")
 *    dominating the visual center of the section.
 * 3. Asymmetrical Form Anchor: Minimal, borderless contact form positioned directly below
 *    the central typography and anchored to the bottom-right corner.
 * 4. Minimal Form Styling: Plain text inputs with subtle bottom hairline borders only (no box borders),
 *    secondary muted typography tokens, and a clean text-based submit button (`SEND INQUIRY ->`).
 * 5. Strict Removals: Completely eliminates bottom-left social links, hover-reveal cursor
 *    physics, and secondary header/footer bars.
 * 6. Responsive Fluidity: Collapses into a centered, vertically stacked layout on mobile
 *    viewports with touch-friendly spacing.
 * 7. Purposeful Motion (GSAP): Subtle, staggered ScrollTrigger entrance animation with
 *    accessible fallback for `prefers-reduced-motion: reduce`.
 * 8. Dual-Theme Support: Adheres to Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) tokens
 *    without hardcoded pure black or white.
 *
 * Reference: file named "ZIVORA" verbatim.
 */

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export interface ContactSectionProps {
  headlineLine1?: string;
  headlineLine2?: string;
  italicizeLine2?: boolean;
  className?: string;
}

export function ContactSection({
  headlineLine1 = "LET'S",
  headlineLine2 = "TALK.",
  italicizeLine2 = true,
  className,
}: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form interactive state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    scope: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Please provide your name and email address.");
      return;
    }
    setFormError(null);
    setFormStatus("submitting");

    // Simulate editorial dispatch
    setTimeout(() => {
      setFormStatus("submitted");
    }, 600);
  };

  const handleReset = () => {
    setFormData({ name: "", email: "", scope: "" });
    setFormStatus("idle");
    setFormError(null);
  };

  // GSAP Staggered ScrollTrigger Entrance Animation
  useEffect(() => {
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const formContainer = formContainerRef.current;

    if (!section || !headline || !formContainer) return;

    const mm = gsap.matchMedia(section);

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

        if (reduced || prefersReducedMotion()) {
          gsap.set([headline, formContainer], {
            opacity: 1,
            y: 0,
            clearProps: "all",
          });
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            once: true,
          },
        });

        tl.fromTo(
          headline,
          { opacity: 0, y: 44, scale: 0.98 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.1,
            ease: "power3.out",
            clearProps: "transform",
          }
        ).fromTo(
          formContainer,
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            clearProps: "transform",
          },
          "-=0.5"
        );
      }
    );

    return () => {
      mm.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-label="Creative Contact Section"
      className={cn(
        "relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-background text-copy-primary px-6 sm:px-12 lg:px-20 py-12 sm:py-16 lg:py-20 select-none transition-colors duration-500",
        className
      )}
    >
      {/* Background Architectural Watermark / Tone Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.04] bg-[radial-gradient(circle_at_center,var(--foreground)_1px,transparent_1px)] bg-[size:32px_32px]"
      />

      {/* Top Spacer to preserve expansive whitespace above center typography */}
      <div className="w-full flex-1 min-h-[4vh] sm:min-h-[8vh]" aria-hidden="true" />

      {/* Center Focus: Massive Fluid Typography Call-to-Action */}
      <div
        ref={headlineRef}
        className="relative z-10 w-full flex flex-col items-center justify-center my-auto py-8 sm:py-12 text-center"
      >
        <h2
          className="flex flex-col sm:flex-row items-center justify-center font-serif font-normal tracking-[-0.04em] leading-[0.86] text-copy-primary text-center gap-x-4 sm:gap-x-6"
          style={{
            fontSize: "clamp(3.5rem, 14vw, 17.5rem)",
          }}
        >
          <span className="block">{headlineLine1}</span>
          <span
            className={cn(
              "block",
              italicizeLine2 && "font-serif italic text-brand"
            )}
          >
            {headlineLine2}
          </span>
        </h2>
      </div>

      {/* Asymmetrical Anchor: Minimal Borderless Contact Form (Bottom-Right) */}
      <div
        ref={formContainerRef}
        className="relative z-10 w-full flex justify-center md:justify-end mt-auto pt-8 sm:pt-12 lg:pt-14"
      >
        <div className="w-full max-w-lg lg:max-w-[32rem] xl:max-w-[36rem] space-y-5 sm:space-y-6">
          {formStatus === "submitted" ? (
            <div
              role="status"
              aria-live="polite"
              className="p-6 sm:p-7 rounded-none border border-surface-border bg-surface text-left space-y-3.5"
            >
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.2em] text-brand">
                {"INQUIRY TRANSMITTED //"}
              </p>
              <p className="text-sm sm:text-base text-copy-primary font-serif leading-relaxed">
                Thank you. Your inquiry has been received. Our studio will connect within 24 business
                hours.
              </p>
              <button
                type="button"
                onClick={handleReset}
                data-cursor="expand"
                className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-copy-secondary hover:text-copy-primary underline underline-offset-4"
              >
                [ Send Another Message ]
              </button>
            </div>
          ) : (
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-5 sm:space-y-6 text-left"
              noValidate
            >
              {/* Field 1: Name / Studio */}
              <div>
                <label htmlFor="contact-name" className="sr-only">
                  NAME / STUDIO *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="NAME / STUDIO *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border-b border-surface-border/80 focus:border-brand bg-transparent px-0 py-3.5 sm:py-4 font-mono text-xs sm:text-sm lg:text-[15px] uppercase tracking-[0.16em] text-copy-primary placeholder:text-copy-secondary/60 outline-none rounded-none transition-colors"
                />
              </div>

              {/* Field 2: Email Address */}
              <div>
                <label htmlFor="contact-email" className="sr-only">
                  EMAIL ADDRESS *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="EMAIL ADDRESS *"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border-b border-surface-border/80 focus:border-brand bg-transparent px-0 py-3.5 sm:py-4 font-mono text-xs sm:text-sm lg:text-[15px] uppercase tracking-[0.16em] text-copy-primary placeholder:text-copy-secondary/60 outline-none rounded-none transition-colors"
                />
              </div>

              {/* Field 3: Brief Scope or Timeline */}
              <div>
                <label htmlFor="contact-scope" className="sr-only">
                  BRIEF SCOPE OR TIMELINE (OPTIONAL)
                </label>
                <input
                  id="contact-scope"
                  type="text"
                  placeholder="BRIEF SCOPE OR TIMELINE (OPTIONAL)"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  className="w-full border-b border-surface-border/80 focus:border-brand bg-transparent px-0 py-3.5 sm:py-4 font-mono text-xs sm:text-sm lg:text-[15px] uppercase tracking-[0.16em] text-copy-primary placeholder:text-copy-secondary/60 outline-none rounded-none transition-colors"
                />
              </div>

              {formError && (
                <p className="font-mono text-[11px] sm:text-xs text-destructive tracking-[0.1em]">
                  {formError}
                </p>
              )}

              {/* Submit Button: Plain text-based SEND INQUIRY -> aligned bottom-right */}
              <div className="flex justify-end pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={formStatus === "submitting"}
                  data-cursor="expand"
                  className="inline-flex items-center gap-2 bg-transparent border-0 p-0 font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-copy-primary hover:text-brand transition-colors cursor-pointer disabled:opacity-50"
                >
                  {formStatus === "submitting" ? (
                    <span>TRANSMITTING...</span>
                  ) : (
                    <>
                      <span>SEND INQUIRY</span>
                      <span aria-hidden="true">&rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default ContactSection;
