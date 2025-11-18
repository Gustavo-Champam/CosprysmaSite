// js/home.js
(() => {
  const container = document.getElementById('home-editorias');
  if (!container) return;

  function criarBadgeEditorias(editoria) {
    const map = {
      'estrela-da-semana': '⭐ Estrela da Semana',
      'fanart': '🎨 Fanart',
      'flashcosplay': '⚡ Flashcosplay',
      'agenda': '📅 Agenda',
      'cosmakelab': '🛠️ Cosmakelab',
      'fala-cosplay': '💬 Fala Cosplay'
    };
    return map[editoria] || editoria;
  }

  async function carregar() {
    try {
      const res = await fetch('data/editorias.json');
      if (!res.ok) throw new Error('Erro ao carregar editorias');
      const posts = await res.json();

      const ultimos = posts
        .slice()
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 3);

      container.innerHTML = '';

      ultimos.forEach((post) => {
        const card = document.createElement('article');
        card.className = 'card gradient-border';

        const data = new Date(post.data);
        const dataFmt = !isNaN(data) ? data.toLocaleDateString('pt-BR') : '';

        card.innerHTML = `
          <img src="${post.imagemCapa}" alt="${post.titulo}" loading="lazy" />
          <div class="card__body">
            <p class="kicker">${criarBadgeEditorias(post.editoria)} • ${dataFmt}</p>
            <h3>${post.titulo}</h3>
            <p class="muted">${post.subtitulo || ''}</p>
            <p class="meta">Por ${post.autor || 'Comunidade Cosprysma'}</p>
            <details class="post-details">
              <summary class="link">Ler matéria</summary>
              <div class="post-content">
                ${post.conteudoHtml || ''}
              </div>
            </details>
          </div>
        `;

        container.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      container.innerHTML = '<p class="muted">Não foi possível carregar as matérias de hoje.</p>';
    }
  }

  carregar();
})();
