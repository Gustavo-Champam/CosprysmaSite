// assents/auth.js
(function () {
  const form = document.getElementById('login-form');
  const errEl = document.getElementById('login-error');
  if (!form) return;

  const backend =
    (window.APP && window.APP.BACKEND_URL) || 'https://cosprysmasite.onrender.com';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      const res = await fetch(`${backend}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Falha no login');
      }

      localStorage.setItem('cosprysma_token', data.token);
      window.location.href = 'admin.html';
    } catch (err) {
      console.error(err);
      if (errEl) {
        errEl.textContent = 'E-mail ou senha inválidos.';
        errEl.hidden = false;
      }
    }
  });
})();
