import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  User,
  Edit2,
  Save,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';
import { Proveedor, EmpresaConfig } from '../types';
import { formatUSD, formatBs } from '../lib/currency';

interface ProveedoresManagerProps {
  proveedores: Proveedor[];
  onAddProveedor: (prov: Omit<Proveedor, 'id'>) => void;
  onUpdateProveedor: (prov: Proveedor) => void;
  empresaConfig: EmpresaConfig;
}

export const ProveedoresManager: React.FC<ProveedoresManagerProps> = ({
  proveedores,
  onAddProveedor,
  onUpdateProveedor,
  empresaConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProv, setEditingProv] = useState<Proveedor | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [rif, setRif] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');

  const handleOpenAdd = () => {
    setNombre('');
    setRif('');
    setContacto('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setEditingProv(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (p: Proveedor) => {
    setEditingProv(p);
    setNombre(p.nombre);
    setRif(p.rif);
    setContacto(p.contacto);
    setTelefono(p.telefono);
    setEmail(p.email || '');
    setDireccion(p.direccion || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !rif.trim()) {
      alert('Razón Social y RIF son obligatorios.');
      return;
    }

    if (editingProv) {
      onUpdateProveedor({
        ...editingProv,
        nombre: nombre.trim(),
        rif: rif.trim(),
        contacto: contacto.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion.trim(),
      });
    } else {
      onAddProveedor({
        nombre: nombre.trim(),
        rif: rif.trim(),
        contacto: contacto.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion.trim(),
        saldoPendiente: 0,
      });
    }

    setShowAddModal(false);
  };

  const filteredProveedores = proveedores.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rif.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contacto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalDeudaProveedores = proveedores.reduce((acc, p) => acc + p.saldoPendiente, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" /> Directorio de Proveedores y Fabricantes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de contactos de suministro, datos de facturación y control de obligaciones comerciales.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Proveedor</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Proveedores Registrados</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{proveedores.length} empresas</div>
          <span className="text-xs text-slate-500 block mt-0.5">Líneas de suministro activas</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Deuda Total a Proveedores (CxP)</span>
          <div className="text-xl font-bold text-rose-400 font-mono mt-1">{formatUSD(totalDeudaProveedores)}</div>
          <span className="text-xs text-slate-400 font-mono block mt-0.5">
            {formatBs(totalDeudaProveedores, empresaConfig.tasaCambio)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Calificación de Abastecimiento</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">100% Operativo</div>
          <span className="text-xs text-slate-500 block mt-0.5">Entregas a tiempo y recepción central</span>
        </div>
      </div>

      {/* Search & Suppliers List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar proveedor por nombre, RIF o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProveedores.map((prov) => (
            <div
              key={prov.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{prov.nombre}</h3>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{prov.rif}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(prov)}
                  className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
                  title="Editar proveedor"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-slate-300 font-medium">Contacto: {prov.contacto}</span>
                </div>
                {prov.telefono && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{prov.telefono}</span>
                  </div>
                )}
                {prov.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{prov.email}</span>
                  </div>
                )}
                {prov.direccion && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{prov.direccion}</span>
                  </div>
                )}
              </div>

              {/* Balance */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Deuda Pendiente (CxP):</span>
                  <span
                    className={`font-bold ${
                      prov.saldoPendiente > 0 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    ${prov.saldoPendiente.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Equivalente Bs:</span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {formatBs(prov.saldoPendiente, empresaConfig.tasaCambio)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-4">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-400" />
                {editingProv ? 'Editar Datos de Proveedor' : 'Registrar Nuevo Proveedor'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Razón Social / Nombre Comercial
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Alimentos Polar Comercial C.A."
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    RIF
                  </label>
                  <input
                    type="text"
                    required
                    value={rif}
                    onChange={(e) => setRif(e.target.value)}
                    placeholder="J-00000000-0"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Persona de Contacto
                  </label>
                  <input
                    type="text"
                    value={contacto}
                    onChange={(e) => setContacto(e.target.value)}
                    placeholder="Lic. Marcos Delgado"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+58 212-0000000"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="pedidos@proveedor.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Dirección / Ubicación
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Zona Industrial, Galpón 4"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingProv ? 'Actualizar Proveedor' : 'Guardar Proveedor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
