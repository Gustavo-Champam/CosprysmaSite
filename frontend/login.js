// frontend/login.js
(function () {
  const backendURL =
    (window.APP && window.APP.BACKEND_URL) || "https://cosprysmasite.onrender.com";

  const form = document.getElementById("login-form");
  const errorEl = document.getElementById("login-error");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      errorEl.hidden = false;
      errorEl.textContent = "Preencha usuário e senha.";
      return;
    }

    try {
      const resp = await fetch(`${backendURL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!resp.ok) {
        throw new Error("Credenciais inválidas");
      }

      const data = await resp.json();
      // guarda o token
      localStorage.setItem("cosprysma_token", data.token);
      localStorage.setItem("voll_token", data.token); // compat c/ admin antigo

      window.location.href = "admin.html";
    } catch (err) {
      console.error(err);
      errorEl.hidden = false;
      errorEl.textContent = "Login inválido.";
    }
  });
})();
