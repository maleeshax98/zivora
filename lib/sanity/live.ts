import { defineLive } from "next-sanity/live";
import { client } from "./client";

/**
 * Sanity Live Content API configuration using defineLive from next-sanity.
 * Enables automatic real-time updates and live content synchronization
 * between Sanity Studio / Content Lake and the Next.js frontend.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client: client.withConfig({
    apiVersion: "2026-02-01",
  }),
  serverToken: process.env.SANITY_API_READ_TOKEN,
  browserToken: process.env.SANITY_API_READ_TOKEN,
});
