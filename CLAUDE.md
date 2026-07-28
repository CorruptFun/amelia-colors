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

## Auditing the art

`node scripts/audit-pages.js` rasterises every page, flood-fills it, and reports
each category against the `animals` baseline. Run it after any art change.

As of 2026-07-28 the style pass is complete: **0/132 pages missing a bold outer
contour** (was 91), **0/132 stroke overrides** (was 4), category span range
157–180.5 board units (was 148–192). Remaining deviations are all "lighter than
animals" on `go`/`nature`/`space`/`fun`/`shape` — a rocket or a shape page
legitimately carries less line than a detailed animal. That is a taste call, not
a defect; raise it before adding detail.

### Traps this tool has already fallen into

- **Raw bounding box is not subject size.** Animals carry full-width scenery
  (ground lines, waves), so their bbox reports the horizon. The audit uses a
  trimmed p2..p98 extent instead — don't "fix" that back.
- **Region counts must exclude `<text>`.** Word labels enclose one small region
  per letter counter, so a page captioned XYLOPHONE scored 32 "untappable
  regions" from its own caption. The audit re-renders without text for the
  region pass.
- **A clean audit is not a correct page.** The numbers were green while several
  ABC icons overlapped their own word labels. Always render contact sheets
  (`node scripts/render-sheets.js`) and look at them.
- **Don't bold a cluster of overlapping circles** (grape bunches, clouds, tree
  canopies). Bold thickens every overlap into a crescent too thin to fill.
- **Don't infer quality from a raw `behind()` count.** `art-cars.js` was once
  flagged that way and is in fact one of the two best categories.

## Deploy

`scripts/deploy.sh` → GitHub Pages. **Public repo** — keep personal detail out.

Cross-machine context lives in the vault at `01_Projects/Amelia Colors.md`.
