/* NeuroFlow AI - behaviour. Vanilla JS, no dependencies. */

// Background: particle neural network
(function () {
  var c = document.getElementById('net'), x = c.getContext('2d'), P = [], W, H, m = { x: -999, y: -999 };
  function size() {
    W = c.width = innerWidth; H = c.height = innerHeight; P = [];
    var n = Math.min(70, Math.floor(W * H / 18000));
    for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 });
  }
  addEventListener('resize', size); size();
  addEventListener('pointermove', function (e) { m.x = e.clientX; m.y = e.clientY; });
  function f() {
    x.clearRect(0, 0, W, H);
    P.forEach(function (p, i) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      x.fillStyle = 'rgba(111,211,255,.7)'; x.beginPath(); x.arc(p.x, p.y, 1.8, 0, 6.3); x.fill();
      for (var j = i + 1; j < P.length; j++) {
        var q = P[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) { x.strokeStyle = 'rgba(111,211,255,' + (.22 * (1 - d / 130)) + ')'; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke(); }
      }
      var dm = Math.hypot(p.x - m.x, p.y - m.y);
      if (dm < 160) { x.strokeStyle = 'rgba(190,235,255,' + (.4 * (1 - dm / 160)) + ')'; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(m.x, m.y); x.stroke(); }
    });
    requestAnimationFrame(f);
  }
  f();
})();

// Reveal cards on scroll
var io = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    if (e.isIntersecting) {
      var i = [].indexOf.call(document.querySelectorAll('.card'), e.target);
      setTimeout(function () { e.target.classList.add('in'); }, i * 180);
      io.unobserve(e.target);
    }
  });
}, { threshold: .2 });
document.querySelectorAll('.card').forEach(function (c) { io.observe(c); });

// Pupil follows the cursor
var pupil = document.getElementById('pupil');
addEventListener('pointermove', function (e) {
  var r = pupil.getBoundingClientRect(),
    dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2),
    d = Math.hypot(dx, dy) || 1, k = Math.min(6, d / 40);
  pupil.style.transform = 'translate(' + (dx / d * k) + 'px,' + (dy / d * k) + 'px)';
});

// Simulated focus meter (hero)
var states = [[85, 'Deep focus'], [62, 'Steady attention'], [38, 'Time for a break'], [92, 'Peak flow'], [55, 'Regaining your rhythm']], s = 0;
function tick() {
  var v = states[s % states.length]; s++;
  document.getElementById('fill').style.width = v[0] + '%';
  document.getElementById('pct').textContent = v[0] + '%';
  document.getElementById('state').textContent = v[1];
}
setTimeout(tick, 600); setInterval(tick, 3500);

// ---- Modals: open from [data-modal], close via button, backdrop click or Esc (native) ----
var lastTrigger = null;
document.querySelectorAll('[data-modal]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var d = document.getElementById(btn.dataset.modal);
    lastTrigger = btn;
    d.showModal();
  });
});
document.querySelectorAll('dialog.panel').forEach(function (d) {
  d.addEventListener('click', function (e) {
    // A click on the dialog element itself (outside the content box) is a backdrop click
    var r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
  });
  d.querySelector('.panel-close').addEventListener('click', function () { d.close(); });
  d.addEventListener('close', function () { if (lastTrigger) lastTrigger.focus(); });
});

// ---- Panel 1: focus level explorer (manual slider, clearly a demo) ----
(function () {
  var r = document.getElementById('demo-range'), v = document.getElementById('demo-val'),
    l = document.getElementById('demo-label'), b = document.getElementById('demo-bar');
  function labelFor(n) { return n < 40 ? 'Time for a break' : n < 70 ? 'Steady attention' : n < 90 ? 'Deep focus' : 'Peak flow'; }
  function update() { v.textContent = r.value + '%'; l.textContent = labelFor(+r.value); b.style.width = r.value + '%'; r.setAttribute('aria-valuetext', r.value + '%, ' + labelFor(+r.value)); }
  r.addEventListener('input', update); update();
})();

// ---- Panel 2: break planner with countdown ----
(function () {
  var dlg = document.getElementById('modal-breaks'), chips = dlg.querySelectorAll('.chip'),
    out = document.getElementById('timer'), msg = document.getElementById('timer-msg'),
    go = document.getElementById('timer-go'), reset = document.getElementById('timer-reset'),
    breakMin = 5, left = 300, id = null;
  function fmt(t) { return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }
  function stop() { clearInterval(id); id = null; go.textContent = 'Start break'; }
  function setBreak(min) { stop(); breakMin = min; left = min * 60; out.textContent = fmt(left); msg.textContent = 'Ready for a ' + min + '-minute break.'; }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (o) { o.setAttribute('aria-pressed', o === c); });
      setBreak(+c.dataset.break);
    });
  });
  go.addEventListener('click', function () {
    if (id) { stop(); go.textContent = 'Resume'; msg.textContent = 'Paused.'; return; }
    if (left <= 0) setBreak(breakMin);
    go.textContent = 'Pause'; msg.textContent = 'Step away from the screen. Breathe.';
    id = setInterval(function () {
      left--; out.textContent = fmt(left);
      if (left <= 0) { stop(); msg.textContent = 'Break complete. Ready to refocus.'; }
    }, 1000);
  });
  reset.addEventListener('click', function () { setBreak(breakMin); });
  dlg.addEventListener('close', function () { setBreak(breakMin); });
})();
