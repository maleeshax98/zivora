import { Suspense } from "react";
import type { Metadata } from "next";
import { SingleWorkGallery } from "@/components/sections/SingleWorkGallery";
import { FooterSection } from "@/components/sections/FooterSection";
import { fetchAlbumBySlugAction } from "@/app/works/actions";
export const instant = false;

interface SingleWorkPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: SingleWorkPageProps): Promise<Metadata> {
  try {
    const { slug } = await params;
    const album = await fetchAlbumBySlugAction(slug);

    if (!album) {
      return {
        title: "Archive Collection — ZIVORA",
        description:
          "Editorial photography and cinematic video records by ZIVORA.",
      };
    }

    return {
      title: `${album.title || "Archive"} — ZIVORA`,
      description: `Cinematic photography and film records for ${album.title || "Archive"}.`,
    };
  } catch {
    return {
      title: "Archive Collection — ZIVORA",
      description:
        "Editorial photography and cinematic video records by ZIVORA.",
    };
  }
}

async function SingleWorkAsync({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let album = null;
  try {
    album = await fetchAlbumBySlugAction(slug);
  } catch {
    album = null;
  }
  return <SingleWorkGallery slug={slug} initialAlbum={album} />;
}

export default function SingleWorkPage({ params }: SingleWorkPageProps) {
  return (
    <main className="min-h-screen bg-background text-copy-primary">
      <Suspense fallback={null}>
        <SingleWorkAsync params={params} />
      </Suspense>
      <FooterSection />
    </main>
  );
}
