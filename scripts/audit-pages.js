#!/usr/bin/env node
/* Audit every coloring page for style consistency.

   render-sheets.js lets you *look* at the art. This measures it, so a page
   that is crammed, mis-scaled, or drawn at the wrong line weight gets flagged
   instead of having to be spotted by eye across 130+ pages.

     node scripts/audit-pages.js [--json out.json] [--baseline animals]

   Each page is rasterised frameless, then:

     scale      how much of the 200x200 board the art actually occupies.
                Pages that differ a lot read as inconsistent next to each other.
     safe area  art must live inside ~16..184. Outside that it crowds the frame.
     ink %      share of the board covered by line. High = heavy/crammed.
     regions    enclosed white areas — every one is a flood-fill tap target.
     tiny       enclosed regions too small for a small finger to hit.
     slivers    enclosed regions thinner than ~2 board units — these are the
                "lines crammed together" case; they read as smudges, not shapes.
     open       art whose interior leaks to the outside, i.e. not closed, so
                the flood fill escapes and floods the page.
     stroke     per-page stroke override. Anything off the house 2.35 will look
                lighter or heavier than its neighbours.

   Thresholds are derived from a baseline category (default: animals) so this
   answers "does this page match the animals style" rather than an abstract ideal.

   Needs rsvg-convert and ImageMagick:  brew install librsvg imagemagick
*/
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const R = 256;                 // raster size
const BU = 200 / R;            // board units per pixel
const HOUSE_STROKE = 2.35;

const argv = process.argv.slice(2);
const jsonOut = argv.includes('--json') ? argv[argv.indexOf('--json') + 1] : null;
const baselineId = argv.includes('--baseline') ? argv[argv.indexOf('--baseline') + 1] : 'animals';

for (const bin of ['rsvg-convert', 'magick']) {
  try { execFileSync('which', [bin], { stdio: 'ignore' }); }
  catch (e) {
    console.error(`Missing ${bin}. Install with: brew install librsvg imagemagick`);
    process.exit(1);
  }
}

// ---- load the art exactly the way the browser does -----------------
const sandbox = { window: {}, Math: Math, console: console };
vm.createContext(sandbox);
for (const f of ['art-core.js', 'art-animals.js', 'art-cars.js', 'art-things.js', 'art-learn.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), sandbox, { filename: f });
}
const Art = sandbox.window.Art;

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'amelia-audit-'));

// ---- raster helpers ------------------------------------------------
function rasterise(svg) {
  const s = path.join(TMP, 'p.svg'), p = path.join(TMP, 'p.png');
  fs.writeFileSync(s, svg);
  execFileSync('rsvg-convert', ['-w', String(R), '-h', String(R), '-b', 'white', s, '-o', p]);
  const raw = execFileSync('magick', [p, '-colorspace', 'gray', '-depth', '8', 'gray:-'],
    { maxBuffer: 1 << 26 });
  return raw; // R*R bytes, 0 = black
}

/* Flood the non-ink pixels. Region 0 is everything reachable from the padded
   border, i.e. outside the art. Everything else is enclosed — a fill target. */
function regions(ink) {
  const lab = new Int32Array(R * R).fill(-1);
  const stack = [];
  let next = 0;

  function flood(seed, id) {
    stack.length = 0; stack.push(seed);
    let area = 0, x0 = R, y0 = R, x1 = -1, y1 = -1;
    while (stack.length) {
      const i = stack.pop();
      if (lab[i] !== -1 || ink[i]) continue;
      lab[i] = id; area++;
      const x = i % R, y = (i / R) | 0;
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
      if (x > 0) stack.push(i - 1);
      if (x < R - 1) stack.push(i + 1);
      if (y > 0) stack.push(i - R);
      if (y < R - 1) stack.push(i + R);
    }
    return { area, w: x1 - x0 + 1, h: y1 - y0 + 1 };
  }

  // seed the outside from every border pixel
  const outside = [];
  for (let x = 0; x < R; x++) { outside.push(x, (R - 1) * R + x); }
  for (let y = 0; y < R; y++) { outside.push(y * R, y * R + R - 1); }
  let outArea = 0;
  for (const s of outside) if (lab[s] === -1 && !ink[s]) outArea += flood(s, next).area;
  next++;

  const enclosed = [];
  for (let i = 0; i < R * R; i++) {
    if (lab[i] === -1 && !ink[i]) enclosed.push(flood(i, next++));
  }
  return { enclosed, outArea };
}

function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  return s[s.length >> 1];
}
function pct(a, p) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

// ---- measure every page --------------------------------------------
const rows = [];
for (const cat of Art.categories) {
  for (const page of cat.pages) {
    const svgBody = page.art();
    const stroke = page.stroke || HOUSE_STROKE;
    const svg = Art.toSVG(svgBody, { size: R, stroke, frame: false });
    const raw = rasterise(svg);

    const ink = new Uint8Array(R * R);
    let inkCount = 0, x0 = R, y0 = R, x1 = -1, y1 = -1;
    const xs = [], ys = [];
    for (let i = 0; i < R * R; i++) {
      if (raw[i] < 128) {
        ink[i] = 1; inkCount++;
        const x = i % R, y = (i / R) | 0;
        xs.push(x); ys.push(y);
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
    if (x1 < 0) { x0 = y0 = x1 = y1 = 0; }

    /* Raw bbox is not a fair size measure: the animals pages carry scenery
       (ground lines, grass, waves) that runs the full width of the board, so
       their bbox reports the horizon rather than the subject. A handful of
       pixels in a one-pixel-tall line barely moves a percentile, so measure
       the subject with a trimmed extent instead and keep the raw bbox only
       for the safe-area check. */
    xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
    const q = (arr, p) => arr.length ? arr[Math.min(arr.length - 1, Math.floor(p * arr.length))] : 0;
    const coreW = (q(xs, 0.98) - q(xs, 0.02)) * BU;
    const coreH = (q(ys, 0.98) - q(ys, 0.02)) * BU;

    /* Two different questions, so two different renders.

       FILL TARGETS come from the full page, size-filtered. Glyphs are stroked
       and unfilled, so a big letter or numeral is a genuine thing to colour and
       must count — a child absolutely colours the "5" on a counting page.
       Anything under the tap threshold is not a target and is excluded.

       CRAMMING comes from the art alone. Word labels enclose one small region
       per letter counter (the hole in an "o", "e", "R"), so a page captioned
       XYLOPHONE once scored 32 "untappable regions" purely from its own
       caption — the count tracked word length, not drawing quality. */
    const MIN_TARGET = 6;                       // board units², roughly a fingertip
    const all = regions(ink).enclosed;
    const targets = all.filter(r => r.area * BU * BU >= MIN_TARGET);

    const svgNoText = Art.toSVG(String(svgBody).replace(/<text[\s\S]*?<\/text>/g, ''),
      { size: R, stroke, frame: false });
    const rawArt = rasterise(svgNoText);
    const inkArt = new Uint8Array(R * R);
    for (let i = 0; i < R * R; i++) if (rawArt[i] < 128) inkArt[i] = 1;
    const art = regions(inkArt).enclosed;

    const areas = targets.map(r => r.area * BU * BU);
    const tiny = art.filter(r => r.area * BU * BU < MIN_TARGET).length;
    const slivers = art.filter(r => Math.min(r.w, r.h) * BU < 2).length;
    const enclosed = targets;

    // an SVG string scan for the line-weight vocabulary
    const flat = String(svgBody);
    const nBold = (flat.match(/class="[^"]*\bbold\b/g) || []).length;
    const nThin = (flat.match(/class="[^"]*\bthin\b/g) || []).length;
    const nHair = (flat.match(/class="[^"]*\bhair\b/g) || []).length;

    rows.push({
      cat: cat.id, id: page.id, name: page.name, stroke,
      bx0: +(x0 * BU).toFixed(1), by0: +(y0 * BU).toFixed(1),
      bx1: +(x1 * BU).toFixed(1), by1: +(y1 * BU).toFixed(1),
      w: +((x1 - x0 + 1) * BU).toFixed(1),
      h: +((y1 - y0 + 1) * BU).toFixed(1),
      coreW: +coreW.toFixed(1), coreH: +coreH.toFixed(1),
      core: +Math.max(coreW, coreH).toFixed(1),
      inkPct: +(100 * inkCount / (R * R)).toFixed(2),
      regions: enclosed.length,
      minRegion: +(areas.length ? Math.min(...areas) : 0).toFixed(1),
      medRegion: +median(areas).toFixed(1),
      tiny, slivers, nBold, nThin, nHair,
    });
    process.stderr.write('.');
  }
}
process.stderr.write('\n');
fs.rmSync(TMP, { recursive: true, force: true });

// ---- baseline from the reference category ---------------------------
const base = rows.filter(r => r.cat === baselineId);
if (!base.length) { console.error(`No pages in baseline category "${baselineId}"`); process.exit(1); }
const B = {
  span: median(base.map(r => r.core)),
  spanLo: pct(base.map(r => r.core), 0.10),
  spanHi: pct(base.map(r => r.core), 0.90),
  inkMed: median(base.map(r => r.inkPct)),
  inkHi: pct(base.map(r => r.inkPct), 0.90),
  tinyHi: pct(base.map(r => r.tiny), 0.90),
  sliverHi: pct(base.map(r => r.slivers), 0.90),
};

/* ---- report ----------------------------------------------------------
   Two different questions, reported separately, because conflating them
   flags nearly every page and tells you nothing:

     A. Does this CATEGORY match the house style set by the baseline?
        Systemic — a whole category drawn light, small, or without a bold
        outer contour. This is what makes pages look unlike each other.
     B. Is this PAGE crammed?
        Local — measured against its own category, so a detailed animal
        isn't punished for being a detailed animal.                        */
const W = (s, n) => String(s).padEnd(n).slice(0, n);
const P = (s, n) => String(s).padStart(n);
const byCat = new Map();
for (const r of rows) {
  if (!byCat.has(r.cat)) byCat.set(r.cat, []);
  byCat.get(r.cat).push(r);
}

console.log(`\n══ A. Category vs "${baselineId}" house style ` + '═'.repeat(28));
console.log(`   ${W('category', 10)}${P('n', 4)}${P('span', 8)}${P('ink%', 8)}` +
  `${P('rgns', 7)}${P('bold', 8)}${P('stroke', 8)}  deviations`);
console.log('   ' + '─'.repeat(76));

const catRows = [];
for (const cat of Art.categories) {
  const rs = byCat.get(cat.id) || [];
  if (!rs.length) continue;
  const span = median(rs.map(r => r.core));
  const ink = median(rs.map(r => r.inkPct));
  const rgn = median(rs.map(r => r.regions));
  const bold = rs.filter(r => r.nBold > 0).length;
  const strokes = [...new Set(rs.map(r => r.stroke))];

  const dev = [];
  if (bold === 0) dev.push('NO bold contour');
  else if (bold < rs.length) dev.push(`bold on only ${bold}/${rs.length}`);
  if (span < B.span * 0.92) dev.push(`${Math.round(100 - 100 * span / B.span)}% smaller`);
  if (ink < B.inkMed * 0.7) dev.push(`${Math.round(100 - 100 * ink / B.inkMed)}% lighter`);
  if (ink > B.inkMed * 1.3) dev.push(`${Math.round(100 * ink / B.inkMed - 100)}% heavier`);
  if (strokes.some(s => s !== HOUSE_STROKE)) dev.push(`stroke ${strokes.join('/')}`);

  catRows.push({ cat: cat.id, n: rs.length, span, ink, rgn, bold, dev });
  console.log(`   ${W(cat.id, 10)}${P(rs.length, 4)}${P(span, 8)}${P(ink, 8)}${P(rgn, 7)}` +
    `${P(bold + '/' + rs.length, 8)}${P(strokes.join(','), 8)}  ${dev.join(' · ')}`);
}

/* ---- B. Fill targets ---------------------------------------------------
   The metric that actually matters. ink% is only a proxy for detail and has
   twice pointed at the wrong work: a page can be "50% lighter" than an animals
   page and still give a child more to colour. What matters is how many enclosed
   areas there are, and how big they are — a page made of five enormous regions
   is a worse colouring page than one made of twenty medium ones, at any ink
   density. Compare the medArea column against the baseline before adding line. */
const FLOOR = 12;
console.log(`\n══ B. Thin pages — under ${FLOOR} fill targets ` + '═'.repeat(30));
console.log(`   baseline "${baselineId}": median ${median(base.map(r => r.regions))} targets, ` +
  `median region area ${median(base.map(r => r.medRegion)).toFixed(0)}\n`);
console.log(`   ${W('category', 10)}${W('page', 18)}${P('targets', 8)}${P('medArea', 10)}${P('ink%', 7)}`);
console.log('   ' + '─'.repeat(53));
const thin = rows.filter(r => r.regions < FLOOR).sort((a, b) => a.regions - b.regions);
for (const r of thin) {
  console.log(`   ${W(r.cat, 10)}${W(r.name, 18)}${P(r.regions, 8)}` +
    `${P(r.medRegion.toFixed(0), 10)}${P(r.inkPct, 7)}`);
}
if (!thin.length) console.log('   (none)');

console.log(`\n══ C. Crammed pages ` + '═'.repeat(48));
console.log('   tiny = fill targets too small to hit · slvr = gaps under ~2 board units\n');
console.log(`   ${W('category', 10)}${W('page', 17)}${P('ink%', 7)}${P('rgns', 6)}` +
  `${P('tiny', 6)}${P('slvr', 6)}${P('minRgn', 8)}`);
console.log('   ' + '─'.repeat(60));
const crammed = rows
  .map(r => ({ r, score: r.tiny + r.slivers }))
  .filter(x => x.score >= 12)
  .sort((a, b) => b.score - a.score);
for (const { r } of crammed) {
  console.log(`   ${W(r.cat, 10)}${W(r.name, 17)}${P(r.inkPct, 7)}${P(r.regions, 6)}` +
    `${P(r.tiny, 6)}${P(r.slivers, 6)}${P(r.minRegion, 8)}`);
}

// per-page flags still land in the JSON for downstream use
for (const r of rows) {
  const f = [];
  const span = r.core;
  const peers = byCat.get(r.cat);
  const peerTiny = median(peers.map(p => p.tiny + p.slivers));
  if (r.stroke !== HOUSE_STROKE) f.push(`stroke=${r.stroke}`);
  if (r.nBold === 0) f.push('no-bold-contour');
  if (span < B.span * 0.85) f.push(`small(${span})`);
  if (r.tiny + r.slivers >= 12 && r.tiny + r.slivers > peerTiny * 1.5) f.push('crammed');
  if (r.regions < 4) f.push(`few-fill-targets(${r.regions})`);
  r.flags = f;
}

const noBold = rows.filter(r => r.nBold === 0).length;
console.log(`\n══ Summary ` + '═'.repeat(57));
console.log(`   ${noBold}/${rows.length} pages have no bold outer contour ` +
  `(the house rule in art-core.js: outer contour heavier than interior detail)`);
console.log(`   ${crammed.length}/${rows.length} pages are crammed`);
console.log(`   ${rows.filter(r => r.stroke !== HOUSE_STROKE).length}/${rows.length} ` +
  `pages override the house stroke of ${HOUSE_STROKE}`);
console.log(`   span range across categories: ` +
  `${Math.min(...catRows.map(c => c.span))} – ${Math.max(...catRows.map(c => c.span))} board units`);

if (jsonOut) {
  fs.writeFileSync(jsonOut, JSON.stringify({ baseline: B, rows }, null, 2));
  console.log(`\n→ ${jsonOut}`);
}
