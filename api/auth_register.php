<?php
declare(strict_types=1);

ini_set('display_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . "/db.php";

$body = read_json_body();

$nombre = trim($body['nombre'] ?? '');
$email  = trim($body['email'] ?? '');
$pass   = $body['password'] ?? '';

if ($nombre === '' || $email === '' || $pass === '') {
  json_response([
    'ok' => false,
    'error' => 'Faltan campos obligatorios'
  ], 400);
}

$hash = password_hash($pass, PASSWORD_DEFAULT);

try {
  $pdo = db();
  $stmt = $pdo->prepare(
    "INSERT INTO usuarios (nombre, email, password_hash)
     VALUES (?, ?, ?)"
  );
  $stmt->execute([$nombre, $email, $hash]);

  json_response([
    'ok' => true,
    'msg' => 'Usuario registrado correctamente'
  ]);
} catch (PDOException $e) {
  if ($e->getCode() === '23000') {
    json_response([
      'ok' => false,
      'error' => 'El email ya está registrado'
    ], 409);
  }
  json_response([
    'ok' => false,
    'error' => 'Error en la base de datos'
  ], 500);
}
