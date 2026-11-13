ZIVORA — UI Context

1. UI Design Philosophy

ZIVORA's interface delivers a cinematic, premium, and editorial visual experience. Photography and videography take priority over decorative interface elements.

The visual identity combines:

Cinematic visual storytelling.

Contemporary editorial design.

Refined typography.

Intentional whitespace.

Subtle and meaningful interactions.

2. Dual-Theme Color System

ZIVORA avoids pure white and pure black, utilizing warm, atmospheric tones that complement visual content without competing with it.

2.1 Warm Light Theme

Background (#EAE6DF): Warm stone / soft alabaster main page canvas.

Surface (#F4F1EB): Cards, panels, and elevated surfaces.

Surface Subtle (#DFD9CF): Secondary surfaces and subtle dividing blocks.

Text Primary (#292824): Deep charcoal / soft ink for high readability.

Text Secondary (#625E56): Supporting metadata and subtitles.

Border (#D2CBC0): Subtle warm divider lines.

Accent (#8A7058): Sophisticated muted bronze for interactive highlights and active states.

2.2 Cinematic Dark Theme

Background (#20211F): Deep charcoal / off-black film base.

Surface (#2B2C29): Elevated dark cards and panels.

Surface Subtle (#353632): Secondary dark contrast blocks.

Text Primary (#E9E5DD): Warm off-white / soft parchment.

Text Secondary (#C4BFB5): Supporting warm gray details.

Border (#454640): Refined dark border lines.

Accent (#B59B7E): Soft warm bronze / champagne accent for focal points.

2.3 Theme Behavior & Anti-Flash

Supports System, Light, and Dark preferences.

User selections persist across visits.

A blocking initialization script resolves and applies the theme class prior to page rendering to eliminate incorrect-theme flashes.

3. Album Layout (Pinterest-Style Masonry Grid)

Mobile Viewports: Fluid 2 to 3 column masonry layout to maximize screen space without crowding imagery.

Tablet & Desktop Viewports: Scales to 3, 4, or more columns depending on screen width.

Aspect Ratios: Preserves original image proportions without awkward cropping while preventing cumulative layout shifts (CLS).

UX Standards: Includes loading skeletons matching the masonry structure, clean error boundaries for failed folder fetches, and paginated/lazy-loaded asset delivery.
