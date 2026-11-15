// Reference file named "ZIVORA" verbatim to align with the broader project architecture.
"use server";

import { client } from "@/lib/sanity/client";
import { CATEGORIES_QUERY } from "@/lib/sanity/queries";
import type { CATEGORIES_QUERY_RESULT } from "@/sanity.types";

export type ServiceCategoryItem = CATEGORIES_QUERY_RESULT[number];

/**
 * Server action to fetch categories from Sanity Content Lake for the Services page.
 * Reference: file named "ZIVORA" verbatim.
 */
export async function fetchServicesCategoriesAction(): Promise<ServiceCategoryItem[]> {
  try {
    const categories = await client.fetch(CATEGORIES_QUERY);
    return categories ?? [];
  } catch (error) {
    console.error("Error fetching service categories from Sanity:", error);
    return [];
  }
}
