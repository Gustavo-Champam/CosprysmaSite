// js/edicao-mensal.js
(() => {
  const lista = document.querySelector('#lista-edicoes');
  if (!lista) return;

  let dados = [];

  // rota por algumas imagens locais pra capas de edição
  const CAPAS_EDICOES = [
    'img/galeria/IMG_8966.jpg',
    'img/galeria/IMG_9008.jpg',
    'img/galeria/IMG_9042.jpg'
  ];

  function capaPara(item, index) {
    // se quiser uma capa específica no JSON, use campo "capa"
    if (item.capa) return item.capa;
    return CAPAS_EDICOES[index % CAPAS_EDICOES.length];
  }

  function formatarData(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    if (Number.isNaN(d.getTime())) return iso;
    const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
    return `${String(d.getDate()).padStart(2,'0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
  }

  function criarCard(item, index) {
    const art = document.createElement('article');
    art.className = 'card gradient-border';

    const media = document.createElement('div');
    media.className = 'card-media';
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = capaPara(item, index);
    img.alt = `Capa da edição ${item.mes}`;
    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = `Edição ${item.mes}`;
    body.appendChild(pill);

    const h2 = document.createElement('h2');
    h2.textContent = item.titulo;
    body.appendChild(h2);

    const meta = document.createElement('p');
    meta.className = 'meta';
    const partes = [];
    if (item.data) partes.push(formatarData(item.data));
    if (item.autor) partes.push(`por ${item.autor}`);
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
    summary.textContent = 'Ver matérias desta edição';
    details.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'post-content';
    const p2 = document.createElement('p');
    const relacionados = (item.editorias_relacionadas || []).join(', ') || 'diversas editorias';
    p2.textContent =
      `Versão demo: esta edição reúne matérias das editorias ${relacionados}. ` +
      `No futuro, aqui entra o índice completo da revista mensal.`;
    content.appendChild(p2);
    details.appendChild(content);
    body.appendChild(details);

    art.appendChild(media);
    art.appendChild(body);
    return art;
  }

  async function carregar() {
    try {
      const r = await fetch('data/materias-especiais.json');
      dados = await r.json();
      // mais recentes primeiro
      dados.sort((a, b) => ((a.data || '') > (b.data || '') ? -1 : 1));

      const frag = document.createDocumentFragment();
      dados.forEach((item, idx) => frag.appendChild(criarCard(item, idx)));
      lista.appendChild(frag);
    } catch (err) {
      console.error('Erro ao carregar edições mensais', err);
      lista.textContent = 'Não foi possível carregar as edições mensais.';
    }
  }

  carregar();
})();
