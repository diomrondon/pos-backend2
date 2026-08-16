import React, { useState } from 'react';
import { Package, ArrowRightLeft, Building2, Plus, Edit3, CheckCircle, AlertCircle, ShieldAlert, Lock, DollarSign } from 'lucide-react';
import { Sucursal, Producto, InventarioItem, Usuario, EmpresaConfig } from '../types';
import { formatUSD, formatBs, formatDual } from '../lib/currency';

interface InventoryManagerProps {
  sucursales: Sucursal[];
  productos: Producto[];
  inventario: InventarioItem[];
  currentUser: Usuario | null;
  empresaConfig: EmpresaConfig;
  onTransferStock: (origenId: number, destinoId: number, productoId: number, cantidad: number) => boolean;
  onAddProduct: (codigoBarras: string, nombre: string, precio: number, stockOficina: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  sucursales,
  productos,
  inventario,
  currentUser,
  empresaConfig,
  onTransferStock,
  onAddProduct,
}) => {
  const [origenId, setOrigenId] = useState<number>(3); // Oficina central by default
  const [destinoId, setDestinoId] = useState<number>(1); // Tienda 1 by default
  const [selectedProdId, setSelectedProdId] = useState<number>(1);
  const [cantidadTransfer, setCantidadTransfer] = useState<number>(50);
  const [transferMsg, setTransferMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Product Modal/Form State
  const [showNewProdForm, setShowNewProdForm] = useState<boolean>(false);
  const [newCodigo, setNewCodigo] = useState<string>('');
  const [newNombre, setNewNombre] = useState<string>('');
  const [newPrecio, setNewPrecio] = useState<string>('');
  const [newStockOficina, setNewStockOficina] = useState<string>('100');

  // Total valuation calculation
  const totalValuationUSD = productos.reduce((sum, prod) => {
    const totalUnits = inventario
      .filter((inv) => inv.producto_id === prod.id)
      .reduce((s, i) => s + i.stock, 0);
    return sum + totalUnits * prod.precio;
  }, 0);

  const hasInventoryPermission = () => {
    if (!currentUser) return false;
    return currentUser.rol === 'inventario' || currentUser.rol === 'admin';
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferMsg(null);

    if (!hasInventoryPermission()) {
      setTransferMsg({
        text: 'Acceso denegado: Solo el personal autorizado de Inventario/Oficina o Administradores pueden autorizar traspasos de stock.',
        type: 'error',
      });
      return;
    }

    if (origenId === destinoId) {
      setTransferMsg({ text: 'La sucursal de origen y destino deben ser distintas.', type: 'error' });
      return;
    }

    const ok = onTransferStock(origenId, destinoId, selectedProdId, cantidadTransfer);
    if (ok) {
      const prod = productos.find((p) => p.id === selectedProdId);
      const orig = sucursales.find((s) => s.id === origenId);
      const dest = sucursales.find((s) => s.id === destinoId);
      setTransferMsg({
        text: `¡Transferidos ${cantidadTransfer} un. de '${prod?.nombre}' desde ${orig?.nombre} a ${dest?.nombre} autorizado por ${currentUser?.nombre_completo}!`,
        type: 'success',
      });
    } else {
      setTransferMsg({ text: 'Stock insuficiente en la sucursal de origen.', type: 'error' });
    }
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasInventoryPermission()) {
      alert('Acceso restringido: Inicia sesión con uno de los 4 usuarios de Inventario.');
      return;
    }
    if (!newCodigo || !newNombre || !newPrecio) return;

    onAddProduct(newCodigo, newNombre, parseFloat(newPrecio), parseInt(newStockOficina) || 0);
    setShowNewProdForm(false);
    setNewCodigo('');
    setNewNombre('');
    setNewPrecio('');
    setNewStockOficina('100');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-400" /> Control de Inventario Central y Sucursales
            </h2>
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
              {empresaConfig.nombreEmpresa}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Operador de inventario: <strong className="text-blue-300">{currentUser?.nombre_completo || 'Sin sesión'}</strong> ({currentUser?.cargo})
          </p>
        </div>

        {/* Global Valuation in USD and Bs. */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Valorización Activo Total:
            </span>
            <div className="flex items-baseline gap-1.5 font-mono">
              <span className="text-sm font-bold text-white">{formatUSD(totalValuationUSD)}</span>
              <span className="text-xs font-bold text-emerald-400">({formatBs(totalValuationUSD, empresaConfig.tasaCambio)})</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (!hasInventoryPermission()) {
                alert('Acceso restringido: Inicia sesión como personal de Inventario o Administrador para crear productos.');
                return;
              }
              setShowNewProdForm(!showNewProdForm);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {!hasInventoryPermission() && (
        <div className="bg-amber-950/60 border border-amber-500/40 p-4 rounded-xl text-amber-200 text-xs flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Modo Solo Lectura:</strong> El usuario actual ({currentUser?.nombre_completo || 'Cajero'}) no tiene permisos de modificación de inventario central. Para crear productos o transferir stock, inicia sesión con un usuario de <strong>Inventario</strong> o <strong>Administrador General</strong>.
          </div>
        </div>
      )}

      {/* New Product Form Modal/Panel */}
      {showNewProdForm && (
        <form onSubmit={handleCreateProduct} className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 space-y-4 animate-fade-in">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Registrar Nuevo Producto en Catálogo Maestro
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Código de Barras (EAN/UPC)</label>
              <input
                type="text"
                required
                value={newCodigo}
                onChange={(e) => setNewCodigo(e.target.value)}
                placeholder="Ej: 7591002345"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Nombre del Producto</label>
              <input
                type="text"
                required
                value={newNombre}
                onChange={(e) => setNewNombre(e.target.value)}
                placeholder="Ej: Aceite de Oliva 500ml"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Precio Unitario ($ USD)</label>
              <input
                type="number"
                step="0.01"
                required
                value={newPrecio}
                onChange={(e) => setNewPrecio(e.target.value)}
                placeholder="Ej: 4.50"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono focus:border-emerald-500 focus:outline-none"
              />
              {parseFloat(newPrecio) > 0 && (
                <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                  Equivalente: {formatBs(parseFloat(newPrecio), empresaConfig.tasaCambio)}
                </span>
              )}
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Stock Inicial Bodega</label>
              <input
                type="number"
                required
                value={newStockOficina}
                onChange={(e) => setNewStockOficina(e.target.value)}
                placeholder="Ej: 200"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNewProdForm(false)}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
            >
              Guardar en PostgreSQL
            </button>
          </div>
        </form>
      )}

      {/* Stock Matrix Table Across All 3 Branches */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Matriz de Stock en Línea por Sucursal
            </h3>
            <p className="text-[11px] text-slate-500">
              Sincronizado atómicamente en PostgreSQL Supabase • Precios en USD ($) y Bolívares (Bs.)
            </p>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Tasa: 1$ = {formatBs(1, empresaConfig.tasaCambio)}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Producto</th>
                <th className="p-3">Precio USD / Bs.</th>
                <th className="p-3 text-center">{empresaConfig.nombreTienda1}</th>
                <th className="p-3 text-center">{empresaConfig.nombreTienda2}</th>
                <th className="p-3 text-center">{empresaConfig.nombreOficina}</th>
                <th className="p-3 text-right">Stock Global</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {productos.map((prod) => {
                const stockT1 = inventario.find((i) => i.sucursal_id === 1 && i.producto_id === prod.id)?.stock || 0;
                const stockT2 = inventario.find((i) => i.sucursal_id === 2 && i.producto_id === prod.id)?.stock || 0;
                const stockOf = inventario.find((i) => i.sucursal_id === 3 && i.producto_id === prod.id)?.stock || 0;
                const totalStock = stockT1 + stockT2 + stockOf;

                return (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono text-emerald-400 font-semibold">{prod.codigo_barras}</td>
                    <td className="p-3 font-bold text-white">{prod.nombre}</td>
                    <td className="p-3 font-mono">
                      <span className="text-white font-bold block">{formatUSD(prod.precio)}</span>
                      <span className="text-[11px] text-emerald-400">{formatBs(prod.precio, empresaConfig.tasaCambio)}</span>
                    </td>

                    {/* Tienda 1 Stock */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                        stockT1 < 20 ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {stockT1} un.
                      </span>
                    </td>

                    {/* Tienda 2 Stock */}
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                        stockT2 < 20 ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {stockT2} un.
                      </span>
                    </td>

                    {/* Oficina Central Stock */}
                    <td className="p-3 text-center">
                      <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {stockOf} un.
                      </span>
                    </td>

                    {/* Total */}
                    <td className="p-3 text-right font-mono font-extrabold text-white">
                      {totalStock} un.
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transfer Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">
            Transferencia de Mercadería entre Tiendas y Almacén
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Mueve existencias desde la Oficina Central a las Tiendas o entre sucursales de forma segura.
        </p>

        <form onSubmit={handleTransfer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Origen (Sale stock)</label>
            <select
              value={origenId}
              onChange={(e) => setOrigenId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Destino (Entra stock)</label>
            <select
              value={destinoId}
              onChange={(e) => setDestinoId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {sucursales.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Producto</label>
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} ({formatUSD(p.precio)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Cantidad a Mover</label>
            <input
              type="number"
              min="1"
              value={cantidadTransfer}
              onChange={(e) => setCantidadTransfer(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!hasInventoryPermission()}
              className={`w-full font-bold p-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                hasInventoryPermission()
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Autorizar Traspaso</span>
            </button>
          </div>
        </form>

        {transferMsg && (
          <div
            className={`text-xs p-3 rounded-xl flex items-center gap-2 ${
              transferMsg.type === 'success'
                ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300'
                : 'bg-rose-950/50 border border-rose-500/30 text-rose-300'
            }`}
          >
            {transferMsg.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{transferMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};
