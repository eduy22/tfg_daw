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
    'error' => 'Debes iniciar sesión para consultar tus reservas.'
  ], 401);
}

try {
  $pdo = db();

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

  $stmt->execute([(int)$_SESSION['user_id']]);

  $reservas = $stmt->fetchAll();

  json_response([
    'ok' => true,
    'reservas' => $reservas
  ]);
} catch (PDOException $e) {
  json_response([
    'ok' => false,
    'error' => 'Error al obtener las reservas.'
  ], 500);
}