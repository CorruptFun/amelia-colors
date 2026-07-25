/* =============================================================
   Amelia Colors — painting engine
   Three stacked layers:
     bg    : paper (white / dots / grid / night)
     paint : everything the child makes
     line  : the coloring-page outline, always composited on top
   Flood fill runs on `paint` but is walled off by `line`, so the
   outlines stay crisp and every enclosed shape is its own region.
   ============================================================= */
(function (global) {
  'use strict';

  var W = 1024, H = 1024;   // square sheet — the art board is square
  var view, vctx, bg, bgc, paint, pctx, line, lctx;
  var wall = null;                 // Uint8Array, 1 = outline pixel
  var undoStack = [], redoStack = [], UNDO_MAX = 8;
  var dirty = true, rafId = 0;
  var onChange = null;

  var state = {
    tool: 'fill', color: '#FF3B6B', size: 26, pattern: 'solid',
    symmetry: 'off', sticker: '⭐', paper: 'white', page: null
  };

  /* ---------- helpers ---------- */
  function mk(w, h) {
    var c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  function hexRGB(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(rgb, target, amt) {
    return [
      Math.round(rgb[0] + (target - rgb[0]) * amt),
      Math.round(rgb[1] + (target - rgb[1]) * amt),
      Math.round(rgb[2] + (target - rgb[2]) * amt)
    ];
  }
  function rgbStr(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
  function hash2(x, y) {
    var n = (x * 374761393 + y * 668265263) ^ 0;
    n = (n ^ (n >> 13)) * 1274126177;
    return ((n ^ (n >> 16)) >>> 0) / 4294967296;
  }

  /* ---------- paper backgrounds ---------- */
  var PAPERS = {
    white: function (c) { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H); },
    dots: function (c) {
      c.fillStyle = '#FFFDF7'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#E7DCC8';
      for (var y = 40; y < H; y += 60) for (var x = 40; x < W; x += 60) {
        c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill();
      }
    },
    grid: function (c) {
      c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#DCE9F5'; c.lineWidth = 2;
      for (var x = 0; x <= W; x += 60) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      for (var y = 0; y <= H; y += 60) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    },
    lines: function (c) {
      c.fillStyle = '#FFFEF2'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#CFE3F2'; c.lineWidth = 3;
      for (var y = 90; y < H; y += 90) { c.beginPath(); c.moveTo(30, y); c.lineTo(W - 30, y); c.stroke(); }
    },
    night: function (c) {
      var g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#141B4D'); g.addColorStop(1, '#3B2A6B');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.fillStyle = '#FFF6C9';
      for (var i = 0; i < 90; i++) {
        var x = hash2(i, 7) * W, y = hash2(i, 13) * H, r = 1 + hash2(i, 21) * 3;
        c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
      }
    },
    sky: function (c) {
      var g = c.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#BFE9FF'); g.addColorStop(0.72, '#EAF8FF'); g.addColorStop(0.73, '#CDEFA8'); g.addColorStop(1, '#A7DE7C');
      c.fillStyle = g; c.fillRect(0, 0, W, H);
    }
  };

  /* ---------- compositing ---------- */
  function invalidate() { dirty = true; if (!rafId) rafId = requestAnimationFrame(frame); }
  function frame() {
    rafId = 0;
    if (!dirty) return;
    dirty = false;
    vctx.clearRect(0, 0, W, H);
    vctx.drawImage(bg, 0, 0);
    vctx.drawImage(paint, 0, 0);
    vctx.drawImage(line, 0, 0);
  }

  /* ---------- undo ---------- */
  function snapshot() {
    try {
      undoStack.push(pctx.getImageData(0, 0, W, H));
      if (undoStack.length > UNDO_MAX) undoStack.shift();
      redoStack.length = 0;
    } catch (e) { /* ignore */ }
  }
  function restore(img) { pctx.putImageData(img, 0, 0); invalidate(); }

  /* ---------- flood fill ---------- */
  function patternColor(base, kind) {
    var lite = mix(base, 255, 0.42), dark = mix(base, 0, 0.18), white = [255, 255, 255];
    switch (kind) {
      case 'dots': return function (x, y) {
        var dx = (x % 46) - 23, dy = (y % 46) - 23;
        return (dx * dx + dy * dy < 90) ? lite : base;
      };
      case 'stripes': return function (x, y) {
        return ((x + y) % 44) < 20 ? lite : base;
      };
      case 'sparkle': return function (x, y) {
        var h = hash2(x >> 1, y >> 1);
        return h > 0.988 ? white : (h > 0.955 ? lite : base);
      };
      case 'shine': return function (x, y) {
        return mix(base, 255, 0.5 * (1 - y / H));
      };
      case 'checker': return function (x, y) {
        return ((((x / 40) | 0) + ((y / 40) | 0)) & 1) ? lite : dark;
      };
      default: return null;
    }
  }

  function fillAt(px, py) {
    px = Math.round(px); py = Math.round(py);
    if (px < 0 || py < 0 || px >= W || py >= H) return false;

    // if the tap landed on an outline, hop to the nearest open pixel
    if (wall) {
      var i0 = py * W + px, r, a, nx, ny;
      if (wall[i0]) {
        var found = false;
        for (r = 2; r <= 26 && !found; r += 2) {
          for (a = 0; a < 16; a++) {
            nx = px + Math.round(Math.cos(a * Math.PI / 8) * r);
            ny = py + Math.round(Math.sin(a * Math.PI / 8) * r);
            if (nx > 0 && ny > 0 && nx < W && ny < H && !wall[ny * W + nx]) {
              px = nx; py = ny; found = true; break;
            }
          }
        }
        if (!found) return false;
      }
    }

    var img = pctx.getImageData(0, 0, W, H);
    var d = img.data;
    var seed = (py * W + px) << 2;
    var tr = d[seed], tg = d[seed + 1], tb = d[seed + 2], ta = d[seed + 3];
    var TOL = 34;

    var base = hexRGB(state.color);
    var pfn = patternColor(base, state.pattern);
    if (!pfn && ta === 255 && Math.abs(d[seed] - base[0]) < 3 &&
      Math.abs(d[seed + 1] - base[1]) < 3 && Math.abs(d[seed + 2] - base[2]) < 3) return false;

    var mask = new Uint8Array(W * H);
    var stack = [px, py];
    var isWall = wall;

    function ok(x, y) {
      var i = y * W + x;
      if (mask[i]) return false;
      if (isWall && isWall[i]) return false;
      var p = i << 2;
      return Math.abs(d[p] - tr) <= TOL && Math.abs(d[p + 1] - tg) <= TOL &&
        Math.abs(d[p + 2] - tb) <= TOL && Math.abs(d[p + 3] - ta) <= TOL;
    }

    while (stack.length) {
      var y = stack.pop(), x = stack.pop();
      if (!ok(x, y)) continue;
      var xl = x; while (xl > 0 && ok(xl - 1, y)) xl--;
      var xr = x; while (xr < W - 1 && ok(xr + 1, y)) xr++;
      var upOK = false, dnOK = false, i;
      for (i = xl; i <= xr; i++) {
        mask[y * W + i] = 1;
        if (y > 0) {
          if (ok(i, y - 1)) { if (!upOK) { stack.push(i, y - 1); upOK = true; } }
          else upOK = false;
        }
        if (y < H - 1) {
          if (ok(i, y + 1)) { if (!dnOK) { stack.push(i, y + 1); dnOK = true; } }
          else dnOK = false;
        }
      }
    }

    // paint the region
    var x2, y2, idx, p2, col;
    for (y2 = 0; y2 < H; y2++) {
      for (x2 = 0; x2 < W; x2++) {
        idx = y2 * W + x2;
        if (!mask[idx]) continue;
        col = pfn ? pfn(x2, y2) : base;
        p2 = idx << 2;
        d[p2] = col[0]; d[p2 + 1] = col[1]; d[p2 + 2] = col[2]; d[p2 + 3] = 255;
      }
    }

    // creep 2px under the outline so no white halo is left behind
    if (isWall) {
      var grown = new Uint8Array(W * H), pass, n;
      for (pass = 0; pass < 2; pass++) {
        for (y2 = 1; y2 < H - 1; y2++) {
          for (x2 = 1; x2 < W - 1; x2++) {
            idx = y2 * W + x2;
            if (!isWall[idx] || grown[idx] || mask[idx]) continue;
            n = mask[idx - 1] || mask[idx + 1] || mask[idx - W] || mask[idx + W] ||
              grown[idx - 1] || grown[idx + 1] || grown[idx - W] || grown[idx + W];
            if (n) {
              grown[idx] = 1;
              col = pfn ? pfn(x2, y2) : base;
              p2 = idx << 2;
              d[p2] = col[0]; d[p2 + 1] = col[1]; d[p2 + 2] = col[2]; d[p2 + 3] = 255;
            }
          }
        }
      }
    }

    pctx.putImageData(img, 0, 0);
    invalidate();
    return true;
  }

  /* ---------- symmetry ---------- */
  function transforms() {
    var cx = W / 2, cy = H / 2, list = [];
    function rot(a, mirror) {
      var cos = Math.cos(a), sin = Math.sin(a);
      return function (p) {
        var x = (mirror ? -1 : 1) * (p.x - cx), y = p.y - cy;
        return { x: cx + x * cos - y * sin, y: cy + x * sin + y * cos };
      };
    }
    switch (state.symmetry) {
      case 'mirror':
        return [function (p) { return p; }, function (p) { return { x: W - p.x, y: p.y }; }];
      case 'quad':
        return [
          function (p) { return p; },
          function (p) { return { x: W - p.x, y: p.y }; },
          function (p) { return { x: p.x, y: H - p.y }; },
          function (p) { return { x: W - p.x, y: H - p.y }; }
        ];
      case 'kaleido':
        for (var i = 0; i < 6; i++) {
          list.push(rot(i * Math.PI / 3, false));
          list.push(rot(i * Math.PI / 3, true));
        }
        return list;
      default:
        return [function (p) { return p; }];
    }
  }

  /* ---------- brushes ---------- */
  var hue = 0, travelled = 0;

  function segment(a, b) {
    var tf = transforms(), i;
    for (i = 0; i < tf.length; i++) drawSeg(tf[i](a), tf[i](b), i);
    invalidate();
  }

  function drawSeg(a, b, variant) {
    var s = state.size, c = state.color, ctx = pctx;
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    switch (state.tool) {
      case 'eraser':
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = s * 1.5;
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        break;

      case 'rainbow':
        var g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, 'hsl(' + (hue % 360) + ',95%,58%)');
        g.addColorStop(1, 'hsl(' + ((hue + 14) % 360) + ',95%,58%)');
        ctx.strokeStyle = g;
        ctx.lineWidth = s;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        break;

      case 'glitter':
        ctx.strokeStyle = c; ctx.lineWidth = s * 0.5; ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.globalAlpha = 1;
        var n = Math.max(1, Math.round(len / 5));
        for (var k = 0; k < n; k++) {
          var t = k / n;
          var jx = a.x + dx * t + (Math.random() - 0.5) * s * 1.6;
          var jy = a.y + dy * t + (Math.random() - 0.5) * s * 1.6;
          ctx.fillStyle = Math.random() < 0.45 ? '#FFFFFF' : 'hsl(' + Math.floor(Math.random() * 360) + ',100%,72%)';
          var rr = s * (0.08 + Math.random() * 0.16);
          ctx.beginPath(); ctx.arc(jx, jy, rr, 0, 7); ctx.fill();
        }
        break;

      case 'neon':
        ctx.shadowColor = c; ctx.shadowBlur = s * 1.1;
        ctx.strokeStyle = c; ctx.lineWidth = s * 0.8;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = s * 0.28;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        break;

      case 'crayon':
        ctx.strokeStyle = c; ctx.globalAlpha = 0.55; ctx.lineWidth = s;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        ctx.globalAlpha = 0.5;
        var m = Math.max(1, Math.round(len / 3));
        for (var q = 0; q < m; q++) {
          var tt = q / m;
          var ox = (Math.random() - 0.5) * s * 0.85, oy = (Math.random() - 0.5) * s * 0.85;
          ctx.beginPath();
          ctx.arc(a.x + dx * tt + ox, a.y + dy * tt + oy, s * (0.06 + Math.random() * 0.14), 0, 7);
          ctx.fillStyle = c; ctx.fill();
        }
        break;

      default: // marker
        ctx.strokeStyle = c; ctx.lineWidth = s;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.restore();
    if (variant === 0) {
      travelled += len;
      hue = (hue + len * 0.28) % 360;
    }
  }

  function stamp(x, y) {
    var tf = transforms(), i, s = state.size * 2.6;
    for (i = 0; i < tf.length; i++) {
      var p = tf[i]({ x: x, y: y });
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate((Math.random() - 0.5) * 0.5);
      pctx.font = s + 'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",serif';
      pctx.textAlign = 'center'; pctx.textBaseline = 'middle';
      pctx.fillText(state.sticker, 0, 0);
      pctx.restore();
    }
    invalidate();
  }

  /* ---------- public ---------- */
  var Paint = {
    W: W, H: H,
    state: state,

    init: function (canvasEl, changeCb) {
      view = canvasEl;
      view.width = W; view.height = H;
      vctx = view.getContext('2d');
      bg = mk(W, H); bgc = bg.getContext('2d');
      paint = mk(W, H); pctx = paint.getContext('2d');
      line = mk(W, H); lctx = line.getContext('2d');
      onChange = changeCb;
      this.setPaper('white');
      invalidate();
    },

    setPaper: function (name) {
      state.paper = PAPERS[name] ? name : 'white';
      bgc.clearRect(0, 0, W, H);
      PAPERS[state.paper](bgc);
      invalidate();
    },

    /* page === null → blank paper */
    loadPage: function (page) {
      state.page = page || null;
      undoStack.length = 0; redoStack.length = 0;
      pctx.clearRect(0, 0, W, H);
      lctx.clearRect(0, 0, W, H);
      wall = null;
      invalidate();
      if (!page) return Promise.resolve();

      // the art board already carries its own 2.5% margin, so full bleed
      var box = Math.min(W, H);
      return new Promise(function (res) {
        var img = new Image();
        img.onload = function () {
          lctx.clearRect(0, 0, W, H);
          lctx.drawImage(img, (W - box) / 2, (H - box) / 2, box, box);
          var data = lctx.getImageData(0, 0, W, H).data;
          var m = new Uint8Array(W * H), i, p;
          for (i = 0, p = 3; i < W * H; i++, p += 4) if (data[p] > 46) m[i] = 1;
          wall = m;
          invalidate();
          res();
        };
        img.onerror = function () { res(); };
        img.src = global.Art.toDataURL(page.art(), { size: 1400, stroke: page.stroke || 2.35 });
      });
    },

    setTool: function (t) { state.tool = t; },
    setColor: function (c) { state.color = c; },
    setSize: function (n) { state.size = n; },
    setPattern: function (p) { state.pattern = p; },
    setSymmetry: function (s) { state.symmetry = s; },
    setSticker: function (e) { state.sticker = e; },

    beginStroke: function () { snapshot(); travelled = 0; },
    segment: segment,
    stamp: function (x, y) { snapshot(); stamp(x, y); },
    fill: function (x, y) {
      snapshot();
      var ok = fillAt(x, y);
      if (!ok) undoStack.pop();
      return ok;
    },

    canUndo: function () { return undoStack.length > 0; },
    canRedo: function () { return redoStack.length > 0; },
    undo: function () {
      if (!undoStack.length) return false;
      redoStack.push(pctx.getImageData(0, 0, W, H));
      restore(undoStack.pop());
      return true;
    },
    redo: function () {
      if (!redoStack.length) return false;
      undoStack.push(pctx.getImageData(0, 0, W, H));
      restore(redoStack.pop());
      return true;
    },
    clear: function () {
      snapshot();
      pctx.clearRect(0, 0, W, H);
      invalidate();
    },
    isBlank: function () {
      // cheap check: sample a coarse grid of the paint layer
      var d = pctx.getImageData(0, 0, W, H).data, i;
      for (i = 3; i < d.length; i += 4 * 97) if (d[i] > 8) return false;
      return true;
    },

    /* ---- persistence ---- */
    paintBlob: function () {
      return new Promise(function (res) { paint.toBlob(res, 'image/png'); });
    },
    flatBlob: function (scale) {
      var s = scale || 1;
      var c = mk(Math.round(W * s), Math.round(H * s)), x = c.getContext('2d');
      x.drawImage(bg, 0, 0, c.width, c.height);
      x.drawImage(paint, 0, 0, c.width, c.height);
      x.drawImage(line, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(res, 'image/png'); });
    },
    restorePaint: function (blob) {
      return new Promise(function (res) {
        if (!blob) return res();
        var url = URL.createObjectURL(blob);
        var img = new Image();
        img.onload = function () {
          pctx.clearRect(0, 0, W, H);
          pctx.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(url);
          invalidate();
          res();
        };
        img.onerror = function () { URL.revokeObjectURL(url); res(); };
        img.src = url;
      });
    },

    touched: function () { if (onChange) onChange(); }
  };

  global.Paint = Paint;
})(window);
