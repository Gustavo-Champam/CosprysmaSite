// assents/tutoriais.js
(async function () {
  const listEl = document.getElementById('tutorials');
  const tagsEl = document.getElementById('tutorial-tags');
  const searchEl = document.getElementById('tutorial-search');

  if (!listEl || !tagsEl) return;

  let list = [];
  try {
    const resp = await fetch('data/tutorials.json');
    if (resp.ok) {
      list = await resp.json();
    }
  } catch (err) {
    console.error('Erro ao carregar tutorials.json', err);
  }

  const tags = Array.from(new Set(list.flatMap((t) => t.tags || [])));
  let activeTag = 'Todos';

  function renderTags() {
    tagsEl.innerHTML = '';

    const allTags = ['Todos', ...tags];
    allTags.forEach((tag) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip' + (tag === activeTag ? ' active' : '');
      btn.dataset.t = tag;
      btn.textContent = tag;
      btn.addEventListener('click', () => {
        activeTag = tag;
        render();
        renderTags();
      });
      tagsEl.appendChild(btn);
    });
  }

  function render() {
    const q = (searchEl?.value || '').toLowerCase();

    let filtered = list.filter((t) =>
      (t.titulo + t.resumo).toLowerCase().includes(q)
    );

    if (activeTag !== 'Todos') {
      filtered = filtered.filter((t) => (t.tags || []).includes(activeTag));
    }

    listEl.innerHTML = '';

    if (!filtered.length) {
      listEl.innerHTML = '<p class="muted">Nenhum tutorial encontrado.</p>';
      return;
    }

    const frag = document.createDocumentFragment();

    filtered.forEach((t) => {
      const art = document.createElement('article');
      art.className = 'card gradient-border';

      const body = document.createElement('div');
      body.className = 'card__body';

      const h3 = document.createElement('h3');
      h3.textContent = t.titulo;
      body.appendChild(h3);

      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = t.resumo;
      body.appendChild(p);

      const row = document.createElement('div');
      row.className = 'row gap';
      (t.tags || []).forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'pill';
        span.textContent = tag;
        row.appendChild(span);
      });
      body.appendChild(row);

      const linkP = document.createElement('p');
      const a = document.createElement('a');
      a.className = 'link';
      a.href = t.link;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Abrir tutorial';
      linkP.appendChild(a);
      body.appendChild(linkP);

      art.appendChild(body);
      frag.appendChild(art);
    });

    listEl.appendChild(frag);
  }

  renderTags();
  render();

  searchEl?.addEventListener('input', render);
})();
