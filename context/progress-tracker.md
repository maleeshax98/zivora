# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Phase 2: CMS Integration & Content Modeling

## Current Goal

Completed: Fetch newest 6 images from HeroImages and show them with fluid responsive sizing and no horizontal scrollbar across all screen sizes. Awaiting user review.

## Completed

- Feature: HeroImages Newest 6 Fetch & Fluid Responsive Fit (No Horizontal Scrollbar):
  - Updated `HERO_IMAGES_QUERY` in `lib/sanity/queries.ts`: ordered by `publishedAt desc, _createdAt desc` with `[0...6]` limit to fetch the newest 6 hero image documents from Sanity Content Lake.
  - Re-ran Sanity Typegen (`pnpm run typegen`) to synchronize `sanity.types.ts`.
  - Refactored `HeroSection.tsx`:
    - Eliminated horizontal scroll container (`overflow-x-auto`, `no-scrollbar`, `touch-pan-x`, `-mx-2`, `px-2`).
    - Added `overflow-hidden` to the image line container to eliminate any risk of horizontal overflow.
    - Implemented fluid responsive card sizing using `flex-1 min-w-0 max-w-[240px]` with responsive gaps (`gap-1.5 sm:gap-2.5 md:gap-3.5 lg:gap-4 xl:gap-5`) and section padding (`px-4 sm:px-8 md:px-10 lg:px-16 xl:px-20`).
    - Adjusted CldImageWrapper responsive sizes attribute (`(max-width: 640px) 16vw, (max-width: 1024px) 16vw, 240px`) and refined hover caption typography (`text-[8px] sm:text-[9px] md:text-[10px] truncate`).
    - All 6 images seamlessly scale to fit mobile (320px+), tablet, laptop, and desktop viewports with 0 horizontal scrollbars.
  - Verified compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`).

- Bugfix: React Runtime NotFoundError (`Failed to execute 'insertBefore' on 'Node'`):
  - Diagnosed exact root cause: Next.js streaming `<Suspense>` boundaries in `app/page.tsx` were asynchronously resolving and attempting to insert replacement DOM nodes before subsequent siblings (`<AboutSection />`). However, `<AboutSection />` had already initialized GSAP `ScrollTrigger` with `pin: true`, causing GSAP to reparent `<AboutSection>`'s `<section>` inside a dynamic `<div class="pin-spacer">`. When React executed `parent.insertBefore(newHeroSection, aboutSectionNode)`, the browser threw `NotFoundError` because `aboutSectionNode.parentNode` was the `.pin-spacer` rather than `Home`'s root container.
  - Refactored `app/page.tsx`: converted `Home` to an `export default async function Home()`, concurrently fetching all `"use cache"` data loaders (`getHeroImages`, `getFeaturedWorks`, `getCategories`, `getSampleGallery`, `getFeedbacks`) via `Promise.all` in a single server pass, completely eliminating redundant per-section `<Suspense>` streaming boundaries and the subsequent `insertBefore` sibling insertion race conditions.
  - Refactored `HeroSection.tsx`: eliminated JS-based window dimensions and `ResizeObserver` re-renders in favor of responsive CSS utility classes (`w-[140px] sm:w-[170px] md:w-[190px] lg:w-[220px] xl:w-[230px]`, `gap-3 sm:gap-4 md:gap-5`), preventing hydration mismatches and multi-run GSAP master entrance animation re-triggers.
  - Refactored `CustomCursor.tsx`: eliminated client-only dynamic DOM insertion by rendering static outer container and hidden dot/ring elements (`opacity-0`) on both server and client, ensuring 100% hydration consistency.
  - Hardened `app/layout.tsx`: added `translate="no"` and `notranslate` to root `<html>` element to prevent third-party translation extensions from mutating text nodes during hydration.
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`), confirming static route generation (`○ /`).

- Backend Task 06: Contact Schema & Form Submission to Sanity (`context/backend/06-contact.md`):
  - Created `contact` document schema in `studio/schemaTypes/contact.ts` with fields: `name` (required string), `email` (required email string), `scope` (text for brief scope/timeline), and `submittedAt` (datetime initialized to ISO string) with preview selector (name, email, formatted date)
  - Registered `contact` schema in `studio/schemaTypes/index.ts`
  - Re-extracted schema to `studio/schema.json` and generated type-safe TypeScript definition for `Contact` in `zivora/sanity.types.ts` via `sanity typegen generate`
  - Configured authenticated `writeClient` in `zivora/lib/sanity/client.ts` using `process.env.SANITY_API_WRITE_TOKEN || process.env.SANITY_API_TOKEN` and `useCdn: false`
  - Documented `SANITY_API_WRITE_TOKEN` in `zivora/.env.example`
  - Created Server Action `submitContactAction(input)` in `zivora/app/contact/actions.ts`: validates name, email, and scope, logs full technical/developer configuration diagnostics strictly to the server terminal (`console.warn`/`console.error`), and returns polite, human-centered error and success responses to the frontend
  - Updated `zivora/components/sections/ContactSection.tsx`:
    - Replaced simulated timeout dispatch with `submitContactAction` (customizable via optional `onSubmitAction` prop)
    - Suppressed all technical developer errors from the UI; displays only warm, human guidance if delivery fails
    - Replaced robotic sending indicators with human copy: `Delivering your note...` with pulsing brand indicator, and `SENDING...` button state
    - Replaced robotic confirmation (`FORM SUBMITTED` / `INQUIRY RECEIVED`) with an editorial, creative message: `NOTE RECEIVED`, warm acknowledgment ("Every memorable project starts with a conversation..."), direct WhatsApp conversational link, and `Write another note ->` reset action
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and Sanity Studio build (`sanity build`)

- Feature Spec 16: Dedicated Contact Page (`context/feature-specs/contact/01-initial.md`):
  - Created dedicated route `app/contact/page.tsx` mounting `<ContactSection />` and `<FooterSection />` with SEO metadata
  - References the file named "ZIVORA" verbatim to align with the broader project architecture
  - Layout & Positioning: Full-viewport container (`min-h-[100dvh]`) leveraging the whitespace design principle to create an expansive, high-end editorial atmosphere
  - Center Focus: Massive, fluid typography call-to-action ("LET'S TALK.") occupying the absolute visual center of the viewport (`clamp(3.5rem, 14vw, 17.5rem)`) with italicized brand accent styling
  - Direct Contact Info: Prominently displayed direct contact and WhatsApp number (**+94 77 051 2373**) positioned directly below the central headline with elegant secondary muted typography tokens and a functional `wa.me` link (`https://wa.me/94770512373`)
  - Centered Form Integration: Minimal, borderless contact form horizontally centered within the layout (`max-w-lg lg:max-w-xl mx-auto`), positioned below the typography and direct contact info
  - Form Fields & Styling: Plain text inputs with subtle bottom hairline borders only (`NAME / STUDIO *`, `EMAIL ADDRESS *`, `BRIEF SCOPE OR TIMELINE (OPTIONAL)`), muted secondary typography tokens, and a clean text-based submit button (`SEND INQUIRY ->`) aligned to the bottom right of the form block
  - Linked Social Media Icons: Elegantly integrated stroke-based icons adhering to the project's icon library (`lucide-react` / stroke geometry for Instagram, YouTube, WhatsApp via `MessageCircle`, and Email via `Mail`), arranged in a balanced row directly below the centered form with smooth hover transitions, touch-friendly hit areas, and `data-cursor="expand"`
  - Cleaned up submission confirmation state: eliminated artificial robotic symbols and bracketed fillers (`INQUIRY RECEIVED` and `Send Another Message`) for an authentic, human editorial feel
  - Motion (GSAP): Staggered `ScrollTrigger` entrance animation with `gsap.matchMedia()` revealing the headline, phone number, centered form, and social media icons with subtle vertical translation, paired with accessible static fallback for `prefers-reduced-motion: reduce`
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`) confirming static route generation (`○ /contact`), and Sanity Studio build (`sanity build`)

- Packages Page: Category-Based Package Showcase, Faded Category Hero & Shareable URLs (`context/feature-specs/packages/01-initial-setup.md`):
  - Created dynamic Packages page route `app/packages/page.tsx` with `<Suspense>` boundary, `<PackagesGallery />`, and `<FooterSection />`
  - Created client component `components/sections/PackagesGallery.tsx` (`"use client"`) with direct named and default exports (zero barrel files)
  - Defined GROQ queries `PACKAGES_BY_CATEGORY_QUERY` and `PACKAGES_QUERY` in `lib/sanity/queries.ts`
  - Regenerated type definitions in `sanity.types.ts` via `sanity typegen generate` in `studio/` with full client overload mappings
  - Built Server Actions in `app/packages/actions.ts`: `fetchPackageCategoriesAction()` and `fetchPackagesByCategoryAction(categorySlug)`
  - Implemented top hairline progress indicator (`TopLoadingBar`) for initial data load and category transitions
  - Implemented category filter navigation bar syncing with URL search parameters (`?category=slug`) for shareable, bookmarkable deep links
  - Implemented faded category hero banner: renders active category cover image (`opacity-40 dark:opacity-35`) with multi-directional gradient overlays (`from-background via-background/60 to-transparent`, `from-background via-transparent to-background`, and horizontal edge fades) seamlessly melting into the canvas, with the category title rendered directly on top in editorial serif typography
  - Built responsive package card grid (`md:grid-cols-2 lg:grid-cols-3`) with highlighted card treatment (`isHighlited: true` with elevated brand border, subtle halo shadow, and "FEATURED" indicator), badges, price formatting, deliverables list with Lucide check icons, and direct WhatsApp inquiry integration (`https://wa.me/94770512373` with pre-filled package and category details opening in a new tab)
  - Added bespoke commission empty state for categories without published packages, providing direct WhatsApp and contact form inquiry paths
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`) generating static route `/packages`, and Sanity Studio build (`sanity build`)

- Album Description Schema Update (from Portable Text to Text String):
  - Updated Sanity schema `studio/schemaTypes/album.ts`: changed `description` field from array of blocks (Portable Text) to `type: 'text', rows: 3, validation: (rule) => rule.required()`
  - Re-extracted schema to `studio/schema.json` and regenerated TypeScript definitions in `zivora/sanity.types.ts` via `sanity typegen generate`, typing `Album.description` as `string`
  - Updated `SingleWorkGallery.tsx`: normalized `description` to render direct text string with trim and defensive fallback for legacy block data, used across cinematic intro and centered header
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and Sanity Studio build (`sanity build`)

- Removed Hardcoded Fallback Slugs from Single Work Route:
  - Removed fallback slug array (`album-1` through `album-5`) from `zivora/app/works/[slug]/page.tsx`
  - Replaced with Next.js 16 Cache Components configuration `export const instant = false;`, enabling seamless Partial Prerendering (PPR) and dynamic streaming without hardcoding slug values
  - Verified with TypeScript (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`)

- Single Album Page Header Centering Refinement:
  - Updated `SingleWorkGallery.tsx` header layout to be centered in the middle (`text-center flex flex-col items-center justify-center max-w-3xl mx-auto`)
  - Displays Title, followed by Description, followed by Date only (`November 10, 2026`), removing extraneous metadata clutter (category and photo counts) from the header
  - Verified with TypeScript (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`)

- Single Album Page: Cinematic Intro, Pinterest Grid, YouTube Videos, Filter Tabs & Cloudinary Infinite Scroll (`zivora/context/feature-specs/works/02-single-work.md`)
  - Created dynamic routes `zivora/app/works/[slug]/page.tsx` and `zivora/app/work/[slug]/page.tsx` (with `zivora/app/work/page.tsx` redirecting to `/works`), ensuring both singular and plural paths resolve cleanly with Next.js 16 Partial Prerendering and `generateStaticParams`
  - Created `zivora/components/sections/SingleWorkGallery.tsx` (`"use client"`) implementing the single album view with direct exports and zero barrel files
  - Implemented top hairline progress bar (`TopLoadingBar`) indicating initial data fetch status
  - Built GSAP cinematic entrance sequence (`phase: "intro"`): animates album title (blur-to-clear & opacity), followed by description, followed by event date, holds for deliberate reading (1.35s), and smoothly blurs & fades out before transitioning into the ready content view, with static immediate fallback for `prefers-reduced-motion: reduce`
  - Built Pinterest-style masonry photo grid (`columns-2 sm:columns-2 md:columns-3 lg:columns-4 [column-fill:_balance]`), strictly enforcing 2 columns on mobile devices, with natural aspect-ratio preservation, responsive `CldImage`, sharp borders, and hover scrims
  - Implemented Cloudinary folder photo pagination Server Action `fetchAlbumPhotosAction(folderName, nextCursor, limit)` in `zivora/app/works/actions.ts` querying Cloudinary Search API with folder expressions and cursor pagination
  - Built infinite scroll via `IntersectionObserver` sentinel, appending newly loaded photos to the bottom of the grid (`setPhotos(prev => [...prev, ...newPhotos])`) while preserving previously loaded photos in their exact positions, complete with bottom loading indicator
  - Built YouTube video section displaying responsive 16:9 embedded players (`aspect-video`) using `iframe` with video ID extraction from URLs, video numbering ("Film 01"), direct external links, and clean empty state if no videos are attached
  - Built fixed bottom tab bar for Photos and Videos filtering with a faded gradient backdrop (`bg-gradient-to-t from-background via-background/90 to-transparent`), active brand indicator styling (`bg-brand text-white dark:text-zinc-950`), and counter badges
  - Built interactive lightbox modal for full-resolution photograph inspection with keyboard navigation (Escape to close, Left/Right arrow keys to navigate) and image counter
  - Updated `ALBUM_BY_SLUG_QUERY` in `zivora/lib/sanity/queries.ts` to support both `slug.current == $slug` and `_id == $slug`, and regenerated types in `zivora/sanity.types.ts`
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`), generating static routes for `/work`, `/work/[slug]`, `/works`, and `/works/[slug]`

- Works Page: Album Fetching, Category Filtering, Faded Cover Image Hero & Shareable URLs (`zivora/context/feature-specs/works/01-intial-setup.md`)
  - Updated specification in `zivora/context/feature-specs/works/01-intial-setup.md` to reflect "All Works" naming, top category navigation with 'ALL' option, category-filtered paginated queries, shareable URL parameters, faded category cover image with gradient overlays, category name rendered on top, and clean editorial design free of artificial AI symbols
  - Implemented faded category hero banner in `zivora/components/sections/WorksGallery.tsx`: displays the category's cover image with soft opacity (`opacity-40 dark:opacity-35`) layered with multi-directional gradient overlays (`from-background via-background/60 to-transparent`, `from-background via-transparent to-background`, and horizontal edge fades) that seamlessly blend into the canvas, rendering the category title directly on top in large editorial serif typography
  - Defined `WORKS_CATEGORY_ALBUMS_QUERY` with range slice `[$start...$end]` and `WORKS_CATEGORY_TOTAL_COUNT_QUERY` in `zivora/lib/sanity/queries.ts`
  - Re-extracted schema and regenerated type-safe definitions in `zivora/sanity.types.ts` via `sanity typegen generate`, creating typed `WORKS_CATEGORY_ALBUMS_QUERY_RESULT` and client overloads
  - Created Server Actions in `zivora/app/works/actions.ts`: `fetchWorksCategoriesAction()` and updated `fetchWorksAlbumsAction(start, limit, categorySlug)` supporting category filtering alongside total count evaluation
  - Updated cinematic entrance text sequence in `WorksGallery.tsx`: displays letter-spaced clean "ALL WORKS" (completely removing artificial AI badges/symbols like `//`, `ARCHIVE // 2026`), entering with GSAP blur-to-clear and opacity, holding for reading, and smoothly blurring/fading out
  - Implemented category filter bar at top of works section with 'All' tab and dynamic categories loaded from Sanity, styled with clean text buttons and active brand indicators
  - Implemented shareable URL parameters (`?category=slug`) using `useSearchParams` and Next.js router, allowing users to share and deep-link directly into category-filtered archives
  - Implemented responsive album card grid (2 columns) with `CldImage` (and fallback), formatted date, category, and links to `/works/${slug}`
  - Implemented infinite scroll using `IntersectionObserver` sentinel: seamlessly triggers subsequent page fetches for the active category filter without clearing the page, displaying a clean bottom loading indicator
  - Wrapped `WorksGallery` in `<Suspense fallback={null}>` inside `zivora/app/works/page.tsx` for optimal static prerendering and hydration safety
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`), confirming static route generation (`/works`)

- Fetch Feedbacks from Sanity & Show in UserFeedback Section (`zivora/context/backend/05-fetch-feedbacks.md`)
  - Studied `feedback` schema in `studio/schemaTypes/feedback.ts` (`name`, `tag`, `feedback`, `imageUrl`, `publishedAt`) and existing documents in Content Lake
  - Added preview selection block to `studio/schemaTypes/feedback.ts` displaying client name and tag in Studio document list
  - Defined `FEEDBACKS_QUERY` using `defineQuery` in `zivora/lib/sanity/queries.ts` selecting `_id`, `name`, `tag`, `feedback`, `imageUrl`, and `publishedAt` ordered by `publishedAt desc, _createdAt desc` with `[0...5]` slice
  - Re-extracted schema and regenerated type-safe definitions in `zivora/sanity.types.ts` via `sanity typegen generate`, creating typed `FEEDBACKS_QUERY_RESULT` and client overloads
  - Removed hardcoded sample data (`DEFAULT_FEEDBACK_CARDS`) from `zivora/components/sections/UserFeedback.tsx` so the component defaults to empty array and renders `null` when no feedbacks are present
  - Built adaptive responsive layout system in `UserFeedback.tsx` supporting 1 to 5 cards with customized coordinate and rotation presets (`RESPONSIVE_LAYOUT_PRESETS`), dynamically scaling the overview camera bounding box, timeline duration (`end`), and viewfinder HUD telemetry
  - Added support for client avatar/commission image rendering via `next-cloudinary` (`CldImage`) with fallback for non-Cloudinary images (`next/image` with `unoptimized`)
  - Implemented cached loader `getFeedbacks()` in `zivora/app/page.tsx` using Next.js 16 `"use cache"` and wrapped `<UserFeedbackAsync />` in `<Suspense fallback={<UserFeedback />}>`
  - Fixed premature unpinning & camera transition issue: restored proper section placement in `app/page.tsx` (mounted after `<SampleGallery />` and before `<ContactSection />`), added immediate + `requestAnimationFrame` `ScrollTrigger.refresh()` on mount, tuned `scrollEnd` runway (`+=460%` desktop / `+=360%` mobile), added final card `exit-hold`, and trimmed `cardElementsRef.current` to ensure all cards (1 to 5) transition seamlessly with unhurried reading holds
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and Sanity Studio build (`sanity build`)

- Fetch and Show Sample Gallery Images from Cloudinary (`zivora/context/backend/04-fetch-sample-gallery.md`)
  - Calculated optimal gallery capacity: 16 images architected around the 16 curated spatial positions of the desktop floating stage (5-column parallax scatter across `h-[175vh]–[200vh]`) and mobile 2-column grid (8 balanced pairs)
  - Implemented `getSampleGalleryImages()` and `calculateTargetGalleryImageCount()` in `zivora/lib/cd.ts` using the Cloudinary Search API querying `(folder:SAMPLE-GALLERY* OR asset_folder:SAMPLE-GALLERY*) AND resource_type:image` sorted by `created_at desc`
  - Added clean resource mapping to `SampleGalleryItem` extracting Cloudinary `secure_url`, generated editorial `imageAlt`, dimensions, and aspect ratio
  - Integrated cached data loader `getSampleGallery()` in `zivora/app/page.tsx` using Next.js 16 `"use cache"` directive and wrapped `<SampleGalleryAsync />` in `<Suspense fallback={<SampleGallery />}>` for fast static prerendering and instant fallback with zero layout shift (CLS)
  - Added defensive handling in `lib/cd.ts` and `SampleGallery.tsx` gracefully falling back to preconfigured items if Cloudinary API key has restricted permissions (`actions=["read"]`) or folder is empty
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`pnpm build`) with static page generation confirming executed Cloudinary search query

- Remove Sample Data from Hero, Featured Work, and Services Sections (`zivora/components/hero/HeroSection.tsx`, `zivora/components/sections/FeaturedWork.tsx`, `zivora/components/sections/ServicesSection.tsx`, `zivora/app/page.tsx`)
  - Cleaned all hardcoded sample data arrays (`DEFAULT_HERO_IMAGES`, `DEFAULT_FEATURED_PROJECTS`, `DEFAULT_SERVICES`) and sample image constants (`DEFAULT_CLOUDINARY_IMAGE_URL`, `FEATURED_THUMBNAIL_URL`, `DEFAULT_SERVICE_IMAGE_URL`) from component files without modifying or deleting documents in the Sanity database
  - Removed hardcoded category text fallbacks (`CATEGORY_EDITORIAL_DEFAULTS`, `DEFAULT_CATEGORY_FALLBACK`) from `app/page.tsx`, directly rendering authentic CMS-managed data (`category.description`) or clean empty states
  - Updated `HeroSection.tsx`: default `items = []`, `activeItems = useMemo(() => items ?? [], [items])`, dynamic layout metrics calculation adapted for empty/loaded states, hover captions guarded to only show defined titles and categories
  - Updated `FeaturedWork.tsx`: default `items = []`, `activeItems = useMemo(() => items ?? [], [items])`, clean `null` return when no featured albums are present
  - Updated `ServicesSection.tsx`: default `services = []`, `activeServices = React.useMemo(() => services ?? [], [services])`, clean `null` return when no services are present, middle column editorial description guarded to avoid rendering empty tags
  - Updated `app/page.tsx`: async loaders (`getHeroImages`, `getFeaturedWorks`, `getCategories`) return clean arrays `[]` on empty/error rather than falling back to fake sample objects
  - Verified compilation with `pnpm tsc --noEmit`, ESLint (`pnpm lint`), and Next.js production build (`pnpm build`) passing with zero errors

- Fetch and Show Categories in Home Page (`zivora/context/backend/03-fetch-categories.md`)
  - Studied `category` schema in `studio/schemaTypes/category.ts` (`title`, `slug`, `description`, `coverImage`, `publishedAt`)
  - Defined `CATEGORIES_QUERY` in `zivora/lib/sanity/queries.ts` selecting `_id`, `title`, `slug`, `description`, `coverImage`, and `publishedAt` ordered by `publishedAt asc, _createdAt asc`
  - Re-extracted studio schema and regenerated type-safe query definitions in `zivora/sanity.types.ts` via `sanity typegen generate`, creating typed `CATEGORIES_QUERY_RESULT` and client overloads
  - Added defensive `activeServices` memoization in `ServicesSection.tsx` to automatically fall back to `DEFAULT_SERVICES` if `services` is empty array or undefined, preventing broken layouts or CLS
  - Implemented cached loader `getCategories()` in `zivora/app/page.tsx` using Next.js 16 `"use cache"` and `sanityFetch({ query: CATEGORIES_QUERY })`, mapping category documents to `ServiceItem[]` with PortableText extraction and editorial fallbacks
  - Wrapped `<ServicesSectionAsync />` in `<Suspense fallback={<ServicesSection />}>` in `zivora/app/page.tsx` for fast streaming, static prerendering, and instant fallback with zero layout shift (CLS)
  - Verified live Sanity Content Lake query returning all 3 categories (`Wedding Photography`, `Birthday Shoot`, `Portrait Photography`) with Cloudinary cover URLs
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and Sanity Studio build (`sanity build`)

- Fetch and Show Featured Works in Home Page (`zivora/context/backend/02-fetch-featured-works.md`)
  - Studied `album` schema in `studio/schemaTypes/album.ts`, identifying the `featured: boolean` field
  - Defined `FEATURED_ALBUMS_QUERY` using `defineQuery` in `zivora/lib/sanity/queries.ts` selecting `_id`, `title`, `slug`, `category->`, `eventDate`, `publishedAt`, `coverImage`, and `featured` ordered by `publishedAt desc, _createdAt desc`
  - Re-extracted schema to `studio/schema.json` and generated type-safe query definitions in `zivora/sanity.types.ts` via `sanity typegen generate`, creating typed `FEATURED_ALBUMS_QUERY_RESULT` and client overloads
  - Added defensive `activeItems` memoization in `FeaturedWork.tsx` to automatically fall back to `DEFAULT_FEATURED_PROJECTS` if `items` is empty array or undefined
  - Implemented cached loader `getFeaturedWorks()` in `zivora/app/page.tsx` using Next.js 16 `"use cache"` and `sanityFetch({ query: FEATURED_ALBUMS_QUERY })`, mapping documents to `FeaturedProjectItem[]`
  - Wrapped `<FeaturedWorkAsync />` in `<Suspense fallback={<FeaturedWork />}>` in `zivora/app/page.tsx` for fast streaming, static prerendering, and instant fallback with zero layout shift (CLS)
  - Verified live Sanity Content Lake query returning all 4 featured albums (`Album-4`, `Album 3`, `Album 2`, `Album 1`) with Cloudinary cover URLs
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and Sanity Studio build (`sanity build`)

- Limit Hero Images to 6 (`zivora/lib/sanity/queries.ts`, `HeroSection.tsx`, `app/page.tsx`)
  - Updated `HERO_IMAGES_QUERY` with GROQ slice `[0...6]` to strictly limit fetch size
  - Regenerated Sanity TypeGen in `studio/` so query types match `[0...6]` slice
  - Enforced `Math.min(6, ...)` cap in `HeroSection.tsx` for `exactFit` and `displayedItems` so no more than 6 images are rendered regardless of viewport width
  - Added `.slice(0, 6)` in `app/page.tsx` as an additional layer of defensive capping
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build

- Sanity Live Updates Integration (`next-sanity/live` & Live Content API)
  - Configured CORS origins in Sanity project `xu3rhmio` (`http://localhost:3000` with `allowCredentials: true`) to permit live SSE client-side streaming
  - Created `zivora/lib/sanity/live.ts` exporting `sanityFetch` and `SanityLive` using `defineLive` from `next-sanity/live`
  - Mounted `<SanityLive />` in `zivora/app/layout.tsx` inside `<ThemeProvider>` to establish real-time SSE listener
  - Updated `zivora/app/page.tsx` data fetching in `getHeroImages()` to use `sanityFetch({ query: HERO_IMAGES_QUERY })`
  - Documented `SANITY_API_READ_TOKEN` in `zivora/.env.example`
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and SSR HTML output confirming `SanityLive` client component registration

- Hero Images Sanity CMS Integration (`zivora/context/backend/01-fetch-hero-images.md`)
  - Studied schema definition `studio/schemaTypes/heroImages.ts` (`title`, `slug`, `coverImage`, `publishedAt`)
  - Extracted studio schema to `studio/schema.json` and defined `HERO_IMAGES_QUERY` using `defineQuery` in `zivora/lib/sanity/queries.ts`
  - Regenerated TypeScript types via `sanity typegen generate` into `zivora/sanity.types.ts`, creating typed `HERO_IMAGES_QUERY_RESULT` with client overload mappings
  - Updated `HeroSection.tsx` (`activeItems`) with defensive fallback to `DEFAULT_HERO_IMAGES` if empty array or undefined is passed, preserving dynamic card width calculation and GSAP master blur-to-clear entrance animations
  - Created cached loader `getHeroImages()` in `zivora/app/page.tsx` using Next.js 16 `"use cache"` directive and wrapped `<HeroSectionAsync />` in `<Suspense fallback={<HeroSection />}>` for partial prerendering and streaming
  - Verified live data fetch via Sanity Client connecting to Content Lake (`xu3rhmio`, dataset `production`), retrieving all 6 hero documents with full Cloudinary URLs
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and Sanity Studio build (`sanity build`)

- Sanity CMS Setup & Next.js Integration (`studio/context/01-initial.md` & `sanity-best-practices` skill)
  - Installed `sanity-best-practices` agent toolkit skill in `.agents/skills/sanity-best-practices`
  - Created Category schema type (`studio/schemaTypes/category.ts`) with `title`, `slug`, `description` (Portable Text), `coverImage` (Cloudinary URL string), and `publishedAt`
  - Created Album schema type (`studio/schemaTypes/album.ts`) with `title`, `slug`, `description` (Portable Text), `eventDate`, `category` (Reference to `category`), `cloudinaryFolderName`, `coverImage` (Cloudinary URL string), `youtubeVideoLinks` (Array of URLs), and `publishedAt`
  - Registered schema types in `studio/schemaTypes/index.ts` and configured custom Studio preview blocks
  - Configured `studio/sanity.cli.ts` with automated TypeGen targeting `../zivora/{app,components,lib}/**/*.{ts,tsx,js,jsx}` with `overloadClientMethods: true`
  - Deployed schemas to Sanity Content Lake (`xu3rhmio`, dataset `production`) and verified with Sanity MCP tools
  - Installed `next-sanity`, `@sanity/image-url`, and `@sanity/client` in `zivora` via pnpm
  - Configured environment variables in `zivora/.env` and `zivora/.env.example` (`NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`)
  - Created Sanity client helper (`zivora/lib/sanity/client.ts`), Image URL builder (`zivora/lib/sanity/image.ts`), and typed GROQ queries (`zivora/lib/sanity/queries.ts`)
  - Automated TypeGen generation (`sanity typegen generate`) into `zivora/sanity.types.ts` with full type mapping for schemas and queries
  - Updated ESLint configuration to ignore generated `sanity.types.ts`
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), Next.js production build (`next build --webpack`), and Sanity Studio build (`sanity build`)

- Feature Spec 15: Footer Section (`context/feature-specs/11-footer.md`)
  - Created `components/sections/FooterSection.tsx` (`"use client"`) with direct named exports (`FooterSection`, `Footer`, `FooterSectionProps`) and default export (strictly zero barrel files)
  - Layout & Whitespace: Spacious, unhurried container (`py-20 sm:py-28 lg:py-36 px-6 sm:px-12 lg:px-20`) enforcing generous negative space without visual clutter
  - References the file named "ZIVORA" verbatim to align with the broader project architecture
  - Developer Credit: Prominently positions verbatim text "developed by VINZI" at the very bottom of the footer (bottom-right on desktop / bottom on mobile) using the muted, secondary text token (`text-copy-secondary/80`) to maintain visual balance
  - Minimalist Elements: Fluid brand mark ("ZIVORA") linking to `/`, essential navigation anchors (`WORKS`, `SERVICES`, `ABOUT`, `CONTACT`), smooth-scrolling "BACK TO TOP ↑" button integrated with Lenis, and static copyright year (`© 2026 ZIVORA. ALL RIGHTS RESERVED.`)
  - Typography & Theming: Utilizes fluidly scaling typography (`clamp(2rem, 6vw, 4.5rem)`), uppercase tracking, and cinematic dual-theme CSS custom property tokens (`bg-background`, `text-copy-primary`, `text-copy-secondary`, `text-brand`, `border-surface-border/40`) supporting Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) environments without falling back to pure black or pure white
  - Purposeful Motion: GSAP `ScrollTrigger` entrance fade and vertical translation (`start: "top 92%"`, `once: true`) with static fallback for `prefers-reduced-motion: reduce`
  - Mounted directly in `app/page.tsx` as the final page block following `<ContactSection />` with zero changes to any other sections
  - Verified static compilation (`tsc`), ESLint (0 errors, 0 warnings), and production build (`next build --webpack`) with SSR HTML inspection confirming rendered markup

- Feature Spec 14: Creative Contact Section (Redesign) (`context/feature-specs/10-contact.md`)
  - Redesigned `components/sections/ContactSection.tsx` (`"use client"`) with direct named and default exports (strictly zero barrel files)
  - Full-viewport container (`min-h-[100dvh]`) creating expansive editorial whitespace and acting as the dramatic finale of the portfolio
  - References the file named "ZIVORA" verbatim to align with the broader project architecture
  - Center Focus: Massive, fluid typography call-to-action ("LET'S TALK.") taking up the absolute visual center of the viewport (`clamp(3.5rem, 14vw, 17.5rem)`) with italicized brand accent styling
  - Asymmetrical Anchor: Positioned a minimal, borderless contact form directly below the main text, heavily anchored to the bottom-right corner of the composition
  - Strict Removals: Completely removed bottom-left social links, cursor-following image reveal logic, hover-reveal instructions, and secondary header/footer bars
  - Form Fields & Styling: Plain text inputs with subtle bottom hairline borders only (`NAME / STUDIO *`, `EMAIL ADDRESS *`, `BRIEF SCOPE OR TIMELINE (OPTIONAL)`), muted secondary typography tokens, and a clean text-based submit button (`SEND INQUIRY ->`) aligned to the bottom right
  - Mobile Responsiveness: Fluidly collapses the layout into a vertically stacked, center-aligned structure, placing the contact form directly below the scaled fluid typography with touch-friendly spacing
  - Purposeful Motion (GSAP): Staggered `ScrollTrigger` entrance animation (`start: "top 75%"`, `once: true`) revealing center headline and bottom-right form with subtle fade-in and vertical translation; static fallback for `prefers-reduced-motion: reduce`
  - Dual-Theme Tokens: Strictly adheres to Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) environments without falling back to pure black or pure white
  - Mounted directly in `app/page.tsx` as the final page block
  - Verified static compilation (`tsc`), ESLint (0 errors, 0 warnings), and production build (`next build --webpack`) with SSR HTML inspection

- Feature Spec 13 Refinement: User Feedback Section — Initial Overview (Show All Sticky Cards) then Zoom One by One (`context/feature-specs/09-user-feedback.md`)
  - Redesigned `components/sections/UserFeedback.tsx` (`"use client"`) with direct named and default exports (strictly zero barrel files)
  - Established shot (Phase 0): Camera begins at a calculated wide overview (`overviewScale`, `overviewX`, `overviewY`) showing all 5 sticky cards in the screen simultaneously without overlap, allowing the user to take in the complete studio wall moodboard before diving in
  - Sequential one-by-one dive (Phases 1 to 5): As the user scrolls, the camera swoops in from the wide overview to dead-center Card 1, then glides across to Card 2, sweeps down to Card 3, glides to Card 4, and sweeps to Card 5
  - Mathematically calculated invariant camera offsets (`WallX = viewportCenterX - cardCenterX * scale`, `WallY = viewportCenterY - cardCenterY * scale`) centering each card dead-center at crisp reading scale
  - Rack-focus transitions: In overview, all 5 cards are crisp; during close-up dives, non-focused background cards dim to `opacity: 0.38, filter: blur(1.5px)` while the active focal card is sharp (`opacity: 1, filter: blur(0px)`)
  - Updated viewfinder HUD: Dynamic telemetry displaying `[ ALL / 05 ] — OVERVIEW` during establishing shot and sequential `[ 0X / 05 ]` indices, with an active overview indicator pill and 5 card progress dots
  - Accessible static fallback for `prefers-reduced-motion: reduce` displaying all 5 cards in a natural vertical layout without transforms or pinning
  - Seamlessly integrated with Lenis smooth scroll and mounted in `app/page.tsx` following `<SampleGallery />` with zero changes to any other sections
  - Verified static compilation (`tsc`), ESLint (0 errors, 0 warnings), and production build (`next build --webpack`) with SSR HTML inspection

- Remote Repository & Version Control Setup (`https://github.com/maleeshax98/zivora.git`)
  - Configured `.gitignore` to track `.env.example` while excluding sensitive `.env*` files
  - Excluded local large media assets (`/public/*.mp4`, ~38MB) to preserve lean Git history and rely on Cloudinary CDN
  - Authored comprehensive project `README.md` detailing architecture, tech stack, and setup
  - Cleaned up unused props/variables in `HeroSection.tsx` and `ServicesSection.tsx`, achieving 0 ESLint warnings and 0 errors
  - Verified static compilation (`tsc --noEmit`), ESLint, and production build (`next build --webpack`)
  - Configured Git remote `origin` pointing to `https://github.com/maleeshax98/zivora.git` on branch `main`

- Feature Spec 08: Consistency Break Text Section (`context/feature-specs/08-consistency-break-text.md`)
  - Created `components/sections/ConsistencyBreakText.tsx` (`"use client"`) with direct named and default exports (zero barrel files)
  - Full-viewport container (`min-h-[100dvh]`) providing an intentional editorial interlude and pause in the visual scroll rhythm
  - Sequential text animation blocks with high-end movie title sequence aesthetics, fluid typography scaling for mobile and desktop (`clamp()`)
  - GSAP `ScrollTrigger` viewport pinning with scroll-tied scrubbing (`pin: true`, `pinSpacing: true`, `scrub: 0.6` mobile / `0.9` desktop, `anticipatePin: 1`)
  - Sequential text fades: each text block smoothly fades in (opacity 0 to 1) with subtle vertical translation and scale, holds for unhurried reading, and fades out completely before the next sequence appears
  - Supported extreme asymmetrical (left/right) and striking centered alignments across sequential beats
  - Seamless integration with Lenis smooth scroll and accessible static fallback for `prefers-reduced-motion: reduce`
  - Integrated in `app/page.tsx` replacing duplicate placeholder `<CinematicText />` between `<FeaturedWork />` and `<ServicesSection />` without altering any other section components
  - Verified static compilation (`tsc`), ESLint, and production build (`next build --webpack`) with SSR HTML inspection

- Feature Spec 07 Refinement: Floating Photo Gallery (Dense Desktop Floating + Mobile 2-Column Grid) (`context/feature-specs/07-floating-sample-gallery.md`)
  - Redesigned `components/sections/SampleGallery.tsx` (`"use client"`) to eliminate excessive empty space and add rich, dense curation
  - Expanded gallery to 16 curated photography items with varied editorial aspect ratios (`4/5`, `3/4`, `1/1`, `2/3`)
  - Implemented responsive mobile layout: cleanly renders a 2-column grid (`grid grid-cols-2 gap-3 sm:gap-4`) with natural document flow on viewports `< md`
  - Tightened desktop layout: distributed 16 photos across an optimized `h-[175vh] lg:h-[190vh] xl:h-[200vh]` stage across 5 horizontal bands (left, mid-left, center, mid-right, right) so 5–7 photos occupy the viewport simultaneously without large dead voids
  - Retained continuous GSAP idle floating (inner wrapper) and multi-layer ScrollTrigger parallax scrub (outer wrapper) on desktop
  - Retained strict photos-only rule: zero text, zero headers/titles, zero descriptions, zero video assets/overlays
  - Verified static compilation, zero ESLint errors/warnings, and SSR HTML rendering of both mobile 2-col grid and desktop floating stage

- Feature Spec 07: Floating Photo Gallery Redesign (`context/feature-specs/07-floating-sample-gallery.md`)
  - Redesigned `components/sections/SampleGallery.tsx` (`"use client"`) with direct named and default exports (strictly zero barrel files)
  - Completely eliminated all section titles, headers (such as "Curated visual studies."), descriptions, footers, archive links, and textual metadata, rendering a pure image-only visual experience
  - Eliminated all video assets, play badges, and "FILM" tag overlays, strictly featuring photography
  - Replaced rigid masonry grid with a scattered, asymmetrical floating photo layout across an expansive relative container (`h-[200vh] sm:h-[220vh] lg:h-[260vh]` with `overflow-hidden`)
  - Guaranteed mobile viewport containment: positioned cards with left bounds between 6% and 52%, widths capped to `w-[38vw]`–`w-[42vw]` (max 165px–185px), and alternating ~24% vertical offsets preventing heavy image overlap or horizontal overflow
  - Strictly integrated `CldImage` from `next-cloudinary` with `fill`, responsive `sizes`, explicit `aspectRatio`, and cloud name resolution (`pso8u1zy`) for optimal image delivery and zero CLS
  - Implemented continuous GSAP floating effect on inner wrapper (`floatRefs`): subtle randomized `x`, `y`, and `rotation` translations with differing durations (4.4s–6.8s), `ease: "sine.inOut"`, `yoyo: true`, and `repeat: -1`
  - Implemented multi-layer GSAP `ScrollTrigger` parallax scrub on outer wrapper (`parallaxRefs`): applied different velocities and scrub speeds (0.7–1.4) across foreground, midground, and background layers, creating depth and a "flying" sensation during scroll
  - Added accessible fallback for `prefers-reduced-motion: reduce`: clears transforms and displays static unpinned scattered layout without movement or rotation

- Feature Spec 10 / 06: Services Scroll-Reveal Section (3-Column Layout) (`context/feature-specs/06-services-hero.md`)
  - Redesigned `components/sections/ServicesSection.tsx` (`"use client"`) with direct named and default exports (strictly zero barrel files)
  - Implemented top index: horizontal flex container listing all service titles with touch-friendly horizontal scrolling (`overflow-x-auto no-scrollbar touch-pan-x`) and active state synchronization (animated brand underline and text color highlight synced to scroll position)
  - Implemented GSAP ScrollTrigger pinned scrubbed timeline (`pin: true`, `pinSpacing: true`, `scrub: 0.6`, `anticipatePin: 1`):
    - Smoothly transitions out the active service panel (`opacity: 0, y: -24, autoAlpha: 0`) and seamlessly animates the next service panel into view (`opacity: 1, y: 0, autoAlpha: 1`) with settle/hold beats for unhurried readability
    - Syncs `activeIndex` in real time during scroll and centers the active tab in the top index on mobile viewports
    - Enables direct tab click interaction that smoothly scrolls the pinned section to that service's scroll position via Lenis / window scroll
  - Implemented refined 3-column layout on desktop/tablet for each active service display area (`grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center`):
    - Left Column (`md:col-span-4`): Active service title with fluid editorial serif typography (`text-[clamp(1.85rem,1.3rem+2.4vw,4rem)]`), category subtitle, and service number
    - Middle Column (`md:col-span-4`): Concise, well-balanced editorial description block paired with subtle tactile deliverables list
    - Right Column (`md:col-span-4`): Cinematic preview image using shared `CldImage` from `next-cloudinary` with `rounded-none`, `aspect-[4/5]`, and `pso8u1zy` cloud name extraction
  - Implemented mobile layout: Fluidly collapses the 3 columns into a single vertically stacked column (`flex flex-col text-center md:text-left`) with touch-friendly spacing and `max-h-[28dvh]` / `sm:max-h-[34dvh]` image height caps preventing any viewport overflow
  - Implemented accessible fallback for `prefers-reduced-motion: reduce`: Disables pinning and transforms, rendering all services in an unclipped, static vertical flow with full opacity and interactive anchor navigation
  - Strictly adheres to ZIVORA dual-theme design tokens (`#EAE6DF` Warm Light / `#20211F` Cinematic Dark) with zero hardcoded pure black or white
- Feature Spec 03: About Me Section (3-Column Layout) (`context/feature-specs/03-about-me.md`)
  - Redesigned `components/sections/AboutSection.tsx` (`"use client"`) with direct named and default exports (zero barrel files)
  - Implemented 3-column layout on desktop/tablet using `justify-between items-center` (`flex flex-col md:flex-row items-center justify-between`):
    - Left Column: Sharp-edged portrait image container strictly enforcing zero border radius (`rounded-none`) across the figure container, Cloudinary wrapper, and image element, preserving explicit `4 / 5` aspect ratio to prevent CLS
    - Middle Column: Large editorial typography stating "Hi, I'm Sazii. A photographer and a video grapher." with fluid serif hierarchy and bronze/champagne accent styling, paired directly below with a minimalist sharp-edged "view works" outline button (`rounded-none`) linking to `/works` with `data-cursor="expand"`
    - Right Column: Refined descriptive text block detailing creative background, analog discipline, and spatial narrative
  - Implemented mobile layout: Fluidly collapses the 3 columns into a single, vertically stacked, center-aligned column (`flex-col items-center text-center`) ensuring touch-friendly spacing and readability
  - Integrated shared `CldImageWrapper` (`components/cloudinary-image.tsx` wrapping `next-cloudinary` `CldImage`) with cloud name resolution (`pso8u1zy`) and responsive `sizes`
  - Applied ZIVORA dual-theme tokens (`bg-background`, `text-copy-primary`, `text-copy-secondary`, `text-brand`, `border-surface-border/70`, `outline-ring`) supporting Warm Light (#EAE6DF) and Cinematic Dark (#20211F) with zero pure black or white fallbacks
  - Built staggered GSAP scroll-triggered entrance animation (`gsap.matchMedia()`, `start: "top 80%"`, `once: true`, `stagger: 0.15`) revealing image, center greeting/button, and right description with subtle fade-in and vertical translation
  - Implemented pinned reading hold (`start: "top top"`, `end: "+=100%"`, `pin: true`, `pinSpacing: true`, `scrub: 0.65`, `anticipatePin: 1`): locks the section in the viewport for a deliberate reading duration with subtle portrait camera breathing zoom (`1 -> 1.035`) and hairline reading progress bar before unpinning to release the user into `ServicesSection`
  - Accessible static fallback for `prefers-reduced-motion: reduce` rendering immediate static layout with zero pinning or heavy transforms
  - Integrated directly in `app/page.tsx` between `FeaturedWork` and `ServicesSection`
- Redesign 01: Hero Section (Cinematic Blur Reveal) (`context/redesign/01-hero.md`)
  - Redesigned `components/hero/HeroSection.tsx` (`"use client"`) with direct named and default exports (zero barrel files)
  - Implemented GSAP master entrance timeline (`gsap.timeline()`):
    - Step 1: Letter-by-letter blur-to-clear headline reveal (`opacity: 0, filter: blur(10px)` to `opacity: 1, filter: blur(0px)` with `clearProps: "filter,transform"`)
    - Step 2: Entrance of the horizontal image line (opacity fade + vertical translation / scale-up with staggered cards) once title is in clear focus
    - Step 3: Fade-in of the anchoring descriptive text block concluding the sequence
    - Accessible fallback for `prefers-reduced-motion: reduce` rendering crisp static layout immediately with zero blur or heavy transforms
  - Implemented asymmetrical desktop/tablet layout: Top-left large fluid 'ZIVORA' headline, mid-left responsive horizontal image line below title, and bottom-right anchoring editorial text block
  - Implemented centered & stacked mobile layout: Centered headline (`flex items-center justify-center mx-auto text-center`), centered description text directly beneath it, and horizontal image line positioned directly below the centered text with touch scroll (`touch-pan-x`) and responsive scaling to prevent overflow
  - Dynamically calculates the exact number of full images that fit the viewport width via `ResizeObserver` and window resize listener, using SSR-safe initial state
  - Integrated shared `CldImageWrapper` (`components/cloudinary-image.tsx` wrapping `next-cloudinary` `CldImage`) with strict `3 / 4` aspect ratios, sharp editorial edges with zero border-radius (`rounded-none`), responsive `sizes`, cloud name extraction (`pso8u1zy`), hover zoom, and editorial caption scrims with zero CLS
  - Applied dual-theme design tokens (`#EAE6DF` Warm Light / `#20211F` Cinematic Dark) with zero hardcoded pure black or white
  - Maintained `aria-label="Immersive Hero Section"` for seamless Smart Sticky Navbar past-hero scroll detection
  - Cleaned up unused imports in `app/page.tsx`, achieving 0 ESLint warnings and 0 errors across the entire codebase
- Feature 01: UI Foundation & Design System (`context/feature-specs/01-design-architecture.md`)
  - Utility helper `cn()` with `clsx` and `tailwind-merge` in `lib/utils.ts`
  - Dual-theme token configuration (Warm Light #EAE6DF / Cinematic Dark #20211F) in `app/globals.css`
  - Anti-flash ThemeProvider with system/light/dark persistence and `suppressHydrationWarning`
  - ThemeToggle component in `components/theme-toggle.tsx`
  - shadcn/ui primitives (`Button`, `Card`, `Dialog`, `Input`, `Tabs`, `Textarea`, `ScrollArea`) in `components/ui/`
  - Stroke-based icons via `lucide-react`
  - GSAP configuration and cinematic entrance/stagger presets with `prefersReducedMotion` support in `lib/gsap.ts`
  - Lenis smooth scrolling provider in `components/smooth-scroll.tsx` with touch/gesture preservation (`syncTouch: false`) and reduced-motion guard
  - Shared Cloudinary Image wrapper in `components/cloudinary-image.tsx` with responsive sizing, skeleton placeholder, and aspect-ratio preservation
- Feature 02: Hero Section (`context/feature-specs/02-hero-section.md`)
  - Created `components/sections/HeroSection.tsx` client wrapper with GSAP animation timeline and Server Component friendly props contract
  - Implemented full-viewport (`min-h-[100dvh]`) layout with responsive background media via `next-cloudinary` (`CldImage` with priority/fill, HTML5 video support with poster fallback)
  - Atmospheric dual-theme gradient overlay adhering to `#20211F` (Cinematic Dark) and `#EAE6DF` (Warm Light) with radial focus vignette ensuring >12:1 WCAG contrast
  - Bold fluid typography (`text-4xl` to `text-9xl`) with serif/sans pairing (`font-serif italic text-brand` accent)
  - Staggered GSAP text reveal sliding up from masked `overflow-hidden` containers, subtle scale/fade-in for background media, and clean `prefersReducedMotion` fallback
  - Minimalist animated scroll indicator ("Scroll / Explore") with drifting bead animation and smooth-scrolling click behavior
  - Drifting coordinate and editorial watermarks (`34°01'10"N 118°29'48"W`, `VOL. 26 // ISSUE 01`, `35MM ARCHIVE`)
  - Mobile-first touch-friendly CTA buttons ("Explore Work", "Get in Touch") positioned within thumb reach (min-h-[48px])
  - Updated `app/page.tsx` with editorial header, live ThemeToggle, HeroSection mount, and smooth anchor navigation
- Feature 03: Redesign Immersive Hero Section (`context/feature-specs/03-redesign-hero-section.md`)
  - Implemented `components/hero/HeroSection.tsx` with re-export in `components/hero/index.ts` and `components/sections/HeroSection.tsx`
  - Fullscreen cinematic background video `/hero.mp4` with HTML5 autoplay, muted, loop, playsinline, and poster fallback `/hero-poster.jpg`
  - Atmospheric dual-theme gradient overlay adhering to `#20211F` (Cinematic Dark) and `#EAE6DF` (Warm Light) with radial center vignette providing >12:1 WCAG contrast
  - Centered interactive magnetic brand title ("ZIVORA") split into individual letter spans with fluid responsive typography (`text-6xl` to `text-[15rem]`) and GSAP mouse-move displacement & tilt
  - Cinematic subtitle: "Cinematic Photography & Videography" with refined letter spacing (`tracking-[0.25em]` to `tracking-[0.35em]`)
  - Animated minimalist scroll-down indicator at bottom center with drifting bead keyframe animation and smooth-scrolling click behavior
  - Built custom mouse cursor (`components/ui/CustomCursor.tsx`) with GSAP `quickTo` smooth trailing dot/ring, interactive hover expansion on interactive elements, and automatic disablement on touch devices and reduced motion
  - Integrated `HeroSection` and `CustomCursor` into `app/page.tsx`
- Feature 04: Smart Sticky Navbar (`context/feature-specs/04-navbar.md`)
  - Implemented `components/layout/Navbar.tsx` (and `components/layout/index.ts` barrel export) with smart scroll direction detection (hides on scroll down via `-translate-y-full`, reveals on scroll up via `translate-y-0`), past-Hero detection transitioning to `bg-surface/85 backdrop-blur-md` with subtle border, and `usePathname()` active link styling
  - Desktop layout (`justify-between`): editorial nav links (Home `/`, Works `/works`, Packages `/packages`, Contact `/contact`) on left, centered "ZIVORA" brand mark linking to `/`, and `ThemeToggle` on right
  - Mobile layout: touch-optimized hamburger trigger on left (44px+ hit target), centered "ZIVORA" brand mark, and `ThemeToggle` on right
  - Implemented `components/layout/MobileMenu.tsx` full-screen overlay with staggered GSAP entrance and smooth exit animations, reduced-motion support, keyboard focus trap, Escape-to-close, focus restoration, and Lenis scroll locking (`getLenis()?.stop()` / `start()`)
  - Integrated `<Navbar />` into `app/layout.tsx` inside `<SmoothScroll>` so it persists across all routes
- Component Structure & Export Guidelines (`context/standerds/component-structure.md`)
  - Removed barrel/re-export files (`components/hero/index.ts`, `components/layout/index.ts`, `components/sections/index.ts`) and legacy re-export stub (`components/sections/HeroSection.tsx`, removing empty `components/sections/`)
  - Updated `app/layout.tsx` to import `Navbar` directly from `@/components/layout/Navbar`
  - Verified all remaining components define direct exports from uniquely named files and all imports target exact file paths
- Feature 05: Cinematic Pinned Text Section (`context/feature-specs/05-cinematic-pinned-text.md`)
  - Registered `ScrollTrigger` with `ignoreMobileResize: true` and exported it from `lib/gsap.ts`
  - Synchronized Lenis smooth scrolling with GSAP `ScrollTrigger.update` via `gsap.ticker` and `lagSmoothing(0)` in `components/smooth-scroll.tsx`
  - Created `components/sections/CinematicText.tsx` (direct exports, no barrel files) rendering `"Capturing fleeting light and timeless architectural forms."` with fluid `clamp(1.75rem, 0.9rem + 3.6vw, 4.375rem)` serif typography, `text-balance`, and non-breaking word spans
  - Implemented scrubbed GSAP `ScrollTrigger` pinning via `gsap.matchMedia()` with staggered word reveal, continuous subtle camera push (`scale` + `y`), full fade-out before unpinning, touch/mobile `start`/`end` (`"center center"` / `"+=85%"`) vs desktop (`"top top"` / `"+=175%"`), and static accessible fallback for `prefers-reduced-motion: reduce`
  - Integrated `<CinematicText />` directly below `<HeroSection />` in `app/page.tsx`
- Feature 06: Featured Work Section (`context/feature-specs/06-featured-work-section.md`)
  - Implemented `components/sections/FeaturedWork.tsx` (`"use client"`) with direct named exports (`FeaturedWork`, `FeaturedProjectItem`, `FeaturedWorkProps`, default export) and zero barrel files
  - Chunks projects into pairs (default 4 items -> 2 rows) where each pair renders in its own edge-to-edge `min-h-[100dvh]` grid (`grid-cols-1` on mobile, `md:grid-cols-2` on desktop, `auto-rows-[minmax(auto,1fr)]`) so strictly 2 project cards fill the viewport at a time while scrolling naturally down the page with zero outer padding, zero gap, zero card border-radius, and subtle `1px` `border-surface-border/70` hairline borders
  - Implemented GSAP `ScrollTrigger` scrubbed title fade (`start: "top 35%"`, `end: "top top"` on the first pair row, with `prefers-reduced-motion: reduce` fallback) so the `Featured Works` `<header>` smoothly fades out as the first pair occupies the viewport while rows continue scrolling in normal document flow
  - Integrated `CldImage` from `next-cloudinary` with `fill`, responsive `sizes`, `object-cover object-center`, and cloud name resolution (`pso8u1zy`) for the provided Cloudinary thumbnail URL (`https://res.cloudinary.com/pso8u1zy/image/upload/v1794419553/ij0uyatmtd17wz1jdosz.jpg`)
  - Anchored editorial project metadata (placeholder title, category/year subtitle) and underlined `"view project"` text link (`href="/works"`, configurable via `items` prop) to the bottom-left corner over a theme-aware `var(--background)` gradient scrim with WCAG-accessible contrast and `forced-colors` support
  - Integrated `<FeaturedWork />` into `app/page.tsx` below `<CinematicText />`
- Feature 07: About Me Section (`context/feature-specs/07-about-us-home.md`)
  - Implemented `components/sections/AboutSection.tsx` (`"use client"`) with direct exports (`AboutSection`, `AboutSectionProps`, default export) and zero barrel files
  - Built contained editorial split layout (`max-w-7xl`, `grid-cols-1` stacked image-above-text on mobile, `md:grid-cols-2 items-center` on desktop with portrait strictly on the left and vertically centered typography on the right)
  - Integrated shared `CldImageWrapper` (`components/cloudinary-image.tsx` wrapping `next-cloudinary` `CldImage`) with `aspectRatio="4 / 5"` (`960x1200`), responsive `sizes`, `object-cover object-center`, skeleton loading placeholder, and `resolveCloudName()` (`pso8u1zy`) for the temporary placeholder Cloudinary image (`https://res.cloudinary.com/pso8u1zy/image/upload/v1794419553/ij0uyatmtd17wz1jdosz.jpg`)
  - Applied dual-theme design tokens (`bg-background`, `text-copy-primary`, `text-copy-secondary`, `text-brand`, `decoration-brand`, `border-surface-border/70`, `outline-ring`) and fluid WCAG-compliant `clamp()` typography paired with concise ZIVORA creative vision copy and underlined `"get in touch"` link (`href="/contact"`)
  - Added scroll-triggered GSAP entrance animation (`start: "top 82%"`, `once: true`, `document.fonts?.ready` refresh, `clearProps: "transform"`) plus a brief desktop viewport pin (`min-h-[100dvh]`, `start: "top top"`, `end: "+=55%"`, `scrub: 0.8` when `(min-width: 768px) and (min-height: 580px)`) with gentle portrait zoom (`1 -> 1.035`) and copy counter-drift, falling back to non-pinned entrance on narrow mobile viewports and static visibility under `prefers-reduced-motion: reduce`
  - Integrated `<AboutSection />` into `app/page.tsx` below `<FeaturedWork />`
- Feature 08: Services Showcase Section (`context/feature-specs/08-service-showcase.md`)
  - Implemented `components/sections/ServicesSection.tsx` (`"use client"`) with direct exports (`ServicesSection`, `ServiceItem`, `ServicesSectionProps`, default export) and zero barrel files
  - Built creative editorial typography-driven service list (`Editorial Photography`, `Cinematic Videography`, `Brand Narratives`, `Creative Direction`, configurable via `services` prop) paired on desktop (`lg:grid-cols-12`) with a sticky fixed-aspect (`aspect-[4/5]`) Cloudinary preview stage and gracefully degrading on mobile/tablet (`< lg`) to a touch-friendly inline accordion (`aspect-[16/10]` media + description beneath each title)
  - Integrated shared `CldImageWrapper` (`components/cloudinary-image.tsx`) with `resolveCloudName()` (`pso8u1zy`) and aspect-ratio reservation to eliminate CLS
  - Added GSAP scroll-triggered section entrance (`start: "top 82%"`, `once: true`), smooth GSAP description height/opacity transitions (`onPointerEnter` mouse preview on desktop + `onClick` selection/accordion toggle), GSAP desktop preview image cross-fades (`opacity` + gentle `scale`), `hidden="until-found"` + `beforematch` find-in-page synchronization (where supported), and `prefers-reduced-motion: reduce` support
  - Applied ZIVORA dual-theme tokens (`bg-background`, `bg-surface`, `text-copy-primary`, `text-copy-secondary`, `text-brand`, `border-surface-border/70`, `outline-ring`), `Plus`/`Minus` state icons, `role="list"`, and heading-wrapped `<button aria-expanded aria-controls>` disclosure triggers
  - Integrated `<ServicesSection />` into `app/page.tsx` below `<AboutSection />`
- Feature 09: Sample Gallery Section (`context/feature-specs/09-sample-gallery-section.md`)
  - Implemented `components/sections/SampleGallery.tsx` (`"use client"`) with direct named exports (`SampleGallery`, `SampleGallerySkeleton`, `SampleGalleryItem`, `SampleGalleryMediaType`, `SampleGalleryProps`, `SampleGallerySkeletonProps`, default export) and zero barrel files
  - Built Pinterest-style responsive CSS multi-column masonry grid (`columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5` with `inline-block w-full break-inside-avoid align-top` items) strictly maintaining 2 columns on mobile and scaling to 3 (tablet) and 4 (desktop) while preserving natural varied aspect ratios (`4/5`, `3/2`, `3/4`, `1/1`, `2/3`, `16/10`, `4/3`) across 12 photography and videography samples with zero CLS
  - Integrated shared `CldImageWrapper` (`components/cloudinary-image.tsx` wrapping `next-cloudinary` `CldImage`) with responsive `sizes`, default lazy loading for below-the-fold frames, per-image skeleton loading placeholders, and `resolveCloudName()` (`pso8u1zy`) for the temporary placeholder Cloudinary URL (`https://res.cloudinary.com/pso8u1zy/image/upload/v1794419553/ij0uyatmtd17wz1jdosz.jpg`)
  - Implemented `SampleGallerySkeleton` (`isLoading` prop) mirroring the exact multi-column masonry layout and aspect ratios during asset fetching, plus a subtle editorial empty state when `items` is empty
  - Added GSAP scroll-triggered staggered entrance choreography (`gsap.matchMedia()` + `ScrollTrigger.batch()` sorting each entering batch visually by row/column, `document.fonts?.ready` refresh, safe handling of already-scrolled items, and static visibility under `prefers-reduced-motion: reduce`)
  - Configured touch-optimized mobile interactions (`touch-manipulation`, active opacity feedback, non-hover `"Film"` videography badges) and fine-pointer desktop hover/focus states (inner wrapper `scale-[1.035]`, `var(--background)` gradient scrim caption reveal, `CustomCursor` `data-cursor="expand"`, unclipped `<Link>` focus outlines)
  - Integrated `<SampleGallery />` into `app/page.tsx` below `<ServicesSection />`
- Feature 10: Rearranging Services (`context/feature-specs/10-rearranging-services.md`)
  - Clarified and recorded requirements in `context/feature-specs/10-rearranging-services.md` (pinned horizontal conveyor across motion-allowed viewports, vertical card structure, 4 existing services)
  - Refactored `components/sections/ServicesSection.tsx` (`"use client"`) while keeping direct exports (`ServicesSection`, `ServiceItem`, `ServicesSectionProps`, default export) and zero barrel files
  - Implemented pinned horizontal conveyor via `gsap.matchMedia()` + `ScrollTrigger` (`start: "top top"`, `pin: true`, `pinSpacing: true`, `scrub: 0.65`, `anticipatePin: 1`) across all motion-allowed viewports (`motion-safe:h-[100dvh]`): vertical scroll locks `#services` while cards enter from the right edge of the viewport (`getStartX` → `getEndX` over `0.9` duration + `0.1` settle beat) alongside a hairline `scaleX` progress bar until the final card (`Creative Direction`) sits cleanly inside the viewport
  - Structured each service panel vertically in the specified order: index/subtitle header, large editorial serif title (`Editorial Photography`, `Cinematic Videography`, `Brand Narratives`, `Creative Direction`), concise description beneath the title, and `16 / 10` Cloudinary image (`CldImageWrapper` with `resolveCloudName()` and `max-w-[min(100%,48dvh)]` / `sm:max-w-[min(100%,54dvh)]` viewport-height guard) underneath
  - Placed `overflow-x-clip` on an inner full-width container inside `<section>` rather than the pinned `<section>` itself to avoid overflow/pinning conflicts across browsers
  - Configured mutually exclusive `motion-safe:` / `motion-reduce:` responsive layout rules so `prefers-reduced-motion: reduce` disables horizontal pinning/transforms and displays all 4 services in a static 2-column desktop / 1-column mobile grid with zero clipped items

## In Progress

- none

## Next Up

- Album Layout & Masonry Grid (or next approved feature)

## Open Questions

- None.

## Architecture Decisions

- Connected Sanity `feedback` documents to `UserFeedback` via Next.js 16 `"use cache"` and `sanityFetch({ query: FEEDBACKS_QUERY })` wrapped in `<Suspense fallback={<UserFeedback />}>`. Sized the query limit to 5 items (`[0...5]`) ordered by `publishedAt desc, _createdAt desc`. Removed hardcoded mock array `DEFAULT_FEEDBACK_CARDS` from `UserFeedback.tsx` to ensure zero stale mock data in codebase files.
- Built an adaptive responsive layout system for `UserFeedback`:
  - Dynamically assigns non-overlapping coordinates, rotations, and zoom scales for any card count between 1 and 5 (`RESPONSIVE_LAYOUT_PRESETS`).
  - Sets an adaptive overview scale ceiling (`maxOverviewScale`) so 1 or 2 cards fill the camera viewport with presence (~0.60–0.72 scale) rather than being stranded at wide-angle 0.42 scale.
  - Dynamically adjusts timeline duration/pin length (`end`) based on `activeCards.length` so fewer cards don't force excessive scrolling.
  - Automatically calculates step progress and displays synchronized HUD viewfinder telemetry (`[ ALL / 02 ] — OVERVIEW`, `[ 01 / 02 ] — Sakkili Miya`, etc.).
  - Added support for client avatar/commission image rendering in card footers via `CldImage` (Cloudinary URLs) and `next/image` (`unoptimized` for non-Cloudinary images).


- Connected Cloudinary Search API to `SampleGallery` via `getSampleGalleryImages()` in `lib/cd.ts` and Next.js 16 `"use cache"` in `app/page.tsx` wrapped in `<Suspense fallback={<SampleGallery />}>`. Calculated target capacity as 16 items to perfectly populate the 16 predefined floating positions on desktop (5 horizontal bands) and 8 balanced pairs on mobile without visual voids. Configured search expression `(folder:SAMPLE-GALLERY* OR asset_folder:SAMPLE-GALLERY*) AND resource_type:image` to support both legacy folder hierarchies and Cloudinary dynamic asset folders. Added defensive warning and fallback in case the Cloudinary API access key is missing `actions=["read"]` permissions.

- Connected Sanity `category` documents to `ServicesSection` on the home page via Next.js 16 `"use cache"` and `sanityFetch({ query: CATEGORIES_QUERY })` wrapped in `<Suspense fallback={<ServicesSection />}>`. Preserved defensive fallback to `DEFAULT_SERVICES` in `ServicesSection.tsx` so missing or empty category arrays do not cause layout shifts or empty UI. Ordered categories by `publishedAt asc, _createdAt asc` to preserve the user's sequential discipline ordering (`Wedding Photography`, `Birthday Shoot`, `Portrait Photography`).
- Built `FeaturedWork` integration with Next.js 16 `"use cache"` and `sanityFetch({ query: FEATURED_ALBUMS_QUERY })` wrapped in `<Suspense fallback={<FeaturedWork />}>`. Preserved defensive fallback to `DEFAULT_FEATURED_PROJECTS` in `FeaturedWork.tsx` so missing or empty album arrays do not cause layout shifts or empty UI. Ordered featured albums by `publishedAt desc, _createdAt desc` with deterministic year extraction from `eventDate` / `publishedAt` avoiding dynamic `new Date()` calls during static prerendering.
- Configured Sanity Live Content API via `defineLive` (`next-sanity/live`) with `<SanityLive />` mounted in `app/layout.tsx` and `sanityFetch` in server data loaders. Configured CORS credentials on Sanity project `xu3rhmio` for `http://localhost:3000` to support local real-time SSE listener updates.
- Configured Next.js 16 Cache Components with `"use cache"` directive and `<Suspense fallback={<HeroSection />}>` boundary for dynamic Sanity Content Lake data fetching in `app/page.tsx`, enabling fast static prerendering, streaming, automated 15m revalidation, and graceful fallback to defaults if offline or build-time network is absent.
- Preserved defensive `activeItems` memoization in `HeroSection.tsx` so empty arrays or undefined passed to `items` automatically fall back to `DEFAULT_HERO_IMAGES`, ensuring zero broken layouts or layout shift (CLS).

- Dual-theme tokens mapped to Tailwind CSS variables (`--background`, `--surface`, `--surface-subtle`, `--text-primary`, `--text-secondary`, `--border`, `--accent`, etc.) alongside shadcn design tokens.
- Lenis smooth scrolling integrated via a lightweight client provider mounted in the root layout, with touch/accessibility preservation and cleanup.
- GSAP animation utility configured for client-side entrance and transitions respecting user's reduced-motion preference.
- Shared Cloudinary Image wrapper built around `next-cloudinary` with aspect ratio preservation and blur/skeleton placeholder support.
- Hero Section uses layered atmospheric gradients (`var(--background)` stops) so text contrast naturally adapts to light and dark themes with zero hardcoded colors.
- Hero Section media layer contains an ambient architectural SVG/CSS canvas beneath Cloudinary media to guarantee graceful degradation without blank/broken layouts during offline states or unconfigured API credentials.
- Configured build to use `--webpack` due to Next 16 Turbopack subprocess loader communication issue on macOS.
- Navbar detects `section[aria-label="Immersive Hero Section"]` bottom boundary (falling back to 40px on routes without a Hero section) to transition from transparent to `bg-surface/85 backdrop-blur-md` once past the Hero section, and coordinates scroll state via `requestAnimationFrame` on mount/route change to respect React 19 `react-hooks/set-state-in-effect`.
- MobileMenu delegates open/close opacity and transform transitions exclusively to GSAP (with `prefersReducedMotion` fallback), locks Lenis + body scroll when active, traps `Tab` focus inside the dialog, and restores focus to the navbar trigger on close.
- Standardized component organization under `context/standerds/component-structure.md`: no barrel (`index.ts`/`index.js`) or pure re-export files inside component directories; all components export directly from their uniquely named file and are imported via exact file paths.
- Synchronized Lenis with GSAP `ScrollTrigger` (`lenis.on("scroll", ScrollTrigger.update)` + `gsap.ticker` with `lagSmoothing(0)`) in `components/smooth-scroll.tsx` and enabled `ScrollTrigger.config({ ignoreMobileResize: true })` in `lib/gsap.ts` to prevent frame lag and mobile address-bar resize jumps during pinned scroll scrubs.
- Configured `CinematicText` with `gsap.matchMedia()` so desktop uses `start: "top top"`, `end: "+=175%"`, `scrub: 1`, touch/mobile viewports use `start: "center center"`, `end: "+=85%"`, `scrub: 0.6`, and `prefers-reduced-motion: reduce` renders statically at `opacity: 1` without pinning.
- Built `FeaturedWork` as a `"use client"` natural-scroll showcase (`gsap.matchMedia()`) that chunks works into paired `min-h-[100dvh]` rows (`grid-cols-1 md:grid-cols-2 auto-rows-[minmax(auto,1fr)]`) so 2 project cards fill the viewport at a time while scrolling naturally without pinned card-deck overlaps, and uses GSAP `ScrollTrigger` (`trigger: firstRow`, `start: "top 35%"`, `end: "top top"`, `scrub: true`) to smoothly fade out the `Featured Works` header as the first pair occupies the viewport (`prefers-reduced-motion: reduce` keeps the title statically visible). Uses `CldImage` (`fill` + `object-cover` + URL-extracted `pso8u1zy` cloudName), zero outer padding/gap/border-radius, subtle `1px` `border-surface-border/70` dividers, and `var(--background)` gradient scrims with `decoration-brand` underlined `"view project"` `<Link>` (`href="/works"` default).
- Built `AboutSection` (`components/sections/AboutSection.tsx`, Feature Spec 03 / 09) as a 3-column editorial layout: on desktop/tablet, `justify-between items-center` distributes space evenly across three vertically centered columns (Left: sharp-edged portrait container strictly enforcing zero border radius (`rounded-none`), Center: large editorial serif greeting "Hi, I'm Sazii. A photographer and a video grapher." paired directly with a minimalist sharp-edged "view works" outline button linking to `/works`, Right: refined descriptive text block detailing creative background); on mobile, fluidly collapses into a single, vertically stacked, center-aligned column (`flex-col items-center text-center`) for optimal touch readability. Animates entrance via staggered GSAP scroll-triggered timeline (`start: "top 80%"`, `once: true`, `stagger: 0.16`) with subtle opacity fade-in and vertical translation (`y: 28` to `0`), providing immediate static visibility under `prefers-reduced-motion: reduce`.
- Refactored `ServicesSection` (`components/sections/ServicesSection.tsx`, Feature 10) from a vertical hover/click list + sticky preview stage into a pinned horizontal scroll conveyor (`motion-safe:h-[100dvh]`): across all motion-allowed viewports, `#services` pins at `top top` (`pin: true`, `pinSpacing: true`, `scrub: 0.65`, `anticipatePin: 1`) and locks vertical page scroll while `trackRef` glides from `getStartX()` (`max(0.55 * containerWidth, containerWidth - 0.78 * firstCardWidth)`) to `getEndX()` (clamped so the final card enters completely into the viewport and settles for `0.1` of the scrubbed timeline) alongside a `scaleX` progress bar; each service card orders header metadata, serif title, concise description, and `16 / 10` `CldImageWrapper` photo vertically with `dvh` media caps (`max-w-[min(100%,48dvh)]` / `sm:max-w-[min(100%,54dvh)]`) and inner `overflow-x-clip` stage isolation; and mutually exclusive `motion-safe:` / `motion-reduce:` classes fall back to a static 2-column desktop / 1-column mobile grid under `prefers-reduced-motion: reduce` (superseding the Feature 08 accordion/sticky-stage pattern).
- Built `SampleGallery` (`components/sections/SampleGallery.tsx`) using CSS multi-column masonry (`columns-2 gap-3 sm:columns-3 sm:gap-4 lg:columns-4 lg:gap-5` with `inline-block w-full break-inside-avoid align-top` cards) rather than JS viewport-width column splitting or experimental `grid-template-rows: masonry`, eliminating SSR/hydration layout shifts while guaranteeing 2 columns on mobile and expanding to 3–4 columns on tablet/desktop. Integrates `CldImageWrapper` (`components/cloudinary-image.tsx`) inside a dedicated hover-scale wrapper so `CldImageWrapper`'s `transition-opacity` fade-in stays intact, preserves natural `aspectRatio` per asset, provides `SampleGallerySkeleton` mirroring the exact masonry geometry (`isLoading` prop), and animates staggered viewport entrances via `gsap.matchMedia()` + `ScrollTrigger.batch()` sorted visually by row/column.
- Redesigned `HeroSection` (`components/hero/HeroSection.tsx`, Redesign 01) using a strict GSAP master timeline (`gsap.timeline()`): letter-by-letter blur-to-clear entrance of the main title ("ZIVORA") from `filter: blur(10px), opacity: 0` to `filter: blur(0px), opacity: 1` with `clearProps: "filter,transform"`; once the title comes into focus, the horizontal image line enters with opacity fade + vertical translation + scale-up; and the anchoring description block concludes the sequence. Built with single DOM structure using responsive CSS flexbox ordering (`order-1` title, `order-2 md:order-3` description, `order-3 md:order-2` image line) to achieve the asymmetrical desktop layout (top-left title, mid-left image line, bottom-right description) and centered & stacked mobile layout (centered headline & description, image line positioned directly below with horizontal touch scroll) without markup duplication or layout jumps. Dynamically measures container width via `ResizeObserver` to calculate the exact number of full images that fit the viewport width.
- Implemented `ServicesSection` (`components/sections/ServicesSection.tsx`, Feature Spec 10 / 06) as a scroll-reveal section with top flex index and refined 3-column layout: top horizontal flex index lists all service titles with touch-friendly mobile horizontal scrolling and active state underline highlight synced to vertical scroll position; GSAP `ScrollTrigger` pinned scrubbed timeline (`pin: true`, `pinSpacing: true`, `scrub: 0.6`, `anticipatePin: 1`) smoothly transitions out the active service panel (`opacity: 0, y: -24, autoAlpha: 0`) and reveals the next service panel (`opacity: 1, y: 0, autoAlpha: 1`) while syncing `activeIndex` and auto-centering mobile tabs; each active service displays a 3-column layout on desktop/tablet (Left: large fluid serif title, Middle: concise description and tactile deliverables, Right: cinematic `CldImage` with `rounded-none` and `pso8u1zy` cloud resolution) and fluidly collapses into a single vertically stacked column on mobile viewports with `max-h-[28dvh]` / `sm:max-h-[34dvh]` caps; and `prefers-reduced-motion: reduce` renders an unclipped, static vertical flow with zero pinning or heavy transforms.
- Redesigned & Refined `SampleGallery` (`components/sections/SampleGallery.tsx`, Feature Spec 07 Refinement):
  - Mobile: Clean, touch-optimized responsive 2-column grid (`grid grid-cols-2 gap-3 sm:gap-4`) in normal document flow.
  - Desktop: Dense floating & flying asymmetrical canvas across `h-[175vh] lg:h-[190vh] xl:h-[200vh]` featuring 16 curated photos distributed across 5 column bands (left, mid-left, center, mid-right, right) so 5–7 photos occupy the viewport simultaneously without empty dead space.
  - Nested dual-wrapper motion architecture: outer wrapper handles GSAP `ScrollTrigger` scrubbed vertical parallax across foreground, midground, and background layers; inner wrapper animates continuous idle float tweens (`repeat: -1, yoyo: true`, subtle randomized x, y, rotation).
  - Strictly uses `CldImage` from `next-cloudinary` with `resolveCloudName()` (`pso8u1zy`), responsive `sizes`, explicit `aspectRatio`, and `rounded-none border border-surface-border/70` styling. Zero text, zero titles, zero descriptions, zero video overlays. Fully disables animation under `prefers-reduced-motion: reduce`.
- Built `ConsistencyBreakText` (`components/sections/ConsistencyBreakText.tsx`, Feature Spec 08):
  - Implemented as a full-viewport (`min-h-[100dvh]`) editorial interlude section designed to deliberately break the consistency of previous layouts.
  - References the file named "ZIVORA" verbatim to align with the broader project architecture.
  - Emulates high-end movie title sequence typography with fluid `clamp()` sizing, uppercase serif headlines, monospace category taglines, and subtle background watermark.
  - Supports extreme asymmetrical (left/right) and centered layouts across sequential text blocks.
  - Implemented GSAP `ScrollTrigger` scrubbed timeline pinning (`start: "top top"`, `pin: true`, `pinSpacing: true`, `scrub: 0.6` mobile / `0.9` desktop, `anticipatePin: 1`): each text block smoothly fades in (opacity 0 -> 1) with subtle vertical translation and scale, holds for unhurried readability, and completely fades out (opacity 1 -> 0, `autoAlpha: 0`) before the next sequence appears.
  - Seamlessly integrates with Lenis smooth scrolling and provides an accessible static vertical document flow for `prefers-reduced-motion: reduce`.
  - Mounted directly in `app/page.tsx` replacing duplicate placeholder `<CinematicText />` between `<FeaturedWork />` and `<ServicesSection />` without touching any other section components.
- Built `UserFeedback` (`components/sections/UserFeedback.tsx`, Feature Spec 13 Refinement — Overview Shot then Zoom One by One):
  - Virtual wall canvas (`240vw` by `240vh`, min 2000x1600px) representing an expansive physical studio pinboard holding 5 distinct tactile sticky cards scattered in an organic non-overlapping constellation (Top-Left, Top-Right, Center, Bottom-Left, Bottom-Right).
  - Tactile sticky cards styled with organic slight rotations (`-2.2°` to `+2.4°`), sharp corners (`rounded-none`), subtle border (`border-surface-border/90`), deep paper drop shadows (`shadow-[0_18px_45px_...]`), top simulated translucent tape strips, fluid typography (`clamp()`), and verified client citation details.
  - GSAP `ScrollTrigger` viewport pinning (`start: "top top"`, `end: "+=460%"` desktop / `+=360%"` mobile, `pin: true`, `pinSpacing: true`, `scrub: 0.85` desktop / `0.6` mobile, `anticipatePin: 1`):
    - Phase 0 (Wide Overview Shot): Calculates cluster bounding box and dynamically computes `overviewScale`, `overviewX`, and `overviewY` so all 5 cards fit inside the screen at once in an establishing shot with full visibility (`opacity: 1`, `filter: blur(0px)`).
    - Phases 1 to 5 (One-by-One Dive & Glides): As the user scrolls, the camera smoothly dives into Card 1, then glides across to Card 2, swoops to Card 3, glides to Card 4, and sweeps to Card 5.
    - Systematically calculates unscaled card center coordinates and dynamically computes invariant camera offsets (`WallX = viewportCenterX - cardCenterX * targetScale`, `WallY = viewportCenterY - cardCenterY * targetScale`) centering each card dead-center in the viewport.
    - Incorporates unhurried reading holds with subtle camera breathing drift (`scale * 1.012`) before smoothly accelerating out of frame and easing into the next focal point.
    - Cinematic rack-focus cross-fades card opacities (`0.38, blur(1.5px)` for background cards, `1.0, blur(0px)` crisp focus for the active focal card).
  - Cinematic camera viewfinder HUD overlay: active recording indicator (`CAM-A // REC`, `35MM ANAMORPHIC`), dynamic sequence counter (`[ ALL / 05 ] — OVERVIEW` in Phase 0, `[ 0X / 05 ]` in Phases 1-5), center reticle crosshair, framing bracket boundaries, telemetry readouts, and sequence position progress dots (including an overview indicator pill).
  - Accessible static fallback for `prefers-reduced-motion: reduce` rendering all 5 cards in a clean, vertical editorial document flow without pinning or transforms.
  - Seamlessly integrated into `app/page.tsx` directly after `<SampleGallery />` with zero changes to any other sections.

- Built `ContactSection` (`components/sections/ContactSection.tsx`, Feature Spec 14: Creative Contact Section Redesign):
  - Created as an expansive full-viewport (`min-h-[100dvh]`) editorial finale section utilizing whitespace design principles and zero-clutter minimalism.
  - References the file named "ZIVORA" verbatim to align with the broader project architecture.
  - Centers a massive fluid typography call-to-action ("LET'S TALK.") scaling across `clamp(3.5rem, 14vw, 17.5rem)` in the absolute visual center of the viewport, with italicized brand accent styling.
  - Positioned a minimal, borderless contact form directly below the main text, heavily anchored to the bottom-right corner of the composition.
  - Form integration features plain text inputs with subtle bottom hairline borders only (no box borders): `NAME / STUDIO *`, `EMAIL ADDRESS *`, `BRIEF SCOPE OR TIMELINE (OPTIONAL)`, muted secondary typography tokens, and a clean text-based submit button (`SEND INQUIRY ->`) aligned to the bottom right of the form block with inline transmission confirmation state.
  - Removals: Completely eliminated bottom-left social links, cursor-following image reveal logic, hover-reveal instructions, and secondary header/footer bars.
  - Mobile responsiveness: Fluidly collapses the layout into a vertically stacked, center-aligned structure, placing the contact form directly below the scaled fluid typography with touch-friendly spacing.
  - Staggered GSAP `ScrollTrigger` entrance animation (`start: "top 75%"`, `once: true`) revealing center headline and bottom-right form with subtle fade-in and vertical translation; static fallback for `prefers-reduced-motion: reduce`.
  - Dual-Theme Tokens: Strictly adheres to Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) environments without falling back to pure black or pure white.
  - Mounted directly in `app/page.tsx` as the final page block with zero changes to any other sections.

- Built `FooterSection` (`components/sections/FooterSection.tsx`, Feature Spec 15: Footer Section):
  - Created as a minimal, cinematic Footer section serving as the elegant final anchor of the website, adhering to established whitespace design principles.
  - References the file named "ZIVORA" verbatim to align with the broader project architecture.
  - Sized with generous negative space (`py-20 sm:py-28 lg:py-36 px-6 sm:px-12 lg:px-20`) inside a `max-w-7xl` container.
  - Prominently positions the required developer credit "developed by VINZI" verbatim at the very bottom of the footer (bottom-right on desktop / bottom on mobile) using the muted secondary text token (`text-copy-secondary/80`).
  - Includes standard minimalist footer elements: fluid brand typography ("ZIVORA") linking to `/`, essential navigation links (`WORKS`, `SERVICES`, `ABOUT`, `CONTACT`), smooth-scrolling "BACK TO TOP ↑" button integrated with Lenis, and static copyright year (`© 2026 ZIVORA. ALL RIGHTS RESERVED.`).
  - Strictly adheres to Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) environments using CSS custom property tokens, avoiding pure black and pure white.
  - Purposeful Motion: GSAP `ScrollTrigger` entrance animation (`start: "top 92%"`, `once: true`) with static fallback for `prefers-reduced-motion: reduce`.
  - Mounted directly in `app/page.tsx` as the final page anchor with zero changes to any other sections.

## Session Notes

- Implemented and fully verified Feature Spec 01 (UI Foundation & Design System).
- Implemented and fully verified Feature Spec 02 (Hero Section).
- Implemented and fully verified Feature Spec 03 (Redesign Immersive Hero Section).
- Implemented and verified Feature Spec 04 (Smart Sticky Navbar).
- Applied Component Structure & Export Guidelines (`context/standerds/component-structure.md`), eliminating barrel files and updating `app/layout.tsx` to direct imports.
- Implemented and statically verified Feature Spec 05 (Cinematic Pinned Text Section).
- Implemented and statically verified Feature Spec 06 (Featured Work Section).
- Implemented and statically verified Feature Spec 07 (About Me Section).
- Implemented and statically verified Feature Spec 08 (Services Showcase Section).
- Implemented and statically verified Feature Spec 09 (Sample Gallery Section).
- Implemented and statically verified Feature Spec 10 (Rearranging Services).
- Implemented and statically verified Redesign 01: Hero Section (Cinematic Blur Reveal Redesign).
- Implemented and statically verified Feature Spec 03: About Me Section (3-Column Layout).
- Implemented and statically verified Feature Spec 10 / 06: Services Scroll-Reveal Section (3-Column Layout).
- Implemented and statically verified Feature Spec 07: Floating Photo Gallery Redesign (`components/sections/SampleGallery.tsx`).
- Implemented and statically verified Feature Spec 07 Refinement: Floating Photo Gallery (Dense Desktop Floating + Mobile 2-Column Grid).
- Implemented and statically verified Feature Spec 08: Consistency Break Text Section (`components/sections/ConsistencyBreakText.tsx`).
- Implemented and statically verified Feature Spec 13 Refinement: User Feedback Section — Initial Overview (Show All Sticky Cards) then Zoom One by One (`components/sections/UserFeedback.tsx`).
- Implemented and statically verified Feature Spec 14: Creative Contact Section (Redesign) (`components/sections/ContactSection.tsx`).
- Refined `ContactSection.tsx` form scale per user feedback: expanded form container width (`max-w-lg lg:max-w-[32rem] xl:max-w-[36rem]`), increased field padding (`py-3.5 sm:py-4`), scaled input typography (`text-xs sm:text-sm lg:text-[15px]`), and enlarged submit button (`text-xs sm:text-sm tracking-[0.22em]`) for balanced visual weight with the massive center headline.
- Verified TypeScript compilation (`pnpm exec tsc --noEmit`) passes with 0 errors.
- Verified ESLint (`pnpm run lint`) passes with 0 errors and 0 warnings.
- Verified production build (`pnpm run build`) generates static pages and compiles with 0 errors (`next build --webpack`), with SSR HTML emitting the redesigned `ContactSection` centered fluid typography and bottom-right borderless form, zero barrel files in `components/`, and zero modifications to other sections.
- Implemented and statically verified Feature Spec 15: Footer Section (`components/sections/FooterSection.tsx`) mounted in `app/page.tsx` with zero barrel files, generous whitespace (`py-20 sm:py-28 lg:py-36`), verbatim "developed by VINZI" developer credit at the very bottom in muted secondary typography, essential navigation links, smooth-scroll "BACK TO TOP", dual-theme tokens, static copyright (2026), and zero modifications to other sections. Type check, ESLint, and production build with SSR inspection all passed cleanly with 0 errors and 0 warnings.
- Implemented and verified Works Page: Album Fetching, Category Filtering, Faded Cover Image Hero & Shareable URLs (`context/feature-specs/works/01-intial-setup.md`):
  - Updated specification in `context/feature-specs/works/01-intial-setup.md` to reflect "All Works" naming, top category navigation with 'ALL' option, category-filtered paginated queries, shareable URL parameters, faded category cover image with multi-directional gradient overlays, category name rendered directly on top, and clean editorial design free of artificial AI symbols.
  - Defined `WORKS_PAGE_ALBUMS_QUERY`, `WORKS_CATEGORY_ALBUMS_QUERY`, and count queries in `lib/sanity/queries.ts`.
  - Regenerated types in `sanity.types.ts` via `sanity typegen generate`.
  - Built Server Actions `fetchWorksCategoriesAction` and `fetchWorksAlbumsAction(start, limit, categorySlug)` in `app/works/actions.ts`.
  - Created `WorksGallery` in `components/sections/WorksGallery.tsx` with top hairline loading progress bar, cinematic entrance text reveal ("ALL WORKS"), top category filter bar with 'All' tab, shareable URL query parameters (`?category=slug`), faded category cover image hero with gradient overlays and overlaid category name, responsive 2-column album card grid with cover image, formatted date, category, and links to `/works/${slug}`, plus infinite scroll with IntersectionObserver and bottom loading indicator without clearing existing albums.
  - Mounted `<WorksGallery />` wrapped in `<Suspense>` and `<FooterSection />` in `app/works/page.tsx`.
  - Verified static compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`) with `/works` static page generation.
- Implemented and verified Single Album Page (`context/feature-specs/works/02-single-work.md`):
  - Created dynamic route pages `app/works/[slug]/page.tsx` and `app/work/[slug]/page.tsx` (with `app/work/page.tsx` redirecting to `/works`), supporting both `/work/[slug]` and `/works/[slug]` with Next.js 16 Partial Prerendering and `generateStaticParams`.
  - Created `components/sections/SingleWorkGallery.tsx` (`"use client"`) implementing the single album page with top hairline progress bar, GSAP cinematic entrance intro (title, description, and date fading in sequentially, holding, and fading out), Pinterest-style multi-column masonry photo grid (2-column on mobile), Cloudinary folder photo infinite scroll with append-to-bottom pagination, YouTube video presentation with 16:9 responsive embeds and empty state, and fixed bottom filter tabs for Photos and Videos with a faded gradient backdrop.
  - Implemented interactive image lightbox modal for high-resolution photo inspection with keyboard navigation (Esc, Left/Right arrow keys).
  - Updated `ALBUM_BY_SLUG_QUERY` in `lib/sanity/queries.ts` supporting both slug and ID, and added Server Actions `fetchAlbumBySlugAction` and `fetchAlbumPhotosAction` in `app/works/actions.ts`.
  - Verified TypeScript compilation (`tsc --noEmit`), ESLint (0 errors, 0 warnings), and Next.js production build (`next build --webpack`), confirming static route generation for `/work`, `/work/[slug]`, `/works`, and `/works/[slug]`.
