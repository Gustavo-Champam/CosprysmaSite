// js/classificados.js
(() => {
  const lista = document.querySelector('#lista-classificados');
  if (!lista) return;

  const filtroTipo = document.querySelector('#filtro-tipo');
  const filtroCidade = document.querySelector('#filtro-cidade');
  const ordenacaoSelect = document.querySelector('#ordenacao-classificados');

  const ROTULO_TIPO = {
    venda: 'Venda',
    troca: 'Troca',
    servico: 'Serviço'
  };

  // uma foto diferente pra cada tipo de anúncio
  const CAPAS_POR_TIPO = {
    venda:   'img/galeria/IMG_9008.jpg',
    troca:   'img/galeria/IMG_9042.jpg',
    servico: 'img/galeria/IMG_8966.jpg'
  };

  let dados = [];

  function capaPara(item) {
    // se quiser usar uma imagem específica no JSON, use campo "imagem"
    if (item.imagem) return item.imagem;
    return CAPAS_POR_TIPO[item.tipo] || 'img/galeria/IMG_9008.jpg';
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
    img.alt = `Foto ilustrativa do anúncio: ${item.titulo}`;
    media.appendChild(img);

    const body = document.createElement('div');
    body.className = 'card-body';

    const pill = document.createElement('span');
    pill.className = 'pill';
    pill.textContent = `${ROTULO_TIPO[item.tipo] || 'Anúncio'} • ${item.preco}`;
    body.appendChild(pill);

    const h2 = document.createElement('h2');
    h2.textContent = item.titulo;
    body.appendChild(h2);

    const meta = document.createElement('p');
    meta.className = 'meta';
    const partes = [];
    if (item.cidade) partes.push(item.cidade);
    if (item.data) partes.push(formatarData(item.data));
    meta.textContent = partes.join(' • ');
    body.appendChild(meta);

    const p = document.createElement('p');
    p.textContent = item.descricao;
    body.appendChild(p);

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

    const contato = document.createElement('p');
    contato.className = 'meta';
    contato.textContent = `Contato: ${item.contato}`;
    body.appendChild(contato);

    return art;
  }

  function aplicarFiltros() {
    if (!dados.length) return;
    const tipo = filtroTipo?.value || '';
    const cidadeBusca = (filtroCidade?.value || '').toLowerCase();
    const ord = ordenacaoSelect?.value || 'data-desc';

    let itens = dados.slice();

    if (tipo) {
      itens = itens.filter((i) => i.tipo === tipo);
    }

    if (cidadeBusca) {
      itens = itens.filter((i) =>
        (i.cidade || '').toLowerCase().includes(cidadeBusca)
      );
    }

    itens.sort((a, b) => {
      const da = a.data || '';
      const db = b.data || '';
      if (da === db) return 0;
      const base = da > db ? 1 : -1;
      return ord === 'data-asc' ? base : -base;
    });

    lista.innerHTML = '';
    if (!itens.length) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = 'Nenhum anúncio encontrado com esses filtros.';
      lista.appendChild(p);
      return;
    }

    const frag = document.createDocumentFragment();
    itens.forEach((item) => frag.appendChild(criarCard(item)));
    lista.appendChild(frag);
  }

  async function carregar() {
    try {
      const r = await fetch('data/classificados.json');
      dados = await r.json();
      aplicarFiltros();
    } catch (err) {
      console.error('Erro ao carregar classificados', err);
      lista.textContent = 'Não foi possível carregar os classificados.';
    }
  }

  filtroTipo?.addEventListener('change', aplicarFiltros);
  filtroCidade?.addEventListener('input', () => aplicarFiltros());
  ordenacaoSelect?.addEventListener('change', aplicarFiltros);

  carregar();
})();
