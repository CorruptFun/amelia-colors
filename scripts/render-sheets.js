#!/usr/bin/env node
/* Render every coloring page to PNG contact sheets so they can be
   reviewed as pictures rather than as path data.

   The art is authored as code, which makes it very easy to ship a page
   that parses fine and looks like a tangle. Eyeballing the whole set
   after a change is the only way to catch that.

     node scripts/render-sheets.js [outDir]

   Writes <outDir>/<cat>__<id>.svg for every page plus one
   <outDir>/sheet-<cat>.png contact sheet per category.

   Needs rsvg-convert and ImageMagick:  brew install librsvg imagemagick
*/
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(process.argv[2] || path.join(ROOT, '.render-sheets'));
const FONT = '/System/Library/Fonts/Helvetica.ttc';
const TILE = 4;

for (const bin of ['rsvg-convert', 'magick']) {
  try {
    execFileSync('which', [bin], { stdio: 'ignore' });
  } catch (e) {
    console.error(`Missing ${bin}. Install with: brew install librsvg imagemagick`);
    process.exit(1);
  }
}

fs.mkdirSync(OUT, { recursive: true });

// the art files are plain <script> tags that hang everything off window
const sandbox = { window: {}, Math: Math, console: console };
vm.createContext(sandbox);
for (const f of ['art-core.js', 'art-animals.js', 'art-cars.js', 'art-things.js', 'art-learn.js']) {
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'), sandbox, { filename: f });
}

const Art = sandbox.window.Art;
let count = 0;

for (const cat of Art.categories) {
  const pngs = [];
  for (const page of cat.pages) {
    const stem = path.join(OUT, `${cat.id}__${page.id}`);
    fs.writeFileSync(stem + '.svg',
      Art.toSVG(page.art(), { size: 512, stroke: page.stroke || 2.35 }));
    execFileSync('rsvg-convert', ['-w', '420', '-h', '420', '-b', 'white',
      stem + '.svg', '-o', stem + '.png']);
    execFileSync('magick', [stem + '.png', '-background', 'white', '-fill', 'black',
      '-font', FONT, '-pointsize', '26', '-gravity', 'south',
      '-splice', '0x34', '-annotate', '+0+4', page.name, stem + '.png']);
    pngs.push(stem + '.png');
    count++;
  }
  execFileSync('magick', ['montage', ...pngs, '-font', FONT, '-tile', `${TILE}x`,
    '-geometry', '+8+8', '-background', '#dddddd',
    path.join(OUT, `sheet-${cat.id}.png`)]);
  console.log(`sheet-${cat.id}.png  (${cat.pages.length})`);
}

console.log(`\n${count} pages → ${OUT}`);
