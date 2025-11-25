// c.js — convidado por casal (uid) e id do convidado
(function () {
  const storeLocal = {
    get(k, d) {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(d || null));
    },
    set(k, v) {
      localStorage.setItem(k, JSON.stringify(v));
    },
  };

  const params = new URL(location.href).searchParams;
  const uid = params.get("uid");
  const id = Number(params.get("id"));

  if (!uid || !id) {
    document.body.innerHTML = "<h2>Parâmetros ausentes (uid/id)</h2>";
    throw "uid/id missing";
  }

  const keyInfo = `info_${uid}`;
  const keyConvidados = `convidados_${uid}`;
  const keyPresentes = `presentes_${uid}`;

  const info = storeLocal.get(keyInfo, {});
  const convidados = storeLocal.get(keyConvidados, []);
  const presentes = storeLocal.get(keyPresentes, []);

  const convidado = convidados.find((c) => c.id === id);
  if (!convidado) {
    document.body.innerHTML = "<h2>Convidado não encontrado</h2>";
    throw "guest missing";
  }

  // preencher campos (IDs devem existir em convidado.html)
  const elCasal = document.getElementById("casal");
  const elLocalData = document.getElementById("localData");
  const elMensagem = document.getElementById("mensagem");
  const elCountdown = document.getElementById("countdown");
  const elConfirmacao = document.getElementById("confirmacaoTexto");
  const elSelect = document.getElementById("selectPresentes");
  const elPresenteMsg = document.getElementById("presenteMsg");

  if (elCasal) elCasal.textContent = info.casal || "Casamento";
  if (elLocalData)
    elLocalData.textContent = `${info.local || ""} • ${
      info.data ? new Date(info.data).toLocaleString() : ""
    }`;
  if (elMensagem)
    elMensagem.textContent = `${convidado.nome}, ${info.mensagem || ""}`;

  // contagem
  function atualizar() {
    if (!info.data) {
      if (elCountdown) elCountdown.textContent = "Data não definida";
      return;
    }
    const diff = new Date(info.data) - Date.now();
    if (diff <= 0) {
      if (elCountdown) elCountdown.textContent = "O grande dia chegou!";
      return;
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    if (elCountdown) elCountdown.textContent = `${d} dias • ${h}h • ${m}m`;
  }
  setInterval(atualizar, 1000);
  atualizar();

  // limite de confirmação: 30 dias
  function podeConfirmar() {
    if (!info.data) return false;
    const dias = Math.floor(
      (new Date(info.data) - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return dias >= 30;
  }
  const alertaEl = document.getElementById("alertaLimite");
  if (!podeConfirmar()) {
    if (alertaEl)
      alertaEl.textContent =
        "⚠ Prazo para confirmar finalizado (30 dias antes).";
  }

  // atualizar status de confirmação visual
  if (convidado.confirmado !== null && elConfirmacao) {
    elConfirmacao.textContent = convidado.confirmado
      ? "Você já confirmou presença 🎉"
      : "Você informou que não poderá ir ✗";
  }

  window.confirmarPresenca = function (vai) {
    if (!podeConfirmar()) return alert("O prazo para confirmar terminou.");
    const list = storeLocal.get(keyConvidados, []);
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) {
      list[idx].confirmado = !!vai;
      storeLocal.set(keyConvidados, list);
    }
    if (elConfirmacao)
      elConfirmacao.textContent = vai
        ? "Presença confirmada ✓"
        : "Informado que não virá ✗";
  };

  // preencher lista de presentes
  function carregarPresentes() {
    if (!elSelect) return;
    elSelect.innerHTML = "";
    presentes.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      if (p.reservadoPor && p.reservadoPor !== id) {
        opt.text = `❌ ${p.nome} (Indisponível)`;
        opt.disabled = true;
      } else {
        opt.text = `🎁 ${p.nome}`;
      }
      elSelect.appendChild(opt);
    });

    if (convidado.presente && elPresenteMsg)
      elPresenteMsg.textContent = `Você escolheu: ${
        convidado.presenteNome || ""
      }`;
  }
  carregarPresentes();

  window.reservarPresente = function () {
    const sel = document.getElementById("selectPresentes");
    const pid = Number(sel.value);
    if (!pid) return alert("Selecione um presente");
    const list = storeLocal.get(keyPresentes, []);
    const p = list.find((x) => x.id === pid);
    if (!p) return alert("Presente inválido");
    if (p.reservadoPor && p.reservadoPor !== id)
      return alert("Presente já reservado por outra pessoa");
    p.reservadoPor = id; // store id of guest (so painel finds name by guest id)
    storeLocal.set(keyPresentes, list);

    // mark guest selection
    const glist = storeLocal.get(keyConvidados, []);
    const gi = glist.findIndex((x) => x.id === id);
    if (gi >= 0) {
      glist[gi].presente = pid;
      glist[gi].presenteNome = p.nome;
      storeLocal.set(keyConvidados, glist);
    }

    if (elPresenteMsg)
      elPresenteMsg.textContent = `Presente reservado: ${p.nome}`;
    carregarPresentes();
  };

  // generate QR if element exists
  if (document.getElementById("qr")) {
    new QRious({
      element: document.getElementById("qr"),
      size: 200,
      value: location.href,
    });
  }
})();
