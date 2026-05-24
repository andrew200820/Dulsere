-- =========================================================================
-- Dulsere ERP/CRM - Esquema de Base de Datos (DDL)
-- Diseñado para PostgreSQL (Compatible con Supabase)
-- =========================================================================

-- Habilitar extensión para generación de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. AUTENTICACIÓN Y ROLES (RBAC)
-- =========================================================================

CREATE TABLE public.roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insertar roles iniciales
INSERT INTO public.roles (nombre, descripcion) VALUES
('Admin', 'Acceso total al sistema (Administración y Configuración)'),
('Inventario', 'Gestión de insumos, stock y productos finales'),
('Produccion', 'Lectura de recetas (BOM), eventos y control de producción (Lectura)');

-- Tabla de perfiles de usuario vinculada a Supabase auth.users
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY, -- Se vincula al UUID de auth.users en Supabase
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Para validación local bcrypt
    nombre VARCHAR(255),
    role_id INTEGER NOT NULL REFERENCES public.roles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuarios_role ON public.usuarios(role_id);

-- =========================================================================
-- 2. CORE & INVENTARIO (BOM)
-- =========================================================================

CREATE TABLE public.insumos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL, -- 'g', 'ml', 'unidades', 'cajas', etc.
    stock_actual DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 CHECK (stock_actual >= 0),
    stock_minimo DECIMAL(12, 4) NOT NULL DEFAULT 0.0000 CHECK (stock_minimo >= 0),
    costo_unitario DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (costo_unitario >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE, -- Borrado lógico
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio_venta DECIMAL(12, 2) NOT NULL CHECK (precio_venta >= 0),
    activo BOOLEAN NOT NULL DEFAULT TRUE, -- Borrado lógico
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla intermedia para la Receta / Bill of Materials (BOM)
CREATE TABLE public.recetas_bom (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
    insumo_id INTEGER NOT NULL REFERENCES public.insumos(id) ON DELETE RESTRICT,
    cantidad_requerida DECIMAL(12, 4) NOT NULL CHECK (cantidad_requerida > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(producto_id, insumo_id)
);

CREATE INDEX idx_recetas_producto ON public.recetas_bom(producto_id);

-- Tabla de historial/auditoría de movimientos de inventario (Kardex)
CREATE TABLE public.movimientos_inventario (
    id SERIAL PRIMARY KEY,
    insumo_id INTEGER NOT NULL REFERENCES public.insumos(id) ON DELETE RESTRICT,
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad DECIMAL(12, 4) NOT NULL CHECK (cantidad > 0),
    motivo VARCHAR(255) NOT NULL, -- 'Compra', 'Producción de Proforma #X', 'Ajuste IA', etc.
    usuario_id UUID REFERENCES public.usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 3. CLIENTES Y LOGÍSTICA
-- =========================================================================

CREATE TABLE public.clientes (
    id SERIAL PRIMARY KEY,
    cedula_ruc VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    direccion_entrega TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 4. PROFORMAS Y COTIZACIONES (MÁQUINA DE ESTADOS)
-- =========================================================================

CREATE TABLE public.proformas (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES public.clientes(id) ON DELETE RESTRICT,
    estado VARCHAR(20) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Definitiva', 'Cerrada')),
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_entrega TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Token de acceso público
    token_acceso UUID DEFAULT uuid_generate_v4() UNIQUE,
    
    -- Totales y Descuentos
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    descuento DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (descuento >= 0),
    motivo_descuento VARCHAR(255), -- 'Promoción Día de la Madre', 'Descuento por Volumen', etc.
    
    -- Impuestos (IVA)
    porcentaje_iva DECIMAL(5, 2) NOT NULL DEFAULT 0.00 CHECK (porcentaje_iva >= 0),
    monto_iva DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (monto_iva >= 0),
    
    -- Total Final
    total DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (total >= 0),
    
    -- Enlace de boceto generado por IA
    url_previsualizacion_ia TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_proformas_estado ON public.proformas(estado);
CREATE INDEX idx_proformas_cliente ON public.proformas(cliente_id);

-- Detalle de productos de la proforma
CREATE TABLE public.detalle_proformas (
    id SERIAL PRIMARY KEY,
    proforma_id INTEGER NOT NULL REFERENCES public.proformas(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_detalle_proforma ON public.detalle_proformas(proforma_id);

-- =========================================================================
-- 5. PAGOS Y ANTICIPOS
-- =========================================================================

CREATE TABLE public.pagos_anticipos (
    id SERIAL PRIMARY KEY,
    proforma_id INTEGER NOT NULL REFERENCES public.proformas(id) ON DELETE CASCADE,
    monto DECIMAL(12, 2) NOT NULL CHECK (monto > 0),
    tipo_pago VARCHAR(20) NOT NULL CHECK (tipo_pago IN ('Anticipo', 'Saldo_Cierre', 'Completo')),
    metodo_pago VARCHAR(50) NOT NULL, -- 'Transferencia', 'Efectivo', 'Tarjeta', etc.
    referencia VARCHAR(255), -- ID de transferencia o comprobante de pago
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usuario_id UUID REFERENCES public.usuarios(id)
);

CREATE INDEX idx_pagos_proforma ON public.pagos_anticipos(proforma_id);

-- =========================================================================
-- 6. EVENTOS DE CALENDARIO (LOGÍSTICA)
-- =========================================================================

CREATE TABLE public.eventos_calendario (
    id SERIAL PRIMARY KEY,
    proforma_id INTEGER UNIQUE NOT NULL REFERENCES public.proformas(id) ON DELETE CASCADE,
    google_calendar_event_id VARCHAR(255),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    sincronizado BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- 7. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- =========================================================================

-- Trigger para mantener actualizado 'updated_at' automáticamente
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Asignar triggers de actualización
CREATE TRIGGER tr_actualizar_usuarios BEFORE UPDATE ON public.usuarios FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp_modificacion();
CREATE TRIGGER tr_actualizar_insumos BEFORE UPDATE ON public.insumos FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp_modificacion();
CREATE TRIGGER tr_actualizar_productos BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp_modificacion();
CREATE TRIGGER tr_actualizar_clientes BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp_modificacion();
CREATE TRIGGER tr_actualizar_proformas BEFORE UPDATE ON public.proformas FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp_modificacion();
CREATE TRIGGER tr_actualizar_eventos BEFORE UPDATE ON public.eventos_calendario FOR EACH ROW EXECUTE FUNCTION public.actualizar_timestamp_modificacion();
