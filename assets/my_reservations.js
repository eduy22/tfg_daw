/*
  my_reservations.js

  Este archivo gestiona la página de consulta de reservas del usuario.
  Se encarga de:
  - mostrar el nombre del usuario si ha iniciado sesión
  - cargar desde el backend las reservas asociadas al usuario
  - renderizar las reservas en pantalla
  - permitir cancelar reservas activas
*/

// Elementos principales de la interfaz
const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const userCard = document.getElementById('userCard');
const hello = document.getElementById('hello');

/*
  Muestra mensajes de estado al usuario.
  Se utiliza para informar sobre carga, éxito o error.
*/
function setStatus(text, ok = true) {
  statusEl.style.display = 'block';
  statusEl.textContent = text;
  statusEl.style.padding = '0.6rem';
  statusEl.style.marginBottom = '1rem';
  statusEl.style.borderRadius = '6px';
  statusEl.style.background = ok ? '#dcfce7' : '#fee2e2';
  statusEl.style.borderLeft = ok ? '6px solid #16a34a' : '6px solid #dc2626';
}

/*
  Renderiza en pantalla la lista de reservas recibida desde el backend.
  Si la reserva está activa, añade también el botón de cancelación.
*/
function renderReservations(items) {
  listEl.innerHTML = '';

  if (!items.length) {
    listEl.innerHTML = '<p>No tienes reservas registradas.</p>';
    return;
  }

  items.forEach(r => {
    const div = document.createElement('div');
    div.className = 'card ' + (r.estado === 'activa' ? 'reserva-activa' : 'reserva-cancelada');

    // Solo se muestra el botón si la reserva sigue activa
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

  /*
    Añadir evento a cada botón de cancelación.
    Al pulsarlo, se envía una petición al backend para cambiar el estado
    de la reserva a "cancelada".
  */
  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id_reserva = Number(btn.dataset.id);

      // Confirmación antes de cancelar
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

          // Recargar reservas para actualizar el estado en pantalla
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

/*
  Recuperar el usuario guardado en localStorage para mostrar un saludo.
*/
const stored = localStorage.getItem('cd_user');
if (stored) {
  try {
    const user = JSON.parse(stored);
    userCard.style.display = 'block';
    hello.textContent = `Hola, ${user.nombre}`;
  } catch (_) {}
}

/*
  Cargar las reservas del usuario autenticado desde el backend
  y mostrarlas en pantalla.
*/
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

/*
  Ejecutar la carga inicial de reservas al abrir la página
*/
loadReservations();