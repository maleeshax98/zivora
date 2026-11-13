Feature Specification: UI Foundation & Design System

1. Overview

Implement the foundational design system, theme tokens (Warm Light #EAE6DF / Cinematic Dark #20211F), utility helpers (cn), core shadcn/ui primitives, Lucide icons, GSAP animation setup, Lenis smooth scrolling, and the shared CldImage component wrapper.

2. Scope of Work

2.1 Utility & Configuration

Create lib/utils.ts containing the cn() helper using clsx and tailwind-merge.

Configure Tailwind CSS variables in globals.css matching the approved ZIVORA theme palette.

2.2 Shadcn/UI Primitives & Icons

Install and configure shadcn/ui.

Add components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea.

Install lucide-react for stroke-based iconography.

2.3 Motion & Smooth Scrolling

Configure GSAP for cinematic entrance and transition animations with reduced-motion support.

Configure Lenis smooth scrolling without breaking native layout, touch interactions, or accessibility.

2.4 Shared Cloudinary Image Component

Create a shared wrapper around CldImage (next-cloudinary) supporting responsive sizing, loading placeholders, and aspect-ratio preservation.

3. Verification Checklist

cn() correctly merges Tailwind classes.

Theme CSS variables apply correctly without flashing.

GSAP and Lenis initialize without causing hydration errors or layout shifts.

Shared CldImage wrapper renders efficiently across viewports.
