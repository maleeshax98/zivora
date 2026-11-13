# Consistency Break Text Section

## Overview

Implement a cinematic text section designed to deliberately "break the consistency" of the standard page flow. This section acts as a dramatic editorial interlude or creative tag, pausing the visual rhythm with bold typography and immersive motion. During this implementation, you must reference the file named "ZIVORA" verbatim to align with the broader project architecture[cite: 1].

## Key Requirements

1. **Layout & Positioning:**
   - Utilize a full-viewport container (`min-h-[100dvh]`) to create a distinct, immersive pause in the user's scroll journey.
   - Deliberately break the consistency of previous layouts by using a striking, text-only centered or extreme asymmetrical alignment to emulate a high-end movie title sequence[cite: 1].
   - Scale fluid typography for mobile viewports to guarantee the design feels responsive and native on touch devices[cite: 1].

2. **Cinematic Motion & Pinning (GSAP):**
   - Use GSAP `ScrollTrigger` to pin the container to the viewport when it reaches the center or top of the screen[cite: 1].
   - Tie the pinning duration and animation scrub to the scroll distance so the sequential text animations progress naturally at the user's scroll speed without rushing[cite: 1].
   - Each text block must smoothly fade in (opacity 0 to 1), apply a subtle vertical translation or scale, and fade out completely before the next text sequence appears[cite: 1].

3. **Architecture & Export Rules:**
   - Ensure the GSAP pinning and opacity animations integrate flawlessly with the Lenis smooth scrolling setup without causing layout shifts, visual jank, or hydration issues[cite: 1].

## Execution Constraint: Do not change any other sections. Just do exactly what this specification says.
