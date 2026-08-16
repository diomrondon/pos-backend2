import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  KeyRound,
  Edit3,
  Check,
  Building2,
  TrendingUp,
  Store,
  CheckCircle2,
  AlertCircle,
  Save,
  UserCheck,
  ShieldAlert,
  Sliders,
  DollarSign,
  Lock,
} from 'lucide-react';
import { Usuario, EmpresaConfig, Sucursal, ModuloPermisos } from '../types';
import { formatBs } from '../lib/currency';

interface ConfiguracionViewProps {
  usuarios: Usuario[];
  onUpdateUsuarios: (updated: Usuario[]) => void;
  empresaConfig: EmpresaConfig;
  onSaveEmpresaConfig: (config: EmpresaConfig) => void;
  sucursales: Sucursal[];
  currentUser: Usuario | null;
  onOpenRateModal: () => void;
}

export const ConfiguracionView: React.FC<ConfiguracionViewProps> = ({
  usuarios,
  onUpdateUsuarios,
  empresaConfig,
  onSaveEmpresaConfig,
  sucursales,
  currentUser,
  onOpenRateModal,
}) => {
  const isGeneralManager = currentUser?.rol === 'admin';

  const [activeSubTab, setActiveSubTab] = useState<'usuarios' | 'empresa' | 'sucursales' | 'tasa'>('usuarios');

  // Company Form State
  const [companyForm, setCompanyForm] = useState<EmpresaConfig>({ ...empresaConfig });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected user for editing in the Permissions/PIN area
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(usuarios[0] || null);
  const [editNombre, setEditNombre] = useState<string>('');
  const [editCargo, setEditCargo] = useState<string>('');
  const [editPin, setEditPin] = useState<string>('');
  const [editRol, setEditRol] = useState<'cajero' | 'supervisor' | 'inventario' | 'admin'>('cajero');
  const [editSucursalId, setEditSucursalId] = useState<number | null>(1);
  const [editPermisos, setEditPermisos] = useState<ModuloPermisos>({
    dashboard: false,
    ventas: true,
    compras: false,
    clientes: false,
    proveedores: false,
    cxc: false,
    cxp: false,
    reportes: false,
    configuracion: false,
  });

  // When selected user changes, sync form fields
  const handleSelectUser = (u: Usuario) => {
    setSelectedUser(u);
    setEditNombre(u.nombre_completo);
    setEditCargo(u.cargo);
    setEditPin(u.pin);
    setEditRol(u.rol);
    setEditSucursalId(u.sucursal_id);
    setEditPermisos(
      u.permisos || {
        dashboard: u.rol === 'admin',
        ventas: true,
        compras: u.rol === 'admin' || u.rol === 'inventario',
        clientes: u.rol === 'admin',
        proveedores: u.rol === 'admin' || u.rol === 'inventario',
        cxc: u.rol === 'admin',
        cxp: u.rol === 'admin',
        reportes: u.rol === 'admin' || u.rol === 'supervisor',
        configuracion: u.rol === 'admin',
      }
    );
    setSuccessMsg(null);
  };

  // Initialize form on mount if not set
  React.useEffect(() => {
    if (usuarios.length > 0 && !selectedUser) {
      handleSelectUser(usuarios[0]);
    }
  }, [usuarios]);

  const handleSaveUserChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    if (!editPin || editPin.trim().length < 4) {
      alert('El PIN debe tener al menos 4 caracteres/dígitos numéricos.');
      return;
    }

    const updatedList = usuarios.map((u) => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          nombre_completo: editNombre.trim(),
          cargo: editCargo.trim(),
          pin: editPin.trim(),
          rol: editRol,
          sucursal_id: editSucursalId,
          permisos: { ...editPermisos },
        };
      }
      return u;
    });

    onUpdateUsuarios(updatedList);
    setSuccessMsg(`¡Usuario "${editNombre}" actualizado con éxito! Nuevo PIN y permisos guardados.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveEmpresaConfig(companyForm);
    setSuccessMsg('¡Datos de la empresa y membrete fiscal actualizados con éxito!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const togglePermiso = (key: keyof ModuloPermisos) => {
    setEditPermisos((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const modulesList: { key: keyof ModuloPermisos; label: string; desc: string }[] = [
    { key: 'dashboard', label: 'Dashboard Ejecutivo', desc: 'Acceso a métricas de ventas, ingresos, utilidades y gráficos' },
    { key: 'ventas', label: 'Ventas y Punto de Venta (POS)', desc: 'Facturación en caja, lectura de código de barras y cobros' },
    { key: 'compras', label: 'Módulo de Compras', desc: 'Registro de compras de mercancía y recepción en almacén' },
    { key: 'clientes', label: 'Directorio de Clientes', desc: 'Gestión de clientes, datos de contacto y límites de crédito' },
    { key: 'proveedores', label: 'Directorio de Proveedores', desc: 'Gestión de proveedores, contactos y datos de facturación' },
    { key: 'cxc', label: 'Cuentas por Cobrar (CxC)', desc: 'Cobranza a clientes, registro de abonos y estados de cuenta' },
    { key: 'cxp', label: 'Cuentas por Pagar (CxP)', desc: 'Gestión de pagos y obligaciones con proveedores' },
    { key: 'reportes', label: 'Centro de Reportes y PDFs', desc: 'Emisión de cortes de caja X/Z, libros fiscales e informes' },
    { key: 'configuracion', label: 'Configuración y Permisos', desc: 'Cambio de nombres, PINs de seguridad, roles y datos de empresa' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Title Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-400" /> Centro de Configuración y Seguridad
            </h2>
            <span className="bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-purple-500/30">
              {empresaConfig.nombreEmpresa}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Administración de usuarios, asignación de PINs, matriz de permisos por módulo y datos fiscales.
          </p>
        </div>

        {/* Sub-tab Navigation Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveSubTab('usuarios')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'usuarios'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios y Permisos</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('empresa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'empresa'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Datos Fiscales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('sucursales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'sucursales'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Sucursales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('tasa')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'tasa'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cotización Diaria</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-950/60 border border-emerald-500/40 p-4 rounded-xl text-emerald-200 text-xs flex items-center gap-2.5 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 1: USUARIOS, PINS Y PERMISOS (CORE REQUIREMENT) */}
      {/* ======================================================== */}
      {activeSubTab === 'usuarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: List of all 12 users */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" /> Personal del Sistema ({usuarios.length})
                </h3>
                <p className="text-[11px] text-slate-400">
                  Selecciona un usuario para editar su nombre, PIN y permisos.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {usuarios.map((u) => {
                const isSelected = selectedUser?.id === u.id;
                const isAdmin = u.rol === 'admin';

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleSelectUser(u)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono font-bold text-xs ${
                          isAdmin
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-slate-800 text-emerald-400 border border-slate-700'
                        }`}
                      >
                        {u.id}
                      </div>
                      <div className="overflow-hidden">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{u.nombre_completo}</span>
                          {isAdmin && (
                            <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {u.cargo} • <span className="font-mono text-slate-500">@{u.username}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono bg-slate-900 border border-slate-700/80 px-2 py-0.5 rounded text-amber-400 block font-bold">
                        PIN: ••••
                      </span>
                      <span className="text-[9px] text-slate-500 capitalize block mt-0.5">
                        {u.sucursal_id ? `Sucursal ${u.sucursal_id}` : 'Global'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: User Details Editor & Permissions Matrix */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            {selectedUser ? (
              <form onSubmit={handleSaveUserChanges} className="space-y-5">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-emerald-400" />
                      Editar Usuario: <span className="text-emerald-300">{selectedUser.nombre_completo}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Modifica los datos personales, PIN de acceso de 4 dígitos y los permisos asignados por módulo.
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-slate-950 border border-slate-800 text-slate-400 px-2.5 py-1 rounded-lg">
                    ID #{selectedUser.id} • @{selectedUser.username}
                  </span>
                </div>

                {/* Form fields: Name, Cargo, PIN, Rol, Sucursal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Nombre Completo del Colaborador
                    </label>
                    <input
                      type="text"
                      required
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Cargo / Puesto de Trabajo
                    </label>
                    <input
                      type="text"
                      required
                      value={editCargo}
                      onChange={(e) => setEditCargo(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-amber-400 block mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5" /> PIN de Acceso (Mínimo 4 dígitos)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={8}
                      value={editPin}
                      onChange={(e) => setEditPin(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/50 text-amber-300 font-mono text-sm font-bold px-3 py-2 rounded-xl focus:border-amber-400 focus:outline-none tracking-widest"
                      placeholder="Ej: 1234"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      El cajero/usuario usará este PIN para iniciar sesión rápidamente.
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Rol en el Sistema
                    </label>
                    <select
                      value={editRol}
                      onChange={(e) => setEditRol(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="cajero">Cajero / Operador de Ventas</option>
                      <option value="supervisor">Supervisor de Tienda</option>
                      <option value="inventario">Personal de Inventario / Almacén</option>
                      <option value="admin">Gerente General / Administrador</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Sucursal Asignada
                    </label>
                    <select
                      value={editSucursalId === null ? 'null' : editSucursalId}
                      onChange={(e) => setEditSucursalId(e.target.value === 'null' ? null : Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
                    >
                      <option value="null">Acceso Global (Todas las Sucursales)</option>
                      {sucursales.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.tipo === 'oficina' ? 'Almacén/Oficina' : 'Tienda'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Permissions Matrix */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-emerald-400" /> Matriz de Permisos por Módulo
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Habilita o deshabilita los módulos específicos a los que este colaborador tendrá acceso en el menú lateral.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditPermisos({
                            dashboard: false,
                            ventas: true,
                            compras: false,
                            clientes: false,
                            proveedores: false,
                            cxc: false,
                            cxp: false,
                            reportes: false,
                            configuracion: false,
                          })
                        }
                        className="text-[10px] bg-slate-950 hover:bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-800 cursor-pointer"
                      >
                        Solo Ventas
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditPermisos({
                            dashboard: true,
                            ventas: true,
                            compras: true,
                            clientes: true,
                            proveedores: true,
                            cxc: true,
                            cxp: true,
                            reportes: true,
                            configuracion: true,
                          })
                        }
                        className="text-[10px] bg-purple-950/60 hover:bg-purple-900 text-purple-300 px-2 py-1 rounded border border-purple-500/30 cursor-pointer font-bold"
                      >
                        Todos (Admin)
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {modulesList.map((m) => {
                      const isAllowed = editPermisos[m.key];
                      return (
                        <div
                          key={m.key}
                          onClick={() => togglePermiso(m.key)}
                          className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                            isAllowed
                              ? 'bg-emerald-950/30 border-emerald-500/50 text-white'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border ${
                              isAllowed
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                                : 'border-slate-700 bg-slate-900'
                            }`}
                          >
                            {isAllowed && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold leading-tight">{m.label}</div>
                            <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{m.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end pt-3 border-t border-slate-800">
                  <button
                    type="submit"
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Cambios de Usuario y Permisos</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Selecciona un usuario de la lista izquierda para editar sus permisos.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: DATOS FISCALES DE LA EMPRESA */}
      {/* ======================================================== */}
      {activeSubTab === 'empresa' && (
        <form onSubmit={handleSaveCompany} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" /> Razón Social y Datos Fiscales
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Estos datos se imprimen en los tickets de venta POS, comprobantes de pago y reportes contables.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Nombre de la Empresa / Razón Social
              </label>
              <input
                type="text"
                required
                value={companyForm.nombreEmpresa}
                onChange={(e) => setCompanyForm({ ...companyForm, nombreEmpresa: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Registro de Información Fiscal (RIF)
              </label>
              <input
                type="text"
                required
                value={companyForm.rif}
                onChange={(e) => setCompanyForm({ ...companyForm, rif: e.target.value })}
                placeholder="J-12345678-9"
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Dirección Fiscal Completa
              </label>
              <input
                type="text"
                required
                value={companyForm.direccionFiscal}
                onChange={(e) => setCompanyForm({ ...companyForm, direccionFiscal: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Teléfonos de Contacto
              </label>
              <input
                type="text"
                required
                value={companyForm.telefono}
                onChange={(e) => setCompanyForm({ ...companyForm, telefono: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                URL del Logotipo (Opcional)
              </label>
              <input
                type="url"
                value={companyForm.logoUrl || ''}
                onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración Fiscal</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 3: NOMBRES DE SUCURSALES */}
      {/* ======================================================== */}
      {activeSubTab === 'sucursales' && (
        <form onSubmit={handleSaveCompany} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-400" /> Nombres de Sucursales y Almacenes
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Personaliza cómo se denominan tus tiendas físicas y la bodega central.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-emerald-400 font-bold block">SUCURSAL #1 (TIENDA)</span>
              <label className="text-[11px] text-slate-400 block">Nombre del Punto de Venta</label>
              <input
                type="text"
                required
                value={companyForm.nombreTienda1}
                onChange={(e) => setCompanyForm({ ...companyForm, nombreTienda1: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-blue-400 font-bold block">SUCURSAL #2 (TIENDA)</span>
              <label className="text-[11px] text-slate-400 block">Nombre del Punto de Venta</label>
              <input
                type="text"
                required
                value={companyForm.nombreTienda2}
                onChange={(e) => setCompanyForm({ ...companyForm, nombreTienda2: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
              />
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-purple-400 font-bold block">SUCURSAL #3 (CENTRAL)</span>
              <label className="text-[11px] text-slate-400 block">Nombre Almacén / Oficina</label>
              <input
                type="text"
                required
                value={companyForm.nombreOficina}
                onChange={(e) => setCompanyForm({ ...companyForm, nombreOficina: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 text-white text-xs px-3 py-2 rounded-lg focus:border-emerald-500 focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Nombres de Sucursales</span>
            </button>
          </div>
        </form>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 4: TASA CAMBIARIA */}
      {/* ======================================================== */}
      {activeSubTab === 'tasa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Cotización Diaria Cambiaria (USD / Bolívares)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ajusta la tasa de conversión activa para facturación, inventario y cuentas de cobro/pago.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenRateModal}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Actualizar Tasa del Día</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Cotización Vigente:</span>
              <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                1 USD = {formatBs(1, empresaConfig.tasaCambio)}
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Última actualización: {empresaConfig.fechaTasa}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Ejemplo de Conversión:</span>
              <div className="text-sm font-bold text-white mt-1">
                $10.00 USD = <span className="text-emerald-400 font-mono">{formatBs(10, empresaConfig.tasaCambio)}</span>
              </div>
              <div className="text-sm font-bold text-white mt-0.5">
                $50.00 USD = <span className="text-emerald-400 font-mono">{formatBs(50, empresaConfig.tasaCambio)}</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] text-slate-400 block">Impacto en el Sistema:</span>
              <p className="text-xs text-slate-300 mt-1">
                Al actualizar la tasa, todos los precios en caja, cálculos en compras y estados de cuentas se recalculan de forma automática.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
