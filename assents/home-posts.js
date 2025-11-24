// assents/home-posts.js
(function () {
  const backendURL = (window.APP && window.APP.BACKEND_URL) || "";

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return (
      d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }) +
      ", " +
      d.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
      })
    );
  }

  function createPostCard(post) {
    const article = document.createElement("article");
    article.className = "card gradient-border reveal";

    if (post.imageUrl) {
      const img = document.createElement("img");
      img.src = post.imageUrl;
      img.alt = post.title || "Capa da notícia";
      article.appendChild(img);
    }

    const body = document.createElement("div");
    body.className = "card-body";

    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = `${post.category || "Geral"} • ${formatDate(
      post.createdAt
    )}`;
    body.appendChild(meta);

    const titleEl = document.createElement("h3");
    titleEl.textContent = post.title || "(sem título)";
    body.appendChild(titleEl);

    const excerpt = document.createElement("p");
    excerpt.className = "muted";
    const baseText = post.subtitle || post.body || "";
    const firstLine = baseText.split("\n")[0].trim();
    excerpt.textContent =
      firstLine.length > 160 ? firstLine.slice(0, 157) + "..." : firstLine;
    body.appendChild(excerpt);

    const details = document.createElement("details");
    details.className = "post-details";

    const summary = document.createElement("summary");
    summary.textContent = "Ler notícia completa";
    details.appendChild(summary);

    const content = document.createElement("div");
    content.className = "post-content";

    const paragraphs = (post.body || "")
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    paragraphs.forEach((text) => {
      const p = document.createElement("p");
      p.textContent = text;
      content.appendChild(p);
    });

    if (post.imageUrl2) {
      const img2 = document.createElement("img");
      img2.src = post.imageUrl2;
      img2.alt = "";
      img2.className = "post-image-2";
      content.appendChild(img2);
    }

    details.appendChild(content);
    body.app
