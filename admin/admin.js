// ====== LOAD ICONS ======
lucide.createIcons();

// ====== LOGOUT ======
function logoutAdmin() {
  localStorage.removeItem("admin_auth");
  window.location.href = "../login-admin/";
}

// ====== PROTEGER ROTA ======
if (!localStorage.getItem("admin_auth")) {
  window.location.href = "../login-admin/";
}

// ====== STORAGE KEYS ======
const STORAGE_KEY = "casaraqui_booked_dates_v1";
const STORAGE_CONF = "casaraqui_conf_v1";

// ====== ELEMENTOS ======
const adminList = document.getElementById("admin-list");
const adminValueInput = document.getElementById("admin-value");
const addManualBtn = document.getElementById("add-manual");
const manualDateInput = document.getElementById("manual-date");
const saveAdminBtn = document.getElementById("save-admin");
const clearBookedBtn = document.getElementById("clear-booked");

// ====== LOAD INICIAL ======
let bookedDates = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let conf = JSON.parse(localStorage.getItem(STORAGE_CONF) || "{}");
if (!conf.defaultValue) conf.defaultValue = 6500;

adminValueInput.value = conf.defaultValue;

// ====== LISTAR DATAS ======
function refreshAdminList() {
  adminList.innerHTML = "";
  bookedDates.sort();

  if (bookedDates.length === 0) {
    adminList.innerHTML = `<p>Nenhuma data ocupada.</p>`;
    return;
  }

  bookedDates.forEach((d) => {
    const item = document.createElement("div");
    item.className = "admin-day";
    item.innerHTML = `
      <span>${d}</span>
      <button class="ghost">Remover</button>
    `;

    item.querySelector("button").onclick = () => {
      if (confirm(`Remover ${d}?`)) {
        bookedDates = bookedDates.filter((x) => x !== d);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookedDates));
        refreshAdminList();
      }
    };

    adminList.appendChild(item);
  });
}

// ====== ADICIONAR MANUAL ======
addManualBtn.onclick = () => {
  const d = manualDateInput.value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return alert("Formato inválido.");

  if (!bookedDates.includes(d)) {
    bookedDates.push(d);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookedDates));
    manualDateInput.value = "";
    refreshAdminList();
  } else {
    alert("Essa data já está ocupada.");
  }
};

// ====== SALVAR CONFIG ======
saveAdminBtn.onclick = () => {
  conf.defaultValue = parseInt(adminValueInput.value) || conf.defaultValue;
  localStorage.setItem(STORAGE_CONF, JSON.stringify(conf));
  alert("Valor salvo!");
};

// ====== LIMPAR TUDO ======
clearBookedBtn.onclick = () => {
  if (!confirm("Deseja limpar todas as reservas?")) return;
  bookedDates = [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  refreshAdminList();
};

// ====== START ======
refreshAdminList();
