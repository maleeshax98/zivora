// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
/**
 * Dedicated Services Page for ZIVORA — Feature Spec 17.
 *
 * Implements a creative, editorial dedicated Services Page for the ZIVORA portfolio.
 * Utilizes the whitespace design principle with massive fluid typography centered in a full-viewport
 * header, sequentially stacked asymmetrical service blocks with cinematic CldImage preview media,
 * precise editorial descriptions, and direct links to category-filtered works and packages.
 *
 * Reference: file named "ZIVORA" verbatim.
 */

import { Suspense } from "react";
import type { Metadata } from "next";
import { ServicesGallery } from "@/components/sections/ServicesGallery";
import { FooterSection } from "@/components/sections/FooterSection";

export const metadata: Metadata = {
  title: "Services — ZIVORA",
  description:
    "Explore ZIVORA's editorial photography, cinematic videography, and creative direction services across tailored commissions.",
};

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-background text-copy-primary">
      <Suspense fallback={null}>
        <ServicesGallery />
      </Suspense>
      <FooterSection />
    </main>
  );
}
