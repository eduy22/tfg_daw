<?php
declare(strict_types=1);

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

require_once __DIR__ . "/db.php";

$pdo = db();
$stmt = $pdo->query(
  "SELECT id_instalacion, nombre, tipo, descripcion
   FROM instalaciones
   WHERE activa = 1
   ORDER BY tipo, nombre"
);

json_response([
  "ok" => true,
  "instalaciones" => $stmt->fetchAll()
]);
