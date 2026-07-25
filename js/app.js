/* =============================================================
   Amelia Colors — app shell, navigation and studio controls
   ============================================================= */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  // text-only by default — anything coming back out of IndexedDB is set as text
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };
  var elHTML = function (tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    n.innerHTML = html;
    return n;
  };

  /* ---------------- palette + option sets ---------------- */
  var COLORS = [
    '#FF3B6B', '#FF7A59', '#FF9F1C', '#FFC803', '#FFE600',
    '#B4E313', '#2ECC71', '#00CEC9', '#26C6FF', '#2D7DFF',
    '#9B5DE5', '#E040FB', '#FF5FA2', '#FFA8CF', '#FFD3B6',
    '#8B5A2B', '#8A93A6', '#FFFFFF', '#1A1A2E'
  ];
  var BRUSHES = [
    { id: 'marker', icon: '🖊️' }, { id: 'crayon', icon: '🖍️' },
    { id: 'rainbow', icon: '🌈' }, { id: 'glitter', icon: '✨' }, { id: 'neon', icon: '💡' }
  ];
  var PATTERNS = [
    { id: 'solid', icon: '⬤' }, { id: 'dots', icon: '🫧' }, { id: 'stripes', icon: '🌀' },
    { id: 'sparkle', icon: '✨' }, { id: 'shine', icon: '🌗' }, { id: 'checker', icon: '🏁' }
  ];
  var SYMS = [
    { id: 'off', icon: '✏️' }, { id: 'mirror', icon: '🦋' },
    { id: 'quad', icon: '✳️' }, { id: 'kaleido', icon: '❇️' }
  ];
  var PAPERS = [
    { id: 'white', icon: '⬜' }, { id: 'dots', icon: '🟡' }, { id: 'grid', icon: '📐' },
    { id: 'lines', icon: '📝' }, { id: 'sky', icon: '🌤️' }, { id: 'night', icon: '🌙' }
  ];
  var STICKERS = ('⭐ 🌟 💖 💕 🌸 🌺 🌻 🌈 ☀️ 🌙 ☁️ ⚡ 🍀 🦋 🐞 🐝 🐢 🐠 🐬 🦄 ' +
    '🐴 🐱 🐶 🐰 🐻 🐼 🎈 🎀 👑 💎 🍭 🍦 🍩 🍓 🍎 🚗 🚜 🚀 ⚽ 🏁 💨 🔥 ❄️ 🎵 ❤️ 🧡 💛 💚 💙 💜').split(' ');
  var SIZES = {
    brush: [12, 30, 62],
    eraser: [24, 52, 100],
    sticker: [26, 46, 76]
  };

  /* ---------------- state ---------------- */
  var currentPage = null;      // Art page object or null (blank paper)
  var currentArtId = null;     // gallery record being edited
  var brush = 'crayon';
  var sizeIdx = 1;
  var canvas, fx, fxCtx, stage;
  var saveTimer = null;

  /* ---------------- navigation ---------------- */
  var stack = [{ screen: 'home' }];
  function current() { return stack[stack.length - 1]; }
  function render() {
    var s = current().screen;
    $$('.screen').forEach(function (n) { n.classList.toggle('is-active', n.id === 'screen-' + s); });
  }
  function go(screen, opts) {
    stack.push({ screen: screen, opts: opts || {} });
    history.pushState({ i: stack.length }, '');
    render();
    Sound.play('swoosh');
  }
  function back() {
    if (stack.length > 1) history.back();
  }
  window.addEventListener('popstate', function () {
    if (stack.length > 1) { stack.pop(); render(); }
    else history.replaceState({ i: 1 }, '');
  });

  /* ---------------- toast + modal ---------------- */
  function toast(msg) {
    var t = el('div', 'toast', msg);
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; }, 1500);
    setTimeout(function () { t.remove(); }, 1900);
  }

  function modal(opts) {
    var layer = $('#modal-layer');
    layer.innerHTML = '';
    var box = el('div', 'modal');
    if (opts.emoji) box.appendChild(el('span', 'big-emoji', opts.emoji));
    if (opts.title) box.appendChild(el('h3', null, opts.title));
    if (opts.text) box.appendChild(el('p', null, opts.text));
    if (opts.body) box.appendChild(opts.body);
    var acts = el('div', 'modal-actions');
    (opts.actions || []).forEach(function (a) {
      var b = el('button', a.kind || '', a.label);
      b.addEventListener('click', function () {
        Sound.play('tap');
        if (!a.keepOpen) closeModal();
        if (a.fn) a.fn();
      });
      acts.appendChild(b);
    });
    box.appendChild(acts);
    layer.appendChild(box);
    layer.classList.add('on');
    layer.onclick = function (e) { if (e.target === layer && !opts.sticky) closeModal(); };
  }
  function closeModal() {
    var l = $('#modal-layer');
    l.classList.remove('on');
    l.innerHTML = '';
  }

  /* ---------------- FX: confetti + sparkles ---------------- */
  var parts = [], fxRunning = false;
  function sizeFx() {
    fx.width = innerWidth * devicePixelRatio;
    fx.height = innerHeight * devicePixelRatio;
    fx.style.width = innerWidth + 'px';
    fx.style.height = innerHeight + 'px';
    fxCtx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  }
  function fxLoop() {
    fxRunning = true;
    fxCtx.clearRect(0, 0, innerWidth, innerHeight);
    for (var i = parts.length - 1; i >= 0; i--) {
      var p = parts[i];
      p.vy += p.g; p.x += p.vx; p.y += p.vy; p.life--;
      p.rot += p.vr;
      if (p.life <= 0 || p.y > innerHeight + 60) { parts.splice(i, 1); continue; }
      fxCtx.save();
      fxCtx.globalAlpha = Math.min(1, p.life / 26);
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate(p.rot);
      if (p.kind === 'star') {
        fxCtx.font = p.r * 3 + 'px serif';
        fxCtx.textAlign = 'center'; fxCtx.textBaseline = 'middle';
        fxCtx.fillText(p.glyph, 0, 0);
      } else {
        fxCtx.fillStyle = p.c;
        fxCtx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
      }
      fxCtx.restore();
    }
    if (parts.length) requestAnimationFrame(fxLoop);
    else { fxRunning = false; fxCtx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function boom(n) {
    var glyphs = ['⭐', '✨', '💖', '🎉', '🌈', '🦄'];
    for (var i = 0; i < (n || 90); i++) {
      var star = Math.random() < 0.3;
      parts.push({
        x: innerWidth * (0.15 + Math.random() * 0.7),
        y: innerHeight * (0.28 + Math.random() * 0.2),
        vx: (Math.random() - 0.5) * 13,
        vy: -6 - Math.random() * 11,
        g: 0.32,
        r: 4 + Math.random() * 6,
        rot: Math.random() * 6,
        vr: (Math.random() - 0.5) * 0.34,
        life: 90 + Math.random() * 60,
        c: COLORS[Math.floor(Math.random() * 16)],
        kind: star ? 'star' : 'bar',
        glyph: glyphs[Math.floor(Math.random() * glyphs.length)]
      });
    }
    if (!fxRunning) fxLoop();
  }
  function sparkleAt(cx, cy) {
    for (var i = 0; i < 3; i++) {
      parts.push({
        x: cx + (Math.random() - 0.5) * 24, y: cy + (Math.random() - 0.5) * 24,
        vx: (Math.random() - 0.5) * 2.4, vy: -1 - Math.random() * 1.6, g: 0.06,
        r: 2 + Math.random() * 2.6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.2,
        life: 24 + Math.random() * 16, kind: 'star', glyph: '✨',
        c: '#fff'
      });
    }
    if (!fxRunning) fxLoop();
  }

  /* ---------------- home ---------------- */
  function refreshHome() {
    Store.count().then(function (n) {
      var b = $('#art-count');
      b.textContent = n;
      b.hidden = !n;
    }).catch(function () {});
    Store.getDraft().then(function (d) {
      $('#resume-chip').hidden = !d;
    }).catch(function () { $('#resume-chip').hidden = true; });
  }

  /* ---------------- category + page pickers ---------------- */
  function buildCats() {
    var grid = $('#cat-grid');
    grid.innerHTML = '';
    Art.categories.forEach(function (c) {
      var b = el('button', 'card');
      b.style.background = 'linear-gradient(160deg,' + tint(c.color, 22) + ',' + c.color + ')';
      b.appendChild(el('span', 'c-emoji', c.emoji));
      b.appendChild(el('span', 'c-name', c.name));
      b.appendChild(el('span', 'c-count', c.pages.length + ' pages'));
      b.addEventListener('click', function () { openCategory(c); });
      grid.appendChild(b);
    });
  }
  function tint(hex, amt) {
    var h = hex.replace('#', ''), n = parseInt(h, 16);
    var r = Math.min(255, ((n >> 16) & 255) + amt * 2);
    var g = Math.min(255, ((n >> 8) & 255) + amt * 2);
    var b = Math.min(255, (n & 255) + amt * 2);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  function openCategory(cat) {
    $('#pages-title').textContent = cat.emoji + ' ' + cat.name;
    var grid = $('#page-grid');
    grid.innerHTML = '';
    cat.pages.forEach(function (p) {
      var b = el('button', 'thumb');
      var img = new Image();
      img.alt = p.name;
      img.loading = 'lazy';
      img.src = Art.toDataURL(p.art(), { size: 240, stroke: p.stroke || 2.35 });
      b.appendChild(img);
      b.appendChild(el('span', 't-name', p.name));
      b.addEventListener('click', function () { openStudio(p); });
      grid.appendChild(b);
    });
    go('pages');
  }

  /* ---------------- gallery ---------------- */
  var galleryURLs = [];
  function openGallery() {
    var grid = $('#gallery-grid');
    galleryURLs.forEach(URL.revokeObjectURL);
    galleryURLs = [];
    grid.innerHTML = '';
    Store.list().then(function (rows) {
      if (!rows.length) {
        grid.appendChild(elHTML('div', 'empty-note', '🖼️<br>No pictures yet.<br>Go make one!'));
        return;
      }
      rows.forEach(function (rec) {
        var b = el('button', 'thumb art');
        var img = new Image();
        if (rec.thumb) {
          var u = URL.createObjectURL(rec.thumb);
          galleryURLs.push(u);
          img.src = u;
        }
        img.alt = rec.title || 'artwork';
        b.appendChild(img);
        b.appendChild(el('span', 't-name', rec.title || 'My picture'));
        b.addEventListener('click', function () { openArt(rec); });

        var del = el('button', 't-del', '✕');
        del.setAttribute('aria-label', 'Delete');
        del.addEventListener('click', function (e) {
          e.stopPropagation();
          Sound.play('tap');
          modal({
            emoji: '🗑️', title: 'Throw this away?',
            text: 'It will be gone for good.',
            actions: [
              { label: 'Yes, delete it', kind: 'danger', fn: function () {
                Store.remove(rec.id).then(function () { openGallery(); refreshHome(); toast('Deleted'); });
              } },
              { label: 'Keep it', kind: 'primary' }
            ]
          });
        });
        b.appendChild(del);
        grid.appendChild(b);
      });
    });
    go('gallery');
  }

  function openArt(rec) {
    currentArtId = rec.id;
    currentPage = rec.pageId ? Art.pages[rec.pageId] : null;
    go('studio');
    Paint.setPaper(rec.paper || 'white');
    Paint.loadPage(currentPage).then(function () {
      return Paint.restorePaint(rec.paint);
    }).then(function () {
      setTool(currentPage ? 'fill' : 'brush');
      updateUndo();
    });
  }

  /* ---------------- studio ---------------- */
  function openStudio(page, paper) {
    currentPage = page || null;
    currentArtId = null;
    go('studio');
    Paint.setPaper(paper || (page ? 'white' : Store.pref('paper') || 'white'));
    Paint.loadPage(currentPage).then(function () {
      setTool(currentPage ? 'fill' : 'brush');
      updateUndo();
      if (currentPage && !Store.pref('seenHint')) {
        $('#hint').hidden = false;
      }
    });
  }

  function buildPalette() {
    var pal = $('#palette');
    pal.innerHTML = '';
    COLORS.forEach(function (c) {
      var b = el('button', 'swatch');
      b.style.background = c;
      b.dataset.color = c;
      b.setAttribute('aria-label', 'color ' + c);
      b.addEventListener('click', function () {
        Paint.setColor(c);
        $$('.swatch', pal).forEach(function (s) { s.classList.toggle('on', s === b); });
        Sound.play('pop');
        if (Paint.state.tool === 'eraser') setTool('fill');
      });
      pal.appendChild(b);
    });
    var rb = el('button', 'swatch rainbow');
    rb.setAttribute('aria-label', 'surprise color');
    rb.addEventListener('click', function () {
      var c = COLORS[Math.floor(Math.random() * (COLORS.length - 2))];
      Paint.setColor(c);
      $$('.swatch', pal).forEach(function (s) { s.classList.toggle('on', s.dataset.color === c); });
      Sound.play('sparkle');
    });
    pal.appendChild(rb);
    pal.firstChild.classList.add('on');
    Paint.setColor(COLORS[0]);
  }

  function chip(label, on, fn) {
    var b = el('button', 'chip' + (on ? ' on' : ''));
    if (typeof label === 'string') b.textContent = label; else b.appendChild(label);
    b.addEventListener('click', function () { Sound.play('tap'); fn(); });
    return b;
  }

  function setTool(t) {
    Paint.setTool(t === 'brush' ? brush : t);
    $$('.tool').forEach(function (n) {
      n.classList.toggle('on', n.dataset.tool === t ||
        (t !== 'fill' && t !== 'sticker' && t !== 'eraser' && n.dataset.tool === 'brush'));
    });
    buildOptions(t);
  }
  function activeToolGroup() {
    var t = Paint.state.tool;
    if (t === 'fill' || t === 'eraser' || t === 'sticker') return t;
    return 'brush';
  }

  function buildOptions(group) {
    var row = $('#opt-row');
    row.innerHTML = '';

    if (group === 'fill') {
      PATTERNS.forEach(function (p) {
        row.appendChild(chip(p.icon, Paint.state.pattern === p.id, function () {
          Paint.setPattern(p.id); buildOptions('fill');
        }));
      });
      if (!currentPage) {
        var sep = el('span', 'opt-sep');
        row.appendChild(sep);
        PAPERS.forEach(function (p) {
          row.appendChild(chip(p.icon, Paint.state.paper === p.id, function () {
            Paint.setPaper(p.id); Store.pref('paper', p.id); buildOptions('fill'); scheduleAutosave();
          }));
        });
      }
      return;
    }

    if (group === 'sticker') {
      sizeChips('sticker', row);
      STICKERS.forEach(function (s) {
        row.appendChild(chip(s, Paint.state.sticker === s, function () {
          Paint.setSticker(s); buildOptions('sticker');
        }));
      });
      return;
    }

    if (group === 'eraser') {
      sizeChips('eraser', row);
      return;
    }

    // brush
    BRUSHES.forEach(function (b) {
      row.appendChild(chip(b.icon, brush === b.id, function () {
        brush = b.id; Paint.setTool(b.id); buildOptions('brush');
      }));
    });
    sizeChips('brush', row);
    SYMS.forEach(function (s) {
      row.appendChild(chip(s.icon, Paint.state.symmetry === s.id, function () {
        Paint.setSymmetry(s.id); buildOptions('brush');
        if (s.id !== 'off') Sound.play('sparkle');
      }));
    });
  }

  function sizeChips(group, row) {
    SIZES[group].forEach(function (px, i) {
      var d = el('span', 'dotsize');
      var vis = 8 + i * 8;
      d.style.width = vis + 'px'; d.style.height = vis + 'px';
      var b = chip(d, sizeIdx === i, function () {
        sizeIdx = i; Paint.setSize(SIZES[activeToolGroup()][i]); buildOptions(group);
      });
      row.appendChild(b);
    });
    Paint.setSize(SIZES[group][sizeIdx]);
  }

  function updateUndo() {
    $('#btn-undo').disabled = !Paint.canUndo();
    $('#btn-redo').disabled = !Paint.canRedo();
  }

  /* ---------------- pointer handling ---------------- */
  function pos(e) {
    var r = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * Paint.W,
      y: (e.clientY - r.top) / r.height * Paint.H
    };
  }

  function bindCanvas() {
    var drawing = false, last = null, pid = null;

    canvas.addEventListener('pointerdown', function (e) {
      if (pid !== null) return;          // ignore a second finger mid-stroke
      pid = e.pointerId;
      canvas.setPointerCapture(e.pointerId);
      Sound.unlock();
      var p = pos(e);
      var tool = Paint.state.tool;

      if (tool === 'fill') {
        if (Paint.fill(p.x, p.y)) {
          Sound.play('splash');
          sparkleAt(e.clientX, e.clientY);
          hideHint();
        } else Sound.play('nope');
        touched();
        pid = null;
        return;
      }
      if (tool === 'sticker') {
        Paint.stamp(p.x, p.y);
        Sound.play('stamp');
        sparkleAt(e.clientX, e.clientY);
        touched(); hideHint();
        pid = null;
        return;
      }
      drawing = true;
      last = p;
      Paint.beginStroke();
      Paint.segment(p, { x: p.x + 0.01, y: p.y + 0.01 });
      Sound.play(tool === 'eraser' ? 'erase' : 'tap');
      hideHint();
    });

    canvas.addEventListener('pointermove', function (e) {
      if (!drawing || e.pointerId !== pid) return;
      // getCoalescedEvents can come back empty (synthetic events, some
      // engines) — fall back to the event itself so no stroke is dropped
      var evts = e.getCoalescedEvents ? e.getCoalescedEvents() : null;
      if (!evts || !evts.length) evts = [e];
      for (var i = 0; i < evts.length; i++) {
        var p = pos(evts[i]);
        Paint.segment(last, p);
        last = p;
      }
      if (Paint.state.tool === 'glitter' || Paint.state.symmetry !== 'off') {
        sparkleAt(e.clientX, e.clientY);
      }
    });

    function end(e) {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!drawing) return;
      drawing = false;
      touched();
      updateUndo();
    }
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  }

  function hideHint() {
    var h = $('#hint');
    if (!h.hidden) { h.hidden = true; Store.pref('seenHint', true); }
  }

  function touched() {
    updateUndo();
    scheduleAutosave();
  }

  /* ---------------- saving ---------------- */
  function scheduleAutosave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      Paint.paintBlob().then(function (blob) {
        return Store.setDraft({
          paint: blob, pageId: currentPage ? currentPage.id : null,
          paper: Paint.state.paper, artId: currentArtId, ts: Date.now()
        });
      }).catch(function () {});
    }, 1100);
  }

  function saveToGallery(silent) {
    return Promise.all([Paint.paintBlob(), Paint.flatBlob(0.42)]).then(function (r) {
      var rec = {
        id: currentArtId || undefined,
        paint: r[0], thumb: r[1],
        pageId: currentPage ? currentPage.id : null,
        paper: Paint.state.paper,
        title: currentPage ? currentPage.name : 'My drawing',
        ts: Date.now()
      };
      return Store.save(rec);
    }).then(function (id) {
      currentArtId = id;
      if (!silent) { Sound.play('save'); toast('Saved to My Art! 💛'); }
      refreshHome();
      return id;
    });
  }

  function sharePicture() {
    Paint.flatBlob(1).then(function (blob) {
      var name = (currentPage ? currentPage.name.replace(/\W+/g, '-').toLowerCase() : 'my-drawing') + '.png';
      var file = new File([blob], name, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file], title: 'Amelia Colors' }).catch(function () {});
      } else {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
        toast('Picture saved 📥');
      }
    });
  }

  /* ---------------- celebrate ---------------- */
  var PRAISE = ['Beautiful!', 'Wow, amazing!', 'So pretty!', 'Great job!', 'You did it!', 'Superstar!'];
  function celebrate() {
    boom(120);
    Sound.play('cheer');
    saveToGallery(true).then(function () {
      modal({
        emoji: '🎉',
        title: PRAISE[Math.floor(Math.random() * PRAISE.length)],
        text: 'Your picture is in My Art.',
        actions: [
          { label: '🖍️ Keep coloring', kind: 'primary' },
          { label: '📤 Share my picture', fn: sharePicture },
          { label: '🖼️ See My Art', fn: openGallery },
          { label: '🏠 Home', fn: function () { goHome(); } }
        ]
      });
    });
  }

  function goHome() {
    while (stack.length > 1) stack.pop();
    history.replaceState({ i: 1 }, '');
    render();
    refreshHome();
  }

  /* ---------------- settings ---------------- */
  function openSettings() {
    var body = el('div');
    function row(label, on, fn) {
      var r = el('div', 'setting-row');
      r.appendChild(el('span', null, label));
      var t = el('button', 'toggle' + (on ? ' on' : ''));
      t.addEventListener('click', function () {
        var next = !t.classList.contains('on');
        t.classList.toggle('on', next);
        fn(next);
        Sound.play('tap');
      });
      r.appendChild(t);
      body.appendChild(r);
    }
    row('🔊 Sounds', Sound.enabled, function (v) {
      Sound.setEnabled(v); Store.pref('sound', v);
    });
    row('🎵 Music', Sound.musicOn, function (v) {
      Sound.setMusic(v); Store.pref('music', v);
    });
    modal({
      title: '⚙️ Grown-ups',
      body: body,
      actions: [
        { label: '⛶ Full screen', fn: toggleFullscreen },
        { label: '🗑️ Delete all my art', kind: 'danger', fn: function () {
          modal({
            emoji: '⚠️', title: 'Delete everything?',
            text: 'Every saved picture will be erased.',
            actions: [
              { label: 'Yes, delete all', kind: 'danger', fn: function () {
                Store.clearAll().then(function () { Store.clearDraft(); refreshHome(); toast('All art deleted'); });
              } },
              { label: 'Cancel', kind: 'primary' }
            ]
          });
        } },
        { label: 'Close', kind: 'primary' }
      ]
    });
  }

  /* ---------------- add to home screen ---------------- */
  var installPrompt = null;
  function isStandalone() {
    return matchMedia('(display-mode: standalone)').matches ||
      matchMedia('(display-mode: fullscreen)').matches ||
      navigator.standalone === true;
  }
  function setupInstall() {
    var bar = $('#a2hs');
    if (isStandalone() || Store.pref('a2hsDismissed')) return;

    var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    function show(text, addLabel) {
      $('#a2hs-txt').textContent = text;
      $('#a2hs-add').textContent = addLabel;
      bar.hidden = false;
    }

    addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      installPrompt = e;
      show('Put Amelia Colors on the home screen', 'Add');
    });

    // iOS never fires beforeinstallprompt — coach the Share-sheet route instead
    if (isIOS) {
      setTimeout(function () {
        if (bar.hidden && !isStandalone()) show('Tap Share, then “Add to Home Screen”', 'OK');
      }, 2500);
    }

    $('#a2hs-add').addEventListener('click', function () {
      Sound.play('tap');
      if (installPrompt) {
        installPrompt.prompt();
        installPrompt.userChoice.then(function (c) {
          if (c && c.outcome === 'accepted') Store.pref('a2hsDismissed', true);
          installPrompt = null;
          bar.hidden = true;
        });
      } else {
        bar.hidden = true;
      }
    });
    $('#a2hs-x').addEventListener('click', function () {
      Sound.play('tap');
      bar.hidden = true;
      Store.pref('a2hsDismissed', true);
    });
    addEventListener('appinstalled', function () {
      bar.hidden = true;
      Store.pref('a2hsDismissed', true);
    });
  }

  /* manifest shortcuts land here: ./?go=draw|color|gallery */
  function applyLaunchIntent() {
    var intent = new URLSearchParams(location.search).get('go');
    if (!intent) return;
    history.replaceState({ i: 1 }, '', location.pathname);
    if (intent === 'draw') openStudio(null);
    else if (intent === 'color') go('cats');
    else if (intent === 'gallery') openGallery();
  }

  function toggleFullscreen() {
    var d = document.documentElement;
    if (!document.fullscreenElement) {
      (d.requestFullscreen || d.webkitRequestFullscreen || function () {}).call(d);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen || function () {}).call(document);
    }
  }

  /* ---------------- wiring ---------------- */
  function randomPage() {
    var ids = Object.keys(Art.pages);
    return Art.pages[ids[Math.floor(Math.random() * ids.length)]];
  }

  function init() {
    canvas = $('#canvas');
    stage = $('#stage');
    fx = $('#fx');
    fxCtx = fx.getContext('2d');
    sizeFx();
    addEventListener('resize', sizeFx);

    Sound.setEnabled(Store.pref('sound') !== false);
    if (Store.pref('music')) Sound.setMusic(true);

    Paint.init(canvas);
    buildPalette();
    buildCats();
    bindCanvas();
    refreshHome();
    history.replaceState({ i: 1 }, '');

    $$('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () { Sound.play('tap'); back(); });
    });
    $$('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        Sound.unlock();
        var t = b.dataset.go;
        if (t === 'draw') openStudio(null);
        else if (t === 'color') go('cats');
        else if (t === 'gallery') openGallery();
        else if (t === 'surprise') { Sound.play('sparkle'); openStudio(randomPage()); }
      });
    });

    $('#btn-settings').addEventListener('click', function () { Sound.play('tap'); openSettings(); });

    $('#resume-chip').addEventListener('click', function () {
      Sound.unlock();
      Store.getDraft().then(function (d) {
        if (!d) return;
        currentArtId = d.artId || null;
        currentPage = d.pageId ? Art.pages[d.pageId] : null;
        go('studio');
        Paint.setPaper(d.paper || 'white');
        Paint.loadPage(currentPage)
          .then(function () { return Paint.restorePaint(d.paint); })
          .then(function () { setTool(currentPage ? 'fill' : 'brush'); updateUndo(); });
      });
    });

    $$('.tool').forEach(function (b) {
      b.addEventListener('click', function () { Sound.play('pop'); setTool(b.dataset.tool); });
    });

    $('#btn-home').addEventListener('click', function () {
      Sound.play('swoosh');
      scheduleAutosave();
      goHome();
    });
    $('#btn-undo').addEventListener('click', function () {
      if (Paint.undo()) { Sound.play('undo'); touched(); }
    });
    $('#btn-redo').addEventListener('click', function () {
      if (Paint.redo()) { Sound.play('undo'); touched(); }
    });
    $('#btn-clear').addEventListener('click', function () {
      Sound.play('tap');
      modal({
        emoji: '🧼', title: 'Start over?',
        text: 'This wipes the colors off your page.',
        actions: [
          { label: 'Yes, clean it', kind: 'danger', fn: function () {
            Paint.clear(); Sound.play('swoosh'); touched();
          } },
          { label: 'No, keep going', kind: 'primary' }
        ]
      });
    });
    $('#btn-save').addEventListener('click', function () { saveToGallery(false); });
    $('#btn-done').addEventListener('click', celebrate);

    // toddler-proofing
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    document.addEventListener('dblclick', function (e) { e.preventDefault(); });
    document.addEventListener('touchmove', function (e) {
      if (e.touches.length > 1) e.preventDefault();
    }, { passive: false });

    // never lose work when the app is backgrounded
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && current().screen === 'studio') scheduleAutosave();
    });

    setupInstall();
    applyLaunchIntent();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
