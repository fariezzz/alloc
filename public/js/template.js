// assets/js/template.js
async function loadTemplate(id, file) {
  const container = document.getElementById(id);
  if (container) {
    const response = await fetch(file);
    const html = await response.text();
    container.innerHTML = html;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadTemplate("navbar-container", "./templates/navbar.html");
 
});
