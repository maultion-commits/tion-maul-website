/* Tion Maul – Webdesign · Verhalten der Seite (ohne Abhängigkeiten) */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MAIL = 'maultion@gmail.com';

  /* ---------- Jahr im Footer ---------- */
  $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Header, Fortschrittsbalken, Ablauf-Linie ---------- */
  const header = $('.site-header');
  const bar = $('.progress span');
  const stepsWrap = $('.steps');
  const steps = $$('.step');
  let ticking = false;

  const updateSteps = () => {
    if (!stepsWrap) return;
    const rect = stepsWrap.getBoundingClientRect();
    const mid = window.innerHeight * 0.55;
    const p = Math.max(0, Math.min(1, (mid - rect.top) / rect.height));
    stepsWrap.style.setProperty('--p', p.toFixed(4));
    steps.forEach((s) => s.classList.toggle('is-active', s.getBoundingClientRect().top < mid));
  };

  const onScroll = () => {
    ticking = false;
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 8);
    if (bar) {
      const max = root.scrollHeight - window.innerHeight;
      bar.style.setProperty('--scroll', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    }
    updateSteps();
  };
  const requestTick = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  };
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  onScroll();

  /* ---------- Mobile Navigation ---------- */
  const toggle = $('.nav-toggle');
  const nav = $('#main-nav');
  const setNav = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-locked', open);
    const label = $('.sr', toggle);
    if (label) label.textContent = open ? 'Menü schließen' : 'Menü öffnen';
  };
  if (toggle && nav) {
    toggle.addEventListener('click', () => setNav(toggle.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', (e) => { if (e.target.closest('a')) setNav(false); });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setNav(false); });
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => { if (e.matches) setNav(false); });
  }

  /* ---------- Reveal beim Scrollen ---------- */
  $$('[data-stagger]').forEach((group) => {
    Array.from(group.children).forEach((child, i) => child.style.setProperty('--i', String(i % 6)));
  });
  const revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- Scrollspy für die Navigation ---------- */
  const navLinks = $$('.main-nav a[href^="#"]:not(.btn)');
  const spyTargets = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && spyTargets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navLinks.forEach((a) => {
          if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spyTargets.forEach((t) => spy.observe(t));
  }

  /* ---------- Hero-Parallax ---------- */
  const hero = $('.hero');
  const stage = $('.stage');
  if (hero && stage && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let raf = 0; let nx = 0; let ny = 0;
    hero.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      nx = (e.clientX - (r.left + r.width / 2)) / r.width;
      ny = (e.clientY - (r.top + r.height / 2)) / r.height;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          stage.style.setProperty('--px', nx.toFixed(3));
          stage.style.setProperty('--py', ny.toFixed(3));
        });
      }
    });
    hero.addEventListener('pointerleave', () => {
      stage.style.setProperty('--px', '0');
      stage.style.setProperty('--py', '0');
    });
  }

  /* ---------- Anfrage-Formular (erstellt eine E-Mail, speichert nichts) ---------- */
  const form = $('#anfrage');
  if (!form) return;

  const summary = $('#form-summary');
  const errorEl = $('#form-error');
  const note = $('#form-note');
  const noteDefault = note ? note.textContent : '';
  const field = (name) => form.elements[name];

  const read = () => {
    const services = $$('input[name="service"]:checked', form).map((i) => i.value);
    const timing = ($('input[name="timing"]:checked', form) || {}).value || '';
    return {
      services,
      timing,
      name: field('name').value.trim(),
      firma: field('firma').value.trim(),
      tel: field('tel').value.trim(),
      msg: field('msg').value.trim(),
    };
  };

  // Startangebot (100 % Rabatt): gilt für alle Leistungen außer diesen beiden
  const OFFER_EXCLUDED = ['Hosting im Abo', 'Flyer & Druck'];

  const buildMessage = (d) => {
    const lines = ['Guten Tag,', ''];
    if (d.services.length) {
      lines.push('ich interessiere mich für folgende Leistungen:');
      d.services.forEach((s) => lines.push('- ' + s));
      lines.push('');
      if (d.services.some((s) => !OFFER_EXCLUDED.includes(s))) {
        lines.push('Ich möchte das Startangebot nutzen (100 % Rabatt, ausgenommen Hosting im Abo und Flyer & Druck).', '');
      }
    }
    if (d.timing) { lines.push('Zeitrahmen: ' + d.timing, ''); }
    if (d.msg) { lines.push('Zu meinem Vorhaben:', d.msg, ''); }
    lines.push('Viele Grüße', d.name);
    if (d.firma) lines.push(d.firma);
    if (d.tel) lines.push('Telefon: ' + d.tel);
    const subject = 'Projektanfrage' + (d.firma ? ' – ' + d.firma : '') + (d.name ? ' (' + d.name + ')' : '');
    return { subject, body: lines.join('\n') };
  };

  const renderSummary = () => {
    const d = read();
    if (!summary) return;
    if (!d.services.length && !d.timing) {
      summary.textContent = 'Noch nichts ausgewählt.';
      return;
    }
    const parts = [];
    if (d.services.length) parts.push('<strong>' + d.services.length + (d.services.length === 1 ? ' Leistung' : ' Leistungen') + ':</strong> ' + d.services.map(escapeHtml).join(', '));
    if (d.timing) parts.push('<strong>Start:</strong> ' + escapeHtml(d.timing));
    summary.innerHTML = parts.join(' · ');
  };
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  const showError = (msg) => {
    if (!errorEl) return;
    errorEl.textContent = msg;
    errorEl.hidden = !msg;
  };

  const validate = (d) => {
    field('name').classList.remove('is-invalid');
    if (!d.name) {
      field('name').classList.add('is-invalid');
      field('name').focus();
      showError('Bitte geben Sie Ihren Namen an.');
      return false;
    }
    if (!d.services.length && !d.msg) {
      showError('Wählen Sie mindestens eine Leistung oder beschreiben Sie kurz Ihr Vorhaben.');
      return false;
    }
    showError('');
    return true;
  };

  form.addEventListener('input', () => { renderSummary(); if (errorEl && !errorEl.hidden) showError(''); });
  form.addEventListener('change', renderSummary);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = read();
    if (!validate(d)) return;
    const { subject, body } = buildMessage(d);
    const href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body.replace(/\n/g, '\r\n'));
    window.location.href = href;
    if (note) {
      note.textContent = 'Ihr E-Mail-Programm sollte sich jetzt geöffnet haben. Falls nicht: Nutzen Sie „Text kopieren“ und senden Sie die Nachricht an ' + MAIL + '.';
      note.classList.add('is-ok');
    }
  });

  const copyBtn = $('#btn-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const d = read();
      if (!validate(d)) return;
      const { subject, body } = buildMessage(d);
      const text = 'An: ' + MAIL + '\nBetreff: ' + subject + '\n\n' + body;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch (err) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
        ta.remove();
      }
      if (note) {
        note.textContent = ok
          ? 'Kopiert! Fügen Sie den Text in eine E-Mail an ' + MAIL + ' ein.'
          : 'Kopieren hat nicht geklappt. Bitte schreiben Sie direkt an ' + MAIL + '.';
        note.classList.toggle('is-ok', ok);
      }
    });
  }

  /* Leistungs-Karten wählen die passende Option im Formular vor */
  $$('[data-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = btn.getAttribute('data-service');
      const box = $$('input[name="service"]', form).find((i) => i.value === value);
      if (box) box.checked = true;
      renderSummary();
      const target = $('#kontakt');
      if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => { const n = field('name'); if (n) n.focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
      if (note) { note.textContent = noteDefault; note.classList.remove('is-ok'); }
    });
  });

  renderSummary();
})();
