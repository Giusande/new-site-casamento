const STORAGE_KEY = "casaraqui_booked_dates_v1";
const STORAGE_CONF = "casaraqui_conf_v1";

let bookedDates = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let conf = JSON.parse(localStorage.getItem(STORAGE_CONF) || "{}");
if (!conf.defaultValue) conf.defaultValue = 6500;

let today = new Date();
let baseDate = new Date(today.getFullYear(), today.getMonth(), 1);

// ELEMENTOS
const calendarsEl = document.getElementById("calendars");
const modalBg = document.getElementById("modal");
const selectedDateEl = document.getElementById("selected-date");
const reserveName = document.getElementById("reserve-name");
const reserveEmail = document.getElementById("reserve-email");
const reservePhone = document.getElementById("reserve-phone");
const reserveNote = document.getElementById("reserve-note");
const reserveValue = document.getElementById("reserve-value");
const payResult = document.getElementById("payment-result");

const closeModalBtn = document.getElementById("close-modal");
const confirmPay = document.getElementById("confirm-pay");
const cancelPay = document.getElementById("cancel-pay");

// FORMATOS
function formatCurrency(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function dateToYMD(d) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function isSameYMD(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// RENDER
function renderTwoMonths(base) {
  calendarsEl.innerHTML = "";
  for (let i = 0; i < 2; i++) {
    calendarsEl.appendChild(
      renderMonthCard(new Date(base.getFullYear(), base.getMonth() + i, 1))
    );
  }
}

function renderMonthCard(monthDate) {
  const card = document.createElement("div");
  card.className = "month-card";

  const header = document.createElement("div");
  header.className = "month-head";

  header.innerHTML = `
    <h3>${monthDate.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })}</h3>
    <div class="nav">
      <button id="prev" class="ghost">‹</button>
      <button id="next" class="ghost">›</button>
    </div>
  `;

  header.querySelector("#prev").onclick = () => {
    baseDate.setMonth(baseDate.getMonth() - 1);
    renderTwoMonths(baseDate);
  };

  header.querySelector("#next").onclick = () => {
    baseDate.setMonth(baseDate.getMonth() + 1);
    renderTwoMonths(baseDate);
  };

  card.append(header);

  const daysGrid = document.createElement("div");
  daysGrid.className = "days";

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstWeekDay = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstWeekDay; i++) {
    const cell = document.createElement("div");
    cell.className = "day empty";
    daysGrid.append(cell);
  }

  for (let d = 1; d <= lastDay; d++) {
    const cell = document.createElement("div");
    const dateObj = new Date(year, month, d);
    const ymd = dateToYMD(dateObj);

    if (bookedDates.includes(ymd)) {
      cell.className = "day booked";
      cell.textContent = d;
    } else {
      cell.className = "day";
      cell.textContent = d;
      cell.onclick = () => openReserveModal(dateObj);
    }

    if (isSameYMD(dateObj, new Date())) {
      cell.classList.add("today");
    }

    daysGrid.append(cell);
  }

  card.append(daysGrid);
  return card;
}

// RESERVAR
let currentDateYMD = null;

function openReserveModal(dateObj) {
  currentDateYMD = dateToYMD(dateObj);
  selectedDateEl.innerText = dateObj.toLocaleDateString("pt-BR");
  reserveValue.innerText = formatCurrency(conf.defaultValue);
  modalBg.style.display = "flex";
}

// FECHAR MODAL
closeModalBtn.onclick = () => {
  modalBg.style.display = "none";
  payResult.innerHTML = "";
};

// CANCELAR
cancelPay.onclick = () => {
  modalBg.style.display = "none";
};

// CONFIRMAR PAGAMENTO
confirmPay.onclick = () => {
  if (!reserveName.value.trim() || !reserveEmail.value.trim()) {
    payResult.innerHTML = `<p style="color:red">Preencha nome e email.</p>`;
    return;
  }

  let reservations = JSON.parse(
    localStorage.getItem("casaraqui_reservas_v1") || "[]"
  );

  reservations.push({
    date: currentDateYMD,
    name: reserveName.value.trim(),
    email: reserveEmail.value.trim(),
    phone: reservePhone.value.trim(),
    note: reserveNote.value.trim(),
    createdAt: new Date().toISOString(),
    value: conf.defaultValue,
  });

  localStorage.setItem("casaraqui_reservas_v1", JSON.stringify(reservations));

  bookedDates.push(currentDateYMD);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookedDates));

  payResult.innerHTML = `<p style="color:green">Reserva confirmada!</p>`;

  setTimeout(() => {
    modalBg.style.display = "none";
    renderTwoMonths(baseDate);
  }, 800);
};

// INIT
renderTwoMonths(baseDate);