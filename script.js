/* =====================================================
   SPARTAN WINDOWS — SETTINGS
   Everything you'd normally change lives right here.
   ===================================================== */
var SPARTAN = {
  // Business number (calls and texts). Shown on every page.
  // Leave it as '' and every "Call or Text Seth" button becomes "Email Seth" instead.
  phone: '682-319-6675',

  email: 'spartanwindows11@gmail.com',

  // Your Google review link (Business Profile > "Ask for reviews" > copy link).
  // Leave '' to hide the Google review links.
  googleReviewsUrl: '',

  founding: {
    on: true,               // set to false to turn the founding offer off everywhere
    lastDay: '2027-01-31',  // the offer hides itself automatically after this day
    spotsLeft: 10,          // update by hand as founding jobs sell
    perWindow: 300          // discount per window
  },

  prices: {
    // Total price for small jobs (1 to 7 windows)
    tiers: { 1: 1500, 2: 2800, 3: 4050, 4: 5200, 5: 6500, 6: 7800, 7: 9100 },
    perWindow8Plus: 1300,   // price per window for 8 or more
    upstairsEach: 75,       // extra per second-story window
    cashDiscount: 0.10,     // 10% off for cash/check instead of financing
    maxWindows: 40
  },

  travel: {
    // Free travel miles by job size (biggest job first)
    freeMiles: [
      { minWindows: 6, miles: 60 },
      { minWindows: 3, miles: 35 },
      { minWindows: 1, miles: 15 }
    ],
    perMile: 2.50           // per mile past the free miles
  }
};

/* =====================================================
   Nothing below this line needs editing.
   ===================================================== */

function spMoney(v) { return '$' + Math.round(v).toLocaleString('en-US'); }

function spFoundingActive() {
  var f = SPARTAN.founding;
  if (!f.on || f.spotsLeft <= 0) return false;
  var end = new Date(f.lastDay + 'T23:59:59');
  return new Date() <= end;
}

function spFreeMiles(n) {
  var rules = SPARTAN.travel.freeMiles;
  for (var i = 0; i < rules.length; i++) { if (n >= rules[i].minWindows) return rules[i].miles; }
  return rules[rules.length - 1].miles;
}

// Price for a job. zip is optional.
function spPrice(n, up, cash, zip) {
  var p = SPARTAN.prices;
  var base = n <= 7 ? p.tiers[n] : n * p.perWindow8Plus;
  var upCost = up * p.upstairsEach;
  var founding = spFoundingActive() ? n * SPARTAN.founding.perWindow : 0;

  var travel = { cost: 0, note: 'Enter your ZIP code to check travel.', known: false, miles: null };
  if (zip && /^\d{5}$/.test(zip)) {
    var table = (typeof SPARTAN_ZIP_MILES !== 'undefined') ? SPARTAN_ZIP_MILES : {};
    var miles = table[zip];
    var free = spFreeMiles(n);
    if (miles === undefined) {
      travel.note = 'That ZIP is outside my usual area. I’ll confirm any travel charge with you.';
    } else if (miles <= free) {
      travel = { cost: 0, known: true, miles: miles, note: 'Travel included (about ' + miles + ' miles from Joshua).' };
    } else {
      var cost = Math.round((miles - free) * SPARTAN.travel.perMile);
      travel = { cost: cost, known: true, miles: miles, note: 'About ' + miles + ' miles from Joshua. First ' + free + ' miles are free.' };
    }
  }

  var subtotal = base + upCost + travel.cost - founding;
  var cashOff = cash ? Math.round(subtotal * p.cashDiscount) : 0;
  return { base: base, upCost: upCost, founding: founding, travel: travel, cashOff: cashOff, total: subtotal - cashOff };
}

function spQuery(name) {
  var m = new RegExp('[?&]' + name + '=(\\d+)').exec(window.location.search);
  return m ? parseInt(m[1], 10) : null;
}

function spSetText(el, text) { if (el) el.textContent = text; }

document.addEventListener('DOMContentLoaded', function () {
  var digits = SPARTAN.phone.replace(/\D/g, '');
  var hasPhone = digits.length === 10;

  // Contact buttons: call (or text, for buttons marked data-sms) if there's a number, otherwise email.
  document.querySelectorAll('[data-contact-link]').forEach(function (a) {
    a.href = hasPhone ? (a.hasAttribute('data-sms') ? 'sms:+1' : 'tel:+1') + digits : 'mailto:' + SPARTAN.email;
    var label = a.querySelector('[data-contact-label]');
    if (label) label.textContent = hasPhone ? (a.getAttribute('data-text-label') || 'Call or Text Seth') : (a.getAttribute('data-email-label') || 'Email Seth');
  });
  document.querySelectorAll('[data-phone-text]').forEach(function (el) {
    if (hasPhone) { el.textContent = SPARTAN.phone; el.closest('[data-needs-phone]') && el.closest('[data-needs-phone]').removeAttribute('hidden'); }
  });
  document.querySelectorAll('[data-needs-phone]').forEach(function (el) { if (hasPhone) el.removeAttribute('hidden'); });
  document.querySelectorAll('[data-phone-link]').forEach(function (a) { if (hasPhone) a.href = 'tel:+1' + digits; });

  // Google review links
  document.querySelectorAll('[data-reviews-link]').forEach(function (a) {
    if (SPARTAN.googleReviewsUrl) { a.href = SPARTAN.googleReviewsUrl; a.removeAttribute('hidden'); }
    else { var li = a.closest('li'); (li || a).setAttribute('hidden', ''); }
  });

  // Founding offer on/off
  var foundingOn = spFoundingActive();
  document.querySelectorAll('[data-founding]').forEach(function (el) { if (!foundingOn) el.setAttribute('hidden', ''); });
  document.querySelectorAll('[data-spots]').forEach(function (el) { el.textContent = SPARTAN.founding.spotsLeft; });

  // Phone menu
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Year in footer
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Homepage price preview
  var mini = document.getElementById('miniEstimator');
  if (mini) {
    var mn = 8;
    var mOut = mini.querySelector('[data-n]');
    function drawMini() {
      var r = spPrice(mn, 0, false, null);
      spSetText(mOut, mn);
      spSetText(mini.querySelector('[data-regular]'), spMoney(r.base));
      spSetText(mini.querySelector('[data-founding-amt]'), '−' + spMoney(r.founding));
      spSetText(mini.querySelector('[data-total]'), spMoney(r.total));
      var regLine = mini.querySelector('[data-regular-row]');
      if (regLine) regLine.classList.toggle('strike', r.founding > 0);
      mini.querySelector('[data-minus]').disabled = mn <= 1;
      mini.querySelector('[data-plus]').disabled = mn >= SPARTAN.prices.maxWindows;
      var go = mini.querySelector('[data-go]');
      if (go) go.href = 'estimate.html?n=' + mn;
    }
    mini.querySelector('[data-minus]').addEventListener('click', function () { if (mn > 1) { mn--; drawMini(); } });
    mini.querySelector('[data-plus]').addEventListener('click', function () { if (mn < SPARTAN.prices.maxWindows) { mn++; drawMini(); } });
    drawMini();
  }

  // Full estimator page
  var est = document.getElementById('estimator');
  if (est) {
    var n = Math.min(Math.max(spQuery('n') || 5, 1), SPARTAN.prices.maxWindows);
    var up = Math.min(spQuery('up') || 0, n);
    var zipInput = document.getElementById('zip');
    var nOut = document.getElementById('nOut');
    var upOut = document.getElementById('upOut');

    function payIsCash() { var c = est.querySelector('input[name="payment_preference"]:checked'); return c && c.value === 'Cash or check'; }

    function draw() {
      var zip = zipInput.value.trim();
      var r = spPrice(n, up, payIsCash(), zip);
      spSetText(nOut, n);
      spSetText(upOut, up);
      spSetText(document.getElementById('lnBaseLabel'), n + (n === 1 ? ' window' : ' windows') + ', installed');
      spSetText(document.getElementById('lnBase'), spMoney(r.base));
      document.getElementById('rowUp').hidden = up === 0;
      spSetText(document.getElementById('lnUpLabel'), up + ' upstairs × $' + SPARTAN.prices.upstairsEach);
      spSetText(document.getElementById('lnUp'), spMoney(r.upCost));
      document.getElementById('rowTravel').hidden = r.travel.cost === 0;
      spSetText(document.getElementById('lnTravel'), spMoney(r.travel.cost));
      document.getElementById('rowFounding').hidden = r.founding === 0;
      spSetText(document.getElementById('lnFoundingLabel'), 'Founding discount ($' + SPARTAN.founding.perWindow + ' × ' + n + ')');
      spSetText(document.getElementById('lnFounding'), '−' + spMoney(r.founding));
      document.getElementById('rowCash').hidden = r.cashOff === 0;
      spSetText(document.getElementById('lnCash'), '−' + spMoney(r.cashOff));
      spSetText(document.getElementById('lnTotal'), spMoney(r.total));
      spSetText(document.getElementById('travelNote'), r.travel.note);
      document.getElementById('nMinus').disabled = n <= 1;
      document.getElementById('nPlus').disabled = n >= SPARTAN.prices.maxWindows;
      document.getElementById('upMinus').disabled = up <= 0;
      document.getElementById('upPlus').disabled = up >= n;

      // Copy everything into the form so it lands in Seth's email
      document.getElementById('hWindows').value = n;
      document.getElementById('hUpstairs').value = up;
      document.getElementById('hZip').value = zip;
      document.getElementById('hTravel').value = r.travel.note + (r.travel.cost ? ' Charge: ' + spMoney(r.travel.cost) : '');
      document.getElementById('hFounding').value = r.founding ? spMoney(r.founding) + ' off' : 'Not applied';
      document.getElementById('hEstimate').value = spMoney(r.total);
    }

    document.getElementById('nMinus').addEventListener('click', function () { if (n > 1) { n--; if (up > n) up = n; draw(); } });
    document.getElementById('nPlus').addEventListener('click', function () { if (n < SPARTAN.prices.maxWindows) { n++; draw(); } });
    document.getElementById('upMinus').addEventListener('click', function () { if (up > 0) { up--; draw(); } });
    document.getElementById('upPlus').addEventListener('click', function () { if (up < n) { up++; draw(); } });
    zipInput.addEventListener('input', draw);
    est.querySelectorAll('input[name="payment_preference"]').forEach(function (r) { r.addEventListener('change', draw); });
    draw();
  }
});

/* =====================================================
   Tap-to-enlarge for before/after photos (.pair)
   Tap either photo to open both full screen. Swipe, tap
   the photo, or use the Before/After buttons to compare.
   ===================================================== */
document.addEventListener('DOMContentLoaded', function () {
  var pairs = document.querySelectorAll('.pair');
  if (!pairs.length) return;

  var xIcon = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  var zoomIcon = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>';

  var lb = document.createElement('div');
  lb.className = 'lb';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Enlarged photos');
  lb.innerHTML =
    '<div class="lb-bar"><div class="lb-tabs" role="group" aria-label="Choose a photo"></div>' +
    '<button type="button" class="lb-close" aria-label="Close">' + xIcon + '</button></div>' +
    '<div class="lb-stage"><img alt="">' +
    '<p class="lb-cap"></p>' +
    '<p class="lb-hint">Swipe or tap the photo to compare</p></div>';
  document.body.appendChild(lb);

  var tabs = lb.querySelector('.lb-tabs');
  var img = lb.querySelector('.lb-stage img');
  var cap = lb.querySelector('.lb-cap');
  var hint = lb.querySelector('.lb-hint');
  var closeBtn = lb.querySelector('.lb-close');
  var items = [], idx = 0, opener = null, pushed = false;

  function niceLabel(s) { s = (s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : ''; }

  function show(i) {
    idx = (i + items.length) % items.length;
    img.src = items[idx].src;
    img.alt = items[idx].alt;
    cap.textContent = items[idx].caption;
    tabs.querySelectorAll('button').forEach(function (b, j) { b.setAttribute('aria-pressed', j === idx ? 'true' : 'false'); });
  }

  function open(pair, i, from) {
    items = [].map.call(pair.querySelectorAll('figure'), function (f) {
      var im = f.querySelector('img'), tag = f.querySelector('.tag'), fc = f.querySelector('figcaption');
      return { src: im.currentSrc || im.src, alt: im.alt, label: tag ? niceLabel(tag.textContent) : '', caption: fc ? fc.textContent.trim() : '' };
    });
    tabs.innerHTML = '';
    items.forEach(function (it, j) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.label || 'Photo ' + (j + 1);
      b.addEventListener('click', function () { show(j); });
      tabs.appendChild(b);
    });
    tabs.hidden = hint.hidden = items.length < 2;
    opener = from;
    show(i);
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    // Let the phone's Back button close the photos instead of leaving the page
    if (!pushed) { try { history.pushState({ spartanPhotos: 1 }, ''); pushed = true; } catch (e) {} }
    closeBtn.focus();
  }

  function hide() {
    lb.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (opener) opener.focus();
  }

  function close() { if (pushed) { history.back(); } else { hide(); } }

  window.addEventListener('popstate', function () { if (pushed) { pushed = false; hide(); } });
  closeBtn.addEventListener('click', close);
  img.addEventListener('click', function () { if (items.length > 1) show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowRight') { show(idx + 1); }
    else if (e.key === 'ArrowLeft') { show(idx - 1); }
    else if (e.key === 'Tab') {
      var f = [].filter.call(lb.querySelectorAll('button'), function (b) { return b.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Swipe left or right to switch photos (ignored while pinch-zoomed in)
  var sx = null, sy = null;
  lb.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; } else { sx = null; }
  }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
    sx = null;
    if (window.visualViewport && window.visualViewport.scale > 1.05) return;
    if (items.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) show(idx + (dx < 0 ? 1 : -1));
  });

  pairs.forEach(function (pair) {
    pair.querySelectorAll('figure').forEach(function (f, i) {
      var fc = f.querySelector('figcaption');
      f.setAttribute('data-zoom', '');
      f.setAttribute('role', 'button');
      f.setAttribute('tabindex', '0');
      f.setAttribute('aria-label', 'Enlarge photo' + (fc ? ': ' + fc.textContent.trim() : ''));
      var icon = document.createElement('span');
      icon.className = 'zoom-hint';
      icon.innerHTML = zoomIcon;
      f.appendChild(icon);
      f.addEventListener('click', function () { open(pair, i, f); });
      f.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(pair, i, f); }
      });
    });
  });
});
