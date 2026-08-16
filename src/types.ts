export interface Sucursal {
  id: number;
  nombre: string;
  tipo: 'tienda' | 'oficina';
}

export interface Producto {
  id: number;
  codigo_barras: string;
  nombre: string;
  precio: number;
  costo?: number;
}

export interface InventarioItem {
  id: number;
  sucursal_id: number;
  producto_id: number;
  stock: number;
}

export interface ModuloPermisos {
  dashboard: boolean;
  ventas: boolean;
  compras: boolean;
  clientes: boolean;
  proveedores: boolean;
  cxc: boolean;
  cxp: boolean;
  reportes: boolean;
  configuracion: boolean;
}

export interface Usuario {
  id: number;
  username: string;
  nombre_completo: string;
  pin: string;
  rol: 'cajero' | 'supervisor' | 'inventario' | 'admin';
  sucursal_id: number | null; // null = acceso a todas las sucursales (admin)
  cargo: string;
  permisos?: ModuloPermisos;
}

export interface Venta {
  id: number;
  sucursal_id: number;
  usuario_id?: number;
  usuario_nombre?: string;
  cliente_id?: number;
  cliente_nombre?: string;
  fecha: string;
  total: number;
  metodo_pago?: string;
  detalles: DetalleVenta[];
}

export interface DetalleVenta {
  id: number;
  venta_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Cliente {
  id: number;
  nombre: string;
  rif_cedula: string;
  telefono: string;
  email?: string;
  direccion?: string;
  limiteCredito: number; // en USD
  saldoPendiente: number; // en USD
  fechaRegistro: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  rif: string;
  contacto: string;
  telefono: string;
  email?: string;
  direccion?: string;
  saldoPendiente: number; // en USD
}

export interface Compra {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  sucursalId: number;
  numeroFactura?: string;
  fecha: string;
  total: number;
  estado: 'completada' | 'pendiente';
  usuarioNombre?: string;
  detalles: {
    productoId: number;
    productoNombre: string;
    cantidad: number;
    costoUnitario: number;
    subtotal: number;
  }[];
}

export interface AbonoCxC {
  id: number;
  fecha: string;
  monto: number; // USD
  metodoPago: string;
  referencia?: string;
  usuarioNombre: string;
}

export interface CuentaPorCobrar {
  id: number;
  clienteId: number;
  clienteNombre: string;
  ventaId?: number;
  concepto: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number; // USD
  saldoRestante: number; // USD
  estado: 'pendiente' | 'parcial' | 'pagada';
  abonos: AbonoCxC[];
}

export interface PagoCxP {
  id: number;
  fecha: string;
  monto: number; // USD
  metodoPago: string;
  referencia?: string;
  usuarioNombre: string;
}

export interface CuentaPorPagar {
  id: number;
  proveedorId: number;
  proveedorNombre: string;
  compraId?: number;
  numeroFactura: string;
  fechaEmision: string;
  fechaVencimiento: string;
  montoTotal: number; // USD
  saldoRestante: number; // USD
  estado: 'pendiente' | 'parcial' | 'pagada';
  pagos: PagoCxP[];
}

export interface EmpresaConfig {
  nombreEmpresa: string;
  rif: string;
  direccionFiscal: string;
  telefono: string;
  logoUrl?: string;
  tasaCambio: number; // Bolívares por USD (ej. 36.50)
  fechaTasa: string;
  ultimaActualizacionTasa?: string;
  nombreTienda1: string;
  nombreTienda2: string;
  nombreOficina: string;
}

