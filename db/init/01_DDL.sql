-- ============================================================
--  PROYECTO 2 - Bases de Datos 1
--  DDL Completo: PRIMARY KEY, FOREIGN KEY, NOT NULL
-- ============================================================

-- Crear y usar la base de datos
CREATE DATABASE IF NOT EXISTS tienda_db;
USE tienda_db;

-- ------------------------------------------------------------
-- Tabla: Rol
-- ------------------------------------------------------------
CREATE TABLE Rol (
    id_Rol      INT          NOT NULL AUTO_INCREMENT,
    nombre_Rol  VARCHAR(50)  NOT NULL,
    CONSTRAINT pk_Rol PRIMARY KEY (id_Rol)
);

-- ------------------------------------------------------------
-- Tabla: Usuario
-- ------------------------------------------------------------
CREATE TABLE Usuario (
    id_Usuario      INT          NOT NULL AUTO_INCREMENT,
    nombre_Usuario  VARCHAR(100) NOT NULL,
    password        VARCHAR(255) NOT NULL,
    id_Rol          INT          NOT NULL,
    CONSTRAINT pk_Usuario PRIMARY KEY (id_Usuario),
    CONSTRAINT fk_Usuario_Rol FOREIGN KEY (id_Rol) REFERENCES Rol(id_Rol)
);

-- ------------------------------------------------------------
-- Tabla: Cliente
-- ------------------------------------------------------------
CREATE TABLE Cliente (
    id_Cliente      INT          NOT NULL AUTO_INCREMENT,
    nombre_Cliente  VARCHAR(150) NOT NULL,
    telefono        VARCHAR(20)  NOT NULL,
    direccion       VARCHAR(255) NOT NULL,
    email           VARCHAR(150) NOT NULL,
    NIT             VARCHAR(20)  NOT NULL,
    CONSTRAINT pk_Cliente PRIMARY KEY (id_Cliente)
);

-- ------------------------------------------------------------
-- Tabla: Venta
-- ------------------------------------------------------------
CREATE TABLE Venta (
    id_Venta    INT     NOT NULL AUTO_INCREMENT,
    Fecha       DATE    NOT NULL,
    id_Usuario  INT     NOT NULL,
    id_Cliente  INT     NOT NULL,
    CONSTRAINT pk_Venta PRIMARY KEY (id_Venta),
    CONSTRAINT fk_Venta_Usuario FOREIGN KEY (id_Usuario) REFERENCES Usuario(id_Usuario),
    CONSTRAINT fk_Venta_Cliente FOREIGN KEY (id_Cliente) REFERENCES Cliente(id_Cliente)
);

-- ------------------------------------------------------------
-- Tabla: Categoria
-- ------------------------------------------------------------
CREATE TABLE Categoria (
    id_Categoria      INT          NOT NULL AUTO_INCREMENT,
    nombre_Categoria  VARCHAR(100) NOT NULL,
    CONSTRAINT pk_Categoria PRIMARY KEY (id_Categoria)
);

-- ------------------------------------------------------------
-- Tabla: Proveedor
-- ------------------------------------------------------------
CREATE TABLE Proveedor (
    id_Proveedor      INT          NOT NULL AUTO_INCREMENT,
    nombre_Proveedor  VARCHAR(150) NOT NULL,
    telefono          VARCHAR(20)  NOT NULL,
    email             VARCHAR(150) NOT NULL,
    CONSTRAINT pk_Proveedor PRIMARY KEY (id_Proveedor)
);

-- ------------------------------------------------------------
-- Tabla: Producto
-- ------------------------------------------------------------
CREATE TABLE Producto (
    id_Producto      INT             NOT NULL AUTO_INCREMENT,
    nombre_Producto  VARCHAR(150)    NOT NULL,
    precio_Producto  DECIMAL(10,2)   NOT NULL,
    stock            INT             NOT NULL,
    CONSTRAINT pk_Producto PRIMARY KEY (id_Producto)
);

-- ------------------------------------------------------------
-- Tabla intermedia: Categoria_Producto (M:N)
-- ------------------------------------------------------------
CREATE TABLE Categoria_Producto (
    id_Categoria  INT NOT NULL,
    id_Producto   INT NOT NULL,
    CONSTRAINT pk_Categoria_Producto PRIMARY KEY (id_Categoria, id_Producto),
    CONSTRAINT fk_CatProd_Categoria FOREIGN KEY (id_Categoria) REFERENCES Categoria(id_Categoria),
    CONSTRAINT fk_CatProd_Producto  FOREIGN KEY (id_Producto)  REFERENCES Producto(id_Producto)
);

-- ------------------------------------------------------------
-- Tabla intermedia: Proveedor_Producto (M:N)
-- ------------------------------------------------------------
CREATE TABLE Proveedor_Producto (
    id_Proveedor  INT NOT NULL,
    id_Producto   INT NOT NULL,
    CONSTRAINT pk_Proveedor_Producto PRIMARY KEY (id_Proveedor, id_Producto),
    CONSTRAINT fk_ProvProd_Proveedor FOREIGN KEY (id_Proveedor) REFERENCES Proveedor(id_Proveedor),
    CONSTRAINT fk_ProvProd_Producto  FOREIGN KEY (id_Producto)  REFERENCES Producto(id_Producto)
);

-- ------------------------------------------------------------
-- Tabla: Detalle
-- ------------------------------------------------------------
CREATE TABLE Detalle (
    id_Detalle     INT           NOT NULL AUTO_INCREMENT,
    cantidad       INT           NOT NULL,
    precio_actual  DECIMAL(10,2) NOT NULL,
    id_Venta       INT           NOT NULL,
    id_Producto    INT           NOT NULL,
    CONSTRAINT pk_Detalle PRIMARY KEY (id_Detalle),
    CONSTRAINT fk_Detalle_Venta   FOREIGN KEY (id_Venta)    REFERENCES Venta(id_Venta),
    CONSTRAINT fk_Detalle_Producto FOREIGN KEY (id_Producto) REFERENCES Producto(id_Producto)
);
