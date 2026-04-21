<?php
declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . "/db.php";

session_start();

if (!isset($_SESSION['user_id'])) {
  json_response([
    'ok' => false,
    'error' => 'Debes iniciar sesión para realizar una reserva.'
  ], 401);
}

$body = read_json_body();

$id_instalacion = (int)($body['id_instalacion'] ?? 0);
$fecha = trim((string)($body['fecha'] ?? ''));
$hora_inicio = trim((string)($body['hora_inicio'] ?? ''));

if ($id_instalacion <= 0 || $fecha === '' || $hora_inicio === '') {
  json_response([
    'ok' => false,
    'error' => 'Faltan campos obligatorios.'
  ], 400);
}

try {
  $pdo = db();

  $stmt = $pdo->prepare(
    "INSERT INTO reservas (id_usuario, id_instalacion, fecha, hora_inicio, estado)
     VALUES (?, ?, ?, ?, 'activa')"
  );

  $stmt->execute([
    (int)$_SESSION['user_id'],
    $id_instalacion,
    $fecha,
    $hora_inicio
  ]);

  json_response([
    'ok' => true,
    'msg' => 'Reserva creada correctamente.'
  ]);
} catch (PDOException $e) {
  if ($e->getCode() === '23000') {
    json_response([
      'ok' => false,
      'error' => 'Ese horario ya está reservado para esa instalación.'
    ], 409);
  }

  json_response([
    'ok' => false,
    'error' => 'Error al crear la reserva.'
  ], 500);
}