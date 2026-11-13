# Hero Section (Cinematic Blur Reveal Redesign)

## Overview

Redesign the ZIVORA landing Hero Section to integrate a dynamic, responsive line of imagery within an established editorial layout, enhanced by a sophisticated, sequentially timed entrance animation. The sequence dictates that the main brand title reveals letter-by-letter from a blur, followed by the image line, and concluding with the description text.

## Key Requirements

1. **Motion & Interaction Sequence (GSAP Timeline):**
   - **Master Timeline:** Orchestrate a strict GSAP timeline (`gsap.timeline()`) to control the sequential entrance of the three main layout components.
   - **Step 1 - Title Reveal (Blur to Clear):** Split the main 'ZIVORA' headline into individual letter spans. Set their initial state to `opacity: 0` and `filter: blur(10px)`. Animate them to `opacity: 1` and `filter: blur(0px)` using a staggered reveal so the letters seamlessly come into focus one by one[cite: 8].
   - **Step 2 - Image Line Reveal:** Once the title text has come into clear focus, trigger the entrance of the horizontal image line (e.g., an opacity fade with a slight vertical translation or scale-up).
   - **Step 3 - Description Reveal:** Conclude the sequence by fading in the descriptive text block, ensuring it anchors the composition.

2. **Layout & Positioning:**
   - **Desktop/Tablet (Asymmetrical):**
     - **Top Left:** Large fluid 'ZIVORA' brand text.
     - **Mid-Left (Below Title):** A responsive horizontal row of images. Dynamically calculate the exact number of images that fit the viewport width.
     - **Bottom Right:** A well-balanced descriptive text block.
   - **Mobile (Centered & Stacked):**
     - Center the main 'ZIVORA' headline and the description text.
     - Position the horizontal line of images directly below the centered text, scaling down the image count or enabling horizontal scroll to prevent overflow.

3. **Media Integration (`CldImage`):**
   - Utilize the project's shared `CldImage` component from `next-cloudinary` for the image line to guarantee optimal delivery and responsive sizing[cite: 8].
   - Ensure the image containers have strict aspect ratios to prevent cumulative layout shifts (CLS) during load.

4. **Typography & Theming:**
   - Apply the ZIVORA dual-theme CSS custom property tokens, supporting both the Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) environments without pure white or pure black[cite: 8].
   - Use fluidly scaling typography for the main headline.

5. **Architecture & Export Rules:**
   - Modify and export the component directly from `components/hero/HeroSection.tsx`.
   - **Strict Rule:** Do not create or use an `index.ts` barrel file for this component in order to maintain clean, lean architectural boundaries[cite: 11].

## Deliverables

- `components/hero/HeroSection.tsx` (Client component orchestrating the GSAP blur-sequence timeline, responsive image line measurement, and layout).
- Update `app/page.tsx` if props or media arrays need to be passed down.
- Update `context/progress-tracker.md` to log this redesigned hero section as complete[cite: 8].
