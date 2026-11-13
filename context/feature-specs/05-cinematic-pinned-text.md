# Cinematic Pinned Text Section

## Overview

Implement a scroll-bound cinematic text section for the ZIVORA homepage. This section acts as a creative, movie-style transition where the viewport is temporarily pinned. As the user scrolls, the phrase **"Capturing fleeting light and timeless architectural forms."** smoothly fades in and out, delivering an immersive and editorial experience.

## Key Requirements

1. **Scroll-Triggered Pinning:**
   - Use GSAP `ScrollTrigger` to pin the section container to the viewport when it reaches the center or top of the screen.
   - Tie the pinning duration and animation scrub to the scroll distance so the text animations progress naturally at the user's scroll speed (scrubbing).

2. **Cinematic Fade-In / Fade-Out Motion:**
   - Text to display: _"Capturing fleeting light and timeless architectural forms."_
   - As the user scrolls through the pinned section, the text must smoothly fade in (opacity 0 to 1), apply a subtle upward translation or scale (e.g., mimicking a gentle camera push), and then fade out completely before unpinning.
   - Consider splitting the text by words or lines for a staggered, deliberate reveal that emulates high-end movie title pacing.

3. **Responsiveness & Smooth Scrolling:**
   - **Fluid Typography:** The text must scale fluidly (e.g., using `clamp()` or tailored Tailwind text sizes) to remain impactful but legible on small mobile screens without breaking words awkwardly.
   - **Mobile Adjustments:** Adjust the GSAP ScrollTrigger `start` and `end` points for touch devices to ensure the pinning feels native and doesn't trap the user in a long scroll on smaller screens.
   - Ensure perfect compatibility with the Lenis smooth scrolling setup, avoiding any layout shifts, visual jank, or hydration issues.
