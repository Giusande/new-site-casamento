lucide.createIcons();

const bottomBtns = document.querySelectorAll(".bottom-nav .nav-btn");
const sections = document.querySelectorAll(".section");
const menuItems = document.querySelectorAll(".menu-item");

bottomBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.section;

    // troca highlight nos botões inferiores
    bottomBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    // troca highlight no menu lateral também
    menuItems.forEach((m) =>
      m.classList.toggle("active", m.dataset.section === target)
    );

    // alterna seções
    sections.forEach((sec) =>
      sec.id === target
        ? sec.classList.remove("hidden")
        : sec.classList.add("hidden")
    );
  });
});

(function () {
  // helpers
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const storage = {
    get(k, fallback) {
      return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback));
    },
    set(k, v) {
      localStorage.setItem(k, JSON.stringify(v));
    },
  };

  // sections toggle
  const menuItems = $$(".menu-item");
  const sections = $$(".section");
  menuItems.forEach((mi) => {
    mi.addEventListener("click", () => {
      menuItems.forEach((x) => x.classList.remove("active"));
      mi.classList.add("active");
      const target = mi.dataset.section;
      sections.forEach((s) => s.classList.toggle("hidden", s.id !== target));
    });
  });

  // stats
  function refreshStats() {
    const reservas = storage.get("reservas", []);
    const indisponiveis = storage.get("indisponiveis", []);
    const planos = storage.get("planos", []);
    $("#stat-total").textContent = reservas.length;
    $("#stat-unavail").textContent = indisponiveis.length;
    $("#stat-plans").textContent = planos.length;
  }

  // calendar
  const calHolder = document.getElementById("calContainer");
  let unavailable = storage.get("indisponiveis", []);
  // init calendar
  const cal = createCalendar({
    containerId: "calContainer",
    unavailableDates: unavailable,
    onDayClick(dateIso, cell) {
      // toggle on click
      if (cell.classList.contains("cal-unavailable")) {
        cell.classList.remove("cal-unavailable");
        // remove from unavailable array
        unavailable = unavailable.filter((d) => d !== dateIso);
      } else {
        cell.classList.add("cal-unavailable");
        unavailable.push(dateIso);
      }
      refreshStats();
    },
    onChangeMonth() {
      /* noop for now */
    },
  });

  // save/clear
  $("#btnSaveUnavailable").addEventListener("click", () => {
    storage.set("indisponiveis", unavailable);
    alert("Indisponibilidades salvas.");
    refreshStats();
  });

  $("#btnClearUnavailable").addEventListener("click", () => {
    if (!confirm("Limpar todas indisponibilidades?")) return;
    unavailable = [];
    storage.set("indisponiveis", unavailable);
    // re-render calendar to update visuals
    cal.instance.render();
    refreshStats();
  });

  // reservations list
  function renderReservations() {
    const list = $("#reservationsList");
    const reservas = storage.get("reservas", []);

    list.innerHTML = "";

    // Nenhuma reserva
    if (reservas.length === 0) {
      list.innerHTML = `
      <div class="reservation-card empty-card fade-in">
        <i class="ri-calendar-close-line"></i>
        <p>Nenhuma reserva encontrada.</p>
      </div>`;
      return;
    }

    reservas.forEach((r) => {
      const el = document.createElement("div");
      el.className = "reservation-card slide-fade-in";

      el.innerHTML = `
      <div class="reservation-info">
        <div class="reservation-date">
          <i class="ri-calendar-event-line"></i>
          <strong>Data do Evento: ${r.date}</strong>
        </div>

        <div class="reservation-user">
          Nome do contratante: ${r.name}
          <div class="muted">Email do contratante: ${r.email}</div>
        </div>

        <div class="reservation-details">
          <p>Plano:<strong> ${r.plan}</strong></p>
          <p>Pagamento: <strong> ${r.payment}</strong></p>
          <p>Status: <span class="status-pill"> ${
            r.status || "Pendente"
          }</span></p>
        </div>
      </div>

      <div class="reservation-actions">
        <button class="btn-delete" data-action="delete">
          <i class="ri-delete-bin-6-line"></i>
          Excluir
        </button>
      </div>
    `;

      // Evento de exclusão
      el.querySelector("[data-action='delete']").addEventListener(
        "click",
        () => {
          if (!confirm("Excluir reserva?")) return;

          const all = storage.get("reservas", []);
          const filtered = all.filter(
            (x) =>
              !(x.date === r.date && x.name === r.name && x.email === r.email)
          );

          storage.set("reservas", filtered);
          renderReservations();
          refreshStats();
        }
      );

      list.appendChild(el);
    });
  }

  // plans
  function renderPlans() {
    const container = $("#plansList");
    const planos = storage.get("planos", []);
    container.innerHTML = "";
    if (planos.length === 0) {
      container.innerHTML = '<div class="muted">Nenhum plano cadastrado.</div>';
      return;
    }
    planos.forEach((p, idx) => {
      const item = document.createElement("div");
      item.className = "plan-item card-anim";
      item.innerHTML = `<div class="plan-meta">
          <h2>${p.name}</h2>
          <div class="muted">R$ ${Number(p.price).toFixed(2)}</div>
          <div class="muted small">${p.desc || ""}</div>
        </div>
        <div class="plan-actions">
          <button class="btn" data-delete="${idx}">Excluir</button>
        </div>`;
      item.querySelector("[data-delete]").addEventListener("click", (ev) => {
        if (!confirm("Remover plano?")) return;
        const arr = storage.get("planos", []);
        arr.splice(idx, 1);
        storage.set("planos", arr);
        renderPlans();
        refreshStats();
      });
      container.appendChild(item);
    });
  }

  // plan form
  $("#planForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#planName").value.trim();
    const price = Number($("#planPrice").value || 0);
    const desc = $("#planDesc").value.trim();
    if (!name || price <= 0) {
      alert("Nome e preço válidos são obrigatórios");
      return;
    }
    const planos = storage.get("planos", []);
    planos.push({ name, price, desc });
    storage.set("planos", planos);
    // reset
    $("#planName").value = "";
    $("#planPrice").value = "";
    $("#planDesc").value = "";
    renderPlans();
    refreshStats();
  });

  $("#btnClearPlans").addEventListener("click", () => {
    if (!confirm("Remover todos os planos?")) return;
    storage.set("planos", []);
    renderPlans();
    refreshStats();
  });

  // export/import
  $("#btnExport").addEventListener("click", () => {
    const data = {
      planos: storage.get("planos", []),
      reservas: storage.get("reservas", []),
      indisponiveis: storage.get("indisponiveis", []),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dados-casa-festas.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  $("#btnImport").addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.addEventListener("change", (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result);
          storage.set("planos", data.planos || []);
          storage.set("reservas", data.reservas || []);
          storage.set("indisponiveis", data.indisponiveis || []);
          // reinit
          unavailable = storage.get("indisponiveis", []);
          cal.instance.render();
          renderPlans();
          renderReservations();
          refreshStats();
          alert("Importação concluída");
        } catch (err) {
          alert("Arquivo inválido");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  });

  // initial render
  renderPlans();
  renderReservations();
  refreshStats();

  // small delay to add animations to cards on load
  setTimeout(() => {
    $$(".card-anim").forEach((c) => (c.style.opacity = ""));
  }, 60);
})();
