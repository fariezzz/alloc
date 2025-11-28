async function loadTemplate(id, file) {
  const container = document.getElementById(id);
  if (!container) return;

  const cached = localStorage.getItem("template_" + file);
  if (cached) {
    container.innerHTML = cached;
    return;
  }

  const response = await fetch(file);
  const html = await response.text();

  container.innerHTML = html;

  localStorage.setItem("template_" + file, html);
}

document.addEventListener("DOMContentLoaded", () => {
  loadTemplate("navbar-container", "/templates/navbar.html");
});
