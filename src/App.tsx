import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarTab } from './components/Sidebar';
import { AuthHeader } from './components/AuthHeader';
import { PosSimulator } from './components/PosSimulator';
import { ExecutiveDashboard } from './components/ExecutiveDashboard';
import { PdfReportsCenter } from './components/PdfReportsCenter';
import { DailyRateModal } from './components/DailyRateModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { ComprasManager } from './components/ComprasManager';
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
} from './types';
import { getStoredSupabaseConfig, createCustomSupabaseClient } from './lib/supabaseClient';
import { getStoredEmpresaConfig, saveEmpresaConfig, hasSetTasaToday, markTasaSetToday, formatUSD, formatBs } from './lib/currency';
import { ShieldAlert, Lock, ShoppingCart, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation State (starts in 'ventas' or 'dashboard' if admin)
  const [activeTab, setActiveTab] = useState<SidebarTab>('ventas');

  // App State: Users
  const [usuarios, setUsuarios] = useState<Usuario[]>(INITIAL_USUARIOS);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(INITIAL_USUARIOS[0]); // Ana Morales

  // Company and Fiscal Settings + Daily Rate
  const [empresaConfig, setEmpresaConfig] = useState<EmpresaConfig>(getStoredEmpresaConfig);
  const [showDailyRateModal, setShowDailyRateModal] = useState<boolean>(false);
  const [showCompanySettingsModal, setShowCompanySettingsModal] = useState<boolean>(false);

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

  // Handler: Register a new sale from POS with Cashier Audit
  const handleRegistrarVenta = async (
    sucursalId: number,
    items: { producto: Producto; cantidad: number }[]
  ) => {
    const totalVenta = items.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
    const newVentaId = ventas.length + 1;

    const detalles = items.map((item, index) => ({
      id: newVentaId * 100 + index,
      venta_id: newVentaId,
      producto_id: item.producto.id,
      producto_nombre: item.producto.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.producto.precio,
      subtotal: item.producto.precio * item.cantidad,
    }));

    const nuevaVenta: Venta = {
      id: newVentaId,
      sucursal_id: sucursalId,
      usuario_id: currentUser ? currentUser.id : undefined,
      usuario_nombre: currentUser ? currentUser.nombre_completo : 'Cajero Anónimo',
      fecha: new Date().toISOString(),
      total: totalVenta,
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

  // Handler: Register new purchase from supplier
  const handleRegistrarCompra = (compraData: Omit<Compra, 'id'>) => {
    const newId = compras.length + 1;
    const newCompra: Compra = {
      ...compraData,
      id: newId,
    };

    setCompras([newCompra, ...compras]);

    // Increment inventory in destination branch
    setInventario((prevInv) => {
      return prevInv.map((invItem) => {
        if (invItem.sucursal_id === compraData.sucursalId) {
          const boughtItem = compraData.detalles.find((d) => d.productoId === invItem.producto_id);
          if (boughtItem) {
            return {
              ...invItem,
              stock: invItem.stock + boughtItem.cantidad,
            };
          }
        }
        return invItem;
      });
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
        fechaVencimiento: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
        montoTotal: compraData.total,
        saldoRestante: compraData.total,
        estado: 'pendiente',
        pagos: [],
      };
      setCxpList([newCxp, ...cxpList]);

      // Update provider balance
      setProveedores((prev) =>
        prev.map((p) => (p.id === prov.id ? { ...p, saldoPendiente: p.saldoPendiente + compraData.total } : p))
      );
    }
  };

  // Handler: Add Client
  const handleAddCliente = (newCliente: Omit<Cliente, 'id'>) => {
    const id = clientes.length + 1;
    setClientes([...clientes, { ...newCliente, id }]);
  };

  // Handler: Update Client
  const handleUpdateCliente = (updated: Cliente) => {
    setClientes(clientes.map((c) => (c.id === updated.id ? updated : c)));
  };

  // Handler: Add Supplier
  const handleAddProveedor = (newProv: Omit<Proveedor, 'id'>) => {
    const id = proveedores.length + 1;
    setProveedores([...proveedores, { ...newProv, id }]);
  };

  // Handler: Update Supplier
  const handleUpdateProveedor = (updated: Proveedor) => {
    setProveedores(proveedores.map((p) => (p.id === updated.id ? updated : p)));
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
      />

      {/* Main Layout with Left Sidebar */}
      <div className="flex-1 flex flex-row overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => setActiveTab(tab)}
          currentUser={currentUser}
          empresaConfig={empresaConfig}
          onOpenRateModal={() => setShowDailyRateModal(true)}
          onLogout={() => setCurrentUser(null)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
          {/* Top Quick Metrics & Status Banner */}
          <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300">
                {empresaConfig.nombreEmpresa}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-emerald-400 font-mono font-medium">
                1 USD = {formatBs(1, empresaConfig.tasaCambio)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="text-slate-400">Ventas Hoy:</span>
                <span className="font-bold text-white">{formatUSD(totalSalesToday)}</span>
                <span className="text-[11px] text-emerald-400">
                  ({formatBs(totalSalesToday, empresaConfig.tasaCambio)})
                </span>
              </div>

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
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
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
                    onRegistrarVenta={handleRegistrarVenta}
                    ventas={ventas}
                  />
                )}

                {/* 3. COMPRAS */}
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
                    empresaConfig={empresaConfig}
                  />
                )}

                {/* 5. PROVEEDORES */}
                {activeTab === 'proveedores' && (
                  <ProveedoresManager
                    proveedores={proveedores}
                    onAddProveedor={handleAddProveedor}
                    onUpdateProveedor={handleUpdateProveedor}
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
                {activeTab === 'reportes' && <PdfReportsCenter />}

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
    </div>
  );
}
