// assents/agenda.js
(() => {
  const list = document.querySelector('#events-list');
  const cityEl = document.querySelector('#city-filter');
  const ds = document.querySelector('#date-start');
  const de = document.querySelector('#date-end');
  const btn = document.querySelector('#apply-filters');
  if (!list) return;

  async function load() {
    const params = new URLSearchParams();
    if (cityEl?.value) params.set('city', cityEl.value);
    if (ds?.value) params.set('from', ds.value);
    if (de?.value) params.set('to', de.value);

    try {
      const r = await fetch('/api/eventos?' + params.toString());
      if (!r.ok) throw new Error('Erro ao buscar eventos');
      const items = await r.json();
      render(items);
    } catch (err) {
      console.error(err);
      list.innerHTML =
        '<li class="muted">Erro ao carregar eventos no momento.</li>';
    }
  }

  function render(items) {
    list.innerHTML = '';
    if (!items.length) {
      list.innerHTML = '<li class="muted">Nenhum evento encontrado.</li>';
      return;
    }

    items.forEach((ev) => {
      const li = document.createElement('li');

      const start = ev.startsAt ? new Date(ev.startsAt) : null;
      const end = ev.endsAt ? new Date(ev.endsAt) : null;
      const dataStr = start
        ? start.toLocaleDateString()
        : '';
      const dataRange = end
        ? `${dataStr} – ${end.toLocaleDateString()}`
        : dataStr;

      li.innerHTML = `
        <div class="row">
          <div>
            <strong>${ev.title}</strong>
            <div class="muted">
              ${[ev.city, ev.venue].filter(Boolean).join(' • ')}
            </div>
          </div>
          <div style="text-align:right">
            <div>${dataRange}</div>
            ${
              ev.url
                ? `<a class="link" href="${ev.url}" target="_blank" rel="noopener">Saiba mais</a>`
                : ''
            }
          </div>
        </div>
      `;
      list.appendChild(li);
    });
  }

  btn?.addEventListener('click', load);
  load();
})();
