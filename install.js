/*
 * Add to Home Screen helper, shared by PICU on duty and PICU Logbook.
 *
 * No phone lets a page put itself on the home screen. This makes it as easy as the phone allows:
 *   Android (Chrome, Samsung Internet): an Install button, once the browser offers it
 *     (the beforeinstallprompt event); until then, the two menu steps.
 *   iPhone and iPad: the Safari steps (Share, or ••• then Share; Add to Home Screen; Add).
 *   A page opened inside another app's browser: open it in Safari or Chrome first.
 * Nothing shows once the page runs from the home screen, on a computer, after "Not now"
 * (for 14 days), or after it has been installed.
 *
 * Use, just before </body>:
 *   <script src="install.js" data-app="PICU on duty" data-key="picu-on-duty"
 *           data-color="#4A1D3F" data-ink="#2A1F2B" data-soft="#5F5462"
 *           data-icon="apple-touch-icon.png" defer></script>
 */
(function () {
  'use strict';

  var me = document.currentScript;
  function attr(name, dflt) { var v = me && me.getAttribute('data-' + name); return v ? v : dflt; }
  var cfg = {
    app: attr('app', document.title),
    key: attr('key', 'app'),
    color: attr('color', '#4A1D3F'),
    ink: attr('ink', '#2A1F2B'),
    soft: attr('soft', '#5F5462'),
    icon: attr('icon', 'apple-touch-icon.png'),
    sub: attr('sub', 'It then opens like an app, full screen.')
  };

  var nav = window.navigator, ua = nav.userAgent || '';
  var installed = (window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches)) || nav.standalone === true;
  if (installed) return;

  var ios = /iPhone|iPad|iPod/i.test(ua) || (nav.platform === 'MacIntel' && nav.maxTouchPoints > 1);
  var android = /Android/i.test(ua);
  if (!ios && !android) return;                           // phones and tablets only
  var inApp = /FBAN|FBAV|Instagram|Line\/|Snapchat|; wv\)/i.test(ua);
  var iosChrome = ios && /CriOS|FxiOS|EdgiOS/i.test(ua);

  var LATER = cfg.key + '.install.later', DONE = cfg.key + '.install.done';
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  if (get(DONE)) return;
  var later = Number(get(LATER)) || 0;
  if (later && Date.now() - later < 14 * 864e5) return;

  // ---------------------------------------------------------- looks

  var css = ''
    + '.a2hs{position:fixed;left:0;right:0;bottom:0;z-index:2147483000;display:flex;justify-content:center;'
    + 'padding:0 10px calc(10px + env(safe-area-inset-bottom));pointer-events:none;font-family:inherit}'
    + '.a2hs-card{pointer-events:auto;width:100%;max-width:440px;background:#fff;color:' + cfg.ink + ';border-radius:18px;'
    + 'box-shadow:0 12px 32px rgba(0,0,0,.20),0 0 0 1px rgba(0,0,0,.06);padding:14px 14px 12px 16px;'
    + 'transform:translateY(140%);transition:transform .35s ease}'
    + '.a2hs.is-on .a2hs-card{transform:none}'
    + '.a2hs-top{display:flex;gap:12px;align-items:center}'
    + '.a2hs-icon{width:48px;height:48px;border-radius:12px;flex:0 0 auto;display:block}'
    + '.a2hs-t{font-weight:700;font-size:1.08rem;line-height:1.2}'
    + '.a2hs-s{font-size:.94rem;line-height:1.3;color:' + cfg.soft + ';margin-top:2px}'
    + '.a2hs-x{margin-left:auto;align-self:flex-start;flex:0 0 auto;width:44px;height:44px;margin-top:-8px;margin-right:-8px;'
    + 'border:0;background:none;border-radius:22px;cursor:pointer;color:' + cfg.soft + ';display:flex;align-items:center;justify-content:center}'
    + '.a2hs-steps{list-style:none;margin:12px 0 0;padding:0;display:grid;gap:9px}'
    + '.a2hs-steps li{display:flex;gap:10px;align-items:flex-start;font-size:1rem;line-height:1.3}'
    + '.a2hs-n{flex:0 0 auto;width:24px;height:24px;border-radius:12px;background:' + cfg.color + ';color:#fff;'
    + 'font-weight:700;font-size:.85rem;display:flex;align-items:center;justify-content:center;margin-top:-1px}'
    + '.a2hs-i{display:inline-block;width:20px;height:20px;vertical-align:-4px;margin:0 2px}'
    + '.a2hs-b{display:flex;gap:8px;margin-top:12px}'
    + '.a2hs-go{flex:1;min-height:46px;border:0;border-radius:12px;background:' + cfg.color + ';color:#fff;'
    + 'font-weight:700;font-size:1.05rem;cursor:pointer;font-family:inherit}'
    + '.a2hs-later{min-height:46px;padding:0 14px;border:0;border-radius:12px;background:none;color:' + cfg.soft + ';'
    + 'font-weight:600;font-size:1rem;cursor:pointer;font-family:inherit}'
    + '.a2hs-b .a2hs-later:only-child{margin-left:auto}'
    + '.a2hs button:focus-visible{outline:3px solid ' + cfg.color + ';outline-offset:2px}'
    + '@media (prefers-reduced-motion: reduce){.a2hs-card{transition:none}}';

  var ICON = {
    dots: '<svg class="a2hs-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="19" cy="12" r="2.2" fill="currentColor"/></svg>',
    share: '<svg class="a2hs-i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5L12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 10H6a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    add: '<svg class="a2hs-i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    menu: '<svg class="a2hs-i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2.2" fill="currentColor"/><circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="19" r="2.2" fill="currentColor"/></svg>',
    close: '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>'
  };

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------------------------------------------------------- what to say

  function steps() {
    if (inApp) return [
      'This page is open inside another app. Tap ' + (ios ? ICON.dots : ICON.menu) + ' and choose <b>Open in ' + (ios ? 'Safari' : 'Chrome') + '</b>.',
      'Then add it to your home screen from there.'
    ];
    if (ios && iosChrome) return [
      'Tap ' + ICON.share + ' <b>Share</b> at the top right.',
      'Tap ' + ICON.add + ' <b>Add to Home Screen</b>.',
      'Tap <b>Add</b>.'
    ];
    if (ios) return [
      'Tap ' + ICON.share + ' <b>Share</b>. If you don’t see it, tap ' + ICON.dots + ' next to the address first.',
      'Scroll down and tap ' + ICON.add + ' <b>Add to Home Screen</b>.',
      'Tap <b>Add</b>.'
    ];
    return [
      'Tap ' + ICON.menu + ' at the top right of the browser.',
      'Tap <b>Add to Home screen</b> or <b>Install app</b>.'
    ];
  }

  // ---------------------------------------------------------- the card

  var root = null, offer = null;

  function build() {
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    root = document.createElement('aside');
    root.className = 'a2hs';
    root.setAttribute('aria-label', 'Add ' + cfg.app + ' to your home screen');
    document.body.appendChild(root);
  }

  function render() {
    if (!root) build();
    var html = '<div class="a2hs-card"><div class="a2hs-top">'
      + '<img class="a2hs-icon" src="' + esc(cfg.icon) + '" alt="">'
      + '<div><div class="a2hs-t">Add ' + esc(cfg.app) + ' to your home screen</div>'
      + '<div class="a2hs-s">' + esc(offer ? 'One tap and it opens like an app.' : cfg.sub) + '</div></div>'
      + '<button type="button" class="a2hs-x" data-act="later" aria-label="Close">' + ICON.close + '</button></div>';
    if (!offer) {
      var list = steps();
      html += '<ol class="a2hs-steps">';
      for (var i = 0; i < list.length; i++) html += '<li><span class="a2hs-n">' + (i + 1) + '</span><span>' + list[i] + '</span></li>';
      html += '</ol>';
    }
    html += '<div class="a2hs-b">' + (offer ? '<button type="button" class="a2hs-go" data-act="install">Install</button>' : '')
      + '<button type="button" class="a2hs-later" data-act="later">Not now</button></div></div>';
    root.innerHTML = html;
    root.onclick = function (e) {
      var b = e.target.closest ? e.target.closest('button') : null;
      if (!b) return;
      if (b.getAttribute('data-act') === 'install') install();
      else { put(LATER, String(Date.now())); hide(); }
    };
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (root) root.className = 'a2hs is-on'; }); });
  }

  function hide() {
    if (!root) return;
    root.className = 'a2hs';
    var r = root;
    root = null;
    setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 400);
  }

  function install() {
    var p = offer;
    if (!p) return;
    offer = null;
    p.prompt();
    if (p.userChoice) p.userChoice.then(function (c) {
      if (c && c.outcome === 'accepted') { put(DONE, '1'); hide(); } else render();
    }, function () { render(); });
  }

  // ---------------------------------------------------------- when to show it

  var shown = false;
  function show() { if (shown) return; shown = true; render(); }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    offer = e;
    if (!inApp) { shown = true; render(); }
  });
  window.addEventListener('appinstalled', function () { put(DONE, '1'); hide(); });

  // Chrome can tell when this app is already on the phone (manifest related_applications).
  if (android && nav.getInstalledRelatedApps) {
    nav.getInstalledRelatedApps().then(function (apps) {
      if (apps && apps.length) { put(DONE, '1'); shown = true; hide(); }
    }, function () {});
  }

  function start() { setTimeout(show, android && !inApp ? 2500 : 1200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
