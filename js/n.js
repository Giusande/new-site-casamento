// n.js (painel dos noivos)
(function () {
  // ============= LOGIN AUTO-VERIFICATION ============= //

  // Puxa o login salvo
  const userLogged = JSON.parse(localStorage.getItem("user_logged") || "null");

  // Se não estiver logado → bloqueia a página
  if (!userLogged || !userLogged.uid) {
    document.body.innerHTML = `
      <h2 style="padding:20px; text-align:center;">
        Você precisa fazer login para acessar o painel 💍<br>
        <br>
        <a href="../register/login/" style="color:#b78b2b; font-size:18px;">Ir para Login</a>
      </h2>`;
    throw "Usuário não logado";
  }

  const uid = userLogged.uid;

  // Se a URL atual não contém ?uid=XYZ → corrigir automaticamente
  const url = new URL(location.href);
  if (url.searchParams.get("uid") !== uid) {
    url.searchParams.set("uid", uid);
    // Atualiza a URL sem recarregar a página
    window.history.replaceState({}, "", url.toString());
  }

  // ======================================================= //
  //   SISTEMA DE ARMAZENAMENTO SEPARADO POR USUÁRIO
  // ======================================================= //

  const storeLocal = {
    get(k, d) {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(d || null));
    },
    set(k, v) {
      localStorage.setItem(k, JSON.stringify(v));
    },
  };

  // keys per user:
  const keyInfo = `info_${uid}`;
  const keyConvidados = `convidados_${uid}`;
  const keyPresentes = `presentes_${uid}`;

  // helpers to get/set
  function getInfo() {
    return storeLocal.get(keyInfo, {
      casal: "",
      data: "",
      local: "",
      mensagem: "",
      cor: "#b78b2b",
    });
  }
  function setInfo(v) {
    storeLocal.set(keyInfo, v);
  }
  function getConvidados() {
    return storeLocal.get(keyConvidados, []);
  }
  function setConvidados(v) {
    storeLocal.set(keyConvidados, v);
  }
  function getPresentes() {
    return storeLocal.get(keyPresentes, []);
  }
  function setPresentes(v) {
    storeLocal.set(keyPresentes, v);
  }

  // =======================================================================
  // resto do seu código (renderizar, salvar, adicionar convidados, etc.)
  // =======================================================================

  const elCasal = document.getElementById("casal");
  const elData = document.getElementById("data");
  const elLocal = document.getElementById("local");
  const elMensagem = document.getElementById("mensagem");
  const elCor = document.getElementById("cor");
  const elSalvo = document.getElementById("salvoInfo");

  function carregarInfo() {
    const info = getInfo();
    if (elCasal) elCasal.placeholder = "Ex: Ana e Paulo";
    if (elData) elData.value = info.data || "";
    if (elLocal) elLocal.value = info.local || "";
    if (elMensagem) elMensagem.value = info.mensagem || "";
    if (elCor) elCor.value = info.cor || "#b78b2b";
    renderConvidados();
    renderPresentes();
  }
  window.onload = carregarInfo;

  window.salvarInfo = function () {
    const info = {
      casal: (elCasal && elCasal.value) || "",
      data: (elData && elData.value) || "",
      local: (elLocal && elLocal.value) || "",
      mensagem: (elMensagem && elMensagem.value) || "",
      cor: (elCor && elCor.value) || "#b78b2b",
    };
    setInfo(info);
    if (elSalvo) {
      elSalvo.textContent = "Informações salvas ✓";
      setTimeout(() => (elSalvo.textContent = ""), 2000);
    }
  };

  // convidados
  window.addConvidado = function () {
    const nome = (document.getElementById("nomeConvidado") || {}).value || "";
    if (!nome) return alert("Digite um nome de convidado");
    const lista = getConvidados();
    const id = Date.now();
    lista.push({ id, nome, presente: null, confirmado: null });
    setConvidados(lista);
    (document.getElementById("nomeConvidado") || {}).value = "";
    renderConvidados();
  };

  window.removerConvidado = function (id) {
    let lista = getConvidados();
    lista = lista.filter((c) => c.id !== id);
    setConvidados(lista);
    renderConvidados();
  };

  function renderConvidados() {
    const lista = getConvidados();
    const out = document.getElementById("listaConvidados");
    if (!out) return;
    out.innerHTML = "";
    lista.forEach((c) => {
      let status = "—";
      if (c.confirmado === true) status = "Sim ✓";
      else if (c.confirmado === false) status = "Não ✗";

      const guestLink = `../c/?uid=${uid}&id=${c.id}`;

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <div class="name">${c.nome}</div>
          <div class="small">Presença: ${status}</div>
          <div class="small"><a href="${guestLink}" target="_blank">Página do convidado</a></div>
        </div>
        <div class="controls">
          <button class="btn-ghost" onclick="removerConvidado(${c.id})">Remover</button>
        </div>`;
      out.appendChild(div);
    });
  }

  // presentes
  window.addPresente = function () {
    const nome = (document.getElementById("presenteNome") || {}).value || "";
    if (!nome) return alert("Digite um presente");
    const lista = getPresentes();
    const id = Date.now();
    lista.push({ id, nome, reservadoPor: null });
    setPresentes(lista);
    (document.getElementById("presenteNome") || {}).value = "";
    renderPresentes();
  };

  window.removerPresente = function (id) {
    let lista = getPresentes();
    lista = lista.filter((p) => p.id !== id);
    setPresentes(lista);
    renderPresentes();
  };

  function renderPresentes() {
    const lista = getPresentes();
    const out = document.getElementById("listaPresentes");
    if (!out) return;
    out.innerHTML = "";
    lista.forEach((p) => {
      const who = p.reservadoPor
        ? `Reservado por ${
            (getConvidados().find((c) => c.id === p.reservadoPor) || {}).nome ||
            p.reservadoPor
          }`
        : "Disponível";

      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <div>
          <div class="name">${p.nome}</div>
          <div class="small">${who}</div>
        </div>
        <div class="controls">
          <button class="btn-ghost" onclick="removerPresente(${p.id})">Remover</button>
        </div>`;
      out.appendChild(div);
    });
  }

  window.abrirLanding = function () {
    window.open(`../l/?uid=${uid}`, "_blank");
  };
})();
