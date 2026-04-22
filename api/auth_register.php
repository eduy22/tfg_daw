<?php
declare(strict_types=1);

/*
  auth_register.php

  Este endpoint se encarga de registrar nuevos usuarios en el sistema.
  Recibe los datos en formato JSON desde el frontend (nombre, email y contraseña),
  valida la información y guarda el usuario en la base de datos.
*/

ini_set('display_errors', '1');
error_reporting(E_ALL);

// Importar funciones comunes (conexión a BD, JSON, etc.)
require_once __DIR__ . "/db.php";

/*
  Leer los datos enviados desde el frontend mediante fetch()
  Ejemplo: { nombre, email, password }
*/
$body = read_json_body();

// Obtener y limpiar los datos
$nombre = trim($body['nombre'] ?? '');
$email  = trim($body['email'] ?? '');
$pass   = $body['password'] ?? '';

/*
  Validar que todos los campos obligatorios están presentes
*/
if ($nombre === '' || $email === '' || $pass === '') {
  json_response([
    'ok' => false,
    'error' => 'Faltan campos obligatorios'
  ], 400);
}

/*
  Encriptar la contraseña antes de guardarla en la base de datos.
  Nunca se guarda la contraseña en texto plano.
*/
$hash = password_hash($pass, PASSWORD_DEFAULT);

try {
  // Conexión a la base de datos
  $pdo = db();

  /*
    Insertar el nuevo usuario en la tabla usuarios
  */
  $stmt = $pdo->prepare(
    "INSERT INTO usuarios (nombre, email, password_hash)
     VALUES (?, ?, ?)"
  );

  $stmt->execute([$nombre, $email, $hash]);

  /*
    Respuesta en caso de éxito
  */
  json_response([
    'ok' => true,
    'msg' => 'Usuario registrado correctamente'
  ]);

} catch (PDOException $e) {

  /*
    Código 23000 → error de integridad (por ejemplo, email duplicado)
  */
  if ($e->getCode() === '23000') {
    json_response([
      'ok' => false,
      'error' => 'El email ya está registrado'
    ], 409);
  }

  /*
    Error genérico de base de datos
  */
  json_response([
    'ok' => false,
    'error' => 'Error en la base de datos'
  ], 500);
}
