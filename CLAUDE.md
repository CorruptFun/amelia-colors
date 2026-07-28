# Amelia Colors

A coloring + drawing PWA. Vanilla JS, no build step, fully offline.
Live: <https://corruptfun.github.io/amelia-colors/>

## Do not assume

- **Coloring pages are not images.** All ~132 pages are functions that emit SVG
  primitives through the shape DSL in `js/art-core.js`. There are no PNG page
  assets, and generated raster line art does not belong here — its soft
  anti-aliased edges make the flood fill leak and halo.
- **No build step, no dependencies, no framework.** No npm, no bundler. Edit a
  file and reload. Keep it that way; it is a deliberate constraint.
- **Shapes are stroked, never filled.** The paint canvas sits *beneath* the line
  layer and shows through it. Anything you give a `fill` will cover the artwork.
- **The flood fill needs closed regions.** Every enclosed area is a tap target.
  Detail that doesn't enclose anything is just noise on the page.

## Stack

Inline SVG line layer over a `<canvas>` paint layer. `sw.js` + `manifest.json`
make it an installable offline PWA. Progress persists to localStorage via
`js/storage.js`.

## Run it

`.claude/launch.json` defines the dev server — use the preview tools rather than
starting a server from the shell. `dev-server.py` is the underlying static server.

## Layout

| path | role |
|---|---|
| `js/art-core.js` | the shape DSL — `S` primitives, `bold`/`thin`/`hair` line weights, `behind`/`inside` occlusion helpers |
| `js/art-animals.js` | 29 pages — **the quality bar**; house rules documented at the top of the file |
| `js/art-things.js` | 37 pages |
| `js/art-cars.js` | 13 pages — see Known gaps |
| `js/art-learn.js` | alphabet, numbers, shapes |
| `js/paint.js` | paint layer, flood fill, undo/redo |
| `scripts/render-sheets.js` | renders contact sheets — use this to check art visually |
| `scripts/audit-pages.js` | **measures** every page for style consistency and crowding — run it after art changes |

## House rules for authoring a page

Documented in full atop `js/art-animals.js`. In short:

1. Nothing draws through anything. Wrap occluded parts in
   `Art.behind(frontSilhouette, …)`, strictly back-to-front.
2. Scenery (ground, grass, waves) is masked by the whole silhouette — it never
   crosses the subject.
3. Stay inside the safe area, roughly `16…184` on the 200×200 board.
4. Big closed regions, because each one is a flood-fill target.
5. Clip markings (spots, stripes, decals) to their host shape via `mark()`/`inside()`.

Render a contact sheet and compare against the animals sheet before calling a
page finished.

## Known gaps

Run `node scripts/audit-pages.js` for live numbers. As of 2026-07-28:

- **91 of 132 pages have no bold outer contour.** `art-core.js` documents the
  rule — outer contour heavier than interior detail — and only `animals` and
  `cars` follow it. This is the main reason categories look like different sets.
- **Scale and weight drift.** Non-animal categories occupy 10–23% less of the
  board and carry 43–67% less line than `animals`. `yum` (food) is worst: 22%
  smaller, 67% lighter, and only 8 fill regions against 22 for animals.
- **16 crammed pages** have fill targets too small to hit. Worst: `add` "4 + 4",
  `abc` "X — Xylophone", and all four `cbn` pages.
- **The 4 `cbn` pages override the house stroke** to `2.4` instead of `2.35`.

Do **not** assume `art-cars.js` needs work from its low `behind()` count alone —
that proxy was misleading. Cars scores well on every measured axis; a car
silhouette simply needs less occlusion than an animal.

## Deploy

`scripts/deploy.sh` → GitHub Pages. **Public repo** — keep personal detail out.

Cross-machine context lives in the vault at `01_Projects/Amelia Colors.md`.
