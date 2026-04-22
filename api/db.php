<?php
declare(strict_types=1);

/*
  db.php

  Este archivo contiene funciones auxiliares comunes para todo el backend:
  - Conexión a la base de datos (db)
  - Envío de respuestas en formato JSON (json_response)
  - Lectura de datos JSON enviados desde el frontend (read_json_body)

  Es utilizado por todos los endpoints de la API.
*/

/*
  Función: db()

  Establece la conexión con la base de datos MySQL utilizando PDO.
  Devuelve un objeto PDO que permite ejecutar consultas SQL.

  Configuración importante:
  - ATTR_ERRMODE: lanza excepciones en caso de error (facilita depuración)
  - FETCH_ASSOC: devuelve resultados como arrays asociativos
*/
function db(): PDO {
  $host = "localhost";
  $dbname = "ciudad_deportiva";
  $user = "root";
  $pass = "";

  // DSN (Data Source Name): define cómo conectarse a la base de datos
  $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";

  return new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
}

/*
  Función: json_response()

  Envía una respuesta al cliente en formato JSON.
  Se utiliza en todos los endpoints para devolver datos o errores.

  Parámetros:
  - $data: array con los datos a enviar
  - $status: código HTTP (por defecto 200)

  Ejemplo de uso:
  json_response(['ok' => true]);
*/
function json_response(array $data, int $status = 200): void {
  http_response_code($status);
  header("Content-Type: application/json; charset=utf-8");

  // Convierte el array PHP en JSON
  echo json_encode($data, JSON_UNESCAPED_UNICODE);

  // Finaliza la ejecución del script
  exit;
}

/*
  Función: read_json_body()

  Lee el cuerpo de una petición HTTP (POST) enviada en formato JSON
  y lo convierte en un array PHP.

  Se utiliza para recibir datos desde el frontend (fetch).

  Ejemplo:
  fetch(..., { body: JSON.stringify({ email, password }) })

  Esta función permite acceder a esos datos en PHP.
*/
function read_json_body(): array {
  // Obtener el contenido crudo de la petición
  $raw = file_get_contents("php://input");

  // Convertir JSON a array PHP
  $data = json_decode($raw, true);

  // Si no es un array válido, devolver array vacío
  return is_array($data) ? $data : [];
}
