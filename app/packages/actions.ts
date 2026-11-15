"use server";

import { client } from "@/lib/sanity/client";
import {
  CATEGORIES_QUERY,
  PACKAGES_BY_CATEGORY_QUERY,
} from "@/lib/sanity/queries";
import type {
  CATEGORIES_QUERY_RESULT,
  PACKAGES_BY_CATEGORY_QUERY_RESULT,
} from "@/sanity.types";

export type CategoryItem = CATEGORIES_QUERY_RESULT[number];
export type PackageItem = PACKAGES_BY_CATEGORY_QUERY_RESULT[number];

/**
 * Server action to fetch categories for the Packages page navigation.
 */
export async function fetchPackageCategoriesAction(): Promise<CategoryItem[]> {
  try {
    const categories = await client.fetch(CATEGORIES_QUERY);
    return categories ?? [];
  } catch (error) {
    console.error("Error fetching package categories from Sanity:", error);
    return [];
  }
}

/**
 * Server action to fetch packages for a specific category slug.
 *
 * @param categorySlug - Category slug (e.g., 'wedding-photography')
 */
export async function fetchPackagesByCategoryAction(
  categorySlug: string
): Promise<PackageItem[]> {
  try {
    const packages = await client.fetch(PACKAGES_BY_CATEGORY_QUERY, {
      categorySlug,
    });
    return packages ?? [];
  } catch (error) {
    console.error("Error fetching packages by category from Sanity:", error);
    return [];
  }
}
