// assents/post.js
(async function () {
  const base = window.APP?.BACKEND_URL || '';

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  const titleEl = document.getElementById('post-title');
  const subtitleEl = document.getElementById('post-subtitle');
  const categoryEl = document.getElementById('post-category');
  const dateEl = document.getElementById('post-date');
  const introEl = document.getElementById('post-intro');
  const slideshowEl = document.getElementById('post-slideshow');
  const slideImg = document.getElementById('slide-image');
  const slideCaption = document.getElementById('slide-caption');
  const thumbsEl = document.getElementById('slide-thumbs');

  function setSlide(slides, index) {
    if (!slides.length) {
      slideshowEl.style.display = 'none';
      return;
    }
    const s = slides[index];
    const src = s.imageUrl?.startsWith('http')
      ? s.imageUrl
      : `${base}${s.imageUrl}`;
    slideImg.src = src;
    slideImg.alt = s.caption || titleEl.textContent || '';
    slideCaption.textContent = s.caption || '';

    Array.from(thumbsEl.children).forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }

  try {
    const url = base
      ? `${base}/api/posts/${id}`
      : `/api/posts/${id}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Erro ao carregar post');

    const post = await resp.json();

    document.title = `${post.title || 'Notícia'} – Cosprysma`;
    titleEl.textContent = post.title || '';
    subtitleEl.textContent = post.subtitle || '';
    categoryEl.textContent = post.category || 'Geral';

    if (post.createdAt) {
      const date = new Date(post.createdAt);
      dateEl.textContent = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      dateEl.textContent = '';
    }

    introEl.textContent = post.intro || '';

    const slides = Array.isArray(post.slides) ? post.slides : [];

    if (!slides.length) {
      if (post.coverUrl) {
        const src = post.coverUrl.startsWith('http')
          ? post.coverUrl
          : `${base}${post.coverUrl}`;
        slideImg.src = src;
        slideImg.alt = post.title || '';
        slideCaption.textContent = '';
        thumbsEl.style.display = 'none';
      } else {
        slideshowEl.style.display = 'none';
      }
      return;
    }

    // monta thumbs
    thumbsEl.innerHTML = '';
    slides.forEach((s, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'thumb';

      const img = document.createElement('img');
      img.src = s.imageUrl?.startsWith('http')
        ? s.imageUrl
        : `${base}${s.imageUrl}`;
      img.alt = s.caption || '';
      btn.appendChild(img);

      btn.addEventListener('click', () => setSlide(slides, index));
      thumbsEl.appendChild(btn);
    });

    setSlide(slides, 0);
  } catch (err) {
    console.error(err);
    const postEl = document.getElementById('post');
    postEl.innerHTML =
      '<p class="muted">Erro ao carregar esta notícia. Tente novamente mais tarde.</p>';
  }
})();
