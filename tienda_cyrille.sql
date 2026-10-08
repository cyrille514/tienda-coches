-- ============================================================
-- PROYECTO MF0492_3: CREACIÓN Y ESTRUCTURA DE LA BASE DE DATOS
-- Archivo: tienda_cyrille.sql
-- ============================================================


-- CREACIÓN DE TABLAS

-- TABLA CLIENTES

CREATE TABLE clientes (
    pk_cliente UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('empresa', 'autónomo')),
    razon_social TEXT,
    nombre_cliente TEXT NOT NULL,
    apellido1_cliente TEXT NOT NULL,
    apellido2_cliente TEXT,
    telefono_movil TEXT,
    rol TEXT DEFAULT 'cliente' CHECK (rol IN ('cliente', 'administrador')),
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- TABLA CATEGORIAS
CREATE TABLE categorias (
    pk_categoria SERIAL PRIMARY KEY,
    nom_categoria VARCHAR(100) NOT NULL,
    descripcion_categoria TEXT
);



-- TABLA PRODUCTOS
CREATE TABLE productos (
    pk_producto SERIAL PRIMARY KEY,
    fk_categoria INT REFERENCES CATEGORIAS(pk_categoria) ON DELETE CASCADE,
    nombre_producto VARCHAR(150) NOT NULL,
    url_imagen TEXT,
    descripcion_producto TEXT,
    precio NUMERIC(10, 2) NOT NULL,
    iva NUMERIC(5, 2) DEFAULT 21.00,
    descuento NUMERIC(5, 2) DEFAULT 0.00,
    stock INT DEFAULT 10,
    punto_reposicion INT DEFAULT 2,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_baja TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- TABLA FACTURAS
CREATE TABLE facturas (
    pk_factura SERIAL PRIMARY KEY,
    fk_cliente UUID REFERENCES CLIENTES(pk_cliente) ON DELETE CASCADE,
    fecha_compra TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_payment_intent_id TEXT NOT NULL UNIQUE,
    iva NUMERIC(5, 2) DEFAULT 21.00
);


-- TABLA DETALLE_FACTURA
CREATE TABLE detalle_factura (
    fk_factura INT REFERENCES FACTURAS(pk_factura) ON DELETE CASCADE,
    fk_producto INT REFERENCES PRODUCTOS(pk_producto) ON DELETE CASCADE,
    cantidad INT NOT NULL,
    precio_unitario NUMERIC(10, 2) NOT NULL,
    precio_total NUMERIC GENERATED ALWAYS AS (precio_unitario * cantidad) STORED,
    descuento NUMERIC(5, 2) DEFAULT 0.00,
    iva NUMERIC(5, 2) DEFAULT 21.00,
    PRIMARY KEY (fk_factura, fk_producto)
);

-- 1. Insertion des 5 CATEGORIAS

INSERT INTO categorias (pk_categoria, nom_categoria, descripcion_categoria) VALUES 
(1, 'Volvo', 'Gama de vehículos Volvo de última generación'),
(2, 'BMW', 'Gama de vehículos deportivos y de lujo BMW'),
(3, 'Audi', 'Gama de vehículos Audi con tecnología Quattro'),
(4, 'Mercedes', 'Gama de vehículos Mercedes-Benz de alta gama'),
(5, 'Peugeot', 'Gama de vehículos Peugeot eficientes y modernos')
ON CONFLICT (pk_categoria) DO NOTHING;

-- Categoría 1: Volvo

INSERT INTO productos (fk_categoria, nombre_producto, url_imagen, descripcion_producto, precio) VALUES 
(1, 'Volvo EX90', '/vehiculos/Volvo EX90.jpg', 'SUV 100% eléctrico de 7 plazas', 85000.00),
(1, 'Volvo V60', '/vehiculos/Volvo V60 Cross Country.jpg', 'Familiar todo terreno versátil', 52000.00),
(1, 'Volvo XC60', '/vehiculos/Volvo XC60 Mild Hybrid.jpg', 'SUV mediano híbrido', 56000.00),
(1, 'Volvo XC90', '/vehiculos/Volvo XC90 Recharge.avif', 'SUV grande híbrido enchufable', 79000.00),
(1, 'Volvo EX30', '/vehiculos/Volvo EX30.jpg', 'SUV compacto 100% eléctrico', 37500.00);

-- Categoría 2: BMW

INSERT INTO productos (fk_categoria, nombre_producto, url_imagen, descripcion_producto, precio) VALUES 
(2, 'BMW i4 M50', '/vehiculos/bmw-i4.jpeg', 'Gran Coupé eléctrico de alto rendimiento', 76000.00),
(2, 'BMW M2', '/vehiculos/bmw-m2.avif', 'Deportivo compacto de alta potencia', 89000.00),
(2, 'BMW Serie 3', '/vehiculos/bmw-serie3.jpg', 'Berlina deportiva icónica', 45000.00),
(2, 'BMW X5', '/vehiculos/bmw-x5.jpg', 'SUV de lujo versátil', 82000.00),
(2, 'BMW iX', '/vehiculos/bmw-ix.webp', 'SUV 100% eléctrico futurista', 87000.00);


-- Categoría 3: Audi

INSERT INTO productos (fk_categoria, nombre_producto, url_imagen, descripcion_producto, precio) VALUES 
(3, 'Audi RS6 Avant', '/vehiculos/Toyota3.jpg', 'Familiar deportivo de alta potencia', 140000.00),
(3, 'Audi e-tron GT', '/vehiculos/Toyota.webp', 'Gran Turismo 100% eléctrico', 110000.00),
(3, 'Audi Q5', '/vehiculos/Toyota4.jpg', 'SUV mediano premium', 54000.00),
(3, 'Audi A4', '/vehiculos/Toyota1.webp', 'Berlina elegante y eficiente', 42000.00),
(3, 'Audi R8', '/vehiculos/Toyota2.avif', 'Superdeportivo de alto rendimiento', 180000.00);


-- Categoría 4: Mercedes 

INSERT INTO productos (fk_categoria, nombre_producto, url_imagen, descripcion_producto, precio) VALUES 
(4, 'Mercedes Clase C', '/vehiculos/mercedes-clase-c.jpg', 'Berlina de lujo refinada', 48000.00),
(4, 'Mercedes GLE', '/vehiculos/mercedes-gle.avif', 'SUV espacioso y tecnológico', 84000.00),
(4, 'Mercedes EQS', '/vehiculos/mercedes-eqs.jpg', 'Berlina 100% eléctrica de lujo', 120000.00),
(4, 'Mercedes AMG GT', '/vehiculos/mercedes-amg-gt.avif', 'Coupé deportivo de alto rendimiento', 160000.00),
(4, 'Mercedes GLA', '/vehiculos/mercedes-gla.jpg', 'SUV compacto urbano', 41000.00);


- Categoría 5: Peugeot 

INSERT INTO productos (fk_categoria, nombre_producto, url_imagen, descripcion_producto, precio) VALUES 
(5, 'Peugeot 208', '/vehiculos/peugeot-208.jpg', 'Utilitario urbano moderno', 21000.00),
(5, 'Peugeot 308', '/vehiculos/peugeot-308.jpg', 'Compacto dinámico y elegante', 28000.00),
(5, 'Peugeot 3008', '/vehiculos/peugeot-3008.jpg', 'SUV mediano con i-Cockpit', 36000.00),
(5, 'Peugeot 508', '/vehiculos/peugeot-508.jpg', 'Berlina de diseño audaz', 40000.00),
(5, 'Peugeot 5008', '/vehiculos/peugeot-5008.jpg', 'SUV grande de 7 plazas', 39000.00);

INSERT INTO clientes (
  pk_cliente, email, tipo, razon_social, nombre_cliente, 
  apellido1_cliente, apellido2_cliente, telefono_movil, rol
) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'juan.perez@email.com', 'autonomo', 'persona natural', 'Juan', 'Pérez', 'García', '600111222', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'maria.lopez@email.com', 'empresa', 'López Transportes SL', 'María', 'López', 'Sánchez', '600222333', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'carlos.gomez@email.com', 'autonomo', 'persona natural', 'Carlos', 'Gómez', 'Martín', '600333444', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'ana.martinez@email.com', 'empresa', 'AutoAna Renting SL', 'Ana', 'Martínez', 'Ruiz', '600444555', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'luis.fernandez@email.com', 'autonomo', 'persona natural', 'Luis', 'Fernández', 'Moreno', '600555666', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'elena.navarro@email.com', 'autonomo', 'persona natural', 'Elena', 'Navarro', 'Jiménez', '600666777', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'david.diaz@email.com', 'empresa', 'Díaz Logística SA', 'David', 'Díaz', 'Álvarez', '600777888', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'laura.serrano@email.com', 'autonomo', 'persona natural', 'Laura', 'Serrano', 'Romero', '600888999', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'javier.molina@email.com', 'empresa', 'Molina Fleet SL', 'Javier', 'Molina', 'Alonso', '600999000', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'marta.torres@email.com', 'autonomo', 'persona natural', 'Marta', 'Torres', 'Gutiérrez', '601111222', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'sergio.ramirez@email.com', 'autonomo', 'persona natural', 'Sergio', 'Ramírez', 'Navarro', '601222333', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'paula.flores@email.com', 'empresa', 'Flores VTC SL', 'Paula', 'Flores', 'Domínguez', '601333444', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'andres.gil@email.com', 'autonomo', 'persona natural', 'Andrés', 'Gil', 'Vázquez', '601444555', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'lucia.morales@email.com', 'autonomo', 'persona natural', 'Lucía', 'Morales', 'Ramos', '601555666', 'cliente'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'admin.tienda@email.com', 'empresa', 'Tienda Central', 'Admin', 'General', 'Global', '601666777', 'administrador');



INSERT INTO FACTURAS (fk_cliente, stripe_payment_intent_id, iva)
SELECT 
  pk_cliente, 
  'pi_3Mtw_' || replace(gen_random_uuid()::text, '-', ''), 
  21.00
FROM CLIENTES
LIMIT 5;


INSERT INTO DETALLE_FACTURA (fk_factura, fk_producto, cantidad, precio_unitario, descuento)
SELECT 
  f.pk_factura,
  p.pk_producto,
  1 AS cantidad,
  p.precio AS precio_unitario,
  0.00 AS descuento
FROM FACTURAS f
CROSS JOIN LATERAL (
  SELECT pk_producto, precio FROM PRODUCTOS ORDER BY random() LIMIT 2
) p;




