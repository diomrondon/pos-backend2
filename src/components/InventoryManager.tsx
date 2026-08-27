import React, { useState, useMemo } from 'react';
import {
  Package,
  ArrowRightLeft,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Lock,
  DollarSign,
  Search,
  Percent,
  TrendingUp,
  Boxes,
  AlertTriangle,
  X,
} from 'lucide-react';
import { Sucursal, Producto, InventarioItem, Usuario, EmpresaConfig } from '../types';
import { formatUSD, formatBs } from '../lib/currency';

interface InventoryManagerProps {
  sucursales: Sucursal[];
  productos: Producto[];
  inventario: InventarioItem[];
  currentUser: Usuario | null;
  empresaConfig: EmpresaConfig;
  onTransferStock: (origenId: number, destinoId: number, productoId: number, cantidad: number) => boolean;
  onAddProduct: (codigoBarras: string, nombre: string, precio: number, costo: number, stockOficina: number, exentoIva?: boolean) => void;
  onUpdateProduct: (updated: Producto) => void;
  onDeleteProduct: (productId: number) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  sucursales,
  productos,
  inventario,
  currentUser,
  empresaConfig,
  onTransferStock,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [origenId, setOrigenId] = useState<number>(3); // Oficina central by default
  const [destinoId, setDestinoId] = useState<number>(1); // Tienda 1 by default
  const [selectedProdId, setSelectedProdId] = useState<number>(productos[0]?.id || 1);
  const [cantidadTransfer, setCantidadTransfer] = useState<number>(50);
  const [transferMsg, setTransferMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State: New Product
  const [showNewProdModal, setShowNewProdModal] = useState<boolean>(false);
  const [newCodigo, setNewCodigo] = useState<string>('');
  const [newNombre, setNewNombre] = useState<string>('');
  const [newCosto, setNewCosto] = useState<string>('');
  const [newPrecio, setNewPrecio] = useState<string>('');
  const [newStockOficina, setNewStockOficina] = useState<string>('100');
  const [newExentoIva, setNewExentoIva] = useState<boolean>(false);

  // Modal State: Edit Product
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editCodigo, setEditCodigo] = useState<string>('');
  const [editNombre, setEditNombre] = useState<string>('');
  const [editCosto, setEditCosto] = useState<string>('');
  const [editPrecio, setEditPrecio] = useState<string>('');
  const [editExentoIva, setEditExentoIva] = useState<boolean>(false);

  // Modal State: Delete Confirmation
  const [deletingProduct, setDeletingProduct] = useState<Producto | null>(null);

  const hasInventoryPermission = () => {
    if (!currentUser) return false;
    return (
      currentUser.rol === 'admin' ||
      currentUser.rol === 'inventario' ||
      !!currentUser.permisos?.inventario
    );
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return productos;
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.codigo_barras.toLowerCase().includes(term)
    );
  }, [productos, searchTerm]);

  // Inventory Totals Calculations
  const inventoryStats = useMemo(() => {
    let totalUnits = 0;
    let totalValuationCost = 0;
    let totalValuationSale = 0;

    productos.forEach((prod) => {
      const prodStock = inventario
        .filter((inv) => inv.producto_id === prod.id)
        .reduce((sum, inv) => sum + inv.stock, 0);

      const cost = prod.costo ?? +(prod.precio * 0.7).toFixed(2);
      totalUnits += prodStock;
      totalValuationCost += prodStock * cost;
      totalValuationSale += prodStock * prod.precio;
    });

    const expectedMarginUSD = totalValuationSale - totalValuationCost;
    const expectedMarginPct =
      totalValuationSale > 0
        ? (expectedMarginUSD / totalValuationSale) * 100
        : 0;

    return {
      totalItems: productos.length,
      totalUnits,
      totalValuationCost,
      totalValuationSale,
      expectedMarginUSD,
      expectedMarginPct,
    };
  }, [productos, inventario]);

  // Handle Transfer
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
      setTransferMsg({
        text: 'La sucursal de origen y destino deben ser distintas.',
        type: 'error',
      });
      return;
    }

    if (cantidadTransfer <= 0) {
      setTransferMsg({
        text: 'La cantidad a transferir debe ser mayor a 0.',
        type: 'error',
      });
      return;
    }

    const ok = onTransferStock(origenId, destinoId, selectedProdId, cantidadTransfer);
    if (ok) {
      const prod = productos.find((p) => p.id === selectedProdId);
      const orig = sucursales.find((s) => s.id === origenId);
      const dest = sucursales.find((s) => s.id === destinoId);
      setTransferMsg({
        text: `¡Transferencia exitosa de ${cantidadTransfer} un. de "${prod?.nombre}" desde ${orig?.nombre} a ${dest?.nombre}!`,
        type: 'success',
      });
    } else {
      setTransferMsg({
        text: 'Stock insuficiente en la sucursal de origen.',
        type: 'error',
      });
    }
  };

  // Handle Create Product
  const handleOpenCreateModal = () => {
    if (!hasInventoryPermission()) {
      alert('Acceso restringido: Se requieren permisos de Inventario o Administrador para crear productos.');
      return;
    }
    setNewCodigo('');
    setNewNombre('');
    setNewCosto('');
    setNewPrecio('');
    setNewStockOficina('100');
    setNewExentoIva(false);
    setShowNewProdModal(true);
  };

  const handleSaveNewProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo.trim() || !newNombre.trim()) {
      alert('Por favor ingrese código y nombre del producto.');
      return;
    }

    const precio = parseFloat(newPrecio);
    if (isNaN(precio) || precio <= 0) {
      alert('Por favor ingrese un precio de venta válido.');
      return;
    }

    let costo = parseFloat(newCosto);
    if (isNaN(costo) || costo < 0) {
      costo = +(precio * 0.7).toFixed(2);
    }

    const stockOficina = parseInt(newStockOficina) || 0;

    onAddProduct(newCodigo.trim(), newNombre.trim(), precio, costo, stockOficina, newExentoIva);
    setShowNewProdModal(false);
  };

  // Handle Edit Product
  const handleOpenEditModal = (product: Producto) => {
    if (!hasInventoryPermission()) {
      alert('Acceso restringido: Se requieren permisos de Inventario o Administrador para modificar artículos.');
      return;
    }
    setEditingProduct(product);
    setEditCodigo(product.codigo_barras);
    setEditNombre(product.nombre);
    setEditCosto(product.costo !== undefined ? product.costo.toString() : (product.precio * 0.7).toFixed(2));
    setEditPrecio(product.precio.toString());
    setEditExentoIva(!!product.exento_iva);
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (!editCodigo.trim() || !editNombre.trim()) {
      alert('Por favor ingrese código y nombre.');
      return;
    }

    const precio = parseFloat(editPrecio);
    if (isNaN(precio) || precio <= 0) {
      alert('Por favor ingrese un precio de venta válido.');
      return;
    }

    let costo = parseFloat(editCosto);
    if (isNaN(costo) || costo < 0) {
      costo = +(precio * 0.7).toFixed(2);
    }

    onUpdateProduct({
      ...editingProduct,
      codigo_barras: editCodigo.trim(),
      nombre: editNombre.trim(),
      precio,
      costo,
      exento_iva: editExentoIva,
    });

    setEditingProduct(null);
  };

  // Handle Delete Product
  const handleOpenDeleteModal = (product: Producto) => {
    if (!hasInventoryPermission()) {
      alert('Acceso restringido: Se requieren permisos de Inventario o Administrador para eliminar artículos.');
      return;
    }
    setDeletingProduct(product);
  };

  const handleConfirmDeleteProduct = () => {
    if (!deletingProduct) return;
    onDeleteProduct(deletingProduct.id);
    setDeletingProduct(null);
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
            Operador actual: <strong className="text-blue-300">{currentUser?.nombre_completo || 'Sin sesión'}</strong> ({currentUser?.cargo})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Artículo</span>
          </button>
        </div>
      </div>

      {!hasInventoryPermission() && (
        <div className="bg-amber-950/60 border border-amber-500/40 p-4 rounded-xl text-amber-200 text-xs flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Modo Consulta (Solo Lectura):</strong> El usuario actual ({currentUser?.nombre_completo || 'Cajero'}) no tiene permisos de modificación de inventario central. Para crear, editar o eliminar artículos, inicia sesión con un usuario de <strong>Inventario</strong> o <strong>Administrador</strong>.
          </div>
        </div>
      )}

      {/* Global Inventory Valuation Cards (Cost, Price, Profit Margin) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Catálogo Activo</span>
            <Boxes className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {inventoryStats.totalItems} <span className="text-xs font-normal text-slate-400">artículos</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            {inventoryStats.totalUnits.toLocaleString()} unidades en total
          </div>
        </div>

        {/* Cost Valuation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Valoración al Costo</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {formatUSD(inventoryStats.totalValuationCost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {formatBs(inventoryStats.totalValuationCost, empresaConfig.tasaCambio)}
          </div>
        </div>

        {/* Sale Valuation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Valoración al Precio Venta</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            {formatUSD(inventoryStats.totalValuationSale)}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-1 font-mono">
            {formatBs(inventoryStats.totalValuationSale, empresaConfig.tasaCambio)}
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">Margen Bruto Proyectado</span>
            <Percent className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-purple-300">
            {formatUSD(inventoryStats.expectedMarginUSD)}
          </div>
          <div className="text-[11px] text-purple-400 mt-1 font-mono font-bold">
            {inventoryStats.expectedMarginPct.toFixed(1)}% de rendimiento
          </div>
        </div>
      </div>

      {/* Stock Matrix Table Across All 3 Branches with Search, Cost, Price, Margin, Edit & Delete */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Fichas de Artículos y Matriz de Stock Multi-Sucursal
            </h3>
            <p className="text-[11px] text-slate-500">
              Control de Costo, Precio de Venta, Margen y Existencias en tiempo real
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-white pl-8 pr-3 py-1.5 rounded-xl focus:border-emerald-500 focus:outline-none w-56 sm:w-64"
              />
            </div>
            <span className="hidden md:inline text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Tasa: 1$ = {formatBs(1, empresaConfig.tasaCambio)}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Artículo / Descripción</th>
                <th className="p-3 text-center">Régimen IVA</th>
                <th className="p-3 text-right">Costo Unit.</th>
                <th className="p-3 text-right">Precio Venta</th>
                <th className="p-3 text-right">Margen</th>
                <th className="p-3 text-center">{empresaConfig.nombreTienda1}</th>
                <th className="p-3 text-center">{empresaConfig.nombreTienda2}</th>
                <th className="p-3 text-center">{empresaConfig.nombreOficina}</th>
                <th className="p-3 text-right">Stock Global</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-slate-500 text-xs">
                    No se encontraron artículos con el término de búsqueda "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => {
                  const stockT1 = inventario.find((i) => i.sucursal_id === 1 && i.producto_id === prod.id)?.stock || 0;
                  const stockT2 = inventario.find((i) => i.sucursal_id === 2 && i.producto_id === prod.id)?.stock || 0;
                  const stockOf = inventario.find((i) => i.sucursal_id === 3 && i.producto_id === prod.id)?.stock || 0;
                  const totalStock = stockT1 + stockT2 + stockOf;

                  const cost = prod.costo ?? +(prod.precio * 0.7).toFixed(2);
                  const marginUSD = prod.precio - cost;
                  const marginPct = prod.precio > 0 ? (marginUSD / prod.precio) * 100 : 0;
                  const isExento = !!prod.exento_iva;

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Código */}
                      <td className="p-3 font-mono text-emerald-400 font-semibold">{prod.codigo_barras}</td>

                      {/* Nombre */}
                      <td className="p-3 font-bold text-white">
                        <div>{prod.nombre}</div>
                        <div className="text-[10px] text-slate-500 font-normal">ID #{prod.id}</div>
                      </td>

                      {/* IVA / Exento */}
                      <td className="p-3 text-center">
                        {isExento ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            EXENTO (0%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            GRAVADO (16%)
                          </span>
                        )}
                      </td>

                      {/* Costo */}
                      <td className="p-3 text-right font-mono">
                        <span className="text-amber-400 font-bold block">{formatUSD(cost)}</span>
                        <span className="text-[10px] text-slate-500">{formatBs(cost, empresaConfig.tasaCambio)}</span>
                      </td>

                      {/* Precio */}
                      <td className="p-3 text-right font-mono">
                        <span className="text-white font-bold block">{formatUSD(prod.precio)}</span>
                        <span className="text-[10px] text-emerald-400">{formatBs(prod.precio, empresaConfig.tasaCambio)}</span>
                      </td>

                      {/* Margen */}
                      <td className="p-3 text-right font-mono">
                        <span className="text-purple-300 font-bold block">{marginPct.toFixed(1)}%</span>
                        <span className="text-[10px] text-slate-400">+{formatUSD(marginUSD)}</span>
                      </td>

                      {/* Tienda 1 Stock */}
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                            stockT1 < 20
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {stockT1}
                        </span>
                      </td>

                      {/* Tienda 2 Stock */}
                      <td className="p-3 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold ${
                            stockT2 < 20
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {stockT2}
                        </span>
                      </td>

                      {/* Oficina Central Stock */}
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                          {stockOf}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="p-3 text-right font-mono font-extrabold text-white">
                        <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {totalStock} un.
                        </span>
                      </td>

                      {/* Acciones: Editar y Eliminar */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            title="Editar artículo y costos"
                            className="p-1.5 bg-slate-800 hover:bg-sky-600 hover:text-white text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(prod)}
                            title="Eliminar artículo del catálogo"
                            className="p-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
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

      {/* ================= MODAL: NUEVO ARTÍCULO ================= */}
      {showNewProdModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-400" />
                <span>Registrar Nuevo Artículo en Catálogo</span>
              </h3>
              <button
                onClick={() => setShowNewProdModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Código de Barras / SKU *</label>
                  <input
                    type="text"
                    required
                    value={newCodigo}
                    onChange={(e) => setNewCodigo(e.target.value)}
                    placeholder="Ej: 7591009123"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre / Descripción *</label>
                  <input
                    type="text"
                    required
                    value={newNombre}
                    onChange={(e) => setNewNombre(e.target.value)}
                    placeholder="Ej: Leche Completa 1L"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Costo and Precio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-amber-400 mb-1 font-semibold">Costo Unitario ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newCosto}
                    onChange={(e) => setNewCosto(e.target.value)}
                    placeholder="Ej: 1.50"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                  {parseFloat(newCosto) > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      En Bs: {formatBs(parseFloat(newCosto), empresaConfig.tasaCambio)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-emerald-400 mb-1 font-semibold">Precio de Venta ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newPrecio}
                    onChange={(e) => setNewPrecio(e.target.value)}
                    placeholder="Ej: 2.30"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  {parseFloat(newPrecio) > 0 && (
                    <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                      En Bs: {formatBs(parseFloat(newPrecio), empresaConfig.tasaCambio)}
                    </span>
                  )}
                </div>
              </div>

              {/* Live Margin Calculation */}
              {parseFloat(newPrecio) > 0 && parseFloat(newCosto) > 0 && (
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300">Margen estimado:</span>
                  <div className="text-right">
                    <span className="font-bold text-white">
                      +{formatUSD(parseFloat(newPrecio) - parseFloat(newCosto))}
                    </span>{' '}
                    <span className="text-purple-400 font-bold">
                      ({(((parseFloat(newPrecio) - parseFloat(newCosto)) / parseFloat(newPrecio)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Régimen IVA Selection */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <label className="block text-slate-300 font-semibold text-xs mb-1 flex items-center justify-between">
                  <span>Tratamiento Tributario / IVA</span>
                  {newExentoIva ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold">
                      EXENTO (0% IVA)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                      GRAVADO (16% IVA)
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer" onClick={() => setNewExentoIva(!newExentoIva)}>
                  <input
                    type="checkbox"
                    id="new-exento-checkbox"
                    checked={newExentoIva}
                    onChange={(e) => setNewExentoIva(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="new-exento-checkbox" className="text-xs text-slate-300 cursor-pointer select-none">
                    <span className="font-bold text-white block">Artículo Exento de IVA (Tasa 0%)</span>
                    <span className="text-[11px] text-slate-400">Marque esta casilla si el artículo pertenece a la canasta básica o está libre de IVA por normativa. Si se desmarca, se cobrará el 16% de IVA al facturar.</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Stock Inicial en Bodega Central</label>
                <input
                  type="number"
                  min="0"
                  value={newStockOficina}
                  onChange={(e) => setNewStockOficina(e.target.value)}
                  placeholder="100"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewProdModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  Guardar Artículo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITAR ARTÍCULO ================= */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-sky-400" />
                <span>Editar Ficha de Artículo (ID #{editingProduct.id})</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Código de Barras / SKU *</label>
                  <input
                    type="text"
                    required
                    value={editCodigo}
                    onChange={(e) => setEditCodigo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nombre / Descripción *</label>
                  <input
                    type="text"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Costo and Precio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-amber-400 mb-1 font-semibold">Costo Unitario ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editCosto}
                    onChange={(e) => setEditCosto(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                  {parseFloat(editCosto) > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">
                      En Bs: {formatBs(parseFloat(editCosto), empresaConfig.tasaCambio)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-emerald-400 mb-1 font-semibold">Precio de Venta ($ USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  />
                  {parseFloat(editPrecio) > 0 && (
                    <span className="text-[10px] text-emerald-400 font-mono block mt-1">
                      En Bs: {formatBs(parseFloat(editPrecio), empresaConfig.tasaCambio)}
                    </span>
                  )}
                </div>
              </div>

              {/* Live Margin Calculation */}
              {parseFloat(editPrecio) > 0 && parseFloat(editCosto) > 0 && (
                <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-3 flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-300">Margen actualizado:</span>
                  <div className="text-right">
                    <span className="font-bold text-white">
                      +{formatUSD(parseFloat(editPrecio) - parseFloat(editCosto))}
                    </span>{' '}
                    <span className="text-purple-400 font-bold">
                      ({(((parseFloat(editPrecio) - parseFloat(editCosto)) / parseFloat(editPrecio)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Régimen IVA Selection */}
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <label className="block text-slate-300 font-semibold text-xs mb-1 flex items-center justify-between">
                  <span>Tratamiento Tributario / IVA</span>
                  {editExentoIva ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded font-bold">
                      EXENTO (0% IVA)
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                      GRAVADO (16% IVA)
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer" onClick={() => setEditExentoIva(!editExentoIva)}>
                  <input
                    type="checkbox"
                    id="edit-exento-checkbox"
                    checked={editExentoIva}
                    onChange={(e) => setEditExentoIva(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 bg-slate-950 border-slate-700 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="edit-exento-checkbox" className="text-xs text-slate-300 cursor-pointer select-none">
                    <span className="font-bold text-white block">Artículo Exento de IVA (Tasa 0%)</span>
                    <span className="text-[11px] text-slate-400">Marque esta casilla si el artículo pertenece a la canasta básica o está libre de IVA por normativa. Si se desmarca, se cobrará el 16% de IVA al facturar.</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-sky-500/20"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRMAR ELIMINACIÓN ================= */}
      {deletingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 bg-rose-950/80 rounded-xl border border-rose-500/30">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">¿Eliminar artículo del catálogo?</h3>
                <p className="text-xs text-slate-400">Esta acción removerá el producto y sus existencias.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Artículo:</span>
                <strong className="text-white">{deletingProduct.nombre}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Código / SKU:</span>
                <span className="font-mono text-emerald-400">{deletingProduct.codigo_barras}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Costo / Precio:</span>
                <span className="font-mono text-slate-300">
                  {formatUSD(deletingProduct.costo ?? +(deletingProduct.precio * 0.7).toFixed(2))} / {formatUSD(deletingProduct.precio)}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800">
                <span className="text-slate-400">Stock total registrado:</span>
                <strong className="text-amber-400 font-mono">
                  {inventario
                    .filter((i) => i.producto_id === deletingProduct.id)
                    .reduce((s, i) => s + i.stock, 0)}{' '}
                  unidades
                </strong>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-rose-600/30"
              >
                Sí, Eliminar Artículo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
