# ZIVORA — Architecture Context

## 1. Technical Stack

| Category                 | Technology                                                                 |
| :----------------------- | :------------------------------------------------------------------------- |
| Framework                | Next.js (App Router)                                                       |
| Language                 | TypeScript                                                                 |
| CMS                      | Sanity CMS (for albums, metadata, titles, descriptions, and configuration) |
| Media Storage & Delivery | Cloudinary (`next-cloudinary` & Cloudinary Admin/Search APIs)              |
| Styling                  | Tailwind CSS (using CSS variable tokens)                                   |
| Animation & Scroll       | GSAP & Lenis                                                               |
| Icons                    | Lucide React                                                               |

## 2. Application Architecture

### 2.1 Rendering Strategy

- Default to React Server Components (RSC) to minimize client-side JavaScript.
- Use Client Components for interactive elements like theme toggling, lightbox viewers, and masonry grid interactions.

### 2.2 Backend & Data Flow

- **Sanity CMS:** Manages structural content, album titles, descriptions, and maps each album to a designated `cloudinaryFolderName` attribute.
- **Cloudinary Integration:** Next.js API routes or server actions query Cloudinary's Search/Admin API using the album's folder name to dynamically retrieve, paginate, and optimize media assets.

## 3. Performance & Asset Delivery

- Implement pagination, lazy loading, and cursor-based fetching for large Cloudinary folders to ensure fast initial load times.
- Provide responsive image transformations, skeleton loading states, and clean error boundaries for masonry items.
