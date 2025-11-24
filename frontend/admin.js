// frontend/admin.js
(function () {
  const backendURL =
    (window.APP && window.APP.BACKEND_URL) || "https://cosprysmasite.onrender.com";

  // Aceita token salvo como cosprysma_token ou voll_token
  const TOKEN_KEYS = ["cosprysma_token", "voll_token"];

  function getToken() {
    for (const key of TOKEN_KEYS) {
      const t = localStorage.getItem(key);
      if (t) return t;
    }
    return null;
  }

  function clearTokens() {
    TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
  }

  function ensureAuth() {
    const t = getToken();
    if (!t) {
      window.location.href = "login.html";
      throw new Error("Sem token de autenticação");
    }
    return t;
  }

  // Garante auth logo no início
  ensureAuth();

  const form = document.getElementById("post-form");
  const statusEl = document.getElementById("form-status");
  const postsListEl = document.getElementById("posts-list");
  const postsEmptyEl = document.getElementById("posts-empty");
  const reloadBtn = document.getElementById("reload-posts");

  const coverInput = document.getElementById("image");
  const imagePreview = document.getElementById("image-preview");
  const previewPlaceholder = document.querySelector(".preview-placeholder");

  const blocksSection = document.getElementById("blocks-section");
  const blocksContainer = document.getElementById("blocks-container");
  const addTextBtn = document.getElementById("add-text-block");
  const addImageBtn = document.getElementById("add-image-block");
  const categorySelect = document.getElementById("category");

  let coverImageUrl = "";

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message || "";
    statusEl.style.color = isError ? "#f97373" : "";
  }

  async function authFetch(path, options = {}) {
    const token = ensureAuth();

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", `Bearer ${token}`);

    const resp = await fetch(`${backendURL}${path}`, {
      ...options,
      headers,
    });

    // Se o backend devolver 401, limpa token e volta pro login
    if (resp.status === 401) {
      clearTokens();
      window.location.href = "login.html";
      throw new Error("Não autorizado");
    }

    return resp;
  }

  // --------- UPLOAD DE IMAGEM (capa e blocos) ----------
  async function uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);

    const resp = await authFetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!resp.ok) {
      let msg = "Falha no upload da imagem";
      try {
        const data = await resp.json();
        if (data && data.message) msg = data.message;
      } catch (_) {
        // se não vier JSON, ignora
      }
      throw new Error(msg);
    }

    const data = await resp.json();
    return data.url; // ex.: /uploads/arquivo.png
  }

  // --------- CAPA ----------
  if (coverInput) {
    coverInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setStatus("Enviando imagem de destaque...");
        const url = await uploadImage(file);
        coverImageUrl = url;

        if (imagePreview) {
          imagePreview.src = backendURL + url;
          imagePreview.classList.remove("hidden");
        }
        if (previewPlaceholder) {
          previewPlaceholder.classList.add("hidden");
        }

        setStatus("Imagem de destaque enviada.");
      } catch (err) {
        console.error(err);
        setStatus(err.message || "Erro ao enviar imagem de destaque.", true);
      }
    });
  }

  // ---------- BLOCOS DE REPORTAGEM ----------
  function addTextBlock(initialText = "") {
    if (!blocksContainer) return;

    const wrapper = document.createElement("div");
    wrapper.className = "admin-block admin-block-text";
    wrapper.dataset.blockType = "text";

    wrapper.innerHTML = `
      <label class="field">
        <span>Parágrafo</span>
        <textarea rows="4" class="block-text">${initialText}</textarea>
      </label>
      <button type="button" class="icon-btn block-remove">Remover bloco</button>
    `;

    const removeBtn = wrapper.querySelector(".block-remove");
    removeBtn.addEventListener("click", () => wrapper.remove());

    blocksContainer.appendChild(wrapper);
  }

  function addImageBlock() {
    if (!blocksContainer) return;

    const wrapper = document.createElement("div");
    wrapper.className = "admin-block admin-block-image";
    wrapper.dataset.blockType = "image";

    wrapper.innerHTML = `
      <div class="field">
        <span>Foto da reportagem</span>
        <input type="file" accept="image/*" class="block-image-input" />
        <small class="block-status text-muted"></small>
      </div>
      <div class="preview-box">
        <img class="block-image-preview hidden" alt="Pré-visualização da foto da reportagem" />
      </div>
      <label class="field">
        <span>Legenda da foto</span>
        <input type="text" name="caption" placeholder="Legenda e crédito da foto" />
      </label>
      <button type="button" class="icon-btn block-remove">Remover bloco</button>
    `;

    const fileInput = wrapper.querySelector(".block-image-input");
    const status = wrapper.querySelector(".block-status");
    const img = wrapper.querySelector(".block-image-preview");
    const removeBtn = wrapper.querySelector(".block-remove");

    removeBtn.addEventListener("click", () => wrapper.remove());

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        status.textContent = "Enviando...";
        const url = await uploadImage(file);
        wrapper.dataset.imageUrl = url;
        img.src = backendURL + url;
        img.classList.remove("hidden");
        status.textContent = "Imagem enviada.";
      } catch (err) {
        console.error(err);
        status.textContent =
          err.message || "Erro ao enviar imagem. Tente uma imagem menor.";
        wrapper.dataset.imageUrl = "";
        img.classList.add("hidden");
      }
    });

    blocksContainer.appendChild(wrapper);
  }

  function collectBlocks() {
    const blocks = [];
    if (!blocksContainer) return blocks;

    blocksContainer
      .querySelectorAll("[data-block-type]")
      .forEach((blockEl) => {
        const type = blockEl.dataset.blockType;
        if (type === "text") {
          const textarea = blockEl.querySelector(".block-text");
          const text = textarea ? textarea.value.trim() : "";
          if (text) {
            blocks.push({ type: "text", text });
          }
        } else if (type === "image") {
          const url = blockEl.dataset.imageUrl || "";
          const captionInput = blockEl.querySelector('input[name="caption"]');
          const caption = captionInput ? captionInput.value.trim() : "";
          if (url) {
            blocks.push({ type: "image", url, caption });
          }
        }
      });

    return blocks;
  }

  if (addTextBtn) addTextBtn.addEventListener("click", () => addTextBlock());
  if (addImageBtn) addImageBtn.addEventListener("click", () => addImageBlock());

  // mostra/esconde seção de blocos se não for reportagem
  if (categorySelect && blocksSection) {
    const toggleBlocksVisibility = () => {
      if (categorySelect.value === "reportagem") {
        blocksSection.style.display = "";
      } else {
        blocksSection.style.display = "none";
      }
    };
    toggleBlocksVisibility();
    categorySelect.addEventListener("change", toggleBlocksVisibility);
  }

  // --------- SALVAR POST ----------
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const title = document.getElementById("title").value.trim();
      const subtitle = document.getElementById("subtitle").value.trim();
      const category = categorySelect ? categorySelect.value : "";
      const content = document.getElementById("content").value.trim();

      if (!title || !category) {
        setStatus("Preencha título e categoria.", true);
        return;
      }

      const blocks = category === "reportagem" ? collectBlocks() : [];

      const payload = {
        title,
        subtitle,
        category,
        content,
        coverImageUrl,
        blocks,
      };

      try {
        setStatus("Salvando publicação...");
        const resp = await authFetch("/api/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          throw new Error("Erro ao salvar publicação.");
        }

        setStatus("Publicação salva com sucesso.");
        form.reset();
        coverImageUrl = "";

        if (imagePreview) {
          imagePreview.src = "";
          imagePreview.classList.add("hidden");
        }
        if (previewPlaceholder) {
          previewPlaceholder.classList.remove("hidden");
        }
        if (blocksContainer) {
          blocksContainer.innerHTML = "";
        }

        await loadPosts();
      } catch (err) {
        console.error(err);
        setStatus(err.message || "Erro ao salvar publicação.", true);
      }
    });
  }

  // --------- LISTAR POSTS ----------
  async function loadPosts() {
    if (!postsListEl || !postsEmptyEl) return;

    try {
      const resp = await authFetch("/api/posts?limit=50", {
        method: "GET",
      });

      if (!resp.ok) {
        throw new Error("Erro ao carregar posts.");
      }

      const posts = await resp.json();

      postsListEl.innerHTML = "";
      if (!posts.length) {
        postsEmptyEl.style.display = "";
        return;
      }

      postsEmptyEl.style.display = "none";

      posts.forEach((post) => {
        const li = document.createElement("li");
        li.className = "posts-list-item";

        const created = post.createdAt
          ? new Date(post.createdAt).toLocaleDateString("pt-BR")
          : "";

        const linkReportagem =
          post.category === "reportagem"
            ? `reportagem.html?id=${post._id}`
            : "";

        li.innerHTML = `
          <div>
            <strong>${post.title || "(sem título)"}</strong>
            <div class="muted">
              ${post.category || ""} · ${created}
            </div>
            ${
              linkReportagem
                ? `<div class="muted">Link da reportagem: <code>${linkReportagem}</code></div>`
                : ""
            }
          </div>
          <button type="button" class="btn-secondary btn-small" data-delete="${post._id}">
            Excluir
          </button>
        `;

        const delBtn = li.querySelector("[data-delete]");
        if (delBtn) {
          delBtn.addEventListener("click", () => deletePost(post._id));
        }

        postsListEl.appendChild(li);
      });
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Erro ao carregar posts.", true);
    }
  }

  async function deletePost(id) {
    if (!id) return;
    if (!confirm("Tem certeza que deseja excluir esta publicação?")) return;

    try {
      const resp = await authFetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!resp.ok) {
        throw new Error("Erro ao excluir publicação.");
      }

      await loadPosts();
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Erro ao excluir publicação.", true);
    }
  }

  if (reloadBtn) {
    reloadBtn.addEventListener("click", loadPosts);
  }

  // carrega posts ao abrir painel
  loadPosts();
})();
