/* Amelia Colors — learning pages: ABC, counting, shapes, math */
(function (Art) {
  'use strict';
  var S = Art.S, P = Art.Parts;
  var behind = Art.behind, inside = Art.inside;
  function mark(shape, parts) { return inside(shape, parts, 2.4); }

  // place a 0..100 mini drawing anywhere on the board
  function at(x, y, s, content) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')" stroke-width="' +
      (Math.round((3.2 / s) * 100) / 100) + '">' + content + '</g>';
  }
  // a cluster of circles where each one sits in front of the ones after it
  function stack(list) {
    var out = '', seen = '', i, c;
    for (i = 0; i < list.length; i++) {
      c = S.c(list[i][0], list[i][1], list[i][2]);
      out += behind(seen, c);
      seen += c;
    }
    return out;
  }

  /* ------------------------------------------------------------------
     A–Z : big letter pair, a picture, and the word
  ------------------------------------------------------------------ */
  var ICONS = (function () {
    var I = {};

    I.A = ['Apple', (function () {
      var fruit = S.p('M50,30 C42,18 22,18 14,34 C4,54 12,82 26,94 C34,102 44,102 50,96 C56,102 66,102 74,94 C88,82 96,54 86,34 C78,18 58,18 50,30 Z');
      var stalk = S.p('M47,30 L53,30 L53,8 L47,8 Z');
      var leaf = S.p('M52,18 C62,6 82,6 86,16 C76,28 58,28 52,18 Z');
      return behind(fruit + leaf, stalk) + behind(fruit, leaf) + fruit;
    })()];

    I.B = ['Ball', (function () {
      var ball = S.c(50, 54, 42);
      return ball + mark(ball, S.p('M14,38 C36,28 64,28 86,38') +
        S.p('M14,70 C36,80 64,80 86,70') + S.p('M50,12 C40,34 40,74 50,96'));
    })()];

    I.C = ['Cat', (function () {
      var head = S.c(50, 58, 34);
      var ears = S.p('M26,36 L20,6 L46,24 Z') + S.p('M74,36 L80,6 L54,24 Z');
      return behind(head, ears) + head + P.eye(38, 52, 8) + P.eye(62, 52, 8) +
        S.inkP('M44,68 L56,68 L50,76 Z') + P.smile(43, 82, 7) + P.smile(57, 82, 7);
    })()];

    I.D = ['Dog', (function () {
      var head = S.c(50, 52, 32);
      var ears = S.e(15, 56, 13, 24, 10) + S.e(85, 56, 13, 24, -10);
      var muz = S.e(50, 70, 20, 15);
      return behind(head, ears) + head + P.eye(38, 44, 7) + P.eye(62, 44, 7) +
        behind(muz, S.p('M50,58 L50,66')) + muz +
        mark(muz, S.e(50, 64, 8, 6)) + S.dot(50, 64, 4) + P.smile(50, 74, 7);
    })()];

    I.E = ['Elephant', (function () {
      var head = S.c(50, 46, 30);
      var earL = S.e(18, 44, 16, 21, -8), earR = S.e(82, 44, 16, 21, 8);
      var trunk = P.ribbon([[50, 70, 12], [53, 88, 9], [46, 100, 6]]);
      return behind(head, earL + earR) + behind(head, trunk) + head +
        mark(earL, S.hair('M13,32 C7,42 7,52 13,60')) +
        mark(earR, S.hair('M87,32 C93,42 93,52 87,60')) +
        P.eye(38, 40, 7) + P.eye(62, 40, 7);
    })()];

    I.F = ['Fish', (function () {
      var body = S.e(44, 54, 34, 28);
      var tail = S.p('M72,54 L98,30 L94,54 L98,78 Z');
      var fin = S.p('M36,28 C42,12 54,6 66,10 C58,18 54,26 54,34 Z');
      return behind(body, tail + fin) + body + P.eye(26, 46, 7) +
        S.p('M12,62 C18,68 26,70 32,68') +
        mark(body, S.c(52, 42, 8) + S.c(64, 58, 8) + S.c(44, 70, 8));
    })()];

    I.G = ['Grapes', (function () {
      var berries = [[50, 88, 13], [38, 68, 13], [62, 68, 13],
        [50, 50, 13], [30, 48, 13], [70, 48, 13], [50, 28, 13]];
      var sil = berries.map(function (b) { return S.c(b[0], b[1], b[2]); }).join('');
      var stem = S.p('M47,26 L53,26 L53,6 L47,6 Z');
      var leaf = S.p('M53,12 C64,0 82,2 86,12 C76,22 60,22 53,14 Z');
      return behind(sil + leaf, stem) + behind(sil, leaf) + stack(berries);
    })()];

    I.H = ['House', (function () {
      var wall = S.p('M18,96 L18,46 L82,46 L82,96 Z');
      var roof = S.p('M6,50 L50,10 L94,50 Z');
      var door = S.p('M38,96 L38,64 L62,64 L62,96 Z');
      return behind(roof + door, wall) + roof + door +
        mark(wall, S.r(22, 56, 13, 13, 2) + S.r(65, 56, 13, 13, 2));
    })()];

    I.I = ['Ice Cream', (function () {
      var cone = S.p('M26,44 L74,44 L50,98 Z');
      var s1 = S.c(36, 34, 18), s2 = S.c(64, 34, 18), s3 = S.c(50, 16, 16);
      return behind(s1 + s2 + s3, cone) + mark(cone, S.p('M34,62 L66,62')) +
        behind(s1 + s2, s3) + behind(s2, s1) + s2 + S.c(50, 0, 6);
    })()];

    I.J = ['Jellyfish', (function () {
      var dome = S.p('M12,54 C12,26 29,8 50,8 C71,8 88,26 88,54 Z');
      var arms = S.p('M22,56 C18,74 26,88 20,100') + S.p('M38,56 C34,76 42,90 36,102') +
        S.p('M62,56 C66,76 58,90 64,102') + S.p('M78,56 C82,74 74,88 80,100');
      return behind(dome, arms) + dome + P.eye(38, 38, 7) + P.eye(62, 38, 7) +
        P.smile(50, 50, 8);
    })()];

    I.K = ['Kite', (function () {
      var kite = S.p('M50,4 L90,50 L50,96 L10,50 Z');
      var tail = S.p('M50,96 C58,106 42,114 50,124 C58,134 42,142 50,150');
      return behind(kite, tail) + kite + mark(kite, S.p('M50,4 L50,96 M10,50 L90,50'));
    })()];

    I.L = ['Leaf', (function () {
      var leaf = S.p('M50,4 C86,26 90,72 50,98 C10,72 14,26 50,4 Z');
      return leaf + mark(leaf, S.p('M50,10 L50,96') +
        S.hair('M50,32 L28,24 M50,32 L72,24 M50,54 L26,48 M50,54 L74,48 M50,76 L32,72 M50,76 L68,72'));
    })()];

    I.M = ['Moon', (function () {
      var moon = S.p('M66,6 C36,6 14,30 14,54 C14,78 36,98 66,98 C74,98 82,96 88,94 C64,86 50,72 50,52 C50,32 64,16 88,10 C82,8 74,6 66,6 Z');
      return moon + mark(moon, S.c(38, 34, 7) + S.c(30, 60, 9) + S.c(46, 80, 6));
    })()];

    I.N = ['Nest', (function () {
      var bowl = S.p('M6,62 C6,46 26,36 50,36 C74,36 94,46 94,62 C94,82 76,94 50,94 C24,94 6,82 6,62 Z');
      var e1 = S.e(32, 36, 15, 13), e2 = S.e(68, 36, 15, 13), e3 = S.e(50, 24, 15, 13);
      var eggs = behind(e1 + e2, e3) + behind(e1, e2) + e1;
      return behind(bowl, eggs) + bowl +
        mark(bowl, S.hair('M10,58 C34,66 66,66 90,58 M12,74 C36,82 64,82 88,74'));
    })()];

    I.O = ['Owl', (function () {
      var body = S.p('M50,10 C24,10 12,34 12,58 C12,82 28,98 50,98 C72,98 88,82 88,58 C88,34 76,10 50,10 Z');
      var feet = S.p('M28,84 L24,100 M50,88 L50,102 M72,84 L76,100');
      return behind(body, feet) + body +
        S.c(36, 48, 15) + S.c(64, 48, 15) + P.eye(36, 48, 8) + P.eye(64, 48, 8) +
        S.p('M50,56 L42,66 L50,74 L58,66 Z');
    })()];

    I.P = ['Pig', (function () {
      var head = S.e(50, 58, 38, 33);
      var ears = S.p('M24,34 L16,10 L42,24 Z') + S.p('M76,34 L84,10 L58,24 Z');
      var snout = S.e(50, 70, 18, 14);
      return behind(head, ears) + head + P.eye(34, 46, 7) + P.eye(66, 46, 7) +
        snout + mark(snout, S.dot(44, 70, 4) + S.dot(56, 70, 4));
    })()];

    I.Q = ['Queen', (function () {
      var points = S.p('M16,84 L6,20 L34,44 L50,4 L66,44 L94,20 L84,84 Z');
      var band = S.p('M16,84 L84,84 L84,98 L16,98 Z');
      return behind(points, S.c(6, 14, 6) + S.c(50, 0, 6) + S.c(94, 14, 6)) +
        behind(band, points) + band +
        mark(points, S.c(50, 62, 9) + S.c(30, 66, 7) + S.c(70, 66, 7));
    })()];

    I.R = ['Rainbow', (function () {
      var cl = P.cloud(14, 84, 13), cr = P.cloud(86, 84, 13);
      var arcs = S.p('M8,86 A42,42 0 0 1 92,86') + S.p('M20,86 A30,30 0 0 1 80,86') +
        S.p('M32,86 A18,18 0 0 1 68,86') + S.p('M44,86 L56,86');
      return behind(cl + cr, arcs) + cl + cr;
    })()];

    I.S = ['Sun', (function () {
      var disc = S.c(50, 50, 30);
      var rays = (function () {
        var o = '', i, a;
        for (i = 0; i < 10; i++) {
          a = (Math.PI * 2 / 10) * i;
          o += S.l(50 + Math.cos(a) * 28, 50 + Math.sin(a) * 28,
            50 + Math.cos(a) * 48, 50 + Math.sin(a) * 48);
        }
        return o;
      })();
      return behind(disc, rays) + disc + P.eye(41, 44, 6) + P.eye(59, 44, 6) + P.smile(50, 58, 11);
    })()];

    I.T = ['Tree', (function () {
      var top = S.c(50, 34, 26), sideL = S.c(28, 48, 19), sideR = S.c(72, 48, 19);
      var canopy = top + sideL + sideR;
      var trunk = S.p('M41,98 L41,60 L59,60 L59,98 Z');
      return behind(canopy, trunk) + behind(top, sideL + sideR) + top +
        mark(canopy, S.c(40, 28, 7) + S.c(62, 38, 7) + S.c(34, 54, 6));
    })()];

    I.U = ['Umbrella', (function () {
      var canopy = S.p('M4,54 C4,26 24,6 50,6 C76,6 96,26 96,54 C86,44 78,44 72,54 C64,44 54,44 50,54 C44,44 34,44 28,54 C22,44 14,44 4,54 Z');
      var handle = S.p('M46,50 L54,50 L54,88 C54,100 38,102 32,92 L40,88 C43,93 50,93 50,88 Z');
      return behind(canopy, handle) + canopy;
    })()];

    I.V = ['Van', (function () {
      var body = S.p('M8,80 L8,44 C8,38 12,34 18,34 L64,34 C72,34 78,38 82,44 L92,60 C95,64 96,70 96,76 L96,80 Z');
      var tyres = S.c(28, 82, 13) + S.c(76, 82, 13);
      return behind(tyres, body + mark(body, S.p('M16,42 L40,42 L40,60 L16,60 Z') +
        S.p('M50,42 L66,42 L76,60 L50,60 Z'))) +
        S.c(28, 82, 13) + S.c(76, 82, 13) + S.c(28, 82, 5) + S.c(76, 82, 5);
    })()];

    I.W = ['Whale', (function () {
      var body = S.p('M6,60 C6,38 26,24 52,24 C76,24 90,36 92,54 C92,70 84,80 70,84 C58,87 46,86 40,84 C20,82 6,74 6,60 Z');
      var tail = S.p('M86,42 C92,32 98,26 102,26 C102,36 98,46 92,52 C98,58 102,68 102,80 C96,76 90,66 86,56 Z');
      var stem = P.ribbon([[42, 26, 5], [38, 14, 4], [36, 4, 2.5]]);
      var puff = P.cloud(36, -2, 8);
      return behind(body + puff, stem) + behind(body, tail) + puff + body +
        mark(body, S.p('M10,66 C28,76 60,80 80,72')) + P.eye(26, 52, 6);
    })()];

    I.X = ['Xylophone', (function () {
      var frame = S.p('M8,28 L88,18 L94,50 L14,60 Z');
      var mallet = S.p('M28,66 L74,72') + S.p('M70,68 C78,66 84,70 84,76 C84,82 76,84 72,78');
      return frame + mark(frame, S.p('M28,25 L33,56 M48,23 L53,54 M68,20 L73,52')) + mallet;
    })()];

    I.Y = ['Yarn', (function () {
      var ball = S.c(50, 54, 38);
      var loose = S.p('M50,16 C36,6 22,6 14,14 C22,20 30,22 38,20');
      return behind(ball, loose) + ball +
        mark(ball, S.p('M20,32 C40,44 54,62 62,86') + S.p('M34,20 C52,34 70,54 80,72') +
          S.p('M72,24 C58,44 46,62 28,76') + S.p('M84,46 C72,62 60,74 46,88'));
    })()];

    I.Z = ['Zebra', (function () {
      var head = S.p('M50,20 C34,20 26,32 26,48 L28,68 C30,84 38,94 50,94 C62,94 70,84 72,68 L74,48 C74,32 66,20 50,20 Z');
      var ears = S.p('M32,26 L26,4 L46,20 Z') + S.p('M68,26 L74,4 L54,20 Z');
      var muz = S.e(50, 80, 15, 12);
      return behind(head, ears) + head +
        mark(head, S.p('M36,24 L42,46 M50,18 L50,42 M64,24 L58,46 M27,58 L40,62 M73,58 L60,62')) +
        P.eye(39, 52, 7) + P.eye(61, 52, 7) +
        muz + mark(muz, S.dot(44, 80, 3) + S.dot(56, 80, 3));
    })()];

    return I;
  })();

  var ABC = Object.keys(ICONS).map(function (ch) {
    var word = ICONS[ch][0], icon = ICONS[ch][1];
    return {
      id: 'abc-' + ch.toLowerCase(),
      name: ch + ' — ' + word,
      short: ch,
      emoji: ch,
      // the letters own the top band and the picture the middle — they
      // used to overlap, which made both harder to read
      art: function () {
        return [
          S.glyph(ch, 74, 38, 46),
          S.glyph(ch.toLowerCase(), 126, 41, 36),
          at(52, 70, 0.92, icon),
          S.glyph(word.toUpperCase(), 100, 182, word.length > 8 ? 16 : 21)
        ];
      }
    };
  });

  /* ------------------------------------------------------------------
     Counting 1–10
  ------------------------------------------------------------------ */
  var COUNT_SHAPES = [
    function (x, y, r) { return P.star(x, y, r); },
    function (x, y, r) { return P.heart(x, y, r); },
    function (x, y, r) { return P.flower(x, y, r * 0.6); },
    function (x, y, r) { return S.c(x, y, r * 0.9); },
    function (x, y, r) { return P.cloud(x, y, r * 0.7); }
  ];
  var COUNT_NAMES = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];

  var NUM = [];
  for (var k = 1; k <= 10; k++) {
    (function (num) {
      var shape = COUNT_SHAPES[(num - 1) % COUNT_SHAPES.length];
      NUM.push({
        id: 'count-' + num,
        name: 'Count ' + num,
        short: String(num),
        emoji: String(num),
        art: function () {
          var out = [S.glyph(String(num), 50, 50, 60), S.glyph(COUNT_NAMES[num - 1].toUpperCase(), 132, 48, 22)];
          var cols = num <= 3 ? num : (num <= 8 ? Math.ceil(num / 2) : 5);
          var rows = Math.ceil(num / cols);
          var cw = 150 / cols, ch = Math.min(56, 100 / rows), r = Math.min(cw, ch) * 0.38;
          var i, cx, cy, c, rw;
          for (i = 0; i < num; i++) {
            rw = Math.floor(i / cols);
            c = i % cols;
            var inRow = Math.min(cols, num - rw * cols);
            cx = 100 - (inRow - 1) * cw / 2 + c * cw;
            cy = 102 + rw * ch + (rows === 1 ? 14 : 0);
            out.push(shape(cx, cy, r));
          }
          out.push(S.p('M22,178 L178,178'));
          return out;
        }
      });
    })(k);
  }

  /* ------------------------------------------------------------------
     Add & Colour
  ------------------------------------------------------------------ */
  var SUMS = [[1, 1], [2, 1], [2, 2], [3, 2], [4, 1], [3, 3], [5, 2], [4, 4]];
  var ADD = SUMS.map(function (s, i) {
    var a = s[0], b = s[1];
    return {
      id: 'add-' + a + '-' + b,
      name: a + ' + ' + b,
      short: a + '+' + b,
      emoji: '➕',
      art: function () {
        var out = [], j, shape = COUNT_SHAPES[i % COUNT_SHAPES.length];
        function row(count, x0, x1, y) {
          var cw = (x1 - x0) / Math.max(count, 1), r = Math.min(cw * 0.4, 15);
          for (var m = 0; m < count; m++) out.push(shape(x0 + cw * (m + 0.5), y, r));
        }
        row(a, 20, 20 + a * 20, 46);
        out.push(S.glyph('+', 100, 44, 34));
        row(b, 116, 116 + b * 20, 46);
        out.push(S.glyph(String(a), 40, 92, 42));
        out.push(S.glyph('+', 78, 92, 34));
        out.push(S.glyph(String(b), 114, 92, 42));
        out.push(S.glyph('=', 152, 92, 34));
        out.push(S.r(60, 120, 80, 56, 12));
        out.push(S.glyph('?', 100, 149, 36));
        out.push(S.hair('M74,182 L126,182'));
        return out;
      }
    };
  });

  /* ------------------------------------------------------------------
     Colour by number mosaics
  ------------------------------------------------------------------ */
  function mosaic(id, name, emoji, grid, keys) {
    return {
      id: id, name: name, emoji: emoji, stroke: 2.4,
      art: function () {
        var out = [], W = grid[0].length, H = grid.length;
        var cell = Math.min(156 / W, 116 / H);
        var x0 = 100 - W * cell / 2, y0 = 58;
        var r, c, ch;
        for (r = 0; r < H; r++) {
          for (c = 0; c < W; c++) {
            ch = grid[r][c];
            if (ch === '.') continue;
            out.push(S.r(x0 + c * cell, y0 + r * cell, cell, cell, cell * 0.14));
            out.push(S.glyph(ch, x0 + c * cell + cell / 2, y0 + r * cell + cell / 2, cell * 0.52, 600));
          }
        }
        keys.forEach(function (kk, i) {
          var kx = 100 - (keys.length - 1) * 42 / 2 + i * 42;
          out.push(S.c(kx, 26, 15));
          out.push(S.glyph(kk, kx, 27, 18, 600));
        });
        out.push(S.hair('M22,44 L178,44'));
        out.push(S.glyph(name.toUpperCase(), 100, 182, 16));
        return out;
      }
    };
  }

  var MOSAIC = [
    mosaic('cbn-heart', 'Heart', '💗', [
      '.11.11',
      '122221',
      '122221',
      '.1221.',
      '..11..'
    ], ['1', '2']),
    mosaic('cbn-star', 'Star', '⭐', [
      '..11..',
      '.1221.',
      '122221',
      '.1221.',
      '.1..1.'
    ], ['1', '2']),
    mosaic('cbn-fish', 'Fish', '🐟', [
      '.1111.',
      '122231',
      '122231',
      '.1111.'
    ], ['1', '2', '3']),
    mosaic('cbn-tree', 'Tree', '🌲', [
      '..11..',
      '.1221.',
      '122221',
      '..33..',
      '..33..'
    ], ['1', '2', '3'])
  ];

  /* ------------------------------------------------------------------
     Shapes
  ------------------------------------------------------------------ */
  function shapePage(id, label, emoji, draw) {
    return {
      id: 'shape-' + id, name: label, emoji: emoji,
      art: function () {
        return [draw(), S.glyph(label.toUpperCase(), 100, 172, 24)];
      }
    };
  }
  var SHAPE = [
    shapePage('circle', 'Circle', '⭕', function () { return S.c(100, 84, 62); }),
    shapePage('square', 'Square', '🟦', function () { return S.r(40, 24, 120, 120, 8); }),
    shapePage('triangle', 'Triangle', '🔺', function () { return S.p('M100,20 L168,144 L32,144 Z'); }),
    shapePage('star', 'Star', '⭐', function () { return P.star(100, 84, 64); }),
    shapePage('heart', 'Heart', '❤️', function () { return P.heart(100, 88, 52); }),
    shapePage('diamond', 'Diamond', '🔷', function () { return S.p('M100,18 L166,84 L100,150 L34,84 Z'); }),
    shapePage('oval', 'Oval', '🥚', function () { return S.e(100, 84, 66, 48); }),
    shapePage('rectangle', 'Rectangle', '▬', function () { return S.r(24, 40, 152, 88, 8); })
  ];

  function reg(list, id, name, emoji, color) {
    list.forEach(function (p) { p.cat = id; Art.pages[p.id] = p; });
    Art.categories.push({ id: id, name: name, emoji: emoji, color: color, pages: list });
  }

  reg(ABC, 'abc', 'ABC', '🔤', '#EF4444');
  reg(NUM, 'count', 'Numbers', '🔢', '#0EA5E9');
  reg(SHAPE, 'shape', 'Shapes', '🔶', '#A855F7');
  reg(ADD, 'add', 'Add & Color', '➕', '#14B8A6');
  reg(MOSAIC, 'cbn', 'Color by Number', '🎨', '#F97316');
})(window.Art);
