const listEl = document.getElementById('list');
const statusEl = document.getElementById('status');
const filterEl = document.getElementById('filter');

const userCard = document.getElementById('userCard');
const hello = document.getElementById('hello');
const logoutBtn = document.getElementById('logoutBtn');

function setStatus(text, ok = true) {
  statusEl.style.display = 'block';
  statusEl.textContent = text;
  statusEl.style.padding = '0.6rem';
  statusEl.style.marginBottom = '1rem';
  statusEl.style.borderRadius = '6px';
  statusEl.style.background = ok ? '#dcfce7' : '#fee2e2';
  statusEl.style.borderLeft = ok ? '6px solid #16a34a' : '6px solid #dc2626';
}

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
      <p><strong>Tipo:</strong> ${i.tipo}</p>
      <p><strong>Descripción:</strong> ${i.descripcion ?? ''}</p>
    `;
    listEl.appendChild(div);
  });
}

function applyFilter(allItems) {
  const f = filterEl.value;
  if (f === 'all') return allItems;
  return allItems.filter(x => x.tipo === f);
}

const stored = localStorage.getItem('cd_user');
if (stored) {
  try {
    const user = JSON.parse(stored);
    userCard.style.display = 'block';
    hello.textContent = `Hola, ${user.nombre}`;
  } catch (_) {}
}

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('cd_user');
  window.location.href = 'index.html';
});

let facilitiesCache = [];

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
      renderFacilities(applyFilter(facilitiesCache));
    } else {
      setStatus(data.error || 'Error cargando instalaciones.', false);
    }
  } catch (err) {
    setStatus('Error de conexión con el servidor.', false);
  }
}

filterEl.addEventListener('change', () => {
  renderFacilities(applyFilter(facilitiesCache));
});

loadFacilities();