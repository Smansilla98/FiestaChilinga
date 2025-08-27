-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  rol VARCHAR(20) DEFAULT 'cliente' CHECK (rol IN ('admin', 'cliente')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de entradas QR
CREATE TABLE entradas_qr (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(100) UNIQUE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'validado', 'denegado')),
  usuario_asociado UUID REFERENCES usuarios(id),
  nombre_asociado VARCHAR(100),
  apellido_asociado VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  validated_at TIMESTAMP
);

-- Insertar usuario admin por defecto
INSERT INTO usuarios (nombre, apellido, rol) VALUES ('richar', 'admin', 'admin');