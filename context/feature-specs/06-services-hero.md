# Feature Spec: 10 - Services Scroll-Reveal Section (3-Column Layout)

## Overview

Implement an interactive "Services" section for the ZIVORA home page. The layout features a horizontal flex index of all service titles at the top. As the user scrolls, the active service content transitions into view directly below it. The active service itself utilizes a refined 3-column layout: the service title on the left, a short editorial description in the middle, and a cinematic image on the right.

## Key Requirements

1. **Global Section Layout & Scroll Mechanics (GSAP):**
   - **Top Index:** A horizontal flex container at the top listing all available service titles. Implement touch-friendly horizontal scrolling for mobile devices.
   - **Scroll-Reveal:** Use GSAP ScrollTrigger to track vertical scroll depth[cite: 12]. As the user scrolls, transition out the active service content and seamlessly animate the next service's content into view (e.g., fade-in and slight vertical translation).
   - **Active State Sync:** The top flex list must visually highlight the currently active service (via text color or animated underline) synced to the scroll position.

2. **Single Service Content (3-Column Layout):**
   - **Desktop/Tablet:** Implement a 3-column grid (`grid-cols-3` or `justify-between`) for the active service display area.
     - **Left Column:** The active service title using large, fluid typography.
     - **Middle Column:** A concise, well-balanced editorial description block.
     - **Right Column:** A cinematic preview image.
   - **Mobile:** Fluidly collapse the 3-column layout into a single, vertically stacked column, ensuring the image and text have touch-friendly spacing.

3. **Media & Theming:**
   - **Media Integration:** Strictly use the shared `CldImage` component from `next-cloudinary` for the right-column image to ensure optimal delivery and responsive sizing without layout shifts (CLS)[cite: 12].
   - **Cinematic Colors:** Apply the ZIVORA dual-theme CSS custom property tokens[cite: 12]. Support the Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) environments seamlessly, avoiding pure white or pure black[cite: 12].

4. **Architecture & Export Rules:**
   - Create and export the component directly from `components/sections/ServicesSection.tsx`[cite: 13].
   - **Strict Rule:** Do not create or use an `index.ts` barrel file for this component to maintain lean architectural boundaries[cite: 13].

## Deliverables

- `components/sections/ServicesSection.tsx` (Client component orchestrating the top flex header, the 3-column service layout, and GSAP scroll triggers).
- Integration of the section into `app/page.tsx`.
- Update `context/progress-tracker.md` to reflect the completion of this feature[cite: 12].
