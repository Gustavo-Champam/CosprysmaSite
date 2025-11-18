// js/main.js

// Toggle menu (hambúrguer)
(() => {
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    burger.setAttribute(
      'aria-expanded',
      nav.classList.contains('open') ? 'true' : 'false'
    );
  });

  // fecha ao clicar num link (modo mobile)
  nav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();

// Tema (dark/light)
(() => {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  const root = document.documentElement;
  const KEY = 'cosprysma-theme';
  const saved = localStorage.getItem(KEY);
  if (saved) root.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem(KEY, next);
  });
})();

// Reveal on scroll
(() => {
  const els = [...document.querySelectorAll('.reveal')];
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('show');
        io.unobserve(e.target);
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();

// Voltar ao topo
(() => {
  const btn = document.querySelector('.to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) btn.classList.add('show');
    else btn.classList.remove('show');
  });

  btn.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );
})();

// Newsletter → backend opcional (Vercel + Mongo). Se não usar, pode remover este bloco.
(() => {
  const f = document.querySelector('#nl-form');
  if (!f) return;

  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = new FormData(f).get('email');

    try {
      const r = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await r.json();
      alert(
        data.ok
          ? 'Confirme sua inscrição pelo e-mail! ✅'
          : 'Erro: ' + (data.error || 'tente de novo')
      );
      if (data.ok) f.reset();
    } catch (err) {
      alert('Falha na conexão. Tente novamente.');
    }
  });
})();

// Fallback de imagens: se alguma não carregar, usa foto genérica de cosplay
(() => {
  const FALLBACKS = [
    'https://picsum.photos/seed/cosplay1/900/650',
    'https://picsum.photos/seed/cosplay2/900/650',
    'https://picsum.photos/seed/cosplay3/900/650'
  ];
  let i = 0;

  document.addEventListener(
    'error',
    (event) => {
      const img = event.target;
      if (!(img instanceof HTMLImageElement)) return;

      // evita loop infinito
      if (img.dataset.fallback === '1') return;

      const src = FALLBACKS[i++ % FALLBACKS.length];
      img.dataset.fallback = '1';
      img.src = src;
    },
    true // captura erros de <img> na fase de captura
  );
})();
