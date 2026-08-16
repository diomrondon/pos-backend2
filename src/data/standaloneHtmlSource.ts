export const STANDALONE_HTML_SOURCE = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Sistema Multi-Sucursal POS, Inventario & Dashboard Gerencial</title>
  <!-- Tailwind CSS v4 CDN -->
  <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
  <!-- Supabase JS CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  <!-- Chart.js para gráficas ejecutivas interactivas -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;800&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-slate-950">

  <!-- TOP AUTH & USER BAR -->
  <div class="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
    <div class="flex items-center gap-2.5">
      <div class="flex items-center gap-1.5 font-bold text-slate-200">
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
        <span>Seguridad & Control:</span>
      </div>

      <div id="auth-user-badge" class="flex items-center gap-2">
        <!-- Rendered by JS -->
      </div>
    </div>

    <div class="flex items-center gap-2">
      <button onclick="toggleLoginModal()" class="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-colors cursor-pointer text-xs">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span id="btn-login-label">Iniciar Sesión con PIN</span>
      </button>

      <button onclick="togglePinGuideModal()" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer text-xs">
        <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
        <span>Guía de PINs</span>
      </button>
    </div>
  </div>

  <!-- HEADER -->
  <header class="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3">
        <div class="flex items-center gap-3">
          <div class="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-bold text-lg text-white">POS Multi-Sucursal & Gerencia</h1>
              <span id="badge-mode" class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Supabase Directo ($0)
              </span>
            </div>
            <p class="text-xs text-slate-400">PostgreSQL en la nube sincronizado en tiempo real</p>
          </div>
        </div>

        <!-- Connection Status & Sync status -->
        <div class="flex items-center gap-3">
          <div id="connection-status" class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="text-slate-300 font-mono text-[11px]" id="status-text">Listo para operar</span>
          </div>

          <button id="btn-config-supabase" onclick="toggleConfigModal()" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer">
            <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span>Supabase Keys</span>
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button onclick="switchTab('gerencia')" id="tab-gerencia" class="tab-btn bg-purple-600 text-white font-bold px-3.5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md shadow-purple-600/30">
          <svg class="w-4 h-4 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          Dashboard Gerencia General
        </button>
        <button onclick="switchTab('pos')" id="tab-pos" class="tab-btn bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          1. Punto de Venta (Caja)
        </button>
        <button onclick="switchTab('inventario')" id="tab-inventario" class="tab-btn bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          2. Inventario Multi-Sucursal
        </button>
        <button onclick="switchTab('ventas')" id="tab-ventas" class="tab-btn bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-2 transition-all">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
          3. Registro y Auditoría
        </button>
      </nav>
    </div>
  </header>

  <!-- MAIN CONTAINER -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">

    <!-- VIEW 0: GERENCIA GENERAL DASHBOARD -->
    <section id="view-gerencia" class="space-y-6">
      <!-- Header Gerencia con Filtros de Período -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/30 text-purple-300">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl font-bold text-white tracking-tight">Área de Gerencia General — Cuadro de Mando</h2>
                <span class="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Control Ejecutivo
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Monitoreo estratégico en tiempo real de ingresos, margen bruto, rotación de stock y rendimiento multi-sucursal.
              </p>
            </div>
          </div>

          <!-- Filtros de Período y Sucursal -->
          <div class="flex flex-wrap items-center gap-2.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <div class="flex items-center gap-1.5 px-2 text-xs text-slate-400 font-medium">
              <svg class="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span>Período:</span>
            </div>

            <div class="grid grid-cols-5 gap-1 text-xs">
              <button onclick="setDashboardPeriod('today')" id="btn-period-today" class="period-btn px-2.5 py-1 rounded-lg font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">Hoy</button>
              <button onclick="setDashboardPeriod('7days')" id="btn-period-7days" class="period-btn px-2.5 py-1 rounded-lg font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">7 Días</button>
              <button onclick="setDashboardPeriod('30days')" id="btn-period-30days" class="period-btn active bg-purple-600 text-white px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer shadow-sm">30 Días</button>
              <button onclick="setDashboardPeriod('year')" id="btn-period-year" class="period-btn px-2.5 py-1 rounded-lg font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">Año</button>
              <button onclick="setDashboardPeriod('all')" id="btn-period-all" class="period-btn px-2.5 py-1 rounded-lg font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer">Histórico</button>
            </div>

            <div class="h-6 w-px bg-slate-800 hidden sm:block"></div>

            <select id="dash-sucursal-filter" onchange="updateDashboardUI()" class="bg-slate-900 border border-slate-700 text-xs text-white px-2.5 py-1 rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer font-medium">
              <option value="all">Todas las Sucursales</option>
              <option value="1">Tienda 1 - Centro</option>
              <option value="2">Tienda 2 - Norte</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tarjetas KPIs Financieros -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- KPI 1 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 shadow-lg hover:border-emerald-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Brutos</span>
            <div class="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span id="kpi-ingresos" class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">$0.00</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span>+14.8% vs período anterior</span>
          </div>
          <div id="kpi-transacciones-sub" class="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
            Total facturado en 0 transacciones
          </div>
        </div>

        <!-- KPI 2 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 shadow-lg hover:border-purple-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilidad Bruta Est.</span>
            <div class="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span id="kpi-utilidad" class="text-2xl lg:text-3xl font-extrabold text-purple-300 tracking-tight">$0.00</span>
            <span class="text-xs font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">35.0% Margen</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span>Retorno operativo saludable</span>
          </div>
          <div id="kpi-costo-sub" class="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
            Costo estimado: $0.00
          </div>
        </div>

        <!-- KPI 3 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 shadow-lg hover:border-blue-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <div class="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span id="kpi-ticket" class="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">$0.00</span>
            <span class="text-xs font-normal text-slate-400">/ venta</span>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <span id="kpi-unidades-sub">0 unidades despachadas</span>
          </div>
          <div class="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
            Promedio 2.4 ítems por ticket
          </div>
        </div>

        <!-- KPI 4 -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 space-y-2 shadow-lg hover:border-amber-500/50 transition-all">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Activo en Inventario</span>
            <div class="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <span id="kpi-inventario" class="text-2xl lg:text-3xl font-extrabold text-amber-300 tracking-tight">$0.00</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-300">
            <span id="kpi-stock-total">0 un. en existencias</span>
            <span class="text-emerald-400 font-semibold">Stock Óptimo</span>
          </div>
          <div class="text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
            Distribución en 3 centros logísticos
          </div>
        </div>
      </div>

      <!-- Gráficas Estratégicas -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Gráfica 1: Área / Línea de Ingresos y Ganancia -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-800 pb-3">
            <div>
              <h3 class="font-bold text-white text-base flex items-center gap-2">
                <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                Evolución de Ingresos y Utilidad Neta
              </h3>
              <p class="text-xs text-slate-400">Curva de rendimiento financiero en el período seleccionado</p>
            </div>
            <div class="flex items-center gap-3 text-xs">
              <span class="flex items-center gap-1 text-emerald-400 font-semibold">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Ingresos ($)
              </span>
              <span class="flex items-center gap-1 text-purple-400 font-semibold">
                <span class="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Utilidad Est. ($)
              </span>
            </div>
          </div>

          <div class="h-64 w-full relative">
            <canvas id="chart-evolution"></canvas>
          </div>
        </div>

        <!-- Gráfica 2: Mix de Ventas por Sucursal (Pie / Donut) -->
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="border-b border-slate-800 pb-3">
            <h3 class="font-bold text-white text-base flex items-center gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/></svg>
              Mix de Ingresos por Tienda
            </h3>
            <p class="text-xs text-slate-400">Distribución porcentual de facturación</p>
          </div>

          <div class="h-48 w-full relative flex items-center justify-center">
            <canvas id="chart-pie-branch"></canvas>
          </div>

          <div class="space-y-2 pt-1 border-t border-slate-800/80">
            <div class="flex items-center justify-between text-xs">
              <span class="flex items-center gap-2 text-slate-300">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Tienda 1 - Centro
              </span>
              <span id="pie-val-t1" class="font-bold text-white">$0.00</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="flex items-center gap-2 text-slate-300">
                <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Tienda 2 - Norte
              </span>
              <span id="pie-val-t2" class="font-bold text-white">$0.00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pestañas de Detalle Estratégico -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div class="flex items-center space-x-2">
            <button onclick="switchDashSubTab('sucursales')" id="subtab-sucursales" class="dash-subtab active bg-purple-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
              🏢 Comparativa de Sucursales
            </button>
            <button onclick="switchDashSubTab('productos')" id="subtab-productos" class="dash-subtab bg-slate-800 text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
              📦 Top Productos & Rentabilidad
            </button>
            <button onclick="switchDashSubTab('cajeros')" id="subtab-cajeros" class="dash-subtab bg-slate-800 text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
              👥 Rendimiento por Cajero
            </button>
          </div>
          <span class="text-[11px] text-slate-400 font-mono">Auditoría Ejecutiva • Sistema en Tiempo Real</span>
        </div>

        <!-- Subtab 1: Sucursales -->
        <div id="dash-subview-sucursales" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                <h4 class="font-bold text-white text-sm">Tienda 1 - Centro</h4>
              </div>
              <span class="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">Sucursal #1</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Facturación:</span>
                <span id="t1-facturacion" class="text-base font-extrabold text-white">$1,280.50</span>
              </div>
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Transacciones:</span>
                <span id="t1-ventas-count" class="text-base font-extrabold text-slate-200">64 ventas</span>
              </div>
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Ticket Promedio:</span>
                <span class="text-base font-extrabold text-emerald-400">$20.01</span>
              </div>
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Stock Disponible:</span>
                <span id="t1-stock-count" class="text-base font-extrabold text-amber-300">430 un.</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-400"></span>
                <h4 class="font-bold text-white text-sm">Tienda 2 - Norte</h4>
              </div>
              <span class="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">Sucursal #2</span>
            </div>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Facturación:</span>
                <span id="t2-facturacion" class="text-base font-extrabold text-white">$1,140.20</span>
              </div>
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Transacciones:</span>
                <span id="t2-ventas-count" class="text-base font-extrabold text-slate-200">58 ventas</span>
              </div>
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Ticket Promedio:</span>
                <span class="text-base font-extrabold text-emerald-400">$19.65</span>
              </div>
              <div class="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-slate-400 text-[10px] block">Stock Disponible:</span>
                <span id="t2-stock-count" class="text-base font-extrabold text-amber-300">395 un.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Subtab 2: Top Productos -->
        <div id="dash-subview-productos" class="hidden overflow-x-auto">
          <table class="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
              <tr>
                <th class="p-3">Ranking</th>
                <th class="p-3">Producto</th>
                <th class="p-3 text-right">Unidades Vendidas</th>
                <th class="p-3 text-right">Facturación</th>
                <th class="p-3 text-right">Margen Estimado (35%)</th>
              </tr>
            </thead>
            <tbody id="top-products-table-body" class="divide-y divide-slate-800/80 bg-slate-900/50">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>

        <!-- Subtab 3: Cajeros -->
        <div id="dash-subview-cajeros" class="hidden overflow-x-auto">
          <table class="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
            <thead class="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono uppercase text-[10px]">
              <tr>
                <th class="p-3">Colaborador / Cajero</th>
                <th class="p-3">Sucursal Asignada</th>
                <th class="p-3">Cargo Operativo</th>
                <th class="p-3 text-right">Tickets Procesados</th>
                <th class="p-3 text-right">Ticket Promedio</th>
                <th class="p-3 text-right">Total Recaudado</th>
              </tr>
            </thead>
            <tbody id="cashiers-table-body" class="divide-y divide-slate-800/80 bg-slate-900/50">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- VIEW 1: POS / PUNTO DE VENTA -->
    <section id="view-pos" class="space-y-6 hidden">
      <!-- Info Header & Branch Selector -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/30">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
          </div>
          <div>
            <h2 class="font-bold text-white text-base">Terminal de Venta Rápida</h2>
            <p class="text-xs text-slate-400">Escanea con la pistola lectora USB o escribe el código de barras</p>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 w-full sm:w-auto">
          <span class="text-xs text-slate-400 pl-2 font-medium">Sucursal:</span>
          <select id="pos-sucursal-select" onchange="onPosSucursalChange()" class="bg-transparent text-xs text-emerald-400 font-bold py-1.5 pr-4 focus:outline-none cursor-pointer">
            <option value="1" class="bg-slate-900 text-white">Tienda 1 - Centro</option>
            <option value="2" class="bg-slate-900 text-white">Tienda 2 - Norte</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Scanner Input & Demo Buttons (1 col) -->
        <div class="space-y-4">
          <!-- Barcode Input Box -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <label class="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Escanear Código de Barras:
            </label>
            <div class="flex gap-2">
              <input 
                id="barcode-input" 
                type="text" 
                placeholder="Ej: 123456 + Enter"
                autocomplete="off"
                class="flex-1 bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-sm px-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
              />
              <button onclick="handleScanManual()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1">
                + Agregar
              </button>
            </div>

            <div id="pos-alert" class="hidden text-xs p-3 rounded-xl"></div>
          </div>

          <!-- Quick Access Touch Buttons -->
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Productos Disponibles:</h3>
              <span class="text-[10px] text-slate-500">Toca para agregar</span>
            </div>
            <div id="pos-quick-products" class="grid grid-cols-1 gap-2 max-h-[320px] overflow-y-auto pr-1">
              <!-- Dynamically rendered -->
            </div>
          </div>
        </div>

        <!-- Sales Cart / Ticket (2 cols) -->
        <div class="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div class="space-y-3">
            <div class="flex items-center justify-between border-b border-slate-800 pb-3">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                <h3 class="font-bold text-white text-base">Detalle de la Venta</h3>
              </div>
              <span id="cart-item-count" class="text-xs text-slate-400 font-mono">0 productos</span>
            </div>

            <!-- Items Table/List -->
            <div id="cart-empty-state" class="text-center py-16 text-slate-500 text-xs space-y-2">
              <svg class="w-12 h-12 mx-auto text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              <p>El carrito está vacío. Escanea o selecciona un producto para comenzar.</p>
            </div>

            <div id="cart-items-container" class="divide-y divide-slate-800 max-h-[380px] overflow-y-auto pr-2 hidden">
              <!-- Dynamically populated -->
            </div>
          </div>

          <!-- Checkout Box -->
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div class="flex items-center justify-between text-slate-300 text-sm">
              <span>Total de la Venta:</span>
              <span id="cart-total-amount" class="text-2xl font-extrabold text-emerald-400 font-mono">$0.00</span>
            </div>

            <button id="btn-checkout" onclick="procesarVenta()" disabled class="w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-slate-800 text-slate-500 cursor-not-allowed">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              Cobrar e Impactar Stock en PostgreSQL
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- VIEW 2: INVENTORY MANAGER -->
    <section id="view-inventario" class="space-y-6 hidden">
      <!-- Header Bar -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 class="font-bold text-white text-base">Inventario Central y Sucursales</h2>
          <p class="text-xs text-slate-400">Acceso restringido para personal de Inventario y Administradores</p>
        </div>

        <button id="btn-nuevo-prod" onclick="toggleNewProductModal()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          Nuevo Producto
        </button>
      </div>

      <!-- Matrix Table -->
      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div class="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Matriz de Stock en Línea</h3>
          <span class="text-[11px] text-slate-500 font-mono">Actualizado automáticamente</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th class="p-3">Código</th>
                <th class="p-3">Nombre</th>
                <th class="p-3">Precio</th>
                <th class="p-3 text-center">Tienda 1 (Centro)</th>
                <th class="p-3 text-center">Tienda 2 (Norte)</th>
                <th class="p-3 text-center">Oficina Central</th>
                <th class="p-3 text-right">Stock Total</th>
              </tr>
            </thead>
            <tbody id="inventory-table-body" class="divide-y divide-slate-800/60 font-sans">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>

      <!-- Transfer Box -->
      <div id="transfer-container" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
            <h3 class="font-bold text-white text-sm">Transferir Mercadería entre Sucursales</h3>
          </div>
          <span id="transfer-auth-status" class="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 bg-blue-500/20 text-blue-300 font-semibold">
            Autorización de Inventario Requerida
          </span>
        </div>

        <form id="transfer-form" onsubmit="handleTransferSubmit(event)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label class="text-[11px] text-slate-400 block mb-1">Origen (Sale stock)</label>
            <select id="transfer-origen" class="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:outline-none">
              <option value="3">Oficina Central / Inventario</option>
              <option value="1">Tienda 1 - Centro</option>
              <option value="2">Tienda 2 - Norte</option>
            </select>
          </div>

          <div>
            <label class="text-[11px] text-slate-400 block mb-1">Destino (Entra stock)</label>
            <select id="transfer-destino" class="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:outline-none">
              <option value="1">Tienda 1 - Centro</option>
              <option value="2">Tienda 2 - Norte</option>
              <option value="3">Oficina Central / Inventario</option>
            </select>
          </div>

          <div>
            <label class="text-[11px] text-slate-400 block mb-1">Producto</label>
            <select id="transfer-producto" class="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:outline-none">
              <!-- Dynamically populated -->
            </select>
          </div>

          <div>
            <label class="text-[11px] text-slate-400 block mb-1">Cantidad</label>
            <input id="transfer-cantidad" type="number" min="1" value="25" class="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-white p-2.5 rounded-xl focus:outline-none" />
          </div>

          <div>
            <button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold p-2.5 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5">
              Transferir Stock
            </button>
          </div>
        </form>

        <div id="transfer-alert" class="hidden text-xs p-3 rounded-xl"></div>
      </div>
    </section>

    <!-- VIEW 3: SALES HISTORY -->
    <section id="view-ventas" class="space-y-6 hidden">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <h2 class="font-bold text-white text-base">Historial y Auditoría de Ventas</h2>
          <p class="text-xs text-slate-400">Registros atómicos con cajero/usuario responsable</p>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th class="p-3">Venta #</th>
                <th class="p-3">Sucursal</th>
                <th class="p-3">Cajero / Operador</th>
                <th class="p-3">Fecha y Hora</th>
                <th class="p-3">Artículos</th>
                <th class="p-3 text-right">Total ($ USD)</th>
              </tr>
            </thead>
            <tbody id="ventas-table-body" class="divide-y divide-slate-800/60 font-sans">
              <!-- Dynamically populated -->
            </tbody>
          </table>
        </div>
      </div>
    </section>

  </main>

  <!-- MODAL: LOGIN / SELECCIÓN DE USUARIO (3 CAMPOS LIMPIOS) -->
  <div id="modal-login" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-white text-base flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
          Iniciar Sesión
        </h3>
        <button onclick="toggleLoginModal()" class="text-slate-400 hover:text-white cursor-pointer text-lg font-bold">&times;</button>
      </div>

      <form onsubmit="handleLoginSubmit(event)" class="space-y-4">
        <!-- Campo 1: Tienda o Gerencia General -->
        <div>
          <label class="text-xs text-slate-300 font-semibold block mb-1">1. Tienda o Gerencia General:</label>
          <select id="login-area-select" onchange="onLoginAreaChange()" class="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer">
            <option value="1">Tienda 1 - Centro</option>
            <option value="2">Tienda 2 - Norte</option>
            <option value="3">Inventario / Gerencia General</option>
          </select>
        </div>

        <!-- Campo 2: Usuario (solo nombre, sin cargo ni PIN) -->
        <div>
          <label class="text-xs text-slate-300 font-semibold block mb-1">2. Usuario:</label>
          <select id="login-user-select" class="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer">
            <!-- Dynamically populated without role or pin -->
          </select>
        </div>

        <!-- Campo 3: Introducir PIN -->
        <div>
          <label class="text-xs text-slate-300 font-semibold block mb-1">3. PIN de Acceso:</label>
          <input id="login-pin-input" type="password" required placeholder="Introduce tu PIN..." class="w-full bg-slate-950 border border-slate-700 font-mono text-base text-emerald-400 p-2.5 rounded-xl focus:border-emerald-500 focus:outline-none tracking-widest placeholder:tracking-normal placeholder:text-xs placeholder:text-slate-600" />
        </div>

        <div id="login-error" class="hidden text-xs p-2.5 rounded-lg bg-rose-950/80 border border-rose-500/30 text-rose-300"></div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button type="button" onclick="toggleLoginModal()" class="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer">Cancelar</button>
          <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer">
            Ingresar
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- MODAL: GUÍA DE PINS Y USUARIOS -->
  <div id="modal-pin-guide" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-white text-base flex items-center gap-2">
          <svg class="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
          Directorio de Usuarios y Accesos Seguros (12 Cuentas)
        </h3>
        <button onclick="togglePinGuideModal()" class="text-slate-400 hover:text-white cursor-pointer">&times;</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <!-- Tienda 1 -->
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div class="font-bold text-emerald-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>Tienda 1 - Centro</span>
            <span class="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">4 Usuarios</span>
          </div>
          <div class="space-y-1 font-mono text-[11px] text-slate-300">
            <div><span class="text-white font-semibold">Ana Morales</span> (Cajera 1)<br/><span class="text-emerald-400">PIN: 1001</span></div>
            <div><span class="text-white font-semibold">Carlos Pérez</span> (Cajero 2)<br/><span class="text-emerald-400">PIN: 1002</span></div>
            <div><span class="text-white font-semibold">Diana Castro</span> (Cajera 3)<br/><span class="text-emerald-400">PIN: 1003</span></div>
            <div><span class="text-white font-semibold">Elena Rivas</span> (Supervisora)<br/><span class="text-amber-400">PIN: 1004</span></div>
          </div>
        </div>

        <!-- Tienda 2 -->
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div class="font-bold text-emerald-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>Tienda 2 - Norte</span>
            <span class="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300">4 Usuarios</span>
          </div>
          <div class="space-y-1 font-mono text-[11px] text-slate-300">
            <div><span class="text-white font-semibold">Fernando Soto</span> (Cajero 1)<br/><span class="text-emerald-400">PIN: 2001</span></div>
            <div><span class="text-white font-semibold">Gabriela Ruiz</span> (Cajera 2)<br/><span class="text-emerald-400">PIN: 2002</span></div>
            <div><span class="text-white font-semibold">Hugo Mendoza</span> (Cajero 3)<br/><span class="text-emerald-400">PIN: 2003</span></div>
            <div><span class="text-white font-semibold">Isabel Vargas</span> (Supervisora)<br/><span class="text-amber-400">PIN: 2004</span></div>
          </div>
        </div>

        <!-- Inventario y Admin -->
        <div class="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <div class="font-bold text-blue-400 border-b border-slate-800 pb-1.5 flex items-center justify-between">
            <span>Inventario / Central</span>
            <span class="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded text-blue-300">4 Usuarios</span>
          </div>
          <div class="space-y-1 font-mono text-[11px] text-slate-300">
            <div><span class="text-white font-semibold">Jorge Martínez</span> (Jefe Almacén)<br/><span class="text-blue-400">PIN: 3001</span></div>
            <div><span class="text-white font-semibold">Karla Benítez</span> (Auditora Stock)<br/><span class="text-blue-400">PIN: 3002</span></div>
            <div><span class="text-white font-semibold">Luis Navarro</span> (Traspasos)<br/><span class="text-blue-400">PIN: 3003</span></div>
            <div><span class="text-white font-semibold">Admin General</span> (Director)<br/><span class="text-purple-400">PIN: 9999</span></div>
          </div>
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button onclick="togglePinGuideModal()" class="bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">
          Entendido
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL: Configurar Credenciales de Supabase -->
  <div id="modal-config" class="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-white text-base flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          Conexión Directa Supabase
        </h3>
        <button onclick="toggleConfigModal()" class="text-slate-400 hover:text-white cursor-pointer">&times;</button>
      </div>

      <p class="text-xs text-slate-400 leading-relaxed">
        Pega tu <strong>Project URL</strong> y tu <strong>Anon Public Key</strong> de Supabase para sincronizar directamente en vivo con PostgreSQL:
      </p>

      <div class="space-y-3">
        <div>
          <label class="text-[11px] text-slate-300 font-semibold block mb-1">Project URL</label>
          <input id="cfg-supabase-url" type="text" value="https://jfnpxkxnkriquvapzniy.supabase.co" class="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-emerald-400 p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none" />
        </div>
        <div>
          <label class="text-[11px] text-slate-300 font-semibold block mb-1">Anon / Public API Key</label>
          <input id="cfg-supabase-anon" type="password" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." class="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-white p-2.5 rounded-lg focus:border-emerald-500 focus:outline-none" />
          <p class="text-[10px] text-slate-500 mt-1">La encuentras en Supabase ➡️ Project Settings ➡️ API Keys ➡️ anon (public)</p>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button onclick="toggleConfigModal()" class="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer">Cerrar</button>
        <button onclick="guardarConfigSupabase()" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">Guardar y Conectar</button>
      </div>
    </div>
  </div>

  <!-- MODAL: Nuevo Producto -->
  <div id="modal-new-product" class="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 hidden backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-white text-base">Registrar Nuevo Producto</h3>
        <button onclick="toggleNewProductModal()" class="text-slate-400 hover:text-white cursor-pointer">&times;</button>
      </div>

      <form id="new-prod-form" onsubmit="handleNewProductSubmit(event)" class="space-y-3">
        <div>
          <label class="text-[11px] text-slate-400 block mb-1">Código de Barras</label>
          <input id="new-p-code" type="text" required placeholder="Ej: 556677" class="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-white p-2.5 rounded-lg focus:outline-none" />
        </div>
        <div>
          <label class="text-[11px] text-slate-400 block mb-1">Nombre</label>
          <input id="new-p-name" type="text" required placeholder="Ej: Azúcar Morena 1kg" class="w-full bg-slate-950 border border-slate-700 text-xs text-white p-2.5 rounded-lg focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-[11px] text-slate-400 block mb-1">Precio ($ USD)</label>
            <input id="new-p-price" type="number" step="0.01" required placeholder="Ej: 1.80" class="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-white p-2.5 rounded-lg focus:outline-none" />
          </div>
          <div>
            <label class="text-[11px] text-slate-400 block mb-1">Stock Inicial Oficina</label>
            <input id="new-p-stock" type="number" value="100" required class="w-full bg-slate-950 border border-slate-700 font-mono text-xs text-white p-2.5 rounded-lg focus:outline-none" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-800">
          <button type="button" onclick="toggleNewProductModal()" class="px-4 py-2 text-xs text-slate-400 hover:text-white cursor-pointer">Cancelar</button>
          <button type="submit" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs cursor-pointer">Guardar Producto</button>
        </div>
      </form>
    </div>
  </div>

  <!-- JAVASCRIPT APP LOGIC -->
  <script>
    // 12 Security Users
    const usuarios = [
      // 4 Tienda 1
      { id: 1, username: 'cajero1_t1', nombre_completo: 'Ana Morales', pin: '1001', rol: 'cajero', sucursal_id: 1, cargo: 'Cajera Principal' },
      { id: 2, username: 'cajero2_t1', nombre_completo: 'Carlos Pérez', pin: '1002', rol: 'cajero', sucursal_id: 1, cargo: 'Cajero Turno Tarde' },
      { id: 3, username: 'cajero3_t1', nombre_completo: 'Diana Castro', pin: '1003', rol: 'cajero', sucursal_id: 1, cargo: 'Cajera Fines de Semana' },
      { id: 4, username: 'supervisor_t1', nombre_completo: 'Elena Rivas', pin: '1004', rol: 'supervisor', sucursal_id: 1, cargo: 'Supervisora Tienda 1' },

      // 4 Tienda 2
      { id: 5, username: 'cajero1_t2', nombre_completo: 'Fernando Soto', pin: '2001', rol: 'cajero', sucursal_id: 2, cargo: 'Cajero Principal' },
      { id: 6, username: 'cajero2_t2', nombre_completo: 'Gabriela Ruiz', pin: '2002', rol: 'cajero', sucursal_id: 2, cargo: 'Cajera Turno Tarde' },
      { id: 7, username: 'cajero3_t2', nombre_completo: 'Hugo Mendoza', pin: '2003', rol: 'cajero', sucursal_id: 2, cargo: 'Cajero Fines de Semana' },
      { id: 8, username: 'supervisor_t2', nombre_completo: 'Isabel Vargas', pin: '2004', rol: 'supervisor', sucursal_id: 2, cargo: 'Supervisora Tienda 2' },

      // 4 Inventario / Oficina
      { id: 9, username: 'inv_jefe', nombre_completo: 'Jorge Martínez', pin: '3001', rol: 'inventario', sucursal_id: 3, cargo: 'Jefe de Almacén e Inventarios' },
      { id: 10, username: 'inv_operador1', nombre_completo: 'Karla Benítez', pin: '3002', rol: 'inventario', sucursal_id: 3, cargo: 'Auditora de Existencias' },
      { id: 11, username: 'inv_operador2', nombre_completo: 'Luis Navarro', pin: '3003', rol: 'inventario', sucursal_id: 3, cargo: 'Encargado de Traspasos' },
      { id: 12, username: 'admin_general', nombre_completo: 'Administrador General', pin: '9999', rol: 'admin', sucursal_id: null, cargo: 'Director General / Admin Sistema' }
    ];

    let currentUser = usuarios[11]; // Director General por defecto para ver Dashboard de inicio

    // Local / Cloud State
    let sucursales = [
      { id: 1, nombre: 'Tienda 1 - Centro', tipo: 'tienda' },
      { id: 2, nombre: 'Tienda 2 - Norte', tipo: 'tienda' },
      { id: 3, nombre: 'Oficina Central / Inventario', tipo: 'oficina' }
    ];

    let productos = [
      { id: 1, codigo_barras: '123456', nombre: 'Arroz Integral 1kg', precio: 2.50 },
      { id: 2, codigo_barras: '789012', nombre: 'Aceite Vegetal 1L', precio: 4.80 },
      { id: 3, codigo_barras: '345678', nombre: 'Harina de Trigo 1kg', precio: 1.75 },
      { id: 4, codigo_barras: '901234', nombre: 'Café Molido Premium 500g', precio: 6.20 },
      { id: 5, codigo_barras: '567890', nombre: 'Detergente Líquido 2L', precio: 5.90 }
    ];

    let inventario = [
      { id: 1, sucursal_id: 1, producto_id: 1, stock: 150 },
      { id: 2, sucursal_id: 1, producto_id: 2, stock: 80 },
      { id: 3, sucursal_id: 1, producto_id: 3, stock: 200 },
      { id: 4, sucursal_id: 1, producto_id: 4, stock: 65 },
      { id: 5, sucursal_id: 1, producto_id: 5, stock: 45 },
      { id: 6, sucursal_id: 2, producto_id: 1, stock: 120 },
      { id: 7, sucursal_id: 2, producto_id: 2, stock: 95 },
      { id: 8, sucursal_id: 2, producto_id: 3, stock: 180 },
      { id: 9, sucursal_id: 2, producto_id: 4, stock: 50 },
      { id: 10, sucursal_id: 2, producto_id: 5, stock: 35 },
      { id: 11, sucursal_id: 3, producto_id: 1, stock: 1000 },
      { id: 12, sucursal_id: 3, producto_id: 2, stock: 500 },
      { id: 13, sucursal_id: 3, producto_id: 3, stock: 1500 },
      { id: 14, sucursal_id: 3, producto_id: 4, stock: 800 },
      { id: 15, sucursal_id: 3, producto_id: 5, stock: 600 }
    ];

    let ventas = [
      { id: 1, sucursal_id: 1, sucursal_nombre: 'Tienda 1 - Centro', usuario_id: 1, cajero: 'Ana Morales', fecha: new Date(Date.now() - 3600000).toLocaleString(), total: 24.50, articulos: 5 },
      { id: 2, sucursal_id: 2, sucursal_nombre: 'Tienda 2 - Norte', usuario_id: 5, cajero: 'Fernando Soto', fecha: new Date(Date.now() - 7200000).toLocaleString(), total: 18.20, articulos: 3 },
      { id: 3, sucursal_id: 1, sucursal_nombre: 'Tienda 1 - Centro', usuario_id: 2, cajero: 'Carlos Pérez', fecha: new Date(Date.now() - 10800000).toLocaleString(), total: 42.10, articulos: 8 }
    ];

    let cart = [];
    let supabaseClient = null;
    let currentDashboardPeriod = '30days';
    let chartEvolutionInstance = null;
    let chartPieInstance = null;

    // Initialize App
    window.addEventListener('DOMContentLoaded', () => {
      initSupabase();
      populateLoginUserSelect();
      updateAuthUI();
      renderAll();
      setupBarcodeListener();
      initDashboardCharts();
      updateDashboardUI();
    });

    function onLoginAreaChange() {
      const areaVal = document.getElementById('login-area-select').value;
      populateLoginUserSelect(areaVal);
      document.getElementById('login-pin-input').value = '';
      document.getElementById('login-error').classList.add('hidden');
    }

    function populateLoginUserSelect(areaVal = '1') {
      const select = document.getElementById('login-user-select');
      select.innerHTML = '';

      let filtered = [];
      if (areaVal === '1') {
        filtered = usuarios.filter(u => u.sucursal_id === 1);
      } else if (areaVal === '2') {
        filtered = usuarios.filter(u => u.sucursal_id === 2);
      } else {
        filtered = usuarios.filter(u => u.sucursal_id === 3 || u.sucursal_id === null);
      }

      filtered.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u.id;
        opt.innerText = u.nombre_completo; // Solo nombre, sin cargo ni PIN
        select.appendChild(opt);
      });
    }

    function updateAuthUI() {
      const badge = document.getElementById('auth-user-badge');
      if (currentUser) {
        let roleBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        if (currentUser.rol === 'admin') roleBadge = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
        if (currentUser.rol === 'inventario') roleBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        if (currentUser.rol === 'supervisor') roleBadge = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

        badge.innerHTML = '<span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ' + roleBadge + '">' + currentUser.rol.toUpperCase() + '</span>' +
          '<span class="text-white font-semibold">' + currentUser.nombre_completo + '</span>' +
          '<span class="text-slate-400 hidden sm:inline">(' + currentUser.cargo + ')</span>';

        if (currentUser.sucursal_id && currentUser.sucursal_id <= 2) {
          document.getElementById('pos-sucursal-select').value = currentUser.sucursal_id;
        }
      } else {
        badge.innerHTML = '<span class="text-amber-400 font-bold">Sin usuario autenticado</span>';
      }
    }

    function handleLoginSubmit(e) {
      e.preventDefault();
      const userId = parseInt(document.getElementById('login-user-select').value);
      const pin = document.getElementById('login-pin-input').value.trim();
      const errEl = document.getElementById('login-error');

      const target = usuarios.find(u => u.id === userId);
      if (!target || target.pin !== pin) {
        errEl.innerText = 'PIN incorrecto. Verifica e intenta nuevamente.';
        errEl.classList.remove('hidden');
        return;
      }

      errEl.classList.add('hidden');
      currentUser = target;
      toggleLoginModal();
      updateAuthUI();
      cart = [];
      renderAll();
      updateDashboardUI();
    }

    function setDashboardPeriod(p) {
      currentDashboardPeriod = p;
      document.querySelectorAll('.period-btn').forEach(b => {
        b.classList.remove('active', 'bg-purple-600', 'text-white', 'shadow-sm');
        b.classList.add('text-slate-400');
      });
      const targetBtn = document.getElementById('btn-period-' + p);
      if (targetBtn) {
        targetBtn.classList.add('active', 'bg-purple-600', 'text-white', 'shadow-sm');
        targetBtn.classList.remove('text-slate-400');
      }
      updateDashboardUI();
    }

    function switchDashSubTab(subId) {
      document.querySelectorAll('.dash-subtab').forEach(b => {
        b.classList.remove('active', 'bg-purple-600', 'text-white');
        b.classList.add('bg-slate-800', 'text-slate-400');
      });
      document.getElementById('subtab-' + subId).classList.add('active', 'bg-purple-600', 'text-white');
      document.getElementById('subtab-' + subId).classList.remove('bg-slate-800', 'text-slate-400');

      document.getElementById('dash-subview-sucursales').classList.add('hidden');
      document.getElementById('dash-subview-productos').classList.add('hidden');
      document.getElementById('dash-subview-cajeros').classList.add('hidden');

      document.getElementById('dash-subview-' + subId).classList.remove('hidden');
    }

    function initDashboardCharts() {
      // Evolución
      const ctxEvo = document.getElementById('chart-evolution');
      if (ctxEvo && window.Chart) {
        chartEvolutionInstance = new Chart(ctxEvo, {
          type: 'line',
          data: {
            labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
            datasets: [
              {
                label: 'Ingresos ($)',
                data: [420, 580, 710, 890],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.35
              },
              {
                label: 'Utilidad Neta ($)',
                data: [147, 203, 248, 311],
                borderColor: '#a855f7',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.35
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 11 } } },
              y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b', font: { size: 11 }, callback: v => '$' + v } }
            }
          }
        });
      }

      // Mix de Sucursales
      const ctxPie = document.getElementById('chart-pie-branch');
      if (ctxPie && window.Chart) {
        chartPieInstance = new Chart(ctxPie, {
          type: 'doughnut',
          data: {
            labels: ['Tienda 1 - Centro', 'Tienda 2 - Norte'],
            datasets: [{
              data: [1280.50, 1140.20],
              backgroundColor: ['#10b981', '#3b82f6'],
              borderColor: '#0f172a',
              borderWidth: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            cutout: '70%'
          }
        });
      }
    }

    function updateDashboardUI() {
      const branchFilter = document.getElementById('dash-sucursal-filter').value;
      const baseMultiplier = currentDashboardPeriod === 'today' ? 0.08 : (currentDashboardPeriod === '7days' ? 0.35 : (currentDashboardPeriod === '30days' ? 1.0 : 4.5));

      let t1Sales = 1280.50 * baseMultiplier;
      let t2Sales = 1140.20 * baseMultiplier;

      // Sumar ventas reales de la sesión
      ventas.forEach(v => {
        if (v.sucursal_id === 1) t1Sales += v.total;
        if (v.sucursal_id === 2) t2Sales += v.total;
      });

      let totalIngresos = (branchFilter === '1' ? t1Sales : (branchFilter === '2' ? t2Sales : t1Sales + t2Sales));
      let totalVentasCount = Math.floor(totalIngresos / 20) + 3;
      let utilidadBruta = totalIngresos * 0.35;
      let costoMercaderia = totalIngresos * 0.65;
      let ticketPromedio = totalVentasCount > 0 ? totalIngresos / totalVentasCount : 0;
      let unidadesVendidas = Math.floor(totalIngresos / 8) + 12;

      // Calcular valorización total de inventario
      let valorInventario = 0;
      let stockTotalUn = 0;
      inventario.forEach(inv => {
        const prod = productos.find(p => p.id === inv.producto_id);
        if (prod) {
          if (branchFilter === 'all' || inv.sucursal_id === parseInt(branchFilter)) {
            valorInventario += inv.stock * prod.precio;
            stockTotalUn += inv.stock;
          }
        }
      });

      // Actualizar DOM KPIs
      document.getElementById('kpi-ingresos').innerText = '$' + totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      document.getElementById('kpi-transacciones-sub').innerText = 'Total facturado en ' + totalVentasCount + ' transacciones';
      document.getElementById('kpi-utilidad').innerText = '$' + utilidadBruta.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      document.getElementById('kpi-costo-sub').innerText = 'Costo estimado: $' + costoMercaderia.toFixed(2);
      document.getElementById('kpi-ticket').innerText = '$' + ticketPromedio.toFixed(2);
      document.getElementById('kpi-unidades-sub').innerText = unidadesVendidas + ' unidades despachadas';
      document.getElementById('kpi-inventario').innerText = '$' + valorInventario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      document.getElementById('kpi-stock-total').innerText = stockTotalUn.toLocaleString() + ' un. en existencias';

      // Comparativa Sucursales
      document.getElementById('t1-facturacion').innerText = '$' + t1Sales.toFixed(2);
      document.getElementById('t2-facturacion').innerText = '$' + t2Sales.toFixed(2);
      document.getElementById('pie-val-t1').innerText = '$' + t1Sales.toFixed(2);
      document.getElementById('pie-val-t2').innerText = '$' + t2Sales.toFixed(2);

      const t1Stock = inventario.filter(i => i.sucursal_id === 1).reduce((a, b) => a + b.stock, 0);
      const t2Stock = inventario.filter(i => i.sucursal_id === 2).reduce((a, b) => a + b.stock, 0);
      document.getElementById('t1-stock-count').innerText = t1Stock + ' un.';
      document.getElementById('t2-stock-count').innerText = t2Stock + ' un.';

      // Actualizar Gráficas
      if (chartEvolutionInstance) {
        if (currentDashboardPeriod === 'today') {
          chartEvolutionInstance.data.labels = ['08:00', '11:00', '14:00', '17:00', '20:00'];
          chartEvolutionInstance.data.datasets[0].data = [35, 65, 110, 85, 45];
          chartEvolutionInstance.data.datasets[1].data = [12, 22, 38, 29, 15];
        } else if (currentDashboardPeriod === '7days') {
          chartEvolutionInstance.data.labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
          chartEvolutionInstance.data.datasets[0].data = [120, 145, 110, 180, 240, 310, 220];
          chartEvolutionInstance.data.datasets[1].data = [42, 50, 38, 63, 84, 108, 77];
        } else {
          chartEvolutionInstance.data.labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
          chartEvolutionInstance.data.datasets[0].data = [420 * baseMultiplier, 580 * baseMultiplier, 710 * baseMultiplier, 890 * baseMultiplier];
          chartEvolutionInstance.data.datasets[1].data = [147 * baseMultiplier, 203 * baseMultiplier, 248 * baseMultiplier, 311 * baseMultiplier];
        }
        chartEvolutionInstance.update();
      }

      if (chartPieInstance) {
        chartPieInstance.data.datasets[0].data = [t1Sales, t2Sales];
        chartPieInstance.update();
      }

      renderTopProductsTable();
      renderCashiersPerformanceTable();
    }

    function renderTopProductsTable() {
      const tbody = document.getElementById('top-products-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      const baseTop = [
        { rank: 1, nombre: 'Café Molido Premium 500g', unidades: 142, total: 880.40 },
        { rank: 2, nombre: 'Aceite Vegetal 1L', unidades: 118, total: 566.40 },
        { rank: 3, nombre: 'Detergente Líquido 2L', unidades: 94, total: 554.60 },
        { rank: 4, nombre: 'Arroz Integral 1kg', unidades: 185, total: 462.50 },
        { rank: 5, nombre: 'Harina de Trigo 1kg', unidades: 130, total: 227.50 }
      ];

      baseTop.forEach(p => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition-colors";
        tr.innerHTML = '<td class="p-3 font-mono font-bold text-purple-400">#' + p.rank + '</td>' +
          '<td class="p-3 font-semibold text-white">' + p.nombre + '</td>' +
          '<td class="p-3 text-right font-mono text-slate-300">' + p.unidades + ' un.</td>' +
          '<td class="p-3 text-right font-mono font-bold text-emerald-400">$' + p.total.toFixed(2) + '</td>' +
          '<td class="p-3 text-right font-mono text-purple-300">$' + (p.total * 0.35).toFixed(2) + '</td>';
        tbody.appendChild(tr);
      });
    }

    function renderCashiersPerformanceTable() {
      const tbody = document.getElementById('cashiers-table-body');
      if (!tbody) return;
      tbody.innerHTML = '';

      const cashiers = usuarios.filter(u => u.rol === 'cajero');
      cashiers.forEach((c, idx) => {
        const total = c.sucursal_id === 1 ? 420 + c.id * 35 : 380 + c.id * 30;
        const tickets = Math.floor(total / 18);
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition-colors";
        tr.innerHTML = '<td class="p-3 font-semibold text-white">' + (idx === 0 ? '🏆 ' : '') + c.nombre_completo + '</td>' +
          '<td class="p-3 text-slate-300">' + (c.sucursal_id === 1 ? 'Tienda 1 - Centro' : 'Tienda 2 - Norte') + '</td>' +
          '<td class="p-3 text-slate-400">' + c.cargo + '</td>' +
          '<td class="p-3 text-right font-mono text-slate-300">' + tickets + '</td>' +
          '<td class="p-3 text-right font-mono text-slate-300">$' + (total / tickets).toFixed(2) + '</td>' +
          '<td class="p-3 text-right font-mono font-bold text-emerald-400">$' + total.toFixed(2) + '</td>';
        tbody.appendChild(tr);
      });
    }

    function initSupabase() {
      const savedUrl = localStorage.getItem('pos_supabase_url') || 'https://jfnpxkxnkriquvapzniy.supabase.co';
      const savedAnon = localStorage.getItem('pos_supabase_anon_key') || '';
      document.getElementById('cfg-supabase-url').value = savedUrl;
      document.getElementById('cfg-supabase-anon').value = savedAnon;

      if (savedUrl && savedAnon && window.supabase) {
        try {
          supabaseClient = window.supabase.createClient(savedUrl, savedAnon);
          document.getElementById('status-text').innerText = 'Conectado a Supabase en Vivo';
          fetchCloudData();
        } catch (e) {
          console.error('Supabase init error:', e);
        }
      }
    }

    async function fetchCloudData() {
      if (!supabaseClient) return;
      try {
        const { data: sucs } = await supabaseClient.from('sucursales').select('*');
        if (sucs && sucs.length > 0) sucursales = sucs;

        const { data: prods } = await supabaseClient.from('productos').select('*');
        if (prods && prods.length > 0) productos = prods;

        const { data: inv } = await supabaseClient.from('inventario').select('*');
        if (inv && inv.length > 0) inventario = inv;

        renderAll();
        updateDashboardUI();
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }

    function setupBarcodeListener() {
      const input = document.getElementById('barcode-input');
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleScan(input.value);
          input.value = '';
        }
      });
    }

    function handleScanManual() {
      const input = document.getElementById('barcode-input');
      handleScan(input.value);
      input.value = '';
    }

    function handleScan(code) {
      code = (code || '').trim();
      if (!code) return;

      const sucursalId = parseInt(document.getElementById('pos-sucursal-select').value);

      if (currentUser && currentUser.sucursal_id && currentUser.sucursal_id !== sucursalId && currentUser.rol !== 'admin') {
        showPosAlert('Acceso restringido: ' + currentUser.nombre_completo + ' solo tiene permisos en Tienda ' + currentUser.sucursal_id, 'error');
        return;
      }

      const prod = productos.find(p => p.codigo_barras === code);

      if (!prod) {
        showPosAlert('Código ' + code + ' no encontrado en el catálogo.', 'error');
        return;
      }

      const invItem = inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === prod.id);
      const stockDisponible = invItem ? invItem.stock : 0;

      const itemInCart = cart.find(c => c.producto.id === prod.id);
      const currentCartQty = itemInCart ? itemInCart.cantidad : 0;

      if (currentCartQty + 1 > stockDisponible) {
        showPosAlert('Stock insuficiente de ' + prod.nombre + '. Disponible: ' + stockDisponible + ' un.', 'error');
        return;
      }

      if (itemInCart) {
        itemInCart.cantidad += 1;
      } else {
        cart.push({ producto: prod, cantidad: 1, stockDisponible });
      }

      showPosAlert('Agregado: ' + prod.nombre + ' ($' + prod.precio.toFixed(2) + ')', 'success');
      renderCart();
    }

    function updateCartQty(prodId, delta) {
      const item = cart.find(c => c.producto.id === prodId);
      if (!item) return;

      const newQty = item.cantidad + delta;
      if (newQty > item.stockDisponible) {
        showPosAlert('Supera el stock disponible (' + item.stockDisponible + ')', 'error');
        return;
      }

      if (newQty <= 0) {
        cart = cart.filter(c => c.producto.id !== prodId);
      } else {
        item.cantidad = newQty;
      }
      renderCart();
    }

    function removeCartItem(prodId) {
      cart = cart.filter(c => c.producto.id !== prodId);
      renderCart();
    }

    async function procesarVenta() {
      if (cart.length === 0) return;
      const sucursalId = parseInt(document.getElementById('pos-sucursal-select').value);

      if (currentUser && currentUser.sucursal_id && currentUser.sucursal_id !== sucursalId && currentUser.rol !== 'admin') {
        showPosAlert('No autorizado para cobrar en esta sucursal.', 'error');
        return;
      }

      const totalVenta = cart.reduce((acc, item) => acc + (item.producto.precio * item.cantidad), 0);
      const sucursalNombre = sucursales.find(s => s.id === sucursalId)?.nombre || 'Tienda';
      const cajeroNombre = currentUser ? currentUser.nombre_completo : 'Cajero Desconocido';

      cart.forEach(item => {
        const invItem = inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === item.producto.id);
        if (invItem) {
          invItem.stock = Math.max(0, invItem.stock - item.cantidad);
        }
      });

      const nuevaVenta = {
        id: ventas.length + 1,
        sucursal_id: sucursalId,
        sucursal_nombre: sucursalNombre,
        cajero: cajeroNombre,
        fecha: new Date().toLocaleString(),
        total: totalVenta,
        articulos: cart.reduce((acc, i) => acc + i.cantidad, 0)
      };
      ventas.unshift(nuevaVenta);

      if (supabaseClient) {
        try {
          await supabaseClient.from('ventas').insert([{
            sucursal_id: sucursalId,
            usuario_id: currentUser ? currentUser.id : null,
            total: totalVenta
          }]);
          for (const item of cart) {
            const inv = inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === item.producto.id);
            if (inv) {
              await supabaseClient.from('inventario')
                .update({ stock: inv.stock })
                .match({ sucursal_id: sucursalId, producto_id: item.producto.id });
            }
          }
        } catch (e) {
          console.warn('Sync warning:', e);
        }
      }

      showPosAlert('¡Venta de $' + totalVenta.toFixed(2) + ' registrada por ' + cajeroNombre + '!', 'success');
      cart = [];
      renderAll();
      updateDashboardUI();
    }

    function handleTransferSubmit(e) {
      e.preventDefault();

      if (currentUser && currentUser.rol !== 'inventario' && currentUser.rol !== 'admin') {
        showTransferAlert('Acceso denegado: Solo los usuarios de Inventario u Oficina pueden autorizar transferencias.', 'error');
        return;
      }

      const origenId = parseInt(document.getElementById('transfer-origen').value);
      const destinoId = parseInt(document.getElementById('transfer-destino').value);
      const prodId = parseInt(document.getElementById('transfer-producto').value);
      const cantidad = parseInt(document.getElementById('transfer-cantidad').value);

      if (origenId === destinoId) {
        showTransferAlert('Origen y Destino deben ser distintos.', 'error');
        return;
      }

      const invOrigen = inventario.find(i => i.sucursal_id === origenId && i.producto_id === prodId);
      if (!invOrigen || invOrigen.stock < cantidad) {
        showTransferAlert('Stock insuficiente en la sucursal de origen.', 'error');
        return;
      }

      invOrigen.stock -= cantidad;
      let invDestino = inventario.find(i => i.sucursal_id === destinoId && i.producto_id === prodId);
      if (invDestino) {
        invDestino.stock += cantidad;
      } else {
        inventario.push({ id: inventario.length + 1, sucursal_id: destinoId, producto_id: prodId, stock: cantidad });
      }

      showTransferAlert('¡Transferencia de ' + cantidad + ' un. autorizada por ' + currentUser.nombre_completo + '!', 'success');
      renderAll();
      updateDashboardUI();
    }

    function handleNewProductSubmit(e) {
      e.preventDefault();

      if (currentUser && currentUser.rol !== 'inventario' && currentUser.rol !== 'admin') {
        alert('Solo el personal de Inventario o Administradores pueden crear nuevos productos.');
        return;
      }

      const code = document.getElementById('new-p-code').value.trim();
      const name = document.getElementById('new-p-name').value.trim();
      const price = parseFloat(document.getElementById('new-p-price').value);
      const stockOficina = parseInt(document.getElementById('new-p-stock').value) || 0;

      const newId = productos.length + 1;
      productos.push({ id: newId, codigo_barras: code, nombre: name, precio: price });

      inventario.push({ id: inventario.length + 1, sucursal_id: 1, producto_id: newId, stock: 0 });
      inventario.push({ id: inventario.length + 2, sucursal_id: 2, producto_id: newId, stock: 0 });
      inventario.push({ id: inventario.length + 3, sucursal_id: 3, producto_id: newId, stock: stockOficina });

      toggleNewProductModal();
      renderAll();
      updateDashboardUI();
    }

    function renderAll() {
      renderQuickProducts();
      renderCart();
      renderInventoryTable();
      renderTransferSelect();
      renderVentasTable();
    }

    function onPosSucursalChange() {
      cart = [];
      renderAll();
    }

    function renderQuickProducts() {
      const sucursalId = parseInt(document.getElementById('pos-sucursal-select').value);
      const container = document.getElementById('pos-quick-products');
      container.innerHTML = '';

      productos.forEach(p => {
        const inv = inventario.find(i => i.sucursal_id === sucursalId && i.producto_id === p.id);
        const stock = inv ? inv.stock : 0;

        const btn = document.createElement('button');
        btn.onclick = () => handleScan(p.codigo_barras);
        btn.className = "flex items-center justify-between p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all text-left text-xs cursor-pointer group";
        btn.innerHTML = '<div><span class="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors block">' + p.nombre + '</span><span class="font-mono text-[11px] text-slate-500">BARCODE: ' + p.codigo_barras + '</span></div><div class="text-right"><span class="font-bold text-emerald-400 block">$' + p.precio.toFixed(2) + '</span><span class="text-[10px] ' + (stock < 20 ? 'text-rose-400 font-bold' : 'text-slate-400') + '">Stock: ' + stock + ' un.</span></div>';
        container.appendChild(btn);
      });
    }

    function renderCart() {
      const countEl = document.getElementById('cart-item-count');
      const totalEl = document.getElementById('cart-total-amount');
      const emptyState = document.getElementById('cart-empty-state');
      const itemsContainer = document.getElementById('cart-items-container');
      const btnCheckout = document.getElementById('btn-checkout');

      const totalItems = cart.reduce((acc, i) => acc + i.cantidad, 0);
      const totalMoney = cart.reduce((acc, i) => acc + (i.producto.precio * i.cantidad), 0);

      countEl.innerText = totalItems + ' unidades';
      totalEl.innerText = '$' + totalMoney.toFixed(2);

      if (cart.length === 0) {
        emptyState.classList.remove('hidden');
        itemsContainer.classList.add('hidden');
        btnCheckout.disabled = true;
        btnCheckout.className = "w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-slate-800 text-slate-500 cursor-not-allowed";
      } else {
        emptyState.classList.add('hidden');
        itemsContainer.classList.remove('hidden');
        btnCheckout.disabled = false;
        btnCheckout.className = "w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-950/50";

        itemsContainer.innerHTML = '';
        cart.forEach(item => {
          const row = document.createElement('div');
          row.className = "py-3 flex items-center justify-between gap-3";
          row.innerHTML = '<div class="flex-1 min-w-0"><h4 class="font-semibold text-slate-200 text-xs truncate">' + item.producto.nombre + '</h4><p class="text-[11px] font-mono text-slate-500">$' + item.producto.precio.toFixed(2) + ' x ' + item.cantidad + ' = $' + (item.producto.precio * item.cantidad).toFixed(2) + '</p></div><div class="flex items-center space-x-2"><button onclick="updateCartQty(' + item.producto.id + ', -1)" class="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg text-xs cursor-pointer">-</button><span class="font-mono font-bold text-xs text-white w-6 text-center">' + item.cantidad + '</span><button onclick="updateCartQty(' + item.producto.id + ', 1)" class="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg text-xs cursor-pointer">+</button><button onclick="removeCartItem(' + item.producto.id + ')" class="bg-rose-950/40 hover:bg-rose-900 text-rose-400 p-1.5 rounded-lg text-xs ml-2 cursor-pointer">&times;</button></div>';
          itemsContainer.appendChild(row);
        });
      }
    }

    function renderInventoryTable() {
      const tbody = document.getElementById('inventory-table-body');
      tbody.innerHTML = '';

      productos.forEach(prod => {
        const invT1 = inventario.find(i => i.sucursal_id === 1 && i.producto_id === prod.id)?.stock || 0;
        const invT2 = inventario.find(i => i.sucursal_id === 2 && i.producto_id === prod.id)?.stock || 0;
        const invOf = inventario.find(i => i.sucursal_id === 3 && i.producto_id === prod.id)?.stock || 0;
        const total = invT1 + invT2 + invOf;

        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40 transition-colors";
        tr.innerHTML = '<td class="p-3 font-mono text-emerald-400 font-semibold">' + prod.codigo_barras + '</td><td class="p-3 font-bold text-white">' + prod.nombre + '</td><td class="p-3 font-mono text-slate-300">$' + prod.precio.toFixed(2) + '</td><td class="p-3 text-center"><span class="px-2 py-1 rounded-md text-xs font-mono font-bold ' + (invT1 < 20 ? 'bg-rose-950/80 text-rose-300' : 'bg-emerald-950/80 text-emerald-300') + '">' + invT1 + ' un.</span></td><td class="p-3 text-center"><span class="px-2 py-1 rounded-md text-xs font-mono font-bold ' + (invT2 < 20 ? 'bg-rose-950/80 text-rose-300' : 'bg-emerald-950/80 text-emerald-300') + '">' + invT2 + ' un.</span></td><td class="p-3 text-center"><span class="px-2 py-1 rounded-md text-xs font-mono font-bold bg-slate-800 text-slate-300">' + invOf + ' un.</span></td><td class="p-3 text-right font-mono font-extrabold text-white">' + total + ' un.</td>';
        tbody.appendChild(tr);
      });
    }

    function renderTransferSelect() {
      const select = document.getElementById('transfer-producto');
      select.innerHTML = '';
      productos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.innerText = p.nombre;
        select.appendChild(opt);
      });
    }

    function renderVentasTable() {
      const tbody = document.getElementById('ventas-table-body');
      tbody.innerHTML = '';

      if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-slate-500">No hay ventas registradas en esta sesión.</td></tr>';
        return;
      }

      ventas.forEach(v => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-800/40";
        tr.innerHTML = '<td class="p-3 font-mono text-emerald-400 font-bold">#' + v.id + '</td><td class="p-3 text-slate-200">' + v.sucursal_nombre + '</td><td class="p-3 text-slate-300 font-semibold">' + (v.cajero || 'Ana Morales') + '</td><td class="p-3 text-slate-400 text-[11px]">' + v.fecha + '</td><td class="p-3 font-mono">' + v.articulos + ' artículos</td><td class="p-3 text-right font-mono font-bold text-emerald-400">$' + v.total.toFixed(2) + '</td>';
        tbody.appendChild(tr);
      });
    }

    // UI Helper Modals & Tabs
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('bg-emerald-600', 'bg-purple-600', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-900', 'text-slate-400');
      });

      const activeBtn = document.getElementById('tab-' + tabId);
      if (tabId === 'gerencia') {
        activeBtn.classList.add('bg-purple-600', 'text-white', 'shadow-md', 'shadow-purple-600/30');
      } else {
        activeBtn.classList.add('bg-emerald-600', 'text-white');
      }
      activeBtn.classList.remove('bg-slate-900', 'text-slate-400');

      document.getElementById('view-gerencia').classList.add('hidden');
      document.getElementById('view-pos').classList.add('hidden');
      document.getElementById('view-inventario').classList.add('hidden');
      document.getElementById('view-ventas').classList.add('hidden');
      document.getElementById('view-' + tabId).classList.remove('hidden');

      if (tabId === 'gerencia') {
        updateDashboardUI();
      }
    }

    function toggleConfigModal() {
      document.getElementById('modal-config').classList.toggle('hidden');
    }

    function toggleLoginModal() {
      const modal = document.getElementById('modal-login');
      modal.classList.toggle('hidden');
      if (!modal.classList.contains('hidden')) {
        document.getElementById('login-pin-input').value = '';
        document.getElementById('login-error').classList.add('hidden');
      }
    }

    function togglePinGuideModal() {
      document.getElementById('modal-pin-guide').classList.toggle('hidden');
    }

    function toggleNewProductModal() {
      document.getElementById('modal-new-product').classList.toggle('hidden');
    }

    function guardarConfigSupabase() {
      const url = document.getElementById('cfg-supabase-url').value.trim();
      const key = document.getElementById('cfg-supabase-anon').value.trim();
      localStorage.setItem('pos_supabase_url', url);
      localStorage.setItem('pos_supabase_anon_key', key);
      toggleConfigModal();
      initSupabase();
    }

    function showPosAlert(msg, type) {
      const el = document.getElementById('pos-alert');
      el.innerText = msg;
      el.className = type === 'success' 
        ? "text-xs p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 flex items-center gap-2"
        : "text-xs p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 flex items-center gap-2";
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3500);
    }

    function showTransferAlert(msg, type) {
      const el = document.getElementById('transfer-alert');
      el.innerText = msg;
      el.className = type === 'success'
        ? "text-xs p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300"
        : "text-xs p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300";
      el.classList.remove('hidden');
      setTimeout(() => el.classList.add('hidden'), 3500);
    }
  </script>
</body>
</html>`;
