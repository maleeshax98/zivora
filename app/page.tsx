import { HeroSection } from "@/components/hero/HeroSection";
import { CinematicText } from "@/components/sections/CinematicText";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { AboutSection } from "@/components/sections/AboutSection";
import { ConsistencyBreakText } from "@/components/sections/ConsistencyBreakText";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { SampleGallery } from "@/components/sections/SampleGallery";
import { UserFeedback } from "@/components/sections/UserFeedback";
import { ContactSection } from "@/components/sections/ContactSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { CustomCursor } from "@/components/ui/CustomCursor";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      {/* Custom Trailing Mouse Cursor */}
      <CustomCursor />
      <HeroSection />
      <AboutSection />
      <CinematicText />
      <FeaturedWork />
      <ConsistencyBreakText />

      <ServicesSection />
      <SampleGallery />
      <UserFeedback />

      <ContactSection />
      <FooterSection />
    </div>
  );
}
