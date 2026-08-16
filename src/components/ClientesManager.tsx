import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Edit2,
  Save,
} from 'lucide-react';
import { Cliente, EmpresaConfig } from '../types';
import { formatUSD, formatBs } from '../lib/currency';

interface ClientesManagerProps {
  clientes: Cliente[];
  onAddCliente: (cliente: Omit<Cliente, 'id'>) => void;
  onUpdateCliente: (cliente: Cliente) => void;
  empresaConfig: EmpresaConfig;
}

export const ClientesManager: React.FC<ClientesManagerProps> = ({
  clientes,
  onAddCliente,
  onUpdateCliente,
  empresaConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [rifCedula, setRifCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [limiteCredito, setLimiteCredito] = useState<number>(300);

  const handleOpenAdd = () => {
    setNombre('');
    setRifCedula('');
    setTelefono('');
    setEmail('');
    setDireccion('');
    setLimiteCredito(300);
    setEditingCliente(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (c: Cliente) => {
    setEditingCliente(c);
    setNombre(c.nombre);
    setRifCedula(c.rif_cedula);
    setTelefono(c.telefono);
    setEmail(c.email || '');
    setDireccion(c.direccion || '');
    setLimiteCredito(c.limiteCredito);
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !rifCedula.trim()) {
      alert('Nombre y RIF/Cédula son obligatorios.');
      return;
    }

    if (editingCliente) {
      onUpdateCliente({
        ...editingCliente,
        nombre: nombre.trim(),
        rif_cedula: rifCedula.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion.trim(),
        limiteCredito,
      });
    } else {
      onAddCliente({
        nombre: nombre.trim(),
        rif_cedula: rifCedula.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        direccion: direccion.trim(),
        limiteCredito,
        saldoPendiente: 0,
        fechaRegistro: new Date().toISOString().split('T')[0],
      });
    }

    setShowAddModal(false);
  };

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rif_cedula.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.telefono.includes(searchTerm)
  );

  const totalDeudaClientes = clientes.reduce((acc, c) => acc + c.saldoPendiente, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Directorio y Gestión de Clientes
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Control de información fiscal (RIF/CI), límites de crédito para facturación y saldos deudores.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Nuevo Cliente</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Clientes Registrados</span>
          <div className="text-xl font-bold text-white font-mono mt-1">{clientes.length} clientes</div>
          <span className="text-xs text-slate-500 block mt-0.5">Cartera comercial activa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Saldo por Cobrar (Deuda Total)</span>
          <div className="text-xl font-bold text-amber-400 font-mono mt-1">{formatUSD(totalDeudaClientes)}</div>
          <span className="text-xs text-slate-400 font-mono block mt-0.5">
            {formatBs(totalDeudaClientes, empresaConfig.tasaCambio)}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Límite Global Concedido</span>
          <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
            {formatUSD(clientes.reduce((acc, c) => acc + c.limiteCredito, 0))}
          </div>
          <span className="text-xs text-slate-500 block mt-0.5">Cupo de crédito disponible</span>
        </div>
      </div>

      {/* Search & Clients List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar cliente por nombre, RIF o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 text-white text-xs pl-9 pr-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white text-sm">{cliente.nombre}</h3>
                  <span className="text-xs font-mono text-emerald-400 font-bold">{cliente.rif_cedula}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cliente)}
                  className="p-1 text-slate-400 hover:text-white bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
                  title="Editar cliente"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                {cliente.telefono && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{cliente.telefono}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{cliente.email}</span>
                  </div>
                )}
                {cliente.direccion && (
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{cliente.direccion}</span>
                  </div>
                )}
              </div>

              {/* Balances */}
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block">Límite Crédito:</span>
                  <span className="text-slate-200 font-bold">${cliente.limiteCredito.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Saldo Deudor (CxC):</span>
                  <span
                    className={`font-bold ${
                      cliente.saldoPendiente > 0 ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    ${cliente.saldoPendiente.toFixed(2)}
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
                <Users className="w-4 h-4 text-emerald-400" />
                {editingCliente ? 'Editar Datos de Cliente' : 'Registrar Nuevo Cliente'}
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
                    Razón Social / Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Distribuidora Santa Fe C.A."
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    RIF o Cédula de Identidad
                  </label>
                  <input
                    type="text"
                    required
                    value={rifCedula}
                    onChange={(e) => setRifCedula(e.target.value)}
                    placeholder="J-12345678-0 o V-12345678"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+58 414-1234567"
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
                    placeholder="cliente@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Límite de Crédito ($ USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={limiteCredito}
                    onChange={(e) => setLimiteCredito(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3 py-2 rounded-xl focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Dirección Fiscal / Ubicación
                  </label>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Av. Principal, Edificio Central, Local 2"
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
                  <span>{editingCliente ? 'Actualizar Cliente' : 'Guardar Cliente'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
