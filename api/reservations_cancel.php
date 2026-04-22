<?php
declare(strict_types=1);

/*
  reservations_cancel.php

  Este endpoint permite cancelar una reserva existente.
  En lugar de eliminarla de la base de datos, se actualiza su estado a "cancelada",
  permitiendo conservar el histórico de reservas.

  Requiere que el usuario esté autenticado y solo permite cancelar
  reservas que le pertenezcan.
*/

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Importar funciones comunes (BD, JSON, etc.)
require_once __DIR__ . "/db.php";

/*
  Iniciar sesión para identificar al usuario
*/
session_start();

/*
  Comprobar que el usuario está autenticado
*/
if (!isset($_SESSION['user_id'])) {
  json_response([
    'ok' => false,
    'error' => 'Debes iniciar sesión para cancelar una reserva.'
  ], 401);
}

/*
  Leer los datos enviados desde el frontend
  Ejemplo: { id_reserva }
*/
$body = read_json_body();
$id_reserva = (int)($body['id_reserva'] ?? 0);

/*
  Validar que el ID de reserva es correcto
*/
if ($id_reserva <= 0) {
  json_response([
    'ok' => false,
    'error' => 'ID de reserva no válido.'
  ], 400);
}

try {
  // Conexión a la base de datos
  $pdo = db();

  /*
    Comprobar que:
    - la reserva existe
    - pertenece al usuario actual
  */
  $stmt = $pdo->prepare(
    "SELECT id_reserva, estado
     FROM reservas
     WHERE id_reserva = ? AND id_usuario = ?"
  );
  $stmt->execute([$id_reserva, (int)$_SESSION['user_id']]);
  $reserva = $stmt->fetch();

  // Si no existe o no pertenece al usuario
  if (!$reserva) {
    json_response([
      'ok' => false,
      'error' => 'La reserva no existe o no pertenece al usuario.'
    ], 404);
  }

  /*
    Comprobar si ya está cancelada
  */
  if ($reserva['estado'] === 'cancelada') {
    json_response([
      'ok' => false,
      'error' => 'La reserva ya estaba cancelada.'
    ], 409);
  }

  /*
    Actualizar el estado de la reserva a "cancelada"
    (no se elimina para conservar histórico)
  */
  $update = $pdo->prepare(
    "UPDATE reservas
     SET estado = 'cancelada'
     WHERE id_reserva = ? AND id_usuario = ?"
  );
  $update->execute([$id_reserva, (int)$_SESSION['user_id']]);

  /*
    Respuesta en caso de éxito
  */
  json_response([
    'ok' => true,
    'msg' => 'Reserva cancelada correctamente.'
  ]);

} catch (PDOException $e) {

  /*
    Error genérico de base de datos
  */
  json_response([
    'ok' => false,
    'error' => 'Error al cancelar la reserva.'
  ], 500);
}