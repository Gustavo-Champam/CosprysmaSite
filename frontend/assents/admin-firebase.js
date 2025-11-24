// js/admin-firebase.js
import { auth, db } from "../frontend/newsletter/js/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// e-mails que podem acessar o admin
const ADMIN_EMAILS = ["cosplayjornal@gmail.com"];

const form = document.getElementById("post-form");
const postsListEl = document.getElementById("posts-list");
const logoutBtn = document.getElementById("btn-logout");
const newBtn = document.getElementById("btn-new");

const idInput = document.getElementById("post-id");
const titleInput = document.getElementById("title");
const subtitleInput = document.getElementById("subtitle");
const categoryInput = document.getElementById("category");
const imageUrlInput = document.getElementById("imageUrl");
const imageUrl2Input = document.getElementById("imageUrl2");
const highlightInput = document.getElementById("highlight");
const bodyInput = document.getElementById("body");

const postsCol = collection(db, "posts");

// 1) Protege a página (só admin logado entra)
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    alert("Você não tem permissão para acessar o painel.");
    signOut(auth);
    window.location.href = "login.html";
    return;
  }

  carregarPosts();
});

// 2) Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}

// 3) Salvar (criar / editar)
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      title: titleInput.value.trim(),
      subtitle: subtitleInput.value.trim(),
      category: (categoryInput.value || "Geral").trim() || "Geral",
      imageUrl: imageUrlInput.value.trim(),
      imageUrl2: imageUrl2Input.value.trim(),
      highlight: !!highlightInput.checked,
      body: bodyInput.value,
      updatedAt: serverTimestamp()
    };

    try {
      if (idInput.value) {
        // editar
        const ref = doc(db, "posts", idInput.value);
        await updateDoc(ref, data);
      } else {
        // novo
        await addDoc(postsCol, {
          ...data,
          createdAt: serverTimestamp()
        });
      }

      alert("Post salvo com sucesso!");
      form.reset();
      idInput.value = "";
      await carregarPosts();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Erro ao salvar post:", err);
      alert("Erro ao salvar post. Veja o console.");
    }
  });
}

// 4) Botão "Novo"
if (newBtn) {
  newBtn.addEventListener("click", () => {
    form?.reset();
    idInput.value = "";
  });
}

// 5) Clique em editar/excluir (delegação)
async function handleListClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.dataset.id;
  const action = btn.dataset.action;
  if (!id || !action) return;

  if (action === "edit") {
    const ref = doc(db, "posts", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      alert("Post não encontrado.");
      return;
    }
    const p = snap.data();

    idInput.value = id;
    titleInput.value = p.title || "";
    subtitleInput.value = p.subtitle || "";
    categoryInput.value = p.category || "";
    imageUrlInput.value = p.imageUrl || "";
    imageUrl2Input.value = p.imageUrl2 || "";
    highlightInput.checked = !!p.highlight;
    bodyInput.value = p.body || "";

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (action === "delete") {
    if (!confirm("Tem certeza que deseja excluir este post?")) return;
    const ref = doc(db, "posts", id);
    await deleteDoc(ref);
    await carregarPosts();
  }
}

if (postsListEl) {
  postsListEl.addEventListener("click", handleListClick);
}

// 6) Carregar lista de posts
async function carregarPosts() {
  if (!postsListEl) return;
  postsListEl.innerHTML = "<p>Carregando...</p>";

  try {
    const q = query(postsCol, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (snap.empty) {
      postsListEl.innerHTML = "<p>Nenhuma notícia cadastrada ainda.</p>";
      return;
    }

    const frag = document.createDocumentFragment();

    snap.forEach((docSnap) => {
      const p = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "post-item";

      const created =
        p.createdAt && p.createdAt.toDate
          ? p.createdAt.toDate().toLocaleString("pt-BR")
          : "";

      div.innerHTML = `
        <div class="post-item-main">
          <strong>${p.title || "(sem título)"}</strong>
          <span class="post-meta">
            ${p.category || "Geral"} • ${created}
            ${p.highlight ? " • ⭐ Destaque" : ""}
          </span>
        </div>
        <div class="post-item-actions">
          <button type="button" data-id="${id}" data-action="edit">Editar</button>
          <button type="button" data-id="${id}" data-action="delete">Excluir</button>
        </div>
      `;

      frag.appendChild(div);
    });

    postsListEl.innerHTML = "";
    postsListEl.appendChild(frag);
  } catch (err) {
    console.error("Erro ao carregar posts:", err);
    postsListEl.innerHTML = "<p>Erro ao carregar posts.</p>";
  }
}
