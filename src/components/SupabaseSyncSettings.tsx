import React, { useState } from 'react';
import { Database, Key, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../lib/supabaseClient';

interface SupabaseSyncSettingsProps {
  onSyncSuccess?: () => void;
}

export const SupabaseSyncSettings: React.FC<SupabaseSyncSettingsProps> = ({ onSyncSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const initialConfig = getStoredSupabaseConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(initialConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(initialConfig.anonKey);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setStatusMessage({
      text: '¡Configuración guardada! La aplicación ahora sincroniza directamente con tu Supabase.',
      type: 'success',
    });
    setTimeout(() => {
      setStatusMessage(null);
      setIsOpen(false);
      if (onSyncSuccess) onSyncSuccess();
    }, 2000);
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer transition-colors"
      >
        <Database className="w-3.5 h-3.5 text-emerald-400" />
        <span>Conectar Supabase en Vivo</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                Conectar a tu Supabase ($0 / Sin Servidor)
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Ingresa tus credenciales públicas de Supabase para consultar y guardar directamente en tu base de datos PostgreSQL:
            </p>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Project URL:
                </label>
                <input
                  type="text"
                  required
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://jfnpxkxnkriquvapzniy.supabase.co"
                  className="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-emerald-400 p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Anon Public Key (API Key):
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Encuéntrala en Supabase ➡️ ⚙️ Project Settings ➡️ API Keys ➡️ anon (public)
                </p>
              </div>

              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-950/60 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Guardar Conexión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
