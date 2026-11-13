# ZIVORA

> An immersive, Awwwards-caliber digital portfolio and archival atelier for photography and cinematography.

ZIVORA is a high-end visual portfolio crafted with an editorial sensibility, atmospheric dual-theme aesthetics, and precision scroll physics. Built with Next.js 16, Tailwind CSS, GSAP, Lenis, and Cloudinary.

---

## ✨ Features

- **Cinematic Hero Reveal**: Sequential letter-by-letter blur-to-clear typography reveal, dynamic horizontal editorial image row, and fluid viewport adaptation.
- **Editorial 3-Column About Section**: Sharp-edged portrait framing, typography hierarchy, and pinned reading hold.
- **Services Scroll-Reveal**: Synchronized top index tab navigation with pinned multi-panel GSAP scroll scrubbing and responsive column layouts.
- **Dense Floating Sample Gallery**: Curated photo gallery featuring continuous idle floating physics and multi-layer parallax depth on desktop, fluid 2-column masonry grid on mobile.
- **Consistency Break Text Interlude**: Full-viewport pinned sequence with fluid typography scaling and movie-title-inspired cadence.
- **Dual-Theme Design System**: Tailored Warm Light (`#EAE6DF`) and Cinematic Dark (`#20211F`) palette with zero harsh pure-white or pure-black tones.
- **Performance & Media Optimization**: High-efficiency asset streaming via Next-Cloudinary (`CldImage`), Lenis smooth scrolling with touch preservation, and accessible reduced-motion fallbacks.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animation**: [GSAP](https://gsap.com/) (ScrollTrigger)
- **Smooth Scroll**: [Lenis](https://github.com/darkroomengineering/lenis)
- **Media Delivery**: [Next-Cloudinary](https://next.cloudinary.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Package Manager**: [pnpm](https://pnpm.io/)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm (`corepack enable pnpm` or `npm install -g pnpm`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/maleeshax98/zivora.git
   cd zivora
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Configure your Cloudinary cloud name:
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```text
zivora/
├── app/                  # Next.js App Router (layout, globals.css, page)
├── components/
│   ├── hero/             # HeroSection and cinematic reveal animations
│   ├── layout/           # Navbar, footer, and navigation components
│   ├── sections/         # About, Services, SampleGallery, ConsistencyBreak
│   └── ui/               # Reusable UI primitives
├── context/              # Architectural documentation and feature specs
├── lib/                  # GSAP presets, utility functions, theme providers
├── memory/               # Persistent project development memory
└── public/               # Static assets and icons
```

---

## 📜 License

Private repository. All rights reserved © ZIVORA.
