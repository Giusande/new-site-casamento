(function(){
      const storage = {
        get(k, fallback){ return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); },
        set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
      };

      // load plans into select
      function loadPlans(){
        const planos = storage.get('planos', []);
        const sel = document.getElementById('resPlan');
        sel.innerHTML = '<option value="">Selecione um plano</option>';
        planos.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.name;
          opt.textContent = `${p.name} — R$ ${Number(p.price).toFixed(2)}`;
          sel.appendChild(opt);
        });
      }
      loadPlans();

      // calendar
      let unavailable = storage.get('indisponiveis', []);
      const calendar = createCalendar({
        containerId: 'calContainer',
        unavailableDates: unavailable,
        onDayClick(dateIso, cell){
          // When client clicks day, set into form if available and not reserved
          const reservas = storage.get('reservas', []);
          if(reservas.some(r => r.date === dateIso)){
            alert('Dia já reservado.');
            return;
          }
          // set selected visual
          document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('cal-selected'));
          cell.classList.add('cal-selected');
          document.getElementById('resDate').value = dateIso;
        }
      });

      // handle form submit
      document.getElementById('resForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('resDate').value;
        const name = document.getElementById('resName').value.trim();
        const email = document.getElementById('resEmail').value.trim();
        const plan = document.getElementById('resPlan').value;
        const payment = document.getElementById('resPayment').value;

        if(!date || !name || !email || !plan || !payment){ alert('Preencha todos os campos'); return; }

        // block duplicates
        const reservas = storage.get('reservas', []);
        if(reservas.some(r => r.date === date)){
          alert('Esta data já foi reservada por outro cliente.');
          return;
        }

        // simulate payment
        let status = '';
        if(payment === 'Pix' || payment === 'Cartão'){ status = 'Pagamento aprovado'; }
        else if(payment === 'Boleto'){ status = 'Aguardando pagamento (boleto)'; }
        else status = 'Pendente';

        const reserva = { date, name, email, plan, payment, status, createdAt: new Date().toISOString() };
        reservas.push(reserva);
        storage.set('reservas', reservas);

        // marca indisponível imediatamente (para clientes futuros)
        let indisponiveis = storage.get('indisponiveis', []);
        if(!indisponiveis.includes(date)){
          indisponiveis.push(date);
          storage.set('indisponiveis', indisponiveis);
        }

        alert('Reserva confirmada!\n' + status);
        // refresh calendar + plans
        loadPlans();
        // re-render calendar
        calendar.instance.render();
        // reset form
        document.getElementById('resForm').reset();
        document.getElementById('resDate').value = '';
        document.getElementById('payInfo').textContent = '';
      });

      // show info when payment changes
      document.getElementById('resPayment').addEventListener('change', (e) => {
        const v = e.target.value;
        const info = document.getElementById('payInfo');
        if(v === 'Pix') info.textContent = 'Pix: pagamento instantâneo. Seu evento será confirmado.';
        else if(v === 'Boleto') info.textContent = 'Boleto: geramos o boleto; reserva aguardará confirmação.';
        else if(v === 'Cartão') info.textContent = 'Cartão: pagamento simulado como aprovado.';
        else info.textContent = '';
      });

      // clear form
      document.getElementById('btnClearForm').addEventListener('click', () => {
        document.getElementById('resForm').reset();
        document.getElementById('resDate').value = '';
        document.getElementById('payInfo').textContent = '';
        document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('cal-selected'));
      });

    })();