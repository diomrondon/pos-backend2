import React, { useState } from 'react';
import { Download, Copy, Check, Eye, Code, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { STANDALONE_HTML_SOURCE } from '../data/standaloneHtmlSource';

export const StandaloneHtmlDownloader: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  // Download directly from in-memory Blob (100% independent from Google session)
  const handleDownloadBlob = () => {
    try {
      const blob = new Blob([STANDALONE_HTML_SOURCE], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pos_multisucursal.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.error('Error downloading blob:', e);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(STANDALONE_HTML_SOURCE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = STANDALONE_HTML_SOURCE;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-2xl border border-emerald-500/30 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">Archivo Único: pos_multisucursal.html</h3>
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                100% Autónomo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              Descarga directa en memoria local. Puedes guardarlo en tus computadoras de caja, teléfonos o tablets y abrirlo con doble clic en Chrome, Edge o Safari.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar Código</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>{showCode ? 'Ocultar Código' : 'Ver Código'}</span>
          </button>

          <button
            onClick={handleDownloadBlob}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/60 active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Descargar Archivo .HTML</span>
          </button>
        </div>
      </div>

      {showCode && (
        <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-mono flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" /> pos_multisucursal.html (Código completo sin dependencias)
            </span>
            <button
              onClick={handleCopyCode}
              className="text-emerald-400 hover:text-emerald-300 text-xs font-semibold cursor-pointer"
            >
              {copied ? '¡Copiado!' : 'Copiar todo'}
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap p-2 bg-slate-900/50 rounded-lg">
            {STANDALONE_HTML_SOURCE}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> 100% Cero Costo / Sin Servidor
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Se conecta directamente desde el navegador a tu Supabase mediante HTTPS seguro.
          </p>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Lector USB Plug & Play
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Compatible de inmediato con cualquier pistola lectora de código de barras USB.
          </p>
        </div>

        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Tienda 1, Tienda 2 y Oficina
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Sincronización multi-sucursal y control de transferencias de inventario en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
};
