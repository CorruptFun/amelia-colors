/* Amelia Colors — fast cars (street-racer inspired side profiles)
   Same house rules as the animals: nothing draws through anything.
   Here that mostly means the tyres cut the bodywork, and the sky,
   ground and speed lines stop at the car instead of running across it. */
(function (Art) {
  'use strict';
  var S = Art.S, P = Art.Parts, Sc = Art.Scene;
  var B = S.bold, behind = Art.behind, inside = Art.inside;

  // A wheel with a tyre ring, a rim, a hub and spokes — lots of little
  // regions to colour in.
  function wheel(cx, cy, r) {
    var out = B(S.c(cx, cy, r)) + S.c(cx, cy, r * 0.6) + S.c(cx, cy, r * 0.2), i, a;
    for (i = 0; i < 5; i++) {
      a = (Math.PI * 2 / 5) * i - Math.PI / 2;
      out += S.thinW(S.l(cx + Math.cos(a) * r * 0.24, cy + Math.sin(a) * r * 0.24,
        cx + Math.cos(a) * r * 0.56, cy + Math.sin(a) * r * 0.56));
    }
    return out;
  }
  function road(y) {
    return B(S.p('M6,' + y + ' L194,' + y)) +
      S.thinW(S.p('M16,' + (y + 11) + ' L46,' + (y + 11) + ' M66,' + (y + 11) + ' L96,' + (y + 11) +
        ' M116,' + (y + 11) + ' L146,' + (y + 11) + ' M166,' + (y + 11) + ' L188,' + (y + 11)));
  }
  function speed(y1, y2, y3) {
    return S.thinW(S.p('M10,' + y1 + ' L44,' + y1 + ' M10,' + y2 + ' L56,' + y2 + ' M10,' + y3 + ' L38,' + y3));
  }

  /* One assembly order for every car:
       sky → speed lines → bodywork (cut by the tyres) → tyres → road
     Everything scenic is masked by the whole car, so a hill or a
     dashed lane marking can never cross the bodywork. */
  function build(o) {
    var tyres = o.wheels.map(function (w) { return S.c(w[0], w[1], w[2]); }).join('');
    var sil = o.body + tyres + (o.extraSil || '');
    return [Art.fit(0.9, 10, 12, [
      behind(sil, (o.sky || '') + (o.speed || '')),
      behind(tyres, o.art),
      o.wheels.map(function (w) { return wheel(w[0], w[1], w[2]); }).join(''),
      behind(sil, road(o.road))
    ])];
  }

  var C = [
    { id: 'muscle-king', name: 'Muscle King', emoji: '🏁', art: function () {
      var body = S.p('M14,142 L14,118 C14,111 19,106 28,104 L56,98 L78,72 C82,67 88,64 96,64 L132,64 C140,64 146,67 150,73 L166,96 L184,102 C192,104 196,109 196,118 L196,142 Z');
      var scoop = S.p('M154,72 L186,72 L180,60 L160,60 Z');
      return build({
        body: body, extraSil: scoop,
        wheels: [[56, 142, 27], [154, 142, 27]],
        sky: Sc.sun(28, 26, 11) + Sc.clouds([[168, 24, 10]]),
        speed: speed(84, 96, 108), road: 172,
        art: B(body) +
          S.p('M84,74 L126,74 L142,94 L66,94 Z') + S.thinW(S.l(105, 74, 105, 94)) +
          behind(scoop, B(S.p('M158,90 L182,90 L182,72 L158,72 Z'))) +
          B(scoop) +
          inside(scoop, S.thinW(S.p('M162,72 L162,58 M170,72 L170,56 M178,72 L178,58')), 1) +
          S.p('M30,142 C30,124 42,114 56,114 C70,114 82,124 82,142') +
          S.p('M128,142 C128,124 140,114 154,114 C168,114 180,124 180,142') +
          B(S.r(186, 112, 10, 10, 3)) + B(S.r(14, 112, 8, 10, 3)) +
          S.p('M88,146 L122,146 L122,154 L88,154 Z')
      });
    } },

    { id: 'orange-rocket', name: 'Orange Rocket', emoji: '🟠', art: function () {
      var body = S.p('M14,140 L14,114 C14,106 18,101 26,98 L54,78 C64,70 76,66 90,66 L120,66 C130,66 138,69 144,75 L160,92 L186,100 C194,102 196,108 196,116 L196,140 Z');
      var wing = S.p('M8,70 L74,70 L74,60 L8,60 Z');
      return build({
        body: body, extraSil: wing,
        wheels: [[56, 140, 26], [152, 140, 26]],
        sky: Sc.sun(168, 30, 12) + Sc.clouds([[54, 26, 11]]),
        speed: speed(46, 104, 116), road: 170,
        art: behind(body + wing, B(S.p('M20,70 L26,96 M60,70 L54,96'))) +
          B(body) +
          S.p('M62,80 L114,80 L130,94 L46,94 Z') + S.thinW(S.l(92, 80, 92, 94)) +
          B(wing) +
          S.p('M32,140 C32,123 43,114 56,114 C69,114 80,123 80,140') +
          S.p('M128,140 C128,123 139,114 152,114 C165,114 176,123 176,140') +
          B(S.r(178, 104, 16, 9, 4)) +
          S.p('M100,124 L144,124') +
          B(S.p('M18,124 L30,124 L30,132 L18,132 Z'))
      });
    } },

    { id: 'blue-ghost', name: 'Blue Ghost', emoji: '🔵', art: function () {
      var body = S.p('M12,140 L12,116 C12,108 16,103 24,100 L52,94 L70,72 C75,66 82,63 90,63 L128,63 C137,63 144,66 149,73 L164,94 L188,100 C194,102 196,107 196,115 L196,140 Z');
      var wing = S.p('M10,78 L68,78 L68,68 L10,68 Z');
      return build({
        body: body, extraSil: wing,
        wheels: [[54, 140, 26], [154, 140, 26]],
        sky: Sc.clouds([[32, 24, 11], [168, 28, 10]]),
        road: 170,
        art: behind(body + wing, B(S.p('M22,78 L26,96 M56,78 L52,96'))) +
          B(body) +
          S.p('M76,74 L124,74 L138,92 L62,92 Z') + S.thinW(S.l(100, 74, 100, 92)) +
          B(wing) +
          S.p('M30,140 C30,123 41,114 54,114 C67,114 78,123 78,140') +
          S.p('M130,140 C130,123 141,114 154,114 C167,114 178,123 178,140') +
          B(S.p('M154,78 L172,78 L170,88 L156,88 Z')) +
          B(S.r(180, 104, 14, 9, 4)) +
          B(S.p('M16,108 L32,108 L32,116 L16,116 Z')) +
          S.p('M84,122 L132,122 L128,132 L88,132 Z')
      });
    } },

    { id: 'purple-racer', name: 'Purple Racer', emoji: '🟣', art: function () {
      var body = S.p('M14,138 L14,114 C14,107 18,102 26,99 L52,82 C62,72 74,68 88,68 L118,68 C130,68 138,71 144,78 L162,96 L186,102 C193,104 196,109 196,116 L196,138 Z');
      var wing = S.p('M10,78 L62,78 L62,70 L10,70 Z');
      return build({
        body: body, extraSil: wing,
        wheels: [[54, 138, 25], [152, 138, 25]],
        sky: Sc.stars([[30, 30, 10], [172, 36, 9], [96, 20, 8]]),
        road: 168,
        art: behind(body + wing, B(S.p('M20,78 L24,98 M50,78 L46,98'))) +
          B(body) +
          S.p('M60,84 L112,84 L128,96 L48,96 Z') + S.thinW(S.l(90, 84, 90, 96)) +
          B(wing) +
          S.p('M32,138 C32,122 42,114 54,114 C66,114 78,122 78,138') +
          S.p('M130,138 C130,122 140,114 152,114 C164,114 174,122 174,138') +
          B(S.r(178, 106, 16, 8, 4)) +
          S.p('M92,120 L146,120') +
          S.thinW(S.p('M24,120 L38,120 M24,128 L44,128'))
      });
    } },

    { id: 'green-speeder', name: 'Green Speeder', emoji: '🟢', art: function () {
      var body = S.p('M16,138 L16,112 C16,104 20,100 28,98 L42,80 C50,70 62,66 76,66 L116,66 C128,66 136,70 142,78 L160,96 L184,102 C192,104 194,108 194,116 L194,138 Z');
      return build({
        body: body,
        wheels: [[56, 138, 25], [152, 138, 25]],
        sky: Sc.sun(30, 30, 12) + Sc.clouds([[150, 26, 11]]),
        speed: speed(46, 98, 112), road: 168,
        art: B(body) +
          S.p('M50,82 L110,82 L124,96 L38,96 Z') + S.thinW(S.l(80, 82, 80, 96)) +
          S.p('M34,138 C34,122 44,114 56,114 C68,114 80,122 80,138') +
          S.p('M130,138 C130,122 140,114 152,114 C164,114 176,122 176,138') +
          B(S.r(176, 106, 16, 8, 4)) +
          B(S.p('M18,108 L32,108 L32,116 L18,116 Z')) +
          S.p('M88,118 L150,118 L146,128 L92,128 Z') +
          B(S.p('M152,82 L170,82 L168,92 L154,92 Z'))
      });
    } },

    { id: 'muscle-pony', name: 'Muscle Pony', emoji: '🐎', art: function () {
      var body = S.p('M14,142 L14,116 C14,109 19,105 28,103 L58,98 L78,74 C82,68 88,66 96,66 L134,66 C142,66 148,69 152,75 L168,98 L186,104 C193,106 196,110 196,118 L196,142 Z');
      return build({
        body: body,
        wheels: [[56, 142, 27], [154, 142, 27]],
        sky: Sc.sun(170, 26, 11) + Sc.clouds([[34, 24, 10]]),
        road: 172,
        art: B(body) +
          S.p('M86,76 L128,76 L144,94 L68,94 Z') + S.thinW(S.l(107, 76, 107, 94)) +
          B(S.p('M154,88 L180,88 L180,78 L154,78 Z')) +
          S.p('M30,142 C30,125 42,115 56,115 C70,115 82,125 82,142') +
          S.p('M128,142 C128,125 140,115 154,115 C168,115 180,125 180,142') +
          B(S.r(184, 112, 12, 10, 3)) +
          B(S.p('M14,110 L26,110 L26,118 L14,118 Z M14,122 L26,122 L26,130 L14,130 Z')) +
          S.p('M90,148 L124,148 L124,156 L90,156 Z')
      });
    } },

    { id: 'silver-hyper', name: 'Silver Hyper', emoji: '⚡', art: function () {
      var body = S.p('M12,136 L12,120 C12,114 16,110 24,108 L48,100 L70,78 C78,70 88,66 100,66 L124,66 C136,66 144,70 150,78 L168,98 L188,106 C194,108 196,112 196,120 L196,136 Z');
      // the bolt is a badge in the sky, not something drawn across the roof
      var bolt = S.p('M32,22 L18,48 L30,48 L22,72 L44,42 L32,42 L44,22 Z');
      return build({
        body: body, extraSil: bolt,
        wheels: [[52, 136, 24], [156, 136, 24]],
        sky: Sc.stars([[100, 20, 9], [172, 30, 11]]) + B(bolt),
        road: 164,
        art: B(body) +
          S.p('M74,80 L122,80 L136,96 L62,96 Z') + S.thinW(S.l(98, 80, 98, 96)) +
          S.p('M30,136 C30,121 40,112 52,112 C64,112 76,121 76,136') +
          S.p('M132,136 C132,121 144,112 156,112 C168,112 180,121 180,136') +
          B(S.p('M12,116 L12,100 L30,106 Z')) +
          B(S.p('M180,104 L194,108 L192,116 L178,114 Z')) +
          S.p('M86,114 L142,114 L136,126 L92,126 Z')
      });
    } },

    { id: 'desert-runner', name: 'Desert Runner', emoji: '🏜️', art: function () {
      var body = S.p('M18,126 L18,102 L42,102 L58,74 C62,68 68,66 76,66 L122,66 C130,66 136,69 140,76 L154,102 L188,102 L188,126 Z');
      var rack = S.p('M50,66 L148,66 L148,58 L50,58 Z');
      var bars = S.p('M64,58 L64,44 L136,44 L136,58');
      return build({
        body: body, extraSil: rack + bars,
        wheels: [[56, 134, 28], [154, 134, 28]],
        // dunes sit behind the truck instead of cutting straight
        // through the doors
        sky: Sc.sun(32, 28, 12) + Sc.hills(140),
        road: 164,
        art: B(body) +
          S.p('M64,78 L118,78 L130,98 L52,98 Z') + S.thinW(S.l(92, 78, 92, 98)) +
          B(rack) + B(bars) +
          S.thinW(S.p('M76,44 L76,36 M96,44 L96,36 M116,44 L116,36')) +
          S.p('M20,124 C20,104 36,92 56,92 C76,92 92,104 92,124') +
          S.p('M118,124 C118,104 134,92 154,92 C174,92 190,104 190,124') +
          B(S.r(180, 104, 12, 10, 3))
      });
    } },

    { id: 'monster-truck', name: 'Monster Truck', emoji: '💥', art: function () {
      var body = S.p('M40,110 L40,80 C40,72 46,66 56,66 L100,66 L116,44 C120,38 126,36 134,36 L154,36 C162,36 166,42 166,50 L166,110 Z');
      var bar = S.p('M34,110 L172,110 L172,120 L34,120 Z');
      return build({
        body: body, extraSil: bar,
        wheels: [[58, 138, 40], [150, 138, 34]],
        sky: Sc.stars([[26, 34, 10], [180, 44, 9]]) + Sc.clouds([[100, 22, 10]]),
        road: 184,
        art: B(body) +
          S.p('M124,48 L154,48 L154,64 L118,64 Z') +
          S.p('M46,74 L94,74 L94,104 L46,104 Z') +
          S.thinW(S.p('M46,84 L94,84 M70,74 L70,104')) +
          S.p('M100,66 L100,110') +
          B(bar) +
          B(S.r(156, 96, 10, 10, 3))
      });
    } },

    { id: 'big-rig', name: 'Big Rig', emoji: '🚛', art: function () {
      var trailer = S.p('M10,72 L112,72 L112,134 L10,134 Z');
      var cab = S.p('M118,134 L118,86 C118,78 124,72 132,72 L150,72 L168,98 L186,104 C192,106 194,110 194,118 L194,134 Z');
      var stack = S.p('M138,50 L146,50 L146,72 L138,72 Z');
      return build({
        body: trailer + cab, extraSil: stack,
        wheels: [[38, 140, 22], [78, 140, 22], [160, 140, 22]],
        sky: Sc.sun(30, 26, 11) + Sc.clouds([[168, 26, 10]]),
        speed: speed(44, 56, 66), road: 170,
        art: B(trailer) +
          S.thinW(S.p('M10,80 L112,80 M10,126 L112,126 M42,80 L42,126 M78,80 L78,126')) +
          behind(cab, B(stack)) + B(S.p('M134,44 L150,44 L150,52 L134,52 Z')) +
          B(cab) +
          S.p('M128,80 L148,80 L162,98 L128,98 Z') +
          B(S.r(184, 112, 10, 9, 3))
      });
    } },

    { id: 'drift-king', name: 'Drift King', emoji: '💨', art: function () {
      var body = S.p('M20,136 L20,112 C20,105 24,100 32,97 L58,78 C66,70 78,66 90,66 L120,66 C130,66 138,70 143,77 L159,94 L186,100 C193,102 196,106 196,114 L196,136 Z');
      var wing = S.p('M14,74 L72,74 L72,64 L14,64 Z');
      return build({
        body: body, extraSil: wing,
        wheels: [[58, 136, 25], [156, 136, 25]],
        sky: Sc.clouds([[30, 24, 11], [170, 26, 10]]),
        road: 168,
        art: behind(body + wing, B(S.p('M26,74 L30,96 M60,74 L56,96'))) +
          B(body) +
          S.p('M66,80 L114,80 L128,94 L54,94 Z') + S.thinW(S.l(90, 80, 90, 94)) +
          B(wing) +
          S.p('M36,136 C36,120 46,112 58,112 C70,112 82,120 82,136') +
          S.p('M134,136 C134,120 144,112 156,112 C168,112 180,120 180,136') +
          B(S.r(180, 106, 14, 8, 4)) +
          S.p('M92,116 L146,116')
      });
    } },

    { id: 'rally-fox', name: 'Rally Racer', emoji: '🌟', art: function () {
      var body = S.p('M16,132 L16,106 C16,99 20,95 28,93 L48,86 L64,68 C68,62 74,60 82,60 L122,60 C130,60 136,63 140,70 L156,92 L184,98 C192,100 194,104 194,112 L194,132 Z');
      var lamps = S.p('M60,52 L78,52 L78,60 L60,60 Z M100,52 L118,52 L118,60 L100,60 Z');
      var wing = S.p('M10,72 L60,72 L60,62 L10,62 Z');
      return build({
        body: body, extraSil: lamps + wing,
        wheels: [[54, 132, 27], [154, 132, 27]],
        sky: Sc.sun(30, 28, 12) + Sc.hills(136),
        road: 164,
        art: B(body) +
          S.p('M70,72 L118,72 L132,90 L58,90 Z') + S.thinW(S.l(94, 72, 94, 90)) +
          B(lamps) + B(wing) +
          S.p('M26,132 C26,115 38,104 54,104 C70,104 82,115 82,132') +
          S.p('M126,132 C126,115 138,104 154,104 C170,104 182,115 182,132') +
          B(S.c(102, 106, 14)) + Art.inside(S.c(102, 106, 14), S.glyph('7', 102, 108, 20), 1) +
          B(S.p('M18,112 L30,112 L30,120 L18,120 Z'))
      });
    } }
  ];

  C.forEach(function (p) { p.cat = 'cars'; Art.pages[p.id] = p; });
  Art.categories.push({ id: 'cars', name: 'Fast Cars', emoji: '🏎️', color: '#3B82F6', pages: C });
})(window.Art);
