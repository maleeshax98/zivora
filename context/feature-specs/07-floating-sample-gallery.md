# Floating Photo Gallery Redesign

## Overview

Redesign the current gallery layout to replace the structured grid and text headers shown in the reference[cite: 1] with a dynamic, free-form "floating and flying" visual experience. This section will strictly feature scattered photography with zero text, titles, or video elements.

## Key Requirements

1. **Layout & Positioning (Floating & Scattered):**
   - Eliminate all section titles, headers (like the existing "Curated visual studies." text), and descriptions[cite: 1]. The UI must consist entirely of images.
   - Discard the rigid masonry grid approach[cite: 1]. Implement a scattered, asymmetrical layout using absolute positioning within a relative container (or a randomized GSAP distribution) to make the photos appear sporadically placed across the viewport.
   - **Mobile:** Ensure the scattered placement remains within viewport bounds and scales appropriately on smaller screens to prevent heavy image overlapping.

2. **Media Integration (Photos Only):**
   - Strictly use the `CldImage` component from `next-cloudinary` for optimal image delivery and responsive sizing.
   - **No Videos:** Ensure no video assets or video UI overlays (such as the "FILM" tags seen on the reference images) are rendered[cite: 1]. This layout is exclusively for photography.

3. **Motion & Interaction (GSAP "Flying" Effect):**
   - **Continuous Float:** Use GSAP to create a continuous, slow-moving floating effect for the images (e.g., subtle, randomized `y` and `x` translations with slight rotations using `yoyo: true` and `repeat: -1`).
   - **Scroll Parallax:** Apply different `ScrollTrigger` scrub speeds to individual images so they move at varying velocities as the user scrolls, enhancing the illusion of depth and a "flying" environment.

**Execution Constraint:** Do not change any other sections or try to fill up the whole thing. Just do exactly what this specification says.

## Refinement (2026-11-14):
1. **Reduce space between images & add more images:**
   - The desktop layout felt too sparse with excessive empty canvas between photos.
   - Increase the total number of curated photo items (14–16+ images) and tighten the vertical/horizontal distribution across desktop so multiple photos occupy the viewport simultaneously in a dense, editorial floating composition.
2. **Mobile layout: 2-column grid:**
   - On mobile screens, rather than sparse absolute positioning, render the images in a clean, responsive 2-column grid (`grid-cols-2`).
   - Retain photos-only mandate (zero text, zero titles, zero video assets/overlays) and shared `CldImage` delivery.
