<?php
declare(strict_types=1);

/*
  auth_login.php

  Este endpoint gestiona el inicio de sesión de los usuarios.
  Recibe email y contraseña en formato JSON, verifica las credenciales
  y crea una sesión PHP si son correctas.
*/

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Importar funciones comunes (conexión a BD, JSON, etc.)
require_once __DIR__ . "/db.php";

/*
  Iniciar sesión PHP.
  Permite guardar información del usuario en el servidor
  (por ejemplo, su ID tras login).
*/
session_start();

/*
  Leer datos enviados desde el frontend
  Ejemplo: { email, password }
*/
$body = read_json_body();

// Obtener y limpiar datos
$email = trim($body['email'] ?? '');
$pass  = $body['password'] ?? '';

/*
  Validar que se han enviado las credenciales
*/
if ($email === '' || $pass === '') {
  json_response([
    'ok' => false,
    'error' => 'Faltan credenciales'
  ], 400);
}

/*
  Buscar el usuario en la base de datos por email
*/
$pdo = db();
$stmt = $pdo->prepare(
  "SELECT id_usuario, nombre, email, password_hash
   FROM usuarios
   WHERE email = ?"
);
$stmt->execute([$email]);

$user = $stmt->fetch();

/*
  Verificar:
  - que el usuario exista
  - que la contraseña coincida (comparando con el hash)
*/
if (!$user || !password_verify($pass, $user['password_hash'])) {
  json_response([
    'ok' => false,
    'error' => 'Credenciales incorrectas'
  ], 401);
}

/*
  Guardar el ID del usuario en la sesión
  Esto permite identificar al usuario en futuras peticiones
*/
$_SESSION['user_id'] = (int)$user['id_usuario'];

/*
  Respuesta en caso de login correcto
  Se devuelve información básica del usuario
*/
json_response([
  'ok' => true,
  'msg' => 'Login correcto',
  'user' => [
    'id' => (int)$user['id_usuario'],
    'nombre' => $user['nombre'],
    'email' => $user['email']
  ]
]);
