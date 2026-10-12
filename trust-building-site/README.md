# upGrad Trust Building site

A Next.js build of the **Trust Building V6** design handoff: the long-scroll landing page plus its inner pages. Pages are exported as fully static HTML.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to out/
npm run typecheck
```

## Pages

| Route | Page |
| --- | --- |
| `/` | Landing: hero post carousel, manifesto, convocation strip, study abroad, sticky immersion stage, "In their own words" marquee and the closing CTA |
| `/convocation/` | All convocation stories |
| `/convocation/[slug]/` | One convocation moment: photo mosaic, LinkedIn posts, more moments |
| `/immersion/` | All immersion events |
| `/immersion/[slug]/` | One "From the Ground Up" city event. **Request to join** opens Luma |
| `/study-abroad/` | Study abroad videos and posts, with a filter |
| `/posts/` | Every LinkedIn post, filterable by topic |

## Where things live

- `lib/*.ts`: all copy and data (`convocations`, `immersions`, `posts`, `landing`).
- `lib/landingMotion.ts`: the landing page's imperative motion. A single rAF loop drives the scroll-linked effects, the hero carousel, the sticky immersion stage, the marquees, drag rails, the follow cursor and magnetic buttons.
- `components/landing/*`: landing sections. `components/PostCard.tsx` holds the two LinkedIn post layouts.
- `app/globals.css`: design tokens and all styles. Hover states are plain CSS.

Reveal animations are gated by an `html.motion` class that an inline script sets before first paint. Content stays visible without JS and with `prefers-reduced-motion`.

## Before launch

- Most posts, names, engagement counts and dates are **sample content** from the handoff. So are the convocation `desc`/`facts`/`about` copy and the hero carousel posts (David Chen, Apex Solutions…). Replace them with real posts, each linking to its live original.
- Several links are still `#` in the design: "Explore programmes", "Course details" and the post "Read on LinkedIn".
- Luma doesn't expose event dates, so none are shown. Add them to `lib/immersions.ts` when available.
- The study abroad cards are video thumbnails only. There are no video files yet.
- `cafe.png` and `sa-plane.png` are ~3000px PNGs. Compress or convert them to WebP/AVIF.
