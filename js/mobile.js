const btn = document.getElementById("menu-btn");
const nav = document.getElementById("navbar");
const overlay = document.getElementById("overlay");

btn.addEventListener("click", () => {
  btn.classList.toggle("active");
  nav.classList.toggle("active");
  overlay.classList.toggle("active");
});

// fechar ao clicar no overlay
overlay.addEventListener("click", () => {
  btn.classList.remove("active");
  nav.classList.remove("active");
  overlay.classList.remove("active");
});
