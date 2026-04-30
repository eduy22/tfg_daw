/*
  reservations.js

  Este archivo gestiona la página de creación de reservas.
  Se encarga de:
  - mostrar el nombre del usuario si ha iniciado sesión
  - cargar las instalaciones disponibles desde el backend
  - validar el formulario
  - enviar la reserva al servidor
  - mostrar mensajes de estado al usuario
*/

// Elementos de la interfaz relacionados con el usuario
const userCard = document.getElementById('userCard');
const hello = document.getElementById('hello');

// Elementos del formulario de reserva
const form = document.getElementById('reservationForm');
const selectInst = document.getElementById('id_instalacion');
const fechaInput = document.getElementById('fecha');
const horaInput = document.getElementById('hora_inicio');
const btn = document.getElementById('btnSubmit');
const statusEl = document.getElementById('status');

/*
  Muestra mensajes de estado al usuario.
  Se utiliza para informar de errores, carga o éxito en la reserva.
*/
function setStatus(text, ok = true) {
  statusEl.style.display = 'block';
  statusEl.textContent = text;
  statusEl.style.padding = '0.6rem';
  statusEl.style.marginTop = '1rem';
  statusEl.style.borderRadius = '6px';
  statusEl.style.background = ok ? '#dcfce7' : '#fee2e2';
  statusEl.style.borderLeft = ok ? '6px solid #16a34a' : '6px solid #dc2626';
}

/*
  Recuperar datos básicos del usuario guardados en localStorage
  para mostrar un saludo en la interfaz.
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
  Limitar la fecha mínima del formulario al día actual,
  para evitar reservas en fechas pasadas.
*/
const today = new Date().toISOString().split('T')[0];
fechaInput.min = today;

/*
  Cargar las instalaciones disponibles desde el backend
  y rellenar el desplegable del formulario.
*/
async function loadFacilities() {
  try {
    const res = await fetch('/ciudad_deportiva/api/facilities_list.php');
    const data = await res.json();

    if (res.ok && data.ok) {
      selectInst.innerHTML = '<option value="">Selecciona una instalación</option>';

      data.instalaciones.forEach(inst => {
        const option = document.createElement('option');
        option.value = inst.id_instalacion;
        option.textContent = `${inst.nombre} (${inst.tipo})`;
        selectInst.appendChild(option);
      });

    // Leer parámetro de la URL (id_instalacion)
    const params = new URLSearchParams(window.location.search);
    const selectedId = params.get('id_instalacion');

    // Si existe, seleccionar esa instalación en el desplegable
    if (selectedId) {
    selectInst.value = selectedId;
    }
    } else {
      selectInst.innerHTML = '<option value="">Error al cargar instalaciones</option>';
    }
  } catch (err) {
    selectInst.innerHTML = '<option value="">Error de conexión</option>';
  }
}

/*
  Gestionar el envío del formulario de reserva.
  Envía los datos al endpoint reservations_create.php en formato JSON.
*/
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id_instalacion = Number(selectInst.value);
  const fecha = fechaInput.value;
  const hora_inicio = horaInput.value;

  // Validación básica en frontend
  if (!id_instalacion || !fecha || !hora_inicio) {
    setStatus('Debes completar todos los campos.', false);
    return;
  }

  // Bloquear botón mientras se procesa la petición
  btn.disabled = true;
  btn.textContent = 'Reservando...';
  statusEl.style.display = 'none';

  try {
    const res = await fetch('/ciudad_deportiva/api/reservations_create.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id_instalacion, fecha, hora_inicio })
    });

    const data = await res.json();

    // Mostrar resultado de la operación
    if (res.ok && data.ok) {
      setStatus('Reserva creada correctamente.', true);
      form.reset();
    } else {
      setStatus(data.error || 'Error al crear la reserva.', false);
    }
  } catch (err) {
    setStatus('Error de conexión con el servidor.', false);
  } finally {
    // Restaurar botón al terminar
    btn.disabled = false;
    btn.textContent = 'Reservar';
  }
});

/*
  Ejecutar la carga inicial de instalaciones al abrir la página
*/
loadFacilities();