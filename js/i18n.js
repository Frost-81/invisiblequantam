/**
 * i18n.js — Invisible Quantum Labs
 * Lightweight EN/FR switcher for a static multi-page site.
 * Depends on window.TRANSLATIONS (loaded by translations.js before this file).
 *
 * Supported data attributes on HTML elements:
 *   data-i18n="key"           → el.textContent = t[key]
 *   data-i18n-html="key"      → el.innerHTML   = t[key]  (rich text / HTML fragments)
 *   data-i18n-attr="a:key"    → el.setAttribute(a, t[key])  (comma-separated pairs)
 *   data-i18n-val="key"       → el.value = t[key]           (submit inputs)
 *   data-i18n-ph="key"        → el.placeholder = t[key]     (text inputs / textarea)
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'iq-lang';
  var SUPPORTED   = ['en', 'fr'];
  var DEFAULT     = 'en';

  /* ── helpers ───────────────────────────────────────────────── */

  function safeLang(lang) {
    return SUPPORTED.indexOf(lang) !== -1 ? lang : DEFAULT;
  }

  function currentLang() {
    /* 1. ?lang= query param (handy for testing / deep links) */
    var param = new URLSearchParams(window.location.search).get('lang');
    if (param && SUPPORTED.indexOf(param) !== -1) {
      try { localStorage.setItem(STORAGE_KEY, param); } catch (e) { /* private mode */ }
      /* strip param from URL without reload */
      var clean = new URL(window.location.href);
      clean.searchParams.delete('lang');
      history.replaceState({}, '', clean.toString());
      return param;
    }
    /* 2. localStorage */
    try { var stored = localStorage.getItem(STORAGE_KEY); if (stored) return safeLang(stored); } catch (e) { /* */ }
    /* 3. browser language */
    var nav = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (nav.indexOf('fr') === 0) return 'fr';
    return DEFAULT;
  }

  /* ── core apply ────────────────────────────────────────────── */

  function apply(lang) {
    lang = safeLang(lang);
    var t = window.TRANSLATIONS && window.TRANSLATIONS[lang];
    if (!t) { console.warn('i18n: no translations for', lang); return; }

    /* html[lang] */
    document.documentElement.lang = lang === 'fr' ? 'fr-CA' : 'en-CA';

    /* <title> — keyed by page filename (e.g. "about", "contact", "index") */
    var page = window.location.pathname.split('/').pop().replace(/\.html$/, '') || 'index';
    var titleKey = page + '.title';
    if (t[titleKey]) document.title = t[titleKey];

    /* meta description */
    var descKey = page + '.meta.desc';
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t[descKey]) metaDesc.setAttribute('content', t[descKey]);

    /* data-i18n → textContent */
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var v = t[el.dataset.i18n];
      if (v !== undefined) el.textContent = v;
    });

    /* data-i18n-html → innerHTML */
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var v = t[el.dataset.i18nHtml];
      if (v !== undefined) el.innerHTML = v;
    });

    /* data-i18n-attr="placeholder:key, title:key2, …" */
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.dataset.i18nAttr.split(',').forEach(function (pair) {
        var parts = pair.trim().split(':');
        var attr  = parts[0] && parts[0].trim();
        var key   = parts[1] && parts[1].trim();
        if (attr && key && t[key] !== undefined) el.setAttribute(attr, t[key]);
      });
    });

    /* data-i18n-val → input/button value */
    document.querySelectorAll('[data-i18n-val]').forEach(function (el) {
      var v = t[el.dataset.i18nVal];
      if (v !== undefined) el.value = v;
    });

    /* data-i18n-ph → placeholder */
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      var v = t[el.dataset.i18nPh];
      if (v !== undefined) el.placeholder = v;
    });

    /* lang switcher: highlight active button */
    document.querySelectorAll('.switcher-1_link[data-lang]').forEach(function (btn) {
      btn.classList.toggle('w--current', btn.dataset.lang === lang);
      btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
    });

    /* fire a custom event so other scripts can react */
    document.dispatchEvent(new CustomEvent('i18n:changed', { detail: { lang: lang } }));
  }

  /* ── public API ────────────────────────────────────────────── */

  function setLang(lang) {
    lang = safeLang(lang);
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* */ }
    apply(lang);
  }

  window.i18n = { setLang: setLang, getLang: currentLang };

  /* ── init on DOM ready ─────────────────────────────────────── */

  function init() {
    var lang = currentLang();
    apply(lang);

    /* wire switcher buttons */
    document.querySelectorAll('.switcher-1_link[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        setLang(this.dataset.lang);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
