(function () {
  'use strict';

  /* ===== CONFIG: contact form service =====
     FormSubmit: the first submission sends an activation email to the address
     below; click the link in it once. Or replace with your own endpoint. */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/kerstinesalazar28@gmail.com';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Mobile menu */
  var burger = $('#burger'), menu = $('#menu');
  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* Active nav link on scroll */
  var links = $$('.menu a');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); });
  function setActive() {
    var y = window.scrollY + 120, current = 0;
    sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) current = sections.length - 1;
    links.forEach(function (a, i) {
      a.classList.toggle('active', i === current);
      if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }

  /* Back to top */
  var totop = $('#totop');
  function onScroll() {
    setActive();
    totop.hidden = window.scrollY < 600;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  totop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $$('a[href="#home"]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  });

  /* Reveal on scroll */
  var items = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  /* Missing images: show the styled fallback instead of a broken icon */
  $$('.portrait img, .project__img img').forEach(function (img) {
    function miss() { img.style.display = 'none'; var p = img.closest('.portrait'); if (p) p.classList.add('noimg'); }
    img.addEventListener('error', miss);
    if (img.complete && img.naturalWidth === 0) miss();
  });
  $$('.project__img img').forEach(function (img) {
    var ph = img.parentNode.querySelector('.ph');
    function ok() { if (ph) ph.style.display = 'none'; }
    if (img.complete && img.naturalWidth > 0) ok(); else img.addEventListener('load', ok);
  });

  /* Typing animation (title stays readable: full text is the default, and reduced motion skips it) */
  var typed = $('#typed');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typed && !reduce) {
    var full = typed.textContent, i = 0;
    typed.textContent = '';
    (function tick() {
      typed.textContent = full.slice(0, ++i);
      if (i < full.length) setTimeout(tick, 55);
    })();
  }

  /* Contact form */
  var form = $('#form'), msg = $('#formmsg'), btn = $('#submit');
  var rules = {
    name: function (v) { return v.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).'; },
    email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address, like name@company.com.'; },
    subject: function (v) { return v.trim().length >= 3 ? '' : 'Enter a subject (at least 3 characters).'; },
    message: function (v) { return v.trim().length >= 10 ? '' : 'Write a message of at least 10 characters.'; }
  };
  function check(name) {
    var f = form.elements[name], err = $('#' + name + '-err'), text = rules[name](f.value);
    err.textContent = text;
    f.setAttribute('aria-invalid', text ? 'true' : 'false');
    if (text) f.setAttribute('aria-describedby', name + '-err'); else f.removeAttribute('aria-describedby');
    return !text;
  }
  Object.keys(rules).forEach(function (n) { form.elements[n].addEventListener('blur', function () { check(n); }); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    var valid = Object.keys(rules).map(check).every(Boolean);
    if (!valid) { var bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); return; }
    if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('YOUR_') !== -1) {
      msg.textContent = 'The form is not connected to an email service yet. Please use the Email me button.';
      return;
    }
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: form.name.value, email: form.email.value, _subject: form.subject.value,
        message: form.message.value, _honey: form._honey.value
      })
    }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok && d.success !== 'false' && d.success !== false, d: d }; }); })
      .then(function (res) {
        if (res.ok) { form.reset(); msg.textContent = 'Message sent. Thank you, I will reply soon.'; }
        else msg.textContent = 'The message could not be sent. Please email kerstinesalazar28@gmail.com directly.';
      })
      .catch(function () { msg.textContent = 'Network problem. Please check your connection or email kerstinesalazar28@gmail.com directly.'; })
      .finally(function () { btn.disabled = false; btn.textContent = 'Send message'; });
  });
})();
