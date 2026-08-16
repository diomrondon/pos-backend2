import React, { useState, useRef, useEffect } from 'react';
import { 
  ShoppingCart, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  AlertCircle, 
  Store, 
  Zap, 
  DollarSign, 
  Lock, 
  ShieldCheck, 
  Printer, 
  Receipt, 
  X,
  FileText
} from 'lucide-react';
import { Sucursal, Producto, InventarioItem, Venta, Usuario, EmpresaConfig } from '../types';
import { formatUSD, formatBs, formatDual } from '../lib/currency';

interface PosSimulatorProps {
  sucursales: Sucursal[];
  productos: Producto[];
  inventario: InventarioItem[];
  currentUser: Usuario | null;
  empresaConfig: EmpresaConfig;
  onRegistrarVenta: (sucursalId: number, items: { producto: Producto; cantidad: number }[]) => void;
  ventas: Venta[];
}

export const PosSimulator: React.FC<PosSimulatorProps> = ({
  sucursales,
  productos,
  inventario,
  currentUser,
  empresaConfig,
  onRegistrarVenta,
  ventas,
}) => {
  const [selectedSucursalId, setSelectedSucursalId] = useState<number>(
    currentUser?.sucursal_id && currentUser.sucursal_id <= 2 ? currentUser.sucursal_id : 1
  );
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [cart, setCart] = useState<{ producto: Producto; cantidad: number; stockDisponible: number }[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastCompletedTicket, setLastCompletedTicket] = useState<{
    sucursalNombre: string;
    cajeroNombre: string;
    items: { producto: Producto; cantidad: number }[];
    totalUsd: number;
    tasa: number;
    fecha: string;
  } | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-switch branch when user changes
  useEffect(() => {
    if (currentUser?.sucursal_id && currentUser.sucursal_id <= 2) {
      setSelectedSucursalId(currentUser.sucursal_id);
    }
  }, [currentUser]);

  // Auto-focus barcode input for instant keyboard/scanner typing
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, [selectedSucursalId, cart]);

  const tiendaActual = sucursales.find((s) => s.id === selectedSucursalId) || sucursales[0];

  // Authorization check
  const isBranchAuthorized = () => {
    if (!currentUser) return false;
    if (currentUser.rol === 'admin') return true;
    if (currentUser.sucursal_id === selectedSucursalId) return true;
    return false;
  };

  const handleScanBarcode = (codeToScan?: string) => {
    const code = (codeToScan || barcodeInput).trim();
    if (!code) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isBranchAuthorized()) {
      setErrorMsg(`Acceso denegado: ${currentUser?.nombre_completo || 'Usuario'} no está asignado a ${tiendaActual.nombre}.`);
      setBarcodeInput('');
      return;
    }

    // Find product by barcode
    const prod = productos.find((p) => p.codigo_barras === code);
    if (!prod) {
      setErrorMsg(`Código '${code}' no encontrado en el catálogo.`);
      setBarcodeInput('');
      return;
    }

    // Check stock for this branch
    const inv = inventario.find((i) => i.sucursal_id === selectedSucursalId && i.producto_id === prod.id);
    const currentStock = inv ? inv.stock : 0;

    // Check existing quantity in cart
    const existingInCart = cart.find((item) => item.producto.id === prod.id);
    const existingQty = existingInCart ? existingInCart.cantidad : 0;

    if (existingQty + 1 > currentStock) {
      setErrorMsg(`Stock insuficiente de '${prod.nombre}' en ${tiendaActual.nombre}. Disponible: ${currentStock}`);
      setBarcodeInput('');
      return;
    }

    if (existingInCart) {
      setCart(cart.map((item) =>
        item.producto.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCart([...cart, { producto: prod, cantidad: 1, stockDisponible: currentStock }]);
    }

    setLastScanned(`${prod.nombre} (${formatDual(prod.precio, empresaConfig.tasaCambio)})`);
    setBarcodeInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanBarcode();
    }
  };

  const updateQuantity = (productoId: number, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.producto.id === productoId) {
          const newQty = item.cantidad + delta;
          if (newQty > item.stockDisponible) {
            setErrorMsg(`No puedes agregar más del stock disponible (${item.stockDisponible})`);
            return item;
          }
          return newQty > 0 ? { ...item, cantidad: newQty } : null;
        }
        return item;
      }).filter(Boolean) as { producto: Producto; cantidad: number; stockDisponible: number }[]
    );
  };

  const removeItem = (productoId: number) => {
    setCart(cart.filter((item) => item.producto.id !== productoId));
  };

  const totalCart = cart.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (!isBranchAuthorized()) {
      setErrorMsg('No tienes autorización para cobrar en esta sucursal.');
      return;
    }
    const saleItems = cart.map((c) => ({ producto: c.producto, cantidad: c.cantidad }));
    onRegistrarVenta(selectedSucursalId, saleItems);
    
    // Save for receipt preview
    setLastCompletedTicket({
      sucursalNombre: tiendaActual.nombre,
      cajeroNombre: currentUser?.nombre_completo || 'Cajero de Turno',
      items: saleItems,
      totalUsd: totalCart,
      tasa: empresaConfig.tasaCambio,
      fecha: new Date().toLocaleString('es-VE'),
    });

    setSuccessMsg(`¡Venta completada por ${formatDual(totalCart, empresaConfig.tasaCambio)} por ${currentUser?.nombre_completo || 'Cajero'}!`);
    setCart([]);
    setShowReceiptModal(true);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Barcode USB Simulation Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl border border-emerald-500/30">
            <Barcode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Punto de Venta Dual (USD / Bolívares)
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Tasa: 1$ = {formatBs(1, empresaConfig.tasaCambio)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empresa: <strong className="text-slate-200">{empresaConfig.nombreEmpresa}</strong> (RIF: {empresaConfig.rif}) • Cajero:{' '}
              <strong className="text-emerald-300">{currentUser?.nombre_completo || 'No autenticado'}</strong> ({currentUser?.cargo})
            </p>
          </div>
        </div>

        {/* Branch Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto">
          <Store className="w-4 h-4 text-emerald-400 ml-2" />
          <select
            value={selectedSucursalId}
            onChange={(e) => {
              setSelectedSucursalId(Number(e.target.value));
              setCart([]);
            }}
            className="bg-transparent text-xs text-white font-semibold py-1.5 pr-8 focus:outline-none cursor-pointer"
          >
            {sucursales.filter(s => s.tipo === 'tienda').map((suc) => (
              <option key={suc.id} value={suc.id} className="bg-slate-900 text-white">
                {suc.nombre} {currentUser?.sucursal_id === suc.id ? '★ (Tu Sucursal)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isBranchAuthorized() && (
        <div className="bg-amber-950/60 border border-amber-500/40 p-4 rounded-xl text-amber-200 text-xs flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Aviso de Seguridad de Sucursal:</strong> El usuario actual ({currentUser?.nombre_completo}) pertenece a la{' '}
            <strong>{currentUser?.sucursal_id ? sucursales.find(s => s.id === currentUser.sucursal_id)?.nombre : 'Oficina'}</strong>.
            Para vender en {tiendaActual.nombre}, inicia sesión con uno de los usuarios asignados a esta tienda o como Administrador General.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Barcode Scanner Input & Quick Barcode Buttons */}
        <div className="space-y-4">
          {/* Scanner Input Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Escanear o Escribir Código de Barras:
            </label>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ej: 123456 + [Enter]"
                  className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-sm px-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                />
              </div>

              <button
                onClick={() => handleScanBarcode()}
                className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Agregar
              </button>
            </div>

            {lastScanned && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                <Zap className="w-3.5 h-3.5" /> Último leído: {lastScanned}
              </p>
            )}

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Mobile Demo Quick Barcode Buttons */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Productos Disponibles (Precios Duales):
            </h3>
            <p className="text-xs text-slate-500">
              Toca para agregar con lector o en pantalla táctil:
            </p>

            <div className="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1">
              {productos.map((p) => {
                const inv = inventario.find((i) => i.sucursal_id === selectedSucursalId && i.producto_id === p.id);
                const stock = inv ? inv.stock : 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleScanBarcode(p.codigo_barras)}
                    className="flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all text-left text-xs cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors block">
                        {p.nombre}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        BARCODE: {p.codigo_barras}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-white font-mono">
                        {formatUSD(p.precio)}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        {formatBs(p.precio, empresaConfig.tasaCambio)}
                      </div>
                      <span className={`text-[10px] ${stock < 20 ? 'text-rose-400 font-bold' : 'text-slate-500'}`}>
                        Stock: {stock} un.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Ticket / Cart (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Ticket de Venta en Línea</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium font-mono">
                {cart.length} productos • {currentUser?.nombre_completo || 'Sin cajero'}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs space-y-2">
                <Barcode className="w-10 h-10 mx-auto text-slate-700" />
                <p>El ticket está vacío. Escanea o toca un producto para iniciar la venta.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60 max-h-[350px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.producto.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-200 text-xs truncate">
                        {item.producto.nombre}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">
                        {item.cantidad} x {formatUSD(item.producto.precio)} ({formatBs(item.producto.precio, empresaConfig.tasaCambio)}) ={' '}
                        <strong className="text-white">{formatUSD(item.producto.precio * item.cantidad)}</strong> •{' '}
                        <span className="text-emerald-400">{formatBs(item.producto.precio * item.cantidad, empresaConfig.tasaCambio)}</span>
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.producto.id, -1)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-xs text-white w-6 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.producto.id, 1)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg text-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => removeItem(item.producto.id)}
                        className="bg-rose-950/40 hover:bg-rose-900 text-rose-400 p-1.5 rounded-lg text-xs ml-2 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Footer with Dual Total */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-slate-400 text-xs block">Total a Cobrar:</span>
                <span className="text-xs text-slate-500 font-mono">Tasa del día: 1$ = {formatBs(1, empresaConfig.tasaCambio)}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                  {formatUSD(totalCart)}
                </div>
                <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono">
                  {formatBs(totalCart, empresaConfig.tasaCambio)}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !isBranchAuthorized()}
                className={`flex-1 py-3.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                  cart.length > 0 && isBranchAuthorized()
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <DollarSign className="w-5 h-5" /> Cobrar y Registrar Venta ({currentUser?.nombre_completo || 'Cajero'})
              </button>

              {lastCompletedTicket && (
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                  title="Ver último ticket fiscal emitido"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Ver Ticket</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ticket / Receipt Preview Modal */}
      {showReceiptModal && lastCompletedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs relative">
            <button
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase">
                {empresaConfig.nombreEmpresa}
              </h3>
              <p className="font-bold text-[11px] text-slate-700">RIF: {empresaConfig.rif}</p>
              <p className="text-[10px] text-slate-600 leading-tight">{empresaConfig.direccionFiscal}</p>
              <p className="text-[10px] text-slate-600">TELF: {empresaConfig.telefono}</p>
              <div className="pt-1 text-[10px] text-slate-500 font-sans">
                <span>{lastCompletedTicket.sucursalNombre}</span> • <span>Cajero: {lastCompletedTicket.cajeroNombre}</span>
              </div>
              <p className="text-[9px] text-slate-400">{lastCompletedTicket.fecha}</p>
            </div>

            {/* Receipt Items */}
            <div className="space-y-1.5 py-1 border-b border-dashed border-slate-300 text-[11px]">
              <div className="flex justify-between font-bold text-[10px] text-slate-600 border-b border-slate-200 pb-1">
                <span>DESCRIPCIÓN</span>
                <span>USD / BS</span>
              </div>
              {lastCompletedTicket.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{it.producto.nombre}</p>
                    <p className="text-[10px] text-slate-500">
                      {it.cantidad} x {formatUSD(it.producto.precio)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatUSD(it.producto.precio * it.cantidad)}</p>
                    <p className="text-[10px] text-slate-600">{formatBs(it.producto.precio * it.cantidad, lastCompletedTicket.tasa)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Receipt Totals */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Tasa BCV Aplicada:</span>
                <span className="font-bold">1 USD = {formatBs(1, lastCompletedTicket.tasa)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1">
                <span>TOTAL USD:</span>
                <span>{formatUSD(lastCompletedTicket.totalUsd)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-700">
                <span>TOTAL BS:</span>
                <span>{formatBs(lastCompletedTicket.totalUsd, lastCompletedTicket.tasa)}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
              ¡Gracias por su compra! • Sistema Multi-Tienda
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Ticket
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="bg-slate-200 text-slate-800 hover:bg-slate-300 py-2.5 px-4 rounded-xl font-sans font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
