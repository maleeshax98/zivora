Component Structure & Export Guidelines

Overview

To maintain a lean and direct file structure within the ZIVORA project, we avoid the use of "barrel files" (index.ts files used solely for re-exporting).

Rules for Component Creation

No Barrel Files: Do not create index.ts or index.js files inside component directories (e.g., components/hero/, components/layout/) for the purpose of re-exporting.

Direct Exports: Define and export components directly from their uniquely named files.

// components/layout/Navbar.tsx
export function Navbar() {
  return <nav>...</nav>;
}


Direct Imports: When importing a component, reference its exact file path. This improves tree-shaking and makes it immediately clear where the component lives.

// Correct
import { Navbar } from '@/components/layout/Navbar';
import { HeroSection } from '@/components/hero/HeroSection';

// Incorrect (Do not do this)
import { Navbar } from '@/components/layout'; 


Standardized Folder Structure Example

components/
├── hero/
│   └── HeroSection.tsx
├── layout/
│   ├── MobileMenu.tsx
│   └── Navbar.tsx
└── sections/
    └── CinematicText.tsx
