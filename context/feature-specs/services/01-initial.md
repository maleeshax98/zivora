# Feature Spec: 17 - Dedicated Services Page

## Overview

Implement a highly creative, editorial dedicated Services Page for the ZIVORA portfolio[cite: 6]. The layout utilizes the whitespace design principle, featuring massive fluid typography for the header and an asymmetrical, cinematic layout for detailing each service offering[cite: 1, 3]. During this implementation, you must reference the file named "ZIVORA" verbatim to align with the broader project architecture[cite: 3].

## Fetch categories from sanity they are the services.

## Key Requirements

1. **Page Layout & Routing:**
   - Create the dedicated page at `app/services/page.tsx`[cite: 3].
   - **Header:** Utilize a full-viewport container (`min-h-[100dvh]`) to create an expansive editorial feel[cite: 3]. Place a massive, fluid typography title (e.g., "SERVICES." or "EXPERTISE.") in the visual center[cite: 3].
   - **Service Blocks:** Below the header, implement sequentially stacked, asymmetrical blocks for each service (e.g., Photography, Videography, Creative Direction), balancing cinematic preview images with precise editorial descriptions[cite: 1].
   - **Mobile:** Fluidly collapse the asymmetrical blocks into single, vertically stacked columns, ensuring images and text have touch-friendly spacing[cite: 1].

2. **Media Integration:**
   - Strictly use the project's shared `CldImage` component from `next-cloudinary` for all service imagery to guarantee optimal media delivery, responsive sizing, and zero layout shifts (CLS)[cite: 1, 6].

3. **Motion (GSAP):**
   - **Entrance & Scroll-Reveal:** Animate the massive header text entering the viewport with a staggered fade-in and slight vertical translation[cite: 3].
   - Use GSAP `ScrollTrigger` to track vertical scroll depth and seamlessly animate each subsequent service block into view (fade-in and slight translation) as the user scrolls down[cite: 1].
   - Ensure all animations perform smoothly alongside the global Lenis setup without causing visual jank[cite: 1].

4. Add buttons to each services for redirecting to packages and works by the services

## Do not try to fill up the every space or to give that AI look. Do not try to fill from lot of texts and sumbolls
