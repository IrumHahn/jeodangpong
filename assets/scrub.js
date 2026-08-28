/* 영상 스크럽판 부품 키트 — 실행DAY 2026-08-29 */
(function () {
  'use strict';

  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isPortrait = matchMedia('(max-width: 880px)').matches;
  var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  function build(sc) {
    var clip = isPortrait && sc.dataset.clipM ? sc.dataset.clipM : sc.dataset.clip;
    var poster = isPortrait && sc.dataset.posterM ? sc.dataset.posterM : sc.dataset.poster;
    var screens = Math.max(1, parseFloat(sc.dataset.scroll) || 3);

    var bands = Array.prototype.slice.call(sc.querySelectorAll('.rd-scrub__band'));
    var stage = document.createElement('div');
    stage.className = 'rd-scrub__stage';

    var media = document.createElement('div');
    media.className = 'rd-scrub__media';
    media.setAttribute('aria-hidden', 'true');
    if (poster) {
      var img = document.createElement('img');
      img.className = 'rd-scrub__poster';
      img.src = poster;
      img.alt = '';
      img.setAttribute('fetchpriority', 'high');
      media.appendChild(img);
    }
    stage.appendChild(media);

    var scrim = document.createElement('div');
    scrim.className = 'rd-scrub__scrim';
    stage.appendChild(scrim);

    var copy = document.createElement('div');
    copy.className = 'rd-scrub__copy';
    bands.forEach(function (b) { copy.appendChild(b); });
    stage.appendChild(copy);

    var cue = document.createElement('div');
    cue.className = 'rd-scrub__cue';
    cue.setAttribute('aria-hidden', 'true');
    cue.innerHTML = '<span>' + (sc.dataset.cue || 'SCROLL') + '</span><i></i>';
    stage.appendChild(cue);

    var bar = document.createElement('div');
    bar.className = 'rd-scrub__progress';
    bar.innerHTML = '<i></i>';
    stage.appendChild(bar);

    sc.innerHTML = '';
    sc.appendChild(stage);

    if (reduced || !clip) {
      sc.classList.add('rd-scrub--static');
      return;
    }
    sc.classList.add('rd-scrub--live');
    sc.style.height = ((screens + 1) * 100) + 'svh';

    var S = { video: null, ready: false, loading: false, target: 0, current: 0 };

    function load() {
      if (S.loading || S.ready) return;
      S.loading = true;
      var v = document.createElement('video');
      v.className = 'rd-scrub__video';
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.setAttribute('muted', '');
      v.setAttribute('playsinline', '');
      v.addEventListener('loadeddata', function () {
        S.ready = true;
        sc.classList.add('rd-scrub--has-video');
      }, { once: true });
      v.addEventListener('error', function () { sc.classList.add('rd-scrub--video-failed'); });
      S.video = v;
      media.appendChild(v);

      fetch(clip).then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.blob();
      }).then(function (b) {
        v.src = URL.createObjectURL(b);
      }).catch(function () {
        v.src = clip;
      });
    }

    var tol = (isPortrait || isSafari) ? 0.02 : 0.008;
    var driving = false;
    function drive() {
      var v = S.video;
      if (v && S.ready && !v.seeking) {
        S.current += (S.target - S.current) * 0.18;
        var t = clamp(S.current, 0, 0.999) * (v.duration || 1);
        if (Math.abs(v.currentTime - t) > tol) {
          try { v.currentTime = t; } catch (e) {}
        }
      }
      requestAnimationFrame(drive);
    }

    var tick = false;
    function progress() {
      var r = sc.getBoundingClientRect();
      var range = sc.offsetHeight - innerHeight;
      if (range <= 0) return 0;
      return clamp(-r.top / range, 0, 1);
    }
    function render() {
      tick = false;
      var p = progress();
      S.target = p;
      bar.style.setProperty('--p', p.toFixed(4));
      sc.style.setProperty('--cue', p > 0.02 ? 0 : 1);
      bands.forEach(function (b) {
        var a = parseFloat(b.dataset.a);
        var z = parseFloat(b.dataset.b);
        if (isNaN(a) || isNaN(z)) {
          b.classList.add('on');
          return;
        }
        b.classList.toggle('on', p >= a && p <= z);
      });
      if (!driving) {
        driving = true;
        requestAnimationFrame(drive);
      }
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          load();
          io.disconnect();
        }
      }, { rootMargin: '60% 0px' });
      io.observe(sc);
    } else {
      load();
    }

    addEventListener('scroll', function () {
      if (!tick) {
        tick = true;
        requestAnimationFrame(render);
      }
    }, { passive: true });
    addEventListener('resize', render);
    render();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.rd-scrub'), build);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
