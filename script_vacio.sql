-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_reservas
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gestion_reservas;

-- ========================
-- Tabla: Concesionarios
-- ========================
CREATE TABLE concesionarios (
    id_concesionario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    telefono_contacto VARCHAR(20)
);

-- ========================
-- Tabla: Usuarios
-- ========================
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL, -- encriptada (hash)
    rol ENUM('empleado', 'admin') NOT NULL DEFAULT 'empleado',
    telefono VARCHAR(20),
    id_concesionario INT,
    preferencias_accesibilidad JSON,
    CONSTRAINT fk_usuario_concesionario FOREIGN KEY (id_concesionario)
        REFERENCES concesionarios(id_concesionario)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT chk_correo_corporativo CHECK (correo REGEXP '^[A-Za-z0-9._%+-]+@empresa\\.com$')
);

-- ========================
-- Tabla: Vehículos
-- ========================
CREATE TABLE vehiculos (
    id_vehiculo INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(15) NOT NULL UNIQUE,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    año_matriculación YEAR NOT NULL,
    numero_plazas TINYINT UNSIGNED NOT NULL,
    autonomia_km INT UNSIGNED NOT NULL,
    color VARCHAR(30),
    imagen VARCHAR(255),
    estado ENUM('disponible', 'reservado', 'mantenimiento') NOT NULL DEFAULT 'disponible',
    id_concesionario INT NOT NULL,
    CONSTRAINT fk_vehiculo_concesionario FOREIGN KEY (id_concesionario)
        REFERENCES concesionarios(id_concesionario)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ========================
-- Tabla: Reservas
-- ========================
CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_vehiculo INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado ENUM('activa', 'finalizada', 'cancelada') NOT NULL DEFAULT 'activa',
    kilometros_recorridos INT UNSIGNED,
    incidencias_reportadas TEXT,
    CONSTRAINT fk_reserva_usuario FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT fk_reserva_vehiculo FOREIGN KEY (id_vehiculo)
        REFERENCES vehiculos(id_vehiculo)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT chk_fechas CHECK (fecha_fin >= fecha_inicio)
);
