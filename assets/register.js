/*
  register.js

  Este archivo gestiona el formulario de registro de usuarios.
  Se encarga de:
  - validar los datos introducidos
  - enviar la información al backend
  - mostrar mensajes de éxito o error
*/

// Elementos del formulario
const form = document.getElementById('registerForm');
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
  Gestionar el envío del formulario de registro
*/
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validación básica en frontend
  if (!nombre || !email || !password) {
    showMessage('Rellena todos los campos.', false);
    return;
  }

  // Bloquear botón mientras se procesa la petición
  btn.disabled = true;
  btn.textContent = 'Registrando...';
  msg.style.display = 'none';

  try {
    /*
      Enviar datos al backend mediante fetch en formato JSON
    */
    const res = await fetch('/ciudad_deportiva/api/auth_register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });

    const data = await res.json();

    // Mostrar resultado del registro
    if (res.ok && data.ok) {
      showMessage('Registro completado. Ya puedes iniciar sesión.', true);
      form.reset();
    } else {
      showMessage(data.error || 'Error en el registro.', false);
    }
  } catch (err) {
    showMessage('Error de conexión con el servidor.', false);
  } finally {
    // Restaurar estado del botón
    btn.disabled = false;
    btn.textContent = 'Registrar';
  }
});