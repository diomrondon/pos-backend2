import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Users,
  Truck,
  CreditCard,
  Receipt,
  FileText,
  Settings,
  Lock,
  Building2,
  ShieldCheck,
  LogOut,
  ChevronRight,
  TrendingUp,
  Store,
} from 'lucide-react';
import { Usuario, EmpresaConfig, ModuloPermisos } from '../types';
import { formatBs } from '../lib/currency';

export type SidebarTab =
  | 'dashboard'
  | 'ventas'
  | 'compras'
  | 'clientes'
  | 'proveedores'
  | 'cxc'
  | 'cxp'
  | 'reportes'
  | 'configuracion';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
  currentUser: Usuario | null;
  empresaConfig: EmpresaConfig;
  onOpenRateModal: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  empresaConfig,
  onOpenRateModal,
  onLogout,
}) => {
  const isGeneralManager = currentUser?.rol === 'admin';

  // Check if a user has access to a specific tab
  const hasAccess = (tab: SidebarTab): boolean => {
    if (!currentUser) return tab === 'ventas';
    if (isGeneralManager) return true;
    if (currentUser.permisos && currentUser.permisos[tab] !== undefined) {
      return currentUser.permisos[tab];
    }
    // Default rule: non-manager can ONLY do ventas
    return tab === 'ventas';
  };

  const navItems: {
    id: SidebarTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    description: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Cuadro de Mando',
    },
    {
      id: 'ventas',
      label: 'Ventas (POS)',
      icon: ShoppingCart,
      description: 'Facturación Dual $ / Bs.',
    },
    {
      id: 'compras',
      label: 'Compras',
      icon: ShoppingBag,
      description: 'Recepción y Stock',
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Directorio y Créditos',
    },
    {
      id: 'proveedores',
      label: 'Proveedores',
      icon: Truck,
      description: 'Cuentas y Contactos',
    },
    {
      id: 'cxc',
      label: 'CxC',
      icon: CreditCard,
      description: 'Cuentas por Cobrar',
    },
    {
      id: 'cxp',
      label: 'CxP',
      icon: Receipt,
      description: 'Cuentas por Pagar',
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: FileText,
      description: 'Cortes X/Z y PDFs',
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      description: 'Usuarios, PINs y Permisos',
    },
  ];

  return (
    <aside
      id="main-sidebar"
      className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col shrink-0 h-screen sticky top-0 text-slate-200 select-none z-30"
    >
      {/* Brand & Company Banner */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-3">
          {empresaConfig.logoUrl ? (
            <img
              src={empresaConfig.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 text-lg">
              {empresaConfig.nombreEmpresa.charAt(0)}
            </div>
          )}
          <div className="overflow-hidden">
            <h1 className="text-sm font-extrabold text-white truncate leading-tight">
              {empresaConfig.nombreEmpresa}
            </h1>
            <span className="text-[11px] font-mono text-emerald-400 font-semibold block truncate">
              {empresaConfig.rif}
            </span>
          </div>
        </div>

        {/* Daily Exchange Rate Capsule */}
        <button
          type="button"
          onClick={onOpenRateModal}
          title="Clic para actualizar la tasa oficial del día"
          className="w-full mt-3 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-slate-400 group-hover:text-emerald-300">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium">Tasa Hoy:</span>
          </div>
          <span className="font-mono font-bold text-emerald-400 text-xs">
            {formatBs(1, empresaConfig.tasaCambio)}
          </span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Módulos del Sistema
        </div>

        {navItems.map((item) => {
          const allowed = hasAccess(item.id);
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              type="button"
              onClick={() => {
                if (allowed) {
                  onSelectTab(item.id);
                }
              }}
              disabled={!allowed}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : allowed
                  ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white cursor-pointer'
                  : 'text-slate-600 bg-slate-950/30 opacity-60 cursor-not-allowed border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive
                      ? 'text-slate-950'
                      : allowed
                      ? 'text-emerald-400'
                      : 'text-slate-600'
                  }`}
                />
                <div className="truncate">
                  <div className="truncate">{item.label}</div>
                  <div
                    className={`text-[10px] font-normal truncate ${
                      isActive ? 'text-slate-900/80' : 'text-slate-500'
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
              </div>

              {!allowed && (
                <span title="Solo disponible para Gerente General o usuarios autorizados">
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Current User & Security Badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center justify-between gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs ${
                isGeneralManager
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {isGeneralManager ? (
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              ) : (
                <Store className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-white truncate">
                {currentUser?.nombre_completo || 'Sin Sesión'}
              </div>
              <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <span>{currentUser?.cargo || 'Operador'}</span>
                {isGeneralManager && (
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1 rounded font-mono font-bold">
                    GERENTE
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión / Cambiar usuario"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {!isGeneralManager && (
          <div className="mt-2 text-[10px] text-amber-300/80 bg-amber-950/40 border border-amber-500/20 px-2 py-1 rounded-lg flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">Modo Restringido: Acceso a Ventas</span>
          </div>
        )}
      </div>
    </aside>
  );
};
