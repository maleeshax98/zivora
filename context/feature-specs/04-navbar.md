## Smart Sticky Navbar

Implement a smart, responsive navigation bar for ZIVORA. The navbar must automatically hide when the user scrolls down and smoothly reveal when the user scrolls up, maximizing the cinematic viewing area while providing quick access to essential routes.

## Key Requirements

Smart Scroll Behavior (Hide/Show):

Implement scroll direction detection using GSAP ScrollTrigger or native React scroll event listeners.

Scroll Down: Smoothly translate the navbar off-screen upwards (-translate-y-full).

Scroll Up: Smoothly translate the navbar back into view (translate-y-0).

Apply a subtle backdrop blur and transitioning background color (using the active theme's surface color with partial opacity) once the user scrolls past the Hero Section.

Desktop Layout (justify-between):

Left: Clean text navigation links for Home, Works, Packages, and Contact. Use editorial typography with subtle hover states (e.g., opacity change or thin underline).

Center: The "ZIVORA" brand mark prominently centered. Clicking this should navigate to the Home page.

Right: The Theme Toggle switch to seamlessly switch between the Warm Light and Cinematic Dark themes.

Responsive Mobile Design:

Mobile Layout: On smaller viewports, maintain the centered ZIVORA brand mark. Replace the left-aligned text links with a refined, touch-optimized hamburger menu icon on the left or right to ensure top-tier mobile UX. The theme toggle can remain accessible in the header or be moved into the menu.

Full-Screen Mobile Menu: An immersive full-screen overlay menu triggered by the mobile hamburger icon.

Smooth entrance/exit animations for the menu using GSAP or CSS transitions. Includes large, elegant typography for route navigation.

## Integration & Accessibility:

Must not interfere with the Lenis smooth scrolling setup.

Ensure all interactive elements (links, buttons, theme toggle) have visible focus states and are keyboard accessible.

Respect user system preferences for reduced motion.

Deliverables

components/layout/Navbar.tsx (Main client component handling scroll logic and the desktop/mobile layout structure)

components/layout/MobileMenu.tsx (Full-screen mobile overlay)

Integration into app/layout.tsx so the navbar persists seamlessly across all page routes.

Update context/progress-tracker.md to log the completed feature.
