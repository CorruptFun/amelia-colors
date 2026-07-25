/* =============================================================
   Amelia Colors — art core
   A tiny shape DSL for authoring line-art coloring pages.
   Every page is a list of SVG primitives on a 200x200 board.
   Shapes are stroked, never filled, so the paint layer beneath
   shows through and the flood-fill has clean closed regions.
   ============================================================= */
(function (global) {
  'use strict';

  var VB = 200; // board size

  function n(v) { return Math.round(v * 100) / 100; }

  // ---- primitives -------------------------------------------------
  var S = {
    c: function (cx, cy, r) {
      return '<circle cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"/>';
    },
    e: function (cx, cy, rx, ry, rot) {
      var t = rot ? ' transform="rotate(' + n(rot) + ' ' + n(cx) + ' ' + n(cy) + ')"' : '';
      return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '"' + t + '/>';
    },
    r: function (x, y, w, h, rd) {
      return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) +
        '" rx="' + n(rd == null ? 4 : rd) + '"/>';
    },
    rr: function (x, y, w, h, rd, rot) {
      var cx = x + w / 2, cy = y + h / 2;
      return '<rect x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) +
        '" rx="' + n(rd == null ? 4 : rd) + '" transform="rotate(' + n(rot) + ' ' + n(cx) + ' ' + n(cy) + ')"/>';
    },
    p: function (d) { return '<path d="' + d + '"/>'; },
    poly: function (pts) { return '<polygon points="' + pts + '"/>'; },
    l: function (x1, y1, x2, y2) {
      return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '"/>';
    },
    // solid black bits — pupils, nostrils, spots
    dot: function (cx, cy, r) {
      return '<circle class="ink" cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"/>';
    },
    inkP: function (d) { return '<path class="ink" d="' + d + '"/>'; },
    // text glyph outline (used by the alphabet + number pages)
    glyph: function (ch, x, y, size, weight) {
      return '<text x="' + n(x) + '" y="' + n(y) + '" font-size="' + n(size) +
        '" font-family="Verdana, Geneva, DejaVu Sans, sans-serif" font-weight="' + (weight || 700) +
        '" text-anchor="middle" dominant-baseline="middle">' + ch + '</text>';
    },
    // thin decorative stroke (does not read as a hard wall as strongly)
    hair: function (d) { return '<path class="hair" d="' + d + '"/>'; },
    // white highlight (sits above the paint layer — stays white forever)
    hl: function (cx, cy, r) {
      return '<circle class="hl" cx="' + n(cx) + '" cy="' + n(cy) + '" r="' + n(r) + '"/>';
    }
  };

  /* ---- line-weight wrappers -------------------------------------
     Real coloring books draw the outer contour heavier than the
     interior detail. bold() / thin() / hair() wrap any primitives. */
  function addClass(name, str) {
    return str.replace(/<(\w+)([^>]*?)\/>/g, function (m, tag, attrs) {
      var has = /class="([^"]*)"/.exec(attrs);
      if (has) return '<' + tag + attrs.replace(has[0], 'class="' + has[1] + ' ' + name + '"') + '/>';
      return '<' + tag + ' class="' + name + '"' + attrs + '/>';
    });
  }
  function weight(name) {
    return function () {
      var out = '', i;
      for (i = 0; i < arguments.length; i++) out += addClass(name, arguments[i]);
      return out;
    };
  }
  S.bold = weight('bold');
  S.thinW = weight('thin');
  S.hairW = weight('hair');

  /* ---- occlusion -------------------------------------------------
     THE rule that separates line art from a tangle of overlapping
     outlines: a shape that sits *behind* another must not draw through
     it. Everything here is stroke-only (so the paint layer shows
     through), which means we cannot hide a back shape by filling the
     front one white — that would block colouring. Instead we mask the
     back shape with the front shape's silhouette, so its stroke is
     erased exactly where the front shape covers it.

       behind(silhouette, parts)        parts are cut away inside `silhouette`
       behind(silhouette, parts, grow)  erase `grow` units past the edge too

     The cut lands on the front outline's centre line, so the front
     stroke (drawn afterwards) covers the join — the same way a real
     coloring book reads. */
  var maskSeq = 0;

  function flatten(x) {
    if (x == null) return '';
    if (typeof x === 'string') return x;
    return x.map(flatten).join('');
  }

  // turn stroked primitives into a solid black stencil for a <mask>
  function stencil(str, grow) {
    var g = grow ? ' stroke="#000" stroke-width="' + n(grow * 2) +
      '" stroke-linejoin="round" stroke-linecap="round"' : ' stroke="none"';
    return flatten(str).replace(/<(\w+)([^>]*?)\/>/g, function (m, tag, attrs) {
      attrs = attrs.replace(/\s*(class|fill|stroke|stroke-width)="[^"]*"/g, '');
      return '<' + tag + attrs + ' fill="#000"' + g + '/>';
    });
  }

  function behind(cover, parts, grow) {
    var body = flatten(parts);
    if (!body) return '';
    var id = 'k' + (++maskSeq);
    return '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="-60" y="-60" width="320" height="320">' +
      '<rect x="-60" y="-60" width="320" height="320" fill="#fff"/>' +
      stencil(cover, grow) +
      '</mask><g mask="url(#' + id + ')">' + body + '</g>';
  }

  /* The opposite of behind(): keep only the part of `parts` that falls
     inside `shape`. This is what markings want — spots, stripes, shell
     segments and bellies belong to their host shape and must not spill
     over its contour. `trim` pulls the edge in so a marking cannot
     merge with the outline it sits inside. */
  function inside(shape, parts, trim) {
    var body = flatten(parts);
    if (!body) return '';
    var id = 'i' + (++maskSeq);
    // white = keep. A black ring straddling the contour eats `trim`
    // units back in from the edge.
    var keep = stencil(shape).replace(/fill="#000"/g, 'fill="#fff"');
    var edge = trim ? stencil(shape, trim).replace(/ fill="#000"/g, ' fill="none"') : '';
    return '<mask id="' + id + '" maskUnits="userSpaceOnUse" x="-60" y="-60" width="320" height="320">' +
      '<rect x="-60" y="-60" width="320" height="320" fill="#000"/>' +
      keep + edge +
      '</mask><g mask="url(#' + id + ')">' + body + '</g>';
  }

  /* A closed silhouette used only as an occluder — never drawn. */
  function sil(d) { return '<path d="' + d + '"/>'; }

  // ---- reusable sub-parts ----------------------------------------
  var Parts = {
    eye: function (cx, cy, r) {
      r = r || 7;
      return S.c(cx, cy, r) + S.dot(cx + r * 0.15, cy + r * 0.1, r * 0.45);
    },
    smile: function (cx, cy, w) {
      w = w || 16;
      return S.p('M' + n(cx - w) + ',' + n(cy) + ' Q' + n(cx) + ',' + n(cy + w * 0.75) + ' ' + n(cx + w) + ',' + n(cy));
    },
    star: function (cx, cy, r) {
      var pts = [], i, a, rr;
      for (i = 0; i < 10; i++) {
        a = (Math.PI / 5) * i - Math.PI / 2;
        rr = i % 2 ? r * 0.44 : r;
        pts.push(n(cx + Math.cos(a) * rr) + ',' + n(cy + Math.sin(a) * rr));
      }
      return S.poly(pts.join(' '));
    },
    heart: function (cx, cy, r) {
      return S.p('M' + n(cx) + ',' + n(cy + r * 0.9) +
        ' C' + n(cx - r * 1.5) + ',' + n(cy - r * 0.3) +
        ' ' + n(cx - r * 0.55) + ',' + n(cy - r * 1.25) +
        ' ' + n(cx) + ',' + n(cy - r * 0.35) +
        ' C' + n(cx + r * 0.55) + ',' + n(cy - r * 1.25) +
        ' ' + n(cx + r * 1.5) + ',' + n(cy - r * 0.3) +
        ' ' + n(cx) + ',' + n(cy + r * 0.9) + ' Z');
    },
    flower: function (cx, cy, r) {
      var out = '', i, a;
      for (i = 0; i < 6; i++) {
        a = (Math.PI / 3) * i;
        out += S.e(cx + Math.cos(a) * r * 0.95, cy + Math.sin(a) * r * 0.95, r * 0.58, r * 0.42, (a * 180 / Math.PI));
      }
      return out + S.c(cx, cy, r * 0.45);
    },
    cloud: function (cx, cy, r) {
      return S.p('M' + n(cx - r * 1.5) + ',' + n(cy + r * 0.5) +
        ' a' + n(r * 0.7) + ',' + n(r * 0.7) + ' 0 0 1 ' + n(r * 0.25) + ',-' + n(r * 1.15) +
        ' a' + n(r * 0.85) + ',' + n(r * 0.85) + ' 0 0 1 ' + n(r * 1.45) + ',-' + n(r * 0.2) +
        ' a' + n(r * 0.7) + ',' + n(r * 0.7) + ' 0 0 1 ' + n(r * 1.1) + ',' + n(r * 1.35) + ' Z');
    },
    // ground line so free space at the bottom is fillable
    ground: function (y) {
      return S.p('M0,' + n(y) + ' Q50,' + n(y - 6) + ' 100,' + n(y) + ' T200,' + n(y));
    },
    // two big cartoon eyes with pupils and highlights
    eyes: function (cx, cy, gap, r) {
      return Parts.bigEye(cx - gap, cy, r) + Parts.bigEye(cx + gap, cy, r);
    },
    bigEye: function (cx, cy, r) {
      return S.c(cx, cy, r) +
        S.dot(cx + r * 0.1, cy + r * 0.08, r * 0.52) +
        S.hl(cx + r * 0.42, cy - r * 0.3, r * 0.2);
    },
    // sleepy / happy closed eye
    happyEye: function (cx, cy, r) {
      return S.p('M' + n(cx - r) + ',' + n(cy + r * 0.3) + ' Q' + n(cx) + ',' + n(cy - r * 0.8) +
        ' ' + n(cx + r) + ',' + n(cy + r * 0.3));
    },
    blush: function (cx, cy, rx) {
      return S.hair('M' + n(cx - rx) + ',' + n(cy) + ' A' + n(rx) + ',' + n(rx * 0.72) + ' 0 0 0 ' + n(cx + rx) + ',' + n(cy) +
        ' A' + n(rx) + ',' + n(rx * 0.72) + ' 0 0 0 ' + n(cx - rx) + ',' + n(cy));
    },
    // muzzle with a nose and a two-lobe smile
    muzzle: function (cx, cy, rx, ry, nr) {
      return S.e(cx, cy, rx, ry) +
        S.e(cx, cy - ry * 0.42, nr, nr * 0.76) +
        S.dot(cx, cy - ry * 0.42, nr * 0.6) +
        S.p('M' + n(cx) + ',' + n(cy - ry * 0.42 + nr * 0.8) + ' L' + n(cx) + ',' + n(cy + ry * 0.12)) +
        S.p('M' + n(cx - rx * 0.62) + ',' + n(cy + ry * 0.1) + ' Q' + n(cx - rx * 0.3) + ',' + n(cy + ry * 0.66) + ' ' + n(cx) + ',' + n(cy + ry * 0.12)) +
        S.p('M' + n(cx + rx * 0.62) + ',' + n(cy + ry * 0.1) + ' Q' + n(cx + rx * 0.3) + ',' + n(cy + ry * 0.66) + ' ' + n(cx) + ',' + n(cy + ry * 0.12));
    }
  };

  /* Build a closed outline around a spine — the reliable way to draw a
     tapering organic limb (a seahorse body, a tail, a neck) as one
     clean contour instead of a stack of overlapping blobs.
     pts: [[x, y, halfWidth], …] */
  Parts.ribbon = function (pts) {
    var L = [], R = [], i, p, prev, next, dx, dy, len, nx, ny;
    for (i = 0; i < pts.length; i++) {
      p = pts[i];
      prev = pts[Math.max(i - 1, 0)];
      next = pts[Math.min(i + 1, pts.length - 1)];
      dx = next[0] - prev[0]; dy = next[1] - prev[1];
      len = Math.sqrt(dx * dx + dy * dy) || 1;
      nx = -dy / len; ny = dx / len;
      L.push([p[0] + nx * p[2], p[1] + ny * p[2]]);
      R.push([p[0] - nx * p[2], p[1] - ny * p[2]]);
    }
    R.reverse();
    return S.p(smoothPath(L.concat(R)) + ' Z');
  };

  // polyline → rounded path (midpoints as anchors, vertices as controls)
  function smoothPath(p) {
    var d = 'M' + n(p[0][0]) + ',' + n(p[0][1]), i;
    for (i = 1; i < p.length - 1; i++) {
      d += ' Q' + n(p[i][0]) + ',' + n(p[i][1]) + ' ' +
        n((p[i][0] + p[i + 1][0]) / 2) + ',' + n((p[i][1] + p[i + 1][1]) / 2);
    }
    return d + ' L' + n(p[p.length - 1][0]) + ',' + n(p[p.length - 1][1]);
  }

  /* ---- scene furniture ------------------------------------------
     A page border plus a little world around the character is most of
     what separates a "sketch" from a real coloring-book page. */
  var Scene = {
    frame: function () {
      return S.bold('<rect x="5" y="5" width="190" height="190" rx="11" fill="none"/>');
    },
    sun: function (cx, cy, r) {
      var out = S.c(cx, cy, r), i, a;
      for (i = 0; i < 8; i++) {
        a = (Math.PI * 2 / 8) * i;
        out += S.p('M' + n(cx + Math.cos(a) * (r + 4)) + ',' + n(cy + Math.sin(a) * (r + 4)) +
          ' L' + n(cx + Math.cos(a) * (r + 11)) + ',' + n(cy + Math.sin(a) * (r + 11)));
      }
      return out;
    },
    cloud: function (cx, cy, r) { return Parts.cloud(cx, cy, r); },
    clouds: function (list) {
      return list.map(function (c) { return Parts.cloud(c[0], c[1], c[2]); }).join('');
    },
    hills: function (y) {
      return S.p('M5,' + n(y) + ' C28,' + n(y - 26) + ' 60,' + n(y - 24) + ' 82,' + n(y)) +
        S.p('M62,' + n(y) + ' C88,' + n(y - 32) + ' 130,' + n(y - 30) + ' 158,' + n(y)) +
        S.p('M140,' + n(y) + ' C160,' + n(y - 20) + ' 180,' + n(y - 18) + ' 195,' + n(y));
    },
    horizon: function (y) {
      return S.p('M5,' + n(y) + ' Q52,' + n(y - 7) + ' 100,' + n(y) + ' T195,' + n(y));
    },
    // little grass tufts along a baseline
    tufts: function (y, seedSpacing) {
      var out = '', x, k = 0;
      for (x = 14; x < 190; x += (seedSpacing || 26)) {
        var h = 7 + (k % 3) * 3, w = 5;
        out += S.hair('M' + n(x) + ',' + n(y) + ' C' + n(x - 2) + ',' + n(y - h) + ' ' + n(x - w) + ',' + n(y - h) + ' ' + n(x - w - 1) + ',' + n(y - h - 2) +
          ' M' + n(x) + ',' + n(y) + ' L' + n(x + 1) + ',' + n(y - h - 3) +
          ' M' + n(x) + ',' + n(y) + ' C' + n(x + 2) + ',' + n(y - h) + ' ' + n(x + w) + ',' + n(y - h) + ' ' + n(x + w + 1) + ',' + n(y - h - 2));
        k++;
      }
      return out;
    },
    waves: function (y, rows) {
      var out = '', i;
      for (i = 0; i < (rows || 3); i++) {
        var yy = y + i * 9, off = (i % 2) * 16;
        out += S.hair('M' + n(10 + off) + ',' + n(yy) + ' q10,-6 20,0 t20,0 t20,0 t20,0 t20,0 t20,0 t20,0');
      }
      return out;
    },
    bubbles: function (list) {
      return list.map(function (b) { return S.c(b[0], b[1], b[2]); }).join('');
    },
    stars: function (list) {
      return list.map(function (s) { return Parts.star(s[0], s[1], s[2]); }).join('');
    },
    seaweed: function (x, y, h) {
      return S.p('M' + n(x) + ',' + n(y) + ' C' + n(x - 10) + ',' + n(y - h * 0.3) + ' ' + n(x + 10) + ',' + n(y - h * 0.6) + ' ' + n(x - 4) + ',' + n(y - h) +
        ' C' + n(x + 2) + ',' + n(y - h * 0.6) + ' ' + n(x + 14) + ',' + n(y - h * 0.32) + ' ' + n(x + 6) + ',' + n(y) + ' Z');
    },
    fence: function (y, x0, x1) {
      var out = S.p('M' + n(x0) + ',' + n(y - 16) + ' L' + n(x1) + ',' + n(y - 16)) +
        S.p('M' + n(x0) + ',' + n(y - 6) + ' L' + n(x1) + ',' + n(y - 6));
      for (var x = x0; x <= x1; x += 22) {
        out += S.p('M' + n(x) + ',' + n(y + 4) + ' L' + n(x) + ',' + n(y - 24) + ' L' + n(x + 4) + ',' + n(y - 28) +
          ' L' + n(x + 8) + ',' + n(y - 24) + ' L' + n(x + 8) + ',' + n(y + 4) + ' Z');
      }
      return out;
    },
    flowerAt: function (cx, cy, r) {
      return Parts.flower(cx, cy, r) + S.hair('M' + n(cx) + ',' + n(cy + r * 1.4) + ' L' + n(cx) + ',' + n(cy + r * 3.4));
    },
    snowflakes: function (list) {
      return list.map(function (s) {
        var out = '', i, a, cx = s[0], cy = s[1], r = s[2];
        for (i = 0; i < 3; i++) {
          a = (Math.PI / 3) * i;
          out += S.hair('M' + n(cx - Math.cos(a) * r) + ',' + n(cy - Math.sin(a) * r) +
            ' L' + n(cx + Math.cos(a) * r) + ',' + n(cy + Math.sin(a) * r));
        }
        return out;
      }).join('');
    }
  };

  // ---- render -----------------------------------------------------
  function toSVG(parts, opts) {
    opts = opts || {};
    var sw = opts.stroke || 2.35;
    var body = (typeof parts === 'string' ? parts : parts.join(''));
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + VB + ' ' + VB + '" width="' +
      (opts.size || VB) + '" height="' + (opts.size || VB) + '">' +
      '<style>' +
      'g{fill:none;stroke:#151a2e;stroke-width:' + sw + ';stroke-linecap:round;stroke-linejoin:round}' +
      '.bold{stroke-width:' + (sw * 1.48) + '}' +
      '.thin{stroke-width:' + (sw * 0.78) + '}' +
      '.hair{stroke-width:' + (sw * 0.6) + '}' +
      '.ink{fill:#151a2e;stroke:none}' +
      '.hl{fill:#FFFFFF;stroke:none}' +
      '.fit *{vector-effect:non-scaling-stroke}' +
      'text{fill:none;stroke:#151a2e;stroke-width:' + (sw * 0.95) + '}' +
      '</style><g>' +
      (opts.frame === false ? '' : '<rect class="bold" x="5" y="5" width="190" height="190" rx="11" fill="none"/>') +
      body + '</g></svg>';
  }

  function toDataURL(parts, opts) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(toSVG(parts, opts));
  }

  // Rasterise a page's line art onto a 2D context, contained + centred.
  function drawPage(ctx, page, w, h, pad) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var m = pad == null ? 0.045 : pad;
        var box = Math.min(w, h) * (1 - m * 2);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, (w - box) / 2, (h - box) / 2, box, box);
        resolve();
      };
      img.onerror = reject;
      img.src = toDataURL(page.art(), { size: 1024, stroke: page.stroke || 2.35 });
    });
  }

  /* Scale a drawing to fit inside the page frame without thinning its
     lines — `vector-effect: non-scaling-stroke` keeps the weights. */
  function fit(scale, tx, ty) {
    var body = '', i;
    for (i = 3; i < arguments.length; i++) {
      body += (typeof arguments[i] === 'string' ? arguments[i] : arguments[i].join(''));
    }
    return '<g class="fit" transform="translate(' + n(tx) + ',' + n(ty) + ') scale(' + n(scale) + ')">' +
      body + '</g>';
  }

  global.Art = {
    S: S, Parts: Parts, Scene: Scene, VB: VB, fit: fit,
    behind: behind, inside: inside, sil: sil,
    toSVG: toSVG, toDataURL: toDataURL, drawPage: drawPage,
    pages: {},        // id -> page
    categories: []    // ordered category descriptors
  };
})(window);
