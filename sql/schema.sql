CREATE DATABASE IF NOT EXISTS ciudad_deportiva
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;
USE ciudad_deportiva;

DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS instalaciones;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('usuario','admin') NOT NULL DEFAULT 'usuario',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE instalaciones (
  id_instalacion INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  tipo ENUM('padel','tenis','natacion') NOT NULL,
  descripcion VARCHAR(255),
  activa TINYINT(1) NOT NULL DEFAULT 1,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservas (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_instalacion INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  estado ENUM('activa','cancelada') NOT NULL DEFAULT 'activa',
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_res_usu FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  CONSTRAINT fk_res_inst FOREIGN KEY (id_instalacion) REFERENCES instalaciones(id_instalacion),
  CONSTRAINT uq_slot UNIQUE (id_instalacion, fecha, hora_inicio)
);

CREATE INDEX idx_res_usuario_fecha ON reservas(id_usuario, fecha);
CREATE INDEX idx_res_fecha_inst ON reservas(fecha, id_instalacion);

INSERT INTO instalaciones (nombre, tipo, descripcion) VALUES
('Pista Pádel 1','padel','Pista exterior'),
('Pista Pádel 2','padel','Pista interior'),
('Pista Tenis 1','tenis','Tierra batida'),
('Piscina 1','natacion','Carril libre');
