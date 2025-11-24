// js/admin-upload.js

// Ajusta aqui se seu backend estiver em outra URL/porta
const API_BASE = "https://cosprysmasite.onrender.com";

const uploadForm = document.getElementById("upload-form");
const uploadStatus = document.getElementById("upload-status");
const uploadImageInput = document.getElementById("upload-image");

if (uploadForm) {
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!uploadImageInput.files || uploadImageInput.files.length === 0) {
      if (uploadStatus) uploadStatus.textContent = "Selecione uma imagem antes de enviar.";
      return;
    }

    const formData = new FormData(uploadForm);

    try {
      if (uploadStatus) uploadStatus.textContent = "Enviando imagem...";

      const resp = await fetch(`${API_BASE}/api/gallery/upload`, {
        method: "POST",
        body: formData,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao enviar imagem");
      }

      const data = await resp.json();
      console.log("Upload OK:", data);

      if (uploadStatus) {
        uploadStatus.textContent = "✅ Upload realizado com sucesso!";
      }

      uploadForm.reset();
    } catch (err) {
      console.error("Erro no upload:", err);
      if (uploadStatus) {
        uploadStatus.textContent = "❌ " + (err.message || "Erro ao enviar imagem.");
      }
    }
  });
}
