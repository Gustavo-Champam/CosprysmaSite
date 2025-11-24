// js/editorias.js
(() => {
  const lista = document.querySelector('#lista-editorias');
  if (!lista) return;

  const filtroEditoria = document.querySelector('#filtro-editoria');
  const buscaInput = document.querySelector('#busca-editorias');
  const ordenacaoSelect = document.querySelector('#ordenacao-editorias');

  let dados = [];

  // mapeia cada editoria para uma foto local da pasta img/galeria
  const CAPAS_LOCAL = {
    'estrela-da-semana': 'img/galeria/IMG_8966.jpg',
    'fanart':            'img/galeria/IMG_9008.jpg',
    'flashcosplay':      'img/galeria/IMG_9042.jpg',
    'agenda':            'img/galeria/IMG_8966.jpg',
    'cosmakelab':        'img/galeria/IMG_9008.jpg',
    'fala-cosplay':      'img/galeria/IMG_9042.jpg'
  };

  function capaPara(item) {
    // se você quiser usar uma imagem específica no JSON, pode ter o campo "capa"
    if (item.capa) return item.capa;

    const slug = item.slug || item.editoria_slug || '';
    return CAPAS_LOCAL[slug] || 'img/galeria/IMG_8966.jpg';
  }

  function formatarData(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return iso;
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${String(d.getDate()).padStart(2,'0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  function criarCard(item) {
    const art = document.createElement('article');
    art.className = 'card gradient-border';

    const media = document.createElement('div');
    media.className = 'card-media';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = capaPara(item);
    img.alt = item.alt || `Imagem ilustrativa da editoria ${item.editoria_nome || ''}`.trim();
    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const pill = document.createElement('span');
    pill.className = 'pill';
    const nomeEd = item.editoria_nome || 'Editorias';
    pill.textContent = `${item.icone ? item.icone + ' ' : ''}${nomeEd}`;
    body.appendChild(pill);

    const h2 = document.createElement('h2');
    h2.textContent = item.titulo;
    body.appendChild(h2);

    const meta = document.createElement('p');
    meta.className = 'meta';
    const partes = [];
    if (item.data) partes.push(formatarData(item.data));
    if (item.autor) partes.push(`por ${item.autor}`);
    if (item.local) partes.push(item.local);
    meta.textContent = partes.join(' • ');
    body.appendChild(meta);

    if (item.resumo) {
      const p = document.createElement('p');
      p.textContent = item.resumo;
      body.appendChild(p);
    }

    if (Array.isArray(item.tags) && item.tags.length) {
      const tagsEl = document.createElement('div');
      tagsEl.className = 'tags';
      item.tags.forEach((tag) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
      body.appendChild(tagsEl);
    }

    const details = document.createElement('details');
    details.className = 'post-details';
    const summary = document.createElement('summary');
    summary.textContent = 'Ler mais';
    details.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'post-content';
    const p2 = document.createElement('p');
    p2.textContent =
      item.texto ||
      'Versão demo: o texto completo desta matéria será publicado na edição mensal ou nas redes do Cosprysma.';
    content.appendChild(p2);
    details.appendChild(content);
    body.appendChild(details);

    art.appendChild(media);
    art.appendChild(body);
    return art;
  }

  function aplicarFiltros() {
    if (!dados.length) return;
    const slug = filtroEditoria?.value || '';
    const termo = (buscaInput?.value || '').toLowerCase();
    const ord = ordenacaoSelect?.value || 'data-desc';

    let itens = dados.slice();

    if (slug) {
      itens = itens.filter(
        (i) =>
          i.slug === slug ||
          i.editoria_slug === slug
      );
    }

    if (termo) {
      itens = itens.filter((i) => {
        const texto = [
          i.titulo,
          i.resumo,
          i.autor,
          i.local,
          ...(i.tags || [])
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return texto.includes(termo);
      });
    }

    if (ord === 'data-desc' || ord === 'data-asc') {
      itens.sort((a, b) => {
        const da = a.data || '';
        const db = b.data || '';
        if (da === db) return 0;
        const base = da > db ? 1 : -1;
        return ord === 'data-asc' ? base : -base;
      });
    } else if (ord === 'destaque') {
      itens = itens.filter((i) => i.destaque);
      itens.sort((a, b) => ((a.data || '') > (b.data || '') ? -1 : 1));
    }

    lista.innerHTML = '';
    if (!itens.length) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'Nenhuma matéria encontrada com esses filtros.';
      lista.appendChild(p);
      return;
    }

    const frag = document.createDocumentFragment();
    itens.forEach((item) => frag.appendChild(criarCard(item)));
    lista.appendChild(frag);
  }

  async function carregar() {
    try {
      const r = await fetch('data/editorias.json');
      dados = await r.json();
      aplicarFiltros();
    } catch (err) {
      console.error('Erro ao carregar editorias', err);
      lista.textContent = 'Não foi possível carregar as editorias.';
    }
  }

  filtroEditoria?.addEventListener('change', aplicarFiltros);
  buscaInput?.addEventListener('input', () => aplicarFiltros());
  ordenacaoSelect?.addEventListener('change', aplicarFiltros);

  carregar();
})();
