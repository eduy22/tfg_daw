<?php
declare(strict_types=1);

/*
  reservations_my.php

  Este endpoint devuelve todas las reservas asociadas al usuario autenticado.
  Se utiliza para mostrar en el frontend el listado de reservas del usuario.

  Requiere sesión activa.
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
    'error' => 'Debes iniciar sesión para consultar tus reservas.'
  ], 401);
}

try {
  // Conexión a la base de datos
  $pdo = db();

  /*
    Consulta SQL:
    - Obtiene las reservas del usuario actual
    - Une (JOIN) con la tabla instalaciones para obtener nombre y tipo
    - Ordena por fecha y hora
  */
  $stmt = $pdo->prepare(
    "SELECT 
        r.id_reserva,
        r.fecha,
        r.hora_inicio,
        r.estado,
        i.nombre AS instalacion,
        i.tipo
     FROM reservas r
     INNER JOIN instalaciones i ON r.id_instalacion = i.id_instalacion
     WHERE r.id_usuario = ?
     ORDER BY r.fecha ASC, r.hora_inicio ASC"
  );

  // Ejecutar consulta con el ID del usuario de la sesión
  $stmt->execute([(int)$_SESSION['user_id']]);

  // Obtener todas las reservas como array asociativo
  $reservas = $stmt->fetchAll();

  /*
    Respuesta correcta con el listado de reservas
  */
  json_response([
    'ok' => true,
    'reservas' => $reservas
  ]);

} catch (PDOException $e) {

  /*
    Error genérico de base de datos
  */
  json_response([
    'ok' => false,
    'error' => 'Error al obtener las reservas.'
  ], 500);
}