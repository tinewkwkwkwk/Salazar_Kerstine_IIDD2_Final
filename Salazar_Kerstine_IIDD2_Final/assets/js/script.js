(function () {
  'use strict';

  /* ===== CONFIG: contact form service =====
     FormSubmit: the first submission sends an activation email to this address;
     click the link in it once. Or replace with your own endpoint (e.g. EmailJS). */
  var FORM_ENDPOINT = 'https://formsubmit.co/ajax/kerstinesalazar28@gmail.com';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Keep the active bottom-nav tab in view on small screens */
  var cur = $('.bottomnav [aria-current="page"]');
  if (cur) cur.parentNode.scrollLeft = cur.offsetLeft - (cur.parentNode.clientWidth - cur.offsetWidth) / 2;

  /* Back to top */
  var totop = $('#totop');
  function toTop(e) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  if (totop) {
    window.addEventListener('scroll', function () { totop.hidden = window.scrollY < 600; }, { passive: true });
    totop.addEventListener('click', toTop);
  }
  $$('a[href="#top"]').forEach(function (a) { a.addEventListener('click', toTop); });

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

  /* Project images: hide the placeholder label once the image loads */
  $$('.project__img img').forEach(function (img) {
    var ph = img.parentNode.querySelector('.ph');
    function ok() { if (ph) ph.style.display = 'none'; }
    if (img.complete && img.naturalWidth > 0) ok();
    else {
      img.addEventListener('load', ok);
      img.addEventListener('error', function () { img.style.display = 'none'; });
    }
  });

  /* Typing animation (home only; skipped for reduced motion) */
  var typed = $('#typed');
  if (typed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var full = typed.textContent, i = 0;
    typed.textContent = '';
    (function tick() { typed.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(tick, 55); })();
  }

  /* Preview dialog for skill and project cards */
  var triggers = $$('[data-preview]');
  if (triggers.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'preview';
    dlg.setAttribute('aria-label', 'Preview');
    document.body.appendChild(dlg);
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var clone = btn.closest('.project, .card').cloneNode(true);
        $$('.pv, .ph', clone).forEach(function (n) { n.remove(); });
        dlg.innerHTML = '<button type="button" class="preview__x" aria-label="Close preview">✕</button><div class="preview__in"></div>';
        var inner = $('.preview__in', dlg);
        while (clone.firstChild) inner.appendChild(clone.firstChild);
        $('.preview__x', dlg).addEventListener('click', function () { dlg.close(); });
        dlg.showModal();
      });
    });
  }

  /* Contact form (contact page only) */
  var form = $('#form');
  if (!form) return;
  var msg = $('#formmsg'), btn = $('#submit');
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
    if (!Object.keys(rules).map(check).every(Boolean)) { var bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); return; }
    if (!FORM_ENDPOINT || FORM_ENDPOINT.indexOf('YOUR_') !== -1) {
      msg.textContent = 'The form is not connected to an email service yet. Please use the Email me button.';
      return;
    }
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: form.name.value, email: form.email.value, _subject: form.subject.value, message: form.message.value, _honey: form._honey.value })
    }).then(function (r) { return r.json().then(function (d) { return r.ok && d.success !== 'false' && d.success !== false; }); })
      .then(function (ok) {
        if (ok) { form.reset(); msg.textContent = 'Message sent. Thank you, I will reply soon.'; }
        else msg.textContent = 'The message could not be sent. Please email kerstinesalazar28@gmail.com directly.';
      })
      .catch(function () { msg.textContent = 'Network problem. Please check your connection or email kerstinesalazar28@gmail.com directly.'; })
      .finally(function () { btn.disabled = false; btn.textContent = 'Send message'; });
  });
})();
