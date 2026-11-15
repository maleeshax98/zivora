import { HeroSection, type HeroImageItem } from "@/components/hero/HeroSection";
import { CinematicText } from "@/components/sections/CinematicText";
import {
  FeaturedWork,
  type FeaturedProjectItem,
} from "@/components/sections/FeaturedWork";
import { AboutSection } from "@/components/sections/AboutSection";
import { ConsistencyBreakText } from "@/components/sections/ConsistencyBreakText";
import {
  ServicesSection,
  type ServiceItem,
} from "@/components/sections/ServicesSection";
import {
  SampleGallery,
  type SampleGalleryItem,
} from "@/components/sections/SampleGallery";
import {
  UserFeedback,
  type FeedbackCardItem,
} from "@/components/sections/UserFeedback";
import { ContactSection } from "@/components/sections/ContactSection";
import { FooterSection } from "@/components/sections/FooterSection";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { getSampleGalleryImages } from "@/lib/cd";
import { sanityFetch } from "@/lib/sanity/live";
import {
  CATEGORIES_QUERY,
  FEATURED_ALBUMS_QUERY,
  FEEDBACKS_QUERY,
  HERO_IMAGES_QUERY,
} from "@/lib/sanity/queries";

async function getHeroImages(): Promise<HeroImageItem[]> {
  "use cache";
  try {
    const { data: heroData } = await sanityFetch({ query: HERO_IMAGES_QUERY });
    if (heroData && heroData.length > 0) {
      return heroData.slice(0, 6).map((item) => ({
        id: item._id,
        src: item.coverImage || "",
        alt: item.title || "ZIVORA Hero Image",
        title: item.title || "",
        aspectRatio: "3 / 4",
      }));
    }
  } catch (error) {
    console.warn(
      "Failed to fetch hero images from Sanity Content Lake:",
      error,
    );
  }
  return [];
}

async function getFeaturedWorks(): Promise<FeaturedProjectItem[]> {
  "use cache";
  try {
    const { data: albums } = await sanityFetch({
      query: FEATURED_ALBUMS_QUERY,
    });
    if (albums && albums.length > 0) {
      return albums.map((album) => {
        const year = album.eventDate
          ? album.eventDate.slice(0, 4)
          : album.publishedAt
            ? album.publishedAt.slice(0, 4)
            : "";

        return {
          id: album._id,
          title: album.title || "",
          category: album.category?.title || "",
          year,
          imageUrl: album.coverImage || "",
          imageAlt: `${album.title || "Featured Work"}${album.category?.title ? ` - ${album.category.title}` : ""}`,
          href: album.slug?.current ? `/works/${album.slug.current}` : "/works",
        };
      });
    }
  } catch (error) {
    console.warn(
      "Failed to fetch featured works from Sanity Content Lake:",
      error,
    );
  }
  return [];
}

function extractPlainTextFromPortableText(blocks: unknown): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";
  return blocks
    .map((block) => {
      if (block?._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children
        .map((child: { text?: string }) => child?.text || "")
        .join("");
    })
    .filter(Boolean)
    .join("\n\n");
}

async function getCategories(): Promise<ServiceItem[]> {
  "use cache";
  try {
    const { data: categories } = await sanityFetch({
      query: CATEGORIES_QUERY,
    });
    if (categories && categories.length > 0) {
      return categories.map((cat, index) => {
        const slug = cat.slug?.current || "";
        const portableDescription = extractPlainTextFromPortableText(
          cat.description,
        );
        const description = portableDescription.trim() || undefined;

        return {
          id: cat._id,
          number: String(index + 1).padStart(2, "0"),
          title: cat.title || "",
          subtitle: slug ? slug.replace(/-/g, " ").toUpperCase() : undefined,
          description,
          imageUrl: cat.coverImage || "",
          imageAlt: `${cat.title || "Category"} - ZIVORA Portfolio Discipline`,
        };
      });
    }
  } catch (error) {
    console.warn("Failed to fetch categories from Sanity Content Lake:", error);
  }
  return [];
}

async function getSampleGallery(): Promise<SampleGalleryItem[]> {
  "use cache";
  try {
    const images = await getSampleGalleryImages();
    return images;
  } catch (error) {
    console.warn(
      "Failed to fetch sample gallery images from Cloudinary:",
      error,
    );
  }
  return [];
}

async function getFeedbacks(): Promise<FeedbackCardItem[]> {
  "use cache";
  try {
    const { data: feedbacks } = await sanityFetch({
      query: FEEDBACKS_QUERY,
    });
    if (feedbacks && feedbacks.length > 0) {
      return feedbacks.map((item, index) => {
        const year = item.publishedAt ? item.publishedAt.slice(0, 4) : "";
        return {
          id: item._id,
          tag: item.tag
            ? `${item.tag.toUpperCase()}`
            : `${String(index + 1).padStart(2, "0")}`,
          quote: item.feedback || "",
          author: item.name || "Anonymous",
          role: item.tag || undefined,
          project: year ? `${year}` : undefined,
          imageUrl: item.imageUrl || undefined,
        };
      });
    }
  } catch (error) {
    console.warn("Failed to fetch feedbacks from Sanity Content Lake:", error);
  }
  return [];
}

export default async function Home() {
  const [
    heroItems,
    featuredWorks,
    categories,
    sampleGalleryItems,
    feedbacks,
  ] = await Promise.all([
    getHeroImages(),
    getFeaturedWorks(),
    getCategories(),
    getSampleGallery(),
    getFeedbacks(),
  ]);

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      {/* Custom Trailing Mouse Cursor */}
      <CustomCursor />
      <HeroSection items={heroItems} />
      <AboutSection />
      <CinematicText />
      <FeaturedWork items={featuredWorks} />
      <ConsistencyBreakText />
      <ServicesSection services={categories} />
      <SampleGallery items={sampleGalleryItems} />
      <UserFeedback cards={feedbacks} />
      <ContactSection />
      <FooterSection />
    </div>
  );
}
