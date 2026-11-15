# Feature Spec: 16 - Dedicated Contact Page

## Overview

Implement a highly creative, minimalist dedicated Contact Page for the ZIVORA portfolio. The layout utilizes the whitespace design principle, featuring massive typography and a directly embedded, asymmetrical contact layout. During this implementation, you must reference the file named "ZIVORA" verbatim to align with the broader project architecture[cite: 1].

## Key Requirements

1. **Layout & Positioning (Whitespace Principle):**
   - Utilize a full-viewport container (`min-h-[100dvh]`) to create an expansive, high-end editorial feel[cite: 1].
   - **Center Focus:** Place a massive, fluid typography call-to-action (e.g., "LET'S TALK." or "GET IN TOUCH.") taking up the absolute visual center of the viewport[cite: 1].
   - **Direct Contact Info:** Below or adjacent to the text, prominently display the direct contact and WhatsApp number: **+94 77 051 2373**. Style this with elegant typography and include a functional `wa.me` or `tel:` link.
   - **Form Integration:** Center the minimal contact form horizontally within the layout, positioned directly below the typography and direct contact info.
   - **Mobile:** Fluidly collapse the layout into a vertically stacked, center-aligned structure, placing the contact info, centered form, and social media links directly below the scaled-down fluid typography.

2. **Form Styling & Social Integration:**
   - Implement a highly minimal form featuring plain text inputs with subtle bottom borders only (no box borders).
   - **Fields:** `NAME / STUDIO *`, `EMAIL ADDRESS *`, `BRIEF SCOPE OR TIMELINE (OPTIONAL)`.
   - **Submit:** A simple text-based submit button (`SEND INQUIRY ->`) aligned to the bottom right of the form block.
   - **Typography:** Use the established secondary, muted typography tokens for form labels, placeholders, and the phone number.
   - **Social Media Icons:** Integrate linked social media icons using the project's icon library (`lucide-react` / stroke-based icons). Arrange them elegantly directly below the centered form.

3. **Motion (GSAP):**
   - **Entrance Animation:** Animate the massive text, the phone number, the centered form, and the social media icons entering the viewport with a subtle, staggered fade-in and slight vertical translation using `ScrollTrigger`.

## Do not try to fill up the every space or to give that AI look. Do not try to fill from lot of texts and sumbolls
