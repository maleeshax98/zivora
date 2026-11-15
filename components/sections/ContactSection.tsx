"use client";

// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * ContactSection for ZIVORA — Creative Minimal Contact Redesign.
 *
 * Implements an expansive, whitespace-driven editorial contact layout featuring:
 * 1. Expansive Whitespace: Full-viewport container (`min-h-[100dvh]`) creating a clean,
 *    uncluttered editorial atmosphere.
 * 2. Absolute Visual Center: Massive fluid typography call-to-action ("LET'S TALK.")
 *    dominating the visual center of the section.
 * 3. Direct Contact Info: Prominently displayed WhatsApp and direct phone (+94 77 051 2373)
 *    positioned beneath the central headline with secondary muted tokens and wa.me integration.
 * 4. Centered Minimal Form: Minimal, borderless contact form horizontally centered within
 *    the layout with plain text inputs, subtle bottom hairline borders, and `SEND INQUIRY ->` action.
 * 5. Linked Social Media Icons: Elegantly integrated stroke-based icons (Instagram, YouTube,
 *    WhatsApp, Email) positioned directly below the centered form.
 * 6. Responsive Fluidity: Collapses fluidly into a clean, center-aligned vertical stack on mobile.
 * 7. Purposeful Motion (GSAP): Subtle, staggered ScrollTrigger entrance animation with
 *    accessible fallback for `prefers-reduced-motion: reduce`.
 * 8. Dual-Theme Support: Adheres to Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) tokens
 *    without hardcoded pure black or white.
 *
 * Reference: file named "ZIVORA" verbatim.
 */

import React, { useEffect, useRef, useState } from "react";
import { MessageCircle, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { submitContactAction, type ContactSubmissionResult } from "@/app/contact/actions";

export interface SocialLinkItem {
  label: string;
  href: string;
  icon: "instagram" | "youtube" | "whatsapp" | "mail";
}

const DEFAULT_SOCIAL_LINKS: SocialLinkItem[] = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: "instagram",
  },
  {
    label: "YouTube",
    href: "https://youtube.com",
    icon: "youtube",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/94770512373",
    icon: "whatsapp",
  },
  {
    label: "Email",
    href: "mailto:hello@zivora.com",
    icon: "mail",
  },
];

// Stroke-based icons adhering to project's lucide-react design geometry
function InstagramIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  );
}

function renderSocialIcon(icon: SocialLinkItem["icon"]) {
  switch (icon) {
    case "instagram":
      return <InstagramIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />;
    case "youtube":
      return <YoutubeIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />;
    case "whatsapp":
      return <MessageCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />;
    case "mail":
      return <Mail className="w-4 h-4 sm:w-[18px] sm:h-[18px]" strokeWidth={1.5} />;
    default:
      return null;
  }
}

export interface ContactSectionProps {
  headlineLine1?: string;
  headlineLine2?: string;
  italicizeLine2?: boolean;
  directContactNumber?: string;
  whatsAppHref?: string;
  socialLinks?: SocialLinkItem[];
  onSubmitAction?: (data: {
    name: string;
    email: string;
    scope?: string;
  }) => Promise<ContactSubmissionResult>;
  className?: string;
}

export function ContactSection({
  headlineLine1 = "LET'S",
  headlineLine2 = "TALK.",
  italicizeLine2 = true,
  directContactNumber = "+94 77 051 2373",
  whatsAppHref = "https://wa.me/94770512373",
  socialLinks = DEFAULT_SOCIAL_LINKS,
  onSubmitAction = submitContactAction,
  className,
}: ContactSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const socialsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Form interactive state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    scope: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError("Please share your name and email so we know how to reach you.");
      return;
    }
    setFormError(null);
    setFormStatus("submitting");

    try {
      const result = await onSubmitAction({
        name: formData.name,
        email: formData.email,
        scope: formData.scope,
      });

      if (result.success) {
        setFormStatus("submitted");
      } else {
        setFormStatus("idle");
        setFormError(
          result.error ||
            "We could not deliver your note right now. Please reach us directly on WhatsApp or email, or try again in a moment."
        );
      }
    } catch (err) {
      console.error("[Contact Form Dispatch Error]", err);
      setFormStatus("idle");
      setFormError(
        "We could not deliver your note right now. Please reach us directly on WhatsApp or email, or try again in a moment."
      );
    }
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
    const phone = phoneRef.current;
    const formContainer = formContainerRef.current;
    const socials = socialsRef.current;

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

        const animTargets = [headline, phone, formContainer, socials].filter(
          Boolean
        ) as HTMLElement[];

        if (reduced || prefersReducedMotion()) {
          gsap.set(animTargets, {
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
        );

        if (phone) {
          tl.fromTo(
            phone,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              clearProps: "transform",
            },
            "-=0.6"
          );
        }

        tl.fromTo(
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

        if (socials) {
          tl.fromTo(
            socials,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: "power2.out",
              clearProps: "transform",
            },
            "-=0.5"
          );
        }
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

        {/* Direct Contact Info & WhatsApp */}
        {directContactNumber && (
          <div
            ref={phoneRef}
            className="mt-6 sm:mt-10 flex items-center justify-center text-center"
          >
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="expand"
              className="group inline-flex items-center gap-2.5 sm:gap-3 font-mono text-xs sm:text-sm lg:text-[15px] uppercase tracking-[0.2em] text-copy-secondary hover:text-copy-primary transition-colors duration-300"
              aria-label={`Direct contact and WhatsApp: ${directContactNumber}`}
            >
              <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                DIRECT / WHATSAPP:
              </span>
              <span className="text-copy-primary font-medium group-hover:text-brand underline underline-offset-4 decoration-surface-border transition-colors">
                {directContactNumber}
              </span>
            </a>
          </div>
        )}
      </div>

      {/* Centered Minimal Contact Form */}
      <div
        ref={formContainerRef}
        className="relative z-10 w-full flex flex-col items-center justify-center pt-8 sm:pt-12 lg:pt-14 pb-8 sm:pb-12"
      >
        <div className="w-full max-w-lg lg:max-w-xl mx-auto space-y-5 sm:space-y-6">
          {formStatus === "submitted" ? (
            <div
              role="status"
              aria-live="polite"
              className="p-7 sm:p-9 rounded-none border border-surface-border/80 bg-surface/80 text-left space-y-4"
            >
              

              <h3 className="font-serif text-xl sm:text-2xl text-copy-primary font-normal leading-snug">
                Thank you for reaching out.
              </h3>

              <p className="text-sm sm:text-base dark:text-copy-secondary font-serif leading-relaxed ">
                Every memorable project starts with a conversation. We will personally read through
                your note and get back to you shortly with thoughts and next steps.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-surface-border/40">
                <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.16em] text-copy-secondary/80">
                  Prefer a quick chat?{" "}
                  <a
                    href={whatsAppHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand underline underline-offset-4 hover:text-copy-primary transition-colors"
                  >
                    WhatsApp us
                  </a>
                </p>

                <button
                  type="button"
                  onClick={handleReset}
                  data-cursor="expand"
                  className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.2em] text-copy-secondary hover:text-copy-primary underline underline-offset-4 transition-colors text-left sm:text-right"
                >
                  Write another note &rarr;
                </button>
              </div>
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
                <p role="alert" className="font-mono text-[11px] sm:text-xs text-destructive tracking-[0.1em]">
                  {formError}
                </p>
              )}

              {/* Submit Controls: Human Sending Feedback + SEND INQUIRY -> */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 sm:pt-4">
                {formStatus === "submitting" ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="flex items-center gap-2 font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-copy-secondary"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" aria-hidden="true" />
                    <span>Delivering your note...</span>
                  </div>
                ) : (
                  <span className="hidden sm:inline-block" aria-hidden="true" />
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    data-cursor="expand"
                    className="inline-flex items-center gap-2 bg-transparent border-0 p-0 font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-copy-primary hover:text-brand transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {formStatus === "submitting" ? (
                      <span>SENDING...</span>
                    ) : (
                      <>
                        <span>SEND INQUIRY</span>
                        <span aria-hidden="true">&rarr;</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Linked Social Media Icons directly below centered form */}
        {socialLinks && socialLinks.length > 0 && (
          <div
            ref={socialsRef}
            className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="expand"
                  aria-label={item.label}
                  title={item.label}
                  className="group flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-surface-border/50 hover:border-brand text-copy-secondary hover:text-brand bg-transparent hover:bg-surface/50 transition-all duration-300"
                >
                  {renderSocialIcon(item.icon)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ContactSection;
