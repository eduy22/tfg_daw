/*
  login.js

  Este archivo gestiona el formulario de inicio de sesión.
  Se encarga de:
  - validar los datos introducidos por el usuario
  - enviar las credenciales al backend
  - guardar información del usuario en localStorage
  - redirigir al usuario tras un login correcto
*/

// Elementos del formulario
const form = document.getElementById('loginForm');
const msg = document.getElementById('msg');
const btn = document.getElementById('btnSubmit');

/*
  Muestra mensajes al usuario (éxito o error)
*/
function showMessage(text, ok = true) {
  msg.style.display = 'block';
  msg.textContent = text;
  msg.style.borderLeft = ok ? '6px solid #16a34a' : '6px solid #dc2626';
}

/*
  Gestionar el envío del formulario de login
*/
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validación básica en frontend
  if (!email || !password) {
    showMessage('Introduce email y contraseña.', false);
    return;
  }

  // Bloquear botón mientras se procesa la petición
  btn.disabled = true;
  btn.textContent = 'Entrando...';
  msg.style.display = 'none';

  try {
    /*
      Enviar credenciales al backend mediante fetch
      credentials: 'include' permite mantener la sesión PHP
    */
    const res = await fetch('/ciudad_deportiva/api/auth_login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });

    const data = await res.json();

    if (res.ok && data.ok) {

      /*
        Guardar datos básicos del usuario en localStorage
        para usarlos en la interfaz (por ejemplo, saludo)
      */
      localStorage.setItem('cd_user', JSON.stringify(data.user));

      showMessage('Login correcto. Redirigiendo...', true);

      // Redirigir a la página de instalaciones tras login
      setTimeout(() => {
        window.location.href = 'facilities.html';
      }, 700);

    } else {
      showMessage(data.error || 'Error en el login.', false);
    }
  } catch (err) {
    showMessage('Error de conexión con el servidor.', false);
  } finally {
    // Restaurar estado del botón
    btn.disabled = false;
    btn.textContent = 'Iniciar sesión';
  }
});