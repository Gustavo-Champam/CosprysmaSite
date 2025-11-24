// frontend/js/admin.js
const API_BASE = 'https://cosprysmasite.onrender.com';

const form = document.getElementById('post-form');
const inputTitulo = document.getElementById('titulo');
const inputResumo = document.getElementById('resumo');
const inputConteudo = document.getElementById('conteudo');
const inputImagem = document.getElementById('imagem');
const inputImagemUrl = document.getElementById('imagem-url');
const previewImg = document.getElementById('preview-imagem');
const statusEl = document.getElementById('status-admin');

function setStatus(msg) {
  if (!statusEl) return;
  statusEl.textContent = msg || '';
}

// -------- UPLOAD DA IMAGEM (SEM APAGAR O FORM) ----------
async function uploadImagem(file) {
  const fd = new FormData();
  fd.append('image', file);

  setStatus('Enviando imagem...');

  const resp = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: fd
  });

  if (!resp.ok) {
    setStatus('Falha no upload da imagem.');
    throw new Error('Falha no upload');
  }

  const data = await resp.json();

  // guarda URL para usar no post
  inputImagemUrl.value = data.url;

  // prévia visual
  if (data.url && previewImg) {
    previewImg.src = data.url;
    previewImg.hidden = false;
  }

  setStatus('Imagem enviada com sucesso!');
}

// quando o usuário escolher um arquivo
if (inputImagem) {
  inputImagem.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadImagem(file);
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar imagem. Veja o console.');
    }
  });
}

// -------- SALVAR POSTAGEM ----------
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // NÃO deixa recarregar a página

    const payload = {
      titulo: inputTitulo.value.trim(),
      resumo: inputResumo.value.trim(),
      conteudo: inputConteudo.value.trim(),
      imagemUrl: inputImagemUrl.value || null
    };

    if (!payload.titulo || !payload.conteudo) {
      alert('Preencha pelo menos título e conteúdo.');
      return;
    }

    setStatus('Salvando postagem...');

    try {
      // aqui você pode trocar /api/posts pelo endpoint que estiver usando para salvar no JSON
      const resp = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(txt || 'Erro ao salvar post');
      }

      setStatus('Postagem salva com sucesso!');

      // se quiser limpar TUDO depois:
      // form.reset();
      // inputImagemUrl.value = '';
      // if (previewImg) previewImg.hidden = true;

    } catch (err) {
      console.error(err);
      setStatus('Erro ao salvar postagem.');
      alert('Erro ao salvar postagem. Veja o console.');
    }
  });
}
