import { Suspense } from "react";
import type { Metadata } from "next";
import { WorksGallery } from "@/components/sections/WorksGallery";
import { FooterSection } from "@/components/sections/FooterSection";

export const metadata: Metadata = {
  title: "Works — ZIVORA",
  description: "A cinematic, editorial archive of photography and videography collections.",
};

export default function WorksPage() {
  return (
    <main className="min-h-screen bg-background text-copy-primary">
      <Suspense fallback={null}>
        <WorksGallery />
      </Suspense>
      <FooterSection />
    </main>
  );
}
