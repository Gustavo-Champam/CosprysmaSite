// assents/home.js
(function () {
  const backend =
    (window.APP && window.APP.BACKEND_URL) || 'https://cosprysmasite.onrender.com';
  const container = document.getElementById('home-editorias');
  if (!container) return;

  async function load() {
    try {
      const res = await fetch(`${backend}/api/posts?limit=6`);
      if (!res.ok) throw new Error('Erro ao buscar notícias');
      const posts = await res.json();
      render(posts);
    } catch (err) {
      console.error(err);
      container.innerHTML =
        '<p class="muted">Não foi possível carregar as notícias agora.</p>';
    }
  }

  function render(posts) {
    if (!posts.length) {
      container.innerHTML =
        '<p class="muted">Nenhuma notícia cadastrada ainda.</p>';
      return;
    }

    container.innerHTML = posts
      .map((p) => {
        const cover =
          (p.slides && p.slides[0] && p.slides[0].imageUrl) || '';
        const when = p.createdAt
          ? new Date(p.createdAt).toLocaleString('pt-BR')
          : '';
        const cat = p.category || 'Geral';
        const destaque = p.featured ? ' • ⭐ Destaque' : '';

        return `
          <article class="card gradient-border">
            ${
              cover
                ? `<img src="${backend}${cover}" alt="${p.title || ''}">`
                : ''
            }
            <div class="card__body">
              <p class="meta">${cat} • ${when}${destaque}</p>
              <h3>${p.title || '(sem título)'}</h3>
              ${
                p.subtitle
                  ? `<p>${p.subtitle}</p>`
                  : '<p class="muted">Sem subtítulo.</p>'
              }
            </div>
          </article>
        `;
      })
      .join('');
  }

  load();
})();
