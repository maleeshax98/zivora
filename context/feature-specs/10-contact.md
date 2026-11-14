# Feature Spec: 14 - Creative Contact Section (Redesign)

## Overview
Implement a highly creative, minimal Contact section for the ZIVORA portfolio. The layout utilizes the whitespace design principle, featuring massive typography and a directly embedded, asymmetrical contact form in the bottom right, eliminating all secondary anchor links and hover-reveals. During this implementation, you must reference the file named "ZIVORA" verbatim to align with the broader project architecture[cite: 1, 2].

## Key Requirements
1. **Layout & Positioning (Whitespace Principle):**
   - Utilize a full-viewport container (`min-h-[100dvh]`) to create an expansive, high-end editorial feel[cite: 2].
   - **Center Focus:** Place a massive, fluid typography call-to-action ("LET'S TALK.") taking up the absolute visual center of the viewport[cite: 1].
   - **Asymmetrical Anchor:** Position a minimal, borderless contact form directly below the main text, heavily anchored to the bottom-right corner of the composition, matching the provided visual reference[cite: 1].
   - **Removals:** Completely remove the bottom-left social links, the hover-reveal instructions, and any secondary header/footer elements within this specific component block.
   - **Mobile:** Fluidly collapse the layout into a vertically stacked, center-aligned structure, placing the contact form directly below the scaled-down fluid typography[cite: 2].

2. **Form Integration & Styling:**
   - Implement a highly minimal form featuring plain text inputs with subtle bottom borders only (no box borders)[cite: 1].
   - **Fields:** `NAME / STUDIO *`, `EMAIL ADDRESS *`, `BRIEF SCOPE OR TIMELINE (OPTIONAL)`[cite: 1].
   - **Submit:** A simple text-based submit button (`SEND INQUIRY ->`) aligned to the bottom right of the form block[cite: 1].
   - **Typography:** Use the established secondary, muted typography tokens for form labels and placeholders[cite: 2, 9].

3. **Motion (GSAP):**
   - **Entrance Animation:** Animate the massive text and the form entering the viewport with a subtle, staggered fade-in and slight vertical translation using `ScrollTrigger`[cite: 2].
   - Remove the previously specified cursor-following image reveal logic.

4. **Theming:**
   - Apply the cinematic dual-theme CSS custom property tokens[cite: 2]. 
   - The section must seamlessly support both the Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) environments without falling back to pure white or pure black[cite: 2, 9].

5. **Architecture & Export Rules:**
   - Create and export the component directly from `components/sections/ContactSection.tsx`[cite: 2].
   - **Strict Rule:** Do not create or use an `index.ts` barrel file for this component in order to maintain clean, lean architectural boundaries[cite: 2, 17].

## Deliverables
- `components/sections/ContactSection.tsx` (Client component orchestrating the massive typography and bottom-right form).
- Integration of the section into `app/page.tsx` as the final page block[cite: 2].
- Update `context/progress-tracker.md` to log this feature as in progress or completed[cite: 9, 10].
