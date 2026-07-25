/* Amelia Colors — local gallery (IndexedDB) + settings (localStorage) */
(function (global) {
  'use strict';

  var DB_NAME = 'amelia-colors', DB_VER = 1, STORE = 'art', KV = 'kv';
  var dbp = null;

  function open() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      var req = indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function (e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          var s = db.createObjectStore(STORE, { keyPath: 'id' });
          s.createIndex('ts', 'ts');
        }
        if (!db.objectStoreNames.contains(KV)) db.createObjectStore(KV);
      };
      req.onsuccess = function () { res(req.result); };
      req.onerror = function () { rej(req.error); };
    });
    return dbp;
  }

  function tx(store, mode, fn) {
    return open().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(store, mode);
        var req = fn(t.objectStore(store));
        var value;
        // if the callback handed back an IDBRequest, hand back its result
        if (req && typeof req === 'object' && 'onsuccess' in req) {
          req.onsuccess = function () { value = req.result; };
        }
        t.oncomplete = function () { res(value); };
        t.onerror = function () { rej(t.error); };
        t.onabort = function () { rej(t.error); };
      });
    });
  }

  var Store = {
    /* ---- artwork ---- */
    save: function (rec) {
      rec.ts = rec.ts || Date.now();
      rec.id = rec.id || ('art-' + rec.ts + '-' + Math.floor(Math.random() * 1e6).toString(36));
      return tx(STORE, 'readwrite', function (s) { s.put(rec); }).then(function () { return rec.id; });
    },
    get: function (id) {
      return tx(STORE, 'readonly', function (s) { return s.get(id); });
    },
    list: function () {
      return tx(STORE, 'readonly', function (s) { return s.getAll(); }).then(function (rows) {
        return (rows || []).sort(function (a, b) { return b.ts - a.ts; });
      });
    },
    remove: function (id) {
      return tx(STORE, 'readwrite', function (s) { s.delete(id); });
    },
    clearAll: function () {
      return tx(STORE, 'readwrite', function (s) { s.clear(); });
    },
    count: function () {
      return tx(STORE, 'readonly', function (s) { return s.count(); });
    },

    /* ---- in-progress autosave ---- */
    setDraft: function (rec) {
      return tx(KV, 'readwrite', function (s) { s.put(rec, 'draft'); });
    },
    getDraft: function () {
      return tx(KV, 'readonly', function (s) { return s.get('draft'); });
    },
    clearDraft: function () {
      return tx(KV, 'readwrite', function (s) { s.delete('draft'); });
    },

    /* ---- settings ---- */
    pref: function (key, val) {
      if (val === undefined) {
        try { return JSON.parse(localStorage.getItem('ac:' + key)); } catch (e) { return null; }
      }
      try { localStorage.setItem('ac:' + key, JSON.stringify(val)); } catch (e) { /* full / private mode */ }
      return val;
    }
  };

  global.Store = Store;
})(window);
