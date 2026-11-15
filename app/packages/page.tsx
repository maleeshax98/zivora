import { Suspense } from "react";
import type { Metadata } from "next";
import { PackagesGallery } from "@/components/sections/PackagesGallery";
import { FooterSection } from "@/components/sections/FooterSection";

export const metadata: Metadata = {
  title: "Packages — ZIVORA",
  description:
    "Explore tailored photography and videography packages across wedding, portrait, and creative editorial commissions.",
};

export default function PackagesPage() {
  return (
    <main className="min-h-screen bg-background text-copy-primary">
      <Suspense fallback={null}>
        <PackagesGallery />
      </Suspense>
      <FooterSection />
    </main>
  );
}
