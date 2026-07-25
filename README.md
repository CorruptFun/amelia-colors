# Amelia Colors 🎨

**A coloring book and drawing studio for little artists.**
Live: **https://corruptfun.github.io/amelia-colors/**

Built for a three-year-old who loves to color, so she has paper and crayons in the car.
Her seven-year-old brother is covered too — there's a whole **Fast Cars** category.

Install it from the browser ("Add to Home Screen") and it works with no signal at all.

---

## What's in it

**132 coloring pages** across 12 categories:

| Category | Pages | |
|---|---|---|
| 🦁 Animals | 28 | horse, dolphin, unicorn, cat, puppy, bunny, owl, lion, elephant, penguin… |
| 🏎️ Fast Cars | 12 | muscle cars, JDM hatchbacks, a monster truck, a big rig, a rally racer |
| 🚜 Things That Go | 8 | tractor, fire truck, train, plane, sail boat, school bus, digger, rocket |
| 🌈 Outside | 8 | flower, apple tree, sun, rainbow, mushroom, snowman, rainy day, castle |
| 🚀 Outer Space | 4 | astronaut, planet, space ship, moon & stars |
| 🍦 Yummy | 8 | ice cream, cupcake, donut, watermelon, pizza, apple, lollipop, cake |
| 👑 Fun Stuff | 8 | crown, robot, house, balloons, present, mermaid tail, teddy bear, shapes |
| 🔤 ABC | 26 | a letter, a picture and the word, for every letter |
| 🔢 Numbers | 10 | count 1–10 |
| 🔶 Shapes | 8 | circle, square, triangle, star, heart, diamond, oval, rectangle |
| ➕ Add & Color | 8 | simple sums with an answer box to fill in |
| 🎨 Color by Number | 4 | mosaic pictures with a number key |

**Drawing tools:** paint bucket (6 fill patterns) · 5 brushes — marker, crayon, rainbow,
glitter, neon · eraser · 50 emoji stickers · **symmetry and kaleidoscope modes** ·
6 paper backgrounds for blank pages · undo & redo.

**Saving:** every picture goes into a local "My Art" gallery you can reopen and keep
coloring. An in-progress picture autosaves, so a car ride ending mid-drawing loses nothing.
Nothing is uploaded anywhere — it's all in the browser on the device.

---

## Built for a pre-reader

- Four huge tiles on the home screen. Emoji and colour carry the meaning; no text is
  load-bearing anywhere in the main flow.
- Nothing tappable in the main flow is under ~46px; the chrome scales with `clamp()` so it
  fits from a 320px phone to a 13" tablet without breakpoint snapping.
- Pinch-zoom, double-tap-zoom, text selection and the context menu are all disabled.
- A second finger landing mid-stroke is ignored.
- "Start over" and "delete" sit behind confirm dialogs, and the gallery's delete badge is
  deliberately small so little fingers miss it.
- Every action makes a sound, and finishing a picture sets off confetti and a fanfare.

---

## Running it locally

```bash
python3 dev-server.py 5177     # → http://localhost:5177
```

Use this rather than `python3 -m http.server` — the plain server caches JavaScript and will
happily serve you a stale build while you wonder why your edit did nothing. `dev-server.py`
sends `no-store` on everything.

There is **no build step and no dependencies**. Edit a file, reload, done.

## Deploying

```bash
scripts/deploy.sh "What changed"
```

Bumps the service worker's `CACHE_VERSION` (so anyone with it installed gets the
"New version ready → REFRESH" nudge), commits, and pushes. Pushing to `main` *is* the
deploy; GitHub Pages rebuilds in about a minute.

---

## How it's put together

```
index.html            screens: home · categories · pages · gallery · studio
styles.css            fluid clamp()-based layout
js/art-core.js        shape DSL, line-weight system, scene furniture, fit()
js/art-animals.js     28 animals
js/art-cars.js        12 street-racer cars
js/art-things.js      vehicles, nature, space, treats, fun stuff
js/art-learn.js       ABC, counting, shapes, addition, colour-by-number
js/paint.js           3-layer canvas engine, flood fill, brushes, symmetry
js/storage.js         IndexedDB gallery + draft autosave
js/audio.js           synthesised sound effects (no audio files ship)
js/app.js             navigation, studio controls, confetti, modals
sw.js                 service worker — network-first pages, SWR assets
dev-server.py         no-cache static server for local work
```

**Three canvas layers.** `bg` (the paper) + `paint` (everything the child makes) + `line`
(the outline art, always composited on top). The flood fill runs on `paint` but is walled off
by a mask built from the alpha channel of `line`, so outlines stay razor sharp and every
enclosed shape is its own fillable region. After a fill the region creeps 2px *under* the
outline so no white halo is left behind.

**The art is code.** Every page is a list of primitives on a 200×200 board, rendered to SVG
and rasterised through an `<img>`. Line weights are a real hierarchy — `.bold` for the outer
contour, then default, `.thin`, `.hair` — which is most of what separates a doodle from a
coloring-book page. Every page gets a rounded frame and a little scene (sun, clouds, grass,
waves, stars) for free.

**No network calls.** The app never talks to a server. All sound is synthesised in WebAudio,
all art is generated at runtime, all storage is local.

---

## License

Proprietary — see [LICENSE](LICENSE). The source is visible because a web app has to be
delivered to the browser to run; that is not a licence to copy it.

© 2026 Corrupt Solutions LLC. All rights reserved.
