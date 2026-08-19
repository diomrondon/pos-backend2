import {
  Sucursal,
  Producto,
  InventarioItem,
  Venta,
  Usuario,
  Cliente,
  Proveedor,
  Compra,
  CuentaPorCobrar,
  CuentaPorPagar,
  ModuloPermisos,
} from '../types';

export const INITIAL_SUCURSALES: Sucursal[] = [
  { id: 1, nombre: 'Tienda 1 - Centro', tipo: 'tienda' },
  { id: 2, nombre: 'Tienda 2 - Norte', tipo: 'tienda' },
  { id: 3, nombre: 'Oficina Central / Inventario', tipo: 'oficina' },
];

export const DEFAULT_CASHIER_PERMISSIONS: ModuloPermisos = {
  dashboard: false,
  ventas: true,
  inventario: false,
  compras: false,
  clientes: false,
  proveedores: false,
  cxc: false,
  cxp: false,
  reportes: false,
  configuracion: false,
};

export const DEFAULT_ADMIN_PERMISSIONS: ModuloPermisos = {
  dashboard: true,
  ventas: true,
  inventario: true,
  compras: true,
  clientes: true,
  proveedores: true,
  cxc: true,
  cxp: true,
  reportes: true,
  configuracion: true,
};

export const INITIAL_USUARIOS: Usuario[] = [
  // 4 Usuarios para Tienda 1 (Centro)
  { id: 1, username: 'cajero1_t1', nombre_completo: 'Ana Morales', pin: '1001', rol: 'cajero', sucursal_id: 1, cargo: 'Cajera Principal', permisos: { ...DEFAULT_CASHIER_PERMISSIONS } },
  { id: 2, username: 'cajero2_t1', nombre_completo: 'Carlos Pérez', pin: '1002', rol: 'cajero', sucursal_id: 1, cargo: 'Cajero Turno Tarde', permisos: { ...DEFAULT_CASHIER_PERMISSIONS } },
  { id: 3, username: 'cajero3_t1', nombre_completo: 'Diana Castro', pin: '1003', rol: 'cajero', sucursal_id: 1, cargo: 'Cajera Fines de Semana', permisos: { ...DEFAULT_CASHIER_PERMISSIONS } },
  { id: 4, username: 'supervisor_t1', nombre_completo: 'Elena Rivas', pin: '1004', rol: 'supervisor', sucursal_id: 1, cargo: 'Supervisora Tienda 1', permisos: { ...DEFAULT_CASHIER_PERMISSIONS, reportes: true } },

  // 4 Usuarios para Tienda 2 (Norte)
  { id: 5, username: 'cajero1_t2', nombre_completo: 'Fernando Soto', pin: '2001', rol: 'cajero', sucursal_id: 2, cargo: 'Cajero Principal', permisos: { ...DEFAULT_CASHIER_PERMISSIONS } },
  { id: 6, username: 'cajero2_t2', nombre_completo: 'Gabriela Ruiz', pin: '2002', rol: 'cajero', sucursal_id: 2, cargo: 'Cajera Turno Tarde', permisos: { ...DEFAULT_CASHIER_PERMISSIONS } },
  { id: 7, username: 'cajero3_t2', nombre_completo: 'Hugo Mendoza', pin: '2003', rol: 'cajero', sucursal_id: 2, cargo: 'Cajero Fines de Semana', permisos: { ...DEFAULT_CASHIER_PERMISSIONS } },
  { id: 8, username: 'supervisor_t2', nombre_completo: 'Isabel Vargas', pin: '2004', rol: 'supervisor', sucursal_id: 2, cargo: 'Supervisora Tienda 2', permisos: { ...DEFAULT_CASHIER_PERMISSIONS, reportes: true } },

  // 4 Usuarios para Área de Inventario y Oficina Central
  { id: 9, username: 'inv_jefe', nombre_completo: 'Jorge Martínez', pin: '3001', rol: 'inventario', sucursal_id: 3, cargo: 'Jefe de Almacén e Inventarios', permisos: { ...DEFAULT_CASHIER_PERMISSIONS, inventario: true, compras: true, proveedores: true } },
  { id: 10, username: 'inv_operador1', nombre_completo: 'Karla Benítez', pin: '3002', rol: 'inventario', sucursal_id: 3, cargo: 'Auditora de Existencias', permisos: { ...DEFAULT_CASHIER_PERMISSIONS, inventario: true, compras: true } },
  { id: 11, username: 'inv_operador2', nombre_completo: 'Luis Navarro', pin: '3003', rol: 'inventario', sucursal_id: 3, cargo: 'Encargado de Traspasos y Recepción', permisos: { ...DEFAULT_CASHIER_PERMISSIONS, inventario: true, compras: true } },
  { id: 12, username: 'admin_general', nombre_completo: 'Administrador General', pin: '9999', rol: 'admin', sucursal_id: null, cargo: 'Gerente General / Admin Sistema', permisos: { ...DEFAULT_ADMIN_PERMISSIONS } },
];

export const INITIAL_CLIENTES: Cliente[] = [
  { id: 1, nombre: 'Distribuidora Los Andes C.A.', rif_cedula: 'J-30492817-4', telefono: '+58 414-2345678', email: 'compras@losandes.com', direccion: 'Av. Libertador, Edif. Los Andes, Caracas', limiteCredito: 500, saldoPendiente: 120.50, fechaRegistro: '2026-01-15' },
  { id: 2, nombre: 'Panadería y Pastelería La Espiga', rif_cedula: 'J-40918273-1', telefono: '+58 424-9876543', email: 'laespiga@gmail.com', direccion: 'Calle Real de Sabana Grande, Local 12', limiteCredito: 300, saldoPendiente: 75.00, fechaRegistro: '2026-02-10' },
  { id: 3, nombre: 'Minimarket San Antonio', rif_cedula: 'J-50123984-7', telefono: '+58 412-5551122', email: 'sanantoniomarket@hotmail.com', direccion: 'Urb. San Antonio, Manzana 4, Los Teques', limiteCredito: 800, saldoPendiente: 0.00, fechaRegistro: '2026-03-01' },
  { id: 4, nombre: 'Restaurante Sabor Criollo C.A.', rif_cedula: 'J-29837461-9', telefono: '+58 416-3344556', email: 'administracion@saborcriollo.ve', direccion: 'Centro Comercial Tolón, Nivel Feria', limiteCredito: 600, saldoPendiente: 240.00, fechaRegistro: '2026-03-20' },
  { id: 5, nombre: 'María Elena Zambrano', rif_cedula: 'V-18492019', telefono: '+58 414-1112233', email: 'maria.zambrano@gmail.com', direccion: 'Residencias El Ávila, Apto 4-B, Chacao', limiteCredito: 100, saldoPendiente: 25.00, fechaRegistro: '2026-04-05' },
];

export const INITIAL_PROVEEDORES: Proveedor[] = [
  { id: 1, nombre: 'Alimentos Polar Comercial C.A.', rif: 'J-00041372-9', contacto: 'Marcos Delgado', telefono: '+58 212-2023111', email: 'pedidos@polar.com', direccion: 'Los Cortijos de Lourdes, Caracas', saldoPendiente: 850.00 },
  { id: 2, nombre: 'Cargill de Venezuela S.R.L.', rif: 'J-00054321-0', contacto: 'Beatriz Salazar', telefono: '+58 212-9051000', email: 'ventas.ve@cargill.com', direccion: 'Av. Francisco de Miranda, Edif Cavendes', saldoPendiente: 420.00 },
  { id: 3, nombre: 'Monaca (Molinos Nacionales C.A.)', rif: 'J-00012983-5', contacto: 'Ricardo Gómez', telefono: '+58 212-9993300', email: 'atencion@monaca.com.ve', direccion: 'Zona Industrial La Yaguara', saldoPendiente: 0.00 },
  { id: 4, nombre: 'Detergentes y Químicos del Caribe', rif: 'J-31982746-8', contacto: 'Claudia Méndez', telefono: '+58 241-8765432', email: 'distribucion@quimicoscaribe.com', direccion: 'Valencia, Edo. Carabobo', saldoPendiente: 310.00 },
];

export const INITIAL_COMPRAS: Compra[] = [
  {
    id: 1,
    proveedorId: 1,
    proveedorNombre: 'Alimentos Polar Comercial C.A.',
    sucursalId: 3,
    numeroFactura: 'FAC-POL-88392',
    fecha: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    total: 850.00,
    estado: 'completada',
    usuarioNombre: 'Jorge Martínez',
    detalles: [
      { productoId: 1, productoNombre: 'Arroz Integral 1kg', cantidad: 200, costoUnitario: 1.80, subtotal: 360.00 },
      { productoId: 4, productoNombre: 'Café Molido Premium 500g', cantidad: 100, costoUnitario: 4.90, subtotal: 490.00 },
    ]
  },
  {
    id: 2,
    proveedorId: 2,
    proveedorNombre: 'Cargill de Venezuela S.R.L.',
    sucursalId: 3,
    numeroFactura: 'FAC-CRG-10294',
    fecha: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    total: 420.00,
    estado: 'completada',
    usuarioNombre: 'Luis Navarro',
    detalles: [
      { productoId: 2, productoNombre: 'Aceite Vegetal 1L', cantidad: 120, costoUnitario: 3.50, subtotal: 420.00 },
    ]
  },
];

export const INITIAL_CXC: CuentaPorCobrar[] = [
  {
    id: 1,
    clienteId: 1,
    clienteNombre: 'Distribuidora Los Andes C.A.',
    ventaId: 101,
    concepto: 'Factura a Crédito #VTA-00101 - Mercancía Variada',
    fechaEmision: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    fechaVencimiento: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
    montoTotal: 220.50,
    saldoRestante: 120.50,
    estado: 'parcial',
    abonos: [
      { id: 1, fecha: new Date(Date.now() - 3600000 * 24 * 4).toISOString(), monto: 100.00, metodoPago: 'Pago Móvil / Transferencia', referencia: 'PM-883920', usuarioNombre: 'Ana Morales' }
    ]
  },
  {
    id: 2,
    clienteId: 2,
    clienteNombre: 'Panadería y Pastelería La Espiga',
    ventaId: 102,
    concepto: 'Factura #VTA-00102 - 50x Harina de Trigo',
    fechaEmision: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    fechaVencimiento: new Date(Date.now() + 3600000 * 24 * 11).toISOString(),
    montoTotal: 75.00,
    saldoRestante: 75.00,
    estado: 'pendiente',
    abonos: []
  },
  {
    id: 3,
    clienteId: 4,
    clienteNombre: 'Restaurante Sabor Criollo C.A.',
    ventaId: 103,
    concepto: 'Factura #VTA-00103 - Insumos Cocina',
    fechaEmision: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    fechaVencimiento: new Date(Date.now() - 3600000 * 24 * 2).toISOString(), // Vencida
    montoTotal: 240.00,
    saldoRestante: 240.00,
    estado: 'pendiente',
    abonos: []
  },
  {
    id: 4,
    clienteId: 5,
    clienteNombre: 'María Elena Zambrano',
    ventaId: 104,
    concepto: 'Ticket #TK-9920 - Compra Víveres Quincena',
    fechaEmision: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    fechaVencimiento: new Date(Date.now() + 3600000 * 24 * 13).toISOString(),
    montoTotal: 25.00,
    saldoRestante: 25.00,
    estado: 'pendiente',
    abonos: []
  }
];

export const INITIAL_CXP: CuentaPorPagar[] = [
  {
    id: 1,
    proveedorId: 1,
    proveedorNombre: 'Alimentos Polar Comercial C.A.',
    compraId: 1,
    numeroFactura: 'FAC-POL-88392',
    fechaEmision: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    fechaVencimiento: new Date(Date.now() + 3600000 * 24 * 12).toISOString(),
    montoTotal: 850.00,
    saldoRestante: 850.00,
    estado: 'pendiente',
    pagos: []
  },
  {
    id: 2,
    proveedorId: 2,
    proveedorNombre: 'Cargill de Venezuela S.R.L.',
    compraId: 2,
    numeroFactura: 'FAC-CRG-10294',
    fechaEmision: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    fechaVencimiento: new Date(Date.now() + 3600000 * 24 * 8).toISOString(),
    montoTotal: 420.00,
    saldoRestante: 420.00,
    estado: 'pendiente',
    pagos: []
  },
  {
    id: 3,
    proveedorId: 4,
    proveedorNombre: 'Detergentes y Químicos del Caribe',
    numeroFactura: 'FAC-DQC-00481',
    fechaEmision: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    fechaVencimiento: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    montoTotal: 500.00,
    saldoRestante: 310.00,
    estado: 'parcial',
    pagos: [
      { id: 1, fecha: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), monto: 190.00, metodoPago: 'Transferencia Bancaria', referencia: 'TRF-902194', usuarioNombre: 'Administrador General' }
    ]
  }
];


export const INITIAL_PRODUCTOS: Producto[] = [
  { id: 1, codigo_barras: '123456', nombre: 'Arroz Integral 1kg', precio: 2.50, costo: 1.80 },
  { id: 2, codigo_barras: '789012', nombre: 'Aceite Vegetal 1L', precio: 4.80, costo: 3.50 },
  { id: 3, codigo_barras: '345678', nombre: 'Harina de Trigo 1kg', precio: 1.75, costo: 1.20 },
  { id: 4, codigo_barras: '901234', nombre: 'Café Molido Premium 500g', precio: 6.20, costo: 4.50 },
  { id: 5, codigo_barras: '567890', nombre: 'Detergente Líquido 2L', precio: 5.90, costo: 4.10 },
];

export const INITIAL_INVENTARIO: InventarioItem[] = [
  // Tienda 1
  { id: 1, sucursal_id: 1, producto_id: 1, stock: 150 },
  { id: 2, sucursal_id: 1, producto_id: 2, stock: 80 },
  { id: 3, sucursal_id: 1, producto_id: 3, stock: 200 },
  { id: 4, sucursal_id: 1, producto_id: 4, stock: 45 },
  { id: 5, sucursal_id: 1, producto_id: 5, stock: 60 },

  // Tienda 2
  { id: 6, sucursal_id: 2, producto_id: 1, stock: 120 },
  { id: 7, sucursal_id: 2, producto_id: 2, stock: 95 },
  { id: 8, sucursal_id: 2, producto_id: 3, stock: 180 },
  { id: 9, sucursal_id: 2, producto_id: 4, stock: 30 },
  { id: 10, sucursal_id: 2, producto_id: 5, stock: 40 },

  // Oficina Central (Bodega)
  { id: 11, sucursal_id: 3, producto_id: 1, stock: 1000 },
  { id: 12, sucursal_id: 3, producto_id: 2, stock: 500 },
  { id: 13, sucursal_id: 3, producto_id: 3, stock: 1500 },
  { id: 14, sucursal_id: 3, producto_id: 4, stock: 400 },
  { id: 15, sucursal_id: 3, producto_id: 5, stock: 300 },
];

export const INITIAL_VENTAS: Venta[] = [
  {
    id: 1,
    sucursal_id: 1,
    usuario_id: 1,
    usuario_nombre: 'Ana Morales',
    fecha: new Date(Date.now() - 3600000 * 2).toISOString(),
    total: 12.30,
    detalles: [
      { id: 1, venta_id: 1, producto_id: 1, producto_nombre: 'Arroz Integral 1kg', cantidad: 2, precio_unitario: 2.50, subtotal: 5.00 },
      { id: 2, venta_id: 1, producto_id: 3, producto_nombre: 'Harina de Trigo 1kg', cantidad: 2, precio_unitario: 1.75, subtotal: 3.50 },
      { id: 3, venta_id: 1, producto_id: 2, producto_nombre: 'Aceite Vegetal 1L', cantidad: 1, precio_unitario: 3.80, subtotal: 3.80 }
    ]
  },
  {
    id: 2,
    sucursal_id: 2,
    usuario_id: 5,
    usuario_nombre: 'Fernando Soto',
    fecha: new Date(Date.now() - 3600000 * 5).toISOString(),
    total: 12.40,
    detalles: [
      { id: 4, venta_id: 2, producto_id: 4, producto_nombre: 'Café Molido Premium 500g', cantidad: 2, precio_unitario: 6.20, subtotal: 12.40 }
    ]
  }
];

export const SQL_ETAPA1_SCRIPT = `-- ========================================================
-- SISTEMA MULTI-SUCURSAL EN LÍNEA ($0 COSTO)
-- SCRIPT DE INICIALIZACIÓN CON USUARIOS Y SEGURIDAD (POSTGRESQL / SUPABASE)
-- ========================================================

-- 1. Eliminar tablas previas en orden de dependencia (si existen)
DROP TABLE IF EXISTS detalle_ventas CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS sucursales CASCADE;

-- 2. Tabla de Sucursales (Tiendas físicas y Oficina Central)
CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'tienda',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Usuarios con Autenticación por PIN y Rol
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    nombre_completo VARCHAR(120) NOT NULL,
    pin VARCHAR(20) NOT NULL,
    rol VARCHAR(30) NOT NULL CHECK (rol IN ('cajero', 'supervisor', 'inventario', 'admin')),
    sucursal_id INT REFERENCES sucursales(id) ON DELETE SET NULL,
    cargo VARCHAR(100),
    activo BOOLEAN DEFAULT TRUE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Productos (Catálogo global)
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    codigo_barras VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Inventario por Sucursal
CREATE TABLE inventario (
    id SERIAL PRIMARY KEY,
    sucursal_id INT NOT NULL REFERENCES sucursales(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    CONSTRAINT uq_sucursal_producto UNIQUE (sucursal_id, producto_id)
);

-- 6. Tabla de Encabezado de Ventas con Auditoría de Cajero/Usuario
CREATE TABLE ventas (
    id SERIAL PRIMARY KEY,
    sucursal_id INT NOT NULL REFERENCES sucursales(id) ON DELETE RESTRICT,
    usuario_id INT REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);

-- 7. Tabla de Detalle de Ventas
CREATE TABLE detalle_ventas (
    id SERIAL PRIMARY KEY,
    venta_id INT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0)
);

-- 8. Índices de rendimiento
CREATE INDEX idx_productos_codigo_barras ON productos(codigo_barras);
CREATE INDEX idx_inventario_busqueda ON inventario(sucursal_id, producto_id);
CREATE INDEX idx_ventas_sucursal_fecha ON ventas(sucursal_id, fecha DESC);
CREATE INDEX idx_usuarios_username_pin ON usuarios(username, pin);

-- ========================================================
-- INSERCIÓN DE USUARIOS Y DATOS INICIALES
-- ========================================================

INSERT INTO sucursales (id, nombre, tipo) VALUES
(1, 'Tienda 1 - Centro', 'tienda'),
(2, 'Tienda 2 - Norte', 'tienda'),
(3, 'Oficina Central / Inventario', 'oficina');

SELECT setval('sucursales_id_seq', (SELECT MAX(id) FROM sucursales));

-- 4 Usuarios Tienda 1
INSERT INTO usuarios (id, username, nombre_completo, pin, rol, sucursal_id, cargo) VALUES
(1, 'cajero1_t1', 'Ana Morales', '1001', 'cajero', 1, 'Cajera Principal'),
(2, 'cajero2_t1', 'Carlos Pérez', '1002', 'cajero', 1, 'Cajero Turno Tarde'),
(3, 'cajero3_t1', 'Diana Castro', '1003', 'cajero', 1, 'Cajera Fines de Semana'),
(4, 'supervisor_t1', 'Elena Rivas', '1004', 'supervisor', 1, 'Supervisora Tienda 1');

-- 4 Usuarios Tienda 2
INSERT INTO usuarios (id, username, nombre_completo, pin, rol, sucursal_id, cargo) VALUES
(5, 'cajero1_t2', 'Fernando Soto', '2001', 'cajero', 2, 'Cajero Principal'),
(6, 'cajero2_t2', 'Gabriela Ruiz', '2002', 'cajero', 2, 'Cajera Turno Tarde'),
(7, 'cajero3_t2', 'Hugo Mendoza', '2003', 'cajero', 2, 'Cajero Fines de Semana'),
(8, 'supervisor_t2', 'Isabel Vargas', '2004', 'supervisor', 2, 'Supervisora Tienda 2');

-- 4 Usuarios Inventario / Oficina Central
INSERT INTO usuarios (id, username, nombre_completo, pin, rol, sucursal_id, cargo) VALUES
(9, 'inv_jefe', 'Jorge Martínez', '3001', 'inventario', 3, 'Jefe de Almacén e Inventarios'),
(10, 'inv_operador1', 'Karla Benítez', '3002', 'inventario', 3, 'Auditora de Existencias'),
(11, 'inv_operador2', 'Luis Navarro', '3003', 'inventario', 3, 'Encargado de Traspasos y Recepción'),
(12, 'admin_general', 'Administrador General', '9999', 'admin', NULL, 'Director General / Admin Sistema');

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- Productos Básicos
INSERT INTO productos (id, codigo_barras, nombre, precio) VALUES
(1, '123456', 'Arroz Integral 1kg', 2.50),
(2, '789012', 'Aceite Vegetal 1L', 4.80),
(3, '345678', 'Harina de Trigo 1kg', 1.75),
(4, '901234', 'Café Molido Premium 500g', 6.20),
(5, '567890', 'Detergente Líquido 2L', 5.90);

SELECT setval('productos_id_seq', (SELECT MAX(id) FROM productos));

-- Stock Inicial
INSERT INTO inventario (sucursal_id, producto_id, stock) VALUES
(1, 1, 150), (1, 2, 80), (1, 3, 200), (1, 4, 45), (1, 5, 60),
(2, 1, 120), (2, 2, 95), (2, 3, 180), (2, 4, 30), (2, 5, 40),
(3, 1, 1000), (3, 2, 500), (3, 3, 1500), (3, 4, 400), (3, 5, 300);
`;
