/* Amelia Colors — tiny WebAudio sound box (no audio files, all synthesised) */
(function (global) {
  'use strict';

  var ctx = null, master = null, musicGain = null, musicTimer = null;
  var on = true, music = false;

  function ready() {
    if (!ctx) {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.16;
      musicGain.connect(master);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(o) {
    if (!on || !ready()) return;
    var t = ctx.currentTime + (o.delay || 0);
    var osc = ctx.createOscillator();
    var g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t + o.d);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(o.v == null ? 0.3 : o.v, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.d);
    osc.connect(g); g.connect(o.bus || master);
    osc.start(t); osc.stop(t + o.d + 0.05);
  }

  function noise(dur, vol, hp) {
    if (!on || !ready()) return;
    var n = Math.floor(ctx.sampleRate * dur);
    var buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0), i;
    for (i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var src = ctx.createBufferSource(); src.buffer = buf;
    var f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp || 900;
    var g = ctx.createGain(); g.gain.value = vol || 0.18;
    src.connect(f); f.connect(g); g.connect(master);
    src.start();
  }

  var SCALE = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5, 1174.7, 1318.5];

  var SFX = {
    pop: function () { tone({ f: 620, f2: 1180, d: 0.11, type: 'triangle', v: 0.3 }); },
    tap: function () { tone({ f: 880, f2: 1320, d: 0.08, type: 'sine', v: 0.22 }); },
    splash: function () {
      tone({ f: 300, f2: 900, d: 0.2, type: 'sine', v: 0.28 });
      tone({ f: 900, f2: 1600, d: 0.16, type: 'triangle', v: 0.14, delay: 0.04 });
      noise(0.14, 0.07, 1800);
    },
    sparkle: function () {
      for (var i = 0; i < 4; i++) {
        tone({ f: SCALE[3 + i] * 2, d: 0.14, type: 'sine', v: 0.13, delay: i * 0.045 });
      }
    },
    swoosh: function () { noise(0.22, 0.12, 600); },
    erase: function () { noise(0.16, 0.1, 400); },
    undo: function () { tone({ f: 700, f2: 380, d: 0.14, type: 'triangle', v: 0.22 }); },
    stamp: function () {
      tone({ f: 420, f2: 760, d: 0.1, type: 'square', v: 0.16 });
      tone({ f: 1200, d: 0.12, type: 'sine', v: 0.14, delay: 0.05 });
    },
    cheer: function () {
      var notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach(function (f, i) {
        tone({ f: f, d: 0.32, type: 'triangle', v: 0.26, delay: i * 0.085 });
        tone({ f: f * 2, d: 0.24, type: 'sine', v: 0.1, delay: i * 0.085 });
      });
      setTimeout(function () { noise(0.5, 0.08, 2200); }, 380);
    },
    save: function () {
      tone({ f: 659.25, d: 0.16, type: 'sine', v: 0.24 });
      tone({ f: 987.77, d: 0.22, type: 'sine', v: 0.24, delay: 0.1 });
    },
    nope: function () { tone({ f: 220, f2: 160, d: 0.16, type: 'sawtooth', v: 0.12 }); }
  };

  /* Gentle music-box arpeggio, off by default */
  function musicStep() {
    if (!music || !ready()) return;
    var root = [0, 2, 4, 2][Math.floor(Math.random() * 4)];
    var i;
    for (i = 0; i < 3; i++) {
      tone({
        f: SCALE[(root + i * 2) % SCALE.length] * (Math.random() < 0.3 ? 2 : 1),
        d: 1.1, type: 'sine', v: 0.09, delay: i * 0.24, bus: musicGain
      });
    }
    musicTimer = setTimeout(musicStep, 2200 + Math.random() * 1400);
  }

  global.Sound = {
    play: function (name) { if (SFX[name]) SFX[name](); },
    unlock: function () { ready(); },
    get enabled() { return on; },
    setEnabled: function (v) { on = !!v; if (!on) this.setMusic(false); },
    get musicOn() { return music; },
    setMusic: function (v) {
      music = !!v && on;
      clearTimeout(musicTimer);
      if (music) { ready(); musicStep(); }
    }
  };
})(window);
