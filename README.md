# georgekovacs.me

Static rebuild of the Framer portfolio. Plain HTML, CSS and JS with no build step. Host it on any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Run locally

```bash
python3 -m http.server 8080
```

Then open http://localhost:8080. Links are root-relative (`/about/`), so the site needs to be served from the domain root, not opened as a file.

## Structure

```
index.html              Home (hero + work grid)
about/  contact/        Pages
work/<slug>/            Case studies: vital, lucy, kbc, logos, concorde (NDA)
404.html
COPY-EDITS.md           Every proofreading change, before → after
assets/css/style.css    All styles; tokens and breakpoints at the top
assets/js/main.js       Smooth scroll, header, hero text effect, reveals, hero zoom, mobile menu
assets/img/             Images downloaded from the Framer CDN (max 2048px)
```

The header and footer are repeated in each HTML file. Edit all copies when you change them. The intro line above the homepage headline ("Hi, I’m George, senior product designer at Tend.nz…") is in `index.html` only.

## Motion (taken from the Framer project)

| Effect | Spec |
|---|---|
| Smooth scroll | Lenis, lerp 0.1 |
| Hero headline | Per line: x 50→0, opacity 0→1, 0.5s, `cubic-bezier(0,.46,.56,1)`, 0.2s delay + 0.1s per line |
| Scroll reveal (`data-reveal`) | x 30→0, opacity 0→1, 1.5s, `cubic-bezier(.35,0,0,1)`, 0.2s delay. Override with `--rx`, `--rd`, `--delay` |
| Header | Hides on scroll down, returns on scroll up |
| Nav links | Text rolls up, duplicate at 60% opacity |
| Work cards | Image scales to 1.06. Badge grows 40→56px, turns white, arrow rotates 45° |
| Case-study hero (`data-zoom`) | Scroll-linked scale 1.2→1 |
| Footer | Curtain reveal (sticky under `main`) on screens ≥768px wide and ≥820px tall |

All motion is turned off under `prefers-reduced-motion`.

## Additions beyond the Framer site

- **Next project:** each case study ends with a link to the next one (Concorde → Vital → Lucy → KBC → Logos → back to Concorde) and an "All work" link.
- **Homepage intro:** a line above the headline with your name and current role at Tend.nz.
- **Footer contact:** "Let's talk" opening an email, and a copy-email button. The Contact page has the same copy button.
- **Text colour:** small grey text uses `#555` (`--gray`). Large display text keeps the original `#666` (`--gray-display`).
- **Copy edits:** grammar and typo fixes in the Vital, Lucy and KBC case studies and on About. See `COPY-EDITS.md`.

## Deliberate differences from the Framer site

- The header gets a frosted white background once you scroll. On the original it comes back transparent and overlaps the content.
- The hero text starts animating within 0.5s. On the original it stays blank for over a second.
- `/work/concorde` shows an NDA panel with a "Request access" email link instead of a password wall. The panel copy is a placeholder, so edit it.
- Page titles, meta descriptions, canonical URLs and image `alt` text have been added. The original uses titles like "Home" and "KBC", and its card images have empty alt text.
