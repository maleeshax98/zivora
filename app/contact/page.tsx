// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * Dedicated Contact Page for ZIVORA — Feature Spec 16.
 *
 * Implements a creative, minimalist dedicated Contact Page for the ZIVORA portfolio.
 * Utilizes the whitespace design principle with massive fluid typography centered in the viewport,
 * prominent direct contact and WhatsApp information (+94 77 051 2373), a horizontally centered
 * borderless contact form with bottom borders only, and linked social media icons.
 *
 * Reference: file named "ZIVORA" verbatim.
 */

import type { Metadata } from "next";
import { ContactSection } from "@/components/sections/ContactSection";
import { FooterSection } from "@/components/sections/FooterSection";

export const metadata: Metadata = {
  title: "Contact — ZIVORA",
  description:
    "Get in touch with ZIVORA for editorial photography, cinematic videography commissions, and creative collaborations. Direct WhatsApp: +94 77 051 2373.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background text-copy-primary">
      <ContactSection />
      <FooterSection />
    </main>
  );
}
