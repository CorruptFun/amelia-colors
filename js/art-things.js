/* Amelia Colors — vehicles, nature, space, treats and fun stuff
   Same house rules as the animals and cars: strict back-to-front order,
   nothing draws through anything, markings stay inside their host shape. */
(function (Art) {
  'use strict';
  var S = Art.S, P = Art.Parts, Sc = Art.Scene;
  var B = S.bold, TH = S.thinW, HA = S.hairW;
  var behind = Art.behind, inside = Art.inside;
  function mark(shape, parts) { return inside(shape, parts, 2.6); }
  /* Was 0.88/12/12 — a file-wide 12% shrink that left every page in here
     visibly smaller than an animals page sitting next to it in the picker. */
  function fit(parts) { return Art.fit(0.97, 3, 3, parts); }

  /* A surface for the treats to sit on — the food equivalent of the animals'
     ground(). Always masked by the subject so it never crosses it. */
  function table(y, sil) { return behind(sil, Sc.horizon(y)); }

  /* Diagonal lattice for waffle cones. `step` is deliberately loose: tighten it
     and the diamonds stop being big enough to tap, which is how a page turns
     into a field of slivers. */
  function lattice(x0, y0, x1, y1, step) {
    var out = '', t, d = y1 - y0;
    for (t = x0 - d; t <= x1 + d; t += (step || 22)) {
      out += S.l(t, y0, t + d, y1) + S.l(t + d, y0, t, y1);
    }
    return out;
  }

  function wheel(cx, cy, r, spokes) {
    var out = S.c(cx, cy, r) + S.c(cx, cy, r * 0.55) + S.c(cx, cy, r * 0.18), i, a, k = spokes || 6;
    for (i = 0; i < k; i++) {
      a = (Math.PI * 2 / k) * i;
      out += S.l(cx + Math.cos(a) * r * 0.22, cy + Math.sin(a) * r * 0.22,
        cx + Math.cos(a) * r * 0.52, cy + Math.sin(a) * r * 0.52);
    }
    return out;
  }
  function treads(cx, cy, r) {
    var out = '', i, a;
    for (i = 0; i < 14; i++) {
      a = (Math.PI * 2 / 14) * i;
      out += S.l(cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8,
        cx + Math.cos(a) * r * 0.98, cy + Math.sin(a) * r * 0.98);
    }
    return out;
  }
  // tyres as an occluder, so the chassis line never runs across them
  function tyreSil(list) {
    return list.map(function (w) { return S.c(w[0], w[1], w[2]); }).join('');
  }

  /* ---------------- Things that go ---------------- */
  var GO = [
    { id: 'tractor', name: 'Tractor', emoji: '🚜', art: function () {
      var W = [[62, 132, 38], [158, 142, 24]];
      var t = tyreSil(W);
      var body = S.p('M36,124 L36,96 L82,96 L82,70 C82,64 86,60 92,60 L124,60 C130,60 134,64 134,70 L134,96 L172,96 L172,124 Z');
      var pipe = S.p('M70,96 L70,52 L80,52 L80,96 Z');
      return [fit([
        behind(t + body, S.hair('M6,180 Q30,172 54,180 T102,180 T150,180 T196,180')),
        behind(body, S.bold(pipe)) ,
        S.p('M68,50 L82,50 L82,44 L68,44 Z'),
        behind(t, B(body) + S.p('M90,68 L126,68 L126,90 L90,90 Z') + S.l(108, 68, 108, 90) +
          S.r(160, 94, 14, 10, 3) + S.p('M136,100 L166,100')),
        wheel(62, 132, 38, 8), treads(62, 132, 38),
        wheel(158, 142, 24, 6), treads(158, 142, 24)
      ])];
    } },

    { id: 'firetruck', name: 'Fire Truck', emoji: '🚒', art: function () {
      var W = [[38, 138, 22], [158, 138, 22]];
      var t = tyreSil(W);
      return [fit([
        behind(t, B(S.p('M10,132 L10,84 L108,84 L108,132 Z')) +
          B(S.p('M114,132 L114,92 C114,86 118,82 124,82 L146,82 L166,104 L186,110 C191,112 192,116 192,124 L192,132 Z')) +
          S.p('M124,90 L144,90 L156,104 L124,104 Z') +
          S.p('M18,92 L100,92 L100,112 L18,112 Z') +
          S.p('M40,92 L40,112 M62,92 L62,112 M82,92 L82,112') +
          S.p('M14,72 L104,72 L104,82 L14,82 Z') +
          S.p('M20,66 L34,66 L34,72 L20,72 Z') + S.p('M84,66 L98,66 L98,72 L84,72 Z') +
          S.p('M12,62 L106,62 M12,62 L12,56 M106,62 L106,56') +
          S.r(182, 116, 10, 9, 3)),
        wheel(38, 138, 22), wheel(158, 138, 22),
        behind(t, S.p('M4,166 L196,166'))
      ])];
    } },

    { id: 'train', name: 'Train', emoji: '🚂', art: function () {
      var W = [[40, 148, 20], [88, 148, 16], [128, 148, 16]];
      var t = tyreSil(W);
      var body = S.p('M14,140 L14,88 L84,88 L84,58 C84,52 88,48 94,48 L142,48 C148,48 152,52 152,58 L152,140 Z');
      var funnel = S.p('M30,60 L54,60 L58,88 L26,88 Z');
      return [fit([
        behind(body + t, P.cloud(50, 26, 15) + P.cloud(96, 16, 12) + P.cloud(134, 28, 10)),
        behind(body, funnel + S.p('M26,54 L58,54 L58,60 L26,60 Z')),
        behind(t, B(body) +
          S.p('M94,58 L142,58 L142,86 L94,86 Z') + S.l(118, 58, 118, 86) +
          S.p('M14,132 L152,132') +
          S.p('M152,120 L184,120 L184,140 L152,140 Z')),
        mark(body, S.c(48, 112, 18)),
        wheel(40, 148, 20), wheel(88, 148, 16), wheel(128, 148, 16),
        behind(t, S.p('M4,170 L196,170'))
      ])];
    } },

    { id: 'airplane', name: 'Airplane', emoji: '✈️', art: function () {
      var body = S.p('M22,104 C22,90 40,80 66,78 L150,72 C172,71 186,80 186,92 C186,104 172,113 150,112 L66,110 C40,110 22,118 22,104 Z');
      var wingUp = S.p('M62,80 L34,34 L58,34 L100,76 Z');
      var wingDn = S.p('M62,108 L44,148 L64,148 L98,112 Z');
      var tail = S.p('M28,96 L4,72 L18,70 L44,88 Z');
      return [fit([
        behind(body, P.cloud(40, 168, 16) + P.cloud(150, 160, 14) + P.cloud(110, 178, 11)),
        behind(body, B(wingUp + wingDn + tail)),
        B(body),
        mark(body, S.c(70, 92, 7) + S.c(92, 90, 7) + S.c(114, 88, 7) + S.c(136, 86, 7)),
        mark(body, S.p('M168,80 C180,82 186,86 186,92 C186,98 180,102 170,104'))
      ])];
    } },

    { id: 'boat', name: 'Sail Boat', emoji: '⛵', art: function () {
      var hull = S.p('M20,132 L180,132 L156,166 L44,166 Z');
      var sailL = S.p('M96,28 L36,124 L96,124 Z');
      var sailR = S.p('M106,44 L162,124 L106,124 Z');
      var mast = S.p('M97,20 L103,20 L103,128 L97,128 Z');
      return [fit([
        behind(hull, S.hair('M4,176 Q28,168 52,176 T100,176 T148,176 T196,176') +
          S.hair('M12,190 Q36,182 60,190 T108,190 T156,190')),
        behind(hull + sailL + sailR, mast),
        B(sailL), B(sailR),
        S.p('M100,20 L128,26 L100,32 Z'),
        B(hull),
        mark(hull, S.p('M40,140 L160,140') +
          S.c(62, 150, 8) + S.c(100, 150, 8) + S.c(138, 150, 8)),
        mark(sailL, TH(S.p('M44,88 L100,88') + S.p('M64,58 L100,58'))),
        mark(sailR, TH(S.p('M100,88 L152,88') + S.p('M100,62 L134,62'))),
        S.c(160, 40, 16), S.hair('M160,16 L160,4 M180,24 L190,16 M184,40 L196,40')
      ])];
    } },

    { id: 'schoolbus', name: 'School Bus', emoji: '🚌', art: function () {
      var W = [[52, 138, 22], [154, 138, 22]];
      var t = tyreSil(W);
      var body = S.p('M12,132 L12,74 C12,68 16,64 22,64 L150,64 C160,64 168,68 174,78 L186,98 C190,104 192,110 192,118 L192,132 Z');
      return [fit([
        behind(t, B(body)),
        mark(body, S.p('M22,76 L46,76 L46,104 L22,104 Z') +
          S.p('M56,76 L80,76 L80,104 L56,104 Z') +
          S.p('M90,76 L114,76 L114,104 L90,104 Z') +
          S.p('M124,76 L148,76 L148,104 L124,104 Z') +
          S.p('M158,80 L174,80 L184,98 L158,98 Z') +
          S.p('M12,114 L192,114')),
        behind(t, S.r(180, 100, 10, 9, 3)),
        wheel(52, 138, 22), wheel(154, 138, 22),
        behind(t, S.p('M4,166 L196,166'))
      ])];
    } },

    { id: 'digger', name: 'Digger', emoji: '🚧', art: function () {
      // rebuilt: tracks, a cab, one clear arm and a bucket. The old
      // version was a tangle of bars with no readable machine in it.
      var track = S.p('M22,146 C22,138 28,134 38,134 L162,134 C172,134 178,138 178,146 ' +
        'C178,158 172,164 162,164 L38,164 C28,164 22,158 22,146 Z');
      var body = S.p('M46,134 L46,104 L152,104 L152,134 Z');
      var cab = S.p('M100,104 L100,56 C100,50 104,46 110,46 L146,46 C152,46 156,50 156,56 L156,104 Z');
      var arm = P.ribbon([[102, 118, 11], [70, 100, 10], [42, 80, 9]]);
      // an open scoop hanging off the arm — the old one read as a leaf
      var bucket = S.p('M34,66 C16,74 8,92 18,106 L50,98 C42,88 38,76 44,66 Z');
      return [fit([
        behind(body + cab, arm),
        behind(arm, bucket),
        mark(bucket, S.p('M20,98 L28,112 M30,95 L38,109 M40,92 L48,106')),
        behind(cab, B(body)),
        B(cab),
        mark(cab, S.p('M108,56 L148,56 L148,86 L108,86 Z') + S.l(128, 56, 128, 86) +
          S.l(108, 71, 148, 71)),
        behind(body + cab, B(track)),
        mark(track, S.c(46, 149, 11) + S.c(100, 149, 11) + S.c(154, 149, 11)),
        behind(track, S.p('M4,182 L196,182'))
      ])];
    } },

    { id: 'rocket', name: 'Rocket', emoji: '🚀', art: function () {
      var body = S.p('M100,10 C122,34 134,66 134,102 L134,140 L66,140 L66,102 C66,66 78,34 100,10 Z');
      var finL = S.p('M66,110 L40,152 L66,140 Z'), finR = S.p('M134,110 L160,152 L134,140 Z');
      var skirt = S.p('M66,140 L134,140 L124,158 L76,158 Z');
      var flame = S.p('M84,158 C84,182 92,196 100,200 C108,196 116,182 116,158 Z');
      return [fit([
        behind(body, B(finL + finR)),
        B(body),
        mark(body, S.c(100, 66, 20) + S.c(100, 66, 13)),
        behind(skirt, B(flame)),
        B(skirt),
        mark(flame, S.p('M94,160 C94,176 98,188 100,192 C102,188 106,176 106,160')),
        behind(body + finL + finR, P.star(28, 40, 11) + P.star(170, 32, 9) +
          P.star(20, 108, 8) + P.star(178, 100, 10))
      ])];
    } }
  ];

  /* ---------------- Nature ---------------- */
  var NAT = [
    { id: 'flower', name: 'Flower', emoji: '🌸', art: function () {
      var mid = S.c(100, 62, 17);
      var petals = (function () {
        var out = '', i, a, r = 36;
        for (i = 0; i < 6; i++) {
          a = (Math.PI / 3) * i - Math.PI / 2;
          out += S.e(100 + Math.cos(a) * r, 62 + Math.sin(a) * r, 22, 15, a * 180 / Math.PI);
        }
        return out;
      })();
      var stem = S.p('M96,100 L104,100 L104,178 L96,178 Z');
      var leafL = S.p('M98,124 C74,110 46,116 34,134 C56,148 84,144 100,132 Z');
      var leafR = S.p('M100,148 C126,134 154,140 166,158 C144,172 116,168 100,156 Z');
      return [fit([
        // each petal is tucked under its neighbour and under the middle,
        // so the flower does not turn into a lattice
        (function () {
          var out = '', i, a, r = 36, list = [];
          for (i = 0; i < 6; i++) {
            a = (Math.PI / 3) * i - Math.PI / 2;
            list.push(S.e(100 + Math.cos(a) * r, 62 + Math.sin(a) * r, 22, 15, a * 180 / Math.PI));
          }
          for (i = 0; i < 6; i++) out += behind(list.slice(0, i).join('') + mid, B(list[i]));
          return out;
        })(),
        B(mid),
        behind(stem, leafL + leafR),
        behind(petals + mid, stem),
        S.p('M40,178 L160,178'),
        S.hair('M60,178 C60,166 66,158 74,154 M140,178 C140,166 134,158 126,154'),
        behind(petals + stem, S.c(30, 40, 8) + S.c(170, 46, 6))
      ])];
    } },

    { id: 'tree', name: 'Apple Tree', emoji: '🌳', art: function () {
      var canopy = S.p('M84,178 L84,116 C70,120 56,112 56,98 C42,96 34,84 38,70 C30,58 36,42 50,38 C56,22 76,16 90,26 C102,12 126,14 134,30 C152,28 164,44 158,60 C170,70 168,90 154,96 C152,112 136,120 122,114 L122,178 Z');
      return [fit([
        B(canopy),
        mark(canopy, S.c(72, 62, 10) + S.c(112, 48, 10) + S.c(140, 74, 10) +
          S.c(94, 86, 10) + S.c(128, 100, 9) + S.c(56, 92, 9) + S.c(104, 116, 9) +
          S.c(150, 50, 8) + S.p('M84,140 C96,144 110,144 122,140') + S.p('M84,158 C96,162 110,162 122,158')),
        behind(canopy, S.p('M30,178 L170,178') + S.c(58, 168, 9) + S.c(150, 170, 9) +
          S.hair('M40,178 Q46,168 52,178 M156,178 Q162,168 168,178'))
      ])];
    } },

    { id: 'sun', name: 'Happy Sun', emoji: '☀️', art: function () {
      var disc = S.c(100, 100, 56);
      var rays = (function () {
        var out = '', i, a, r1 = 50, r2 = 88;
        for (i = 0; i < 12; i++) {
          a = (Math.PI * 2 / 12) * i;
          var a1 = a - 0.17, a2 = a + 0.17;
          out += S.p('M' + Math.round(100 + Math.cos(a1) * r1) + ',' + Math.round(100 + Math.sin(a1) * r1) +
            ' L' + Math.round(100 + Math.cos(a) * r2) + ',' + Math.round(100 + Math.sin(a) * r2) +
            ' L' + Math.round(100 + Math.cos(a2) * r1) + ',' + Math.round(100 + Math.sin(a2) * r1) + ' Z');
        }
        return out;
      })();
      return [fit([
        behind(disc, rays),
        B(disc),
        P.eye(82, 88, 10), P.eye(118, 88, 10),
        P.smile(100, 114, 20),
        S.c(70, 118, 8), S.c(130, 118, 8)
      ])];
    } },

    { id: 'rainbow', name: 'Rainbow', emoji: '🌈', art: function () {
      var cloudL = P.cloud(38, 146, 24), cloudR = P.cloud(162, 146, 24);
      var arcs = (function () {
        var out = '', i, r;
        for (i = 0; i < 6; i++) {
          r = 88 - i * 12;
          out += (i ? function (x) { return x; } : B)(S.p('M' + (100 - r) + ',150 A' + r + ',' + r + ' 0 0 1 ' + (100 + r) + ',150'));
        }
        return out + S.p('M88,150 L112,150');
      })();
      return [fit([
        behind(cloudL + cloudR, arcs),
        cloudL, cloudR,
        behind(arcs + cloudL + cloudR, P.star(100, 26, 11) + S.c(30, 60, 6) + S.c(172, 66, 5) +
          S.e(44, 40, 13, 8, -18) + S.e(158, 34, 13, 8, 16) + S.e(74, 20, 11, 7, -10)),
        behind(cloudL + cloudR, S.p('M4,186 L196,186'))
      ])];
    } },

    { id: 'mushroom', name: 'Mushroom', emoji: '🍄', art: function () {
      var cap = S.p('M18,104 C18,64 54,36 100,36 C146,36 182,64 182,104 C182,112 174,116 160,116 L40,116 C26,116 18,112 18,104 Z');
      var stem = S.p('M70,112 L130,112 L130,166 C130,176 120,182 100,182 C80,182 70,176 70,166 Z');
      return [fit([
        behind(cap, B(stem)),
        B(cap),
        mark(cap, S.c(64, 74, 15) + S.c(122, 66, 13) + S.c(150, 92, 11) +
          S.c(88, 96, 10) + S.c(40, 100, 8) + S.c(104, 48, 9) + S.c(166, 66, 7)),
        P.eye(86, 140, 8), P.eye(114, 140, 8), P.smile(100, 156, 10),
        behind(stem, S.hair('M8,186 Q30,178 52,186 T96,186 T140,186 T192,186') +
          S.e(32, 180, 16, 7) + S.e(168, 180, 16, 7))
      ])];
    } },

    { id: 'snowman', name: 'Snowman', emoji: '⛄', art: function () {
      var base = S.c(100, 156, 40), mid = S.c(100, 100, 30), head = S.c(100, 58, 23);
      var brim = S.p('M74,42 L126,42 L126,34 L74,34 Z');
      var top = S.p('M82,34 L118,34 L118,8 L82,8 Z');
      var armL = P.ribbon([[76, 96, 4], [50, 84, 3.5], [28, 74, 3]]);
      var armR = P.ribbon([[124, 96, 4], [150, 84, 3.5], [172, 74, 3]]);
      return [fit([
        behind(base + mid + head, armL + armR),
        S.p('M28,74 L18,66 M28,74 L18,82 M172,74 L182,66 M172,74 L182,82'),
        behind(mid, B(base)), behind(head, B(mid)),
        behind(brim, B(head)),
        behind(top, B(brim)), B(top),
        mark(base, S.c(100, 146, 8) + S.c(100, 168, 8)),
        mark(mid, S.c(100, 92, 7) + S.c(100, 112, 7)),
        P.eye(92, 52, 6), P.eye(108, 52, 6),
        S.p('M100,56 L126,63 L100,70 Z'),
        S.dot(88, 70, 2), S.dot(100, 74, 2), S.dot(112, 70, 2),
        behind(base + mid + head + armL + armR,
          P.star(24, 24, 7) + P.star(178, 30, 6) + P.star(16, 130, 6) + P.star(186, 140, 7))
      ])];
    } },

    { id: 'raincloud', name: 'Rainy Day', emoji: '🌧️', art: function () {
      var cloud = P.cloud(100, 56, 42);
      var puddle = S.e(100, 176, 62, 12);
      function drop(x, y, s) {
        return S.p('M' + x + ',' + (y - 14 * s) + ' C' + (x - 8 * s) + ',' + (y - 2 * s) +
          ' ' + (x - 7 * s) + ',' + (y + 8 * s) + ' ' + x + ',' + (y + 8 * s) +
          ' C' + (x + 7 * s) + ',' + (y + 8 * s) + ' ' + (x + 8 * s) + ',' + (y - 2 * s) +
          ' ' + x + ',' + (y - 14 * s) + ' Z');
      }
      return [fit([
        cloud,
        behind(cloud + puddle, drop(56, 120, 1) + drop(100, 134, 1.1) + drop(144, 118, 1) +
          drop(38, 152, 0.8) + drop(164, 150, 0.8) + drop(78, 158, 0.7) + drop(122, 160, 0.7) +
          drop(20, 122, 0.7) + drop(100, 100, 0.8) + drop(182, 122, 0.7)),
        B(puddle),
        mark(puddle, S.hair('M70,178 Q84,172 98,178 T126,178')),
        S.hair('M8,192 L192,192')
      ])];
    } },

    { id: 'castle', name: 'Castle', emoji: '🏰', art: function () {
      var keep = S.p('M40,180 L40,84 L160,84 L160,180 Z');
      var towerL = S.p('M14,180 L14,68 L54,68 L54,180 Z');
      var towerR = S.p('M146,180 L146,68 L186,68 L186,180 Z');
      var roofL = S.p('M14,68 L34,26 L54,68 Z'), roofR = S.p('M146,68 L166,26 L186,68 Z');
      var roofM = S.p('M76,88 L124,88 L100,30 Z');
      var door = S.p('M82,180 L82,130 C82,116 118,116 118,130 L118,180 Z');
      return [fit([
        behind(keep + towerL + towerR, S.p('M4,180 L196,180')),
        behind(towerL + towerR + door, B(keep)),
        mark(keep, S.p('M40,96 L40,84 L52,84 L52,96 M64,96 L64,84 L76,84 L76,96 ' +
          'M124,96 L124,84 L136,84 L136,96 M148,96 L148,84 L160,84 L160,96')),
        behind(keep, roofM),
        B(towerL), B(towerR),
        B(roofL), B(roofR),
        behind(roofM, S.p('M100,30 L100,14 L128,20 L100,28')),
        behind(roofL, S.p('M34,26 L34,12 L58,17 L34,22')),
        behind(roofR, S.p('M166,26 L166,12 L190,17 L166,22')),
        B(door),
        mark(door, S.c(110, 150, 4)),
        mark(towerL, S.c(24, 96, 8) + S.c(44, 96, 8)),
        mark(towerR, S.c(156, 96, 8) + S.c(176, 96, 8)),
        mark(keep, S.p('M62,104 L78,104 L78,124 L62,124 Z') +
          S.p('M122,104 L138,104 L138,124 L122,124 Z'))
      ])];
    } }
  ];

  /* ---------------- Space ---------------- */
  var SPACE = [
    { id: 'astronaut', name: 'Astronaut', emoji: '👩‍🚀', art: function () {
      var helmet = S.c(100, 60, 36);
      var torso = S.p('M66,96 C66,86 78,80 100,80 C122,80 134,86 134,96 L134,146 C134,154 128,158 120,158 L80,158 C72,158 66,154 66,146 Z');
      var armL = P.ribbon([[70, 92, 11], [46, 112, 10], [38, 132, 9]]);
      var armR = P.ribbon([[130, 92, 11], [154, 112, 10], [162, 132, 9]]);
      var legL = S.p('M80,158 L80,190 L60,190 L60,196 L96,196 L96,158 Z');
      var legR = S.p('M120,158 L120,190 L140,190 L140,196 L104,196 L104,158 Z');
      return [fit([
        behind(torso + helmet, armL + armR),
        behind(torso, legL + legR),
        behind(helmet, B(torso)),
        B(helmet),
        mark(helmet, S.c(100, 60, 26)),
        mark(S.c(100, 60, 26), S.p('M84,52 C88,44 98,40 108,42')),
        mark(torso, S.c(100, 106, 10) + S.r(84, 122, 32, 14, 4)),
        behind(helmet + torso + armL + armR + legL + legR,
          P.star(24, 34, 11) + P.star(174, 44, 9) + P.star(30, 160, 8) + P.star(180, 152, 10))
      ])];
    } },

    { id: 'planet', name: 'Planet', emoji: '🪐', art: function () {
      var globe = S.c(100, 100, 52);
      var ring = S.e(100, 106, 90, 24, -16);
      // the far half of the ring passes behind the planet, the near
      // half in front — a single ellipse straight through reads as a
      // mistake
      return [fit([
        behind(globe, B(ring)),
        B(globe),
        mark(globe, S.c(78, 82, 11) + S.c(120, 96, 15) + S.c(90, 126, 10) + S.c(128, 132, 7)),
        inside(S.p('M10,106 L190,106 L190,196 L10,196 Z'), ring),
        behind(globe + ring, P.star(28, 30, 12) + P.star(172, 26, 9) +
          P.star(20, 170, 10) + P.star(178, 172, 8) +
          S.c(46, 60, 4) + S.c(158, 62, 4) + S.c(52, 148, 4) + S.c(150, 152, 4))
      ])];
    } },

    { id: 'ufo', name: 'Space Ship', emoji: '🛸', art: function () {
      var dome = S.p('M62,96 C62,68 82,52 100,52 C118,52 138,68 138,96 Z');
      var saucer = S.e(100, 100, 78, 24);
      var beam = S.p('M74,120 L44,190 L156,190 L126,120 Z');
      return [fit([
        behind(saucer, beam),
        behind(saucer, B(dome)),
        B(saucer),
        mark(saucer, S.c(60, 100, 8) + S.c(80, 106, 8) + S.c(100, 108, 8) +
          S.c(120, 106, 8) + S.c(140, 100, 8)),
        mark(beam, S.hair('M92,132 L92,182 M110,132 L110,182') +
          S.e(100, 150, 26, 7) + S.e(100, 172, 32, 8)),
        mark(dome, S.c(100, 78, 14)),
        behind(saucer + dome + beam, P.star(26, 40, 10) + P.star(176, 46, 9) + P.star(34, 150, 7))
      ])];
    } },

    { id: 'moon', name: 'Moon & Stars', emoji: '🌙', art: function () {
      var moon = S.p('M126,20 C88,20 58,50 58,88 C58,126 88,156 126,156 C136,156 146,154 154,150 C124,142 102,118 102,88 C102,58 124,34 154,26 C146,22 136,20 126,20 Z');
      return [fit([
        B(moon),
        mark(moon, S.c(84, 62, 9) + S.c(76, 100, 12) + S.c(96, 128, 7)),
        behind(moon, P.star(38, 30, 14) + P.star(170, 70, 12) + P.star(30, 150, 11) +
          P.star(160, 168, 10) + P.star(178, 24, 8) +
          S.c(20, 92, 5) + S.c(120, 180, 5) + S.c(66, 178, 4))
      ])];
    } }
  ];

  /* ---------------- Treats ---------------- */
  /* ---------------- Yummy ----------------
     Drawn to the animals standard: full board, bold outer contour, interior
     detail that ENCLOSES regions (every closed area is somewhere to tap), and
     scenery masked by the subject. No fit() wrapper — these fill the page.

     Two constraints learned by rendering these: keep art clear of the frame
     (it sits at 5..195, so nothing above ~12), and put the table line at 186
     like the animals' ground — any lower and it reads as a smudge against
     the border rather than a surface. */
  var YUM = [

    /* ------------------------------------------------------- ICE CREAM */
    { id: 'icecream', name: 'Ice Cream', emoji: '🍦', art: function () {
      var cone   = S.p('M50,110 L150,110 L100,180 Z');
      var scoopA = S.e(100, 88, 55, 32);
      var scoopB = S.e(100, 56, 40, 25);
      var cherry = S.c(100, 30, 12);
      var sil = cone + scoopA + scoopB + cherry;
      return [
        behind(sil, Sc.stars([[22, 46, 9], [178, 50, 8]])),
        // cone, with a waffle lattice that stops where the scoop covers it
        behind(scoopA, B(cone) + mark(cone, TH(lattice(50, 112, 150, 178, 26)))),
        // lower scoop + drips running over the rim
        behind(scoopB, B(scoopA) +
          mark(scoopA, TH(S.p('M62,102 C64,112 72,114 74,104') +
            S.p('M126,104 C128,116 136,116 138,106')))),
        behind(cherry, B(scoopB) + mark(scoopB, S.c(82, 52, 6) + S.c(114, 50, 6))),
        B(cherry),
        TH(S.p('M100,20 C107,12 118,13 122,19')),
        table(186, sil)
      ];
    } },

    /* --------------------------------------------------------- CUPCAKE */
    { id: 'cupcake', name: 'Cupcake', emoji: '🧁', art: function () {
      var cup    = S.p('M46,114 L154,114 L138,176 C136,182 130,184 122,184 L78,184 C70,184 64,182 62,176 Z');
      var frost  = S.p('M56,118 C38,118 32,94 48,86 C40,66 58,50 76,58 C82,34 118,30 126,56 ' +
        'C146,48 166,66 152,86 C170,96 162,118 144,118 Z');
      var cherry = S.c(100, 28, 12);
      var sil = cup + frost + cherry;
      return [
        behind(sil, Sc.stars([[20, 104, 9], [180, 108, 8]])),
        // wrapper: a rim band plus pleats, so the cup is several fillable strips
        behind(frost, B(cup) + mark(cup, TH(S.l(46, 132, 154, 132) +
          S.l(74, 132, 68, 182) + S.l(100, 132, 100, 184) + S.l(126, 132, 132, 182)))),
        behind(cherry, B(frost) + mark(frost,
          S.c(68, 96, 6) + S.c(100, 82, 6) + S.c(132, 96, 6) +
          S.c(84, 68, 5) + S.c(116, 66, 5) +
          TH(S.p('M46,104 C72,114 128,114 154,104') + S.p('M56,76 C76,86 124,86 144,76')))),
        B(cherry),
        TH(S.p('M100,18 C107,10 118,11 122,17')),
        table(190, sil)
      ];
    } },

    /* ----------------------------------------------------------- DONUT */
    { id: 'donut', name: 'Donut', emoji: '🍩', art: function () {
      var ring = S.c(100, 100, 80);
      var hole = S.c(100, 100, 30);
      /* Icing as a proper closed band: the ring's own top edge, then a run of
         drips back across the middle. Drawn as one shape so it encloses a
         region instead of reading as a stray squiggle. */
      var glaze = S.p('M20,100 A80,80 0 0 1 180,100 ' +
        'C172,118 164,102 156,120 C148,138 140,118 132,132 ' +
        'C124,146 116,124 108,138 C100,152 92,128 84,140 ' +
        'C76,152 68,126 60,138 C52,150 44,120 36,130 C28,140 24,114 20,100 Z');
      var sil = ring;
      return [
        behind(sil, Sc.stars([[18, 176, 9], [182, 178, 8]])),
        B(ring),
        behind(hole, B(glaze)),
        B(hole),
        // sprinkles sit only where there is icing to sit on
        // sprinkles as capsules rather than strokes — an open line adds ink but
        // no fill target, which is how this page had only five
        inside(glaze, behind(hole, TH(
          S.rr(50, 56, 16, 7, 3.5, -28) + S.rr(84, 42, 16, 7, 3.5, 34) +
          S.rr(116, 44, 16, 7, 3.5, -40) + S.rr(140, 62, 16, 7, 3.5, -20) +
          S.rr(42, 84, 16, 7, 3.5, -12) + S.rr(136, 88, 16, 7, 3.5, -16) +
          S.rr(88, 68, 16, 7, 3.5, -30) + S.rr(64, 100, 16, 7, 3.5, -18) +
          S.rr(112, 92, 16, 7, 3.5, -34)), 4), 3),
        mark(ring, TH(S.rr(36, 146, 15, 6, 3, -22) + S.rr(72, 160, 15, 6, 3, -20) +
          S.rr(112, 160, 15, 6, 3, -20) + S.rr(148, 144, 15, 6, 3, -24))),
        table(190, sil)
      ];
    } },

    /* ------------------------------------------------------ WATERMELON */
    { id: 'watermelon', name: 'Watermelon', emoji: '🍉', art: function () {
      var slice = S.p('M12,54 L188,54 C188,124 148,178 100,178 C52,178 12,124 12,54 Z');
      var pith  = S.p('M26,62 C26,120 58,166 100,166 C142,166 174,120 174,62 Z');
      var flesh = S.p('M38,68 C38,114 64,154 100,154 C136,154 162,114 162,68 Z');
      var sil = slice;
      return [
        behind(sil, Sc.stars([[26, 30, 9], [174, 28, 8]])),
        B(slice),
        pith,
        B(flesh),
        // outlined seeds, not solid ink — ten seeds is ten things to colour,
        // where S.dot() just painted them black
        mark(flesh, S.e(66, 86, 4, 5.5) + S.e(100, 82, 4, 5.5) + S.e(134, 86, 4, 5.5) +
          S.e(56, 112, 4, 5.5) + S.e(84, 108, 4, 5.5) + S.e(116, 108, 4, 5.5) +
          S.e(144, 112, 4, 5.5) + S.e(74, 134, 4, 5.5) + S.e(126, 134, 4, 5.5) +
          S.e(100, 146, 4, 5.5)),
        table(188, sil)
      ];
    } },

    /* ----------------------------------------------------------- PIZZA */
    { id: 'pizza', name: 'Pizza Slice', emoji: '🍕', art: function () {
      var slice = S.p('M100,14 L182,164 C140,182 60,182 18,164 Z');
      var crust = S.p('M24,152 C64,170 136,170 176,152 C179,158 182,164 182,164 ' +
        'C140,182 60,182 18,164 C18,164 21,158 24,152 Z');
      var sil = slice;
      return [
        behind(sil, Sc.stars([[24, 48, 9], [176, 52, 8]])),
        behind(crust, B(slice)),
        // toppings kept well inside the slice so none breaks its edge
        behind(crust, B(S.c(100, 84, 15) + S.c(72, 124, 14) + S.c(128, 128, 14) +
          S.c(100, 146, 12) + S.c(96, 52, 10) + S.c(48, 152, 11) + S.c(152, 154, 11))),
        B(crust),
        mark(crust, TH(S.p('M32,160 C64,174 136,174 168,160'))),
        table(190, sil)
      ];
    } },

    /* ----------------------------------------------------------- APPLE */
    { id: 'apple', name: 'Apple', emoji: '🍎', art: function () {
      var fruit = S.p('M100,50 C84,30 50,30 32,58 C12,86 22,142 46,174 ' +
        'C60,190 78,194 100,182 C122,194 140,190 154,174 C178,142 188,86 168,58 ' +
        'C150,30 116,30 100,50 Z');
      var stalk = S.p('M96,48 L104,48 L104,20 L96,20 Z');
      var leaf  = S.p('M104,30 C120,10 156,10 163,26 C146,46 116,46 104,30 Z');
      var sil = fruit + leaf + stalk;
      return [
        // stars sit above the shoulders, clear of both the fruit and the leaf —
        // anywhere lower and the silhouette mask eats them into a fragment
        behind(sil, Sc.stars([[24, 40, 9], [176, 40, 8]])),
        behind(fruit + leaf, B(stalk)),
        behind(fruit, B(leaf) + mark(leaf, HA(S.p('M115,30 C130,23 146,21 157,24')))),
        B(fruit),
        // a highlight sweep gives the fruit a second region to colour
        mark(fruit, TH(S.p('M44,98 C40,76 52,58 68,52'))),
        P.eye(76, 106, 10), P.eye(124, 106, 10),
        P.smile(100, 134, 15),
        TH(P.blush(58, 138, 9), P.blush(142, 138, 9)),
        table(190, sil)
      ];
    } },

    /* -------------------------------------------------------- LOLLIPOP */
    { id: 'lollipop', name: 'Lollipop', emoji: '🍭', art: function () {
      var candy = S.c(100, 76, 62);
      var stick = S.r(93, 134, 14, 52, 6);
      var bowL  = S.p('M100,150 C84,136 60,142 58,158 C74,170 92,164 100,155 Z');
      var bowR  = S.p('M100,150 C116,136 140,142 142,158 C126,170 108,164 100,155 Z');
      var swirl = (function () {
        var d = '', i, a, r;
        for (i = 0; i <= 170; i++) {
          a = (i / 170) * Math.PI * 4.4;
          r = 12 + (i / 170) * 44;
          d += (i ? ' L' : 'M') + Math.round(100 + Math.cos(a) * r) + ',' +
            Math.round(76 + Math.sin(a) * r);
        }
        return S.p(d);
      })();
      var sil = candy + stick + bowL + bowR;
      return [
        behind(sil, Sc.stars([[24, 26, 9], [176, 24, 8]])),
        behind(candy + bowL + bowR, B(stick)),
        B(candy),
        mark(candy, TH(swirl)),
        B(bowL), B(bowR),
        mark(bowL, TH(S.p('M96,148 C84,146 72,148 64,154'))),
        mark(bowR, TH(S.p('M104,148 C116,146 128,148 136,154'))),
        B(S.c(100, 153, 8)), mark(S.r(93, 134, 14, 52, 6), TH(S.l(93, 160, 107, 160))),
        table(190, sil)
      ];
    } },

    /* --------------------------------------------------- BIRTHDAY CAKE */
    { id: 'cake', name: 'Birthday Cake', emoji: '🎂', art: function () {
      var lower   = S.p('M14,180 L14,126 L186,126 L186,180 Z');
      var upper   = S.p('M32,126 L32,84 L168,84 L168,126 Z');
      var candles = S.r(60, 50, 12, 42, 4) + S.r(94, 42, 12, 50, 4) + S.r(128, 50, 12, 42, 4);
      var flames  = S.p('M66,50 C55,38 62,24 66,19 C70,24 77,38 66,50 Z') +
        S.p('M100,42 C89,30 96,16 100,11 C104,16 111,30 100,42 Z') +
        S.p('M134,50 C123,38 130,24 134,19 C138,24 145,38 134,50 Z');
      var sil = lower + upper + candles + flames;
      return [
        behind(sil, Sc.stars([[22, 60, 9], [178, 58, 8]])),
        behind(upper, B(candles)),
        behind(upper, B(lower) +
          mark(lower, TH(S.p('M14,142 C32,154 50,132 68,142 C86,152 104,130 122,142 ' +
            'C140,152 158,130 176,140 C180,143 186,140 186,140')) +
            S.c(48, 164, 8) + S.c(100, 166, 8) + S.c(152, 164, 8))),
        B(upper),
        mark(upper, TH(S.p('M32,98 C46,110 60,88 74,98 C88,108 102,86 116,98 ' +
          'C130,108 144,88 158,98 C162,101 168,98 168,98')) +
          S.c(64, 114, 6) + S.c(104, 116, 6) + S.c(140, 114, 6)),
        B(flames),
        table(188, sil)
      ];
    } }
  ];

  /* ---------------- Fun stuff ---------------- */
  var FUN = [
    { id: 'crown', name: 'Princess Crown', emoji: '👑', art: function () {
      var band = S.p('M26,142 L174,142 L174,168 L26,168 Z');
      var points = S.p('M26,142 L14,54 L58,90 L100,32 L142,90 L186,54 L174,142 Z');
      return [fit([
        behind(points, S.c(14, 48, 9) + S.c(100, 26, 10) + S.c(186, 48, 9)),
        behind(band, B(points)),
        B(band),
        mark(points, P.heart(100, 116, 15) + S.c(56, 118, 11) + S.c(144, 118, 11)),
        mark(band, S.c(48, 155, 7) + S.c(84, 155, 7) + S.c(116, 155, 7) + S.c(152, 155, 7)),
        behind(points + band, P.star(28, 24, 9) + P.star(172, 22, 8))
      ])];
    } },

    { id: 'robot', name: 'Robot', emoji: '🤖', art: function () {
      var head = S.p('M56,34 L144,34 C150,34 154,38 154,44 L154,92 C154,98 150,102 144,102 L56,102 C50,102 46,98 46,92 L46,44 C46,38 50,34 56,34 Z');
      var body = S.p('M60,110 L140,110 C146,110 150,114 150,120 L150,166 C150,172 146,176 140,176 L60,176 C54,176 50,172 50,166 L50,120 C50,114 54,110 60,110 Z');
      var armL = S.r(18, 116, 34, 14, 5), armR = S.r(148, 116, 34, 14, 5);
      var feet = S.r(62, 172, 24, 20, 5) + S.r(114, 172, 24, 20, 5);
      var ant = S.p('M97,34 L103,34 L103,16 L97,16 Z');
      return [fit([
        behind(head, B(ant)), B(S.c(100, 10, 8)),
        B(head),
        mark(head, S.c(78, 62, 14) + S.c(122, 62, 14)),
        S.dot(78, 62, 6), S.dot(122, 62, 6),
        mark(head, S.p('M78,84 L122,84 L122,92 L78,92 Z') + S.l(90, 84, 90, 92) + S.l(110, 84, 110, 92)),
        behind(body, B(armL + armR + feet)),
        B(body),
        mark(body, S.c(100, 132, 14) + S.c(74, 158, 8) + S.c(100, 158, 8) + S.c(126, 158, 8))
      ])];
    } },

    { id: 'house', name: 'My House', emoji: '🏠', art: function () {
      var wall = S.p('M32,178 L32,96 L168,96 L168,178 Z');
      var roof = S.p('M18,100 L100,30 L182,100 Z');
      var chimney = S.p('M128,58 L128,34 L148,34 L148,74 Z');
      var door = S.p('M84,178 L84,124 C84,116 116,116 116,124 L116,178 Z');
      return [fit([
        behind(wall + roof, P.cloud(146, 20, 10)),
        behind(roof, chimney),
        behind(roof + door, B(wall)),
        B(roof),
        B(door),
        mark(door, S.c(110, 150, 4)),
        mark(wall, S.p('M46,116 L74,116 L74,142 L46,142 Z') + S.l(60, 116, 60, 142) + S.l(46, 129, 74, 129) +
          S.p('M126,116 L154,116 L154,142 L126,142 Z') + S.l(140, 116, 140, 142) + S.l(126, 129, 154, 129)),
        behind(wall + roof + door, S.p('M4,178 L196,178') + S.c(30, 40, 15) +
          P.flower(178, 160, 12) + P.flower(18, 160, 12))
      ])];
    } },

    { id: 'balloons', name: 'Balloons', emoji: '🎈', art: function () {
      var bA = S.p('M60,34 C82,34 96,52 96,72 C96,94 80,110 60,110 C40,110 24,94 24,72 C24,52 38,34 60,34 Z');
      var bB = S.p('M140,20 C162,20 176,38 176,58 C176,80 160,96 140,96 C120,96 104,80 104,58 C104,38 118,20 140,20 Z');
      var bC = S.p('M100,88 C120,88 132,104 132,122 C132,142 118,156 100,156 C82,156 68,142 68,122 C68,104 80,88 100,88 Z');
      var tieA = S.p('M56,110 L64,110 L60,120 Z');
      var tieB = S.p('M136,96 L144,96 L140,106 Z');
      var tieC = S.p('M96,156 L104,156 L100,166 Z');
      var strings = S.p('M60,120 C56,144 66,168 84,184') +
        S.p('M140,106 C144,130 132,164 110,184') +
        S.p('M100,166 C98,174 96,180 94,184');
      return [fit([
        behind(bA + bB + bC + tieA + tieB + tieC, strings),
        S.p('M78,184 C86,190 106,190 116,184'),
        behind(bC + tieC, B(bA) + tieA + B(bB) + tieB),
        B(bC), B(tieC),
        mark(bA, S.e(44, 56, 11, 8, -32) + S.c(60, 84, 12)),
        mark(bB, S.e(124, 42, 11, 8, -32) + S.c(140, 70, 12)),
        mark(bC, S.e(84, 108, 10, 7, -32) + S.c(100, 132, 12)),
        behind(bA + bB + bC, P.star(20, 130, 9) + P.star(184, 128, 8))
      ])];
    } },

    { id: 'present', name: 'Present', emoji: '🎁', art: function () {
      var lid = S.p('M24,80 L176,80 L176,106 L24,106 Z');
      var box = S.p('M34,106 L166,106 L166,182 L34,182 Z');
      var band = S.p('M86,80 L114,80 L114,182 L86,182 Z');
      var bowL = S.p('M96,80 C74,80 46,72 46,54 C46,40 62,34 74,42 C86,50 94,64 100,80 Z');
      var bowR = S.p('M104,80 C126,80 154,72 154,54 C154,40 138,34 126,42 C114,50 106,64 100,80 Z');
      var knot = S.c(100, 62, 8);
      return [fit([
        behind(band, B(box) + B(lid)),
        B(band),
        behind(knot, B(bowL + bowR)),
        B(knot),
        behind(lid + bowL + bowR, P.star(20, 42, 10) + P.star(180, 40, 9) +
          P.heart(28, 150, 11) + P.heart(172, 150, 11))
      ])];
    } },

    { id: 'mermaid', name: 'Mermaid Tail', emoji: '🧜‍♀️', art: function () {
      var tail = P.ribbon([[100, 16, 18], [100, 40, 32], [96, 80, 27], [92, 116, 20], [100, 142, 14]]);
      var fluke = S.p('M100,136 C120,148 146,152 164,144 C152,174 122,190 102,182 ' +
        'C101,180 100,177 100,172 C100,177 99,180 98,182 C78,190 48,174 36,144 ' +
        'C54,152 80,148 100,136 Z');
      return [fit([
        behind(tail, B(fluke)),
        B(tail),
        mark(tail, S.p('M62,54 C86,64 114,64 138,54') +
          S.p('M62,72 C86,82 114,82 138,72') +
          S.p('M62,90 C86,100 114,100 138,90') +
          S.p('M64,108 C88,118 112,118 136,108') +
          S.p('M70,126 C90,134 110,134 130,126')),
        mark(fluke, S.thinW(S.p('M112,150 C124,160 142,164 156,158'),
          S.p('M88,150 C76,160 58,164 44,158')) +
          S.c(72, 164, 8) + S.c(128, 164, 8)),
        behind(tail + fluke, P.star(24, 40, 10) + P.star(176, 44, 9) +
          S.c(20, 110, 6) + S.c(182, 106, 5))
      ])];
    } },

    { id: 'teddy', name: 'Teddy Bear', emoji: '🧸', art: function () {
      var head = S.c(100, 74, 42);
      var earL = S.c(62, 46, 20), earR = S.c(138, 46, 20);
      var body = S.e(100, 148, 40, 40);
      var armL = S.e(50, 130, 18, 24, 25), armR = S.e(150, 130, 18, 24, -25);
      var legL = S.e(70, 186, 20, 14), legR = S.e(130, 186, 20, 14);
      var muzzle = S.e(100, 90, 18, 13);
      return [fit([
        behind(body, armL + armR + legL + legR),
        behind(head, B(body)),
        mark(body, S.e(100, 152, 24, 26)),
        behind(head, B(earL + earR)),
        B(head),
        mark(earL, S.c(62, 46, 10)), mark(earR, S.c(138, 46, 10)),
        P.eye(84, 68, 8), P.eye(116, 68, 8),
        B(muzzle),
        mark(muzzle, S.e(100, 84, 9, 7)), S.dot(100, 84, 5),
        S.p('M100,92 L100,98'), P.smile(92, 98, 8), P.smile(108, 98, 8),
        mark(S.e(100, 152, 24, 26), P.heart(100, 150, 12))
      ])];
    } },

    { id: 'shapes', name: 'Shapes', emoji: '🔷', art: function () {
      return [fit([
        B(S.c(56, 52, 30)), mark(S.c(56, 52, 30), TH(S.c(56, 52, 15))),
        B(S.r(114, 22, 60, 60, 6)), mark(S.r(114, 22, 60, 60, 6), TH(S.r(128, 36, 32, 32, 4))),
        B(S.p('M56,102 L88,164 L24,164 Z')),
        mark(S.p('M56,102 L88,164 L24,164 Z'), TH(S.p('M56,126 L72,158 L40,158 Z'))),
        B(S.p('M144,98 L178,132 L144,166 L110,132 Z')),
        mark(S.p('M144,98 L178,132 L144,166 L110,132 Z'), TH(S.p('M144,116 L160,132 L144,148 L128,132 Z'))),
        B(P.star(56, 178, 15)), mark(P.star(56, 178, 15), TH(P.star(56, 178, 7))),
        B(P.heart(140, 178, 13)), mark(P.heart(140, 178, 13), TH(P.heart(140, 178, 7)))
      ])];
    } }
  ];

  function reg(list, id, name, emoji, color) {
    list.forEach(function (p) { p.cat = id; Art.pages[p.id] = p; });
    Art.categories.push({ id: id, name: name, emoji: emoji, color: color, pages: list });
  }

  reg(GO, 'go', 'Things That Go', '🚜', '#F59E0B');
  reg(NAT, 'nature', 'Outside', '🌈', '#22C55E');
  reg(SPACE, 'space', 'Outer Space', '🚀', '#8B5CF6');
  reg(YUM, 'yum', 'Yummy', '🍦', '#EC4899');
  reg(FUN, 'fun', 'Fun Stuff', '👑', '#06B6D4');
})(window.Art);
