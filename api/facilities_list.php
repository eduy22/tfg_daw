<?php
declare(strict_types=1);

/*
  facilities_list.php

  Este endpoint devuelve el listado de instalaciones deportivas disponibles.
  Se utiliza en el frontend para mostrar las instalaciones que el usuario puede reservar.

  No requiere autenticación.
*/

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

// Importar funciones comunes (BD, JSON, etc.)
require_once __DIR__ . "/db.php";

/*
  Conexión a la base de datos
*/
$pdo = db();

/*
  Consulta SQL:
  - Selecciona las instalaciones activas (activa = 1)
  - Devuelve información básica (id, nombre, tipo, descripción)
  - Ordena por tipo y nombre para mejorar la presentación
*/
$stmt = $pdo->query(
  "SELECT id_instalacion, nombre, tipo, descripcion
   FROM instalaciones
   WHERE activa = 1
   ORDER BY tipo, nombre"
);

/*
  Respuesta en formato JSON con el listado de instalaciones
*/
json_response([
  "ok" => true,
  "instalaciones" => $stmt->fetchAll()
]);
