/* Amelia Colors — animal coloring pages
   ---------------------------------------------------------------
   House rules, learned the hard way:
     1. Nothing draws through anything. A part that sits behind
        another is wrapped in Art.behind(frontSilhouette, …) so its
        outline stops at the front contour instead of crossing it.
        Order is strictly back-to-front.
     2. Scenery never crosses the character — the ground line, grass,
        waves and bubbles are all masked by the whole silhouette.
     3. Keep inside the safe area (roughly 16…184). The frame is a
        border, not something to lean on.
     4. Big closed regions. Every enclosed area is somewhere a child
        can tap to flood-fill, so detail that does not enclose
        anything is just noise.
   --------------------------------------------------------------- */
(function (Art) {
  'use strict';
  var S = Art.S, P = Art.Parts, Sc = Art.Scene;
  var B = S.bold, TH = S.thinW, HA = S.hairW;
  var behind = Art.behind, inside = Art.inside;
  // markings (spots, stripes, shell segments) belong to their host
  // shape — clip them to it and pull them off its contour a little
  function mark(shape, parts) { return inside(shape, parts, 2.6); }

  function spiral(cx, cy, r0, turns, step) {
    var d = '', i, a, r, x, y, N = Math.round(turns * 36);
    for (i = 0; i <= N; i++) {
      a = (i / 36) * Math.PI * 2;
      r = r0 + (i / N) * step;
      x = cx + Math.cos(a) * r; y = cy + Math.sin(a) * r;
      d += (i ? ' L' : 'M') + Math.round(x * 10) / 10 + ',' + Math.round(y * 10) / 10;
    }
    return S.p(d);
  }

  // A chunky leg. Returns {sil, art} so it can be occluded and banded.
  function leg(x, y, w, h) {
    return S.r(x, y, w, h, w * 0.46);
  }
  function hoofBand(x, y, w) {
    return S.p('M' + x + ',' + y + ' L' + (x + w) + ',' + y);
  }

  // ground + grass, cut away wherever the character stands on it
  function ground(y, sil, extras) {
    return behind(sil, Sc.horizon(y) + Sc.tufts(y, 26) + (extras || ''));
  }
  function sky(sil, parts) { return behind(sil, parts); }

  var A = [

    /* ---------------------------------------------------------- HORSE */
    { id: 'horse', name: 'Horse', emoji: '🐴', art: function () {
      var head = S.p('M100,32 C78,32 66,48 66,70 L68,98 C70,118 82,130 100,130 C118,130 130,118 132,98 L134,70 C134,48 122,32 100,32 Z');
      var body = S.p('M76,108 C58,108 46,124 46,144 C46,164 58,176 78,176 L122,176 C142,176 154,164 154,144 C154,124 142,108 124,108 Z');
      var legL = leg(66, 150, 24, 38), legR = leg(110, 150, 24, 38);
      var sil = head + body + legL + legR;
      return [
        sky(sil, Sc.sun(30, 28, 12) + Sc.clouds([[166, 28, 11]])),
        behind(body, B(legL, legR)),
        behind(head, B(body)),
        behind(head, B(
          S.p('M78,38 C72,20 76,10 84,13 C91,16 90,32 87,46 Z'),
          S.p('M122,38 C128,20 124,10 116,13 C109,16 110,32 113,46 Z')
        )),
        B(head),
        // forelock drawn on top of the head — tucked behind it, a mane
        // just reads as a round bun between the ears
        B(S.p('M89,42 C84,22 94,6 105,14 C112,22 108,34 105,44 Z')),
        TH(S.p('M96,40 C93,26 97,16 102,14')),
        TH(S.p('M81,40 C78,30 79,23 83,24 C87,26 86,34 85,42 Z'),
          S.p('M119,40 C122,30 121,23 117,24 C113,26 114,34 115,42 Z')),
        P.eyes(100, 70, 20, 11),
        behind(S.e(100, 110, 25, 17), B(S.p('M100,88 L100,100'))),
        B(S.e(100, 110, 25, 17)),
        S.dot(91, 106, 4), S.dot(109, 106, 4),
        P.smile(100, 117, 9),
        TH(P.blush(76, 96, 8), P.blush(124, 96, 8)),
        hoofBand(68, 178, 20), hoofBand(112, 178, 20),
        ground(188, sil)
      ];
    } },

    /* -------------------------------------------------------- DOLPHIN */
    { id: 'dolphin', name: 'Dolphin', emoji: '🐬', art: function () {
      var body = S.p('M178,88 C168,78 154,74 140,76 C138,58 124,48 104,50 C74,54 44,74 26,102 C44,124 76,136 106,132 C130,129 146,116 152,100 C162,102 172,97 178,88 Z');
      var sil = body;
      return [
        sky(sil, Sc.sun(32, 30, 12) + Sc.clouds([[152, 28, 11]])),
        behind(body, B(
          S.p('M28,102 C20,88 16,72 18,58 C30,66 40,80 44,92 Z'),          // tail upper
          S.p('M26,104 C16,110 8,122 6,138 C22,132 34,120 40,110 Z'),      // tail lower
          S.p('M112,50 C108,36 98,26 84,22 C94,34 100,40 104,52 Z')        // dorsal fin
        )),
        B(body),
        B(S.p('M96,128 C86,142 84,156 90,166 C100,155 108,142 110,132 Z')), // flipper (in front)
        TH(S.p('M38,108 C58,124 86,130 110,126')),                          // belly line
        S.c(130, 60, 4),                                                    // blowhole
        P.bigEye(144, 76, 7),
        S.p('M164,86 C170,88 175,88 178,87'),                               // smile
        behind(sil, Sc.waves(162, 3) + Sc.bubbles([[26, 150, 5], [40, 168, 4], [174, 130, 5], [186, 150, 4]]))
      ];
    } },

    /* ------------------------------------------------------------ CAT */
    { id: 'cat', name: 'Cat', emoji: '🐱', art: function () {
      var head = S.p('M60,60 C56,46 54,30 55,20 C55,15 60,13 64,17 L85,36 C94,32 106,32 115,36 L136,17 C140,13 145,15 145,20 C146,30 144,46 140,60 C148,70 152,82 152,94 C152,118 130,134 100,134 C70,134 48,118 48,94 C48,82 52,70 60,60 Z');
      var body = S.p('M74,122 C62,136 56,150 56,162 C56,172 63,177 73,177 L127,177 C137,177 144,172 144,162 C144,150 138,136 126,122 Z');
      var tail = S.p('M140,168 C164,170 178,154 173,138 C170,128 156,126 151,136');
      var paws = B(S.e(76, 173, 15, 9)) + B(S.e(124, 173, 15, 9));
      var sil = head + body + S.e(76, 173, 15, 9) + S.e(124, 173, 15, 9) +
        S.c(28, 164, 14);
      return [
        sky(sil, Sc.clouds([[34, 26, 11], [168, 32, 10]])),
        behind(body, B(tail)),
        behind(head, B(body)),
        behind(head + body, B(S.c(28, 164, 14)) + spiral(28, 164, 2, 1.8, 10)),
        behind(body, paws),
        B(head),
        TH(S.p('M68,52 C65,42 64,31 64,26 L82,42 C76,44 71,48 68,52 Z'),
          S.p('M132,52 C135,42 136,31 136,26 L118,42 C124,44 129,48 132,52 Z')),
        P.eyes(100, 88, 20, 12),
        S.p('M92,106 L108,106 L100,115 Z'),
        S.p('M100,115 L100,120'), P.smile(92, 120, 8), P.smile(108, 120, 8),
        behind(head, HA(S.p('M56,100 L26,92 M56,108 L24,108 M56,115 L26,126'),
          S.p('M144,100 L174,92 M144,108 L176,108 M144,115 L174,126'))),
        TH(S.p('M86,148 C93,155 107,155 114,148')),
        ground(184, sil)
      ];
    } },

    /* ---------------------------------------------------------- PUPPY */
    { id: 'dog', name: 'Puppy', emoji: '🐶', art: function () {
      var head = S.p('M64,52 C74,40 86,34 100,34 C114,34 126,40 136,52 C146,60 152,74 152,88 C152,112 130,130 100,130 C70,130 48,112 48,88 C48,74 54,60 64,52 Z');
      var body = S.p('M76,120 C64,134 58,148 58,160 C58,170 65,175 75,175 L125,175 C135,175 142,170 142,160 C142,148 136,134 124,120 Z');
      var sil = head + body + S.e(76, 171, 15, 9) + S.e(124, 171, 15, 9) +
        S.e(48, 84, 20, 34) + S.e(152, 84, 20, 34);
      return [
        sky(sil, Sc.sun(168, 30, 12) + Sc.clouds([[34, 28, 11]])),
        behind(body, B(S.p('M140,166 C158,166 169,153 167,138'))),
        behind(head, B(body)),
        behind(body, B(S.e(76, 171, 15, 9)) + B(S.e(124, 171, 15, 9))),
        behind(head, B(
          S.p('M62,52 C46,48 33,59 31,77 C29,97 40,114 56,118 C50,102 50,74 62,58 Z'),
          S.p('M138,52 C154,48 167,59 169,77 C171,97 160,114 144,118 C150,102 150,74 138,58 Z')
        )),
        B(head),
        P.eyes(100, 80, 20, 11),
        behind(S.e(100, 106, 27, 18), B(S.p('M100,90 L100,100'))),
        B(S.e(100, 106, 27, 18)),
        S.e(100, 98, 10, 7.5), S.dot(100, 98, 5.5),
        S.p('M100,105 L100,112'), P.smile(91, 112, 9), P.smile(109, 112, 9),
        TH(S.p('M84,140 C91,149 109,149 116,140')),
        ground(184, sil, behind(sil, B(S.p('M20,168 C14,162 20,154 27,158 C31,154 38,157 37,164 L52,170 C58,166 64,170 62,177 C66,182 60,189 54,185 C50,189 43,186 44,179 L29,173 Z'))))
      ];
    } },

    /* ------------------------------------------------------- BUTTERFLY */
    { id: 'butterfly', name: 'Butterfly', emoji: '🦋', art: function () {
      var wingUL = S.p('M92,68 C66,32 28,30 20,54 C12,80 42,100 90,96 Z');
      var wingUR = S.p('M108,68 C134,32 172,30 180,54 C188,80 158,100 110,96 Z');
      var wingLL = S.p('M92,102 C62,108 38,126 44,148 C50,168 82,160 94,132 Z');
      var wingLR = S.p('M108,102 C138,108 162,126 156,148 C150,168 118,160 106,132 Z');
      var bodyS = S.e(100, 100, 9, 42) + S.c(100, 50, 11);
      var sil = wingUL + wingUR + wingLL + wingLR + bodyS;
      return [
        sky(sil, Sc.sun(34, 32, 12) + Sc.clouds([[164, 30, 11]])),
        behind(bodyS, B(wingUL, wingUR, wingLL, wingLR)),
        // wing markings live strictly inside their own wing
        mark(wingUL, TH(S.c(54, 64, 13), S.c(34, 58, 6))),
        mark(wingUR, TH(S.c(146, 64, 13), S.c(166, 58, 6))),
        mark(wingLL, TH(S.c(66, 136, 10), S.c(52, 148, 5))),
        mark(wingLR, TH(S.c(134, 136, 10), S.c(148, 148, 5))),
        B(S.e(100, 100, 9, 42)),
        TH(S.p('M93,86 L107,86 M93,104 L107,104 M94,120 L106,120')),
        behind(S.c(100, 50, 11), B(S.p('M94,42 C86,26 76,18 64,16'), S.p('M106,42 C114,26 124,18 136,16'))),
        B(S.c(100, 50, 11)),
        S.c(62, 14, 5), S.c(138, 14, 5),
        P.bigEye(95, 49, 4), P.bigEye(105, 49, 4),
        behind(sil, Sc.flowerAt(28, 158, 11) + Sc.flowerAt(174, 162, 10) + Sc.horizon(180) + Sc.tufts(180, 26))
      ];
    } },

    /* -------------------------------------------------------- ELEPHANT */
    { id: 'elephant', name: 'Elephant', emoji: '🐘', art: function () {
      var head = S.e(100, 82, 40, 40);
      var earL = S.e(52, 80, 28, 34, -8), earR = S.e(148, 80, 28, 34, 8);
      var trunk = S.p('M88,110 C86,136 89,158 100,172 C111,158 114,136 112,110 Z');
      var body = S.p('M70,116 C58,116 48,132 48,152 C48,170 60,180 76,180 L124,180 C140,180 152,170 152,152 C152,132 142,116 130,116 Z');
      var sil = head + earL + earR + trunk + body;
      return [
        sky(sil, Sc.sun(28, 28, 12) + Sc.clouds([[168, 28, 11]])),
        behind(head + earL + earR, B(body)),
        behind(head, B(earL, earR)),
        mark(earL, TH(S.p('M60,58 C68,70 72,88 68,102'))),
        mark(earR, TH(S.p('M140,58 C132,70 128,88 132,102'))),
        B(head),
        behind(trunk, B(
          S.p('M80,112 C72,122 69,136 72,146 C78,138 82,124 84,114 Z'),
          S.p('M120,112 C128,122 131,136 128,146 C122,138 118,124 116,114 Z')
        )),
        B(trunk),
        TH(S.p('M90,124 L110,124 M90,138 L110,138 M92,150 L108,150 M94,162 L106,162')),
        P.eyes(100, 72, 19, 11),
        TH(P.blush(74, 94, 8), P.blush(126, 94, 8)),
        hoofBand(66, 172, 22), hoofBand(112, 172, 22),
        ground(186, sil)
      ];
    } },

    /* ---------------------------------------------------------- TURTLE */
    { id: 'turtle', name: 'Turtle', emoji: '🐢', art: function () {
      var shell = S.p('M32,116 C32,78 62,54 100,54 C138,54 168,78 168,116 C168,130 142,138 100,138 C58,138 32,130 32,116 Z');
      var head = S.e(174, 110, 18, 16);
      var feet = S.e(48, 146, 19, 12, 20) + S.e(152, 146, 19, 12, -20) +
        S.e(80, 150, 16, 11, 8) + S.e(120, 150, 16, 11, -8);
      var tail = S.p('M34,112 C22,116 14,126 16,138 C25,136 31,128 35,122 Z');
      var sil = shell + head + feet + tail;
      return [
        sky(sil, Sc.sun(34, 30, 12) + Sc.clouds([[150, 26, 11]])),
        behind(shell + head, B(feet) + B(tail)),
        behind(shell, B(head)),
        B(shell),
        mark(shell, S.p('M36,114 C64,128 136,128 164,114')),    // shell rim
        mark(shell, TH(S.p('M100,56 L100,124'), S.p('M68,62 L76,124'), S.p('M132,62 L124,124'),
          S.p('M44,92 C72,102 128,102 156,92'))),
        P.bigEye(178, 104, 6),
        S.p('M182,118 C176,122 170,121 166,118'),
        ground(172, sil)
      ];
    } },

    /* ------------------------------------------------------------ FISH */
    { id: 'fish', name: 'Fish', emoji: '🐠', art: function () {
      var body = S.p('M138,100 C138,68 112,48 80,48 C48,48 24,70 24,100 C24,130 48,152 80,152 C112,152 138,132 138,100 Z');
      var tail = S.p('M132,100 L176,62 L170,100 L176,138 Z');
      var finT = S.p('M56,62 C62,40 78,26 100,28 C92,42 88,52 88,64 Z');
      var finB = S.p('M56,138 C62,160 78,174 100,172 C92,158 88,148 88,136 Z');
      var sil = body + tail + finT + finB;
      return [
        behind(body, B(tail, finT, finB)),
        B(body),
        B(S.p('M58,106 C74,114 74,118 58,126 Z')),              // side fin
        P.bigEye(48, 84, 9),
        S.p('M26,108 C36,116 44,118 52,116'),                   // mouth
        mark(body, TH(S.c(96, 76, 11), S.c(116, 100, 11), S.c(96, 124, 11), S.c(76, 102, 8))),
        behind(sil, Sc.bubbles([[160, 26, 8], [144, 12, 5], [178, 42, 4], [26, 28, 5]]) +
          Sc.seaweed(28, 186, 38) + Sc.seaweed(174, 186, 32) + Sc.waves(176, 2))
      ];
    } },

    /* ---------------------------------------------------------- BUNNY */
    { id: 'bunny', name: 'Bunny', emoji: '🐰', art: function () {
      var head = S.p('M68,74 C68,58 82,46 100,46 C118,46 132,58 132,74 C140,82 144,94 144,106 C144,128 124,142 100,142 C76,142 56,128 56,106 C56,94 60,82 68,74 Z');
      var body = S.p('M78,130 C66,142 60,154 60,166 C60,174 66,179 74,179 L126,179 C134,179 140,174 140,166 C140,154 134,142 122,130 Z');
      var earL = S.p('M84,64 C76,44 74,26 80,18 C88,8 99,14 99,28 C99,42 95,54 93,66 Z');
      var earR = S.p('M116,64 C124,44 126,26 120,18 C112,8 101,14 101,28 C101,42 105,54 107,66 Z');
      var sil = head + body + earL + earR + S.e(74, 177, 16, 9) + S.e(126, 177, 16, 9) + S.c(152, 164, 13);
      return [
        sky(sil, Sc.clouds([[34, 26, 11], [166, 30, 10]])),
        behind(head + body, B(S.c(152, 164, 13))),
        behind(head, B(body)),
        behind(body, B(S.e(74, 177, 16, 9)) + B(S.e(126, 177, 16, 9))),
        behind(head, B(earL, earR)),
        B(head),
        mark(earL, TH(S.p('M86,60 C82,46 82,32 86,27 C92,23 94,31 93,41 C92,49 89,54 88,60 Z'))),
        mark(earR, TH(S.p('M114,60 C118,46 118,32 114,27 C108,23 106,31 107,41 C108,49 111,54 112,60 Z'))),
        P.eyes(100, 94, 19, 11),
        S.e(100, 112, 9, 7), S.dot(100, 112, 5),
        S.p('M100,118 L100,124'), P.smile(92, 124, 8), P.smile(108, 124, 8),
        S.p('M90,126 L90,118 M110,126 L110,118'),
        behind(head, HA(S.p('M62,110 L32,102 M62,118 L30,120'), S.p('M138,110 L168,102 M138,118 L170,120'))),
        ground(186, sil, behind(sil, B(S.p('M20,180 L32,148 L44,180 Z')) +
          TH(S.p('M26,164 L38,164 M29,156 L35,156')) +
          B(S.p('M32,148 C26,140 28,132 35,132 C36,138 35,144 32,148 Z'))))
      ];
    } },

    /* ------------------------------------------------------------ OWL */
    { id: 'owl', name: 'Owl', emoji: '🦉', art: function () {
      var body = S.p('M100,26 C60,26 38,60 38,102 C38,144 62,172 100,172 C138,172 162,144 162,102 C162,60 140,26 100,26 Z');
      var wingL = S.p('M44,94 C30,120 34,150 52,168 C58,150 56,120 54,98 Z');
      var wingR = S.p('M156,94 C170,120 166,150 148,168 C142,150 144,120 146,98 Z');
      var sil = body + S.p('M56,44 L44,16 L76,32 Z') + S.p('M144,44 L156,16 L124,32 Z');
      return [
        behind(sil, Sc.stars([[24, 42, 9], [178, 54, 8], [26, 122, 7], [176, 130, 7]])),
        behind(body, B(S.p('M56,44 L44,16 L76,32 Z'), S.p('M144,44 L156,16 L124,32 Z'))),
        B(body),
        behind(body, B(wingL, wingR)),
        B(S.c(74, 82, 26)), B(S.c(126, 82, 26)),
        P.bigEye(74, 82, 15), P.bigEye(126, 82, 15),
        B(S.p('M100,92 L88,110 L100,120 L112,110 Z')),
        behind(wingL + wingR + S.c(74, 82, 26) + S.c(126, 82, 26),
          TH(S.p('M66,132 C80,143 120,143 134,132'), S.p('M58,150 C78,162 122,162 142,150'))),
        behind(body, B(S.p('M78,168 L72,186 M90,170 L86,186 M110,170 L114,186 M122,168 L128,186'))),
        behind(sil, S.p('M16,186 L184,186'))
      ];
    } },

    /* ----------------------------------------------------------- LION */
    { id: 'lion', name: 'Lion', emoji: '🦁', art: function () {
      // A ring of round lobes reads as a mane. The old zig-zag star of
      // spikes read as a hedgehog.
      var mane = (function () {
        var d = '', i, a, x, y, N = 12, R = 56;
        for (i = 0; i <= N; i++) {
          a = (Math.PI * 2 / N) * i - Math.PI / 2;
          x = 100 + Math.cos(a) * R; y = 88 + Math.sin(a) * R;
          d += (i ? ' A19,19 0 0 1 ' : 'M') + Math.round(x) + ',' + Math.round(y);
        }
        return S.p(d + ' Z');
      })();
      var face = S.c(100, 88, 38);
      var earL = S.c(73, 56, 11), earR = S.c(127, 56, 11);
      var body = S.p('M78,138 C66,150 60,160 60,168 C60,176 66,180 74,180 L126,180 C134,180 140,176 140,168 C140,160 134,150 122,138 Z');
      var sil = mane + body + S.e(76, 176, 14, 9) + S.e(124, 176, 14, 9);
      return [
        sky(sil, Sc.sun(168, 28, 11) + Sc.clouds([[32, 26, 10]])),
        behind(mane, B(body)),
        behind(body, B(S.e(76, 176, 14, 9)) + B(S.e(124, 176, 14, 9))),
        behind(face + earL + earR, B(mane)),
        behind(face, B(earL, earR)),
        B(face),
        mark(earL, TH(S.c(73, 56, 5))), mark(earR, TH(S.c(127, 56, 5))),
        P.eyes(100, 80, 18, 10),
        behind(S.e(100, 102, 13, 9), B(S.p('M100,90 L100,96'))),
        B(S.e(100, 102, 13, 9)), S.dot(100, 102, 7),
        S.p('M100,110 L100,116'), P.smile(90, 116, 10), P.smile(110, 116, 10),
        hoofBand(68, 172, 18), hoofBand(114, 172, 18),
        ground(186, sil)
      ];
    } },

    /* ----------------------------------------------------------- FROG */
    { id: 'frog', name: 'Frog', emoji: '🐸', art: function () {
      var body = S.e(100, 120, 58, 46);
      var eyeL = S.c(72, 68, 22), eyeR = S.c(128, 68, 22);
      var legL = S.p('M46,146 C26,152 18,172 30,182 C40,190 54,184 56,172 Z');
      var legR = S.p('M154,146 C174,152 182,172 170,182 C160,190 146,184 144,172 Z');
      var lily = S.e(100, 180, 70, 12);
      var sil = body + eyeL + eyeR + legL + legR + lily;
      return [
        sky(sil, Sc.sun(32, 28, 12) + Sc.clouds([[166, 30, 11]])),
        behind(body + legL + legR, B(lily)),
        behind(body, B(legL, legR)),
        behind(eyeL + eyeR, B(body)),
        B(eyeL), B(eyeR),
        P.bigEye(72, 68, 13), P.bigEye(128, 68, 13),
        behind(eyeL + eyeR, S.p('M58,128 C74,148 126,148 142,128')),
        TH(S.p('M88,140 C93,146 107,146 112,140')),
        S.dot(86, 96, 4), S.dot(114, 96, 4),
        mark(body, TH(S.c(68, 124, 9), S.c(132, 124, 9), S.c(100, 148, 8))),
        behind(lily, S.p('M64,180 L38,180 M136,180 L162,180')),
        behind(sil, Sc.waves(190, 1))
      ];
    } },

    /* ---------------------------------------------------------- WHALE */
    { id: 'whale', name: 'Whale', emoji: '🐋', art: function () {
      var body = S.p('M24,116 C24,86 56,64 96,64 C132,64 158,80 164,106 C166,118 162,130 154,138 C140,150 118,156 94,156 C54,156 24,142 24,116 Z');
      var tail = S.p('M150,104 C164,90 176,80 186,80 C184,94 178,106 168,114 C178,122 184,134 186,148 C176,146 162,136 150,122 Z');
      var fin = S.p('M92,150 C100,164 114,170 124,166 C118,154 106,146 96,144 Z');
      // a real waterspout: a tapering stem opening into a puff of water
      var stem = P.ribbon([[66, 82, 9], [58, 58, 7], [54, 38, 4]]);
      var puff = P.cloud(54, 26, 12);
      var sil = body + tail + fin + stem + puff;
      return [
        sky(sil, Sc.clouds([[152, 32, 12]])),
        behind(body + puff, B(stem)),
        behind(body, B(tail)),
        B(puff),
        B(body),
        behind(body, B(fin)),
        mark(body, S.p('M28,126 C54,142 126,148 160,130')),     // belly line
        P.bigEye(50, 98, 8),
        S.p('M26,110 C40,124 60,128 76,124'),                   // mouth
        behind(sil, Sc.waves(168, 3) + Sc.bubbles([[26, 152, 5], [180, 164, 4]]))
      ];
    } },

    /* -------------------------------------------------------- UNICORN */
    { id: 'unicorn', name: 'Unicorn', emoji: '🦄', art: function () {
      var head = S.p('M100,38 C80,38 68,52 68,72 L70,104 C72,124 82,136 100,136 C118,136 128,124 130,104 L132,72 C132,52 120,38 100,38 Z');
      var body = S.p('M76,114 C58,114 46,130 46,150 C46,170 58,182 78,182 L122,182 C142,182 154,170 154,150 C154,130 142,114 124,114 Z');
      var legL = leg(66, 156, 24, 36), legR = leg(110, 156, 24, 36);
      var horn = S.p('M100,4 L88,40 L112,40 Z');
      var sil = head + body + legL + legR + horn;
      return [
        behind(sil, Sc.stars([[26, 34, 11], [176, 42, 9], [22, 110, 8], [182, 118, 7]])),
        behind(body, B(legL, legR)),
        behind(head, B(body)),
        behind(head + horn, B(
          S.p('M76,44 C70,28 74,18 82,21 C89,24 88,38 85,52 Z'),
          S.p('M124,44 C130,28 126,18 118,21 C111,24 112,38 115,52 Z')
        )),
        // mane: soft lobes tucked behind the head, never crossing it
        behind(head, B(
          S.p('M68,62 C50,66 40,84 44,102 C54,90 62,80 70,76 Z'),
          S.p('M132,62 C150,66 160,84 156,102 C146,90 138,80 130,76 Z'),
          S.p('M74,46 C58,46 46,56 42,68 C56,70 68,66 76,58 Z'),
          S.p('M126,46 C142,46 154,56 158,68 C144,70 132,66 124,58 Z')
        )),
        behind(head, B(horn)),
        B(head),
        mark(horn, TH(S.p('M91,32 L109,32 M94,22 L106,22 M97,13 L103,13'))),
        P.eyes(100, 78, 20, 11),
        behind(S.e(100, 116, 24, 17), B(S.p('M100,96 L100,106'))),
        B(S.e(100, 116, 24, 17)),
        S.dot(91, 112, 4), S.dot(109, 112, 4),
        P.smile(100, 123, 9),
        TH(P.blush(76, 102, 8), P.blush(124, 102, 8)),
        hoofBand(68, 184, 20), hoofBand(112, 184, 20)
      ];
    } },

    /* ----------------------------------------------------------- BEAR */
    { id: 'bear', name: 'Bear', emoji: '🐻', art: function () {
      var head = S.p('M52,82 C52,56 73,38 100,38 C127,38 148,56 148,82 C148,108 127,126 100,126 C73,126 52,108 52,82 Z');
      var body = S.p('M74,116 C60,130 54,146 54,158 C54,168 61,173 70,173 L130,173 C139,173 146,168 146,158 C146,146 140,130 126,116 Z');
      var earL = S.c(62, 48, 18), earR = S.c(138, 48, 18);
      var sil = head + body + earL + earR + S.e(74, 170, 15, 9) + S.e(126, 170, 15, 9);
      return [
        sky(sil, Sc.clouds([[32, 26, 11], [168, 32, 10]])),
        behind(head, B(body)),
        behind(body, B(S.e(74, 170, 15, 9)) + B(S.e(126, 170, 15, 9))),
        behind(head, B(earL, earR)),
        B(head),
        mark(earL, TH(S.c(62, 48, 9))), mark(earR, TH(S.c(138, 48, 9))),
        P.eyes(100, 76, 20, 11),
        behind(S.e(100, 100, 25, 17), B(S.p('M100,86 L100,94'))),
        B(S.e(100, 100, 25, 17)),
        S.e(100, 93, 10, 7), S.dot(100, 93, 5),
        S.p('M100,99 L100,106'), P.smile(91, 106, 9), P.smile(109, 106, 9),
        mark(body, TH(S.e(100, 152, 24, 20))),
        ground(184, sil, behind(sil,
          B(S.p('M22,152 C22,144 30,140 38,140 C46,140 54,144 54,152 L52,174 C52,180 46,182 38,182 C30,182 24,180 24,174 Z')) +
          B(S.p('M20,150 L56,150')) +
          TH(S.p('M30,162 C34,168 42,168 46,162'))))
      ];
    } },

    /* -------------------------------------------------------- PENGUIN */
    { id: 'penguin', name: 'Penguin', emoji: '🐧', art: function () {
      var body = S.p('M100,20 C64,20 46,56 46,102 C46,148 66,178 100,178 C134,178 154,148 154,102 C154,56 136,20 100,20 Z');
      // one patch running from the face down to the feet — the thing
      // that makes a penguin read as a penguin
      var belly = S.p('M100,42 C82,42 72,56 72,74 C64,86 60,102 60,122 C60,150 78,168 100,168 ' +
        'C122,168 140,150 140,122 C140,102 136,86 128,74 C128,56 118,42 100,42 Z');
      var wingL = S.p('M48,94 C30,110 28,142 42,158 C48,165 54,161 54,152 Z');
      var wingR = S.p('M152,94 C170,110 172,142 158,158 C152,165 146,161 146,152 Z');
      var footL = S.p('M82,174 C68,180 60,188 62,192 L94,192 C96,184 92,176 88,174 Z');
      var footR = S.p('M118,174 C132,180 140,188 138,192 L106,192 C104,184 108,176 112,174 Z');
      var sil = body + wingL + wingR + footL + footR;
      return [
        behind(sil, Sc.snowflakes([[28, 36, 9], [172, 32, 8], [24, 118, 7], [178, 126, 7], [38, 74, 6]])),
        behind(body, B(footL, footR)),
        behind(body, B(wingL, wingR)),
        B(body),
        mark(body, B(belly)),
        P.eyes(100, 62, 16, 10),
        B(S.p('M100,76 L88,86 L100,96 L112,86 Z')),
        TH(P.blush(76, 84, 8), P.blush(124, 84, 8)),
        behind(sil, S.p('M14,192 L186,192'))
      ];
    } },

    /* -------------------------------------------------------- LADYBUG */
    { id: 'ladybug', name: 'Ladybug', emoji: '🐞', art: function () {
      var shell = S.p('M28,120 C28,80 60,52 100,52 C140,52 172,80 172,120 C172,148 140,166 100,166 C60,166 28,148 28,120 Z');
      var head = S.c(100, 46, 24);
      var sil = shell + head;
      return [
        sky(sil, Sc.sun(34, 30, 12) + Sc.clouds([[164, 28, 11]])),
        behind(sil, B(S.p('M32,104 L14,92 M29,128 L10,128 M34,148 L16,166'),
          S.p('M168,104 L186,92 M171,128 L190,128 M166,148 L184,166'))),
        behind(head, B(S.p('M88,26 C82,12 74,6 66,4'), S.p('M112,26 C118,12 126,6 134,4'))),
        S.c(64, 2, 5), S.c(136, 2, 5),
        behind(head, B(shell)),
        mark(shell, B(S.p('M100,60 L100,164'))),
        mark(shell, B(S.c(64, 96, 12), S.c(136, 96, 12),
          S.c(58, 130, 10), S.c(142, 130, 10),
          S.c(86, 146, 9), S.c(114, 146, 9))),
        B(head),
        P.bigEye(90, 40, 7), P.bigEye(110, 40, 7),
        P.smile(100, 54, 8),
        ground(182, sil)
      ];
    } },

    /* ---------------------------------------------------------- SNAIL */
    { id: 'snail', name: 'Snail', emoji: '🐌', art: function () {
      var shell = S.c(118, 98, 48);
      var foot = S.p('M26,166 C14,166 10,152 22,146 C50,134 78,148 94,146 L152,146 C170,146 178,156 176,166 Z');
      var head = S.p('M28,158 C22,134 32,112 52,110 C70,108 82,120 82,138 L82,158 Z');
      var eyeL = S.c(28, 60, 9), eyeR = S.c(58, 50, 9);
      var stalks = S.p('M44,114 C36,98 30,80 28,68') + S.p('M66,116 C64,98 60,74 58,58');
      var sil = shell + foot + head + eyeL + eyeR;
      return [
        sky(sil, Sc.sun(166, 30, 12) + Sc.clouds([[36, 28, 11]])),
        behind(head + eyeL + eyeR, B(stalks)),
        behind(shell, B(eyeL, eyeR)),
        S.dot(29, 59, 4), S.dot(59, 49, 4),
        behind(shell + head, B(foot)),
        behind(shell, B(head)),
        B(shell),
        mark(shell, spiral(118, 98, 6, 2.6, 36)),
        P.bigEye(50, 130, 7),
        P.smile(50, 144, 8),
        ground(178, sil)
      ];
    } },

    /* ----------------------------------------------------------- DUCK */
    { id: 'duck', name: 'Duck', emoji: '🦆', art: function () {
      var body = S.p('M40,120 C48,102 68,92 92,92 C118,92 136,106 136,126 ' +
        'C136,148 114,164 84,164 C54,164 34,150 34,134 C34,128 36,124 40,120 Z');
      var head = S.c(146, 62, 24);
      var neck = P.ribbon([[112, 116, 19], [120, 98, 17], [130, 82, 15]]);
      var beak = S.p('M162,54 C176,52 182,60 180,68 C170,72 160,66 158,60 Z');
      var tail = S.p('M42,116 C32,102 20,98 15,106 C18,116 28,124 44,128 Z');
      // a folded wing tucked against the back — a concentric oval in
      // the middle of the body just reads as a swim ring
      var wing = S.p('M58,110 C76,102 102,108 114,122 C98,134 72,134 58,124 Z');
      var sil = body + head + neck + beak + tail;
      return [
        sky(sil, Sc.sun(30, 28, 12) + Sc.clouds([[92, 26, 11]])),
        behind(body, B(tail)),
        behind(body + head, B(neck)),
        behind(head, B(beak)),
        B(body),
        mark(body, B(wing)),
        mark(wing, TH(S.p('M66,114 C82,110 98,114 106,120'), S.p('M64,122 C80,119 94,122 100,127'))),
        B(head),
        P.bigEye(152, 56, 8),
        behind(sil, Sc.waves(172, 3) + Sc.bubbles([[26, 156, 4], [180, 150, 5]]))
      ];
    } },

    /* ------------------------------------------------------------ PIG */
    { id: 'pig', name: 'Pig', emoji: '🐷', art: function () {
      var head = S.e(100, 98, 52, 44);
      var legL = leg(60, 132, 24, 46), legR = leg(116, 132, 24, 46);
      var earL = S.p('M60,74 C52,52 56,38 64,40 C76,44 84,60 86,74 Z');
      var earR = S.p('M140,74 C148,52 144,38 136,40 C124,44 116,60 114,74 Z');
      var sil = head + legL + legR + earL + earR;
      return [
        sky(sil, Sc.sun(32, 30, 12) + Sc.clouds([[164, 28, 11]])),
        behind(head, B(legL, legR)),
        behind(head, B(S.p('M150,106 C168,102 176,116 166,126 C158,134 148,126 154,118'))),
        behind(head, B(earL, earR)),
        B(head),
        mark(earL, TH(S.p('M66,68 C64,56 65,48 69,49'))),
        mark(earR, TH(S.p('M134,68 C136,56 135,48 131,49'))),
        P.eyes(100, 86, 21, 11),
        B(S.e(100, 114, 25, 18)),
        S.dot(92, 114, 5), S.dot(108, 114, 5),
        P.smile(100, 132, 10),
        TH(P.blush(72, 110, 9), P.blush(128, 110, 9)),
        hoofBand(62, 168, 20), hoofBand(118, 168, 20),
        ground(184, sil)
      ];
    } },

    /* ------------------------------------------------------------ COW */
    { id: 'cow', name: 'Cow', emoji: '🐮', art: function () {
      var head = S.e(100, 100, 50, 44);
      var legL = leg(58, 134, 25, 46), legR = leg(118, 134, 25, 46);
      var earL = S.e(54, 84, 17, 11, 20), earR = S.e(146, 84, 17, 11, -20);
      var hornL = S.p('M70,58 C62,44 66,34 74,34 C81,34 84,46 80,58 Z');
      var hornR = S.p('M130,58 C138,44 134,34 126,34 C119,34 116,46 120,58 Z');
      var sil = head + legL + legR + earL + earR + hornL + hornR;
      return [
        sky(sil, Sc.clouds([[34, 26, 11], [166, 30, 10]])),
        behind(head, B(legL, legR)),
        behind(head, B(S.p('M148,116 C164,120 170,138 164,152 C162,160 154,160 154,152'))),
        behind(head, B(earL, earR)),
        behind(head, B(hornL, hornR)),
        B(head),
        P.eyes(100, 88, 21, 11),
        behind(S.e(100, 120, 29, 20), B(S.p('M100,104 L100,112'))),
        B(S.e(100, 120, 29, 20)),
        S.dot(90, 118, 5), S.dot(110, 118, 5),
        P.smile(100, 130, 10),
        behind(head, B(S.c(66, 74, 12)) + B(S.e(132, 62, 15, 10, 20))),
        hoofBand(60, 170, 21), hoofBand(120, 170, 21),
        ground(186, sil, behind(sil, Sc.fence(150, 8, 40)))
      ];
    } },

    /* ---------------------------------------------------------- SHEEP */
    { id: 'sheep', name: 'Sheep', emoji: '🐑', art: function () {
      var wool = (function () {
        var d = '', i, a, x, y, N = 15;
        for (i = 0; i <= N; i++) {
          a = (Math.PI * 2 / N) * i - Math.PI / 2;
          x = 100 + Math.cos(a) * 54; y = 112 + Math.sin(a) * 42;
          d += (i ? ' A16,16 0 0 1 ' : 'M') + Math.round(x) + ',' + Math.round(y);
        }
        return S.p(d + ' Z');
      })();
      var face = S.e(100, 66, 26, 23);
      var legL = leg(68, 146, 20, 38), legR = leg(112, 146, 20, 38);
      var earL = S.e(70, 62, 16, 10, -22), earR = S.e(130, 62, 16, 10, 22);
      var sil = wool + face + legL + legR + earL + earR;
      return [
        sky(sil, Sc.sun(168, 28, 11) + Sc.clouds([[32, 26, 10]])),
        behind(wool, B(legL, legR)),
        behind(face, B(wool)),
        behind(face, B(earL, earR)),
        behind(face, B(
          S.p('M86,48 C80,36 84,28 90,30 C96,32 96,42 94,50 Z'),
          S.p('M114,48 C120,36 116,28 110,30 C104,32 104,42 106,50 Z')
        )),
        B(face),
        mark(wool, TH(S.c(76, 98, 12), S.c(112, 94, 11), S.c(94, 126, 12), S.c(126, 122, 10), S.c(68, 128, 9))),
        P.eyes(100, 62, 12, 8),
        S.e(100, 80, 10, 7), S.dot(100, 80, 5),
        P.smile(100, 88, 7),
        hoofBand(70, 176, 16), hoofBand(114, 176, 16),
        ground(186, sil)
      ];
    } },

    /* ----------------------------------------------------------- CRAB */
    { id: 'crab', name: 'Crab', emoji: '🦀', art: function () {
      var shell = S.p('M42,116 C42,88 70,68 100,68 C130,68 158,88 158,116 C158,136 130,148 100,148 C70,148 42,136 42,116 Z');
      // the pincer opens from the tip of the arm — floating lobes near
      // the arm read as leaves, not claws
      var armL = P.ribbon([[58, 104, 9], [46, 92, 8], [36, 80, 7]]);
      var armR = P.ribbon([[142, 104, 9], [154, 92, 8], [164, 80, 7]]);
      var clawL = S.p('M36,80 C26,68 16,62 10,64 C12,74 22,82 34,86 Z') +
        S.p('M36,80 C30,66 28,54 32,48 C42,52 46,64 44,76 Z');
      var clawR = S.p('M164,80 C174,68 184,62 190,64 C188,74 178,82 166,86 Z') +
        S.p('M164,80 C170,66 172,54 168,48 C158,52 154,64 156,76 Z');
      var legs = S.p('M60,142 L44,164 L32,160 M80,148 L72,170 L60,170 M120,148 L128,170 L140,170 M140,142 L156,164 L168,160');
      var sil = shell + clawL + clawR + armL + armR;
      return [
        sky(sil, Sc.sun(34, 28, 12) + Sc.clouds([[164, 30, 11]])),
        behind(shell, B(legs)),
        behind(shell + clawL + clawR, B(armL, armR)),
        behind(armL, B(clawL)), behind(armR, B(clawR)),
        behind(shell, B(S.p('M82,84 L82,62')) + B(S.p('M118,84 L118,62'))),
        B(shell),
        P.bigEye(82, 94, 11), P.bigEye(118, 94, 11),
        P.smile(100, 122, 14),
        behind(sil, TH(S.c(30, 178, 6), S.c(170, 180, 5), S.c(100, 182, 4)) + Sc.waves(170, 2))
      ];
    } },

    /* ------------------------------------------------------------ BEE */
    { id: 'bee', name: 'Bee', emoji: '🐝', art: function () {
      var body = S.e(100, 116, 42, 38);
      var head = S.c(100, 62, 28);
      var wingL = S.e(58, 82, 25, 15, -35), wingR = S.e(142, 82, 25, 15, 35);
      var sting = S.p('M100,154 L100,174 L92,167 M100,174 L108,167');
      var sil = body + head + wingL + wingR;
      return [
        sky(sil, Sc.sun(34, 28, 12) + Sc.clouds([[166, 30, 11]])),
        behind(head, B(S.p('M88,38 C82,20 72,12 60,10'), S.p('M112,38 C118,20 128,12 140,10'))),
        S.c(58, 8, 5), S.c(142, 8, 5),
        behind(body + head, B(wingL, wingR)),
        behind(body, B(sting)),
        behind(head, B(body)),
        // stripes stay strictly inside the body
        mark(body, S.p('M74,96 C84,142 116,142 126,96') + S.p('M62,116 C80,160 120,160 138,116')),
        B(head),
        P.eyes(100, 58, 11, 8),
        P.smile(100, 74, 10),
        ground(186, sil, behind(sil, Sc.flowerAt(28, 168, 11) + Sc.flowerAt(172, 170, 10)))
      ];
    } },

    /* -------------------------------------------------------- OCTOPUS */
    { id: 'octopus', name: 'Octopus', emoji: '🐙', art: function () {
      var head = S.p('M38,104 C38,62 66,34 100,34 C134,34 162,62 162,104 C162,120 156,128 146,130 L54,130 C44,128 38,120 38,104 Z');
      var arms = [
        S.p('M50,128 C36,148 24,158 12,158 C18,170 32,166 44,154 Z'),
        S.p('M70,130 C64,152 56,170 46,178 C58,186 68,176 74,158 Z'),
        S.p('M92,130 C90,154 86,172 78,186 C90,190 98,178 100,160 Z'),
        S.p('M114,130 C118,154 124,172 132,186 C142,176 138,160 130,144 Z'),
        S.p('M136,130 C146,152 156,166 168,176 C176,164 166,150 152,138 Z'),
        S.p('M150,128 C164,144 176,152 188,152 C186,164 170,160 156,148 Z')
      ].join('');
      var sil = head + arms;
      return [
        behind(head, B(arms)),
        B(head),
        P.bigEye(80, 88, 14), P.bigEye(120, 88, 14),
        P.smile(100, 112, 12),
        mark(arms, TH(S.c(56, 148, 5), S.c(84, 170, 5), S.c(118, 170, 5), S.c(150, 150, 5))),
        behind(sil, Sc.bubbles([[24, 46, 7], [176, 42, 6], [16, 82, 4]]) + Sc.waves(190, 1))
      ];
    } },

    /* -------------------------------------------------------- SEAHORSE */
    { id: 'seahorse', name: 'Seahorse', emoji: '🌊', art: function () {
      // One continuous tapering body that hooks into a tail — the old
      // stack of loose circles never read as a seahorse at all.
      // the body's first spine point sits *inside* the head so the
      // ribbon's flat end cap never shows as a corner
      // narrow neck below a distinctly wider head, then a body that
      // thickens and curls into the tail
      var body = P.ribbon([
        [130, 56, 13], [120, 78, 18], [108, 106, 21], [104, 134, 18],
        [114, 155, 14], [128, 168, 10], [132, 178, 7], [119, 183, 5], [108, 178, 4]
      ]);
      var head = S.e(134, 48, 24, 22, -10);
      var snout = P.ribbon([[148, 54, 12], [164, 62, 9], [178, 70, 5]]);
      var crest = S.p('M122,30 L114,10 L132,22 Z') + S.p('M136,24 L146,8 L152,24 Z');
      var finD = S.e(84, 110, 12, 20, -18);
      var finP = S.e(112, 90, 12, 8, 24);
      var sil = body + head + snout + crest + finD;
      return [
        behind(body, B(finD)),
        behind(head, B(crest)),
        behind(head, B(snout)),
        behind(head, B(body)),
        B(head),
        behind(head, B(finP)),
        P.bigEye(138, 44, 7),
        mark(body, TH(S.p('M110,82 L130,88 M98,108 L120,112 M98,136 L118,138 M110,160 L124,160'))),
        behind(sil, Sc.seaweed(24, 190, 44) + Sc.seaweed(180, 190, 36) +
          Sc.bubbles([[30, 46, 8], [48, 26, 5], [176, 122, 6], [188, 100, 4]]) + Sc.waves(184, 2))
      ];
    } },

    /* ----------------------------------------------------------- CHICK */
    { id: 'chick', name: 'Baby Chick', emoji: '🐣', art: function () {
      var body = S.c(100, 88, 42);
      // the cracked shell has to sit clear below the beak, or the
      // zig-zag reads as part of the chick's face
      var shell = S.p('M48,152 L62,134 L76,150 L92,130 L108,150 L124,128 L140,148 L152,154 ' +
        'C152,174 128,186 100,186 C72,186 48,174 48,152 Z');
      var wingL = S.e(56, 102, 12, 19, 22), wingR = S.e(144, 102, 12, 19, -22);
      var sil = body + shell + wingL + wingR;
      return [
        sky(sil, Sc.sun(34, 28, 12) + Sc.clouds([[164, 26, 11]])),
        behind(body + shell, B(wingL, wingR)),
        behind(body, B(S.p('M100,46 C96,30 100,20 108,14 C106,26 108,36 112,44'))),
        behind(shell, B(body)),
        B(shell),
        mark(shell, TH(S.p('M56,166 C78,175 122,175 144,166'))),
        P.eyes(100, 80, 15, 10),
        B(S.p('M100,94 L88,104 L100,114 L112,104 Z')),
        TH(P.blush(74, 92, 8), P.blush(126, 92, 8)),
        ground(192, sil)
      ];
    } },

    /* ------------------------------------------------------------ DINO */
    { id: 'dino', name: 'Dinosaur', emoji: '🦕', art: function () {
      var body = S.p('M34,138 C34,112 58,96 94,96 C128,96 150,112 150,136 C150,156 138,166 114,166 L70,166 C46,166 34,158 34,138 Z');
      var neck = P.ribbon([[116, 128, 24], [122, 100, 20], [132, 76, 17], [150, 50, 14]]);
      var head = S.e(160, 44, 23, 18, -14);
      var tail = P.ribbon([[48, 130, 19], [28, 140, 13], [13, 154, 7]]);
      var legs = leg(50, 160, 24, 30) + leg(78, 162, 22, 28) +
        leg(108, 162, 22, 28) + leg(132, 160, 24, 30);
      var plates = S.p('M48,106 C50,95 60,95 62,105 Z') + S.p('M66,99 C68,88 78,88 80,98 Z') +
        S.p('M86,96 C88,85 98,85 100,95 Z') + S.p('M104,90 C104,80 114,78 116,89 Z') +
        S.p('M112,70 C111,60 121,57 124,67 Z') + S.p('M124,52 C123,42 133,40 136,50 Z');
      var sil = body + neck + head + tail + legs;
      return [
        sky(sil, Sc.sun(30, 28, 12) + Sc.clouds([[96, 20, 10]])),
        behind(body, B(legs)),
        behind(body, B(tail)),
        behind(body + head, B(neck)),
        behind(body + neck, B(plates)),
        behind(neck, B(head)),
        behind(neck + head, B(body)),
        P.bigEye(168, 40, 7),
        S.p('M180,52 C174,57 166,57 161,54'),
        mark(body, TH(S.c(66, 130, 9), S.c(96, 140, 9), S.c(122, 126, 8), S.c(84, 154, 7))),
        ground(190, sil)
      ];
    } }
  ];

  A.forEach(function (p) { p.cat = 'animals'; Art.pages[p.id] = p; });
  Art.categories.push({ id: 'animals', name: 'Animals', emoji: '🦁', color: '#FF7A59', pages: A });
})(window.Art);
