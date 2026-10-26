/* Amelia Colors — super cars (detailed three-quarter view)
   The grown-up car pages: a real perspective drawing rather than a
   side-profile silhouette, for an older child who wants something that
   looks like a proper coloring book.

   ---- how a three-quarter car is built here ----------------------
   Guessing coordinates for a perspective drawing produces a lumpy
   blob. Every car in this file is constructed instead:

     1. A SIDE PROFILE is a run of points along the near flank, front
        bottom → nose → hood → fender crown → cowl → roof → tail.
     2. The whole profile is copied back along the viewing direction by
        `depth`, scaled per point by `depthScale`, giving the FAR flank.
     3. The outer silhouette runs: near front bottom → across the front
        fascia → up and over the FAR contour (it is the higher of the
        two, so it is the skyline) → across the rear deck → down the
        NEAR tail → along the near rocker and its two wheel arches.
     4. The near contour drawn as an interior line, plus one cross line
        per profile point, cuts the top of the car into real quads:
        fascia, nose, hood, windscreen, roof, rear glass, deck.
     5. Local detail is placed with bil() — bilinear interpolation
        across one of those quads — so a headlight or an air intake
        sits ON its surface and shares its perspective instead of
        floating in front of the drawing.

   Three things this drawing gets wrong unless they are deliberate:

   * depthScale must TAPER over the greenhouse (~0.58). With a single
     constant offset the roof comes out as wide as the body and the car
     reads as a van.
   * The fender crown is the highest point of the front bodywork, above
     both the hood edge and the cowl — what a real supercar does, and
     also what buys room for the arch: the arch has to clear the tyre by
     ~7 units and still sit ~11 units below the metal above it.
   * A door number has to be BIG. S.glyph is stroked, not filled, at a
     fixed ~2.2 units; under about font-size 16 that outline is wider
     than the digit's own stems and the glyph renders as a solid blob.
   * Flank detail must be masked by the ARCH OPENINGS. A door shut line
     or a diffuser that is merely drawn in the right place still runs
     straight across the tyre, because the wheels are drawn after it.

   ---- house rules on top of the animals' rules -------------------
   1. Every panel line must CLOSE against something. A crease that stops
      in open bodywork encloses nothing and reads as a scratch.
   2. The wheel well is a region, not a gap — see above.
   3. Detail goes where a child looks first: wheels, lights, intakes.
      Big clean door panels are the point; that is where colour goes. */
(function (Art) {
  'use strict';
  var S = Art.S, Sc = Art.Scene;
  var B = S.bold, T = S.thinW, H = S.hairW;
  var behind = Art.behind;

  function pt(p) { return p[0] + ',' + p[1]; }
  function line(a, b) { return S.p('M' + pt(a) + ' L' + pt(b)); }
  function poly(list) { return S.p('M' + list.map(pt).join(' L') + ' Z'); }

  /* Catmull-Rom through the profile points, emitted as cubic Beziers.
     Straight segments between profile points make the car read as a
     faceted low-poly wedge; a real coloring-book car is curved. Returns
     only the C commands, so the caller places the starting point. */
  function curveD(p, t) {
    t = t == null ? 0.85 : t;
    var d = '', i, p0, p1, p2, p3;
    for (i = 0; i < p.length - 1; i++) {
      p0 = p[Math.max(i - 1, 0)]; p1 = p[i];
      p2 = p[i + 1]; p3 = p[Math.min(i + 2, p.length - 1)];
      d += ' C' + pt([p1[0] + (p2[0] - p0[0]) / 6 * t, p1[1] + (p2[1] - p0[1]) / 6 * t]) +
           ' ' + pt([p2[0] - (p3[0] - p1[0]) / 6 * t, p2[1] - (p3[1] - p1[1]) / 6 * t]) +
           ' ' + pt(p2);
    }
    return d;
  }

  /* bilinear point inside a quad: u runs near→far, v runs bottom→top */
  function bil(a, b, c, d, u, v) {
    var lo = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
    var hi = [d[0] + (c[0] - d[0]) * u, d[1] + (c[1] - d[1]) * u];
    return [lo[0] + (hi[0] - lo[0]) * v, lo[1] + (hi[1] - lo[1]) * v];
  }
  function on(q, u, v) { return bil(q[0], q[1], q[2], q[3], u, v); }
  // a rectangle in quad space → a perspective-correct quad
  function panel(q, u0, v0, u1, v1) {
    return poly([on(q, u0, v0), on(q, u1, v0), on(q, u1, v1), on(q, u0, v1)]);
  }

  /* ---- wheels ---------------------------------------------------
     Each spoke is a closed tapered shape, so the spokes AND the gaps
     between them are both colourable. */
  function spokeRim(w, n, rot) {
    var cx = w[0], cy = w[1], r = w[2];
    /* One lip circle, not two. A sidewall ring AND a rim-lip ring
       leaves a 2-unit annulus between them that no finger can hit, and
       the spokes must reach the lip exactly for the same reason — stop
       them short and the leftover ring is another unfillable sliver. */
    /* Spoke COUNT is the thing to watch. The roots all land on one
       small hub circle, so at 10-12 spokes they crowd into a ring of
       slivers no finger can hit — a 12-spoke wire wheel scored 62
       untappable regions on its own. Eight is the ceiling here, and the
       hub grows with n so the roots keep their spacing. */
    var lip = r * 0.70;
    var out = B(S.c(cx, cy, r)) + S.c(cx, cy, lip);
    n = Math.min(n, 8);
    var hub = r * (0.22 + n * 0.012), tip = lip, i, a, half = Math.PI / n * 0.52;
    for (i = 0; i < n; i++) {
      a = (Math.PI * 2 / n) * i + (rot || 0);
      out += T(S.p(
        'M' + (cx + Math.cos(a - half * 0.62) * hub) + ',' + (cy + Math.sin(a - half * 0.62) * hub) +
        ' L' + (cx + Math.cos(a - half) * tip) + ',' + (cy + Math.sin(a - half) * tip) +
        ' A' + tip + ',' + tip + ' 0 0 1 ' +
        (cx + Math.cos(a + half) * tip) + ',' + (cy + Math.sin(a + half) * tip) +
        ' L' + (cx + Math.cos(a + half * 0.62) * hub) + ',' + (cy + Math.sin(a + half * 0.62) * hub) + ' Z'));
    }
    return out + S.c(cx, cy, hub);
  }

  /* Chunky off-road tread: lugs sitting on the tyre ring, each one its
     own small region. Kept at ~5 units so they stay tappable. */
  function tread(w, n) {
    var out = '', i, a, r0 = w[2] * 0.84, r1 = w[2] * 0.99, hw = Math.PI / n * 0.34;
    for (i = 0; i < n; i++) {
      a = (Math.PI * 2 / n) * i;
      out += T(S.p('M' + (w[0] + Math.cos(a - hw) * r0) + ',' + (w[1] + Math.sin(a - hw) * r0) +
        ' L' + (w[0] + Math.cos(a - hw) * r1) + ',' + (w[1] + Math.sin(a - hw) * r1) +
        ' A' + r1 + ',' + r1 + ' 0 0 1 ' + (w[0] + Math.cos(a + hw) * r1) + ',' + (w[1] + Math.sin(a + hw) * r1) +
        ' L' + (w[0] + Math.cos(a + hw) * r0) + ',' + (w[1] + Math.sin(a + hw) * r0) + ' Z'));
    }
    return out;
  }

  /* A bolt-on arch flare: a second arc outside the opening, so the
     widebody lip is its own colourable band. */
  function flare(w, rockerY, grow) {
    var R = w[3] + grow, dy = rockerY - w[1], dx = Math.sqrt(Math.max(R * R - dy * dy, 1));
    var top = w[1] - R;
    return B(S.p('M' + (w[0] + dx) + ',' + rockerY +
      ' C' + (w[0] + dx) + ',' + (top + (rockerY - top) * 0.45) + ' ' + (w[0] + R * 0.72) + ',' + top + ' ' + w[0] + ',' + top +
      ' C' + (w[0] - R * 0.72) + ',' + top + ' ' + (w[0] - dx) + ',' + (top + (rockerY - top) * 0.45) + ' ' + (w[0] - dx) + ',' + rockerY));
  }

  // the pool of shade under the car — a closed lens, so it fills
  function shadow(x, y, w, h) {
    return H(S.p('M' + (x - w) + ',' + y +
      ' C' + (x - w * 0.55) + ',' + (y - h) + ' ' + (x + w * 0.55) + ',' + (y - h) + ' ' + (x + w) + ',' + y +
      ' C' + (x + w * 0.55) + ',' + (y + h) + ' ' + (x - w * 0.55) + ',' + (y + h) + ' ' + (x - w) + ',' + y + ' Z'));
  }

  /* Build the shell from a profile. Hands back the quads too, so the
     per-car art can hang detail on a named surface. */
  function chassis(o) {
    var d = o.depth, N = o.profile, ds = o.depthScale;
    /* A depthScale entry is either one number or a [kx, ky] pair. The
       pair matters: the far flank is not just a translated copy — it is
       further away, so its vertical extents compress. Without a bigger
       ky over the rear the far contour sinks onto the near one and the
       whole greenhouse pinches shut into a sliver. */
    var F = N.map(function (p, i) {
      var k = ds ? ds[i] : 1;
      if (typeof k === 'number') k = [k, k];
      return [p[0] - d[0] * k[0], p[1] - d[1] * k[1]];
    });
    var last = N.length - 1;          // the tail foot — near face only

    function arch(w) {
      var dy = o.rockerY - w[1], dx = Math.sqrt(Math.max(w[3] * w[3] - dy * dy, 1));
      var top = w[1] - w[3], mid = top + (o.rockerY - top) * 0.45;
      return { x0: w[0] + dx, x1: w[0] - dx,
        d: 'C' + (w[0] + dx) + ',' + mid + ' ' + (w[0] + w[3] * 0.72) + ',' + top + ' ' + w[0] + ',' + top +
           ' C' + (w[0] - w[3] * 0.72) + ',' + top + ' ' + (w[0] - dx) + ',' + mid + ' ' + (w[0] - dx) + ',' + o.rockerY };
    }
    var aF = arch(o.frontWheel), aR = arch(o.rearWheel);

    var sil = S.p('M' + pt(N[0]) +
      ' L' + pt(F[0]) + curveD(F.slice(0, last)) +          // fascia + the far skyline
      ' L' + pt(N[last - 1]) + ' L' + pt(N[last]) +         // rear deck, near tail
      ' L' + pt(o.tailFoot) +
      ' L' + aR.x0 + ',' + o.rockerY + ' ' + aR.d +
      ' L' + aF.x0 + ',' + o.rockerY + ' ' + aF.d + ' Z');

    var nearTop = S.p('M' + pt(N[1]) + curveD(N.slice(1, last)));
    var cross = '';
    for (var i = 1; i < last - 1; i++) cross += line(N[i], F[i]);

    return { N: N, F: F, sil: sil, nearTop: nearTop, cross: cross,
      arches: S.p('M' + aF.x0 + ',' + o.rockerY + ' ' + aF.d) +
              S.p('M' + aR.x0 + ',' + o.rockerY + ' ' + aR.d),
      // the wheel openings — flank detail is masked by these
      wells: S.c(o.frontWheel[0], o.frontWheel[1], o.frontWheel[3]) +
             S.c(o.rearWheel[0], o.rearWheel[1], o.rearWheel[3]),
      tyres: S.c(o.frontWheel[0], o.frontWheel[1], o.frontWheel[2]) +
             S.c(o.rearWheel[0], o.rearWheel[1], o.rearWheel[2]),
      // the surface between profile points i and i+1, near → far
      quad: function (i) { return [N[i], F[i], F[i + 1], N[i + 1]]; } };
  }

  /* Assembly order, every car:
       sky (cut by the car) → shadow (cut by the car) → shell →
       bodywork detail (cut by the wheel openings) → wing → wheels
     `wing` stands clear of the deck with air under it, so it joins the
     occluder set for the sky but is drawn after the body. */
  function build(o, c) {
    var mass = c.sil + (o.wing || '') + c.tyres;
    return [Art.fit(o.scale || 0.92, o.tx == null ? 8 : o.tx, o.ty == null ? 6 : o.ty, [
      behind(mass, o.sky || ''),
      behind(mass, o.ground || ''),
      B(c.sil),
      c.nearTop + c.cross + c.arches,
      behind(c.wells, o.art || ''),
      o.wing ? (o.wingArt || '') + B(o.wing) : '',
      spokeRim(o.frontWheel, o.spokes || 6, o.rot || -0.26),
      spokeRim(o.rearWheel, o.spokes || 6, o.rot || -0.26)
    ])];
  }

  var C = [

    /* Turbo GT — mid-engine wedge with a high rear wing. */
    { id: 'turbo-gt', name: 'Turbo GT', emoji: '\u{1F3CE}\u{FE0F}', art: function () {
      var o = {
        depth: [19, 12],
        //  0 front bottom · 1 nose lower · 2 nose top · 3 hood edge
        //  4 fender crown · 5 cowl · 6 screen top · 7 roof rear
        //  8 engine deck · 9 tail top · 10 tail bottom
        profile: [[40, 154], [30, 136], [33, 124], [50, 118], [76, 109],
                  [106, 111], [132, 91], [152, 90], [178, 101], [192, 107], [194, 134]],
        depthScale: [1, 1, 1, 1, [0.98, 1], [0.88, 1.15], [0.58, 1.05],
                     [0.56, 1.05], [0.72, 1.45], [0.85, 1.55], [0.85, 1.55]],
        tailFoot: [188, 154],
        rockerY: 154,
        frontWheel: [76, 145, 19, 26],
        rearWheel: [158, 145, 19, 26],
        spokes: 6,
        scale: 0.94, tx: 6, ty: 10,
        sky: Sc.clouds([[26, 30, 9]]) + Sc.stars([[184, 22, 6]]),
        ground: shadow(112, 166, 78, 6),
        wing: poly([[150, 62], [196, 72], [196, 79], [150, 69]])
      };
      var c = chassis(o);
      var grille = c.quad(0), hood = c.quad(3), cowl = c.quad(4);

      o.wingArt =
        poly([[163, 67], [168, 68], [171, 96], [166, 95]]) +      // wing uprights
        poly([[184, 72], [189, 73], [191, 104], [186, 103]]);

      o.art =
        // ---- front fascia: intake, slats, splitter --------------
        panel(grille, 0.14, 0.22, 0.86, 0.70) +
        T(line(on(grille, 0.38, 0.22), on(grille, 0.38, 0.70))) +
        T(line(on(grille, 0.62, 0.22), on(grille, 0.62, 0.70))) +
        // ---- headlights: swept LED blades on the front corners --
        B(poly([[36, 128], [56, 119], [60, 125], [40, 134]])) +
        B(poly([[17, 116], [37, 107], [41, 113], [21, 122]])) +
        S.c(49, 137, 3.4) +                                       // driving lamp
        // ---- hood: shut lines, centre crease, badge -------------
        line(on(hood, 0.22, 0), on(hood, 0.22, 1)) +
        line(on(hood, 0.78, 0), on(hood, 0.78, 1)) +
        S.c.apply(S, on(hood, 0.5, 0.52).concat([3.6])) +
        T(panel(cowl, 0.06, 0.16, 0.34, 0.54)) +                  // fender vent
        // ---- near flank -----------------------------------------
        /* The glass is closed by the roofline itself — A-pillar,
           C-pillar and beltline only. Drawing its own top edge lays a
           straight chord under a curved contour and the lens between
           them is an unfillable sliver. */
        line([111, 107], [132, 91]) +                             // A-pillar
        line([152, 90], [147, 109]) +                             // C-pillar
        line([111, 107], [147, 109]) +                            // beltline
        line([108, 110], [101, 152]) +                            // door shut, front
        line([150, 92], [144, 152]) +                             // door shut, rear
        S.r(116, 119, 12, 5, 2) +                                 // handle
        poly([[104, 153], [141, 152], [141, 146], [104, 147]]) +  // side skirt
        poly([[134, 111], [146, 114], [143, 122], [135, 119]]) +  // side scoop
        T(S.p('M138,113 L136,119')) +
        B(poly([[97, 100], [109, 97], [111, 104], [99, 107]])) +  // mirror
        // ---- tail -----------------------------------------------
        poly([[156, 101], [178, 107], [176, 117], [155, 111]]) +  // engine louvres
        T(S.p('M162,103 L160,113 M169,105 L167,115')) +
        poly([[184, 111], [193, 114], [193, 123], [184, 120]]) +  // tail light
        poly([[170, 138], [189, 141], [188, 149], [170, 146]]) +  // diffuser
        T(S.p('M177,140 L176,148 M183,141 L182,149'));
      return build(o, c);
    } },

    /* Thunder — long-hood American muscle, fastback, big rear meat. */
    { id: 'thunder-v8', name: 'Thunder V8', emoji: '\u{1F525}', art: function () {
      var o = {
        depth: [21, 13],
        profile: [[38, 154], [28, 139], [30, 123], [46, 115], [72, 107],
                  [104, 109], [126, 88], [146, 87], [178, 100], [192, 105], [194, 134]],
        depthScale: [1, 1, 1, 1, [0.98, 1], [0.90, 1.12], [0.62, 1.05],
                     [0.60, 1.05], [0.80, 1.40], [0.88, 1.50], [0.88, 1.50]],
        tailFoot: [190, 154],
        rockerY: 154,
        frontWheel: [74, 145, 19, 26],
        rearWheel: [158, 145, 20, 27],
        spokes: 5,
        scale: 0.94, tx: 6, ty: 10,
        sky: Sc.clouds([[28, 28, 10], [172, 22, 8]]),
        ground: shadow(112, 166, 80, 6)
      };
      var c = chassis(o);
      var grille = c.quad(0), hood = c.quad(3), deck = c.quad(8);

      o.art =
        // ---- blunt muscle nose: wide grille, quad round lamps ----
        panel(grille, 0.10, 0.30, 0.90, 0.74) +
        T(line(on(grille, 0.50, 0.30), on(grille, 0.50, 0.74))) +
        S.c(44, 130, 5) + S.c(33, 123, 4.4) +                     // near lamp pair
        S.c(25, 118, 4.6) + S.c(15, 111, 4) +                     // far lamp pair
        // ---- long hood: centre stripe, scoop, badge -------------
        panel(hood, 0.38, 0.04, 0.62, 0.96) +                     // racing stripe
        poly([[58, 110], [78, 104], [84, 108], [64, 114]]) +      // hood scoop
        T(line([62, 110], [80, 105])) +
        // ---- near flank ------------------------------------------
        line([106, 106], [128, 88]) +                             // A-pillar
        line([146, 87], [142, 108]) +                             // C-pillar
        line([106, 106], [142, 108]) +                            // beltline
        line([104, 108], [98, 152]) +                             // door shut, front
        line([144, 90], [138, 152]) +                             // door shut, rear
        S.r(114, 118, 12, 5, 2) +
        poly([[100, 153], [136, 152], [136, 146], [100, 147]]) +  // rocker
        poly([[106, 136], [126, 138], [126, 145], [106, 143]]) +  // side pipe
        T(S.p('M112,137 L112,144 M119,137 L119,145')) +
        B(poly([[92, 99], [104, 96], [106, 103], [94, 106]])) +   // mirror
        // ---- tail: ducktail lip, round lamps, bumper ------------
        panel(deck, 0.34, 0.10, 0.66, 0.90) +                     // deck stripe
        poly([[176, 104], [193, 109], [193, 115], [176, 110]]) +  // ducktail lip
        S.c(184, 123, 4.6) + S.c(173, 120, 4.2) +                 // tail lamps
        poly([[166, 138], [190, 142], [189, 150], [166, 146]]) +
        T(S.p('M174,140 L173,148 M182,141 L181,149'));
      return build(o, c);
    } },

    /* Hyper X — cab-forward hypercar, razor nose, low fixed wing. */
    { id: 'hyper-x', name: 'Hyper X', emoji: '\u{26A1}', art: function () {
      var o = {
        depth: [18, 11],
        profile: [[32, 154], [24, 144], [30, 129], [52, 121], [78, 110],
                  [100, 113], [124, 90], [150, 89], [180, 103], [192, 109], [194, 136]],
        depthScale: [1, 1, 1, 1, [0.98, 1], [0.86, 1.18], [0.54, 1.08],
                     [0.54, 1.08], [0.74, 1.45], [0.86, 1.55], [0.86, 1.55]],
        tailFoot: [188, 154],
        rockerY: 154,
        frontWheel: [76, 145, 19, 26],
        rearWheel: [158, 145, 19, 26],
        spokes: 7,
        scale: 0.94, tx: 6, ty: 10,
        sky: Sc.stars([[30, 26, 7], [54, 40, 5], [184, 24, 6]]),
        ground: shadow(110, 166, 78, 6),
        wing: poly([[158, 86], [196, 94], [196, 100], [158, 92]])
      };
      var c = chassis(o);
      var grille = c.quad(0), hood = c.quad(3), cowl = c.quad(4);

      o.wingArt =
        poly([[168, 92], [173, 93], [174, 103], [169, 102]]) +
        poly([[186, 96], [191, 97], [192, 107], [187, 106]]);

      o.art =
        // ---- razor nose: splitter blade and twin intakes --------
        panel(grille, 0.08, 0.34, 0.44, 0.76) +
        panel(grille, 0.56, 0.34, 0.92, 0.76) +
        line(on(grille, 0.10, 0.18), on(grille, 0.90, 0.18)) +
        // ---- angular lights -------------------------------------
        B(poly([[36, 131], [56, 123], [58, 129], [40, 136]])) +
        B(poly([[18, 120], [38, 112], [40, 118], [22, 125]])) +
        // ---- hood: twin channels --------------------------------
        panel(hood, 0.14, 0.10, 0.36, 0.90) +
        panel(hood, 0.64, 0.10, 0.86, 0.90) +
        T(panel(cowl, 0.06, 0.14, 0.32, 0.50)) +
        // ---- near flank: the big mid-engine intake ---------------
        line([104, 110], [124, 90]) +                             // A-pillar
        line([150, 89], [146, 110]) +                             // C-pillar
        line([104, 110], [146, 110]) +                            // beltline
        line([102, 112], [96, 152]) +                             // door shut, front
        line([148, 91], [142, 152]) +                             // door shut, rear
        S.r(112, 120, 12, 5, 2) +
        poly([[98, 153], [140, 152], [140, 146], [98, 147]]) +
        poly([[126, 112], [144, 116], [141, 128], [128, 124]]) +  // side intake
        T(S.p('M132,113 L130,124 M137,115 L135,126')) +
        B(poly([[90, 103], [102, 100], [104, 107], [92, 110]])) + // mirror
        // ---- tail: light bar and four-fin diffuser --------------
        poly([[166, 112], [192, 117], [191, 124], [166, 119]]) +
        poly([[166, 136], [190, 140], [189, 150], [166, 146]]) +
        T(S.p('M173,138 L172,148 M180,139 L179,149 M187,140 L186,150'));
      return build(o, c);
    } },

    /* Dune Raider — rally raid truck: ride height, roof lamps, lugs. */
    { id: 'dune-raider', name: 'Dune Raider', emoji: '\u{1F3DC}\u{FE0F}', art: function () {
      var o = {
        depth: [21, 13],
        profile: [[40, 144], [30, 128], [32, 112], [48, 104], [74, 95],
                  [104, 97], [126, 76], [148, 75], [176, 88], [190, 94], [192, 124]],
        depthScale: [1, 1, 1, 1, [0.98, 1], [0.90, 1.14], [0.64, 1.06],
                     [0.62, 1.06], [0.82, 1.40], [0.88, 1.50], [0.88, 1.50]],
        tailFoot: [186, 144],
        rockerY: 144,
        frontWheel: [76, 140, 22, 31],
        rearWheel: [158, 140, 22, 31],
        spokes: 5,
        scale: 0.92, tx: 8, ty: 14,
        sky: Sc.sun(30, 28, 11) + Sc.clouds([[170, 24, 9]]),
        ground: shadow(112, 164, 80, 6),
        wing: poly([[112, 60], [168, 66], [168, 73], [112, 67]])   // roof lamp bar
      };
      var c = chassis(o);
      var grille = c.quad(0), hood = c.quad(3);

      o.wingArt =
        S.c(124, 64, 4.4) + S.c(138, 65.5, 4.4) + S.c(152, 67, 4.4) +
        poly([[118, 67], [123, 67.5], [125, 80], [120, 79.5]]) +
        poly([[156, 71], [161, 71.5], [159, 84], [154, 83.5]]);

      o.art =
        // ---- blunt nose with a bull bar -------------------------
        panel(grille, 0.10, 0.34, 0.90, 0.72) +
        T(line(on(grille, 0.34, 0.34), on(grille, 0.34, 0.72))) +
        T(line(on(grille, 0.66, 0.34), on(grille, 0.66, 0.72))) +
        line(on(grille, 0.04, 0.14), on(grille, 0.96, 0.14)) +
        S.c(45, 118, 5) + S.c(26, 106, 5) +                        // round lamps
        // ---- hood: spare-wheel strap and a number roundel -------
        panel(hood, 0.30, 0.08, 0.70, 0.92) +
        T(panel(hood, 0.40, 0.26, 0.60, 0.74)) +
        // ---- near flank ------------------------------------------
        line([106, 94], [126, 76]) +                              // A-pillar
        line([148, 75], [144, 96]) +                              // C-pillar
        line([106, 94], [144, 96]) +                              // beltline
        line([104, 96], [100, 142]) +                             // door shut, front
        line([146, 78], [140, 142]) +                             // door shut, rear
        S.r(104, 104, 12, 5, 2) +
        S.c(117, 118, 11) + S.glyph('4', 117, 119, 17) +          // door roundel
        poly([[102, 143], [138, 142], [138, 136], [102, 137]]) +  // rock slider
        B(poly([[92, 87], [104, 84], [106, 91], [94, 94]])) +     // mirror
        // ---- tail ------------------------------------------------
        poly([[180, 100], [191, 104], [190, 112], [180, 108]]) +
        poly([[164, 126], [186, 130], [185, 139], [164, 135]]) +   // spare wheel carrier
        T(S.c(175, 132, 5)) +
        tread(o.frontWheel, 12) + tread(o.rearWheel, 12);
      return build(o, c);
    } },

    /* Smoke Show — widebody drift car: arch flares, fat wing, pipes. */
    { id: 'smoke-show', name: 'Smoke Show', emoji: '\u{1F4A8}', art: function () {
      var o = {
        depth: [21, 13],
        profile: [[38, 154], [28, 138], [32, 122], [50, 114], [76, 106],
                  [106, 108], [128, 88], [150, 87], [178, 100], [192, 106], [194, 134]],
        depthScale: [1, 1, 1, 1, [0.98, 1], [0.90, 1.14], [0.62, 1.06],
                     [0.60, 1.06], [0.80, 1.42], [0.88, 1.52], [0.88, 1.52]],
        tailFoot: [188, 154],
        rockerY: 154,
        frontWheel: [76, 145, 19, 25],
        rearWheel: [158, 145, 19, 25],
        spokes: 8,
        scale: 0.92, tx: 8, ty: 10,
        sky: Sc.clouds([[30, 26, 9], [176, 30, 11]]),
        ground: shadow(112, 166, 80, 6),
        wing: poly([[152, 70], [196, 80], [196, 87], [152, 77]])
      };
      var c = chassis(o);
      var grille = c.quad(0), hood = c.quad(3);

      o.wingArt =
        poly([[164, 75], [169, 76], [171, 95], [166, 94]]) +
        poly([[185, 80], [190, 81], [191, 102], [186, 101]]);

      o.art =
        // ---- front: splitter, canards, slim lights --------------
        panel(grille, 0.12, 0.28, 0.88, 0.70) +
        T(line(on(grille, 0.50, 0.28), on(grille, 0.50, 0.70))) +
        line(on(grille, 0.02, 0.12), on(grille, 0.98, 0.12)) +
        poly([[28, 136], [40, 140], [38, 145], [26, 141]]) +      // canard
        B(poly([[36, 126], [56, 118], [59, 124], [39, 132]])) +
        B(poly([[18, 113], [38, 105], [41, 111], [21, 119]])) +
        // ---- hood: vents and pins --------------------------------
        panel(hood, 0.18, 0.14, 0.40, 0.56) +
        panel(hood, 0.60, 0.14, 0.82, 0.56) +
        // ---- near flank ------------------------------------------
        line([108, 105], [128, 88]) +
        line([150, 87], [146, 107]) +
        line([108, 105], [146, 107]) +
        line([106, 107], [100, 152]) +
        line([148, 89], [140, 152]) +
        S.r(106, 116, 12, 5, 2) +
        S.c(118, 131, 11) + S.glyph('7', 118, 132, 17) +          // door number
        poly([[102, 153], [138, 152], [138, 146], [102, 147]]) +
        B(poly([[94, 98], [106, 95], [108, 102], [96, 105]])) +   // mirror
        // ---- arch flares -----------------------------------------
        flare(o.frontWheel, o.rockerY, 6) + flare(o.rearWheel, o.rockerY, 6) +
        // ---- tail: twin pipes ------------------------------------
        poly([[182, 110], [193, 114], [192, 122], [182, 118]]) +
        poly([[164, 138], [188, 142], [187, 150], [164, 146]]) +
        S.c(170, 150, 3.6) + S.c(180, 151, 3.6);
      return build(o, c);
    } },

    /* Night Racer — classic endurance coupe: long tail, roundel, covers. */
    { id: 'night-racer', name: 'Night Racer', emoji: '\u{1F319}', art: function () {
      var o = {
        depth: [20, 12],
        profile: [[34, 152], [26, 140], [32, 126], [54, 118], [78, 110],
                  [104, 112], [126, 92], [148, 91], [182, 102], [194, 108], [195, 132]],
        depthScale: [1, 1, 1, 1, [0.98, 1], [0.88, 1.16], [0.60, 1.06],
                     [0.58, 1.06], [0.78, 1.42], [0.88, 1.52], [0.88, 1.52]],
        tailFoot: [190, 152],
        rockerY: 152,
        frontWheel: [76, 143, 19, 26],
        rearWheel: [160, 143, 19, 26],
        spokes: 8,
        scale: 0.94, tx: 5, ty: 12,
        sky: Sc.stars([[28, 24, 7], [52, 38, 5], [182, 22, 6], [160, 36, 5]]),
        ground: shadow(112, 164, 80, 6)
      };
      var c = chassis(o);
      var grille = c.quad(0), hood = c.quad(3), cowl = c.quad(4);

      o.art =
        // ---- oval mouth and covered round lamps -----------------
        panel(grille, 0.14, 0.30, 0.86, 0.72) +                   // mouth
        line(on(grille, 0.08, 0.14), on(grille, 0.92, 0.14)) +
        S.c(45, 128, 5.4) + S.c(27, 117, 5.2) +                    // lamps under covers
        // ---- hood: twin humps and a filler cap ------------------
        panel(hood, 0.16, 0.18, 0.40, 0.70) +
        panel(hood, 0.60, 0.18, 0.84, 0.70) +
        S.c.apply(S, on(hood, 0.5, 0.80).concat([4])) +
        T(panel(cowl, 0.06, 0.16, 0.30, 0.52)) +
        // ---- near flank: roundel on the door --------------------
        line([106, 109], [126, 92]) +
        line([148, 91], [144, 111]) +
        line([106, 109], [144, 111]) +
        line([104, 111], [98, 150]) +
        line([146, 93], [140, 150]) +
        S.r(105, 119, 12, 5, 2) +
        S.c(119, 132, 11) + S.glyph('9', 119, 133, 17) +
        poly([[100, 151], [138, 150], [138, 144], [100, 145]]) +
        B(poly([[92, 102], [104, 99], [106, 106], [94, 109]])) +  // mirror
        // ---- long tail: lamp pair and quad pipes ----------------
        S.c(184, 118, 4.6) + S.c(173, 115, 4.2) +
        poly([[166, 136], [190, 140], [189, 148], [166, 144]]) +
        S.c(172, 147, 3.2) + S.c(180, 148, 3.2);
      return build(o, c);
    } }

  ];

  Art.categories.push({ id: 'super', name: 'Super Cars', emoji: '🏎️', pages: C });
  C.forEach(function (p) { Art.pages[p.id] = p; });
})(window.Art);
