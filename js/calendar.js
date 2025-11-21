/* calendar.js – corrigido
   Calendário infinito, dia atual, animações laterais reais
   createCalendar({containerId, year, month, unavailableDates, onDayClick })
*/

(function (global) {
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function isoDate(year, monthZeroBased, day) {
    return `${year}-${pad(monthZeroBased + 1)}-${pad(day)}`;
  }

  function monthName(m) {
    const names = [
      "Janeiro", "Fevereiro", "Março", "Abril",
      "Maio", "Junho", "Julho", "Agosto",
      "Setembro", "Outubro", "Novembro", "Dezembro",
    ];
    return names[m];
  }

  function daysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  function firstWeekday(year, month) {
    return new Date(year, month, 1).getDay();
  }

  function createCalendar(opts) {
    const container = document.getElementById(opts.containerId);
    if (!container) throw new Error("containerId inválido");

    let state = {
      year: opts.year ?? new Date().getFullYear(),
      month: opts.month ?? new Date().getMonth()
    };

    function render(direction) {
      const { year, month } = state;

      const wrapper = document.createElement("div");
      wrapper.className = "cal-wrapper cal-active";

      if (direction) {
        wrapper.classList.add(
          direction === "left" ? "slide-left-in" : "slide-right-in"
        );
      }

      // HEADER
      const header = document.createElement("div");
      header.className = "cal-header";
      header.innerHTML = `
        <button class="cal-btn cal-prev">◀</button>
        <div class="cal-title">
            <div class="cal-month">${monthName(month)}</div>
            <div class="cal-year">${year}</div>
        </div>
        <button class="cal-btn cal-next">▶</button>
      `;
      wrapper.appendChild(header);

      // WEEK NAMES
      const week = document.createElement("div");
      week.className = "cal-week";
      ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"].forEach(w => {
        const div = document.createElement("div");
        div.className = "cal-weekday";
        div.textContent = w;
        week.appendChild(div);
      });
      wrapper.appendChild(week);

      // GRID
      const grid = document.createElement("div");
      grid.className = "cal-days";

      const blanks = firstWeekday(year, month);
      const total = daysInMonth(year, month);

      for (let i = 0; i < blanks; i++) {
        const b = document.createElement("div");
        b.className = "cal-day empty";
        grid.appendChild(b);
      }

      const today = new Date();
      const todayY = today.getFullYear();
      const todayM = today.getMonth();
      const todayD = today.getDate();

      const unavailable = opts.unavailableDates ?? [];

      for (let d = 1; d <= total; d++) {
        const cell = document.createElement("div");
        cell.className = "cal-day";
        cell.innerHTML = `<div class="day-number">${d}</div>`;
        const dateIso = isoDate(year, month, d);
        cell.dataset.date = dateIso;

        if (d === todayD && month === todayM && year === todayY) {
          cell.classList.add("cal-today");
        }

        if (unavailable.includes(dateIso)) {
          cell.classList.add("cal-unavailable");
        } else {
          cell.classList.add("cal-available");
          cell.addEventListener("click", () => {
            opts.onDayClick?.(dateIso, cell);
          });
        }

        grid.appendChild(cell);
      }

      wrapper.appendChild(grid);

      // REMOVE ANTERIOR COM ANIMAÇÃO
      const old = container.querySelector(".cal-active:not(.removing)");
      if (old) {
        old.classList.add("removing");

        old.classList.add(
          direction === "left" ? "slide-left-out" : "slide-right-out"
        );

        old.addEventListener("animationend", () => old.remove(), { once: true });
      }

      container.appendChild(wrapper);

      // NAV
      wrapper.querySelector(".cal-prev").addEventListener("click", () => {
        state.month--;
        if (state.month < 0) {
          state.month = 11;
          state.year--;
        }
        render("right");
        opts.onChangeMonth?.(state.year, state.month);
      });

      wrapper.querySelector(".cal-next").addEventListener("click", () => {
        state.month++;
        if (state.month > 11) {
          state.month = 0;
          state.year++;
        }
        render("left");
        opts.onChangeMonth?.(state.year, state.month);
      });

      return wrapper;
    }

    render();

    return {
      getState() { return state; },
      goTo(year, month) {
        state.year = year;
        state.month = month;
        render();
      }
    };
  }

  global.createCalendar = createCalendar;
})(window);
