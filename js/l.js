// l.js — monta landing dinamicamente para uid
(function () {
  const store = {
    get(k, d) {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(d || null));
    },
  };
  const params = new URL(location.href).searchParams;
  const uid = params.get("uid");
  if (!uid) {
    document.getElementById("app").innerHTML = "<h2>UID ausente</h2>";
    throw "uid missing";
  }

  const info = store.get(`info_${uid}`, {
    casal: "Nosso Casamento",
    data: "",
    local: "",
    mensagem: "",
    cor: "#b78b2b",
  });
  const convidados = store.get(`convidados_${uid}`, []);
  const presentes = store.get(`presentes_${uid}`, []);

  const app = document.getElementById("app");

  function tempoRestante() {
    if (!info.data) return "Data não definida";
    const diff = new Date(info.data) - Date.now();
    if (diff <= 0) return "O grande dia chegou!";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    return `${d} dias • ${h}h • ${m}m`;
  }

  function render() {
    app.innerHTML = "";
    const hero = document.createElement("section");
    hero.className = "hero";
    hero.innerHTML = `<h1>${info.casal}</h1><div>${new Date(
      info.data
    ).toLocaleString()}</div><div id="contador">${tempoRestante()}</div><p>${
      info.local
    }</p>`;
    app.appendChild(hero);

    const bloco = document.createElement("section");
    bloco.className = "bloco";
    bloco.innerHTML = "<h2>Convidados</h2>";
    convidados.forEach((c) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<strong>${c.nome}</strong>`;
      bloco.appendChild(div);
    });
    app.appendChild(bloco);

    const bloco2 = document.createElement("section");
    bloco2.className = "bloco";
    bloco2.innerHTML = "<h2>Lista de Presentes</h2>";
    presentes.forEach((p) => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `<strong>${p.nome}</strong><div>${
        p.reservadoPor ? "Reservado" : "Disponível"
      }</div>`;
      bloco2.appendChild(div);
    });
    app.appendChild(bloco2);
  }

  render();
  setInterval(() => {
    const el = document.getElementById("contador");
    if (el) el.textContent = tempoRestante();
  }, 1000);
})();
