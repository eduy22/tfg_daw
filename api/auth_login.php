<?php
declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . "/db.php";

session_start();

$body = read_json_body();

$email = trim($body['email'] ?? '');
$pass  = $body['password'] ?? '';

if ($email === '' || $pass === '') {
  json_response([
    'ok' => false,
    'error' => 'Faltan credenciales'
  ], 400);
}

$pdo = db();
$stmt = $pdo->prepare(
  "SELECT id_usuario, nombre, email, password_hash
   FROM usuarios
   WHERE email = ?"
);
$stmt->execute([$email]);

$user = $stmt->fetch();

if (!$user || !password_verify($pass, $user['password_hash'])) {
  json_response([
    'ok' => false,
    'error' => 'Credenciales incorrectas'
  ], 401);
}

$_SESSION['user_id'] = (int)$user['id_usuario'];

json_response([
  'ok' => true,
  'msg' => 'Login correcto',
  'user' => [
    'id' => (int)$user['id_usuario'],
    'nombre' => $user['nombre'],
    'email' => $user['email']
  ]
]);
