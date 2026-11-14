# Feature Spec: 13 - User Feedback Section (Cinematic Camera Sequence)

## Overview
Implement a high-end, motion graphic "User Feedback" section for the ZIVORA portfolio. The experience simulates a physical wall holding 5 distinct sticky cards. Instead of standard scrolling, the viewport acts as a cinematic camera that smoothly pans, zooms, and shifts focus sequentially:
1. **Initial Establishing Shot (Wide Overview):** First of all, show all 5 sticky cards in the screen simultaneously so the user perceives the entire composition of testimonials pinned to the wall.
2. **Sequential One-by-One Zoom:** As the user scrolls, the camera swoops in from the wide overview to dead-center and focus on each card one by one (Card 1 -> Card 2 -> Card 3 -> Card 4 -> Card 5) with unhurried reading holds and premium motion graphic transitions.

## Key Requirements

### 1. Design & Visual Layout (The Virtual Wall)
- **Oversized Canvas:** Create an expansive virtual wall container (e.g. `240vw` by `240vh`) that acts as the physical surface holding the testimonials.
- **Sticky Card Aesthetics:** Design the 5 feedback cards to feel tactile with subtle drop shadows, sharp editorial edges (`rounded-none`), top simulated translucent tape strips, and organic slight rotations.
- **Asymmetrical, Non-Overlapping Distribution:** Scatter the 5 cards across the virtual wall (e.g., Top-Left, Top-Right, Center, Bottom-Left, Bottom-Right) so they form a balanced, aesthetic composition in the wide overview shot without overlapping awkwardly.
- **Responsive Scaling:** Ensure all cards fit comfortably within the viewport during the initial overview shot on both mobile and desktop viewports, and scale up smoothly to crisp, readable dimensions when focused.

### 2. Cinematic Camera Sequence (GSAP ScrollTrigger)
- **Viewport Pinning:** Utilize GSAP `ScrollTrigger` to pin the main outer wrapper to the viewport when it reaches the top of the screen.
- **Phase 0 — Wide Overview Shot:** Start at progress `0` with the camera zoomed out so all 5 cards are visible in the screen at once, with an initial establishing hold.
- **Phase 1 to 5 — Sequential One-by-One Zoom & Rack Focus:**
  - Accelerate smoothly from the wide overview into Card 1, centering it for reading.
  - Pan and glide between cards (Card 1 -> Card 2 -> Card 3 -> Card 4 -> Card 5) with mid-flight camera boom pull-back and rack-focus cross-fades (background cards dim with subtle blur while the active card is in sharp focus).
  - Deliberate reading hold beats on each card.
- **Viewfinder HUD Overlay:** Camera telemetry, recording indicators, active sequence counter (`OVERVIEW` -> `01` -> `02` -> `03` -> `04` -> `05`), and sequence progress dots.
- **Smooth Scrolling Integration & Reduced Motion:** Flawless integration with Lenis smooth scrolling; accessible static vertical layout for `prefers-reduced-motion: reduce`.

## Execution Constraint
Do not change any other sections. Just do exactly what this specification says.
