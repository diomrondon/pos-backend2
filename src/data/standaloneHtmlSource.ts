export const STANDALONE_HTML_SOURCE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sistema Multi-Sucursal POS & Gestión Comercial</title>
  <!-- Tailwind CSS v4 CDN -->
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <!-- Chart.js para gráficas interactivas -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #020617;
    }
    ::-webkit-scrollbar-thumb {
      background: #1e293b;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #334155;
    }
    @media print {
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      body * {
        visibility: hidden;
      }
      #pos-receipt-modal-content, #pos-receipt-modal-content *,
      #printable-receipt, #printable-receipt * {
        visibility: visible !important;
      }
      #printable-receipt {
        display: block !important;
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 78mm !important;
        max-width: 100% !important;
        margin: 0 auto !important;
        color: #000000 !important;
        background: #ffffff !important;
        padding: 4px !important;
        font-family: 'Courier New', Courier, monospace !important;
        font-size: 11px !important;
        line-height: 1.35 !important;
      }
      #pos-receipt-modal-content {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 78mm !important;
        max-width: 100% !important;
        color: #000000 !important;
        background: #ffffff !important;
      }
      .no-print, button {
        display: none !important;
      }
      @page {
        size: auto;
        margin: 4mm;
      }
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">

  <!-- TOP AUTH & SECURITY BAR -->
  <header class="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs z-30">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-1.5 font-bold text-slate-200">
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        <span class="hidden sm:inline">Seguridad & Control:</span>
      </div>

      <div id="auth-user-badge" class="flex items-center gap-2">
        <!-- Rendered by JS -->
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Daily exchange rate fast info -->
      <button onclick="openTasaModal()" class="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5 hover:bg-slate-800 cursor-pointer">
        <span class="text-slate-400 text-[10px]">Tasa:</span>
        <span id="top-tasa-text" class="font-bold">1 USD = Bs. 36.50</span>
      </button>

      <button onclick="openLoginModal()" class="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs">
        <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span id="btn-login-label">Cambiar Usuario (PIN)</span>
      </button>

      <button onclick="openPinGuideModal()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer text-xs">
        <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
        <span class="hidden sm:inline">PINs de Prueba</span>
      </button>
    </div>
  </header>

  <!-- MAIN APP CONTAINER WITH SIDEBAR -->
  <div class="flex-1 flex flex-row overflow-hidden min-h-0">
    
    <!-- LEFT SIDEBAR -->
    <aside id="main-sidebar" class="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out select-none">
      <!-- Company Branding -->
      <div class="p-3.5 border-b border-slate-800/80 flex items-center justify-between gap-2 bg-slate-950/60">
        <div class="flex items-center gap-2.5 overflow-hidden">
          <div class="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div id="side-company-info" class="overflow-hidden">
            <h2 id="side-company-name" class="text-xs font-bold text-white truncate">Corporación Los Andes C.A.</h2>
            <div class="flex items-center gap-1 mt-0.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span class="text-[10px] text-slate-400 truncate">3 Sucursales</span>
            </div>
          </div>
        </div>

        <!-- Toggle Collapse/Expand Button -->
        <button onclick="toggleSidebar()" id="btn-toggle-sidebar" title="Colapsar menú lateral hacia la izquierda" class="p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-emerald-300 border border-slate-700/80 transition-colors cursor-pointer shrink-0">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex-1 overflow-y-auto p-2 space-y-1">
        <div id="side-modules-header" class="px-2 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
          <span>Módulos</span>
          <span class="text-[9px] text-slate-600 font-normal">Autocolapsable</span>
        </div>

        <!-- 1. Dashboard -->
        <button onclick="switchTab('dashboard')" id="nav-btn-dashboard" title="Dashboard - Cuadro de Mando" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            <span class="nav-btn-text truncate">Dashboard</span>
          </div>
          <span id="lock-dashboard" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 2. Ventas POS -->
        <button onclick="switchTab('ventas')" id="nav-btn-ventas" title="Ventas (POS) - Facturación Dual $ / Bs." class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 transition-all shadow-md shadow-emerald-500/20 cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-slate-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span class="nav-btn-text truncate">Ventas (POS)</span>
          </div>
          <span class="nav-btn-badge text-[10px] bg-slate-950/20 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">Caja</span>
        </button>

        <!-- 3. Inventario -->
        <button onclick="switchTab('inventario')" id="nav-btn-inventario" title="Inventario - Stock y Traspasos" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <span class="nav-btn-text truncate">Inventario</span>
          </div>
          <span id="lock-inventario" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 4. Compras -->
        <button onclick="switchTab('compras')" id="nav-btn-compras" title="Compras - Recepción y Stock" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <span class="nav-btn-text truncate">Compras</span>
          </div>
          <span id="lock-compras" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 5. Clientes -->
        <button onclick="switchTab('clientes')" id="nav-btn-clientes" title="Clientes - Directorio y Créditos" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            <span class="nav-btn-text truncate">Clientes</span>
          </div>
          <span id="lock-clientes" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 6. Proveedores -->
        <button onclick="switchTab('proveedores')" id="nav-btn-proveedores" title="Proveedores - Cuentas y Contactos" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"/></svg>
            <span class="nav-btn-text truncate">Proveedores</span>
          </div>
          <span id="lock-proveedores" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 7. CxC -->
        <button onclick="switchTab('cxc')" id="nav-btn-cxc" title="CxC - Cuentas por Cobrar" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span class="nav-btn-text truncate">Cuentas por Cobrar</span>
          </div>
          <span id="lock-cxc" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 8. CxP -->
        <button onclick="switchTab('cxp')" id="nav-btn-cxp" title="CxP - Cuentas por Pagar" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"/></svg>
            <span class="nav-btn-text truncate">Cuentas por Pagar</span>
          </div>
          <span id="lock-cxp" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 9. Reportes -->
        <button onclick="switchTab('reportes')" id="nav-btn-reportes" title="Reportes & Cortes X/Z" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span class="nav-btn-text truncate">Reportes & Cortes</span>
          </div>
          <span id="lock-reportes" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>

        <!-- 10. Configuración -->
        <button onclick="switchTab('configuracion')" id="nav-btn-configuracion" title="Configuración de Empresa y Usuarios" class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">
          <div class="flex items-center gap-2.5 min-w-0">
            <svg class="w-4 h-4 text-amber-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span class="nav-btn-text truncate">Configuración</span>
          </div>
          <span id="lock-configuracion" class="nav-btn-badge hidden text-slate-600 shrink-0"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg></span>
        </button>
      </div>

      <!-- User Card -->
      <div class="p-2.5 border-t border-slate-800 bg-slate-950">
        <div class="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800">
          <div class="flex items-center gap-2 overflow-hidden">
            <div id="side-user-avatar" class="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center border border-purple-500/30 shrink-0">
              AM
            </div>
            <div id="side-user-text" class="overflow-hidden">
              <p id="side-user-name" class="text-xs font-bold text-white truncate">Ana Morales</p>
              <p id="side-user-role" class="text-[10px] text-purple-400 font-semibold truncate">Gerente General</p>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <!-- CONTENT AREA -->
    <main class="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6">
      
      <!-- RESTRICTION ALERT (Shown when user lacks permissions) -->
      <div id="view-restricted" class="hidden max-w-xl mx-auto my-12 bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center space-y-4">
        <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        </div>
        <h3 class="text-base font-bold text-white">Módulo Restringido</h3>
        <p class="text-xs text-slate-400">Tu usuario solo cuenta con acceso autorizado para el módulo de <strong>Ventas (POS)</strong>.</p>
        <button onclick="switchTab('ventas')" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer">
          Ir al Punto de Venta
        </button>
      </div>

      <!-- ================= 1. DASHBOARD VIEW ================= -->
      <section id="view-dashboard" class="space-y-6 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold text-white">Dashboard Ejecutivo Gerencial</h2>
            <p class="text-xs text-slate-400">Consolidado general de operaciones y rendimiento multi-sucursal</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="renderDashboard()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
              <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span>Actualizar KPIs</span>
            </button>
          </div>
        </div>

        <!-- 4 KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p class="text-xs text-slate-400 font-semibold">Ventas Totales Hoy</p>
            <h3 id="dash-kpi-sales" class="text-2xl font-black text-white mt-1 font-mono">$ 0.00</h3>
            <p id="dash-kpi-sales-bs" class="text-xs text-emerald-400 font-mono mt-0.5">Bs. 0.00</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p class="text-xs text-slate-400 font-semibold">Transacciones Realizadas</p>
            <h3 id="dash-kpi-tx" class="text-2xl font-black text-white mt-1 font-mono">0</h3>
            <p class="text-xs text-indigo-400 font-semibold mt-0.5">Tickets emitidos</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p class="text-xs text-slate-400 font-semibold">Por Cobrar (CxC)</p>
            <h3 id="dash-kpi-cxc" class="text-2xl font-black text-amber-400 mt-1 font-mono">$ 0.00</h3>
            <p id="dash-kpi-cxc-count" class="text-xs text-slate-400 mt-0.5">0 facturas pendientes</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p class="text-xs text-slate-400 font-semibold">Por Pagar (CxP)</p>
            <h3 id="dash-kpi-cxp" class="text-2xl font-black text-rose-400 mt-1 font-mono">$ 0.00</h3>
            <p id="dash-kpi-cxp-count" class="text-xs text-slate-400 mt-0.5">0 cuentas a proveedores</p>
          </div>
        </div>

        <!-- Chart Container -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 class="text-sm font-bold text-white mb-4">Ventas por Sucursal ($ USD)</h3>
          <div class="h-64">
            <canvas id="dashboardChart"></canvas>
          </div>
        </div>
      </section>

      <!-- ================= 2. VENTAS (POS) VIEW ================= -->
      <section id="view-ventas" class="space-y-4 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <div>
              <h2 class="text-base font-bold text-white">Terminal Punto de Venta (Caja)</h2>
              <p class="text-xs text-slate-400">Atención de clientes con facturación y cobro en doble divisa</p>
            </div>
          </div>

          <!-- Sucursal Active Selector for POS -->
          <div class="flex items-center gap-2">
            <label class="text-xs text-slate-400 font-semibold">Caja en:</label>
            <select id="pos-sucursal-select" onchange="onPosSucursalChange()" class="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500">
              <option value="1">Tienda 1 (Av. Principal)</option>
              <option value="2">Tienda 2 (C.C. Sambil)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <!-- Products Catalog (2/3 width -> 8 cols) -->
          <div class="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[680px]">
            <!-- Search & Barcode Input & Sort info -->
            <div class="flex items-center gap-2 mb-3">
              <div class="relative flex-1">
                <input type="text" id="pos-search-input" onkeyup="filterPosProducts()" placeholder="Escanear código de barras o buscar producto..." class="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500">
                <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </div>
              <div class="hidden sm:flex items-center gap-1 text-[11px] bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 text-amber-300 font-medium whitespace-nowrap">
                <span>🔥 <strong>Mayor a Menor Venta</strong></span>
              </div>
            </div>

            <!-- Products Grid: 4 in a row -->
            <div id="pos-products-grid" class="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 pr-1 custom-scrollbar">
              <!-- Rendered by JS -->
            </div>
          </div>

          <!-- Cart & Checkout (1/3 width -> 4 cols) -->
          <div class="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[680px]">
            <div class="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-white">Ticket de Venta</span>
                <span id="pos-cart-count" class="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold">0 ítems</span>
              </div>
              <button onclick="clearPosCart()" class="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer">Vaciar</button>
            </div>

            <!-- Customer Selection Bar with Fast Cédula / RIF Auto-Lookup -->
            <div class="my-2 p-2.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span>Cliente Facturación:</span>
                </span>
                <div class="flex items-center gap-1">
                  <button type="button" onclick="resetPosClienteToContado()" id="btn-pos-reset-contado" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer">
                    Contado
                  </button>
                  <button type="button" onclick="openPosClientModal()" class="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded-lg cursor-pointer flex items-center gap-1">
                    <svg class="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <span>Lista</span>
                  </button>
                </div>
              </div>

              <!-- Fast Cédula / RIF Input -->
              <div class="flex items-center gap-1.5">
                <div class="relative flex-1">
                  <input type="text" id="pos-fast-cedula-input" oninput="onPosFastCedulaInput(this.value)" placeholder="Cédula o RIF (Ej: V-12345678, 12345678) → Auto" class="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none">
                </div>
                <button type="button" id="btn-pos-fast-create" onclick="openPosCreateFromFastInput()" class="hidden px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold rounded-xl whitespace-nowrap cursor-pointer">
                  + Registrar
                </button>
              </div>

              <!-- Current Selected Client Card -->
              <div id="pos-client-card" class="p-2 bg-slate-900 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2 overflow-hidden">
                  <div id="pos-client-icon-box" class="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                  <div class="overflow-hidden">
                    <div class="flex items-center gap-1.5">
                      <span id="pos-client-name" class="text-xs font-bold text-white truncate">Cliente de Contado</span>
                      <span id="pos-client-badge" class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">Predeterminado</span>
                    </div>
                    <p id="pos-client-rif" class="text-[10px] text-slate-400 font-mono">RIF: V-00000000</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cart items list -->
            <div id="pos-cart-items" class="flex-1 overflow-y-auto py-1 space-y-2 pr-1">
              <!-- Rendered by JS -->
            </div>

            <!-- Totals & Payment Section -->
            <div class="pt-2.5 border-t border-slate-800 space-y-2.5">
              <div class="space-y-1 text-xs">
                <div class="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span id="pos-subtotal-val" class="font-mono">$ 0.00</span>
                </div>
                <div class="flex justify-between text-slate-400">
                  <span>IVA (16%):</span>
                  <span id="pos-iva-val" class="font-mono">$ 0.00</span>
                </div>
                <div class="flex justify-between text-base font-extrabold text-white pt-1 border-t border-slate-800/60">
                  <span>Total $ USD:</span>
                  <span id="pos-total-usd" class="font-mono text-emerald-400">$ 0.00</span>
                </div>
                <div class="flex justify-between text-xs font-bold text-emerald-300 font-mono">
                  <span>Total Bolívares:</span>
                  <span id="pos-total-bs">Bs. 0.00</span>
                </div>
              </div>

              <!-- Checkout Trigger Button -->
              <button onclick="openPosCheckoutModal()" id="btn-process-sale" class="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20">
                <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Cobrar Venta • Pago Móvil / Efectivo</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ================= 3. INVENTARIO VIEW ================= -->
      <section id="view-inventario" class="space-y-4 max-w-7xl mx-auto hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-base font-bold text-white">Control de Inventario Central y Sucursales</h2>
            <p class="text-xs text-slate-400">Existencias en tiempo real de Tienda 1, Tienda 2 y Oficina Central</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="openNewProductModal()" class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20">
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>

        <!-- Inventory Stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span class="text-xs text-slate-400 font-semibold">Total Ítems en Catálogo</span>
            <div id="inv-stat-items" class="text-xl font-bold font-mono text-white mt-1">0</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span class="text-xs text-slate-400 font-semibold">Valoración al Costo ($ USD)</span>
            <div id="inv-stat-cost-usd" class="text-xl font-bold font-mono text-amber-400 mt-1">$ 0.00</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span class="text-xs text-slate-400 font-semibold">Valoración Precio Venta ($ USD)</span>
            <div id="inv-stat-val-usd" class="text-xl font-bold font-mono text-emerald-400 mt-1">$ 0.00</div>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <span class="text-xs text-slate-400 font-semibold">Margen Bruto Proyectado</span>
            <div id="inv-stat-margin-usd" class="text-xl font-bold font-mono text-purple-300 mt-1">$ 0.00</div>
          </div>
        </div>

        <!-- Inter-Branch Transfer Box -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h3 class="text-xs font-bold text-white mb-3 flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            <span>Traspaso de Mercancía Entre Sucursales</span>
          </h3>
          <form onsubmit="handleTransferStockStandalone(event)" class="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Origen:</label>
              <select id="transfer-origen" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white">
                <option value="3">Oficina Central / Almacén</option>
                <option value="1">Tienda 1 (Av. Principal)</option>
                <option value="2">Tienda 2 (C.C. Sambil)</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Destino:</label>
              <select id="transfer-destino" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white">
                <option value="1">Tienda 1 (Av. Principal)</option>
                <option value="2">Tienda 2 (C.C. Sambil)</option>
                <option value="3">Oficina Central / Almacén</option>
              </select>
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Producto:</label>
              <select id="transfer-prod" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white">
                <!-- Rendered by JS -->
              </select>
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Cantidad:</label>
              <input type="number" id="transfer-qty" min="1" required placeholder="0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono">
            </div>
            <div class="flex items-end">
              <button type="submit" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-emerald-500/20">
                Traspasar Stock
              </button>
            </div>
          </form>
        </div>

        <!-- Inventory Matrix Table with Search -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div class="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-300">Catálogo de Artículos y Existencias</h3>
            <input type="text" id="inv-search-input" oninput="renderInventario()" placeholder="Buscar producto o código..." class="bg-slate-900 border border-slate-700 text-xs text-white px-3 py-1 rounded-xl w-56">
          </div>
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3">Código</th>
                <th class="p-3">Producto</th>
                <th class="p-3 text-right">Costo $</th>
                <th class="p-3 text-right">Precio $</th>
                <th class="p-3 text-right">Margen</th>
                <th class="p-3 text-right text-sky-400">Tienda 1</th>
                <th class="p-3 text-right text-indigo-400">Tienda 2</th>
                <th class="p-3 text-right text-purple-400">Bodega</th>
                <th class="p-3 text-right font-bold text-emerald-400">Total</th>
                <th class="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody id="inventario-table-body" class="divide-y divide-slate-800">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 4. COMPRAS VIEW ================= -->
      <section id="view-compras" class="space-y-4 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-base font-bold text-white">Registro de Compras a Proveedores</h2>
            <p class="text-xs text-slate-400">Entrada directa a inventario y generación automática de Cuentas por Pagar</p>
          </div>
          <button onclick="openNewCompraModal()" class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Nueva Compra</span>
          </button>
        </div>

        <!-- Compras Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3">ID / Factura</th>
                <th class="p-3">Proveedor</th>
                <th class="p-3">Sucursal Destino</th>
                <th class="p-3">Fecha</th>
                <th class="p-3 text-right">Total $ USD</th>
                <th class="p-3 text-right">Total Bs</th>
              </tr>
            </thead>
            <tbody id="compras-table-body" class="divide-y divide-slate-800">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 4. CLIENTES VIEW ================= -->
      <section id="view-clientes" class="space-y-4 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-base font-bold text-white">Directorio de Clientes</h2>
            <p class="text-xs text-slate-400">Gestión de cartera de clientes, RIF y límites de crédito comercial</p>
          </div>
          <button onclick="openNewClienteModal()" class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20">
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Registrar Cliente</span>
          </button>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3">Nombre / Razón Social</th>
                <th class="p-3">RIF / Cédula</th>
                <th class="p-3">Teléfono</th>
                <th class="p-3 text-right">Límite Crédito</th>
                <th class="p-3 text-right">Saldo Pendiente</th>
                <th class="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody id="clientes-table-body" class="divide-y divide-slate-800">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 5. PROVEEDORES VIEW ================= -->
      <section id="view-proveedores" class="space-y-4 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-base font-bold text-white">Directorio de Proveedores</h2>
            <p class="text-xs text-slate-400">Proveedores de mercancía e insumos para las 3 sucursales</p>
          </div>
          <button onclick="openNewProveedorModal()" class="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20">
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            <span>Registrar Proveedor</span>
          </button>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3">Proveedor / Razón Social</th>
                <th class="p-3">RIF</th>
                <th class="p-3">Contacto / Teléfono</th>
                <th class="p-3 text-right">Saldo por Pagar</th>
                <th class="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody id="proveedores-table-body" class="divide-y divide-slate-800">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 6. CXC VIEW ================= -->
      <section id="view-cxc" class="space-y-4 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-base font-bold text-white">Cuentas por Cobrar (CxC)</h2>
            <p class="text-xs text-slate-400">Control de facturas a crédito emitidas a clientes y registro de abonos</p>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3">Factura</th>
                <th class="p-3">Cliente</th>
                <th class="p-3">Emisión / Vencimiento</th>
                <th class="p-3 text-right">Monto Original</th>
                <th class="p-3 text-right">Saldo Restante</th>
                <th class="p-3 text-center">Estado</th>
                <th class="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody id="cxc-table-body" class="divide-y divide-slate-800">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 7. CXP VIEW ================= -->
      <section id="view-cxp" class="space-y-4 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-base font-bold text-white">Cuentas por Pagar (CxP)</h2>
            <p class="text-xs text-slate-400">Obligaciones comerciales pendientes con proveedores</p>
          </div>
        </div>

        <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3">Factura Compra</th>
                <th class="p-3">Proveedor</th>
                <th class="p-3">Emisión / Vencimiento</th>
                <th class="p-3 text-right">Total Factura</th>
                <th class="p-3 text-right">Saldo Pendiente</th>
                <th class="p-3 text-center">Estado</th>
                <th class="p-3 text-center">Acción</th>
              </tr>
            </thead>
            <tbody id="cxp-table-body" class="divide-y divide-slate-800">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- ================= 8. REPORTES VIEW ================= -->
      <section id="view-reportes" class="space-y-6 max-w-7xl mx-auto">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div>
            <h2 class="text-base font-bold text-white">Centro de Reportes & Cortes Fiscales</h2>
            <p class="text-xs text-slate-400">Emisión de Corte X, Corte Z Diario y Libros de Compra / Venta</p>
          </div>
          <button onclick="window.print()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
            <span>Imprimir Informe</span>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Corte X -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white">Corte X (Parcial de Turno)</h3>
              <span class="text-[10px] bg-sky-500/20 text-sky-400 font-bold px-2 py-0.5 rounded">Informativo</span>
            </div>
            <p class="text-xs text-slate-400">Arqueo continuo de caja sin cerrar la jornada fiscal.</p>
            <div id="corte-x-content" class="bg-slate-950 p-3 rounded-xl font-mono text-xs text-slate-300 space-y-1">
              <!-- Rendered by JS -->
            </div>
          </div>

          <!-- Corte Z -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white">Corte Z (Cierre Fiscal Diario)</h3>
              <span class="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded">Definitivo</span>
            </div>
            <p class="text-xs text-slate-400">Totalización de ventas del día e incremento del correlativo Z.</p>
            <div id="corte-z-content" class="bg-slate-950 p-3 rounded-xl font-mono text-xs text-slate-300 space-y-1">
              <!-- Rendered by JS -->
            </div>
          </div>
        </div>
      </section>

      <!-- ================= 9. CONFIGURACIÓN VIEW ================= -->
      <section id="view-configuracion" class="space-y-6 max-w-7xl mx-auto">
        <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <h2 class="text-base font-bold text-white">Configuración del Sistema</h2>
          <p class="text-xs text-slate-400">Gestión de datos de empresa, nombres de sucursales y seguridad de usuarios</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Company & Fiscal Info Form -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-bold text-white">Datos Fiscales de la Empresa</h3>
            <div class="space-y-3 text-xs">
              <div>
                <label class="block text-slate-400 mb-1">Razón Social:</label>
                <input type="text" id="cfg-company-name" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-slate-400 mb-1">RIF:</label>
                  <input type="text" id="cfg-company-rif" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                </div>
                <div>
                  <label class="block text-slate-400 mb-1">Teléfono:</label>
                  <input type="text" id="cfg-company-tel" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
                </div>
              </div>
              <div>
                <label class="block text-slate-400 mb-1">Dirección Fiscal:</label>
                <input type="text" id="cfg-company-dir" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
              </div>
              <button onclick="saveCompanyConfig()" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer">
                Guardar Datos Fiscales
              </button>
            </div>
          </div>

          <!-- User Security & PIN Management -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 class="text-sm font-bold text-white">Usuarios y Permisos por PIN</h3>
            <p class="text-xs text-slate-400">Selecciona un colaborador para modificar su nombre, PIN de 4 dígitos o permisos.</p>

            <select id="cfg-user-select" onchange="loadUserForEdit()" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white">
              <!-- Rendered by JS -->
            </select>

            <div id="cfg-user-edit-box" class="space-y-3 text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div>
                <label class="block text-slate-400 mb-1">Nombre Completo:</label>
                <input type="text" id="cfg-user-name" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white">
              </div>
              <div>
                <label class="block text-slate-400 mb-1">PIN de 4 dígitos:</label>
                <input type="password" maxlength="4" id="cfg-user-pin" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white font-mono text-center tracking-widest">
              </div>
              <button onclick="saveUserChanges()" class="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer">
                Guardar Cambios de Usuario
              </button>
            </div>
          </div>
        </div>
      </section>

    </main>
  </div>

  <!-- ================= MODALS ================= -->

  <!-- LOGIN WITH PIN MODAL -->
  <div id="modal-login" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-white">Ingreso de Colaborador</h3>
        <button onclick="closeLoginModal()" class="text-slate-400 hover:text-white">&times;</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">Selecciona tu usuario:</label>
          <select id="login-user-select" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs">
            <!-- Rendered by JS -->
          </select>
        </div>

        <div>
          <label class="block text-slate-400 mb-1">PIN de Seguridad (4 dígitos):</label>
          <input type="password" maxlength="4" id="login-pin-input" placeholder="••••" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-center text-lg font-mono tracking-widest text-white focus:outline-none focus:border-emerald-500">
        </div>

        <p id="login-error-msg" class="text-xs text-rose-400 font-semibold hidden"></p>

        <button onclick="submitPinLogin()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer">
          Autenticar y Entrar
        </button>
      </div>
    </div>
  </div>

  <!-- PIN GUIDE MODAL -->
  <div id="modal-pin-guide" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-white">Guía de PINs de Prueba</h3>
        <button onclick="closePinGuideModal()" class="text-slate-400 hover:text-white">&times;</button>
      </div>
      <p class="text-xs text-slate-400">Usa estos PINs predeterminados para probar la autenticación y permisos:</p>
      <div id="pin-guide-list" class="space-y-2 text-xs">
        <!-- Rendered by JS -->
      </div>
    </div>
  </div>

  <!-- DAILY RATE MODAL -->
  <div id="modal-tasa" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-bold text-white">Cotización Diaria (USD / Bs)</h3>
        <button onclick="closeTasaModal()" class="text-slate-400 hover:text-white">&times;</button>
      </div>
      <p class="text-xs text-slate-400">Ingresa la tasa oficial del día para la conversión automática en cajas y reportes:</p>
      <div class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">Tasa en Bolívares por 1 USD:</label>
          <input type="number" step="0.01" id="tasa-input-val" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 font-mono text-base text-emerald-400 font-bold">
        </div>
        <button onclick="saveDailyRate()" class="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer">
          Confirmar y Aplicar Tasa
        </button>
      </div>
    </div>
  </div>

  <!-- CLIENTE MODAL (NEW / EDIT) -->
  <div id="modal-cliente" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 id="modal-cliente-title" class="text-base font-bold text-white">Registrar Nuevo Cliente</h3>
        <button onclick="closeClienteModal()" class="text-slate-400 hover:text-white text-lg">&times;</button>
      </div>
      <form onsubmit="saveClienteForm(event)" class="space-y-3 text-xs">
        <input type="hidden" id="cli-form-id" value="">
        <div>
          <label class="block text-slate-400 mb-1">Nombre Completo / Razón Social <span class="text-rose-400">*</span></label>
          <input type="text" id="cli-form-nombre" required placeholder="Ej. Distribuidora Central C.A." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">RIF / Cédula <span class="text-rose-400">*</span></label>
            <input type="text" id="cli-form-rif" required placeholder="J-12345678-0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Teléfono</label>
            <input type="text" id="cli-form-tel" placeholder="+58 414-0000000" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Correo Electrónico</label>
            <input type="email" id="cli-form-email" placeholder="cliente@correo.com" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Límite de Crédito ($ USD)</label>
            <input type="number" id="cli-form-limite" min="0" value="300" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onclick="closeClienteModal()" class="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer">Guardar Cliente</button>
        </div>
      </form>
    </div>
  </div>

  <!-- PROVEEDOR MODAL (NEW / EDIT) -->
  <div id="modal-proveedor" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 id="modal-proveedor-title" class="text-base font-bold text-white">Registrar Nuevo Proveedor</h3>
        <button onclick="closeProveedorModal()" class="text-slate-400 hover:text-white text-lg">&times;</button>
      </div>
      <form onsubmit="saveProveedorForm(event)" class="space-y-3 text-xs">
        <input type="hidden" id="prov-form-id" value="">
        <div>
          <label class="block text-slate-400 mb-1">Razón Social / Proveedor <span class="text-rose-400">*</span></label>
          <input type="text" id="prov-form-nombre" required placeholder="Ej. Alimentos Polar Comercial C.A." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">RIF <span class="text-rose-400">*</span></label>
            <input type="text" id="prov-form-rif" required placeholder="J-00000000-0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono uppercase">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Persona de Contacto</label>
            <input type="text" id="prov-form-contacto" placeholder="Lic. Marcos Delgado" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Teléfono</label>
            <input type="text" id="prov-form-tel" placeholder="+58 212-0000000" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Correo Electrónico</label>
            <input type="email" id="prov-form-email" placeholder="pedidos@proveedor.com" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
          </div>
        </div>
        <div>
          <label class="block text-slate-400 mb-1">Dirección / Galpón</label>
          <input type="text" id="prov-form-dir" placeholder="Zona Industrial" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onclick="closeProveedorModal()" class="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer">Guardar Proveedor</button>
        </div>
      </form>
    </div>
  </div>

  <!-- COMPRA MODAL -->
  <div id="modal-compra" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white">Registrar Nueva Compra a Proveedor</h3>
        <button onclick="closeCompraModal()" class="text-slate-400 hover:text-white text-lg">&times;</button>
      </div>
      <form onsubmit="saveCompraForm(event)" class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1">Proveedor:</label>
          <select id="compra-form-prov" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
            <!-- Rendered by JS -->
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-slate-400 mb-1">Nro de Factura:</label>
            <input type="text" id="compra-form-nro" required placeholder="FAC-0098" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
          </div>
          <div>
            <label class="block text-slate-400 mb-1">Sucursal Destino:</label>
            <select id="compra-form-suc" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
              <option value="1">Tienda 1</option>
              <option value="2">Tienda 2</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-slate-400 mb-1">Monto Total de Compra ($ USD):</label>
          <input type="number" step="0.01" min="1" id="compra-form-total" required placeholder="0.00" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold text-base">
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onclick="closeCompraModal()" class="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer">Registrar Compra</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: NUEVO PRODUCTO -->
  <div id="modal-producto" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <span>Registrar Nuevo Artículo en Catálogo</span>
        </h3>
        <button onclick="closeNewProductModal()" class="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">&times;</button>
      </div>

      <form onsubmit="saveNewProductStandalone(event)" class="space-y-3 text-xs">
        <div>
          <label class="block text-slate-400 mb-1 font-semibold">Código de Barras / SKU:</label>
          <input type="text" id="prod-form-code" required placeholder="7591009" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
        </div>
        <div>
          <label class="block text-slate-400 mb-1 font-semibold">Nombre / Descripción:</label>
          <input type="text" id="prod-form-name" required placeholder="Ej: Arroz Integral 1kg" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
        </div>
        <div class="grid grid-cols-2 gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <div>
            <label class="block text-amber-400 mb-1 font-semibold">Costo Unitario ($):</label>
            <input type="number" step="0.01" min="0" id="prod-form-cost" required placeholder="1.80" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold">
          </div>
          <div>
            <label class="block text-emerald-400 mb-1 font-semibold">Precio Venta ($):</label>
            <input type="number" step="0.01" min="0.01" id="prod-form-price" required placeholder="2.50" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold">
          </div>
        </div>
        <div>
          <label class="block text-slate-400 mb-1">Stock Inicial Bodega:</label>
          <input type="number" min="0" id="prod-form-stock-oficina" required placeholder="100" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-purple-400 font-mono font-bold">
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onclick="closeNewProductModal()" class="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-emerald-500/20">Guardar Artículo</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: EDITAR PRODUCTO -->
  <div id="modal-edit-producto" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          <span>Editar Artículo de Catálogo</span>
        </h3>
        <button onclick="closeEditProductModal()" class="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">&times;</button>
      </div>

      <form onsubmit="saveEditProductStandalone(event)" class="space-y-3 text-xs">
        <input type="hidden" id="edit-prod-id">
        <div>
          <label class="block text-slate-400 mb-1 font-semibold">Código de Barras / SKU:</label>
          <input type="text" id="edit-prod-code" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
        </div>
        <div>
          <label class="block text-slate-400 mb-1 font-semibold">Nombre / Descripción:</label>
          <input type="text" id="edit-prod-name" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
        </div>
        <div class="grid grid-cols-2 gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
          <div>
            <label class="block text-amber-400 mb-1 font-semibold">Costo Unitario ($):</label>
            <input type="number" step="0.01" min="0" id="edit-prod-cost" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold">
          </div>
          <div>
            <label class="block text-emerald-400 mb-1 font-semibold">Precio Venta ($):</label>
            <input type="number" step="0.01" min="0.01" id="edit-prod-price" required class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-emerald-400 font-mono font-bold">
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onclick="closeEditProductModal()" class="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs cursor-pointer">Cancelar</button>
          <button type="submit" class="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-lg shadow-sky-500/20">Guardar Cambios</button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: SELECCIONAR O CREAR CLIENTE EN POS -->
  <div id="modal-pos-cliente" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 relative">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-white text-base">Seleccionar Cliente para la Venta</h3>
            <p class="text-xs text-slate-400">Si no seleccionas uno, se procesará como "Cliente de Contado"</p>
          </div>
        </div>
        <button onclick="closePosClientModal()" class="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">&times;</button>
      </div>

      <!-- Main Client Selection View -->
      <div id="pos-client-select-view" class="space-y-3.5">
        <div class="relative">
          <input type="text" id="pos-client-search-input" onkeyup="filterPosClientList()" placeholder="Buscar por nombre, Cédula/RIF o teléfono..." class="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500">
          <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- Default Contado Card -->
        <div onclick="resetPosClienteToContado(); closePosClientModal();" class="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl flex items-center justify-between cursor-pointer transition-all">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
              CC
            </div>
            <div>
              <h4 class="font-bold text-xs text-white">Cliente de Contado (Predeterminado)</h4>
              <p class="text-[11px] text-slate-400">Consumidor Final / Sin registro de cuenta</p>
            </div>
          </div>
          <span class="text-xs text-emerald-400 font-bold">Seleccionar</span>
        </div>

        <!-- Client Results List -->
        <div id="pos-client-list-container" class="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          <!-- Rendered by JS -->
        </div>

        <!-- Footer Buttons -->
        <div class="flex gap-2 pt-2 border-t border-slate-800">
          <button type="button" onclick="showPosQuickNewClient(true)" class="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
            <span>+ Registrar Nuevo Cliente</span>
          </button>
          <button type="button" onclick="closePosClientModal()" class="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer">
            Cerrar
          </button>
        </div>
      </div>

      <!-- Quick New Client Form -->
      <div id="pos-client-form-view" class="space-y-3 hidden">
        <h4 class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/></svg>
          <span>Registro Rápido de Cliente</span>
        </h4>
        <form onsubmit="savePosQuickNewClient(event)" class="space-y-3 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Nombre / Razón Social *</label>
              <input type="text" id="pos-new-client-name" required placeholder="Ej: Inversiones Los Andes C.A." class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Cédula o RIF *</label>
              <input type="text" id="pos-new-client-rif" required placeholder="Ej: J-12345678-0" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Teléfono</label>
              <input type="text" id="pos-new-client-tel" placeholder="0414-1234567" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white">
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">Límite Crédito ($)</label>
              <input type="number" id="pos-new-client-limit" min="0" step="10" placeholder="0.00" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono">
            </div>
          </div>
          <div class="flex gap-2 pt-2 border-t border-slate-800">
            <button type="submit" class="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer">
              Guardar y Asignar a la Venta
            </button>
            <button type="button" onclick="showPosQuickNewClient(false)" class="py-2.5 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer">
              Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- MODAL: COBRO MULTI-MÉTODO (PAGO MÓVIL, EFECTIVO USD, EFECTIVO BS, MIXTO) -->
  <div id="modal-pos-checkout" class="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-5 relative">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3.5">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <h3 class="font-bold text-white text-lg">Cobro de Venta</h3>
            <p class="text-xs text-slate-400">Cliente: <strong id="pos-chk-client-name" class="text-white">Cliente de Contado</strong> (<span id="pos-chk-client-rif">V-00000000</span>)</p>
          </div>
        </div>
        <div class="text-right">
          <div id="pos-chk-total-usd" class="text-xl sm:text-2xl font-black text-emerald-400 font-mono">$ 0.00</div>
          <div id="pos-chk-total-bs" class="text-xs font-mono text-slate-300 font-semibold">Bs. 0.00</div>
        </div>
      </div>

      <!-- Payment Method Tabs -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <button type="button" onclick="setPosCheckoutMethod('pago_movil')" id="tab-pay-pago_movil" class="p-3 rounded-xl border border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold text-center flex flex-col items-center gap-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          <span>Pago Móvil</span>
          <span class="text-[9px] font-mono text-slate-400 font-normal">Bolívares</span>
        </button>

        <button type="button" onclick="setPosCheckoutMethod('efectivo_usd')" id="tab-pay-efectivo_usd" class="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-center flex flex-col items-center gap-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          <span>Efectivo ($)</span>
          <span class="text-[9px] font-mono text-slate-400 font-normal">Dólares USD</span>
        </button>

        <button type="button" onclick="setPosCheckoutMethod('efectivo_bs')" id="tab-pay-efectivo_bs" class="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-center flex flex-col items-center gap-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Efectivo (Bs)</span>
          <span class="text-[9px] font-mono text-slate-400 font-normal">Bolívares</span>
        </button>

        <button type="button" onclick="setPosCheckoutMethod('mixto')" id="tab-pay-mixto" class="p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-center flex flex-col items-center gap-1 cursor-pointer">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          <span>Pago Mixto</span>
          <span class="text-[9px] font-mono text-slate-400 font-normal">Combinado</span>
        </button>
      </div>

      <!-- TAB 1: PAGO MÓVIL -->
      <div id="pos-tab-content-pago_movil" class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5">
        <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div>
            <span class="text-xs text-slate-400 block">Monto exacto a transferir:</span>
            <span id="pos-pm-monto-bs" class="text-lg font-mono font-bold text-emerald-400">Bs. 0.00</span>
          </div>
          <div class="text-right">
            <span class="text-[11px] text-slate-500 font-mono">Equivalente USD:</span>
            <span id="pos-pm-monto-usd" class="text-xs font-mono font-bold text-white block">$ 0.00</span>
          </div>
        </div>

        <div class="space-y-3">
          <div>
            <label class="text-xs font-bold text-white block mb-1.5">Número de Referencia del Pago Móvil *</label>
            <input type="text" id="pos-chk-pm-ref" placeholder="Ej: 489201 o últimos 6/8 dígitos" class="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm px-4 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-600">
          </div>
          <div>
            <label class="text-[11px] text-slate-400 block mb-1">Banco Receptor de la Empresa</label>
            <select id="pos-chk-pm-banco" class="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl focus:outline-none">
              <option value="0102 - Banco de Venezuela">0102 - Banco de Venezuela</option>
              <option value="0134 - Banesco">0134 - Banesco</option>
              <option value="0105 - Banco Mercantil">0105 - Banco Mercantil</option>
              <option value="0108 - Banco Provincial">0108 - Banco Provincial</option>
              <option value="0172 - Bancamiga">0172 - Bancamiga</option>
            </select>
          </div>
          <div class="bg-slate-900/60 p-2.5 rounded-xl text-[11px] text-slate-400 space-y-0.5 border border-slate-800/70">
            <p class="font-semibold text-slate-300">Datos para Pago Móvil de la Empresa:</p>
            <p>RIF: <strong id="pos-pm-empresa-rif" class="text-white font-mono">J-31045892-0</strong> • Tlf: <strong id="pos-pm-empresa-tel" class="text-white">+58 274 263-4411</strong></p>
          </div>
        </div>
      </div>

      <!-- TAB 2: EFECTIVO USD -->
      <div id="pos-tab-content-efectivo_usd" class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5 hidden">
        <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div>
            <span class="text-xs text-slate-400 block">Total a Pagar en Dólares:</span>
            <span id="pos-usd-monto-usd" class="text-xl font-mono font-bold text-white">$ 0.00</span>
          </div>
          <div class="text-right">
            <span class="text-[11px] text-slate-500 font-mono">Tasa aplicada:</span>
            <span id="pos-usd-tasa-text" class="text-xs font-mono text-emerald-400 block">1$ = Bs. 36.50</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-white block">Monto Entregado por el Cliente ($ USD)</label>
          <input type="number" step="0.01" min="0" id="pos-chk-usd-recibido" oninput="calcPosCheckoutChange()" placeholder="0.00" class="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-lg px-4 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none">

          <div class="flex flex-wrap gap-1.5 pt-1">
            <button type="button" onclick="setPosUsdExact()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer">Exacto</button>
            <button type="button" onclick="setPosUsdChip(5)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer">$5</button>
            <button type="button" onclick="setPosUsdChip(10)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer">$10</button>
            <button type="button" onclick="setPosUsdChip(20)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer">$20</button>
            <button type="button" onclick="setPosUsdChip(50)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer">$50</button>
            <button type="button" onclick="setPosUsdChip(100)" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer">$100</button>
          </div>
        </div>

        <div id="pos-usd-status-box" class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span id="pos-usd-status-label" class="text-xs text-slate-400 block">Cambio / Vuelto a Entregar:</span>
            <span id="pos-usd-status-val" class="text-lg font-mono font-black text-emerald-400">$ 0.00</span>
          </div>
          <div class="text-right">
            <span id="pos-usd-status-sublabel" class="text-[10px] text-slate-500 block">Equivalente en Bolívares:</span>
            <span id="pos-usd-status-subval" class="text-xs font-mono font-bold text-slate-300">Bs. 0.00</span>
          </div>
        </div>
      </div>

      <!-- TAB 3: EFECTIVO BS -->
      <div id="pos-tab-content-efectivo_bs" class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3.5 hidden">
        <div class="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div>
            <span class="text-xs text-slate-400 block">Total a Pagar en Bolívares:</span>
            <span id="pos-bs-monto-bs" class="text-xl font-mono font-bold text-emerald-400">Bs. 0.00</span>
          </div>
          <div class="text-right">
            <span class="text-[11px] text-slate-500 font-mono">Monto en USD:</span>
            <span id="pos-bs-monto-usd" class="text-xs font-mono font-bold text-white block">$ 0.00</span>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-xs font-bold text-white block">Monto Entregado por el Cliente (Bs.)</label>
          <input type="number" step="0.01" min="0" id="pos-chk-bs-recibido" oninput="calcPosCheckoutChange()" placeholder="0.00" class="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-lg px-4 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none">

          <div class="flex flex-wrap gap-1.5 pt-1">
            <button type="button" onclick="setPosBsExact()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer">Exacto</button>
            <button type="button" onclick="setPosBsRound()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono cursor-pointer">Redondear</button>
          </div>
        </div>

        <div id="pos-bs-status-box" class="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span id="pos-bs-status-label" class="text-xs text-slate-400 block">Vuelto en Bolívares:</span>
            <span id="pos-bs-status-val" class="text-lg font-mono font-black text-emerald-400">Bs. 0.00</span>
          </div>
          <div class="text-right">
            <span id="pos-bs-status-sublabel" class="text-[10px] text-slate-500 block">Equivalente en USD:</span>
            <span id="pos-bs-status-subval" class="text-xs font-mono font-bold text-slate-300">$ 0.00</span>
          </div>
        </div>
      </div>

      <!-- TAB 4: PAGO MIXTO -->
      <div id="pos-tab-content-mixto" class="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 hidden">
        <div class="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl text-xs">
          <span>Total: <strong id="pos-mixto-total-header" class="text-white font-mono">$ 0.00</strong></span>
          <span id="pos-mixto-status-badge" class="text-amber-400 font-bold">Faltan por cubrir</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label class="text-[11px] font-bold text-slate-300 block">1. Efectivo USD ($)</label>
            <input type="number" step="0.01" min="0" id="pos-mixto-usd" oninput="calcPosCheckoutChange()" placeholder="$ 0.00" class="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white font-mono">
          </div>

          <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label class="text-[11px] font-bold text-slate-300 block">2. Pago Móvil (Bs.)</label>
            <input type="number" step="0.01" min="0" id="pos-mixto-pm-bs" oninput="calcPosCheckoutChange()" placeholder="Bs. 0.00" class="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-emerald-400 font-mono">
            <input type="text" id="pos-mixto-pm-ref" placeholder="Ref Pago Móvil" class="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[11px] text-white font-mono mt-1">
          </div>

          <div class="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
            <label class="text-[11px] font-bold text-slate-300 block">3. Efectivo Bs.</label>
            <input type="number" step="0.01" min="0" id="pos-mixto-bs" oninput="calcPosCheckoutChange()" placeholder="Bs. 0.00" class="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white font-mono">
          </div>
        </div>

        <div class="space-y-2">
          <div class="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
            <div>
              <span class="text-slate-400 block">Total Cubierto:</span>
              <span id="pos-mixto-cubierto-val" class="font-mono font-bold text-emerald-400">$ 0.00 (Bs. 0.00)</span>
            </div>
            <div id="pos-mixto-vuelto-box" class="text-right hidden">
              <span class="text-slate-400 block">Vuelto:</span>
              <span id="pos-mixto-vuelto-val" class="font-mono font-bold text-emerald-400">$ 0.00</span>
            </div>
          </div>

          <div id="pos-mixto-faltante-box" class="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex justify-between items-center text-xs">
            <div class="flex items-center gap-1.5 text-amber-300 font-semibold">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <span>Faltante por Pagar:</span>
            </div>
            <div class="text-right">
              <span id="pos-mixto-faltante-val" class="font-mono font-bold text-amber-400">$ 0.00 (Bs. 0.00)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2.5 pt-2">
        <button type="button" onclick="confirmPosCheckout()" class="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2">
          <svg class="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
          <span>Confirmar Pago y Registrar Venta</span>
        </button>
        <button type="button" onclick="closePosCheckoutModal()" class="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer">
          Cancelar
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL: RECIBO / TICKET FISCAL PREVIEW -->
  <div id="modal-pos-receipt" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white text-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4 font-mono text-xs relative max-h-[90vh] overflow-y-auto">
      <button onclick="closePosReceiptModal()" class="absolute top-3 right-3 text-slate-400 hover:text-slate-800 text-lg font-bold cursor-pointer">&times;</button>
      
      <div id="pos-receipt-modal-content">
        <!-- Rendered by JS -->
      </div>

      <div class="flex gap-2 pt-2 border-t border-dashed border-slate-300 font-sans">
        <button type="button" onclick="printPosReceiptDirect()" class="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          <span>Imprimir Ticket</span>
        </button>
        <button type="button" onclick="closePosReceiptModal()" class="bg-slate-200 text-slate-800 hover:bg-slate-300 py-2.5 px-4 rounded-xl font-bold text-xs cursor-pointer">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- PRINTABLE RECEIPT CONTAINER (Used when printing) -->
  <div id="printable-receipt" class="hidden"></div>

  <!-- ================= LOGIC SCRIPT ================= -->
  <script>
    // Initial Database / State
    const DB_KEY = 'pos_multisucursal_standalone_db_v2';

    const INITIAL_DATA = {
      empresaConfig: {
        nombreEmpresa: "Corporación Los Andes C.A.",
        rif: "J-31045892-0",
        direccionFiscal: "Av. Las Américas, Centro Empresarial Torre A, Piso 4",
        telefono: "+58 274 263-4411",
        tasaCambio: 36.50,
        nombreTienda1: "Tienda 1 (Av. Principal)",
        nombreTienda2: "Tienda 2 (C.C. Sambil)",
        nombreOficina: "Oficina Central / Almacén",
      },
      currentUser: {
        id: 1,
        nombre_completo: "Ana Morales",
        email: "ana.morales@empresa.com",
        rol: "admin",
        sucursal_id: 3,
        pin: "1234",
        permisos: { dashboard: true, ventas: true, compras: true, clientes: true, proveedores: true, cxc: true, cxp: true, reportes: true, configuracion: true }
      },
      usuarios: [
        { id: 1, nombre_completo: "Ana Morales", rol: "admin", pin: "1234", permisos: { dashboard: true, ventas: true, inventario: true, compras: true, clientes: true, proveedores: true, cxc: true, cxp: true, reportes: true, configuracion: true } },
        { id: 2, nombre_completo: "Carlos Mendoza", rol: "supervisor", pin: "2345", permisos: { dashboard: true, ventas: true, inventario: true, compras: true, clientes: true, proveedores: true, cxc: true, cxp: true, reportes: true, configuracion: false } },
        { id: 3, nombre_completo: "Sofia Castro", rol: "cajero", pin: "3456", permisos: { dashboard: false, ventas: true, inventario: false, compras: false, clientes: false, proveedores: false, cxc: false, cxp: false, reportes: false, configuracion: false } },
        { id: 4, nombre_completo: "Miguel Ángel Peña", rol: "cajero", pin: "4567", permisos: { dashboard: false, ventas: true, inventario: false, compras: false, clientes: false, proveedores: false, cxc: false, cxp: false, reportes: false, configuracion: false } },
        { id: 5, nombre_completo: "Valentina Díaz", rol: "supervisor", pin: "5678", permisos: { dashboard: true, ventas: true, inventario: true, compras: true, clientes: true, proveedores: true, cxc: true, cxp: true, reportes: true, configuracion: false } },
        { id: 6, nombre_completo: "Luis Gómez", rol: "cajero", pin: "6789", permisos: { dashboard: false, ventas: true, inventario: false, compras: false, clientes: false, proveedores: false, cxc: false, cxp: false, reportes: false, configuracion: false } },
      ],
      productos: [
        { id: 1, codigo_barras: "7591001", nombre: "Harina PAN 1kg", precio: 1.20, costo: 0.85 },
        { id: 2, codigo_barras: "7591002", nombre: "Arroz Primor 1kg", precio: 1.50, costo: 1.05 },
        { id: 3, codigo_barras: "7591003", nombre: "Aceite Mazeite 1L", precio: 3.80, costo: 2.70 },
        { id: 4, codigo_barras: "7591004", nombre: "Pasta Primor 1kg", precio: 1.40, costo: 0.95 },
        { id: 5, codigo_barras: "7591005", nombre: "Café Fama de América 500g", precio: 4.50, costo: 3.20 },
        { id: 6, codigo_barras: "7591006", nombre: "Azúcar Montalbán 1kg", precio: 1.30, costo: 0.90 },
        { id: 7, codigo_barras: "7591007", nombre: "Leche La Campiña 1kg", precio: 7.20, costo: 5.10 },
        { id: 8, codigo_barras: "7591008", nombre: "Atún Margarita 140g", precio: 2.10, costo: 1.45 },
      ],
      inventario: [
        { sucursal_id: 1, producto_id: 1, stock: 120 },
        { sucursal_id: 1, producto_id: 2, stock: 85 },
        { sucursal_id: 1, producto_id: 3, stock: 45 },
        { sucursal_id: 1, producto_id: 4, stock: 90 },
        { sucursal_id: 1, producto_id: 5, stock: 60 },
        { sucursal_id: 1, producto_id: 6, stock: 75 },
        { sucursal_id: 1, producto_id: 7, stock: 30 },
        { sucursal_id: 1, producto_id: 8, stock: 50 },
        { sucursal_id: 2, producto_id: 1, stock: 95 },
        { sucursal_id: 2, producto_id: 2, stock: 70 },
        { sucursal_id: 2, producto_id: 3, stock: 35 },
        { sucursal_id: 2, producto_id: 4, stock: 80 },
        { sucursal_id: 2, producto_id: 5, stock: 40 },
        { sucursal_id: 2, producto_id: 6, stock: 65 },
        { sucursal_id: 2, producto_id: 7, stock: 25 },
        { sucursal_id: 2, producto_id: 8, stock: 45 },
        { sucursal_id: 3, producto_id: 1, stock: 1200 },
        { sucursal_id: 3, producto_id: 2, stock: 800 },
        { sucursal_id: 3, producto_id: 3, stock: 650 },
        { sucursal_id: 3, producto_id: 4, stock: 900 },
        { sucursal_id: 3, producto_id: 5, stock: 450 },
        { sucursal_id: 3, producto_id: 6, stock: 700 },
        { sucursal_id: 3, producto_id: 7, stock: 300 },
        { sucursal_id: 3, producto_id: 8, stock: 500 },
      ],
      ventas: [],
      compras: [
        { id: 1, proveedorNombre: "Alimentos Polar C.A.", numeroFactura: "FAC-8890", sucursalId: 1, fecha: "2026-08-15", total: 450.00 },
        { id: 2, proveedorNombre: "Distribuidora Monaca", numeroFactura: "FAC-9012", sucursalId: 2, fecha: "2026-08-15", total: 320.00 }
      ],
      clientes: [
        { id: 1, nombre: "Inversiones El Sol C.A.", rif: "J-40112233-4", telefono: "0414-1234567", limiteCredito: 500.00, saldoPendiente: 120.00 },
        { id: 2, nombre: "Comercializadora Ávila", rif: "J-30998877-1", telefono: "0424-7654321", limiteCredito: 800.00, saldoPendiente: 0.00 }
      ],
      proveedores: [
        { id: 1, nombre: "Alimentos Polar C.A.", rif: "J-00041372-9", contacto: "ventas@polar.com", saldoPendiente: 450.00 },
        { id: 2, proveedor: "Distribuidora Monaca", rif: "J-00018742-1", contacto: "pedidos@monaca.com", saldoPendiente: 320.00 }
      ],
      cxc: [
        { id: 1, factura: "FAC-00102", clienteNombre: "Inversiones El Sol C.A.", fecha: "2026-08-10", montoTotal: 250.00, saldoRestante: 120.00, estado: "parcial" }
      ],
      cxp: [
        { id: 1, factura: "COMP-8890", proveedorNombre: "Alimentos Polar C.A.", fecha: "2026-08-15", montoTotal: 450.00, saldoRestante: 450.00, estado: "pendiente" }
      ]
    };

    // Load State
    let AppState = (function() {
      try {
        const saved = localStorage.getItem(DB_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return INITIAL_DATA;
    })();

    function saveState() {
      try {
        localStorage.setItem(DB_KEY, JSON.stringify(AppState));
      } catch (e) {}
    }

    // POS Cart & Checkout State
    let posCart = [];
    let posSelectedCliente = { id: null, nombre: 'Cliente de Contado', rif: 'V-00000000', telefono: 'N/A' };
    let posCheckoutMethod = 'pago_movil';
    let lastCompletedSale = null;
    let currentTab = 'ventas';
    let chartInstance = null;

    // Currency Formatter
    function formatUSD(val) {
      return '$ ' + Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function formatBs(val) {
      const bs = (Number(val || 0) * AppState.empresaConfig.tasaCambio);
      return 'Bs. ' + bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Initialize UI
    function init() {
      updateTopBar();
      updateSidebarSecurity();
      updatePosClientDisplay();
      switchTab('ventas');
      renderPosProducts();
      renderDashboard();
    }

    function updateTopBar() {
      document.getElementById('top-tasa-text').textContent = '1 USD = ' + formatBs(1);
      document.getElementById('side-company-name').textContent = AppState.empresaConfig.nombreEmpresa;

      const user = AppState.currentUser;
      const badge = document.getElementById('auth-user-badge');
      if (user) {
        badge.innerHTML = \`
          <span class="px-2 py-0.5 rounded-md \${user.rol === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'} font-bold">
            \${user.nombre_completo} (\${user.rol === 'admin' ? 'Gerente General' : user.rol})
          </span>
        \`;
        document.getElementById('side-user-name').textContent = user.nombre_completo;
        document.getElementById('side-user-role').textContent = user.rol === 'admin' ? 'Gerente General' : 'Colaborador (' + user.rol + ')';
        document.getElementById('side-user-avatar').textContent = user.nombre_completo.split(' ').map(n=>n[0]).join('').substring(0,2);
      }
    }

    function updateSidebarSecurity() {
      const user = AppState.currentUser;
      const isAdmin = user && user.rol === 'admin';
      const perms = user ? user.permisos : { ventas: true };

      const tabs = ['dashboard', 'inventario', 'compras', 'clientes', 'proveedores', 'cxc', 'cxp', 'reportes', 'configuracion'];
      tabs.forEach(tab => {
        const lock = document.getElementById('lock-' + tab);
        const allowed = isAdmin || (perms && perms[tab]);
        if (lock) {
          if (allowed) lock.classList.add('hidden');
          else lock.classList.remove('hidden');
        }
      });
    }

    // ================= SIDEBAR COLLAPSE ENGINE =================
    let isSidebarCollapsed = false;

    function toggleSidebar() {
      setSidebarCollapsed(!isSidebarCollapsed);
    }

    function collapseSidebar() {
      setSidebarCollapsed(true);
    }

    function expandSidebar() {
      setSidebarCollapsed(false);
    }

    function setSidebarCollapsed(collapsed) {
      isSidebarCollapsed = collapsed;
      const sidebar = document.getElementById('main-sidebar');
      const toggleBtn = document.getElementById('btn-toggle-sidebar');
      const companyInfo = document.getElementById('side-company-info');
      const userText = document.getElementById('side-user-text');
      const modulesHeader = document.getElementById('side-modules-header');

      if (!sidebar) return;

      if (isSidebarCollapsed) {
        sidebar.classList.remove('w-64');
        sidebar.classList.add('w-16');
        if (companyInfo) companyInfo.classList.add('hidden');
        if (userText) userText.classList.add('hidden');
        if (modulesHeader) modulesHeader.classList.add('hidden');
        document.querySelectorAll('.nav-btn-text').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.nav-btn-badge').forEach(el => el.classList.add('hidden'));
        if (toggleBtn) {
          toggleBtn.innerHTML = '<svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>';
          toggleBtn.title = "Expandir menú lateral";
        }
      } else {
        sidebar.classList.remove('w-16');
        sidebar.classList.add('w-64');
        if (companyInfo) companyInfo.classList.remove('hidden');
        if (userText) userText.classList.remove('hidden');
        if (modulesHeader) modulesHeader.classList.remove('hidden');
        document.querySelectorAll('.nav-btn-text').forEach(el => el.classList.remove('hidden'));
        document.querySelectorAll('.nav-btn-badge').forEach(el => el.classList.remove('hidden'));
        if (toggleBtn) {
          toggleBtn.innerHTML = '<svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/></svg>';
          toggleBtn.title = "Colapsar menú lateral hacia la izquierda";
        }
      }
    }

    // TAB SWITCHING
    function switchTab(tabId) {
      const user = AppState.currentUser;
      const isAdmin = user && user.rol === 'admin';
      const allowed = isAdmin || (user && user.permisos && user.permisos[tabId]) || tabId === 'ventas';

      const allTabs = ['dashboard', 'ventas', 'inventario', 'compras', 'clientes', 'proveedores', 'cxc', 'cxp', 'reportes', 'configuracion'];
      
      // Auto-collapse sidebar to the left when selecting a module
      collapseSidebar();

      // Update Sidebar styling
      allTabs.forEach(t => {
        const btn = document.getElementById('nav-btn-' + t);
        if (btn) {
          if (t === tabId) {
            btn.className = 'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 transition-all shadow-md shadow-emerald-500/20 cursor-pointer';
          } else {
            btn.className = 'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer';
          }
        }
        const sec = document.getElementById('view-' + t);
        if (sec) sec.classList.add('hidden');
      });

      const restrictedDiv = document.getElementById('view-restricted');

      if (!allowed) {
        restrictedDiv.classList.remove('hidden');
        currentTab = tabId;
        return;
      }

      restrictedDiv.classList.add('hidden');
      const targetSec = document.getElementById('view-' + tabId);
      if (targetSec) targetSec.classList.remove('hidden');
      currentTab = tabId;

      if (tabId === 'dashboard') renderDashboard();
      if (tabId === 'inventario') renderInventario();
      if (tabId === 'compras') renderCompras();
      if (tabId === 'clientes') renderClientes();
      if (tabId === 'proveedores') renderProveedores();
      if (tabId === 'cxc') renderCxc();
      if (tabId === 'cxp') renderCxp();
      if (tabId === 'reportes') renderReportes();
      if (tabId === 'configuracion') renderConfiguracion();
    }

    // ================= INVENTARIO LOGIC =================
    function renderInventario() {
      // 1. Stats calculation
      const totalItems = AppState.productos.length;
      let totalValUSD = 0;
      let totalCostUSD = 0;
      AppState.productos.forEach(p => {
        const totalStockProd = AppState.inventario
          .filter(i => i.producto_id === p.id)
          .reduce((sum, i) => sum + i.stock, 0);
        const cost = p.costo !== undefined ? p.costo : +(p.precio * 0.7).toFixed(2);
        totalValUSD += (totalStockProd * p.precio);
        totalCostUSD += (totalStockProd * cost);
      });

      const totalMarginUSD = totalValUSD - totalCostUSD;

      const statItemsEl = document.getElementById('inv-stat-items');
      if (statItemsEl) statItemsEl.textContent = totalItems + ' productos';
      const statCostEl = document.getElementById('inv-stat-cost-usd');
      if (statCostEl) statCostEl.textContent = formatUSD(totalCostUSD);
      const statValEl = document.getElementById('inv-stat-val-usd');
      if (statValEl) statValEl.textContent = formatUSD(totalValUSD);
      const statMarginEl = document.getElementById('inv-stat-margin-usd');
      if (statMarginEl) statMarginEl.textContent = formatUSD(totalMarginUSD);

      // 2. Populate product transfer dropdown
      const prodSelect = document.getElementById('transfer-prod');
      if (prodSelect) {
        prodSelect.innerHTML = AppState.productos.map(p => \`
          <option value="\${p.id}">\${p.nombre} (SKU: \${p.codigo_barras})</option>
        \`).join('');
      }

      // 3. Filter Search
      const searchInput = document.getElementById('inv-search-input');
      const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

      const filtered = AppState.productos.filter(p => {
        if (!searchTerm) return true;
        return p.nombre.toLowerCase().includes(searchTerm) || p.codigo_barras.toLowerCase().includes(searchTerm);
      });

      // 4. Matrix Table
      const tbody = document.getElementById('inventario-table-body');
      if (tbody) {
        if (filtered.length === 0) {
          tbody.innerHTML = '<tr><td colspan="10" class="p-6 text-center text-slate-500">No se encontraron artículos</td></tr>';
        } else {
          tbody.innerHTML = filtered.map(p => {
            const s1 = (AppState.inventario.find(i => i.sucursal_id === 1 && i.producto_id === p.id)?.stock) || 0;
            const s2 = (AppState.inventario.find(i => i.sucursal_id === 2 && i.producto_id === p.id)?.stock) || 0;
            const s3 = (AppState.inventario.find(i => i.sucursal_id === 3 && i.producto_id === p.id)?.stock) || 0;
            const totalStock = s1 + s2 + s3;
            const cost = p.costo !== undefined ? p.costo : +(p.precio * 0.7).toFixed(2);
            const marginUSD = p.precio - cost;
            const marginPct = p.precio > 0 ? ((marginUSD / p.precio) * 100).toFixed(1) : '0.0';

            return \`
              <tr class="hover:bg-slate-800/50">
                <td class="p-3 font-mono text-emerald-400 font-bold">\${p.codigo_barras}</td>
                <td class="p-3 font-bold text-white">\${p.nombre}</td>
                <td class="p-3 text-right font-mono text-amber-400 font-bold">\${formatUSD(cost)}</td>
                <td class="p-3 text-right font-mono text-white font-bold">\${formatUSD(p.precio)}</td>
                <td class="p-3 text-right font-mono text-purple-300 font-semibold">\${marginPct}%</td>
                <td class="p-3 text-right font-mono font-bold text-sky-400">\${s1}</td>
                <td class="p-3 text-right font-mono font-bold text-indigo-400">\${s2}</td>
                <td class="p-3 text-right font-mono font-bold text-purple-400">\${s3}</td>
                <td class="p-3 text-right font-mono font-black text-emerald-400 bg-emerald-500/5">\${totalStock}</td>
                <td class="p-3 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button onclick="openEditProductModal(\${p.id})" title="Editar artículo" class="px-2 py-1 bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white rounded text-[11px] cursor-pointer">Editar</button>
                    <button onclick="deleteProductStandalone(\${p.id})" title="Eliminar artículo" class="px-2 py-1 bg-slate-800 hover:bg-rose-600 text-rose-400 hover:text-white rounded text-[11px] cursor-pointer">Eliminar</button>
                  </div>
                </td>
              </tr>
            \`;
          }).join('');
        }
      }
    }

    function openNewProductModal() {
      document.getElementById('prod-form-code').value = '';
      document.getElementById('prod-form-name').value = '';
      document.getElementById('prod-form-cost').value = '';
      document.getElementById('prod-form-price').value = '';
      document.getElementById('prod-form-stock-oficina').value = '50';
      document.getElementById('modal-producto').classList.remove('hidden');
    }

    function closeNewProductModal() {
      document.getElementById('modal-producto').classList.add('hidden');
    }

    function saveNewProductStandalone(e) {
      if (e) e.preventDefault();
      const code = document.getElementById('prod-form-code').value.trim();
      const name = document.getElementById('prod-form-name').value.trim();
      const cost = parseFloat(document.getElementById('prod-form-cost').value) || 0;
      const price = parseFloat(document.getElementById('prod-form-price').value);
      const stockOficina = parseInt(document.getElementById('prod-form-stock-oficina').value) || 0;

      if (!code || !name || isNaN(price) || price <= 0) {
        alert('Por favor complete todos los datos del producto con valores válidos.');
        return;
      }

      const newId = (Math.max(...AppState.productos.map(p => p.id), 0)) + 1;
      const newProd = {
        id: newId,
        codigo_barras: code,
        nombre: name,
        costo: cost > 0 ? cost : +(price * 0.7).toFixed(2),
        precio: price
      };

      AppState.productos.push(newProd);

      // Initialize stock entries
      AppState.inventario.push({ sucursal_id: 1, producto_id: newId, stock: 0 });
      AppState.inventario.push({ sucursal_id: 2, producto_id: newId, stock: 0 });
      AppState.inventario.push({ sucursal_id: 3, producto_id: newId, stock: stockOficina });

      saveState();
      renderInventario();
      renderPosProducts();
      closeNewProductModal();
      alert('¡Artículo "' + name + '" registrado exitosamente en el catálogo!');
    }

    function openEditProductModal(id) {
      const prod = AppState.productos.find(p => p.id === id);
      if (!prod) return;

      document.getElementById('edit-prod-id').value = prod.id;
      document.getElementById('edit-prod-code').value = prod.codigo_barras;
      document.getElementById('edit-prod-name').value = prod.nombre;
      document.getElementById('edit-prod-cost').value = prod.costo !== undefined ? prod.costo : (prod.precio * 0.7).toFixed(2);
      document.getElementById('edit-prod-price').value = prod.precio;

      document.getElementById('modal-edit-producto').classList.remove('hidden');
    }

    function closeEditProductModal() {
      document.getElementById('modal-edit-producto').classList.add('hidden');
    }

    function saveEditProductStandalone(e) {
      if (e) e.preventDefault();
      const id = parseInt(document.getElementById('edit-prod-id').value);
      const code = document.getElementById('edit-prod-code').value.trim();
      const name = document.getElementById('edit-prod-name').value.trim();
      const cost = parseFloat(document.getElementById('edit-prod-cost').value) || 0;
      const price = parseFloat(document.getElementById('edit-prod-price').value);

      if (!code || !name || isNaN(price) || price <= 0) {
        alert('Por favor complete todos los datos requeridos con valores válidos.');
        return;
      }

      const prod = AppState.productos.find(p => p.id === id);
      if (prod) {
        prod.codigo_barras = code;
        prod.nombre = name;
        prod.costo = cost;
        prod.precio = price;
      }

      saveState();
      renderInventario();
      renderPosProducts();
      closeEditProductModal();
      alert('¡Artículo "' + name + '" actualizado correctamente!');
    }

    function deleteProductStandalone(id) {
      const prod = AppState.productos.find(p => p.id === id);
      if (!prod) return;

      const totalStock = AppState.inventario
        .filter(i => i.producto_id === id)
        .reduce((sum, i) => sum + i.stock, 0);

      const confirmMsg = '¿Está seguro de eliminar el artículo "' + prod.nombre + '" (Código: ' + prod.codigo_barras + ')?\\n\\nActualmente tiene ' + totalStock + ' unidades registradas en inventario.';
      if (!confirm(confirmMsg)) return;

      AppState.productos = AppState.productos.filter(p => p.id !== id);
      AppState.inventario = AppState.inventario.filter(i => i.producto_id !== id);

      saveState();
      renderInventario();
      renderPosProducts();
      alert('Artículo eliminado del catálogo.');
    }

    function handleTransferStockStandalone(e) {
      if (e) e.preventDefault();
      const origenId = parseInt(document.getElementById('transfer-origen').value);
      const destinoId = parseInt(document.getElementById('transfer-destino').value);
      const prodId = parseInt(document.getElementById('transfer-prod').value);
      const qty = parseInt(document.getElementById('transfer-qty').value);

      if (origenId === destinoId) {
        alert('La sucursal de origen y destino no pueden ser la misma.');
        return;
      }
      if (isNaN(qty) || qty <= 0) {
        alert('Ingrese una cantidad válida a traspasar.');
        return;
      }

      let origenItem = AppState.inventario.find(i => i.sucursal_id === origenId && i.producto_id === prodId);
      if (!origenItem || origenItem.stock < qty) {
        alert('Stock insuficiente en la sucursal de origen (Disponible: ' + (origenItem ? origenItem.stock : 0) + ')');
        return;
      }

      // Deduct from origen
      origenItem.stock -= qty;

      // Add to destino
      let destinoItem = AppState.inventario.find(i => i.sucursal_id === destinoId && i.producto_id === prodId);
      if (destinoItem) {
        destinoItem.stock += qty;
      } else {
        AppState.inventario.push({ sucursal_id: destinoId, producto_id: prodId, stock: qty });
      }

      saveState();
      renderInventario();
      renderPosProducts();
      document.getElementById('transfer-qty').value = '';
      alert('¡Traspaso de ' + qty + ' unidades realizado exitosamente!');
    }

    // ================= POS LOGIC =================
    function getSelectedPosSucursalId() {
      return parseInt(document.getElementById('pos-sucursal-select').value) || 1;
    }

    function onPosSucursalChange() {
      renderPosProducts();
    }

    function renderPosProducts() {
      const grid = document.getElementById('pos-products-grid');
      const query = (document.getElementById('pos-search-input')?.value || '').toLowerCase();
      const sucursalId = getSelectedPosSucursalId();

      // Compute sales per product
      const salesMap = {};
      (AppState.ventas || []).forEach(v => {
        (v.items || []).forEach(it => {
          const pId = it.producto?.id || it.producto_id;
          if (pId) {
            salesMap[pId] = (salesMap[pId] || 0) + (it.cantidad || 0);
          }
        });
      });

      const filtered = AppState.productos.filter(p => 
        p.nombre.toLowerCase().includes(query) || p.codigo_barras.includes(query)
      );

      // Sort descending by sales count
      filtered.sort((a, b) => {
        const salesA = salesMap[a.id] || 0;
        const salesB = salesMap[b.id] || 0;
        if (salesB !== salesA) return salesB - salesA;
        return a.nombre.localeCompare(b.nombre);
      });

      if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-12 text-slate-500 text-xs">No se encontraron productos.</div>';
        return;
      }

      grid.innerHTML = filtered.map((p, idx) => {
        const invItem = AppState.inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === p.id);
        const stock = invItem ? invItem.stock : 0;
        const unitsSold = salesMap[p.id] || 0;
        const isTop = idx < 3 && unitsSold > 0;

        return \`
          <div onclick="addToPosCart(\${p.id})" class="bg-slate-950 border \${isTop ? 'border-amber-500/30' : 'border-slate-800'} hover:border-emerald-500/60 p-3 rounded-2xl cursor-pointer transition-all flex flex-col justify-between group shadow-sm">
            <div>
              <div class="flex items-center justify-between gap-1 mb-1.5">
                <span class="text-[9px] font-mono text-slate-500 truncate">#\${p.codigo_barras}</span>
                \${unitsSold > 0 ? \`
                  <span class="text-[9px] \${isTop ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-400'} px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                    🔥 \${unitsSold} vtas
                  </span>
                \` : \`
                  <span class="text-[9px] text-slate-600">0 vtas</span>
                \`}
              </div>
              <h4 class="text-xs font-bold text-slate-200 group-hover:text-emerald-400 min-h-[30px] line-clamp-2 leading-tight">\${p.nombre}</h4>
            </div>
            <div class="mt-2.5 pt-2 border-t border-slate-800/80">
              <div class="flex items-center justify-between mb-1">
                <span class="text-[9px] \${stock <= 0 ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30' : stock < 10 ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'} px-1.5 py-0.2 rounded font-bold">
                  \${stock <= 0 ? 'Sin stock' : 'Stock: ' + stock}
                </span>
                <span class="text-[11px] text-emerald-400 font-bold font-mono">+</span>
              </div>
              <div class="flex items-baseline justify-between">
                <span class="text-xs font-black text-white font-mono">\${formatUSD(p.precio)}</span>
                <span class="text-[10px] text-emerald-400 font-mono font-medium">\${formatBs(p.precio)}</span>
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function filterPosProducts() {
      renderPosProducts();
    }

    function addToPosCart(prodId) {
      const prod = AppState.productos.find(p => p.id === prodId);
      if (!prod) return;

      const sucursalId = getSelectedPosSucursalId();
      const invItem = AppState.inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === prodId);
      const stock = invItem ? invItem.stock : 0;

      const existing = posCart.find(item => item.producto.id === prodId);
      const currentQty = existing ? existing.cantidad : 0;

      if (currentQty + 1 > stock) {
        alert('Existencia insuficiente en esta sucursal (Stock disponible: ' + stock + ')');
        return;
      }

      if (existing) {
        existing.cantidad += 1;
      } else {
        posCart.push({ producto: prod, cantidad: 1 });
      }
      renderPosCart();
    }

    function updateCartQty(prodId, delta) {
      const itemIndex = posCart.findIndex(i => i.producto.id === prodId);
      if (itemIndex === -1) return;

      const sucursalId = getSelectedPosSucursalId();
      const invItem = AppState.inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === prodId);
      const stock = invItem ? invItem.stock : 0;

      const newQty = posCart[itemIndex].cantidad + delta;
      if (newQty <= 0) {
        posCart.splice(itemIndex, 1);
      } else if (newQty > stock) {
        alert('Stock máximo disponible: ' + stock);
        return;
      } else {
        posCart[itemIndex].cantidad = newQty;
      }
      renderPosCart();
    }

    function clearPosCart() {
      posCart = [];
      renderPosCart();
    }

    function renderPosCart() {
      const container = document.getElementById('pos-cart-items');
      const countBadge = document.getElementById('pos-cart-count');
      const totalUnits = posCart.reduce((sum, i) => sum + i.cantidad, 0);
      countBadge.textContent = totalUnits + ' ítems';

      if (posCart.length === 0) {
        container.innerHTML = '<div class="text-center py-16 text-slate-500 text-xs">El carrito está vacío</div>';
      } else {
        container.innerHTML = posCart.map(item => \`
          <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
            <div class="overflow-hidden">
              <h5 class="text-xs font-bold text-white truncate">\${item.producto.nombre}</h5>
              <p class="text-[10px] text-slate-400 font-mono">\${formatUSD(item.producto.precio)} c/u</p>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button onclick="updateCartQty(\${item.producto.id}, -1)" class="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer">-</button>
              <span class="w-6 text-center font-mono font-bold text-xs text-white">\${item.cantidad}</span>
              <button onclick="updateCartQty(\${item.producto.id}, 1)" class="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer">+</button>
              <span class="w-14 text-right font-mono font-bold text-xs text-emerald-400">\${formatUSD(item.producto.precio * item.cantidad)}</span>
            </div>
          </div>
        \`).join('');
      }

      // Calculations
      const subtotal = posCart.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
      const iva = subtotal * 0.16;
      const total = subtotal + iva;

      document.getElementById('pos-subtotal-val').textContent = formatUSD(subtotal);
      document.getElementById('pos-iva-val').textContent = formatUSD(iva);
      document.getElementById('pos-total-usd').textContent = formatUSD(total);
      document.getElementById('pos-total-bs').textContent = formatBs(total);

      // Pos cart calculations rendered
    }

    // ================= POS CLIENT MANAGEMENT & FAST CÉDULA AUTO-LOOKUP =================
    function normalizeRifId(val) {
      return (val || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }

    function onPosFastCedulaInput(val) {
      const clean = normalizeRifId(val);
      const createBtn = document.getElementById('btn-pos-fast-create');

      if (!clean) {
        posSelectedCliente = {
          id: null,
          nombre: 'Cliente de Contado',
          rif: 'V-00000000',
          telefono: 'N/A'
        };
        if (createBtn) createBtn.classList.add('hidden');
        updatePosClientDisplay();
        return;
      }

      // Search match in AppState.clientes
      const found = AppState.clientes.find(c => {
        const cClean = normalizeRifId(c.rif);
        return cClean === clean || cClean.endsWith(clean) || (clean.length >= 6 && clean.endsWith(cClean));
      });

      if (found) {
        posSelectedCliente = {
          id: found.id,
          nombre: found.nombre,
          rif: found.rif,
          telefono: found.telefono
        };
        if (createBtn) createBtn.classList.add('hidden');
        updatePosClientDisplay();
      } else {
        if (clean.length >= 4) {
          if (createBtn) createBtn.classList.remove('hidden');
        } else {
          if (createBtn) createBtn.classList.add('hidden');
        }
      }
    }

    function openPosCreateFromFastInput() {
      const fastInputVal = document.getElementById('pos-fast-cedula-input')?.value || '';
      openPosClientModal();
      showPosQuickNewClient(true);
      const rifField = document.getElementById('pos-new-client-rif');
      if (rifField) {
        rifField.value = fastInputVal.trim();
      }
    }

    function updatePosClientDisplay() {
      const nameEl = document.getElementById('pos-client-name');
      const rifEl = document.getElementById('pos-client-rif');
      const badgeEl = document.getElementById('pos-client-badge');
      const resetBtn = document.getElementById('btn-pos-reset-contado');
      const fastInput = document.getElementById('pos-fast-cedula-input');

      if (!nameEl) return;

      nameEl.textContent = posSelectedCliente.nombre;
      rifEl.textContent = 'RIF: ' + (posSelectedCliente.rif || 'V-00000000');

      if (!posSelectedCliente.id) {
        badgeEl.textContent = 'Predeterminado';
        badgeEl.className = 'text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-semibold';
        if (resetBtn) resetBtn.classList.add('hidden');
      } else {
        badgeEl.textContent = '✓ Autoseleccionado';
        badgeEl.className = 'text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-bold border border-emerald-500/30';
        if (resetBtn) resetBtn.classList.remove('hidden');
        if (fastInput && fastInput.value !== posSelectedCliente.rif && document.activeElement !== fastInput) {
          fastInput.value = posSelectedCliente.rif;
        }
      }
    }

    function openPosClientModal() {
      document.getElementById('modal-pos-cliente').classList.remove('hidden');
      document.getElementById('pos-client-search-input').value = '';
      showPosQuickNewClient(false);
      renderPosClientList();
    }

    function closePosClientModal() {
      document.getElementById('modal-pos-cliente').classList.add('hidden');
    }

    function renderPosClientList() {
      const container = document.getElementById('pos-client-list-container');
      const query = (document.getElementById('pos-client-search-input')?.value || '').toLowerCase().trim();

      const clients = AppState.clientes.filter(c => 
        c.nombre.toLowerCase().includes(query) ||
        (c.rif && c.rif.toLowerCase().includes(query)) ||
        (c.telefono && c.telefono.toLowerCase().includes(query))
      );

      if (clients.length === 0) {
        container.innerHTML = '<div class="text-center py-6 text-slate-500 text-xs">No se encontraron clientes que coincidan con la búsqueda.</div>';
        return;
      }

      container.innerHTML = clients.map(c => \`
        <div onclick="selectPosCliente(\${c.id})" class="p-2.5 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-800/80 hover:border-indigo-500/50 flex items-center justify-between cursor-pointer transition-all">
          <div class="overflow-hidden pr-2">
            <h5 class="text-xs font-bold text-white truncate">\${c.nombre}</h5>
            <div class="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>\${c.rif}</span>
              <span>•</span>
              <span>\${c.telefono || 'Sin teléfono'}</span>
            </div>
          </div>
          <div class="text-right shrink-0">
            <span class="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-lg border border-indigo-500/20">Seleccionar</span>
          </div>
        </div>
      \`).join('');
    }

    function filterPosClientList() {
      renderPosClientList();
    }

    function selectPosCliente(id) {
      const found = AppState.clientes.find(c => c.id === id);
      if (found) {
        posSelectedCliente = {
          id: found.id,
          nombre: found.nombre,
          rif: found.rif,
          telefono: found.telefono
        };
        const fastInput = document.getElementById('pos-fast-cedula-input');
        if (fastInput) fastInput.value = found.rif;
        const createBtn = document.getElementById('btn-pos-fast-create');
        if (createBtn) createBtn.classList.add('hidden');
        updatePosClientDisplay();
        closePosClientModal();
      }
    }

    function resetPosClienteToContado() {
      posSelectedCliente = {
        id: null,
        nombre: 'Cliente de Contado',
        rif: 'V-00000000',
        telefono: 'N/A'
      };
      const fastInput = document.getElementById('pos-fast-cedula-input');
      if (fastInput) fastInput.value = '';
      const createBtn = document.getElementById('btn-pos-fast-create');
      if (createBtn) createBtn.classList.add('hidden');
      updatePosClientDisplay();
    }

    function showPosQuickNewClient(show) {
      const selectView = document.getElementById('pos-client-select-view');
      const formView = document.getElementById('pos-client-form-view');
      if (show) {
        selectView.classList.add('hidden');
        formView.classList.remove('hidden');
        document.getElementById('pos-new-client-name').focus();
      } else {
        formView.classList.add('hidden');
        selectView.classList.remove('hidden');
      }
    }

    function savePosQuickNewClient(e) {
      e.preventDefault();
      const name = document.getElementById('pos-new-client-name').value.trim();
      const rif = document.getElementById('pos-new-client-rif').value.trim();
      const tel = document.getElementById('pos-new-client-tel').value.trim();
      const limit = parseFloat(document.getElementById('pos-new-client-limit').value) || 0;

      if (!name || !rif) {
        alert('Por favor completa el nombre y el RIF.');
        return;
      }

      const newId = AppState.clientes.length > 0 ? Math.max(...AppState.clientes.map(c => c.id)) + 1 : 1;
      const newClient = {
        id: newId,
        nombre: name,
        rif: rif,
        telefono: tel || 'N/A',
        email: '',
        direccion: 'Sin dirección',
        limiteCredito: limit,
        saldoPendiente: 0
      };

      AppState.clientes.unshift(newClient);
      saveState();
      renderClientes();

      posSelectedCliente = {
        id: newClient.id,
        nombre: newClient.nombre,
        rif: newClient.rif,
        telefono: newClient.telefono
      };

      const fastInput = document.getElementById('pos-fast-cedula-input');
      if (fastInput) fastInput.value = newClient.rif;
      const createBtn = document.getElementById('btn-pos-fast-create');
      if (createBtn) createBtn.classList.add('hidden');

      updatePosClientDisplay();
      closePosClientModal();
      alert('¡Cliente registrado y asignado a la venta exitosamente!');
    }

    // ================= POS CHECKOUT MODAL & MULTI-PAYMENT =================
    function openPosCheckoutModal() {
      if (posCart.length === 0) {
        alert('Agrega al menos un producto al carrito antes de cobrar.');
        return;
      }

      const subtotal = posCart.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
      const totalUSD = subtotal * 1.16;
      const totalBs = totalUSD * AppState.empresaConfig.tasaCambio;

      // Update header
      document.getElementById('pos-chk-client-name').textContent = posSelectedCliente.nombre;
      document.getElementById('pos-chk-client-rif').textContent = posSelectedCliente.rif || 'V-00000000';
      document.getElementById('pos-chk-total-usd').textContent = formatUSD(totalUSD);
      document.getElementById('pos-chk-total-bs').textContent = formatBs(totalUSD);

      // Tab 1 (Pago Movil)
      document.getElementById('pos-pm-monto-bs').textContent = formatBs(totalUSD);
      document.getElementById('pos-pm-monto-usd').textContent = formatUSD(totalUSD);
      document.getElementById('pos-chk-pm-ref').value = '';
      document.getElementById('pos-pm-empresa-rif').textContent = AppState.empresaConfig.rif;
      document.getElementById('pos-pm-empresa-tel').textContent = AppState.empresaConfig.telefono;

      // Tab 2 (USD)
      document.getElementById('pos-usd-monto-usd').textContent = formatUSD(totalUSD);
      document.getElementById('pos-usd-tasa-text').textContent = '1 USD = ' + formatBs(1);
      document.getElementById('pos-chk-usd-recibido').value = '';

      // Tab 3 (Bs)
      document.getElementById('pos-bs-monto-bs').textContent = formatBs(totalUSD);
      document.getElementById('pos-bs-monto-usd').textContent = formatUSD(totalUSD);
      document.getElementById('pos-chk-bs-recibido').value = '';

      // Tab 4 (Mixto)
      document.getElementById('pos-mixto-total-header').textContent = formatUSD(totalUSD);
      document.getElementById('pos-mixto-usd').value = '';
      document.getElementById('pos-mixto-pm-bs').value = '';
      document.getElementById('pos-mixto-pm-ref').value = '';
      document.getElementById('pos-mixto-bs').value = '';

      setPosCheckoutMethod('pago_movil');
      document.getElementById('modal-pos-checkout').classList.remove('hidden');
    }

    function closePosCheckoutModal() {
      document.getElementById('modal-pos-checkout').classList.add('hidden');
    }

    function setPosCheckoutMethod(method) {
      posCheckoutMethod = method;
      const methods = ['pago_movil', 'efectivo_usd', 'efectivo_bs', 'mixto'];

      methods.forEach(m => {
        const tab = document.getElementById('tab-pay-' + m);
        const content = document.getElementById('pos-tab-content-' + m);
        if (m === method) {
          tab.className = 'p-3 rounded-xl border border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold text-center flex flex-col items-center gap-1 cursor-pointer';
          content.classList.remove('hidden');
        } else {
          tab.className = 'p-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 text-center flex flex-col items-center gap-1 cursor-pointer';
          content.classList.add('hidden');
        }
      });

      calcPosCheckoutChange();
    }

    function setPosUsdExact() {
      const subtotal = posCart.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
      const totalUSD = subtotal * 1.16;
      document.getElementById('pos-chk-usd-recibido').value = totalUSD.toFixed(2);
      calcPosCheckoutChange();
    }

    function setPosUsdChip(val) {
      document.getElementById('pos-chk-usd-recibido').value = Number(val).toFixed(2);
      calcPosCheckoutChange();
    }

    function setPosBsExact() {
      const subtotal = posCart.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
      const totalUSD = subtotal * 1.16;
      const totalBs = totalUSD * AppState.empresaConfig.tasaCambio;
      document.getElementById('pos-chk-bs-recibido').value = totalBs.toFixed(2);
      calcPosCheckoutChange();
    }

    function setPosBsRound() {
      const subtotal = posCart.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
      const totalUSD = subtotal * 1.16;
      const totalBs = totalUSD * AppState.empresaConfig.tasaCambio;
      document.getElementById('pos-chk-bs-recibido').value = Math.ceil(totalBs / 5) * 5;
      calcPosCheckoutChange();
    }

    function calcPosCheckoutChange() {
      const subtotal = posCart.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
      const totalUSD = subtotal * 1.16;
      const tasa = AppState.empresaConfig.tasaCambio;
      const totalBs = totalUSD * tasa;

      if (posCheckoutMethod === 'efectivo_usd') {
        const recibido = parseFloat(document.getElementById('pos-chk-usd-recibido').value) || 0;
        const faltanteUSD = Math.max(0, totalUSD - recibido);
        const faltanteBs = faltanteUSD * tasa;
        const vueltoUSD = Math.max(0, recibido - totalUSD);
        const vueltoBs = vueltoUSD * tasa;

        const usdStatusBox = document.getElementById('pos-usd-status-box');
        const isFaltante = recibido < totalUSD - 0.001;

        if (isFaltante) {
          if (usdStatusBox) usdStatusBox.className = 'p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between';
          document.getElementById('pos-usd-status-label').innerHTML = '<span class="text-amber-300 font-semibold flex items-center gap-1">⚠ Faltante para Completar:</span>';
          document.getElementById('pos-usd-status-val').className = 'text-lg font-mono font-black text-amber-400';
          document.getElementById('pos-usd-status-val').textContent = formatUSD(faltanteUSD);
          document.getElementById('pos-usd-status-sublabel').textContent = 'En Bolívares:';
          document.getElementById('pos-usd-status-subval').className = 'text-xs font-mono font-bold text-amber-200';
          document.getElementById('pos-usd-status-subval').textContent = 'Bs. ' + faltanteBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
          if (usdStatusBox) usdStatusBox.className = 'p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between';
          document.getElementById('pos-usd-status-label').innerHTML = '<span class="text-emerald-300 font-semibold">Cambio / Vuelto a Entregar:</span>';
          document.getElementById('pos-usd-status-val').className = 'text-lg font-mono font-black text-emerald-400';
          document.getElementById('pos-usd-status-val').textContent = formatUSD(vueltoUSD);
          document.getElementById('pos-usd-status-sublabel').textContent = 'Equivalente en Bolívares:';
          document.getElementById('pos-usd-status-subval').className = 'text-xs font-mono font-bold text-slate-200';
          document.getElementById('pos-usd-status-subval').textContent = 'Bs. ' + vueltoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
      } else if (posCheckoutMethod === 'efectivo_bs') {
        const recibido = parseFloat(document.getElementById('pos-chk-bs-recibido').value) || 0;
        const faltanteBs = Math.max(0, totalBs - recibido);
        const faltanteUSD = faltanteBs / tasa;
        const vueltoBs = Math.max(0, recibido - totalBs);
        const vueltoUSD = vueltoBs / tasa;

        const bsStatusBox = document.getElementById('pos-bs-status-box');
        const isFaltanteBs = recibido < totalBs - 0.01;

        if (isFaltanteBs) {
          if (bsStatusBox) bsStatusBox.className = 'p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between';
          document.getElementById('pos-bs-status-label').innerHTML = '<span class="text-amber-300 font-semibold flex items-center gap-1">⚠ Faltante para Completar:</span>';
          document.getElementById('pos-bs-status-val').className = 'text-lg font-mono font-black text-amber-400';
          document.getElementById('pos-bs-status-val').textContent = 'Bs. ' + faltanteBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('pos-bs-status-sublabel').textContent = 'Equivalente en USD:';
          document.getElementById('pos-bs-status-subval').className = 'text-xs font-mono font-bold text-amber-200';
          document.getElementById('pos-bs-status-subval').textContent = formatUSD(faltanteUSD);
        } else {
          if (bsStatusBox) bsStatusBox.className = 'p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between';
          document.getElementById('pos-bs-status-label').innerHTML = '<span class="text-emerald-300 font-semibold">Vuelto en Bolívares:</span>';
          document.getElementById('pos-bs-status-val').className = 'text-lg font-mono font-black text-emerald-400';
          document.getElementById('pos-bs-status-val').textContent = 'Bs. ' + vueltoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          document.getElementById('pos-bs-status-sublabel').textContent = 'Equivalente en USD:';
          document.getElementById('pos-bs-status-subval').className = 'text-xs font-mono font-bold text-slate-200';
          document.getElementById('pos-bs-status-subval').textContent = formatUSD(vueltoUSD);
        }
      } else if (posCheckoutMethod === 'mixto') {
        const usd = parseFloat(document.getElementById('pos-mixto-usd').value) || 0;
        const pmBs = parseFloat(document.getElementById('pos-mixto-pm-bs').value) || 0;
        const bs = parseFloat(document.getElementById('pos-mixto-bs').value) || 0;

        const totalCubiertoUSD = usd + (pmBs / tasa) + (bs / tasa);
        const totalCubiertoBs = (usd * tasa) + pmBs + bs;

        document.getElementById('pos-mixto-cubierto-val').textContent = formatUSD(totalCubiertoUSD) + ' (' + formatBs(totalCubiertoUSD) + ')';

        const badge = document.getElementById('pos-mixto-status-badge');
        const vueltoBox = document.getElementById('pos-mixto-vuelto-box');
        const vueltoVal = document.getElementById('pos-mixto-vuelto-val');
        const faltanteBox = document.getElementById('pos-mixto-faltante-box');
        const faltanteVal = document.getElementById('pos-mixto-faltante-val');

        if (totalCubiertoUSD >= totalUSD - 0.01) {
          badge.textContent = '✓ 100% Cubierto';
          badge.className = 'text-emerald-400 font-bold';
          if (faltanteBox) faltanteBox.classList.add('hidden');
          if (totalCubiertoUSD > totalUSD + 0.01) {
            const vueltoUSD = totalCubiertoUSD - totalUSD;
            if (vueltoBox) vueltoBox.classList.remove('hidden');
            if (vueltoVal) vueltoVal.textContent = formatUSD(vueltoUSD) + ' (' + formatBs(vueltoUSD) + ')';
          } else {
            if (vueltoBox) vueltoBox.classList.add('hidden');
          }
        } else {
          const faltaUSD = totalUSD - totalCubiertoUSD;
          const faltaBs = faltaUSD * tasa;
          badge.textContent = 'Faltan: ' + formatUSD(faltaUSD) + ' (' + formatBs(faltaUSD) + ')';
          badge.className = 'text-amber-400 font-bold';
          if (faltanteBox) faltanteBox.classList.remove('hidden');
          if (faltanteVal) faltanteVal.textContent = formatUSD(faltaUSD) + ' (' + formatBs(faltaUSD) + ')';
          if (vueltoBox) vueltoBox.classList.add('hidden');
        }
      }
    }

    function confirmPosCheckout() {
      if (posCart.length === 0) {
        alert('El carrito está vacío.');
        return;
      }

      const sucursalId = getSelectedPosSucursalId();
      const subtotal = posCart.reduce((sum, i) => sum + (i.producto.precio * i.cantidad), 0);
      const totalUSD = subtotal * 1.16;
      const tasa = AppState.empresaConfig.tasaCambio;
      const totalBs = totalUSD * tasa;

      let metodoNombre = 'Efectivo USD';
      let pagoDetalle = {
        metodo: posCheckoutMethod,
        tasaAplicada: tasa
      };

      if (posCheckoutMethod === 'pago_movil') {
        const ref = document.getElementById('pos-chk-pm-ref').value.trim();
        const banco = document.getElementById('pos-chk-pm-banco').value;
        if (!ref) {
          alert('Por favor ingresa el número de referencia del Pago Móvil.');
          document.getElementById('pos-chk-pm-ref').focus();
          return;
        }
        metodoNombre = 'Pago Móvil (Bs)';
        pagoDetalle.referenciaPagoMovil = ref;
        pagoDetalle.bancoDestino = banco;
        pagoDetalle.montoBolivares = totalBs;
      } else if (posCheckoutMethod === 'efectivo_usd') {
        const recibido = parseFloat(document.getElementById('pos-chk-usd-recibido').value) || 0;
        if (recibido < totalUSD - 0.001) {
          alert('El monto entregado ($ ' + recibido.toFixed(2) + ') es menor al total a pagar ($ ' + totalUSD.toFixed(2) + ').');
          return;
        }
        metodoNombre = 'Efectivo ($ USD)';
        pagoDetalle.montoUSD = totalUSD;
        pagoDetalle.vueltoUSD = Math.max(0, recibido - totalUSD);
      } else if (posCheckoutMethod === 'efectivo_bs') {
        const recibido = parseFloat(document.getElementById('pos-chk-bs-recibido').value) || 0;
        if (recibido < totalBs - 0.01) {
          alert('El monto entregado en Bolívares es menor al total a pagar.');
          return;
        }
        metodoNombre = 'Efectivo (Bs)';
        pagoDetalle.montoBolivares = totalBs;
        pagoDetalle.vueltoBolivares = Math.max(0, recibido - totalBs);
      } else if (posCheckoutMethod === 'mixto') {
        const usd = parseFloat(document.getElementById('pos-mixto-usd').value) || 0;
        const pmBs = parseFloat(document.getElementById('pos-mixto-pm-bs').value) || 0;
        const pmRef = document.getElementById('pos-mixto-pm-ref').value.trim();
        const bs = parseFloat(document.getElementById('pos-mixto-bs').value) || 0;

        const totalCubiertoUSD = usd + (pmBs / tasa) + (bs / tasa);
        if (totalCubiertoUSD < totalUSD - 0.02) {
          alert('El monto cubierto ($ ' + totalCubiertoUSD.toFixed(2) + ') es menor al total ($ ' + totalUSD.toFixed(2) + ').');
          return;
        }
        if (pmBs > 0 && !pmRef) {
          alert('Por favor ingresa el número de referencia del Pago Móvil en el pago mixto.');
          return;
        }

        metodoNombre = 'Pago Mixto Combinado';
        pagoDetalle.montoUSD = usd;
        pagoDetalle.montoPagoMovilBs = pmBs;
        pagoDetalle.referenciaPagoMovil = pmRef;
        pagoDetalle.montoBolivares = bs;
      }

      // 1. Deduct inventory
      posCart.forEach(item => {
        const inv = AppState.inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === item.producto.id);
        if (inv) {
          inv.stock = Math.max(0, inv.stock - item.cantidad);
        }
      });

      // 2. Record Sale
      const newSaleId = AppState.ventas.length > 0 ? Math.max(...AppState.ventas.map(v => v.id)) + 1 : 1;
      const newSale = {
        id: newSaleId,
        sucursal_id: sucursalId,
        usuario_nombre: AppState.currentUser ? AppState.currentUser.nombre_completo : 'Cajero',
        fecha: new Date().toISOString(),
        total: totalUSD,
        metodo: metodoNombre,
        cliente: {
          id: posSelectedCliente.id,
          nombre: posSelectedCliente.nombre,
          rif: posSelectedCliente.rif,
          telefono: posSelectedCliente.telefono
        },
        pagoDetalle: pagoDetalle,
        detalles: posCart.map(i => ({
          nombre: i.producto.nombre,
          cantidad: i.cantidad,
          precio: i.producto.precio,
          subtotal: i.producto.precio * i.cantidad
        }))
      };

      AppState.ventas.unshift(newSale);
      lastCompletedSale = newSale;
      saveState();

      // 3. Clear cart & update UI
      posCart = [];
      closePosCheckoutModal();
      renderPosCart();
      renderPosProducts();
      renderDashboard();
      renderInventario();

      // 4. Open Receipt Preview
      openPosReceiptModal(newSale);
    }

    function openPosReceiptModal(sale) {
      renderReceiptModalContent(sale);
      document.getElementById('modal-pos-receipt').classList.remove('hidden');
    }

    function closePosReceiptModal() {
      document.getElementById('modal-pos-receipt').classList.add('hidden');
    }

    function renderReceiptModalContent(sale) {
      const container = document.getElementById('pos-receipt-modal-content');
      const cfg = AppState.empresaConfig;
      const client = sale.cliente || { nombre: 'Cliente de Contado', rif: 'V-00000000' };
      const tasa = sale.pagoDetalle?.tasaAplicada || cfg.tasaCambio;
      const totalBs = sale.total * tasa;

      container.innerHTML = \`
        <div class="text-center pb-2 border-b border-dashed border-slate-300 space-y-0.5">
          <div class="font-black text-sm text-slate-900">\${cfg.nombreEmpresa}</div>
          <div class="text-[10px] text-slate-600">RIF: \${cfg.rif}</div>
          <div class="text-[10px] text-slate-600">\${cfg.direccionFiscal}</div>
          <div class="text-[10px] text-slate-600">Tel: \${cfg.telefono}</div>
        </div>

        <div class="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
          <div class="flex justify-between">
            <span class="font-bold">FACTURA FISCAL:</span>
            <span class="font-black">#000\${sale.id}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Fecha:</span>
            <span>\${new Date(sale.fecha).toLocaleString('es-VE')}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Cajero:</span>
            <span>\${sale.usuario_nombre}</span>
          </div>
          <div class="flex justify-between text-slate-600">
            <span>Tasa Oficial:</span>
            <span>1$ = \${formatBs(1)}</span>
          </div>
          <div class="pt-1 mt-1 border-t border-slate-200">
            <div class="flex justify-between font-bold text-slate-900">
              <span>CLIENTE:</span>
              <span>\${client.nombre}</span>
            </div>
            <div class="flex justify-between text-slate-600 text-[10px]">
              <span>RIF/Cédula:</span>
              <span>\${client.rif || 'V-00000000'}</span>
            </div>
          </div>
        </div>

        <div class="py-2 border-b border-dashed border-slate-300 space-y-1">
          <div class="text-[10px] font-bold text-slate-500 uppercase pb-1">Descripción de Artículos</div>
          \${sale.detalles.map(d => \`
            <div class="flex justify-between text-[11px]">
              <span class="truncate pr-2">\${d.cantidad}x \${d.nombre}</span>
              <span class="font-bold shrink-0">\${formatUSD(d.subtotal)}</span>
            </div>
          \`).join('')}
        </div>

        <div class="py-2 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
          <div class="flex justify-between text-base font-black text-slate-900">
            <span>TOTAL $ USD:</span>
            <span>\${formatUSD(sale.total)}</span>
          </div>
          <div class="flex justify-between font-bold text-emerald-700">
            <span>TOTAL BOLÍVARES:</span>
            <span>\${formatBs(sale.total)}</span>
          </div>
        </div>

        <div class="py-2 bg-slate-50 p-2 rounded-lg text-[10px] space-y-0.5">
          <div class="font-bold text-slate-800">Método de Pago: \${sale.metodo}</div>
          \${sale.pagoDetalle?.referenciaPagoMovil ? \`
            <div class="text-indigo-700 font-bold font-mono">Referencia Pago Móvil: \${sale.pagoDetalle.referenciaPagoMovil}</div>
          \` : ''}
          \${sale.pagoDetalle?.bancoDestino ? \`
            <div class="text-slate-600">Banco: \${sale.pagoDetalle.bancoDestino}</div>
          \` : ''}
          \${sale.pagoDetalle?.vueltoUSD ? \`
            <div class="text-slate-700 font-semibold">Vuelto Entregado: \${formatUSD(sale.pagoDetalle.vueltoUSD)}</div>
          \` : ''}
          \${sale.pagoDetalle?.vueltoBolivares ? \`
            <div class="text-slate-700 font-semibold">Vuelto Entregado: Bs. \${sale.pagoDetalle.vueltoBolivares.toLocaleString('es-VE', {minimumFractionDigits:2})}</div>
          \` : ''}
        </div>

        <div class="text-center pt-2 text-[10px] text-slate-500">
          *** ¡GRACIAS POR SU COMPRA! ***
        </div>
      \`;

      // Also populate the printable element for direct window.print()
      const printable = document.getElementById('printable-receipt');
      if (printable) {
        printable.innerHTML = container.innerHTML;
      }
    }

    function printPosReceiptDirect() {
      try {
        let printFrame = document.getElementById('ticket-print-iframe');
        if (!printFrame) {
          printFrame = document.createElement('iframe');
          printFrame.id = 'ticket-print-iframe';
          printFrame.style.position = 'fixed';
          printFrame.style.right = '0';
          printFrame.style.bottom = '0';
          printFrame.style.width = '0';
          printFrame.style.height = '0';
          printFrame.style.border = '0';
          document.body.appendChild(printFrame);
        }

        const content = document.getElementById('pos-receipt-modal-content').innerHTML;
        const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
        if (doc) {
          doc.open();
          doc.write(\`
            <!DOCTYPE html>
            <html>
            <head>
              <title>Ticket de Venta Fiscal</title>
              <style>
                @page { size: auto; margin: 4mm; }
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body {
                  font-family: 'Courier New', Courier, monospace;
                  color: #000000;
                  background: #ffffff;
                  width: 78mm;
                  max-width: 100%;
                  margin: 0 auto;
                  padding: 4px;
                  font-size: 11px;
                  line-height: 1.35;
                }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .font-bold { font-weight: bold; }
                .font-black { font-weight: 900; }
                .flex { display: flex; justify-content: space-between; }
                .border-b { border-bottom: 1px dashed #333; }
                .border-t { border-top: 1px dashed #333; }
                .pb-1 { padding-bottom: 4px; }
                .pb-2 { padding-bottom: 6px; }
                .pt-1 { padding-top: 4px; }
                .pt-2 { padding-top: 6px; }
                .py-2 { padding-top: 6px; padding-bottom: 6px; }
                .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 52mm; }
                .shrink-0 { flex-shrink: 0; }
                .space-y-0\\.5 > * + * { margin-top: 2px; }
                .space-y-1 > * + * { margin-top: 4px; }
                .bg-slate-50 { background: #f4f4f5; padding: 5px 6px; border-radius: 4px; }
                .text-emerald-700 { color: #047857; }
                .text-indigo-700 { color: #4338ca; }
                .text-slate-900 { color: #0f172a; }
                .text-slate-800 { color: #1e293b; }
                .text-slate-700 { color: #334155; }
                .text-slate-600 { color: #475569; }
                .text-slate-500 { color: #64748b; }
              </style>
            </head>
            <body>
              \${content}
            </body>
            </html>
          \`);
          doc.close();
          setTimeout(() => {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          }, 250);
        } else {
          window.print();
        }
      } catch (err) {
        console.error('Error al imprimir ticket:', err);
        window.print();
      }
    }

    // ================= DASHBOARD LOGIC =================
    function renderDashboard() {
      const totalSales = AppState.ventas.reduce((sum, v) => sum + v.total, 0);
      const totalTx = AppState.ventas.length;
      const totalCxc = AppState.cxc.filter(c => c.estado !== 'pagada').reduce((sum, c) => sum + c.saldoRestante, 0);
      const totalCxp = AppState.cxp.filter(c => c.estado !== 'pagada').reduce((sum, c) => sum + c.saldoRestante, 0);

      document.getElementById('dash-kpi-sales').textContent = formatUSD(totalSales);
      document.getElementById('dash-kpi-sales-bs').textContent = formatBs(totalSales);
      document.getElementById('dash-kpi-tx').textContent = totalTx;
      document.getElementById('dash-kpi-cxc').textContent = formatUSD(totalCxc);
      document.getElementById('dash-kpi-cxc-count').textContent = AppState.cxc.filter(c=>c.estado!=='pagada').length + ' facturas pendientes';
      document.getElementById('dash-kpi-cxp').textContent = formatUSD(totalCxp);
      document.getElementById('dash-kpi-cxp-count').textContent = AppState.cxp.filter(c=>c.estado!=='pagada').length + ' cuentas pendientes';

      // Chart
      const s1Sales = AppState.ventas.filter(v => v.sucursal_id === 1).reduce((sum, v) => sum + v.total, 0);
      const s2Sales = AppState.ventas.filter(v => v.sucursal_id === 2).reduce((sum, v) => sum + v.total, 0);

      const ctx = document.getElementById('dashboardChart');
      if (ctx) {
        if (chartInstance) chartInstance.destroy();
        chartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: [AppState.empresaConfig.nombreTienda1, AppState.empresaConfig.nombreTienda2],
            datasets: [{
              label: 'Ventas ($ USD)',
              data: [s1Sales, s2Sales],
              backgroundColor: ['#10b981', '#6366f1'],
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { grid: { color: '#1e293b' }, ticks: { color: '#94a3b8' } },
              x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
          }
        });
      }
    }

    // ================= CLIENTES CRUD =================
    function renderClientes() {
      const tbody = document.getElementById('clientes-table-body');
      if (!tbody) return;
      if (AppState.clientes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-500">No hay clientes registrados.</td></tr>';
        return;
      }
      tbody.innerHTML = AppState.clientes.map(c => \`
        <tr class="hover:bg-slate-800/50">
          <td class="p-3 font-bold text-white">\${c.nombre}</td>
          <td class="p-3 font-mono text-emerald-400 font-bold">\${c.rif_cedula || c.rif || ''}</td>
          <td class="p-3 text-slate-300">\${c.telefono || 'N/A'}</td>
          <td class="p-3 text-right font-mono text-slate-300">\${formatUSD(c.limiteCredito || 0)}</td>
          <td class="p-3 text-right font-mono font-bold \${c.saldoPendiente > 0 ? 'text-amber-400' : 'text-emerald-400'}">\${formatUSD(c.saldoPendiente || 0)}</td>
          <td class="p-3 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="openEditClienteModal(\${c.id})" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold rounded text-[11px] cursor-pointer" title="Editar">Editar</button>
              <button onclick="deleteCliente(\${c.id})" class="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded text-[11px] cursor-pointer" title="Eliminar">Eliminar</button>
            </div>
          </td>
        </tr>
      \`).join('');
    }

    function openNewClienteModal() {
      document.getElementById('modal-cliente-title').textContent = 'Registrar Nuevo Cliente';
      document.getElementById('cli-form-id').value = '';
      document.getElementById('cli-form-nombre').value = '';
      document.getElementById('cli-form-rif').value = '';
      document.getElementById('cli-form-tel').value = '';
      document.getElementById('cli-form-email').value = '';
      document.getElementById('cli-form-limite').value = '300';
      document.getElementById('modal-cliente').classList.remove('hidden');
    }

    function openEditClienteModal(id) {
      const c = AppState.clientes.find(item => item.id === id);
      if (!c) return;
      document.getElementById('modal-cliente-title').textContent = 'Editar Datos de Cliente';
      document.getElementById('cli-form-id').value = c.id;
      document.getElementById('cli-form-nombre').value = c.nombre;
      document.getElementById('cli-form-rif').value = c.rif_cedula || c.rif || '';
      document.getElementById('cli-form-tel').value = c.telefono || '';
      document.getElementById('cli-form-email').value = c.email || '';
      document.getElementById('cli-form-limite').value = c.limiteCredito || 0;
      document.getElementById('modal-cliente').classList.remove('hidden');
    }

    function closeClienteModal() {
      document.getElementById('modal-cliente').classList.add('hidden');
    }

    function saveClienteForm(e) {
      if (e) e.preventDefault();
      const idVal = document.getElementById('cli-form-id').value;
      const nombre = document.getElementById('cli-form-nombre').value.trim();
      const rif = document.getElementById('cli-form-rif').value.trim().toUpperCase();
      const tel = document.getElementById('cli-form-tel').value.trim();
      const email = document.getElementById('cli-form-email').value.trim();
      const limite = parseFloat(document.getElementById('cli-form-limite').value) || 0;

      if (!nombre || !rif) {
        alert('Nombre y RIF/Cédula son obligatorios');
        return;
      }

      if (idVal) {
        const id = parseInt(idVal);
        const index = AppState.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
          AppState.clientes[index] = {
            ...AppState.clientes[index],
            nombre: nombre,
            rif: rif,
            rif_cedula: rif,
            telefono: tel,
            email: email,
            limiteCredito: limite,
          };
        }
      } else {
        const newId = Date.now();
        AppState.clientes.push({
          id: newId,
          nombre: nombre,
          rif: rif,
          rif_cedula: rif,
          telefono: tel,
          email: email,
          limiteCredito: limite,
          saldoPendiente: 0
        });
      }

      saveState();
      renderClientes();
      closeClienteModal();
      alert('¡Cliente guardado exitosamente!');
    }

    function deleteCliente(id) {
      const c = AppState.clientes.find(item => item.id === id);
      if (!c) return;
      if (c.saldoPendiente > 0) {
        alert('No se puede eliminar el cliente "' + c.nombre + '" porque posee un saldo deudor pendiente de $' + c.saldoPendiente.toFixed(2) + '.');
        return;
      }
      if (confirm('¿Estás seguro de eliminar al cliente "' + c.nombre + '" (' + (c.rif_cedula || c.rif) + ')?')) {
        AppState.clientes = AppState.clientes.filter(item => item.id !== id);
        saveState();
        renderClientes();
        alert('Cliente eliminado correctamente.');
      }
    }

    // ================= PROVEEDORES CRUD =================
    function renderProveedores() {
      const tbody = document.getElementById('proveedores-table-body');
      if (!tbody) return;
      if (AppState.proveedores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-500">No hay proveedores registrados.</td></tr>';
        return;
      }
      tbody.innerHTML = AppState.proveedores.map(p => \`
        <tr class="hover:bg-slate-800/50">
          <td class="p-3 font-bold text-white">\${p.nombre || p.proveedor}</td>
          <td class="p-3 font-mono text-emerald-400 font-bold">\${p.rif}</td>
          <td class="p-3 text-slate-300">\${p.contacto || ''} \${p.telefono ? '• ' + p.telefono : ''}</td>
          <td class="p-3 text-right font-mono font-bold text-rose-400">\${formatUSD(p.saldoPendiente || 0)}</td>
          <td class="p-3 text-center">
            <div class="flex items-center justify-center gap-1.5">
              <button onclick="openEditProveedorModal(\${p.id})" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold rounded text-[11px] cursor-pointer" title="Editar">Editar</button>
              <button onclick="deleteProveedor(\${p.id})" class="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded text-[11px] cursor-pointer" title="Eliminar">Eliminar</button>
            </div>
          </td>
        </tr>
      \`).join('');
    }

    function openNewProveedorModal() {
      document.getElementById('modal-proveedor-title').textContent = 'Registrar Nuevo Proveedor';
      document.getElementById('prov-form-id').value = '';
      document.getElementById('prov-form-nombre').value = '';
      document.getElementById('prov-form-rif').value = '';
      document.getElementById('prov-form-contacto').value = '';
      document.getElementById('prov-form-tel').value = '';
      document.getElementById('prov-form-email').value = '';
      document.getElementById('prov-form-dir').value = '';
      document.getElementById('modal-proveedor').classList.remove('hidden');
    }

    function openEditProveedorModal(id) {
      const p = AppState.proveedores.find(item => item.id === id);
      if (!p) return;
      document.getElementById('modal-proveedor-title').textContent = 'Editar Datos de Proveedor';
      document.getElementById('prov-form-id').value = p.id;
      document.getElementById('prov-form-nombre').value = p.nombre || p.proveedor || '';
      document.getElementById('prov-form-rif').value = p.rif || '';
      document.getElementById('prov-form-contacto').value = p.contacto || '';
      document.getElementById('prov-form-tel').value = p.telefono || '';
      document.getElementById('prov-form-email').value = p.email || '';
      document.getElementById('prov-form-dir').value = p.direccion || '';
      document.getElementById('modal-proveedor').classList.remove('hidden');
    }

    function closeProveedorModal() {
      document.getElementById('modal-proveedor').classList.add('hidden');
    }

    function saveProveedorForm(e) {
      if (e) e.preventDefault();
      const idVal = document.getElementById('prov-form-id').value;
      const nombre = document.getElementById('prov-form-nombre').value.trim();
      const rif = document.getElementById('prov-form-rif').value.trim().toUpperCase();
      const contacto = document.getElementById('prov-form-contacto').value.trim();
      const tel = document.getElementById('prov-form-tel').value.trim();
      const email = document.getElementById('prov-form-email').value.trim();
      const dir = document.getElementById('prov-form-dir').value.trim();

      if (!nombre || !rif) {
        alert('Razón Social y RIF son obligatorios');
        return;
      }

      if (idVal) {
        const id = parseInt(idVal);
        const index = AppState.proveedores.findIndex(p => p.id === id);
        if (index !== -1) {
          AppState.proveedores[index] = {
            ...AppState.proveedores[index],
            nombre: nombre,
            rif: rif,
            contacto: contacto,
            telefono: tel,
            email: email,
            direccion: dir,
          };
        }
      } else {
        const newId = Date.now();
        AppState.proveedores.push({
          id: newId,
          nombre: nombre,
          rif: rif,
          contacto: contacto,
          telefono: tel,
          email: email,
          direccion: dir,
          saldoPendiente: 0
        });
      }

      saveState();
      renderProveedores();
      closeProveedorModal();
      alert('¡Proveedor guardado exitosamente!');
    }

    function deleteProveedor(id) {
      const p = AppState.proveedores.find(item => item.id === id);
      if (!p) return;
      if (p.saldoPendiente > 0) {
        alert('No se puede eliminar el proveedor "' + (p.nombre || p.proveedor) + '" porque posee una deuda pendiente de $' + p.saldoPendiente.toFixed(2) + ' en Cuentas por Pagar.');
        return;
      }
      if (confirm('¿Estás seguro de eliminar al proveedor "' + (p.nombre || p.proveedor) + '" (RIF: ' + p.rif + ')?')) {
        AppState.proveedores = AppState.proveedores.filter(item => item.id !== id);
        saveState();
        renderProveedores();
        alert('Proveedor eliminado correctamente.');
      }
    }

    // ================= COMPRAS CRUD =================
    function renderCompras() {
      const tbody = document.getElementById('compras-table-body');
      if (!tbody) return;
      tbody.innerHTML = AppState.compras.map(c => \`
        <tr class="hover:bg-slate-800/50">
          <td class="p-3 font-mono font-bold text-white">#\${c.numeroFactura || c.id}</td>
          <td class="p-3 text-slate-200 font-semibold">\${c.proveedorNombre}</td>
          <td class="p-3 text-slate-400">\${c.sucursalId === 1 ? AppState.empresaConfig.nombreTienda1 : AppState.empresaConfig.nombreTienda2}</td>
          <td class="p-3 text-slate-400">\${c.fecha}</td>
          <td class="p-3 text-right font-mono font-bold text-emerald-400">\${formatUSD(c.total)}</td>
          <td class="p-3 text-right font-mono text-slate-300">\${formatBs(c.total)}</td>
        </tr>
      \`).join('');
    }

    function openNewCompraModal() {
      const provSelect = document.getElementById('compra-form-prov');
      provSelect.innerHTML = AppState.proveedores.map(p => \`
        <option value="\${p.nombre || p.proveedor}">\${p.nombre || p.proveedor} (\${p.rif})</option>
      \`).join('');
      document.getElementById('compra-form-nro').value = 'FAC-' + Math.floor(1000 + Math.random() * 9000);
      document.getElementById('compra-form-total').value = '';
      document.getElementById('modal-compra').classList.remove('hidden');
    }

    function closeCompraModal() {
      document.getElementById('modal-compra').classList.add('hidden');
    }

    function saveCompraForm(e) {
      if (e) e.preventDefault();
      const provNombre = document.getElementById('compra-form-prov').value;
      const nroFactura = document.getElementById('compra-form-nro').value.trim();
      const sucursalId = parseInt(document.getElementById('compra-form-suc').value) || 1;
      const total = parseFloat(document.getElementById('compra-form-total').value) || 0;

      if (!provNombre || !nroFactura || total <= 0) {
        alert('Por favor complete todos los datos de la compra con un monto válido.');
        return;
      }

      const newCompraId = Date.now();
      const newCompra = {
        id: newCompraId,
        proveedorNombre: provNombre,
        numeroFactura: nroFactura,
        sucursalId: sucursalId,
        fecha: new Date().toISOString().split('T')[0],
        total: total
      };

      AppState.compras.unshift(newCompra);

      // Add to CxP
      AppState.cxp.unshift({
        id: newCompraId,
        factura: nroFactura,
        proveedorNombre: provNombre,
        fecha: new Date().toISOString().split('T')[0],
        montoTotal: total,
        saldoRestante: total,
        estado: 'pendiente'
      });

      // Update provider balance
      const targetProv = AppState.proveedores.find(p => (p.nombre || p.proveedor) === provNombre);
      if (targetProv) {
        targetProv.saldoPendiente = (targetProv.saldoPendiente || 0) + total;
      }

      saveState();
      renderCompras();
      closeCompraModal();
      alert('¡Compra registrada exitosamente! Se agregó a Cuentas por Pagar.');
    }

    function renderCxc() {
      const tbody = document.getElementById('cxc-table-body');
      tbody.innerHTML = AppState.cxc.map(c => \`
        <tr class="hover:bg-slate-800/50">
          <td class="p-3 font-mono font-bold text-white">\${c.factura}</td>
          <td class="p-3 font-semibold text-slate-200">\${c.clienteNombre}</td>
          <td class="p-3 text-slate-400">\${c.fecha}</td>
          <td class="p-3 text-right font-mono text-slate-300">\${formatUSD(c.montoTotal)}</td>
          <td class="p-3 text-right font-mono font-bold text-amber-400">\${formatUSD(c.saldoRestante)}</td>
          <td class="p-3 text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold \${c.estado === 'pagada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">\${c.estado.toUpperCase()}</span>
          </td>
          <td class="p-3 text-center">
            \${c.saldoRestante > 0 ? \`<button onclick="abonoCxc(\${c.id})" class="px-2 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-[11px] cursor-pointer">Abonar</button>\` : '<span class="text-slate-500">Saldada</span>'}
          </td>
        </tr>
      \`).join('');
    }

    function abonoCxc(cxcId) {
      const item = AppState.cxc.find(c => c.id === cxcId);
      if (!item) return;
      const montoStr = prompt('Ingresa el monto del abono en $ USD (Saldo actual: ' + formatUSD(item.saldoRestante) + '):', item.saldoRestante);
      const monto = parseFloat(montoStr);
      if (isNaN(monto) || monto <= 0) return;

      item.saldoRestante = Math.max(0, item.saldoRestante - monto);
      if (item.saldoRestante === 0) item.estado = 'pagada';
      saveState();
      renderCxc();
      alert('¡Abono registrado con éxito!');
    }

    function renderCxp() {
      const tbody = document.getElementById('cxp-table-body');
      tbody.innerHTML = AppState.cxp.map(c => \`
        <tr class="hover:bg-slate-800/50">
          <td class="p-3 font-mono font-bold text-white">\${c.factura}</td>
          <td class="p-3 font-semibold text-slate-200">\${c.proveedorNombre}</td>
          <td class="p-3 text-slate-400">\${c.fecha}</td>
          <td class="p-3 text-right font-mono text-slate-300">\${formatUSD(c.montoTotal)}</td>
          <td class="p-3 text-right font-mono font-bold text-rose-400">\${formatUSD(c.saldoRestante)}</td>
          <td class="p-3 text-center">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold \${c.estado === 'pagada' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}">\${c.estado.toUpperCase()}</span>
          </td>
          <td class="p-3 text-center">
            \${c.saldoRestante > 0 ? \`<button onclick="pagoCxp(\${c.id})" class="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded text-[11px] cursor-pointer">Pagar</button>\` : '<span class="text-slate-500">Liquidada</span>'}
          </td>
        </tr>
      \`).join('');
    }

    function pagoCxp(cxpId) {
      const item = AppState.cxp.find(c => c.id === cxpId);
      if (!item) return;
      const montoStr = prompt('Ingresa el monto a pagar en $ USD (Saldo adeudado: ' + formatUSD(item.saldoRestante) + '):', item.saldoRestante);
      const monto = parseFloat(montoStr);
      if (isNaN(monto) || monto <= 0) return;

      item.saldoRestante = Math.max(0, item.saldoRestante - monto);
      if (item.saldoRestante === 0) item.estado = 'pagada';
      saveState();
      renderCxp();
      alert('¡Pago a proveedor liquidado con éxito!');
    }

    // ================= REPORTES LOGIC =================
    function renderReportes() {
      const totalVentas = AppState.ventas.reduce((s, v) => s + v.total, 0);
      const totalIva = totalVentas * (0.16 / 1.16);
      const totalBase = totalVentas - totalIva;

      document.getElementById('corte-x-content').innerHTML = \`
        <div>EMPRESA: \${AppState.empresaConfig.nombreEmpresa}</div>
        <div>FECHA EMISIÓN: \${new Date().toLocaleString('es-VE')}</div>
        <div>TASA DEL DÍA: \${formatBs(1)}</div>
        <div class="my-2 border-t border-slate-800"></div>
        <div>TRANSACCIONES: \${AppState.ventas.length}</div>
        <div>BASE IMPONIBLE: \${formatUSD(totalBase)} (\${formatBs(totalBase)})</div>
        <div>TOTAL IVA (16%): \${formatUSD(totalIva)} (\${formatBs(totalIva)})</div>
        <div class="text-emerald-400 font-bold text-sm">TOTAL RECAUDADO: \${formatUSD(totalVentas)}</div>
        <div class="text-emerald-400 font-bold">TOTAL BS: \${formatBs(totalVentas)}</div>
      \`;

      document.getElementById('corte-z-content').innerHTML = \`
        <div>REPORTE Z FISCAL NRO: Z-00042</div>
        <div>FECHA CIERRE: \${new Date().toLocaleDateString('es-VE')}</div>
        <div class="my-2 border-t border-slate-800"></div>
        <div>VENTAS EXENTAS: $ 0.00</div>
        <div>VENTAS GRAVADAS (G): \${formatUSD(totalBase)}</div>
        <div>IMPUESTO ALÍCUOTA 16%: \${formatUSD(totalIva)}</div>
        <div class="text-rose-400 font-bold text-sm">TOTAL CIERRE Z: \${formatUSD(totalVentas)}</div>
        <div class="text-rose-400 font-bold">TOTAL CIERRE BS: \${formatBs(totalVentas)}</div>
      \`;
    }

    // ================= CONFIGURACIÓN LOGIC =================
    function renderConfiguracion() {
      const cfg = AppState.empresaConfig;
      document.getElementById('cfg-company-name').value = cfg.nombreEmpresa;
      document.getElementById('cfg-company-rif').value = cfg.rif;
      document.getElementById('cfg-company-tel').value = cfg.telefono;
      document.getElementById('cfg-company-dir').value = cfg.direccionFiscal;

      // Users dropdown
      const select = document.getElementById('cfg-user-select');
      select.innerHTML = AppState.usuarios.map(u => \`
        <option value="\${u.id}">\${u.nombre_completo} (\${u.rol}) - PIN: \${u.pin}</option>
      \`).join('');

      loadUserForEdit();
    }

    function loadUserForEdit() {
      const uid = parseInt(document.getElementById('cfg-user-select').value);
      const user = AppState.usuarios.find(u => u.id === uid);
      if (user) {
        document.getElementById('cfg-user-name').value = user.nombre_completo;
        document.getElementById('cfg-user-pin').value = user.pin;
      }
    }

    function saveUserChanges() {
      const uid = parseInt(document.getElementById('cfg-user-select').value);
      const user = AppState.usuarios.find(u => u.id === uid);
      if (!user) return;

      const newName = document.getElementById('cfg-user-name').value.trim();
      const newPin = document.getElementById('cfg-user-pin').value.trim();

      if (!newName || newPin.length !== 4) {
        alert('Por favor ingresa un nombre válido y un PIN de exactamente 4 dígitos.');
        return;
      }

      user.nombre_completo = newName;
      user.pin = newPin;

      if (AppState.currentUser && AppState.currentUser.id === uid) {
        AppState.currentUser.nombre_completo = newName;
        AppState.currentUser.pin = newPin;
      }

      saveState();
      updateTopBar();
      renderConfiguracion();
      alert('¡Usuario y PIN actualizados con éxito!');
    }

    function saveCompanyConfig() {
      AppState.empresaConfig.nombreEmpresa = document.getElementById('cfg-company-name').value.trim();
      AppState.empresaConfig.rif = document.getElementById('cfg-company-rif').value.trim();
      AppState.empresaConfig.telefono = document.getElementById('cfg-company-tel').value.trim();
      AppState.empresaConfig.direccionFiscal = document.getElementById('cfg-company-dir').value.trim();
      saveState();
      updateTopBar();
      alert('¡Datos fiscales guardados con éxito!');
    }

    // ================= MODALS & AUTH LOGIC =================
    function openLoginModal() {
      const select = document.getElementById('login-user-select');
      select.innerHTML = AppState.usuarios.map(u => \`
        <option value="\${u.id}">\${u.nombre_completo} (\${u.rol === 'admin' ? 'Gerente General' : u.rol})</option>
      \`).join('');
      document.getElementById('login-pin-input').value = '';
      document.getElementById('login-error-msg').classList.add('hidden');
      document.getElementById('modal-login').classList.remove('hidden');
    }

    function closeLoginModal() {
      document.getElementById('modal-login').classList.add('hidden');
    }

    function submitPinLogin() {
      const uid = parseInt(document.getElementById('login-user-select').value);
      const enteredPin = document.getElementById('login-pin-input').value.trim();
      const user = AppState.usuarios.find(u => u.id === uid);
      const errorMsg = document.getElementById('login-error-msg');

      if (!user || user.pin !== enteredPin) {
        errorMsg.textContent = 'PIN incorrecto para ' + (user ? user.nombre_completo : 'el usuario');
        errorMsg.classList.remove('hidden');
        return;
      }

      AppState.currentUser = user;
      saveState();
      updateTopBar();
      updateSidebarSecurity();
      closeLoginModal();
      switchTab('ventas');
      alert('Bienvenido/a, ' + user.nombre_completo);
    }

    function openPinGuideModal() {
      const list = document.getElementById('pin-guide-list');
      list.innerHTML = AppState.usuarios.map(u => \`
        <div class="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
          <div>
            <span class="font-bold text-white">\${u.nombre_completo}</span>
            <span class="text-[10px] text-slate-400 block">\${u.rol === 'admin' ? 'Gerente General (Acceso Total)' : 'Cajero / Operador'}</span>
          </div>
          <div class="text-right">
            <span class="font-mono font-bold text-emerald-400 text-sm bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
              PIN: \${u.pin}
            </span>
          </div>
        </div>
      \`).join('');
      document.getElementById('modal-pin-guide').classList.remove('hidden');
    }

    function closePinGuideModal() {
      document.getElementById('modal-pin-guide').classList.add('hidden');
    }

    function openTasaModal() {
      document.getElementById('tasa-input-val').value = AppState.empresaConfig.tasaCambio;
      document.getElementById('modal-tasa').classList.remove('hidden');
    }

    function closeTasaModal() {
      document.getElementById('modal-tasa').classList.add('hidden');
    }

    function saveDailyRate() {
      const val = parseFloat(document.getElementById('tasa-input-val').value);
      if (isNaN(val) || val <= 0) {
        alert('Por favor ingresa una tasa válida.');
        return;
      }
      AppState.empresaConfig.tasaCambio = val;
      saveState();
      updateTopBar();
      renderPosProducts();
      renderPosCart();
      closeTasaModal();
      alert('Tasa actualizada a: 1 USD = ' + formatBs(1));
    }

    // Startup
    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>`;
