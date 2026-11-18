/* freeplayinc.org: plain JavaScript, no libraries.
   Everything here is decoration. The page reads fine with scripts off. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, el) { return (el || doc).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  /* ---------- Sound: a few synthesized blips, off until asked for ---------- */
  var audio = null;
  var soundOn = false;
  var soundBtn = $('#sound');
  function blip(freq, dur, type, when, vol) {
    if (!soundOn || !audio) return;
    var t = audio.currentTime + (when || 0);
    var o = audio.createOscillator();
    var g = audio.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol || 0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(audio.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  var sfx = {
    drop: function () { blip(1320, 0.07, 'triangle', 0, 0.08); blip(1760, 0.12, 'triangle', 0.06, 0.06); },
    back: function () { blip(330, 0.09, 'square', 0); blip(247, 0.09, 'square', 0.09); blip(165, 0.16, 'square', 0.18); },
    tick: function () { blip(880, 0.03, 'square', 0, 0.025); },
    on: function () { blip(523, 0.08, 'square', 0); blip(784, 0.08, 'square', 0.08); blip(1047, 0.14, 'square', 0.16); }
  };
  if (soundBtn) {
    soundBtn.addEventListener('click', function () {
      soundOn = !soundOn;
      if (soundOn && !audio) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) audio = new AC();
      }
      if (audio && audio.state === 'suspended') audio.resume();
      soundBtn.setAttribute('aria-pressed', String(soundOn));
      soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
      if (soundOn) sfx.on();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var rv = $$('[data-rv]');
  // Stagger siblings a little.
  rv.forEach(function (el) {
    var sibs = $$(':scope > [data-rv]', el.parentElement);
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i, 6) * 70 + 'ms');
  });
  $$('.scores__list li').forEach(function (li, i) { li.style.setProperty('--i', i); });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    rv.forEach(function (el) { io.observe(el); });
  } else {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Header: tone follows the section under it, menu on small screens ---------- */
  var head = $('.head');
  var toned = $$('[data-head]');
  var navLinks = $$('.nav a');
  var navTargets = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  function updateHead() {
    var y = 34, tone = 'ink', i, r;
    for (i = 0; i < toned.length; i++) {
      r = toned[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) tone = toned[i].getAttribute('data-head');
    }
    if (head.getAttribute('data-tone') !== tone) head.setAttribute('data-tone', tone);
    var mid = window.innerHeight * 0.4, on = -1;
    for (i = 0; i < navTargets.length; i++) {
      if (navTargets[i] && navTargets[i].getBoundingClientRect().top <= mid) on = i;
    }
    navLinks.forEach(function (a, k) { a.classList.toggle('is-on', k === on); });
    // Out of the way while reading down, back as soon as you scroll up.
    var sy = window.scrollY;
    if (sy < 120 || sy < lastY - 4) head.classList.remove('is-away');
    else if (sy > lastY + 4) head.classList.add('is-away');
    lastY = sy;
  }
  var lastY = window.scrollY;
  head.addEventListener('focusin', function () { head.classList.remove('is-away'); });
  var menuBtn = $('#menu');
  function setMenu(open) {
    head.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!head.classList.contains('is-open')); });
    navLinks.forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    doc.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* ---------- The big title: fits the row, and its letters lean toward the pointer ---------- */
  var mega = $('#mega');
  var letters = $$('.l', mega);
  var lines = $$('.mega__line', mega);
  var BASE_WD = 122, MIN_WD = 84, MAX_WD = 150;
  var centers = [];
  var pointer = { x: -9999, y: -9999, active: false, last: 0 };
  letters.forEach(function (l, i) { l.style.setProperty('--i', i); l._wd = BASE_WD; });

  function fitMega() {
    if (!mega) return;
    letters.forEach(function (l) { l.style.setProperty('--wd', BASE_WD); l.style.setProperty('--wg', 900); l._wd = BASE_WD; });
    mega.style.fontSize = '200px';
    var widest = 0;
    lines.forEach(function (line) {
      var w = 0;
      $$('.l', line).forEach(function (l) { w += l.getBoundingClientRect().width; });
      widest = Math.max(widest, w);
    });
    var avail = mega.clientWidth;
    var size = 200 * (avail / widest) * 0.985;
    // Leave room for the copy and the coin machine on short screens.
    var maxByHeight = (window.innerHeight * (window.innerWidth > 860 ? 0.56 : 0.42)) / (2 * 0.8);
    size = Math.min(size, Math.max(maxByHeight, 70));
    mega.style.fontSize = size.toFixed(1) + 'px';
    measureLetters();
  }
  var footMega = $('.foot__mega');
  function fitFoot() {
    if (!footMega) return;
    footMega.style.fontSize = '100px';
    var span = doc.createElement('span');
    span.textContent = footMega.textContent;
    footMega.textContent = '';
    footMega.appendChild(span);
    var w = span.getBoundingClientRect().width;
    footMega.textContent = span.textContent;
    if (w > 0) footMega.style.fontSize = (100 * (footMega.clientWidth / w) * 0.985).toFixed(1) + 'px';
  }
  function measureLetters() {
    centers = letters.map(function (l) {
      var r = l.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + window.scrollY + r.height / 2 };
    });
  }
  function animateMega(now) {
    if (!mega || calm) return;
    var heroVisible = window.scrollY < window.innerHeight;
    if (!heroVisible) return;
    var idle = !pointer.active || now - pointer.last > 2600;
    var perLine = letters.length / lines.length;
    var targets = letters.map(function (l, i) {
      var p;
      if (idle) {
        // A slow wave runs through the letters when nobody is pointing.
        p = 0.5 + 0.5 * Math.sin(now / 900 - (i % perLine) * 0.9 - Math.floor(i / perLine) * 1.6);
        p *= 0.55;
      } else {
        var dx = pointer.x - centers[i].x;
        var dy = (pointer.y + window.scrollY - centers[i].y) * 0.55;
        var d = Math.sqrt(dx * dx + dy * dy);
        p = clamp(1 - d / (window.innerWidth * 0.34), 0, 1);
        p = p * p * (3 - 2 * p);
      }
      return p;
    });
    // Keep each line's total width steady: what one letter gains, the others give up.
    for (var li = 0; li < lines.length; li++) {
      var sum = 0, k;
      for (k = 0; k < perLine; k++) sum += targets[li * perLine + k];
      var mean = sum / perLine;
      for (k = 0; k < perLine; k++) {
        var idx = li * perLine + k;
        var want = clamp(BASE_WD + (targets[idx] - mean) * 46, MIN_WD, MAX_WD);
        var l = letters[idx];
        l._wd += (want - l._wd) * 0.12;
        l.style.setProperty('--wd', l._wd.toFixed(1));
        l.style.setProperty('--wg', Math.round(clamp(900 - (BASE_WD - l._wd) * 9, 560, 900)));
      }
    }
  }
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    pointer.x = e.clientX; pointer.y = e.clientY; pointer.active = true; pointer.last = performance.now();
  }, { passive: true });

  /* ---------- Hero dots: a halftone field that swells near the pointer ---------- */
  var cv = $('#dots');
  var ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  var dots = { w: 0, h: 0, gap: 30, dpr: 1 };
  function sizeDots() {
    if (!ctx) return;
    var r = cv.getBoundingClientRect();
    dots.dpr = Math.min(window.devicePixelRatio || 1, 2);
    dots.w = r.width; dots.h = r.height;
    dots.gap = r.width < 700 ? 22 : 30;
    cv.width = Math.round(r.width * dots.dpr);
    cv.height = Math.round(r.height * dots.dpr);
    ctx.setTransform(dots.dpr, 0, 0, dots.dpr, 0, 0);
  }
  function drawDots(now) {
    if (!ctx || window.scrollY > dots.h) return;
    ctx.clearRect(0, 0, dots.w, dots.h);
    ctx.fillStyle = '#f0b000';
    var g = dots.gap, t = now / 1000;
    var px = pointer.active ? pointer.x : -9999;
    var py = pointer.active ? pointer.y + window.scrollY : -9999;
    var reach = 260;
    for (var y = g / 2, row = 0; y < dots.h; y += g, row++) {
      for (var x = (row % 2 ? g : g / 2); x < dots.w; x += g) {
        var wave = calm ? 0.5 : 0.5 + 0.5 * Math.sin(x * 0.006 + y * 0.009 + t * 0.9);
        var r = 1.4 + wave * 2.2;
        var dx = x - px, dy = y - py, d = Math.sqrt(dx * dx + dy * dy);
        if (d < reach) { var k = 1 - d / reach; r += k * k * g * 0.42; }
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.2832);
        ctx.fill();
      }
    }
  }

  /* ---------- The coin: the machine won't take it ---------- */
  var arcade = $('#arcade');
  var coin = $('#coin');
  var slot = $('#slot');
  var tray = $('#tray');
  var msg = $('#coinmsg');
  var lines2 = [
    'Coin returned. The games are free.',
    'Still free.',
    'It won’t take it. We checked.',
    'Coins accepted since October: 0.',
    'There’s a coffee link at the bottom. It unlocks nothing.',
    'You’re persistent. Still free.'
  ];
  var tries = 0;
  var cpos = { x: 0, y: 0, r: 0, sx: 1, o: 1 };
  var busy = false;
  function paintCoin() {
    coin.style.transform = 'translate3d(' + cpos.x.toFixed(1) + 'px,' + cpos.y.toFixed(1) + 'px,0) rotate(' + cpos.r.toFixed(1) + 'deg) scaleX(' + cpos.sx.toFixed(3) + ')';
    coin.style.opacity = cpos.o;
  }
  function tween(to, ms, ease, done) {
    var from = { x: cpos.x, y: cpos.y, r: cpos.r, sx: cpos.sx, o: cpos.o };
    var t0 = performance.now();
    if (calm) ms = 1;
    (function step(now) {
      var p = clamp((now - t0) / ms, 0, 1), e = ease ? ease(p) : p;
      ['x', 'y', 'r', 'sx', 'o'].forEach(function (k) { if (to[k] !== undefined) cpos[k] = from[k] + (to[k] - from[k]) * e; });
      if (to.arc) cpos.y -= Math.sin(p * Math.PI) * to.arc;
      paintCoin();
      if (p < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  var easeOut = function (p) { return 1 - Math.pow(1 - p, 3); };
  var easeBounce = function (p) {
    var n = 7.5625, d = 2.75;
    if (p < 1 / d) return n * p * p;
    if (p < 2 / d) return n * (p -= 1.5 / d) * p + 0.75;
    if (p < 2.5 / d) return n * (p -= 2.25 / d) * p + 0.9375;
    return n * (p -= 2.625 / d) * p + 0.984375;
  };
  function offsetTo(el) {
    // Where the coin's translate must go for its centre to sit on el's centre.
    var c = coin.getBoundingClientRect(), t = el.getBoundingClientRect();
    return {
      x: cpos.x + (t.left + t.width / 2) - (c.left + c.width / 2),
      y: cpos.y + (t.top + t.height / 2) - (c.top + c.height / 2)
    };
  }
  function insertCoin() {
    if (busy) return;
    busy = true;
    arcade.classList.remove('is-near');
    var s = offsetTo(slot);
    tween({ x: s.x, y: s.y - 6, r: 0 }, 220, easeOut, function () {
      sfx.drop();
      arcade.classList.add('is-busy');
      tween({ sx: 0.12 }, 130, null, function () {
        tween({ y: s.y + 26, o: 0 }, 170, null, function () {
          msg.textContent = 'Checking…';
          setTimeout(function () {
            var t = offsetTo(tray);
            cpos.x = t.x; cpos.y = t.y - 4; cpos.sx = 1; cpos.r = -200;
            sfx.back();
            tween({ o: 1 }, 90, null, function () {
              tween({ x: 0, y: 0, r: 0, arc: 46 }, 760, easeBounce, function () {
                arcade.classList.remove('is-busy');
                msg.textContent = lines2[tries < lines2.length ? tries : 1 + ((tries - 1) % (lines2.length - 1))];
                tries++;
                busy = false;
              });
            });
          }, calm ? 60 : 620);
        });
      });
    });
  }
  if (coin) {
    var grab = null;
    var nearSlot = function () {
      var c = coin.getBoundingClientRect(), s = slot.getBoundingClientRect();
      var dx = (c.left + c.width / 2) - (s.left + s.width / 2);
      var dy = (c.top + c.height / 2) - (s.top + s.height / 2);
      return Math.sqrt(dx * dx + dy * dy) < 70;
    };
    coin.addEventListener('pointerdown', function (e) {
      if (busy) return;
      grab = { id: e.pointerId, x: e.clientX - cpos.x, y: e.clientY - cpos.y, moved: false, px: e.clientX };
      try { coin.setPointerCapture(e.pointerId); } catch (err) {}
      coin.classList.add('is-held');
    });
    coin.addEventListener('pointermove', function (e) {
      if (!grab || e.pointerId !== grab.id) return;
      var nx = e.clientX - grab.x, ny = e.clientY - grab.y;
      if (Math.abs(nx - cpos.x) + Math.abs(ny - cpos.y) > 0) grab.moved = grab.moved || Math.abs(nx) + Math.abs(ny) > 6;
      cpos.r = clamp((e.clientX - grab.px) * 1.2, -24, 24);
      grab.px = e.clientX;
      cpos.x = nx; cpos.y = ny;
      paintCoin();
      arcade.classList.toggle('is-near', nearSlot());
    });
    var release = function (e) {
      if (!grab || e.pointerId !== grab.id) return;
      var moved = grab.moved;
      grab = null;
      coin.classList.remove('is-held');
      if (!moved) return; // a plain click is handled below
      coin._dragged = performance.now();
      if (nearSlot()) insertCoin();
      else { arcade.classList.remove('is-near'); tween({ x: 0, y: 0, r: 0 }, 520, easeBounce); }
    };
    coin.addEventListener('pointerup', release);
    coin.addEventListener('pointercancel', release);
    // Click, tap or keyboard: the coin walks itself to the slot.
    coin.addEventListener('click', function () {
      // The click that follows a drag is not a second coin.
      if (coin._dragged && performance.now() - coin._dragged < 400) { coin._dragged = 0; return; }
      insertCoin();
    });
  }

  /* ---------- Game stack: cards pile up as you scroll ---------- */
  var games = $$('.game');
  var cards = games.map(function (g) { return $('.game__card', g); });
  var shots = $$('.shot[data-speed]');
  var stackOn = !calm;
  function sizeStack() {
    var vh = window.innerHeight;
    games.forEach(function (g) {
      // A card taller than the screen sticks by its bottom edge, so nothing is hidden.
      g.style.top = Math.min(0, vh - g.offsetHeight) + 'px';
    });
  }
  function updateStack() {
    var vh = window.innerHeight;
    for (var i = 0; i < games.length; i++) {
      var r = games[i].getBoundingClientRect();
      if (r.top < vh * 0.72) games[i].classList.add('is-seen');
      if (!stackOn) continue;
      var next = games[i + 1];
      var p = 0;
      if (next) p = clamp((vh - next.getBoundingClientRect().top) / vh, 0, 1);
      cards[i].style.transform = p > 0 ? 'scale(' + (1 - p * 0.07).toFixed(4) + ')' : '';
      cards[i].style.setProperty('--shade', (p * 0.5).toFixed(3));
    }
    if (calm) return;
    for (var k = 0; k < shots.length; k++) {
      var sr = shots[k].parentElement.getBoundingClientRect();
      if (sr.bottom < -200 || sr.top > vh + 200) continue;
      var c = (sr.top + sr.height / 2 - vh / 2) / vh;
      shots[k].style.setProperty('--py', (c * parseFloat(shots[k].getAttribute('data-speed'))).toFixed(1));
    }
  }

  /* ---------- ScaleConnect screens ---------- */
  var sc = $('#sc-browser');
  if (sc) {
    var scImgs = $$('.browser__view img', sc);
    var scTabs = $$('.browser__tabs button', sc);
    var scAt = 0, scTimer = null, scTouched = false;
    var showSc = function (n) {
      scAt = n;
      scImgs.forEach(function (im, i) { im.classList.toggle('is-on', i === n); });
      scTabs.forEach(function (b, i) { b.classList.toggle('is-on', i === n); b.setAttribute('aria-pressed', String(i === n)); });
    };
    scTabs.forEach(function (b, i) {
      b.addEventListener('click', function () { scTouched = true; clearInterval(scTimer); showSc(i); sfx.tick(); });
    });
    if (!calm && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        clearInterval(scTimer);
        if (es[0].isIntersecting && !scTouched) scTimer = setInterval(function () { showSc((scAt + 1) % scImgs.length); }, 3200);
      }, { threshold: 0.4 }).observe(sc);
    }
  }

  /* ---------- Daybook: the meal types itself ---------- */
  var typed = $('#typed');
  if (typed && !calm && 'IntersectionObserver' in window) {
    var tt = $('#typed-text');
    var full = tt.textContent;
    var rows = $$('.typed__rows li', typed);
    var typing = false;
    var runType = function () {
      if (typing) return;
      typing = true;
      tt.textContent = '';
      rows.forEach(function (r) { r.classList.remove('is-on'); });
      var i = 0, parts = 0;
      (function next() {
        if (i >= full.length) { rows[parts] && rows[parts].classList.add('is-on'); setTimeout(function () { typing = false; }, 400); return; }
        var ch = full.charAt(i++);
        tt.textContent += ch;
        if (ch === ',') { rows[parts] && rows[parts].classList.add('is-on'); parts++; }
        setTimeout(next, ch === ',' ? 260 : 26 + Math.random() * 44);
      })();
    };
    new IntersectionObserver(function (es, o) {
      if (es[0].isIntersecting) { runType(); o.disconnect(); }
    }, { threshold: 0.6 }).observe(typed);
    typed.addEventListener('click', runType);
  } else if (typed) {
    $$('.typed__rows li', typed).forEach(function (r) { r.classList.add('is-on'); });
  }

  /* ---------- The score: the counters spin, then land where they always land ---------- */
  var board = $('#board');
  if (board && !calm && 'IntersectionObserver' in window) {
    var nums = $$('[data-roll]', board);
    new IntersectionObserver(function (es, o) {
      if (!es[0].isIntersecting) return;
      o.disconnect();
      nums.forEach(function (n, i) {
        var end = n.getAttribute('data-roll');
        var stopAt = performance.now() + 700 + i * 320;
        (function spin() {
          if (performance.now() >= stopAt) { n.textContent = end; sfx.tick(); return; }
          n.textContent = end === '0' ? Math.floor(Math.random() * 10) : Math.floor(Math.random() * 90 + 10);
          setTimeout(spin, 60);
        })();
      });
    }, { threshold: 0.5 }).observe(board);
  }

  /* ---------- Web windows: drag them by the title bar ---------- */
  if (finePointer) {
    var zTop = 2;
    $$('.win').forEach(function (win) {
      var bar = $('.win__bar', win);
      var pos = { x: 0, y: 0 }, drag = null;
      bar.addEventListener('pointerdown', function (e) {
        drag = { id: e.pointerId, x: e.clientX - pos.x, y: e.clientY - pos.y };
        try { bar.setPointerCapture(e.pointerId); } catch (err) {}
        win.classList.add('is-held');
        win.style.zIndex = ++zTop;
      });
      bar.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        pos.x = e.clientX - drag.x; pos.y = e.clientY - drag.y;
        win.style.setProperty('--dx', pos.x + 'px');
        win.style.setProperty('--dy', pos.y + 'px');
      });
      var drop = function (e) {
        if (!drag || e.pointerId !== drag.id) return;
        drag = null;
        win.classList.remove('is-held');
      };
      bar.addEventListener('pointerup', drop);
      bar.addEventListener('pointercancel', drop);
    });
  }

  /* ---------- One loop for everything that follows the scroll or the pointer ---------- */
  var scrolled = true;
  window.addEventListener('scroll', function () { scrolled = true; }, { passive: true });
  function frame(now) {
    if (scrolled) { scrolled = false; updateHead(); updateStack(); }
    animateMega(now);
    if (!calm || !frame.drawn) { drawDots(now); frame.drawn = true; }
    requestAnimationFrame(frame);
  }
  function layout() { fitMega(); fitFoot(); sizeDots(); sizeStack(); scrolled = true; frame.drawn = false; }
  var resizeTimer;
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(layout, 120); });
  window.addEventListener('load', layout);

  var start = function () {
    layout();
    if (mega) mega.classList.add('is-in');
    requestAnimationFrame(frame);
  };
  if (doc.fonts && doc.fonts.load) {
    Promise.race([
      doc.fonts.load('900 100px Anybody'),
      new Promise(function (res) { setTimeout(res, 1500); })
    ]).then(start, start);
  } else {
    start();
  }
})();
