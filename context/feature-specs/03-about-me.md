# Feature Spec: 09 - About Me Section (3-Column Layout)

## Overview

Implement a cinematic, 3-column "About Me" section for the ZIVORA home page. The section utilizes a `justify-between items-center` flex or grid layout, featuring a sharp-edged portrait on the left, a centered greeting and call-to-action, and an editorial description on the right.

## Key Requirements

1. **Layout & Positioning (`justify-between items-center`):**
   - **Desktop/Tablet:** Implement a 3-column layout aligning items to the center vertically and distributing space evenly horizontally.
   - **Left Column:** A portrait image container. **Strict constraint:** The image must have sharp, square corners with zero border radius (`rounded-none`).
   - **Middle Column:** Large editorial typography stating, "Hi, I'm Sazii. A photographer and a video grapher." Directly below this text, include a "view works" button styled to match the project's minimalist aesthetic.
   - **Right Column:** A refined, well-balanced descriptive text block explaining the creative background.
   - **Mobile:** Fluidly collapse the 3-column layout into a single, vertically stacked, center-aligned column to ensure touch-friendly spacing and readability.

2. **Media Integration (`CldImage`):**
   - Utilize the project's shared `CldImage` component from `next-cloudinary` for the left-hand portrait to guarantee optimal media delivery and responsive sizing[cite: 8].
   - Enforce the zero border radius rule and ensure the image container preserves its aspect ratio to prevent cumulative layout shifts (CLS)[cite: 8].

3. **Typography & Theming:**
   - Apply the ZIVORA dual-theme CSS custom property tokens[cite: 8].
   - The section must seamlessly support both the Warm Light (`#EAE6DF` background) and Cinematic Dark (`#20211F` background) environments without falling back to pure white or pure black[cite: 8].
   - Utilize the established fluid editorial typography hierarchy for the center greeting and right-side description[cite: 8].

4. **Motion & Interaction (GSAP):**
   - Implement a staggered GSAP scroll-triggered entrance animation[cite: 8].
   - The image, center text/button, and right description should reveal via a subtle fade-in and slight vertical translation as they enter the viewport, keeping motion purposeful[cite: 8].

5. **Architecture & Export Rules:**
   - Create and export the component directly from `components/sections/AboutSection.tsx`.
   - **Strict Rule:** Do not create or use an `index.ts` barrel file for this component in order to maintain clean, lean architectural boundaries[cite: 12].

## Deliverables

- `components/sections/AboutSection.tsx` (Client component orchestrating the 3-column layout, `CldImage` integration, and GSAP motion).
- Integration of the redesigned section into `app/page.tsx`.
- Update `context/progress-tracker.md` to log this feature as completed.
