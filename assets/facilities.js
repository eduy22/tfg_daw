/*
  facilities.js

  Este archivo gestiona la página de instalaciones.
  Se encarga de:
  - cargar las instalaciones desde el backend
  - mostrarlas en pantalla
  - aplicar filtros por tipo
  - mostrar información del usuario
  - gestionar el logout
*/

// Elementos principales de la interfaz
const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const filterEl = document.getElementById('filter');

const userCard = document.getElementById('userCard');
const hello = document.getElementById('hello');
const logoutBtn = document.getElementById('logoutBtn');

/*
  Muestra mensajes de estado al usuario
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
  Renderiza las instalaciones en pantalla
*/
function renderFacilities(items) {
  listEl.innerHTML = '';

  if (!items.length) {
    listEl.innerHTML = '<p>No hay instalaciones disponibles.</p>';
    return;
  }

  items.forEach(i => {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <h3>${i.nombre}</h3>
      <p>
        <strong>Tipo:</strong>
        <span class="badge badge-info">${i.tipo}</span>
      </p>
      <p><strong>Descripción:</strong> ${i.descripcion ?? ''}</p>
      <br>
      <a class="action-link" href="reservations.html?id_instalacion=${i.id_instalacion}">
        Reservar
      </a>
    `;
    listEl.appendChild(div);
  });
}

/*
  Aplica el filtro seleccionado (pádel, tenis, natación o todos)
*/
function applyFilter(allItems) {
  const f = filterEl.value;
  if (f === 'all') return allItems;
  return allItems.filter(x => x.tipo === f);
}

/*
  Recuperar datos del usuario desde localStorage para mostrar saludo
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
  Gestionar logout:
  elimina los datos del usuario y redirige al inicio
*/
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('cd_user');
  window.location.href = 'index.html';
});

/*
  Cache local de instalaciones para poder aplicar filtros sin
  volver a consultar al servidor
*/
let facilitiesCache = [];

/*
  Cargar instalaciones desde el backend
*/
async function loadFacilities() {
  setStatus('Cargando instalaciones...', true);

  try {
    const res = await fetch('/ciudad_deportiva/api/facilities_list.php', {
      method: 'GET'
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      facilitiesCache = data.instalaciones || [];

      setStatus('Instalaciones cargadas correctamente.', true);

      // Mostrar instalaciones aplicando el filtro actual
      renderFacilities(applyFilter(facilitiesCache));
    } else {
      setStatus(data.error || 'Error cargando instalaciones.', false);
    }
  } catch (err) {
    setStatus('Error de conexión con el servidor.', false);
  }
}

/*
  Reaplicar filtro cuando el usuario cambia la selección
*/
filterEl.addEventListener('change', () => {
  renderFacilities(applyFilter(facilitiesCache));
});

/*
  Ejecutar carga inicial de instalaciones
*/
loadFacilities();