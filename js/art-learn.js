/* Amelia Colors — learning pages: ABC, counting, shapes, math */
(function (Art) {
  'use strict';
  var S = Art.S, P = Art.Parts;

  // place a 0..100 mini drawing anywhere on the board
  function at(x, y, s, content) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + s + ')" stroke-width="' +
      (Math.round((3.2 / s) * 100) / 100) + '">' + content + '</g>';
  }

  /* ------------------------------------------------------------------
     A–Z : big letter pair, a picture, and the word
  ------------------------------------------------------------------ */
  var ICONS = {
    A: ['Apple', S.p('M50,26 C42,14 22,14 14,30 C4,50 12,80 26,92 C34,100 44,100 50,94 C56,100 66,100 74,92 C88,80 96,50 86,30 C78,14 58,14 50,26 Z') +
        S.p('M50,24 L50,8') + S.p('M52,14 C62,2 82,2 86,12 C76,24 58,24 52,14 Z')],
    B: ['Ball', S.c(50, 54, 42) + S.p('M14,38 C36,28 64,28 86,38') + S.p('M14,70 C36,80 64,80 86,70') + S.p('M50,12 C40,34 40,74 50,96')],
    C: ['Cat', S.c(50, 56, 36) + S.p('M26,32 L20,4 L46,22 Z') + S.p('M74,32 L80,4 L54,22 Z') +
        P.eye(38, 50, 8) + P.eye(62, 50, 8) + S.inkP('M44,66 L56,66 L50,74 Z') + P.smile(43, 80, 7) + P.smile(57, 80, 7)],
    D: ['Dog', S.c(50, 54, 34) + S.e(14, 58, 13, 24, 10) + S.e(86, 58, 13, 24, -10) +
        S.e(50, 72, 20, 15) + S.e(50, 64, 8, 6) + S.dot(50, 64, 4) + P.eye(38, 46, 7) + P.eye(62, 46, 7)],
    E: ['Elephant', S.c(58, 48, 34) + S.e(24, 48, 22, 26, -8) + S.p('M74,66 C82,84 78,100 66,100 C60,100 58,94 62,90') + P.eye(66, 38, 6)],
    F: ['Fish', S.e(46, 54, 38, 30) + S.p('M84,54 L100,32 L96,54 L100,78 Z') + P.eye(26, 46, 7) +
        S.c(52, 42, 8) + S.c(64, 58, 8) + S.c(46, 68, 8) + S.p('M40,26 L48,10 L60,30')],
    G: ['Grapes', S.c(50, 20, 13) + S.c(32, 42, 13) + S.c(68, 42, 13) + S.c(50, 46, 13) +
        S.c(40, 68, 13) + S.c(62, 68, 13) + S.c(50, 90, 12) + S.p('M50,8 L54,-4') + S.p('M54,0 C66,-8 78,-4 82,4')],
    H: ['House', S.p('M18,96 L18,46 L82,46 L82,96 Z') + S.p('M8,50 L50,10 L92,50 Z') +
        S.p('M38,96 L38,64 L62,64 L62,96 Z') + S.r(22, 56, 12, 12, 2) + S.r(66, 56, 12, 12, 2)],
    I: ['Ice Cream', S.p('M28,44 L72,44 L50,98 Z') + S.p('M36,64 L64,64') +
        S.c(38, 32, 18) + S.c(62, 32, 18) + S.c(50, 16, 15) + S.c(50, 0, 6)],
    J: ['Jellyfish', S.p('M14,52 C14,26 30,10 50,10 C70,10 86,26 86,52 Z') +
        P.eye(38, 38, 7) + P.eye(62, 38, 7) +
        S.p('M22,54 C18,72 26,86 20,98') + S.p('M38,54 C34,74 42,88 36,100') +
        S.p('M62,54 C66,74 58,88 64,100') + S.p('M78,54 C82,72 74,86 80,98')],
    K: ['Kite', S.p('M50,2 L92,50 L50,98 L8,50 Z') + S.p('M50,2 L50,98 M8,50 L92,50') +
        S.p('M50,98 C58,108 42,116 50,126 C58,136 42,144 50,152')],
    L: ['Leaf', S.p('M50,4 C86,26 90,72 50,98 C10,72 14,26 50,4 Z') + S.p('M50,10 L50,96') +
        S.hair('M50,32 L28,24 M50,32 L72,24 M50,54 L26,48 M50,54 L74,48 M50,76 L32,72 M50,76 L68,72')],
    M: ['Moon', S.p('M66,6 C36,6 14,30 14,54 C14,78 36,98 66,98 C74,98 82,96 88,94 C64,86 50,72 50,52 C50,32 64,16 88,10 C82,8 74,6 66,6 Z') +
        S.c(38, 34, 7) + S.c(30, 60, 9) + S.c(46, 80, 6)],
    N: ['Nest', S.p('M6,60 C6,44 26,34 50,34 C74,34 94,44 94,60 C94,80 76,92 50,92 C24,92 6,80 6,60 Z') +
        S.e(34, 44, 15, 12) + S.e(66, 44, 15, 12) + S.e(50, 34, 15, 12) +
        S.hair('M12,64 L88,60 M14,76 L86,72')],
    O: ['Owl', S.p('M50,10 C24,10 12,34 12,58 C12,82 28,98 50,98 C72,98 88,82 88,58 C88,34 76,10 50,10 Z') +
        S.c(36, 48, 15) + S.c(64, 48, 15) + P.eye(36, 48, 8) + P.eye(64, 48, 8) +
        S.p('M50,56 L42,66 L50,74 L58,66 Z') + S.p('M28,80 L24,96 M50,84 L50,98 M72,80 L76,96')],
    P: ['Pig', S.e(50, 58, 40, 34) + S.p('M22,32 L14,8 L40,22 Z') + S.p('M78,32 L86,8 L60,22 Z') +
        S.e(50, 70, 18, 14) + S.dot(44, 70, 4) + S.dot(56, 70, 4) + P.eye(34, 44, 7) + P.eye(66, 44, 7)],
    Q: ['Queen', S.p('M16,84 L6,20 L34,44 L50,4 L66,44 L94,20 L84,84 Z') + S.p('M16,84 L84,84 L84,98 L16,98 Z') +
        S.c(6, 14, 6) + S.c(50, 0, 6) + S.c(94, 14, 6) + S.c(50, 62, 9) + S.c(30, 64, 7) + S.c(70, 64, 7)],
    R: ['Rainbow', S.p('M8,86 A42,42 0 0 1 92,86') + S.p('M20,86 A30,30 0 0 1 80,86') +
        S.p('M32,86 A18,18 0 0 1 68,86') + S.p('M44,86 L56,86') + P.cloud(14, 84, 12) + P.cloud(86, 84, 12)],
    S: ['Sun', S.c(50, 50, 30) + (function () {
      var o = '', i, a; for (i = 0; i < 10; i++) { a = (Math.PI * 2 / 10) * i;
        o += S.l(50 + Math.cos(a) * 34, 50 + Math.sin(a) * 34, 50 + Math.cos(a) * 48, 50 + Math.sin(a) * 48); }
      return o; })() + P.eye(41, 44, 6) + P.eye(59, 44, 6) + P.smile(50, 58, 11)],
    T: ['Tree', S.p('M40,98 L40,58 L60,58 L60,98 Z') +
        S.c(50, 34, 30) + S.c(26, 48, 18) + S.c(74, 48, 18) +
        S.c(38, 30, 7) + S.c(62, 38, 7) + S.c(50, 54, 6)],
    U: ['Umbrella', S.p('M4,54 C4,26 24,6 50,6 C76,6 96,26 96,54 C86,44 78,44 72,54 C64,44 54,44 50,54 C44,44 34,44 28,54 C22,44 14,44 4,54 Z') +
        S.p('M50,54 L50,88 C50,98 38,100 34,92')],
    V: ['Van', S.p('M8,80 L8,44 C8,38 12,34 18,34 L64,34 C72,34 78,38 82,44 L92,60 C95,64 96,70 96,76 L96,80 Z') +
        S.p('M16,42 L40,42 L40,60 L16,60 Z') + S.p('M50,42 L66,42 L76,60 L50,60 Z') +
        S.c(28, 82, 13) + S.c(76, 82, 13) + S.c(28, 82, 5) + S.c(76, 82, 5)],
    W: ['Whale', S.p('M8,58 C8,36 28,22 54,22 C78,22 92,34 96,50 L100,32 C102,50 100,66 96,74 L88,60 C80,74 62,82 46,82 C24,82 8,72 8,58 Z') +
        S.p('M10,64 C28,74 74,76 96,64') + P.eye(28, 50, 6) +
        S.p('M40,22 C38,10 42,2 50,-4 C58,2 62,10 60,22')],
    X: ['Xylophone', S.p('M10,26 L90,18 L94,42 L14,52 Z') +
        S.p('M10,26 L14,52 M30,24 L34,50 M50,22 L54,48 M70,20 L74,46') +
        S.p('M30,64 L74,70 M70,66 C78,64 84,68 84,74 C84,80 76,82 72,76')],
    Y: ['Yarn', S.c(50, 54, 40) + S.p('M18,32 C40,44 56,64 64,90') + S.p('M32,18 C52,32 72,54 82,74') +
        S.p('M74,22 C60,44 46,64 26,78') + S.p('M88,44 C74,62 62,76 46,90') +
        S.p('M50,14 C36,4 22,4 14,12 C22,18 30,20 38,18')],
    Z: ['Zebra', S.c(50, 54, 34) + S.p('M26,30 L20,6 L44,22 Z') + S.p('M74,30 L80,6 L56,22 Z') +
        S.p('M32,30 L40,54 M50,20 L50,44 M68,30 L60,54') +
        P.eye(38, 54, 7) + P.eye(62, 54, 7) + S.e(50, 76, 16, 12) + S.dot(44, 76, 3) + S.dot(56, 76, 3)]
  };

  var ABC = Object.keys(ICONS).map(function (ch) {
    var word = ICONS[ch][0], icon = ICONS[ch][1];
    return {
      id: 'abc-' + ch.toLowerCase(),
      name: ch + ' — ' + word,
      short: ch,
      emoji: ch,
      art: function () {
        return [
          S.glyph(ch, 72, 44, 56),
          S.glyph(ch.toLowerCase(), 126, 48, 44),
          at(54, 62, 0.9, icon),
          S.glyph(word.toUpperCase(), 100, 174, word.length > 8 ? 16 : 21)
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
