# GLM Websites — 8 AWWward-Winning 3D Animation Websites

A collection of 8 visually stunning, award-worthy websites built with a mix of technologies. Each website is in its own subfolder and can be run independently.

## Overview

| # | Website | Type | Tech Stack | How to Run |
|---|---------|------|------------|------------|
| 1 | Horloge | Luxury Watch Showcase | Pure static (CDN) | Open `index.html` in browser |
| 2 | Ruimte | Space Exploration | Next.js + R3F | `npm install && npm run dev` |
| 3 | Parfum | Fragrance Reveal | Pure static (CDN) | Open `index.html` in browser |
| 4 | Architectuur | Architecture Studio | Vite + Three.js | `npm install && npm run dev` |
| 5 | Loodgieter | Plumber ZZP | Pure static (CDN) | Open `index.html` in browser |
| 6 | Tuinman | Gardener ZZP | Vite + Canvas/GSAP | `npm install && npm run dev` |
| 7 | Stukadoor | Plasterer ZZP | Pure static (CDN) | Open `index.html` in browser |
| 8 | Schilder | Painter ZZP | Next.js + Canvas | `npm install && npm run dev` |

## Quick Start

### Static Sites (1, 3, 5, 7)
Just open the `index.html` file directly in a browser. No build step needed. All libraries are loaded via CDN.

### Vite Sites (4, 6)
```bash
cd 04-architectuur  # or 06-tuinman
npm install
npm run dev
```

### Next.js Sites (2, 8)
```bash
cd 02-ruimte  # or 08-schilder
npm install
npm run dev
```

## Website Details

### 01 — Horloge (Luxury Watch)
- Scroll-driven 3D camera zoom into a procedurally generated luxury chronograph watch
- Three.js + GSAP ScrollTrigger + Lenis smooth scroll
- 5 scroll chapters: Overview → Dial → Crown → Case → Strap
- Custom cursor, animated loading screen, stat counters

### 02 — Ruimte (Space Exploration)
- Scroll through the solar system with camera flying past each planet
- React Three Fiber + custom GLSL shaders for procedural planet surfaces
- 8,000+ GPU particle starfield
- Saturn's rings, sun corona glow, HUD with live telemetry
- Educational planet info panels

### 03 — Parfum (Fragrance Reveal)
- WebGL fluid shader background with flowing liquid gradients
- CSS 3D perfume bottle with glass/liquid effects
- Canvas particle mist system
- Scroll-driven color palette transitions (bergamot → rose → oud)
- Three fragrance note sections (Top/Heart/Base)

### 04 — Architectuur (Architecture Studio)
- Procedurally generated 3D building that assembles piece by piece on scroll
- Three.js + GSAP, Vite build system
- Building parts fly in from below with staggered timing
- Clipping planes for section cut reveals
- Camera orbits building through project sections
- Minimalist white/concrete aesthetic

### 05 — Loodgieter (Plumber ZZP — Waterland)
- Canvas water ripple effects (interactive — ripples follow mouse)
- Animated SVG pipe network with flowing particles
- Water-fill scroll animations
- Before/after bathroom renovation slider
- Service area map with animated pulse rings
- Dutch language, realistic ZZP business elements (KVK, reviews, quote form)

### 06 — Tuinman (Gardener ZZP — De Groene Tuinman)
- Parallax layered garden scene (sky, mountains, trees, bushes, grass)
- Canvas particle system: leaves/petals drift across screen
- SVG plant illustrations that "grow" via stroke-dashoffset animation on scroll
- Season selector that changes entire color theme (spring/summer/autumn/winter)
- Before/after garden slider
- Dutch language, practical ZZP elements

### 07 — Stukadoor (Plasterer ZZP — StucMeester)
- CSS 3D room interior that rotates with mouse movement (perspective transform)
- Canvas-based procedural plaster texture generator
- Scroll-driven wall morph (rough brick → smooth stuc)
- Interactive finish texture selector with 6 plaster types
- Before/after wall transformation slider
- Warm earthy palette (sand, cream, terracotta)

### 08 — Schilder (Painter ZZP — Kleurrijk)
- Canvas paint splash that follows mouse, leaving colorful trails
- Scroll spawns paint drops at random positions
- Interactive color palette that changes the entire site's accent color in real-time
- Room visualizer that updates wall color based on selection
- Paint "wipe" section reveals
- Bold, vibrant, creative aesthetic
- Dutch language, practical ZZP elements

## Technologies Used

- **Three.js** — 3D rendering (websites 1, 2, 4)
- **React Three Fiber + Drei** — React-based 3D (website 2)
- **GSAP + ScrollTrigger** — Scroll-driven animations (all)
- **Lenis** — Smooth scroll (website 1)
- **WebGL Shaders (GLSL)** — Custom shaders (websites 2, 3)
- **Canvas API** — 2D effects and particles (websites 3, 5, 6, 7, 8)
- **CSS 3D Transforms** — 3D effects without WebGL (websites 3, 7)
- **SVG Animation** — Plant growth, pipe networks (websites 5, 6)
- **Next.js 14** — React framework (websites 2, 8)
- **Vite** — Build tool (websites 4, 6)
- **Google Fonts** — Typography (all)

## Free Resources
- All 3D models are procedurally generated in code (no external assets)
- Planet textures use custom GLSL noise shaders
- All textures/patterns are CSS or Canvas-generated
- Libraries loaded via free CDNs (cdnjs, jsDelivr)
- Google Fonts for typography
- No API keys required

## Browser Support
Best experienced on desktop with modern browsers (Chrome, Firefox, Safari, Edge). Mobile responsive with touch support.
