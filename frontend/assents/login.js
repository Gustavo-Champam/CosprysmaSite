// frontend/login.js
(function () {
  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");

  // Mesmo BACKEND_URL do resto do site
  const backendURL =
    (window.APP && window.APP.BACKEND_URL) || "https://cosprysmasite.onrender.com";

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    errorEl.hidden = true;

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
      errorEl.textContent = "Preencha e-mail e senha.";
      errorEl.hidden = false;
      return;
    }

    try {
      const r = await fetch(`${backendURL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password }),
      });

      if (!r.ok) {
        throw new Error("Login inválido");
      }

      const data = await r.json();

      // 🔐 SEMPRE usar a mesma chave aqui e no admin.js
      localStorage.setItem("cosprysma_token", data.token);

      // Vai pro painel
      window.location.href = "admin.html";
    } catch (err) {
      console.error("Erro ao logar:", err);
      errorEl.textContent = "Usuário ou senha incorretos.";
      errorEl.hidden = false;
    }
  });
})();
