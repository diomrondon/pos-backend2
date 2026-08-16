import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Truck,
  Building2,
  Calendar,
  DollarSign,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  FileText,
  Search,
} from 'lucide-react';
import { Compra, Proveedor, Producto, Sucursal, EmpresaConfig, Usuario } from '../types';
import { formatUSD, formatBs, formatDual } from '../lib/currency';

interface ComprasManagerProps {
  compras: Compra[];
  proveedores: Proveedor[];
  productos: Producto[];
  sucursales: Sucursal[];
  empresaConfig: EmpresaConfig;
  currentUser: Usuario | null;
  onRegistrarCompra: (compra: Omit<Compra, 'id'>) => void;
}

export const ComprasManager: React.FC<ComprasManagerProps> = ({
  compras,
  proveedores,
  productos,
  sucursales,
  empresaConfig,
  currentUser,
  onRegistrarCompra,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // New Purchase Form State
  const [proveedorId, setProveedorId] = useState<number>(proveedores[0]?.id || 1);
  const [sucursalDestinoId, setSucursalDestinoId] = useState<number>(3); // Default to Central Warehouse
  const [numeroFactura, setNumeroFactura] = useState('');
  const [itemsCompra, setItemsCompra] = useState<
    { productoId: number; productoNombre: string; cantidad: number; costoUnitario: number; subtotal: number }[]
  >([]);

  // Item selector in form
  const [selectedProdId, setSelectedProdId] = useState<number>(productos[0]?.id || 1);
  const [cantidadInput, setCantidadInput] = useState<number>(10);
  const [costoInput, setCostoInput] = useState<number>(1.5);

  const handleAddItem = () => {
    const prod = productos.find((p) => p.id === selectedProdId);
    if (!prod) return;

    if (cantidadInput <= 0 || costoInput <= 0) {
      alert('Ingresa una cantidad y costo unitario válidos.');
      return;
    }

    const subtotal = cantidadInput * costoInput;
    const existingIndex = itemsCompra.findIndex((i) => i.productoId === prod.id);

    if (existingIndex >= 0) {
      const updated = [...itemsCompra];
      updated[existingIndex].cantidad += cantidadInput;
      updated[existingIndex].costoUnitario = costoInput;
      updated[existingIndex].subtotal = updated[existingIndex].cantidad * costoInput;
      setItemsCompra(updated);
    } else {
      setItemsCompra([
        ...itemsCompra,
        {
          productoId: prod.id,
          productoNombre: prod.nombre,
          cantidad: cantidadInput,
          costoUnitario: costoInput,
          subtotal,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItemsCompra(itemsCompra.filter((_, i) => i !== index));
  };

  const totalCompra = itemsCompra.reduce((acc, item) => acc + item.subtotal, 0);

  const handleSubmitCompra = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemsCompra.length === 0) {
      alert('Debes agregar al menos un producto a la orden de compra.');
      return;
    }

    const prov = proveedores.find((p) => p.id === proveedorId);

    onRegistrarCompra({
      proveedorId,
      proveedorNombre: prov ? prov.nombre : 'Proveedor General',
      sucursalId: sucursalDestinoId,
      numeroFactura: numeroFactura.trim() || `FAC-${Date.now().toString().slice(-6)}`,
      fecha: new Date().toISOString(),
      total: totalCompra,
      estado: 'completada',
      usuarioNombre: currentUser?.nombre_completo || 'Administrador',
      detalles: itemsCompra,
    });

    setShowNewModal(false);
    setItemsCompra([]);
    setNumeroFactura('');
  };

  const filteredCompras = compras.filter(
    (c) =>
      c.proveedorNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.numeroFactura?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.usuarioNombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-400" /> Gestión de Compras y Recepción de Mercancía
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Registra órdenes de compra, abastece almacenes y actualiza costos en tiempo real con conversión dual.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Compra a Proveedor</span>
        </button>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Total Compras Registradas</span>
          <div className="text-xl font-bold text-white font-mono mt-1">
            {formatUSD(compras.reduce((acc, c) => acc + c.total, 0))}
          </div>
          <span className="text-xs text-emerald-400 font-mono block mt-0.5">
            {formatBs(compras.reduce((acc, c) => acc + c.total, 0), empresaConfig.tasaCambio)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Órdenes Realizadas</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{compras.length} órdenes</div>
          <span className="text-xs text-slate-500 block mt-0.5">Ingresadas al inventario central</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Proveedores Activos</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{proveedores.length} empresas</div>
          <span className="text-xs text-emerald-400 block mt-0.5">Catálogo de suministros verificado</span>
        </div>
      </div>

      {/* Search & Purchases Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por proveedor, factura o encargado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th className="py-3 px-3">ID / Factura</th>
                <th className="py-3 px-3">Proveedor</th>
                <th className="py-3 px-3">Destino</th>
                <th className="py-3 px-3">Fecha</th>
                <th className="py-3 px-3">Ítems</th>
                <th className="py-3 px-3 text-right">Total ($ / Bs.)</th>
                <th className="py-3 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCompras.map((compra) => {
                const sucursal = sucursales.find((s) => s.id === compra.sucursalId);
                const totalUnits = compra.detalles.reduce((acc, d) => acc + d.cantidad, 0);

                return (
                  <tr key={compra.id} className="hover:bg-slate-800/40 text-slate-200 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold">
                      <div className="text-white">#{compra.id}</div>
                      <div className="text-[10px] text-slate-400">{compra.numeroFactura || 'S/N'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{compra.proveedorNombre}</div>
                      <div className="text-[10px] text-slate-400">Por: {compra.usuarioNombre || 'Admin'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[11px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {sucursal?.nombre || `Sucursal ${compra.sucursalId}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {new Date(compra.fecha).toLocaleDateString('es-VE')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono bg-slate-800 text-emerald-400 px-2 py-0.5 rounded text-[11px]">
                        {totalUnits} uds ({compra.detalles.length} prod)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <div className="text-emerald-400">{formatUSD(compra.total)}</div>
                      <div className="text-[10px] text-slate-400">{formatBs(compra.total, empresaConfig.tasaCambio)}</div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Completada
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" /> Registrar Nueva Compra de Mercancía
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <form onSubmit={handleSubmitCompra} className="p-5 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Proveedor</label>
                  <select
                    value={proveedorId}
                    onChange={(e) => setProveedorId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    {proveedores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.rif})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Sucursal Destino</label>
                  <select
                    value={sucursalDestinoId}
                    onChange={(e) => setSucursalDestinoId(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  >
                    {sucursales.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Nº Factura / Control</label>
                  <input
                    type="text"
                    placeholder="FAC-00129"
                    value={numeroFactura}
                    onChange={(e) => setNumeroFactura(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Add item bar */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 block">Agregar Productos a la Orden</span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <label className="text-[10px] text-slate-400 block">Producto</label>
                    <select
                      value={selectedProdId}
                      onChange={(e) => setSelectedProdId(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg"
                    >
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} (PVP: ${p.precio.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={cantidadInput}
                      onChange={(e) => setCantidadInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="text-[10px] text-slate-400 block">Costo Unitario ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min={0.01}
                      value={costoInput}
                      onChange={(e) => setCostoInput(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-2 py-1.5 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold px-3 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer border border-emerald-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Ítem
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 block">Ítems en la Orden ({itemsCompra.length})</span>
                {itemsCompra.length === 0 ? (
                  <div className="p-4 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                    No has agregado ningún producto todavía.
                  </div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {itemsCompra.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white">{item.productoNombre}</div>
                          <div className="text-[10px] text-slate-400">
                            {item.cantidad} uds × ${item.costoUnitario.toFixed(2)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-emerald-400">${item.subtotal.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-400 hover:text-rose-300 text-xs cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Total de la Compra</span>
                  <span className="text-xs text-slate-500">Stock se incrementará de inmediato</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold font-mono text-emerald-400">{formatUSD(totalCompra)}</div>
                  <div className="text-xs text-slate-400 font-mono">
                    {formatBs(totalCompra, empresaConfig.tasaCambio)}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={itemsCompra.length === 0}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Procesar e Ingresar a Inventario</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
