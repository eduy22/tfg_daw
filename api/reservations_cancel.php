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
    'error' => 'Debes iniciar sesión para cancelar una reserva.'
  ], 401);
}

$body = read_json_body();
$id_reserva = (int)($body['id_reserva'] ?? 0);

if ($id_reserva <= 0) {
  json_response([
    'ok' => false,
    'error' => 'ID de reserva no válido.'
  ], 400);
}

try {
  $pdo = db();

  // Comprobar que la reserva existe, pertenece al usuario y está activa
  $stmt = $pdo->prepare(
    "SELECT id_reserva, estado
     FROM reservas
     WHERE id_reserva = ? AND id_usuario = ?"
  );
  $stmt->execute([$id_reserva, (int)$_SESSION['user_id']]);
  $reserva = $stmt->fetch();

  if (!$reserva) {
    json_response([
      'ok' => false,
      'error' => 'La reserva no existe o no pertenece al usuario.'
    ], 404);
  }

  if ($reserva['estado'] === 'cancelada') {
    json_response([
      'ok' => false,
      'error' => 'La reserva ya estaba cancelada.'
    ], 409);
  }

  $update = $pdo->prepare(
    "UPDATE reservas
     SET estado = 'cancelada'
     WHERE id_reserva = ? AND id_usuario = ?"
  );
  $update->execute([$id_reserva, (int)$_SESSION['user_id']]);

  json_response([
    'ok' => true,
    'msg' => 'Reserva cancelada correctamente.'
  ]);
} catch (PDOException $e) {
  json_response([
    'ok' => false,
    'error' => 'Error al cancelar la reserva.'
  ], 500);
}