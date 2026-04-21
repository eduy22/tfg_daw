const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const btn = document.getElementById('btnSubmit');

function showMessage(text, ok = true) {
  msg.style.display = 'block';
  msg.textContent = text;
  msg.style.borderLeft = ok ? '6px solid #16a34a' : '6px solid #dc2626';
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('Introduce email y contraseña.', false);
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Entrando...';
  msg.style.display = 'none';

  try {
    const res = await fetch('/ciudad_deportiva/api/auth_login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      localStorage.setItem('cd_user', JSON.stringify(data.user));
      showMessage('Login correcto. Redirigiendo...', true);

      setTimeout(() => {
        window.location.href = 'facilities.html';
      }, 700);
    } else {
      showMessage(data.error || 'Error en el login.', false);
    }
  } catch (err) {
    showMessage('Error de conexión con el servidor.', false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Iniciar sesión';
  }
});