"use server";

import { v2 as cloudinary } from "cloudinary";
import { client } from "@/lib/sanity/client";
import {
  CATEGORIES_QUERY,
  WORKS_PAGE_ALBUMS_QUERY,
  WORKS_TOTAL_COUNT_QUERY,
  WORKS_CATEGORY_ALBUMS_QUERY,
  WORKS_CATEGORY_TOTAL_COUNT_QUERY,
  ALBUM_BY_SLUG_QUERY,
} from "@/lib/sanity/queries";
import type {
  CATEGORIES_QUERY_RESULT,
  WORKS_PAGE_ALBUMS_QUERY_RESULT,
  ALBUM_BY_SLUG_QUERY_RESULT,
} from "@/sanity.types";

export interface PaginatedWorksResponse {
  albums: WORKS_PAGE_ALBUMS_QUERY_RESULT;
  nextStart: number;
  hasMore: boolean;
  total: number;
}

export type CategoryItem = CATEGORIES_QUERY_RESULT[number];

export type SingleAlbumData = ALBUM_BY_SLUG_QUERY_RESULT;

export interface AlbumPhotoItem {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  aspectRatio: string;
  title: string;
  alt: string;
}

export interface PaginatedPhotosResponse {
  photos: AlbumPhotoItem[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
}

/**
 * Server action to fetch single album data by slug or ID.
 */
export async function fetchAlbumBySlugAction(
  slug: string
): Promise<SingleAlbumData> {
  try {
    const album = await client.fetch(ALBUM_BY_SLUG_QUERY, { slug });
    return album ?? null;
  } catch (error) {
    console.error("Error fetching album by slug:", error);
    return null;
  }
}

/**
 * Server action to fetch paginated photos from a Cloudinary folder.
 * Uses Cloudinary Search API with next_cursor pagination.
 */
export async function fetchAlbumPhotosAction(
  folderName: string,
  nextCursor?: string | null,
  limit: number = 12
): Promise<PaginatedPhotosResponse> {
  try {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey =
      process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ||
      process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret || !folderName) {
      return {
        photos: [],
        nextCursor: null,
        hasMore: false,
        totalCount: 0,
      };
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    const cleanFolder = folderName.trim().replace(/["\\]/g, "");
    const expression = `(folder:"${cleanFolder}*" OR asset_folder:"${cleanFolder}*") AND resource_type:image`;

    const searchReq = cloudinary.search
      .expression(expression)
      .sort_by("public_id", "asc")
      .max_results(limit);

    if (nextCursor) {
      searchReq.next_cursor(nextCursor);
    }

    const result = await searchReq.execute();
    const resources = result.resources || [];

    const photos: AlbumPhotoItem[] = resources.map(
      (res: {
        public_id: string;
        secure_url?: string;
        url?: string;
        width?: number;
        height?: number;
        filename?: string;
        context?: { alt?: string; caption?: string };
      }) => {
        const publicId = res.public_id || "";
        const filename =
          res.filename || publicId.split("/").pop() || "photograph";
        const readableTitle = filename
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());

        const alt =
          res.context?.alt ||
          res.context?.caption ||
          `Photograph from ${cleanFolder}`;
        const width = res.width || 1200;
        const height = res.height || 1600;

        return {
          id: publicId,
          publicId,
          url: res.secure_url || res.url || "",
          secureUrl: res.secure_url || res.url || "",
          width,
          height,
          aspectRatio: `${width} / ${height}`,
          title: readableTitle,
          alt,
        };
      }
    );

    return {
      photos,
      nextCursor: result.next_cursor || null,
      hasMore: Boolean(result.next_cursor),
      totalCount: result.total_count ?? photos.length,
    };
  } catch (error) {
    console.warn("Error fetching album photos from Cloudinary:", error);
    return {
      photos: [],
      nextCursor: null,
      hasMore: false,
      totalCount: 0,
    };
  }
}

/**
 * Server action to fetch categories for category filtering.
 */
export async function fetchWorksCategoriesAction(): Promise<CategoryItem[]> {
  try {
    const categories = await client.fetch(CATEGORIES_QUERY);
    return categories ?? [];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Server action to fetch paginated albums for the Works page.
 * Supports filtering by category slug.
 *
 * @param start - Zero-based offset start index
 * @param limit - Number of albums to fetch per page
 * @param categorySlug - Optional category slug filter
 */
export async function fetchWorksAlbumsAction(
  start: number = 0,
  limit: number = 4,
  categorySlug?: string | null
): Promise<PaginatedWorksResponse> {
  const end = start + limit;
  const isFiltered = Boolean(categorySlug && categorySlug !== "all");

  try {
    const [albums, total] = await Promise.all([
      isFiltered
        ? client.fetch(WORKS_CATEGORY_ALBUMS_QUERY, {
            categorySlug: categorySlug!,
            start,
            end,
          })
        : client.fetch(WORKS_PAGE_ALBUMS_QUERY, { start, end }),
      isFiltered
        ? client.fetch(WORKS_CATEGORY_TOTAL_COUNT_QUERY, {
            categorySlug: categorySlug!,
          })
        : client.fetch(WORKS_TOTAL_COUNT_QUERY),
    ]);

    const items = albums ?? [];
    const hasMore = start + items.length < total;

    return {
      albums: items,
      nextStart: end,
      hasMore,
      total,
    };
  } catch (error) {
    console.error("Error fetching works albums:", error);
    return {
      albums: [],
      nextStart: start,
      hasMore: false,
      total: 0,
    };
  }
}
