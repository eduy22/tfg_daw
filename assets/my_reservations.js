const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const userCard = document.getElementById('userCard');
const hello = document.getElementById('hello');

function setStatus(text, ok = true) {
  statusEl.style.display = 'block';
  statusEl.textContent = text;
  statusEl.style.padding = '0.6rem';
  statusEl.style.marginBottom = '1rem';
  statusEl.style.borderRadius = '6px';
  statusEl.style.background = ok ? '#dcfce7' : '#fee2e2';
  statusEl.style.borderLeft = ok ? '6px solid #16a34a' : '6px solid #dc2626';
}

function renderReservations(items) {
  listEl.innerHTML = '';

  if (!items.length) {
    listEl.innerHTML = '<p>No tienes reservas registradas.</p>';
    return;
  }

  items.forEach(r => {
    const div = document.createElement('div');
    div.className = 'card';

    let cancelButton = '';
    if (r.estado === 'activa') {
      cancelButton = `<button class="cancel-btn" data-id="${r.id_reserva}">Cancelar reserva</button>`;
    }

    div.innerHTML = `
      <h3>${r.instalacion}</h3>
      <p><strong>Tipo:</strong> ${r.tipo}</p>
      <p><strong>Fecha:</strong> ${r.fecha}</p>
      <p><strong>Hora:</strong> ${r.hora_inicio}</p>
      <p><strong>Estado:</strong> ${r.estado}</p>
      ${cancelButton}
    `;

    listEl.appendChild(div);
  });

  // Añadir eventos a botones de cancelación
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id_reserva = Number(btn.dataset.id);

      if (!confirm('¿Seguro que quieres cancelar esta reserva?')) {
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Cancelando...';

      try {
        const res = await fetch('/ciudad_deportiva/api/reservations_cancel.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id_reserva })
        });

        const data = await res.json();

        if (res.ok && data.ok) {
          setStatus('Reserva cancelada correctamente.', true);
          loadReservations();
        } else {
          setStatus(data.error || 'Error al cancelar la reserva.', false);
          btn.disabled = false;
          btn.textContent = 'Cancelar reserva';
        }
      } catch (err) {
        setStatus('Error de conexión con el servidor.', false);
        btn.disabled = false;
        btn.textContent = 'Cancelar reserva';
      }
    });
  });
}

const stored = localStorage.getItem('cd_user');
if (stored) {
  try {
    const user = JSON.parse(stored);
    userCard.style.display = 'block';
    hello.textContent = `Hola, ${user.nombre}`;
  } catch (_) {}
}

async function loadReservations() {
  setStatus('Cargando reservas...', true);

  try {
    const res = await fetch('/ciudad_deportiva/api/reservations_my.php', {
      method: 'GET',
      credentials: 'include'
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      setStatus('Reservas cargadas correctamente.', true);
      renderReservations(data.reservas || []);
    } else {
      setStatus(data.error || 'Error al cargar las reservas.', false);
      listEl.innerHTML = '';
    }
  } catch (err) {
    setStatus('Error de conexión con el servidor.', false);
    listEl.innerHTML = '';
  }
}

loadReservations();