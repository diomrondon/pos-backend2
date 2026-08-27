import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { AuthHeader } from './components/AuthHeader';
import { PosSimulator } from './components/PosSimulator';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { PdfReportsCenter } from './components/PdfReportsCenter';
import { DailyRateModal } from './components/DailyRateModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { ComprasManager } from './components/ComprasManager';
import { InventoryManager } from './components/InventoryManager';
import { ClientesManager } from './components/ClientesManager';
import { ProveedoresManager } from './components/ProveedoresManager';
import { CxcManager } from './components/CxcManager';
import { CxpManager } from './components/CxpManager';
import { ConfiguracionView } from './components/ConfiguracionView';

import {
  INITIAL_SUCURSALES,
  INITIAL_PRODUCTOS,
  INITIAL_INVENTARIO,
  INITIAL_VENTAS,
  INITIAL_USUARIOS,
  INITIAL_CLIENTES,
  INITIAL_PROVEEDORES,
  INITIAL_COMPRAS,
  INITIAL_CXC,
  INITIAL_CXP,
} from './data/mockData';
import {
  Sucursal,
  Producto,
  InventarioItem,
  Venta,
  Usuario,
  EmpresaConfig,
  Cliente,
  Proveedor,
  Compra,
  CuentaPorCobrar,
  CuentaPorPagar,
  DetallePagoVenta,
} from './types';
import { getStoredSupabaseConfig, createCustomSupabaseClient } from './lib/supabaseClient';
import { getStoredEmpresaConfig, saveEmpresaConfig, hasSetTasaToday, markTasaSetToday, formatUSD, formatBs } from './lib/currency';
import { ShieldAlert, Lock, ShoppingCart, RefreshCw, Download, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { StandaloneHtmlDownloader } from './components/StandaloneHtmlDownloader';
import { downloadStandaloneHtmlFile } from './lib/downloadHtml';

export default function App() {
  // Navigation State (starts in 'ventas' or 'dashboard' if admin)
  const [activeTab, setActiveTab] = useState<SidebarTab>('ventas');
  // Sidebar Collapse State (starts collapsed on small laptop/tablet screens)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // App State: Users
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(INITIAL_USUARIOS[0]); // Ana Morales

  // Company and Fiscal Settings + Daily Rate
  const [empresaConfig, setEmpresaConfig] = useState<EmpresaConfig>(getStoredEmpresaConfig);
  const [showDailyRateModal, setShowDailyRateModal] = useState<boolean>(false);
  const [showCompanySettingsModal, setShowCompanySettingsModal] = useState<boolean>(false);
  const [showHtmlModal, setShowHtmlModal] = useState<boolean>(false);

  // Business Entities State
  const [sucursales, setSucursales] = useState<Sucursal[]>(() => [
    { id: 1, nombre: empresaConfig.nombreTienda1, tipo: 'tienda' },
    { id: 2, nombre: empresaConfig.nombreTienda2, tipo: 'tienda' },
    { id: 3, nombre: empresaConfig.nombreOficina, tipo: 'oficina' },
  ]);
  const [productos, setProductos] = useState<Producto[]>(INITIAL_PRODUCTOS);
  const [inventario, setInventario] = useState<InventarioItem[]>(INITIAL_INVENTARIO);
  const [ventas, setVentas] = useState<Venta[]>(INITIAL_VENTAS);
  const [compras, setCompras] = useState<Compra[]>(INITIAL_COMPRAS);
  const [clientes, setClientes] = useState<Cliente[]>(INITIAL_CLIENTES);
  const [proveedores, setProveedores] = useState<Proveedor[]>(INITIAL_PROVEEDORES);
  const [cxcList, setCxcList] = useState<CuentaPorCobrar[]>(INITIAL_CXC);
  const [cxpList, setCxpList] = useState<CuentaPorPagar[]>(INITIAL_CXP);

  // Daily exchange rate check: prompt if not confirmed today
  useEffect(() => {
    if (!hasSetTasaToday()) {
      const timer = setTimeout(() => {
        setShowDailyRateModal(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // RBAC Enforcement: If user changes and current tab is not allowed, switch to 'ventas'
  useEffect(() => {
    if (!currentUser) return;
    const isGeneralManager = currentUser.rol === 'admin';
    if (isGeneralManager) return;

    const allowed = currentUser.permisos ? currentUser.permisos[activeTab] : activeTab === 'ventas';
    if (!allowed) {
      setActiveTab('ventas');
    }
  }, [currentUser]);

  // Handler: Update company & store configurations
  const handleSaveEmpresaConfig = (updated: EmpresaConfig) => {
    saveEmpresaConfig(updated);
    setEmpresaConfig(updated);
    setSucursales([
      { id: 1, nombre: updated.nombreTienda1, tipo: 'tienda' },
      { id: 2, nombre: updated.nombreTienda2, tipo: 'tienda' },
      { id: 3, nombre: updated.nombreOficina, tipo: 'oficina' },
    ]);
  };

  // Handler: Update daily exchange rate
  const handleSaveTasa = (nuevaTasa: number) => {
    const updated: EmpresaConfig = {
      ...empresaConfig,
      tasaCambio: nuevaTasa,
      fechaTasa: new Date().toLocaleDateString('es-VE'),
      ultimaActualizacionTasa: new Date().toISOString(),
    };
    saveEmpresaConfig(updated);
    markTasaSetToday();
    setEmpresaConfig(updated);
  };

  // Sync with real Supabase if credentials are provided
  const loadCloudData = async () => {
    const { url, anonKey } = getStoredSupabaseConfig();
    const client = createCustomSupabaseClient(url, anonKey);
    if (!client) return;

    try {
      const { data: sucs } = await client.from('sucursales').select('*');
      if (sucs && sucs.length > 0) {
        setSucursales(
          sucs.map((s: any) => ({
            id: s.id,
            nombre: s.nombre,
            tipo: s.id === 3 ? 'oficina' : 'tienda',
          }))
        );
      }

      const { data: prods } = await client.from('productos').select('*');
      if (prods && prods.length > 0) {
        setProductos(
          prods.map((p: any) => ({
            id: p.id,
            codigo_barras: p.codigo_barras,
            nombre: p.nombre,
            precio: parseFloat(p.precio),
          }))
        );
      }

      const { data: inv } = await client.from('inventario').select('*');
      if (inv && inv.length > 0) {
        setInventario(inv);
      }
    } catch (e) {
      console.warn('Could not fetch Supabase data directly (check RLS or keys):', e);
    }
  };

  useEffect(() => {
    loadCloudData();
  }, []);

  // Calculate totals
  const totalSalesToday = ventas.reduce((acc, v) => acc + v.total, 0);
  const unitsToday = ventas.reduce((acc, v) => {
    return acc + v.detalles.reduce((dAcc, d) => dAcc + d.cantidad, 0);
  }, 0);

  // Handler: Register a new sale from POS with Cashier Audit, Customer and Payment breakdown
  const handleRegistrarVenta = async (
    sucursalId: number,
    items: { producto: Producto; cantidad: number }[],
    cliente: { id: number | null; nombre: string; rif: string },
    pagoDetalle: DetallePagoVenta
  ) => {
    const subtotalNeto = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    const baseImponible = items
      .filter((i) => !i.producto.exento_iva)
      .reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    const montoExento = items
      .filter((i) => !!i.producto.exento_iva)
      .reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    const montoIva = +(baseImponible * 0.16).toFixed(2);
    const totalVenta = +(baseImponible + montoIva + montoExento).toFixed(2);
    const newVentaId = ventas.length + 1;

    const detalles = items.map((item, index) => {
      const isExento = !!item.producto.exento_iva;
      const subtotalItem = +(item.producto.precio * item.cantidad).toFixed(2);
      const ivaItem = isExento ? 0 : +(subtotalItem * 0.16).toFixed(2);

      return {
        id: newVentaId * 100 + index,
        venta_id: newVentaId,
        producto_id: item.producto.id,
        producto_nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio,
        subtotal: subtotalItem,
        exento_iva: isExento,
        monto_iva: ivaItem,
      };
    });

    const nuevaVenta: Venta = {
      id: newVentaId,
      sucursal_id: sucursalId,
      usuario_id: currentUser ? currentUser.id : undefined,
      usuario_nombre: currentUser ? currentUser.nombre_completo : 'Cajero Anónimo',
      cliente_id: cliente.id,
      cliente_nombre: cliente.nombre,
      cliente_rif: cliente.rif,
      fecha: new Date().toISOString(),
      subtotal_neto: subtotalNeto,
      base_imponible: baseImponible,
      monto_exento: montoExento,
      monto_iva: montoIva,
      total: totalVenta,
      metodo_pago: pagoDetalle.metodo,
      referencia_pago: pagoDetalle.referencia_pago_movil,
      pago_detalle: pagoDetalle,
      detalles,
    };

    // Update sales history locally
    setVentas([nuevaVenta, ...ventas]);

    // Deduct stock in inventario
    setInventario((prevInv) => {
      return prevInv.map((invItem) => {
        if (invItem.sucursal_id === sucursalId) {
          const soldItem = items.find((i) => i.producto.id === invItem.producto_id);
          if (soldItem) {
            return {
              ...invItem,
              stock: Math.max(0, invItem.stock - soldItem.cantidad),
            };
          }
        }
        return invItem;
      });
    });
  };

  // Handler: Register new purchase from supplier with itemized invoice lines & catalog sync
  const handleRegistrarCompra = (compraData: Omit<Compra, 'id'>, newCatalogProducts?: Producto[]) => {
    const newId = compras.length + 1;
    const newCompra: Compra = {
      ...compraData,
      id: newId,
    };

    setCompras([newCompra, ...compras]);

    // Update or add products in catalog with new cost, selling price (PVP), unit of measure
    setProductos((prevProds) => {
      let nextProds = [...prevProds];

      // Add any newly registered products from invoice lines
      if (newCatalogProducts && newCatalogProducts.length > 0) {
        newCatalogProducts.forEach((np) => {
          if (!nextProds.some((p) => p.id === np.id || (p.codigo_barras && p.codigo_barras === np.codigo_barras))) {
            nextProds.push(np);
          }
        });
      }

      // Update costs and PVPs for items in this purchase
      nextProds = nextProds.map((prod) => {
        const boughtItem = compraData.detalles.find((d) => d.productoId === prod.id || (d.codigo_barras && d.codigo_barras === prod.codigo_barras));
        if (boughtItem) {
          return {
            ...prod,
            costo: boughtItem.costoUnitario,
            precio: (boughtItem.precioVenta && boughtItem.precioVenta > 0) ? boughtItem.precioVenta : prod.precio,
            unidad_medida: boughtItem.unidad_medida || prod.unidad_medida || 'UND',
            exento_iva: boughtItem.exentoIva !== undefined ? boughtItem.exentoIva : prod.exento_iva,
          };
        }
        return prod;
      });

      return nextProds;
    });

    // Increment inventory in destination branch (or create inventory row if missing)
    setInventario((prevInv) => {
      let nextInv = [...prevInv];

      compraData.detalles.forEach((boughtItem) => {
        const existingIdx = nextInv.findIndex(
          (i) => i.sucursal_id === compraData.sucursalId && i.producto_id === boughtItem.productoId
        );

        if (existingIdx >= 0) {
          const curStock = nextInv[existingIdx].stock || 0;
          nextInv[existingIdx] = {
            ...nextInv[existingIdx],
            stock: +(curStock + boughtItem.cantidad).toFixed(3),
          };
        } else {
          const newInvId = Math.max(...nextInv.map((i) => i.id), 0) + 1;
          nextInv.push({
            id: newInvId,
            sucursal_id: compraData.sucursalId,
            producto_id: boughtItem.productoId,
            stock: +boughtItem.cantidad.toFixed(3),
          });
        }
      });

      return nextInv;
    });

    // Create automatic CxP if desired
    const prov = proveedores.find((p) => p.id === compraData.proveedorId);
    if (prov) {
      const newCxp: CuentaPorPagar = {
        id: cxpList.length + 1,
        proveedorId: prov.id,
        proveedorNombre: prov.nombre,
        compraId: newId,
        numeroFactura: compraData.numeroFactura || `FAC-${newId}`,
        fechaEmision: compraData.fecha,
        fechaVencimiento: compraData.fechaVencimiento || new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
        montoTotal: compraData.total,
        saldoRestante: compraData.total,
        estado: 'pendiente',
        pagos: [],
      };
      setCxpList([newCxp, ...cxpList]);

      // Update provider balance
      setProveedores((prev) =>
        prev.map((p) => (p.id === prov.id ? { ...p, saldoPendiente: +(p.saldoPendiente + compraData.total).toFixed(2) } : p))
      );
    }
  };

  // Handler: Transfer Stock between branches
  const handleTransferStock = (
    origenId: number,
    destinoId: number,
    productoId: number,
    cantidad: number
  ): boolean => {
    const origenItem = inventario.find(
      (i) => i.sucursal_id === origenId && i.producto_id === productoId
    );
    if (!origenItem || origenItem.stock < cantidad) {
      return false;
    }

    setInventario((prev) => {
      // Deduct from origen
      let next = prev.map((item) => {
        if (item.sucursal_id === origenId && item.producto_id === productoId) {
          return { ...item, stock: item.stock - cantidad };
        }
        return item;
      });

      // Add to destino (or create if not existing)
      const destExists = next.some(
        (item) => item.sucursal_id === destinoId && item.producto_id === productoId
      );

      if (destExists) {
        next = next.map((item) => {
          if (item.sucursal_id === destinoId && item.producto_id === productoId) {
            return { ...item, stock: item.stock + cantidad };
          }
          return item;
        });
      } else {
        const newInvId = Math.max(...next.map((i) => i.id), 0) + 1;
        next.push({
          id: newInvId,
          sucursal_id: destinoId,
          producto_id: productoId,
          stock: cantidad,
        });
      }

      return next;
    });

    return true;
  };

  // Handler: Add new product to global catalog
  const handleAddProduct = (
    codigoBarras: string,
    nombre: string,
    precio: number,
    costo: number,
    stockOficina: number
  ) => {
    const newProdId = Math.max(...productos.map((p) => p.id), 0) + 1;
    const newProd: Producto = {
      id: newProdId,
      codigo_barras: codigoBarras,
      nombre,
      precio,
      costo: +(costo || +(precio * 0.7).toFixed(2)),
    };
    setProductos((prev) => [...prev, newProd]);

    // Initialize stock for the new product across 3 branches
    setInventario((prev) => [
      ...prev,
      { id: Math.max(...prev.map((i) => i.id), 0) + 1, sucursal_id: 1, producto_id: newProdId, stock: 0 },
      { id: Math.max(...prev.map((i) => i.id), 0) + 2, sucursal_id: 2, producto_id: newProdId, stock: 0 },
      { id: Math.max(...prev.map((i) => i.id), 0) + 3, sucursal_id: 3, producto_id: newProdId, stock: stockOficina },
    ]);
  };

  // Handler: Update product
  const handleUpdateProduct = (updated: Producto) => {
    setProductos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Handler: Delete product
  const handleDeleteProduct = (productId: number) => {
    setProductos((prev) => prev.filter((p) => p.id !== productId));
    setInventario((prev) => prev.filter((i) => i.producto_id !== productId));
  };

  // Handler: Add Client
  const handleAddCliente = (newCliente: Omit<Cliente, 'id'>) => {
    const id = Date.now();
    setClientes([...clientes, { ...newCliente, id }]);
  };

  // Handler: Update Client
  const handleUpdateCliente = (updated: Cliente) => {
    setClientes(clientes.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Handler: Delete Client
  const handleDeleteCliente = (id: number) => {
    const client = clientes.find((c) => c.id === id);
    if (client && client.saldoPendiente > 0) {
      alert(`No se puede eliminar el cliente "${client.nombre}" porque tiene un saldo deudor pendiente de $${client.saldoPendiente.toFixed(2)}.`);
      return false;
    }
    setClientes((prev) => prev.filter((c) => c.id !== id));
    return true;
  };

  // Handler: Add Supplier
  const handleAddProveedor = (newProv: Omit<Proveedor, 'id'>) => {
    const id = Date.now();
    setProveedores([...proveedores, { ...newProv, id }]);
  };

  // Handler: Update Supplier
  const handleUpdateProveedor = (updated: Proveedor) => {
    setProveedores(proveedores.map((p) => (p.id === updated.id ? updated : p)));
  };

  // Handler: Delete Supplier
  const handleDeleteProveedor = (id: number) => {
    const prov = proveedores.find((p) => p.id === id);
    if (prov && prov.saldoPendiente > 0) {
      alert(`No se puede eliminar el proveedor "${prov.nombre}" porque tiene un saldo deudor pendiente de $${prov.saldoPendiente.toFixed(2)}.`);
      return false;
    }
    setProveedores((prev) => prev.filter((p) => p.id !== id));
    return true;
  };

  // Handler: Register CxC Abono (payment from client)
  const handleRegistrarAbonoCxc = (cxcId: number, monto: number, metodo: string, referencia?: string) => {
    setCxcList((prev) =>
      prev.map((item) => {
        if (item.id === cxcId) {
          const nuevoSaldo = Math.max(0, item.saldoRestante - monto);
          const nuevoEstado = nuevoSaldo === 0 ? 'pagada' : 'parcial';
          const newAbono = {
            id: item.abonos.length + 1,
            fecha: new Date().toISOString(),
            monto,
            metodoPago: metodo,
            referencia,
            usuarioNombre: currentUser?.nombre_completo || 'Cajero',
          };
          return {
            ...item,
            saldoRestante: nuevoSaldo,
            estado: nuevoEstado,
            abonos: [...item.abonos, newAbono],
          };
        }
        return item;
      })
    );

    // Update client balance
    const targetCxc = cxcList.find((c) => c.id === cxcId);
    if (targetCxc) {
      setClientes((prev) =>
        prev.map((cl) =>
          cl.id === targetCxc.clienteId
            ? { ...cl, saldoPendiente: Math.max(0, cl.saldoPendiente - monto) }
            : cl
        )
      );
    }
  };

  // Handler: New CxC
  const handleNuevaCxc = (cxcData: Omit<CuentaPorCobrar, 'id' | 'abonos'>) => {
    const newId = cxcList.length + 1;
    const newCxc: CuentaPorCobrar = {
      ...cxcData,
      id: newId,
      abonos: [],
    };
    setCxcList([newCxc, ...cxcList]);
    setClientes((prev) =>
      prev.map((c) =>
        c.id === cxcData.clienteId ? { ...c, saldoPendiente: c.saldoPendiente + cxcData.montoTotal } : c
      )
    );
  };

  // Handler: Register CxP Pago (payment to supplier)
  const handleRegistrarPagoCxp = (cxpId: number, monto: number, metodo: string, referencia?: string) => {
    setCxpList((prev) =>
      prev.map((item) => {
        if (item.id === cxpId) {
          const nuevoSaldo = Math.max(0, item.saldoRestante - monto);
          const nuevoEstado = nuevoSaldo === 0 ? 'pagada' : 'parcial';
          const newPago = {
            id: item.pagos.length + 1,
            fecha: new Date().toISOString(),
            monto,
            metodoPago: metodo,
            referencia,
            usuarioNombre: currentUser?.nombre_completo || 'Administrador',
          };
          return {
            ...item,
            saldoRestante: nuevoSaldo,
            estado: nuevoEstado,
            pagos: [...item.pagos, newPago],
          };
        }
        return item;
      })
    );

    // Update supplier balance
    const targetCxp = cxpList.find((c) => c.id === cxpId);
    if (targetCxp) {
      setProveedores((prev) =>
        prev.map((pr) =>
          pr.id === targetCxp.proveedorId
            ? { ...pr, saldoPendiente: Math.max(0, pr.saldoPendiente - monto) }
            : pr
        )
      );
    }
  };

  // Handler: New CxP
  const handleNuevaCxp = (cxpData: Omit<CuentaPorPagar, 'id' | 'pagos'>) => {
    const newId = cxpList.length + 1;
    const newCxp: CuentaPorPagar = {
      ...cxpData,
      id: newId,
      pagos: [],
    };
    setCxpList([newCxp, ...cxpList]);
    setProveedores((prev) =>
      prev.map((p) =>
        p.id === cxpData.proveedorId ? { ...p, saldoPendiente: p.saldoPendiente + cxpData.montoTotal } : p
      )
    );
  };

  // Access check for activeTab
  const isGeneralManager = currentUser?.rol === 'admin';
  const hasAccessToActiveTab =
    isGeneralManager ||
    (currentUser?.permisos ? currentUser.permisos[activeTab] : activeTab === 'ventas');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Auth / User Selector Bar */}
      <AuthHeader
        currentUser={currentUser}
        usuarios={usuarios}
        sucursales={sucursales}
        onSelectUser={(u) => setCurrentUser(u)}
        onLogout={() => setCurrentUser(null)}
        onOpenHtmlModal={() => setShowHtmlModal(true)}
      />

      {/* Main Layout with Left Sidebar */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarCollapsed(true); // Automatically collapse sidebar to the left upon choosing a module
          }}
          currentUser={currentUser}
          empresaConfig={empresaConfig}
          onOpenRateModal={() => setShowDailyRateModal(true)}
          onLogout={() => setCurrentUser(null)}
          onOpenHtmlModal={() => setShowHtmlModal(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Top Quick Metrics & Status Banner */}
          <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Toggle Sidebar Button in Top Bar */}
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                className="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors cursor-pointer flex items-center gap-1.5 text-xs shadow-sm"
                title={isSidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral hacia la izquierda'}
              >
                {isSidebarCollapsed ? (
                  <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
                ) : (
                  <PanelLeftClose className="w-4 h-4 text-slate-400" />
                )}
                <span className="hidden md:inline font-medium text-[11px]">
                  {isSidebarCollapsed ? 'Expandir Menú' : 'Colapsar Menú'}
                </span>
              </button>

              <span className="text-xs font-semibold text-slate-300 truncate">
                {empresaConfig.nombreEmpresa}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-xs text-emerald-400 font-mono font-medium hidden sm:inline">
                1 USD = {formatBs(1, empresaConfig.tasaCambio)}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-400">Ventas Hoy:</span>
                <span className="font-bold text-white">{formatUSD(totalSalesToday)}</span>
                <span className="text-[11px] text-emerald-400 hidden sm:inline">
                  ({formatBs(totalSalesToday, empresaConfig.tasaCambio)})
                </span>
              </div>

              {/* Standalone HTML download button directly in top banner (General Manager only) */}
              {isGeneralManager && (
                <button
                  type="button"
                  onClick={() =>
                    downloadStandaloneHtmlFile({
                      empresaConfig,
                      usuarios,
                      productos,
                      inventario,
                      ventas,
                      compras,
                      clientes,
                      proveedores,
                      cxc: cxcList,
                      cxp: cxpList,
                      sucursales,
                      currentUser,
                    })
                  }
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
                  title="Descargar pos_multisucursal.html (Acceso exclusivo Gerente General)"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                  <span className="hidden sm:inline">Descargar .HTML</span>
                </button>
              )}

              <button
                type="button"
                onClick={loadCloudData}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
                title="Sincronizar"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Module Content */}
          <main className="flex-1 p-4 sm:p-6 max-w-[1680px] mx-auto w-full">
            {!hasAccessToActiveTab ? (
              <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Módulo Restringido</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tu usuario (<strong>{currentUser?.nombre_completo}</strong>) solo cuenta con acceso autorizado para el módulo de <strong>Ventas</strong>.
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Solicita al Gerente General en el módulo de Configuración que te otorgue permisos adicionales si los requieres.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('ventas')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Ir al Punto de Venta (Ventas)</span>
                </button>
              </div>
            ) : (
              <>
                {/* 1. DASHBOARD */}
                {activeTab === 'dashboard' && (
                  <ExecutiveDashboard
                    sucursales={sucursales}
                    productos={productos}
                    inventario={inventario}
                    ventas={ventas}
                    usuarios={usuarios}
                    currentUser={currentUser}
                    empresaConfig={empresaConfig}
                    onOpenCompanySettings={() => setShowCompanySettingsModal(true)}
                  />
                )}

                {/* 2. VENTAS (POS) */}
                {activeTab === 'ventas' && (
                  <PosSimulator
                    sucursales={sucursales}
                    productos={productos}
                    inventario={inventario}
                    currentUser={currentUser}
                    empresaConfig={empresaConfig}
                    clientes={clientes}
                    onRegistrarVenta={handleRegistrarVenta}
                    onAddCliente={handleAddCliente}
                    ventas={ventas}
                  />
                )}

                {/* 3. INVENTARIO */}
                {activeTab === 'inventario' && (
                  <InventoryManager
                    sucursales={sucursales}
                    productos={productos}
                    inventario={inventario}
                    currentUser={currentUser}
                    empresaConfig={empresaConfig}
                    onTransferStock={handleTransferStock}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                  />
                )}

                {/* 4. COMPRAS */}
                {activeTab === 'compras' && (
                  <ComprasManager
                    compras={compras}
                    proveedores={proveedores}
                    productos={productos}
                    sucursales={sucursales}
                    empresaConfig={empresaConfig}
                    currentUser={currentUser}
                    onRegistrarCompra={handleRegistrarCompra}
                  />
                )}

                {/* 4. CLIENTES */}
                {activeTab === 'clientes' && (
                  <ClientesManager
                    clientes={clientes}
                    onAddCliente={handleAddCliente}
                    onUpdateCliente={handleUpdateCliente}
                    onDeleteCliente={handleDeleteCliente}
                    empresaConfig={empresaConfig}
                  />
                )}

                {/* 5. PROVEEDORES */}
                {activeTab === 'proveedores' && (
                  <ProveedoresManager
                    proveedores={proveedores}
                    onAddProveedor={handleAddProveedor}
                    onUpdateProveedor={handleUpdateProveedor}
                    onDeleteProveedor={handleDeleteProveedor}
                    empresaConfig={empresaConfig}
                  />
                )}

                {/* 6. CXC */}
                {activeTab === 'cxc' && (
                  <CxcManager
                    cxcList={cxcList}
                    clientes={clientes}
                    empresaConfig={empresaConfig}
                    currentUser={currentUser}
                    onRegistrarAbono={handleRegistrarAbonoCxc}
                    onNuevaCuentaCobrar={handleNuevaCxc}
                  />
                )}

                {/* 7. CXP */}
                {activeTab === 'cxp' && (
                  <CxpManager
                    cxpList={cxpList}
                    proveedores={proveedores}
                    empresaConfig={empresaConfig}
                    currentUser={currentUser}
                    onRegistrarPago={handleRegistrarPagoCxp}
                    onNuevaCuentaPagar={handleNuevaCxp}
                  />
                )}

                {/* 8. REPORTES */}
                {activeTab === 'reportes' && (
                  <PdfReportsCenter
                    currentUser={currentUser}
                    ventas={ventas}
                    sucursales={sucursales}
                    empresaConfig={empresaConfig}
                    usuarios={usuarios}
                  />
                )}

                {/* 9. CONFIGURACIÓN (PERMISOS, NOMBRES, PIN, EMPRESA) */}
                {activeTab === 'configuracion' && (
                  <ConfiguracionView
                    usuarios={usuarios}
                    onUpdateUsuarios={(updated) => setUsuarios(updated)}
                    empresaConfig={empresaConfig}
                    onSaveEmpresaConfig={handleSaveEmpresaConfig}
                    sucursales={sucursales}
                    currentUser={currentUser}
                    onOpenRateModal={() => setShowDailyRateModal(true)}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Daily Exchange Rate Prompt Modal */}
      <DailyRateModal
        isOpen={showDailyRateModal}
        empresaConfig={empresaConfig}
        currentRate={empresaConfig.tasaCambio}
        onSaveRate={handleSaveTasa}
        onClose={() => setShowDailyRateModal(false)}
      />

      {/* Manager Company & Fiscal Settings Modal */}
      <CompanySettingsModal
        isOpen={showCompanySettingsModal}
        empresaConfig={empresaConfig}
        currentUser={currentUser}
        onSaveConfig={handleSaveEmpresaConfig}
        onClose={() => setShowCompanySettingsModal(false)}
      />

      {/* Standalone HTML File Downloader Modal */}
      {showHtmlModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl p-6 relative animate-fade-in">
            <button
              type="button"
              onClick={() => setShowHtmlModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
            <StandaloneHtmlDownloader
              liveData={{
                empresaConfig,
                usuarios,
                productos,
                inventario,
                ventas,
                compras,
                clientes,
                proveedores,
                cxc: cxcList,
                cxp: cxpList,
                sucursales,
                currentUser,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
