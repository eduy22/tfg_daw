<?php
declare(strict_types=1);

/*
  reservations_create.php

  Este endpoint permite a un usuario autenticado crear una reserva
  de una instalación deportiva en una fecha y hora determinadas.

  Requiere sesión activa y recibe los datos en formato JSON.
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
  (es decir, que ha iniciado sesión previamente)
*/
if (!isset($_SESSION['user_id'])) {
  json_response([
    'ok' => false,
    'error' => 'Debes iniciar sesión para realizar una reserva.'
  ], 401);
}

/*
  Leer los datos enviados desde el frontend
  Ejemplo: { id_instalacion, fecha, hora_inicio }
*/
$body = read_json_body();

// Obtener y validar datos
$id_instalacion = (int)($body['id_instalacion'] ?? 0);
$fecha = trim((string)($body['fecha'] ?? ''));
$hora_inicio = trim((string)($body['hora_inicio'] ?? ''));

/*
  Validar que todos los campos obligatorios están presentes
*/
if ($id_instalacion <= 0 || $fecha === '' || $hora_inicio === '') {
  json_response([
    'ok' => false,
    'error' => 'Faltan campos obligatorios.'
  ], 400);
}

/*
  Validar el horario elegido por el usuario
*/
$horariosPermitidos = [
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

if (!in_array($hora_inicio, $horariosPermitidos, true)) {
  json_response([
    'ok' => false,
    'error' => 'Horario no válido. Selecciona una hora disponible.'
  ], 400);
}

try {
  // Conexión a la base de datos
  $pdo = db();

  /*
    Insertar la reserva en la base de datos.

    - Se asocia al usuario actual (session)
    - Se guarda con estado 'activa'
  */
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

  /*
    Respuesta en caso de éxito
  */
  json_response([
    'ok' => true,
    'msg' => 'Reserva creada correctamente.'
  ]);

} catch (PDOException $e) {

  /*
    Código 23000 → violación de restricción única.
    En este caso, indica que ya existe una reserva para
    la misma instalación, fecha y hora.
  */
  if ($e->getCode() === '23000') {
    json_response([
      'ok' => false,
      'error' => 'Ese horario ya está reservado para esa instalación.'
    ], 409);
  }

  /*
    Error genérico de base de datos
  */
  json_response([
    'ok' => false,
    'error' => 'Error al crear la reserva.'
  ], 500);
}