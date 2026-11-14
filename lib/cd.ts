"use server";

import { v2 as cloudinary } from "cloudinary";
import type { SampleGalleryItem } from "@/components/sections/SampleGallery";

cloudinary.config({
  cloud_name:
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD_NAME,
  api_key:
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Calculates how many images to show in the sample gallery.
 *
 * Layout Architecture:
 * - Desktop: Free-form floating & flying layout (175vh–200vh height) divided across
 *   5 horizontal columns/bands. 16 images fills all distinct spatial coordinates
 *   without clobbering or large empty voids.
 * - Mobile: 2-column responsive grid (grid grid-cols-2). 16 images produces exactly
 *   8 clean, balanced pairs.
 *
 * @returns The calculated optimal image count (16).
 */
export async function calculateTargetGalleryImageCount(): Promise<number> {
  return 16;
}

interface CloudinarySearchResource {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format?: string;
  created_at?: string;
  filename?: string;
  context?: {
    custom?: Record<string, string>;
    alt?: string;
    caption?: string;
  };
}

/**
 * Fetches sample gallery images from Cloudinary search API.
 * Uses Cloudinary search functions to query all images from folder called 'SAMPLE-GALLERY'.
 * Supports both legacy folder paths (`folder:SAMPLE-GALLERY*`) and modern asset folders (`asset_folder:SAMPLE-GALLERY*`).
 *
 * @param customLimit Optional image limit. Defaults to the calculated target (16).
 * @returns An array of SampleGalleryItem objects ready for rendering.
 */
export async function getSampleGalleryImages(
  customLimit?: number,
): Promise<SampleGalleryItem[]> {
  try {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey =
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn(
        "Cloudinary credentials are not fully configured in environment.",
      );
      return [];
    }

    const limit = customLimit ?? (await calculateTargetGalleryImageCount());

    // Use Cloudinary Search API to query all images in folder 'SAMPLE-GALLERY'
    const result = await cloudinary.search
      .expression(
        "(folder:SAMPLE-GALLERY* OR asset_folder:SAMPLE-GALLERY*) AND resource_type:image",
      )
      .sort_by("created_at", "desc")
      .max_results(limit)
      .execute();

    if (!result.resources || result.resources.length === 0) {
      if (result.total_count && result.total_count > 0) {
        console.warn(
          `Cloudinary found ${result.total_count} matching assets in 'SAMPLE-GALLERY', but the 'resources' list was empty. Ensure the API key has 'Read' action permissions enabled in Cloudinary Console.`,
        );
      }
      return [];
    }

    return result.resources
      .slice(0, limit)
      .map((resource: CloudinarySearchResource) => {
        const publicId = resource.public_id || "";
        const filename =
          resource.filename || publicId.split("/").pop() || "photograph";
        const readableTitle = filename
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        const imageAlt =
          resource.context?.alt ||
          resource.context?.caption ||
          `ZIVORA Visual Study — ${readableTitle}`;

        const width = resource.width || 960;
        const height = resource.height || 1200;

        return {
          id: publicId,
          title: readableTitle,
          imageUrl: resource.secure_url,
          imageAlt,
          width,
          height,
          aspectRatio: `${width} / ${height}`,
          mediaType: "photo" as const,
          href: "/works",
        };
      });
  } catch (error) {
    console.warn(
      "Failed to fetch sample gallery images from Cloudinary:",
      error,
    );
    return [];
  }
}

export const fetchSampleGalleryImages = getSampleGalleryImages;
