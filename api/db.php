<?php
declare(strict_types=1);

function db(): PDO {
  $host = "localhost";
  $dbname = "ciudad_deportiva";
  $user = "root";
  $pass = "";

  $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
  return new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]);
}

function json_response(array $data, int $status = 200): void {
  http_response_code($status);
  header("Content-Type: application/json; charset=utf-8");
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function read_json_body(): array {
  $raw = file_get_contents("php://input");
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
