import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle, 
  AlertCircle, 
  Store, 
  Zap, 
  DollarSign, 
  Lock, 
  Printer, 
  Receipt, 
  X,
  User,
  Users,
  Search,
  UserPlus,
  Smartphone,
  Banknote,
  Coins,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  TrendingUp,
  Flame,
  Filter,
  Package
} from 'lucide-react';
import { 
  Sucursal, 
  Producto, 
  InventarioItem, 
  Venta, 
  Usuario, 
  EmpresaConfig, 
  Cliente,
  DetallePagoVenta 
} from '../types';
import { formatUSD, formatBs, formatDual } from '../lib/currency';
import { FiscalCortesView } from './FiscalCortesView';

interface PosSimulatorProps {
  sucursales: Sucursal[];
  productos: Producto[];
  inventario: InventarioItem[];
  currentUser: Usuario | null;
  empresaConfig: EmpresaConfig;
  clientes: Cliente[];
  onRegistrarVenta: (
    sucursalId: number, 
    items: { producto: Producto; cantidad: number }[],
    cliente: { id: number | null; nombre: string; rif: string },
    pagoDetalle: DetallePagoVenta
  ) => void;
  onAddCliente?: (cliente: Omit<Cliente, 'id' | 'saldoPendiente' | 'fechaRegistro'>) => void;
  ventas: Venta[];
}

export const PosSimulator: React.FC<PosSimulatorProps> = ({
  sucursales,
  productos,
  inventario,
  currentUser,
  empresaConfig,
  clientes,
  onRegistrarVenta,
  onAddCliente,
  ventas,
}) => {
  const [selectedSucursalId, setSelectedSucursalId] = useState<number>(
    currentUser?.sucursal_id && currentUser.sucursal_id <= 2 ? currentUser.sucursal_id : 1
  );
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [cart, setCart] = useState<{ producto: Producto; cantidad: number; stockDisponible: number }[]>([]);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Client Selection State (Default: 'Cliente de Contado')
  const DEFAULT_CLIENTE = {
    id: null as number | null,
    nombre: 'Cliente de Contado',
    rif: 'V-00000000',
    telefono: 'N/A'
  };
  const [selectedCliente, setSelectedCliente] = useState<{
    id: number | null;
    nombre: string;
    rif: string;
    telefono?: string;
  }>(DEFAULT_CLIENTE);

  // Fast Cédula / RIF Input & Instant Auto-lookup State
  const [cedulaFastInput, setCedulaFastInput] = useState<string>('');
  const [fastLookupStatus, setFastLookupStatus] = useState<{
    status: 'idle' | 'found' | 'not_found';
    message?: string;
  }>({ status: 'idle' });

  const [showClientModal, setShowClientModal] = useState<boolean>(false);
  const [clientSearch, setClientSearch] = useState<string>('');
  const [showQuickNewClient, setShowQuickNewClient] = useState<boolean>(false);
  const [newClientData, setNewClientData] = useState({
    nombre: '',
    rif_cedula: '',
    telefono: '',
    email: '',
    direccion: '',
    limiteCredito: 0
  });

  // Map of total units sold per product for sorting "mayor a menor venta"
  const productSalesMap = useMemo(() => {
    const map: Record<number, { unitsSold: number; totalAmountSold: number }> = {};
    ventas.forEach((v) => {
      v.detalles?.forEach((d) => {
        if (!map[d.producto_id]) {
          map[d.producto_id] = { unitsSold: 0, totalAmountSold: 0 };
        }
        map[d.producto_id].unitsSold += d.cantidad;
        map[d.producto_id].totalAmountSold += d.subtotal || (d.cantidad * d.precio_unitario);
      });
    });
    return map;
  }, [ventas]);

  // Product Search & Category Filters
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(productos.map(p => p.categoria || 'General'))).filter(Boolean);
    return ['all', ...cats];
  }, [productos]);

  const sortedAndFilteredProductos = useMemo(() => {
    return productos
      .filter((p) => {
        const matchesSearch = 
          !productSearch.trim() ||
          p.nombre.toLowerCase().includes(productSearch.toLowerCase()) ||
          p.codigo_barras.toLowerCase().includes(productSearch.toLowerCase()) ||
          (p.categoria && p.categoria.toLowerCase().includes(productSearch.toLowerCase()));
        const matchesCat = selectedCategory === 'all' || p.categoria === selectedCategory;
        return matchesSearch && matchesCat;
      })
      .sort((a, b) => {
        const salesA = productSalesMap[a.id]?.unitsSold || 0;
        const salesB = productSalesMap[b.id]?.unitsSold || 0;
        if (salesB !== salesA) {
          return salesB - salesA; // Mayor a menor venta
        }
        return a.nombre.localeCompare(b.nombre);
      });
  }, [productos, productSearch, selectedCategory, productSalesMap]);

  // Payment / Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'efectivo_usd' | 'efectivo_bs' | 'tarjeta' | 'mixto'>('pago_movil');
  
  // Payment Inputs
  const [pagoMovilRef, setPagoMovilRef] = useState<string>('');
  const [pagoMovilBanco, setPagoMovilBanco] = useState<string>('0102 - Banco de Venezuela');
  const [efectivoUsdRecibido, setEfectivoUsdRecibido] = useState<string>('');
  const [efectivoBsRecibido, setEfectivoBsRecibido] = useState<string>('');
  
  // Tarjeta (Punto de Venta / Débito / Crédito / Internacional) Inputs
  const [tarjetaTipo, setTarjetaTipo] = useState<'debito' | 'credito' | 'internacional'>('debito');
  const [tarjetaBanco, setTarjetaBanco] = useState<string>('0134 - Banesco (Terminal #1)');
  const [tarjetaReferencia, setTarjetaReferencia] = useState<string>('');
  const [tarjetaLote, setTarjetaLote] = useState<string>('');

  // Mixed Payment Inputs
  const [mixtoUsd, setMixtoUsd] = useState<string>('');
  const [mixtoBsEfectivo, setMixtoBsEfectivo] = useState<string>('');
  const [mixtoPagoMovilBs, setMixtoPagoMovilBs] = useState<string>('');
  const [mixtoPagoMovilRef, setMixtoPagoMovilRef] = useState<string>('');
  const [mixtoTarjetaBs, setMixtoTarjetaBs] = useState<string>('');
  const [mixtoTarjetaRef, setMixtoTarjetaRef] = useState<string>('');
  const [mixtoTarjetaTipo, setMixtoTarjetaTipo] = useState<'debito' | 'credito' | 'internacional'>('debito');
  const [mixtoTarjetaBanco, setMixtoTarjetaBanco] = useState<string>('0134 - Banesco (Terminal #1)');

  // Ticket Receipt preview
  const [lastCompletedTicket, setLastCompletedTicket] = useState<{
    sucursalNombre: string;
    cajeroNombre: string;
    clienteNombre: string;
    clienteRif: string;
    items: { producto: Producto; cantidad: number }[];
    subtotalNeto: number;
    baseImponible: number;
    montoExento: number;
    montoIva: number;
    totalUsd: number;
    tasa: number;
    fecha: string;
    pagoDetalle: DetallePagoVenta;
  } | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showFiscalModal, setShowFiscalModal] = useState(false);
  const [fiscalModalTipo, setFiscalModalTipo] = useState<'X' | 'Z'>('X');
  
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Auto-switch branch when user changes
  useEffect(() => {
    if (currentUser?.sucursal_id && currentUser.sucursal_id <= 2) {
      setSelectedSucursalId(currentUser.sucursal_id);
    }
  }, [currentUser]);

  // Auto-focus barcode input for instant keyboard/scanner typing
  useEffect(() => {
    if (!showCheckoutModal && !showClientModal && !showReceiptModal && !showFiscalModal) {
      barcodeInputRef.current?.focus();
    }
  }, [selectedSucursalId, cart, showCheckoutModal, showClientModal, showReceiptModal, showFiscalModal]);

  const tiendaActual = sucursales.find((s) => s.id === selectedSucursalId) || sucursales[0];

  // Authorization check
  const isBranchAuthorized = () => {
    if (!currentUser) return false;
    if (currentUser.rol === 'admin') return true;
    if (currentUser.sucursal_id === selectedSucursalId) return true;
    return false;
  };

  const handleScanBarcode = (codeToScan?: string) => {
    const code = (codeToScan || barcodeInput).trim();
    if (!code) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    if (!isBranchAuthorized()) {
      setErrorMsg(`Acceso denegado: ${currentUser?.nombre_completo || 'Usuario'} no está asignado a ${tiendaActual.nombre}.`);
      setBarcodeInput('');
      return;
    }

    // Find product by barcode
    const prod = productos.find((p) => p.codigo_barras === code);
    if (!prod) {
      setErrorMsg(`Código '${code}' no encontrado en el catálogo.`);
      setBarcodeInput('');
      return;
    }

    // Check stock for this branch
    const inv = inventario.find((i) => i.sucursal_id === selectedSucursalId && i.producto_id === prod.id);
    const currentStock = inv ? inv.stock : 0;

    // Check existing quantity in cart
    const existingInCart = cart.find((item) => item.producto.id === prod.id);
    const existingQty = existingInCart ? existingInCart.cantidad : 0;

    if (existingQty + 1 > currentStock) {
      setErrorMsg(`Stock insuficiente de '${prod.nombre}' en ${tiendaActual.nombre}. Disponible: ${currentStock}`);
      setBarcodeInput('');
      return;
    }

    if (existingInCart) {
      setCart(cart.map((item) =>
        item.producto.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
      ));
    } else {
      setCart([...cart, { producto: prod, cantidad: 1, stockDisponible: currentStock }]);
    }

    setLastScanned(`${prod.nombre} (${formatDual(prod.precio, empresaConfig.tasaCambio)})`);
    setBarcodeInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScanBarcode();
    }
  };

  const updateQuantity = (productoId: number, delta: number) => {
    setCart(
      cart.map((item) => {
        if (item.producto.id === productoId) {
          const step = (item.producto.unidad_medida === 'KG' || item.producto.unidad_medida === 'L') ? (delta > 0 ? 0.25 : -0.25) : delta;
          const newQty = +(item.cantidad + step).toFixed(3);
          if (newQty > item.stockDisponible) {
            setErrorMsg(`No puedes agregar más del stock disponible (${item.stockDisponible})`);
            return item;
          }
          return newQty > 0 ? { ...item, cantidad: newQty } : null;
        }
        return item;
      }).filter(Boolean) as { producto: Producto; cantidad: number; stockDisponible: number }[]
    );
  };

  const setDirectQuantity = (productoId: number, valStr: string) => {
    const parsed = parseFloat(valStr);
    if (isNaN(parsed) || parsed <= 0) return;

    setCart(
      cart.map((item) => {
        if (item.producto.id === productoId) {
          if (parsed > item.stockDisponible) {
            setErrorMsg(`Stock máximo disponible para '${item.producto.nombre}' es ${item.stockDisponible}`);
            return { ...item, cantidad: item.stockDisponible };
          }
          return { ...item, cantidad: +parsed.toFixed(3) };
        }
        return item;
      })
    );
  };

  const removeItem = (productoId: number) => {
    setCart(cart.filter((item) => item.producto.id !== productoId));
  };

  const subtotalNetoCart = cart.reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const baseImponibleCart = cart
    .filter((i) => !i.producto.exento_iva)
    .reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const montoExentoCart = cart
    .filter((i) => !!i.producto.exento_iva)
    .reduce((acc, item) => acc + item.producto.precio * item.cantidad, 0);
  const montoIvaCart = +(baseImponibleCart * 0.16).toFixed(2);
  const totalCartUsd = +(baseImponibleCart + montoIvaCart + montoExentoCart).toFixed(2);
  const totalCartBs = +(totalCartUsd * empresaConfig.tasaCambio).toFixed(2);

  // Open Checkout Modal and initialize fields
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    if (!isBranchAuthorized()) {
      setErrorMsg('No tienes autorización para cobrar en esta sucursal.');
      return;
    }
    setErrorMsg(null);
    setPagoMovilRef('');
    setEfectivoUsdRecibido(totalCartUsd.toFixed(2));
    setEfectivoBsRecibido(totalCartBs.toFixed(2));
    setMixtoUsd('');
    setMixtoBsEfectivo('');
    setMixtoPagoMovilBs('');
    setMixtoPagoMovilRef('');
    setShowCheckoutModal(true);
  };

  // Calculations for Checkout
  const valUsdRecibido = parseFloat(efectivoUsdRecibido) || 0;
  const vueltoUsd = Math.max(0, valUsdRecibido - totalCartUsd);
  const vueltoUsdEnBs = vueltoUsd * empresaConfig.tasaCambio;
  const faltanteUsd = Math.max(0, totalCartUsd - valUsdRecibido);
  const faltanteUsdEnBs = faltanteUsd * empresaConfig.tasaCambio;

  const valBsRecibido = parseFloat(efectivoBsRecibido) || 0;
  const vueltoBs = Math.max(0, valBsRecibido - totalCartBs);
  const vueltoBsEnUsd = vueltoBs / (empresaConfig.tasaCambio || 1);
  const faltanteBs = Math.max(0, totalCartBs - valBsRecibido);
  const faltanteBsEnUsd = faltanteBs / (empresaConfig.tasaCambio || 1);

  // Mixed calculation
  const mixtoUsdVal = parseFloat(mixtoUsd) || 0;
  const mixtoBsVal = parseFloat(mixtoBsEfectivo) || 0;
  const mixtoPmVal = parseFloat(mixtoPagoMovilBs) || 0;
  const mixtoTarjetaBsVal = parseFloat(mixtoTarjetaBs) || 0;
  const mixtoTotalCubiertoUsd = mixtoUsdVal + (mixtoBsVal / (empresaConfig.tasaCambio || 1)) + (mixtoPmVal / (empresaConfig.tasaCambio || 1)) + (mixtoTarjetaBsVal / (empresaConfig.tasaCambio || 1));
  const mixtoRestanteUsd = Math.max(0, totalCartUsd - mixtoTotalCubiertoUsd);
  const mixtoRestanteBs = mixtoRestanteUsd * empresaConfig.tasaCambio;

  // Direct Ticket Printer (Prevents Blank Page on all browsers)
  const handlePrintTicket = () => {
    if (!lastCompletedTicket) {
      window.print();
      return;
    }

    const ticket = lastCompletedTicket;
    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Factura / Ticket Fiscal - ${empresaConfig.nombreEmpresa}</title>
        <style>
          @page { size: auto; margin: 4mm; }
          * { box-sizing: border-box; }
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
          .divider { border-top: 1px dashed #333333; margin: 5px 0; }
          .flex { display: flex; justify-content: space-between; align-items: flex-start; }
          .items-table { width: 100%; margin: 4px 0; }
          .item-row { margin-bottom: 4px; }
          .desc { font-weight: bold; }
          .sub-info { font-size: 10px; color: #444444; }
          .badge-iva { font-size: 9px; font-weight: bold; padding: 0 2px; border: 1px solid #333; border-radius: 2px; margin-left: 3px; }
          .payment-box { background: #f4f4f4; padding: 4px 6px; border-radius: 4px; margin: 4px 0; font-size: 10.5px; }
          .tax-box { background: #fbfbfb; border: 1px solid #e0e0e0; padding: 4px 6px; border-radius: 4px; margin: 4px 0; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="text-center">
          <div class="font-bold" style="font-size: 13px; text-transform: uppercase;">${empresaConfig.nombreEmpresa}</div>
          <div class="font-bold">RIF: ${empresaConfig.rif}</div>
          <div style="font-size: 9.5px;">${empresaConfig.direccionFiscal}</div>
          <div style="font-size: 9.5px;">TELF: ${empresaConfig.telefono}</div>
          <div class="divider"></div>
          <div style="font-size: 10px;"><b>${ticket.sucursalNombre}</b></div>
          <div style="font-size: 9.5px;">Cajero: ${ticket.cajeroNombre}</div>
          <div style="font-size: 9.5px;">${ticket.fecha}</div>
        </div>

        <div class="divider"></div>
        <div>
          <div class="flex"><span class="font-bold">CLIENTE:</span> <span>${ticket.clienteNombre}</span></div>
          <div class="flex"><span>CÉDULA / RIF:</span> <span>${ticket.clienteRif}</span></div>
        </div>

        <div class="divider"></div>
        <div>
          <div class="flex font-bold" style="font-size: 9.5px; border-bottom: 1px solid #ccc; padding-bottom: 2px;">
            <span>DESCRIPCIÓN DEL PRODUCTO</span>
            <span>TOTAL</span>
          </div>
          ${ticket.items.map(it => {
            const isExento = !!it.producto.exento_iva;
            const cantFmt = it.cantidad % 1 === 0 ? it.cantidad : it.cantidad.toFixed(it.cantidad % 1 === 0 ? 0 : 2);
            return `
            <div class="item-row" style="margin-top: 3px;">
              <div class="flex" style="align-items: baseline;">
                <span class="desc" style="font-size: 10px;">
                  ${it.producto.nombre}
                  ${isExento ? '<span style="font-weight: bold; color: #b45309; font-size: 9px; margin-left: 2px;">(E)</span>' : ''}
                  <span style="font-size: 9px; font-weight: normal; color: #555; margin-left: 4px; font-family: monospace;">${cantFmt} x ${formatUSD(it.producto.precio)}</span>
                </span>
                <span class="font-bold" style="font-size: 10px; font-family: monospace;">${formatUSD(it.producto.precio * it.cantidad)}</span>
              </div>
            </div>
            `;
          }).join('')}
        </div>

        <div class="divider"></div>
        <!-- DISCRIMINACIÓN DE IMPUESTOS Y SUBTOTALES -->
        <div class="tax-box">
          <div class="font-bold" style="text-transform: uppercase; font-size: 9px; margin-bottom: 2px; color: #444;">DISCRIMINACIÓN FISCAL / IVA:</div>
          <div class="flex">
            <span>Subtotal Neto:</span>
            <span>${formatUSD(ticket.subtotalNeto)} (${formatBs(ticket.subtotalNeto, ticket.tasa)})</span>
          </div>
          <div class="flex">
            <span>Base Imponible (16%):</span>
            <span>${formatUSD(ticket.baseImponible)} (${formatBs(ticket.baseImponible, ticket.tasa)})</span>
          </div>
          <div class="flex">
            <span>Monto Exento (0%):</span>
            <span>${formatUSD(ticket.montoExento)} (${formatBs(ticket.montoExento, ticket.tasa)})</span>
          </div>
          <div class="flex font-bold" style="border-top: 1px dashed #ddd; margin-top: 2px; padding-top: 2px;">
            <span>IVA Liquidado (16%):</span>
            <span>+${formatUSD(ticket.montoIva)} (+${formatBs(ticket.montoIva, ticket.tasa)})</span>
          </div>
        </div>

        <div>
          <div class="flex" style="font-size: 9.5px; color: #555;">
            <span>Tasa Oficial Aplicada:</span>
            <span class="font-bold">1$ = ${formatBs(1, ticket.tasa)}</span>
          </div>
          <div class="flex font-bold" style="font-size: 13px; margin-top: 3px;">
            <span>TOTAL FACTURA USD:</span>
            <span>${formatUSD(ticket.totalUsd)}</span>
          </div>
          <div class="flex font-bold" style="font-size: 12px; color: #000;">
            <span>TOTAL FACTURA BS:</span>
            <span>${formatBs(ticket.totalUsd, ticket.tasa)}</span>
          </div>
        </div>

        <div class="divider"></div>
        <div class="payment-box">
          <div class="font-bold" style="text-transform: uppercase; font-size: 9.5px; margin-bottom: 2px;">INFORMACIÓN DE PAGO:</div>
          <div>Método: <b>${ticket.pagoDetalle.metodo === 'tarjeta' ? 'TARJETA / PUNTO DE VENTA' : ticket.pagoDetalle.metodo.toUpperCase().replace('_', ' ')}</b></div>
          ${ticket.pagoDetalle.referencia_pago_movil ? `<div>Ref Pago Móvil: <b>${ticket.pagoDetalle.referencia_pago_movil}</b></div>` : ''}
          ${ticket.pagoDetalle.pago_movil_monto_bs ? `<div>Pago Móvil Bs: <b>Bs. ${ticket.pagoDetalle.pago_movil_monto_bs.toFixed(2)}</b></div>` : ''}
          ${ticket.pagoDetalle.metodo === 'tarjeta' ? `
            <div>Tipo Tarjeta: <b>${ticket.pagoDetalle.tarjeta_tipo === 'debito' ? 'Débito' : ticket.pagoDetalle.tarjeta_tipo === 'credito' ? 'Crédito' : 'Internacional'}</b></div>
            ${ticket.pagoDetalle.tarjeta_banco ? `<div>Punto POS / Banco: <b>${ticket.pagoDetalle.tarjeta_banco}</b></div>` : ''}
            ${ticket.pagoDetalle.tarjeta_referencia ? `<div>Ref / Aprobación: <b>${ticket.pagoDetalle.tarjeta_referencia}</b></div>` : ''}
            ${ticket.pagoDetalle.tarjeta_lote ? `<div>Lote: <b>${ticket.pagoDetalle.tarjeta_lote}</b></div>` : ''}
            <div>Monto Tarjeta: <b>Bs. ${(ticket.pagoDetalle.tarjeta_monto_bs || (ticket.totalUsd * ticket.tasa)).toFixed(2)}</b> (${formatUSD(ticket.totalUsd)})</div>
          ` : ''}
          ${ticket.pagoDetalle.efectivo_usd_recibido ? `<div>Efectivo USD: <b>${formatUSD(ticket.pagoDetalle.efectivo_usd_recibido)}</b></div>` : ''}
          ${ticket.pagoDetalle.vuelto_usd ? `<div>Vuelto USD: <b>${formatUSD(ticket.pagoDetalle.vuelto_usd)}</b> (${formatBs(ticket.pagoDetalle.vuelto_usd, ticket.tasa)})</div>` : ''}
          ${ticket.pagoDetalle.efectivo_bs_recibido ? `<div>Efectivo Bs: <b>Bs. ${ticket.pagoDetalle.efectivo_bs_recibido.toFixed(2)}</b></div>` : ''}
          ${ticket.pagoDetalle.vuelto_bs ? `<div>Vuelto Bs: <b>Bs. ${ticket.pagoDetalle.vuelto_bs.toFixed(2)}</b></div>` : ''}
          ${ticket.pagoDetalle.metodo === 'mixto' && ticket.pagoDetalle.tarjeta_monto_bs ? `
            <div>• Tarjeta POS: <b>Bs. ${ticket.pagoDetalle.tarjeta_monto_bs.toFixed(2)}</b> (Ref: ${ticket.pagoDetalle.tarjeta_referencia || 'N/A'})</div>
          ` : ''}
        </div>

        <div class="text-center" style="font-size: 9.5px; margin-top: 6px;">
          (E) = Exento de IVA • (G) = Gravado 16%<br/>
          *** ¡GRACIAS POR SU COMPRA! ***
        </div>
      </body>
      </html>
    `;

    // Execute print using dedicated frame to avoid blank preview
    let printFrame = document.getElementById('ticket-print-iframe') as HTMLIFrameElement;
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

    const doc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (doc) {
      doc.open();
      doc.write(receiptHtml);
      doc.close();
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
      }, 300);
    } else {
      window.print();
    }
  };

  // Confirm Sale Execution
  const handleConfirmPayment = () => {
    if (cart.length === 0) return;

    let detallePago: DetallePagoVenta;

    if (paymentMethod === 'pago_movil') {
      if (!pagoMovilRef.trim()) {
        alert('Por favor ingresa el número de referencia del Pago Móvil.');
        return;
      }
      detallePago = {
        metodo: 'pago_movil',
        referencia_pago_movil: pagoMovilRef.trim(),
        monto_usd: totalCartUsd,
        monto_bs: totalCartBs,
        pago_movil_monto_bs: totalCartBs,
      };
    } else if (paymentMethod === 'efectivo_usd') {
      if (valUsdRecibido < totalCartUsd) {
        alert(`El monto entregado ($${valUsdRecibido.toFixed(2)}) es menor al total ($${totalCartUsd.toFixed(2)}).`);
        return;
      }
      detallePago = {
        metodo: 'efectivo_usd',
        monto_usd: totalCartUsd,
        monto_bs: totalCartBs,
        efectivo_usd_recibido: valUsdRecibido,
        vuelto_usd: vueltoUsd,
        vuelto_bs: vueltoUsdEnBs,
      };
    } else if (paymentMethod === 'efectivo_bs') {
      if (valBsRecibido < totalCartBs) {
        alert(`El monto entregado (Bs. ${valBsRecibido.toFixed(2)}) es menor al total (Bs. ${totalCartBs.toFixed(2)}).`);
        return;
      }
      detallePago = {
        metodo: 'efectivo_bs',
        monto_usd: totalCartUsd,
        monto_bs: totalCartBs,
        efectivo_bs_recibido: valBsRecibido,
        vuelto_bs: vueltoBs,
      };
    } else if (paymentMethod === 'tarjeta') {
      if (!tarjetaReferencia.trim()) {
        alert('Por favor ingresa el número de Referencia o Aprobación del punto de venta (voucher).');
        return;
      }
      detallePago = {
        metodo: 'tarjeta',
        tarjeta_tipo: tarjetaTipo,
        tarjeta_banco: tarjetaBanco,
        tarjeta_referencia: tarjetaReferencia.trim(),
        tarjeta_lote: tarjetaLote.trim() || undefined,
        tarjeta_monto_bs: totalCartBs,
        tarjeta_monto_usd: totalCartUsd,
        monto_usd: totalCartUsd,
        monto_bs: totalCartBs,
      };
    } else {
      // Mixto
      if (mixtoTotalCubiertoUsd < totalCartUsd - 0.01) {
        alert(`Faltan $${mixtoRestanteUsd.toFixed(2)} (Bs. ${mixtoRestanteBs.toFixed(2)}) para completar el pago.`);
        return;
      }
      if (mixtoPmVal > 0 && !mixtoPagoMovilRef.trim()) {
        alert('Ingresaste un monto de Pago Móvil en el cobro mixto; por favor indica la referencia.');
        return;
      }
      if (mixtoTarjetaBsVal > 0 && !mixtoTarjetaRef.trim()) {
        alert('Ingresaste un monto de Tarjeta / POS en el cobro mixto; por favor indica la referencia del voucher.');
        return;
      }
      detallePago = {
        metodo: 'mixto',
        monto_usd: totalCartUsd,
        monto_bs: totalCartBs,
        efectivo_usd_recibido: mixtoUsdVal,
        efectivo_bs_recibido: mixtoBsVal,
        pago_movil_monto_bs: mixtoPmVal,
        referencia_pago_movil: mixtoPagoMovilRef.trim() || undefined,
        tarjeta_monto_bs: mixtoTarjetaBsVal,
        tarjeta_referencia: mixtoTarjetaRef.trim() || undefined,
        tarjeta_tipo: mixtoTarjetaTipo,
        tarjeta_banco: mixtoTarjetaBanco,
        vuelto_usd: Math.max(0, mixtoTotalCubiertoUsd - totalCartUsd),
        vuelto_bs: Math.max(0, (mixtoTotalCubiertoUsd - totalCartUsd) * empresaConfig.tasaCambio),
      };
    }

    const saleItems = cart.map((c) => ({ producto: c.producto, cantidad: c.cantidad }));

    // Execute callback
    onRegistrarVenta(
      selectedSucursalId,
      saleItems,
      {
        id: selectedCliente.id,
        nombre: selectedCliente.nombre,
        rif: selectedCliente.rif,
      },
      detallePago
    );

    // Store completed ticket
    setLastCompletedTicket({
      sucursalNombre: tiendaActual.nombre,
      cajeroNombre: currentUser?.nombre_completo || 'Cajero de Turno',
      clienteNombre: selectedCliente.nombre,
      clienteRif: selectedCliente.rif,
      items: saleItems,
      subtotalNeto: subtotalNetoCart,
      baseImponible: baseImponibleCart,
      montoExento: montoExentoCart,
      montoIva: montoIvaCart,
      totalUsd: totalCartUsd,
      tasa: empresaConfig.tasaCambio,
      fecha: new Date().toLocaleString('es-VE'),
      pagoDetalle: detallePago,
    });

    setSuccessMsg(`¡Venta procesada con éxito a ${selectedCliente.nombre} por ${formatDual(totalCartUsd, empresaConfig.tasaCambio)}!`);
    setCart([]);
    setShowCheckoutModal(false);
    setShowReceiptModal(true);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Helper to normalize RIF or Cédula (strips dashes, dots, spaces, uppercase)
  const normalizeId = (val: string) => {
    return val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  };

  // Instant Cédula / RIF lookup handler
  const handleFastCedulaChange = (rawVal: string) => {
    setCedulaFastInput(rawVal);
    const cleanVal = normalizeId(rawVal);

    if (!cleanVal) {
      setSelectedCliente(DEFAULT_CLIENTE);
      setFastLookupStatus({ status: 'idle' });
      return;
    }

    // Search for match in client database
    const match = clientes.find((c) => {
      const cleanRif = normalizeId(c.rif_cedula);
      return cleanRif === cleanVal || cleanRif.endsWith(cleanVal) || (cleanVal.length >= 6 && cleanVal.endsWith(cleanRif));
    });

    if (match) {
      setSelectedCliente({
        id: match.id,
        nombre: match.nombre,
        rif: match.rif_cedula,
        telefono: match.telefono,
      });
      setFastLookupStatus({
        status: 'found',
        message: `Cliente Encontrado: ${match.nombre}`
      });
    } else {
      if (cleanVal.length >= 4) {
        setFastLookupStatus({
          status: 'not_found',
          message: `No registrado`
        });
      } else {
        setFastLookupStatus({ status: 'idle' });
      }
    }
  };

  const handleResetToContado = () => {
    setCedulaFastInput('');
    setSelectedCliente(DEFAULT_CLIENTE);
    setFastLookupStatus({ status: 'idle' });
  };

  const handleOpenCreateWithCedula = () => {
    setNewClientData((prev) => ({
      ...prev,
      rif_cedula: cedulaFastInput.trim(),
    }));
    setShowQuickNewClient(true);
    setShowClientModal(true);
  };

  // Quick Client registration
  const handleQuickAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientData.nombre.trim() || !newClientData.rif_cedula.trim()) {
      alert('Nombre y Cédula/RIF son obligatorios.');
      return;
    }
    if (onAddCliente) {
      onAddCliente({
        nombre: newClientData.nombre.trim(),
        rif_cedula: newClientData.rif_cedula.trim(),
        telefono: newClientData.telefono.trim() || '+58 000-0000000',
        email: newClientData.email.trim() || undefined,
        direccion: newClientData.direccion.trim() || undefined,
        limiteCredito: newClientData.limiteCredito || 0,
      });
    }
    // Select newly created client
    setSelectedCliente({
      id: null,
      nombre: newClientData.nombre.trim(),
      rif: newClientData.rif_cedula.trim(),
      telefono: newClientData.telefono.trim(),
    });
    setCedulaFastInput(newClientData.rif_cedula.trim());
    setFastLookupStatus({
      status: 'found',
      message: `Cliente Creado: ${newClientData.nombre.trim()}`
    });
    setShowQuickNewClient(false);
    setShowClientModal(false);
    setNewClientData({
      nombre: '',
      rif_cedula: '',
      telefono: '',
      email: '',
      direccion: '',
      limiteCredito: 0
    });
  };

  const filteredClientesList = clientes.filter(c => 
    c.nombre.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.rif_cedula.toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.telefono.includes(clientSearch)
  );

  return (
    <div className="space-y-6" id="pos-main-container">
      {/* Header Barcode USB Simulation Info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded-xl border border-emerald-500/30">
            <Barcode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                Punto de Venta Dual (USD / Bolívares)
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Tasa: 1$ = {formatBs(1, empresaConfig.tasaCambio)}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Empresa: <strong className="text-slate-200">{empresaConfig.nombreEmpresa}</strong> (RIF: {empresaConfig.rif}) • Cajero:{' '}
              <strong className="text-emerald-300">{currentUser?.nombre_completo || 'No autenticado'}</strong> ({currentUser?.cargo})
            </p>
          </div>
        </div>

        {/* Action Controls: Fiscal Reports & Branch Selector */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quick Corte X / Z Button */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setFiscalModalTipo('X');
                setShowFiscalModal(true);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-sky-400 hover:bg-sky-500/10 border border-transparent hover:border-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Emitir Corte X (Parcial de Turno / Arqueo)"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Corte X</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setFiscalModalTipo('Z');
                setShowFiscalModal(true);
              }}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Emitir Corte Z (Cierre Fiscal Diario)"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Corte Z</span>
            </button>
          </div>

          {/* Branch Selector */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <Store className="w-4 h-4 text-emerald-400 ml-2" />
            <select
              value={selectedSucursalId}
              onChange={(e) => {
                setSelectedSucursalId(Number(e.target.value));
                setCart([]);
              }}
              className="bg-transparent text-xs text-white font-semibold py-1.5 pr-8 focus:outline-none cursor-pointer"
            >
              {sucursales.filter(s => s.tipo === 'tienda').map((suc) => (
                <option key={suc.id} value={suc.id} className="bg-slate-900 text-white">
                  {suc.nombre} {currentUser?.sucursal_id === suc.id ? '★ (Tu Sucursal)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!isBranchAuthorized() && (
        <div className="bg-amber-950/60 border border-amber-500/40 p-4 rounded-xl text-amber-200 text-xs flex items-center gap-3">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong>Aviso de Seguridad de Sucursal:</strong> El usuario actual ({currentUser?.nombre_completo}) pertenece a la{' '}
            <strong>{currentUser?.sucursal_id ? sucursales.find(s => s.id === currentUser.sucursal_id)?.nombre : 'Oficina'}</strong>.
            Para vender en {tiendaActual.nombre}, inicia sesión con uno de los usuarios asignados a esta tienda o como Administrador General.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ========================================================================= */}
        {/* LEFT 2/3 COLUMN: PRODUCT CATALOG & SCANNER & 4-COLUMN CARDS SORTED BY SALES */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-4">
          
          {/* Top Barcode Scanner & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Barcode Scanner Input */}
              <div className="sm:col-span-7 space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Barcode className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Lector USB / Código de Barras:</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Escanear código + [Enter]..."
                      className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs px-3 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleScanBarcode()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" /> Agregar
                  </button>
                </div>
              </div>

              {/* Live Search Input */}
              <div className="sm:col-span-5 space-y-1">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Filtrar Productos:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Nombre, código..."
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs pl-8 pr-7 py-2.5 rounded-xl focus:border-indigo-500 focus:outline-none placeholder:text-slate-600"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-3" />
                  {productSearch && (
                    <button
                      type="button"
                      onClick={() => setProductSearch('')}
                      className="absolute right-2 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Category Filter Pills & Sort Badge */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-1 shrink-0">Categoría:</span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                      selectedCategory === cat
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'Todos' : cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-[11px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-amber-300 font-medium shrink-0">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Orden: <strong>Mayor a Menor Venta</strong></span>
              </div>
            </div>

            {lastScanned && (
              <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono pt-1">
                <Zap className="w-3.5 h-3.5" /> Último leído: {lastScanned}
              </p>
            )}

            {errorMsg && (
              <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs p-2.5 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs p-2.5 rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* Product Cards Grid: Filas de 4 en 4 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1 text-xs">
              <span className="text-slate-400 font-semibold">
                Catálogo ({sortedAndFilteredProductos.length} productos en stock en {tiendaActual.nombre})
              </span>
              <span className="text-slate-500 text-[11px]">
                Haz clic en cualquier tarjeta para agregar a la venta
              </span>
            </div>

            {sortedAndFilteredProductos.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center text-slate-500 space-y-2">
                <Package className="w-10 h-10 mx-auto text-slate-700" />
                <p className="text-xs">No se encontraron productos con los filtros seleccionados.</p>
                <button
                  type="button"
                  onClick={() => { setProductSearch(''); setSelectedCategory('all'); }}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {sortedAndFilteredProductos.map((p, idx) => {
                  const inv = inventario.find((i) => i.sucursal_id === selectedSucursalId && i.producto_id === p.id);
                  const stock = inv ? inv.stock : 0;
                  const salesStats = productSalesMap[p.id] || { unitsSold: 0, totalAmountSold: 0 };
                  const isTopSeller = idx < 3 && salesStats.unitsSold > 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleScanBarcode(p.codigo_barras)}
                      className={`bg-slate-900 border rounded-2xl p-3.5 flex flex-col justify-between transition-all group cursor-pointer text-left relative hover:-translate-y-0.5 hover:shadow-lg ${
                        stock <= 0
                          ? 'border-slate-800/80 opacity-60 hover:border-slate-700'
                          : isTopSeller
                          ? 'border-amber-500/30 hover:border-amber-500/70 hover:bg-slate-850 shadow-sm shadow-amber-950/20'
                          : 'border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850'
                      }`}
                    >
                      {/* Top Row: Category & Sales Count Tag */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded-md font-medium text-slate-400 border border-slate-800 truncate max-w-[80px]">
                            {p.categoria || 'General'}
                          </span>
                          {p.exento_iva ? (
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30 shrink-0" title="Producto Exento de IVA">
                              EXENTO
                            </span>
                          ) : (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30 shrink-0" title="Producto Gravado con 16% IVA">
                              IVA 16%
                            </span>
                          )}
                        </div>

                        {salesStats.unitsSold > 0 ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 shrink-0 ${
                            isTopSeller 
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                              : 'bg-slate-950 text-slate-300 border border-slate-800'
                          }`}>
                            <Flame className={`w-3 h-3 ${isTopSeller ? 'text-amber-400' : 'text-slate-400'}`} />
                            <span>{salesStats.unitsSold} vtas</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-mono">0 vtas</span>
                        )}
                      </div>

                      {/* Middle: Product Name & Code */}
                      <div className="space-y-1 mb-3">
                        <h4 className="font-bold text-white text-xs line-clamp-2 min-h-[32px] group-hover:text-emerald-400 transition-colors leading-tight">
                          {p.nombre}
                        </h4>
                        <p className="font-mono text-[10px] text-slate-500 truncate">
                          COD: {p.codigo_barras}
                        </p>
                      </div>

                      {/* Bottom: Stock, Dual Price & Add Button */}
                      <div className="pt-2 border-t border-slate-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            stock <= 0 
                              ? 'bg-rose-950/60 text-rose-400 border border-rose-500/30' 
                              : stock < 10 
                              ? 'bg-amber-950/60 text-amber-400 border border-amber-500/30' 
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {stock <= 0 ? 'Sin stock' : `Stock: ${stock}`}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleScanBarcode(p.codigo_barras);
                            }}
                            className="p-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 transition-colors cursor-pointer border border-emerald-500/30"
                            title="Agregar 1 unidad al ticket"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          </button>
                        </div>

                        <div>
                          <div className="font-extrabold text-white text-sm font-mono leading-none">
                            {formatUSD(p.precio)}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-mono font-medium mt-0.5">
                            {formatBs(p.precio, empresaConfig.tasaCambio)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT 1/3 COLUMN: BILLING AREA (FACTURACIÓN, CLIENTE, TICKET & COBRO)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-md sticky top-4">
          <div className="space-y-3">
            
            {/* Top Bar: Title & Cashier */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Facturación / Ticket</h3>
                  <span className="text-[10px] text-slate-400 font-mono block">
                    Caja: {currentUser?.nombre_completo || 'Sin cajero'}
                  </span>
                </div>
              </div>
              <span className="text-xs bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-emerald-400 font-mono font-bold">
                {cart.reduce((sum, item) => sum + item.cantidad, 0)} ítems
              </span>
            </div>

            {/* CUSTOMER SELECTION BAR WITH FAST CÉDULA / RIF AUTO-LOOKUP */}
            <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>Cliente:</span>
                </label>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={handleResetToContado}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer transition-all ${
                      !selectedCliente.id 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                    }`}
                  >
                    Contado
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClientModal(true)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Search className="w-2.5 h-2.5 text-indigo-400" />
                    <span>Lista</span>
                  </button>
                </div>
              </div>

              {/* Fast Cédula/RIF Input Field with Instant Auto-Lookup */}
              <div className="space-y-1.5">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    id="pos-fast-cedula-input"
                    value={cedulaFastInput}
                    onChange={(e) => handleFastCedulaChange(e.target.value)}
                    placeholder="Cédula o RIF (Ej: V-12345678) → Auto"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 text-xs text-white pl-8 pr-7 py-1.5 rounded-lg focus:outline-none placeholder:text-slate-500 font-mono"
                  />
                  {cedulaFastInput && (
                    <button
                      type="button"
                      onClick={handleResetToContado}
                      className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                      title="Borrar y volver a Cliente de Contado"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {fastLookupStatus.status === 'not_found' && (
                  <button
                    type="button"
                    onClick={handleOpenCreateWithCedula}
                    className="w-full py-1.5 px-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>+ Registrar "{cedulaFastInput}"</span>
                  </button>
                )}
              </div>

              {/* Customer Selected Card & Status Badge */}
              <div className={`p-2 rounded-lg border text-xs transition-all ${
                selectedCliente.id 
                  ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200' 
                  : fastLookupStatus.status === 'not_found'
                  ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300'
              }`}>
                <div className="flex items-center justify-between gap-1">
                  <div className="overflow-hidden">
                    <p className="font-bold text-white text-xs truncate">
                      {selectedCliente.nombre}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">
                      {selectedCliente.rif} {selectedCliente.telefono && `• ${selectedCliente.telefono}`}
                    </p>
                  </div>
                  {selectedCliente.id ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30 shrink-0">
                      ✓ Autoseleccionado
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium shrink-0">
                      Contado
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>Detalle de Artículos:</span>
                {cart.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCart([])}
                    className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Vaciar
                  </button>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs space-y-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                  <ShoppingCart className="w-7 h-7 mx-auto text-slate-700" />
                  <p className="text-[11px]">Ticket vacío.</p>
                  <p className="text-[10px] text-slate-600">Toca productos o escanea código.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60 max-h-[220px] overflow-y-auto pr-1 bg-slate-950/50 rounded-xl border border-slate-800/80 p-1.5 custom-scrollbar">
                  {cart.map((item) => {
                    const unit = item.producto.unidad_medida || 'UND';
                    const isWeighed = unit === 'KG' || unit === 'L';
                    const formattedQty = item.cantidad.toFixed(item.cantidad % 1 === 0 ? 0 : 3);

                    return (
                      <div key={item.producto.id} className="py-2 px-1 flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <h4 className="font-semibold text-slate-200 text-xs truncate">
                              {item.producto.nombre}
                            </h4>
                            <span className="text-[8px] bg-slate-800 text-amber-300 font-bold px-1 rounded border border-slate-700 shrink-0">
                              {unit}
                            </span>
                            {item.producto.exento_iva ? (
                              <span className="text-[8px] bg-amber-500/20 text-amber-300 font-bold px-1 rounded border border-amber-500/30 shrink-0">
                                (E)
                              </span>
                            ) : (
                              <span className="text-[8px] bg-emerald-500/20 text-emerald-300 font-bold px-1 rounded border border-emerald-500/30 shrink-0">
                                (16%)
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-400">
                            {formattedQty} {unit} × {formatUSD(item.producto.precio)} ={' '}
                            <strong className="text-white">{formatUSD(item.producto.precio * item.cantidad)}</strong>
                          </p>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.producto.id, -1)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded-md text-xs cursor-pointer"
                            title={isWeighed ? 'Disminuir 0.25' : 'Disminuir 1'}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          
                          {/* Direct Decimal Quantity Input */}
                          <input
                            type="number"
                            step="0.001"
                            min="0.001"
                            max={item.stockDisponible}
                            value={item.cantidad}
                            onChange={(e) => setDirectQuantity(item.producto.id, e.target.value)}
                            className="w-14 bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold text-xs text-center py-0.5 rounded focus:border-emerald-500 focus:outline-none"
                            title={`Ingresa la cantidad o fracción en ${unit} (Disponible: ${item.stockDisponible})`}
                          />

                          <button
                            type="button"
                            onClick={() => updateQuantity(item.producto.id, 1)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1 rounded-md text-xs cursor-pointer"
                            title={isWeighed ? 'Aumentar 0.25' : 'Aumentar 1'}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => removeItem(item.producto.id)}
                            className="bg-rose-950/40 hover:bg-rose-900 text-rose-400 p-1 rounded-md text-xs cursor-pointer ml-1"
                            title="Eliminar artículo del ticket"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Footer with Dual Total and Payment Trigger */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            {/* Tax & Subtotal Discrimination */}
            <div className="space-y-1 text-[11px] bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Neto:</span>
                <span>{formatUSD(subtotalNetoCart)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Base Imponible (16%):</span>
                <span>{formatUSD(baseImponibleCart)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Exento (0%):</span>
                <span>{formatUSD(montoExentoCart)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold border-t border-slate-800 pt-1">
                <span>IVA (16%):</span>
                <span>+{formatUSD(montoIvaCart)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <span className="text-slate-300 text-xs block font-bold">Total a Cobrar:</span>
                <span className="text-[10px] text-slate-500 font-mono">1$ = {formatBs(1, empresaConfig.tasaCambio)}</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-extrabold text-white font-mono leading-none">
                  {formatUSD(totalCartUsd)}
                </div>
                <div className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                  {formatBs(totalCartUsd, empresaConfig.tasaCambio)}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <button
                type="button"
                id="btn-cobrar-venta"
                onClick={handleOpenCheckout}
                disabled={cart.length === 0 || !isBranchAuthorized()}
                className={`w-full py-3 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  cart.length > 0 && isBranchAuthorized()
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-950/50'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <DollarSign className="w-4 h-4 stroke-[2.5]" />
                <span>Cobrar Venta ($ / Bs. / Pago Móvil)</span>
              </button>

              {lastCompletedTicket && (
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="w-full bg-slate-800/90 hover:bg-slate-800 text-slate-300 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-700/80"
                  title="Ver último ticket fiscal emitido"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ver Último Ticket Emitido</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MODAL SELECCIONAR CLIENTE O CREAR CLIENTE RÁPIDO */}
      {/* ========================================================================= */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              type="button"
              onClick={() => {
                setShowClientModal(false);
                setShowQuickNewClient(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Seleccionar Cliente para la Venta</h3>
                <p className="text-xs text-slate-400">Si no seleccionas un cliente específico, quedará como "Cliente de Contado"</p>
              </div>
            </div>

            {!showQuickNewClient ? (
              <div className="space-y-4">
                {/* Search and Option for Default Contado */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    placeholder="Buscar por Nombre, Cédula/RIF o Teléfono..."
                    className="w-full bg-slate-950 border border-slate-700 pl-9 pr-4 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                    autoFocus
                  />
                </div>

                {/* Default "Cliente de Contado" Quick Selection Card */}
                <div 
                  onClick={() => {
                    handleResetToContado();
                    setShowClientModal(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    !selectedCliente.id 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      CC
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">Cliente de Contado (Predeterminado)</h4>
                      <p className="text-[11px] text-slate-400">Ventas sin identificación fiscal / Consumidor Final</p>
                    </div>
                  </div>
                  {!selectedCliente.id && <Check className="w-4 h-4 text-emerald-400" />}
                </div>

                {/* Clients List */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Clientes Registrados ({filteredClientesList.length}):
                  </span>
                  {filteredClientesList.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No se encontraron clientes con esa búsqueda.</p>
                  ) : (
                    filteredClientesList.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedCliente({
                            id: c.id,
                            nombre: c.nombre,
                            rif: c.rif_cedula,
                            telefono: c.telefono,
                          });
                          setCedulaFastInput(c.rif_cedula);
                          setFastLookupStatus({
                            status: 'found',
                            message: `Cliente seleccionado: ${c.nombre}`
                          });
                          setShowClientModal(false);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          selectedCliente.id === c.id 
                            ? 'bg-indigo-500/15 border-indigo-500/50 text-indigo-200' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{c.nombre}</span>
                            <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded font-mono text-slate-300">{c.rif_cedula}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Tlf: {c.telefono} • Límite Crédito: {formatUSD(c.limiteCredito)} • Saldo: {formatUSD(c.saldoPendiente)}
                          </p>
                        </div>
                        {selectedCliente.id === c.id && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowQuickNewClient(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>+ Registrar Nuevo Cliente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              /* QUICK NEW CLIENT FORM */
              <form onSubmit={handleQuickAddClient} className="space-y-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    Datos Rápidos del Cliente
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nombre Completo / Razón Social *</label>
                      <input
                        type="text"
                        required
                        value={newClientData.nombre}
                        onChange={(e) => setNewClientData({ ...newClientData, nombre: e.target.value })}
                        placeholder="Ej: Inversiones Caracas C.A."
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Cédula o RIF *</label>
                      <input
                        type="text"
                        required
                        value={newClientData.rif_cedula}
                        onChange={(e) => setNewClientData({ ...newClientData, rif_cedula: e.target.value })}
                        placeholder="Ej: J-12345678-9 o V-12345678"
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={newClientData.telefono}
                        onChange={(e) => setNewClientData({ ...newClientData, telefono: e.target.value })}
                        placeholder="+58 414-1234567"
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Correo Electrónico</label>
                      <input
                        type="email"
                        value={newClientData.email}
                        onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                        placeholder="cliente@correo.com"
                        className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Guardar y Asignar a la Venta
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowQuickNewClient(false)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                  >
                    Volver
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL DE COBRO MULTI-MÉTODO (PAGO MÓVIL, EFECTIVO USD, EFECTIVO BS, MIXTO) */}
      {/* ========================================================================= */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Cobro de Venta</h3>
                  <p className="text-xs text-slate-400">
                    Cliente: <strong className="text-white">{selectedCliente.nombre}</strong> ({selectedCliente.rif})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                  {formatUSD(totalCartUsd)}
                </div>
                <div className="text-xs font-mono text-slate-300 font-semibold">
                  {formatBs(totalCartUsd, empresaConfig.tasaCambio)}
                </div>
              </div>
            </div>

            {/* Fiscal Breakdown Strip in Checkout */}
            <div className="grid grid-cols-4 gap-2 bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block">Subtotal Neto</span>
                <span className="font-bold text-slate-300">{formatUSD(subtotalNetoCart)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Base Gravada (16%)</span>
                <span className="font-bold text-slate-300">{formatUSD(baseImponibleCart)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Exento (0%)</span>
                <span className="font-bold text-amber-300">{formatUSD(montoExentoCart)}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-400 block">IVA (16%)</span>
                <span className="font-bold text-emerald-400">+{formatUSD(montoIvaCart)}</span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pago_movil')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'pago_movil'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span className="text-xs">Pago Móvil</span>
                <span className="text-[9px] font-mono text-slate-500">Bolívares</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo_usd')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'efectivo_usd'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span className="text-xs">Efectivo ($)</span>
                <span className="text-[9px] font-mono text-slate-500">Dólares USD</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo_bs')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'efectivo_bs'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs">Efectivo (Bs)</span>
                <span className="text-[9px] font-mono text-slate-500">Bolívares</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('tarjeta')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'tarjeta'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-400" />
                <span className="text-xs">Tarjeta / POS</span>
                <span className="text-[9px] font-mono text-slate-500">Débito/Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('mixto')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  paymentMethod === 'mixto'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 text-purple-400" />
                <span className="text-xs">Pago Mixto</span>
                <span className="text-[9px] font-mono text-slate-500">Combinado</span>
              </button>
            </div>

            {/* TAB CONTENT: 1. PAGO MÓVIL */}
            {paymentMethod === 'pago_movil' && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Monto exacto a transferir:</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {formatBs(totalCartUsd, empresaConfig.tasaCambio)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-mono">Equivalente USD:</span>
                    <span className="text-xs font-mono font-bold text-white block">{formatUSD(totalCartUsd)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-white block mb-1.5">
                      Número de Referencia del Pago Móvil *
                    </label>
                    <input
                      type="text"
                      required
                      value={pagoMovilRef}
                      onChange={(e) => setPagoMovilRef(e.target.value)}
                      placeholder="Ej: 489201 o últimos 6/8 dígitos"
                      className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm px-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Banco Receptor de la Empresa</label>
                    <select
                      value={pagoMovilBanco}
                      onChange={(e) => setPagoMovilBanco(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                    >
                      <option value="0102 - Banco de Venezuela">0102 - Banco de Venezuela</option>
                      <option value="0134 - Banesco">0134 - Banesco</option>
                      <option value="0105 - Banco Mercantil">0105 - Banco Mercantil</option>
                      <option value="0108 - Banco Provincial">0108 - Banco Provincial</option>
                      <option value="0172 - Bancamiga">0172 - Bancamiga</option>
                      <option value="0114 - Bancaribe">0114 - Bancaribe</option>
                    </select>
                  </div>

                  {/* Datos de recepción informativos */}
                  <div className="bg-slate-900/60 p-3 rounded-xl text-[11px] text-slate-400 space-y-0.5 border border-slate-800/70">
                    <p className="font-semibold text-slate-300">Datos para Pago Móvil de la Empresa:</p>
                    <p>RIF: <strong className="text-white">{empresaConfig.rif}</strong> • Tlf: <strong className="text-white">{empresaConfig.telefono}</strong></p>
                    <p className="text-[10px] text-slate-500">Verifica que los fondos hayan ingresado en la cuenta receptora antes de emitir el ticket.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 2. EFECTIVO USD */}
            {paymentMethod === 'efectivo_usd' && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Total a Pagar en Dólares:</span>
                    <span className="text-xl font-mono font-bold text-white">
                      {formatUSD(totalCartUsd)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-mono">Tasa aplicada:</span>
                    <span className="text-xs font-mono text-emerald-400 block">1$ = {formatBs(1, empresaConfig.tasaCambio)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Monto Entregado por el Cliente ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={efectivoUsdRecibido}
                    onChange={(e) => setEfectivoUsdRecibido(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-lg px-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none"
                    autoFocus
                  />

                  {/* Quick Dollar Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setEfectivoUsdRecibido(totalCartUsd.toFixed(2))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                    >
                      Exacto (${totalCartUsd.toFixed(2)})
                    </button>
                    {[5, 10, 20, 50, 100].filter(b => b >= totalCartUsd || totalCartUsd > 100).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setEfectivoUsdRecibido(b.toString())}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono font-bold cursor-pointer"
                      >
                        ${b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status Card: Vuelto or Faltante USD */}
                {valUsdRecibido < totalCartUsd ? (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-300 font-semibold block flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        Faltante para Completar:
                      </span>
                      <span className="text-lg font-mono font-black text-amber-400">
                        {formatUSD(faltanteUsd)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-300/70 block">En Bolívares:</span>
                      <span className="text-xs font-mono font-bold text-amber-200">
                        {formatBs(faltanteUsd, empresaConfig.tasaCambio)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-300 font-semibold block">Cambio / Vuelto a Entregar:</span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        {formatUSD(vueltoUsd)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-300/70 block">Equivalente en Bolívares:</span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {formatBs(vueltoUsd, empresaConfig.tasaCambio)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 3. EFECTIVO BS */}
            {paymentMethod === 'efectivo_bs' && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Total a Pagar en Bolívares:</span>
                    <span className="text-xl font-mono font-bold text-emerald-400">
                      {formatBs(totalCartUsd, empresaConfig.tasaCambio)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-mono">Monto en USD:</span>
                    <span className="text-xs font-mono font-bold text-white block">{formatUSD(totalCartUsd)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white block">
                    Monto Entregado por el Cliente en Efectivo (Bs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={efectivoBsRecibido}
                    onChange={(e) => setEfectivoBsRecibido(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-lg px-4 py-3 rounded-xl focus:border-emerald-500 focus:outline-none"
                    autoFocus
                  />

                  {/* Quick Bs Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setEfectivoBsRecibido(totalCartBs.toFixed(2))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono cursor-pointer"
                    >
                      Exacto (Bs. {totalCartBs.toFixed(2)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setEfectivoBsRecibido(Math.ceil(totalCartBs).toFixed(2))}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono cursor-pointer"
                    >
                      Redondear (Bs. {Math.ceil(totalCartBs)})
                    </button>
                  </div>
                </div>

                {/* Status Card: Vuelto or Faltante Bs */}
                {valBsRecibido < totalCartBs ? (
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-300 font-semibold block flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        Faltante para Completar:
                      </span>
                      <span className="text-lg font-mono font-black text-amber-400">
                        Bs. {faltanteBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-amber-300/70 block">Equivalente en USD:</span>
                      <span className="text-xs font-mono font-bold text-amber-200">
                        {formatUSD(faltanteBsEnUsd)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-emerald-300 font-semibold block">Vuelto en Bolívares:</span>
                      <span className="text-lg font-mono font-black text-emerald-400">
                        Bs. {vueltoBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-300/70 block">Equivalente en USD:</span>
                      <span className="text-xs font-mono font-bold text-slate-200">
                        {formatUSD(vueltoBsEnUsd)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: 4. TARJETA / PUNTO DE VENTA (POS) */}
            {paymentMethod === 'tarjeta' && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 block">Monto a procesar en el Punto de Venta:</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">
                      {formatBs(totalCartUsd, empresaConfig.tasaCambio)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 font-mono">Equivalente USD:</span>
                    <span className="text-xs font-mono font-bold text-white block">{formatUSD(totalCartUsd)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Card Type Selector */}
                  <div>
                    <label className="text-[11px] text-slate-400 font-semibold block mb-1.5">
                      Tipo de Tarjeta / Instrumento:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTarjetaTipo('debito')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          tarjetaTipo === 'debito'
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        💳 Débito (Bs)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTarjetaTipo('credito')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          tarjetaTipo === 'credito'
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        💳 Crédito (Bs)
                      </button>
                      <button
                        type="button"
                        onClick={() => setTarjetaTipo('internacional')}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          tarjetaTipo === 'internacional'
                            ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        🌐 Internacional ($)
                      </button>
                    </div>
                  </div>

                  {/* Terminal / POS Bank */}
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Terminal POS / Banco</label>
                    <select
                      value={tarjetaBanco}
                      onChange={(e) => setTarjetaBanco(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-xs text-white px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                    >
                      <option value="0134 - Banesco (Terminal POS #1)">0134 - Banesco (Terminal POS #1)</option>
                      <option value="0102 - Banco de Venezuela (Biopago / POS #2)">0102 - Banco de Venezuela (Biopago / POS #2)</option>
                      <option value="0105 - Banco Mercantil (Terminal POS #3)">0105 - Banco Mercantil (Terminal POS #3)</option>
                      <option value="0172 - Bancamiga (POS Dual USD/Bs)">0172 - Bancamiga (POS Dual USD/Bs)</option>
                      <option value="0108 - Banco Provincial (Terminal POS)">0108 - Banco Provincial (Terminal POS)</option>
                      <option value="0114 - Bancaribe (Terminal POS)">0114 - Bancaribe (Terminal POS)</option>
                      <option value="Punto Inalámbrico Multi-Banco">Punto Inalámbrico Multi-Banco</option>
                    </select>
                  </div>

                  {/* Reference & Lot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-white block mb-1.5">
                        Número de Referencia / Aprobación *
                      </label>
                      <input
                        type="text"
                        required
                        value={tarjetaReferencia}
                        onChange={(e) => setTarjetaReferencia(e.target.value)}
                        placeholder="Ej: 004821 (6 dígitos voucher)"
                        className="w-full bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-sm px-3.5 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1.5">
                        Número de Lote (Opcional)
                      </label>
                      <input
                        type="text"
                        value={tarjetaLote}
                        onChange={(e) => setTarjetaLote(e.target.value)}
                        placeholder="Ej: 00014"
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 font-mono text-sm px-3.5 py-2.5 rounded-xl focus:border-emerald-500 focus:outline-none placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* POS operational guidance */}
                  <div className="bg-slate-900/60 p-3 rounded-xl text-[11px] text-slate-400 space-y-0.5 border border-slate-800/70 flex items-start gap-2">
                    <CreditCard className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-300">Paso a paso en caja:</p>
                      <p className="text-[10px] text-slate-400">Pasa o inserta la tarjeta en el terminal POS seleccionado. Una vez que el punto imprima el voucher aprobado, digita la referencia para cerrar el ticket fiscal.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: 5. PAGO MIXTO */}
            {paymentMethod === 'mixto' && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl text-xs">
                  <span>Total: <strong className="text-white font-mono">{formatUSD(totalCartUsd)}</strong> ({formatBs(totalCartUsd, empresaConfig.tasaCambio)})</span>
                  <span className={mixtoRestanteUsd > 0.01 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {mixtoRestanteUsd > 0.01 ? `Faltan: ${formatUSD(mixtoRestanteUsd)} (${formatBs(mixtoRestanteUsd, empresaConfig.tasaCambio)})` : '✓ 100% Cubierto'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  {/* Part 1: Cash USD */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">1. Efectivo USD ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={mixtoUsd}
                      onChange={(e) => setMixtoUsd(e.target.value)}
                      placeholder="$ 0.00"
                      className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white font-mono"
                    />
                  </div>

                  {/* Part 2: Pago Movil Bs */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">2. Pago Móvil (Bs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={mixtoPagoMovilBs}
                      onChange={(e) => setMixtoPagoMovilBs(e.target.value)}
                      placeholder="Bs. 0.00"
                      className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-emerald-400 font-mono"
                    />
                    <input
                      type="text"
                      value={mixtoPagoMovilRef}
                      onChange={(e) => setMixtoPagoMovilRef(e.target.value)}
                      placeholder="Ref Pago Móvil"
                      className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[11px] text-white font-mono mt-1"
                    />
                  </div>

                  {/* Part 3: Tarjeta POS Bs */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-indigo-300 block">3. Tarjeta / POS (Bs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={mixtoTarjetaBs}
                      onChange={(e) => setMixtoTarjetaBs(e.target.value)}
                      placeholder="Bs. 0.00"
                      className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-indigo-300 font-mono"
                    />
                    <input
                      type="text"
                      value={mixtoTarjetaRef}
                      onChange={(e) => setMixtoTarjetaRef(e.target.value)}
                      placeholder="Ref Voucher POS"
                      className="w-full bg-slate-950 border border-slate-700 px-2 py-1 rounded text-[11px] text-white font-mono mt-1"
                    />
                  </div>

                  {/* Part 4: Cash Bs */}
                  <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 space-y-1">
                    <label className="text-[11px] font-bold text-slate-300 block">4. Efectivo Bs.</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={mixtoBsEfectivo}
                      onChange={(e) => setMixtoBsEfectivo(e.target.value)}
                      placeholder="Bs. 0.00"
                      className="w-full bg-slate-950 border border-slate-700 px-2 py-1.5 rounded-lg text-white font-mono"
                    />
                  </div>
                </div>

                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Cubierto:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatUSD(mixtoTotalCubiertoUsd)} ({formatBs(mixtoTotalCubiertoUsd, empresaConfig.tasaCambio)})</span>
                  </div>
                  {mixtoRestanteUsd > 0.01 && (
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/80 text-amber-400">
                      <span className="font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Faltante para Completar:
                      </span>
                      <span className="font-mono font-bold">
                        {formatUSD(mixtoRestanteUsd)} ({formatBs(mixtoRestanteUsd, empresaConfig.tasaCambio)})
                      </span>
                    </div>
                  )}
                  {mixtoTotalCubiertoUsd > totalCartUsd && (
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/80 text-emerald-400">
                      <span className="font-semibold">Vuelto a Entregar:</span>
                      <span className="font-mono font-bold">
                        {formatUSD(mixtoTotalCubiertoUsd - totalCartUsd)} ({formatBs(mixtoTotalCubiertoUsd - totalCartUsd, empresaConfig.tasaCambio)})
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm cursor-pointer transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Confirmar Pago y Registrar Venta</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TICKET / RECEIPT FISCAL PREVIEW MODAL */}
      {/* ========================================================================= */}
      {showReceiptModal && lastCompletedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div id="printable-ticket-area" className="bg-white text-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 font-mono text-xs relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowReceiptModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-800 p-1.5 rounded-lg no-print"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Receipt Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-300 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase">
                {empresaConfig.nombreEmpresa}
              </h3>
              <p className="font-bold text-[11px] text-slate-700">RIF: {empresaConfig.rif}</p>
              <p className="text-[10px] text-slate-600 leading-tight">{empresaConfig.direccionFiscal}</p>
              <p className="text-[10px] text-slate-600">TELF: {empresaConfig.telefono}</p>
              <div className="pt-1 text-[10px] text-slate-500 font-sans">
                <span>{lastCompletedTicket.sucursalNombre}</span> • <span>Cajero: {lastCompletedTicket.cajeroNombre}</span>
              </div>
              <p className="text-[9px] text-slate-400">{lastCompletedTicket.fecha}</p>
            </div>

            {/* Receipt Customer Details */}
            <div className="py-1 border-b border-dashed border-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans font-semibold">CLIENTE:</span>
                <span className="font-bold text-slate-900 truncate max-w-[180px]">{lastCompletedTicket.clienteNombre}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span className="font-sans">CÉDULA / RIF:</span>
                <span className="font-mono font-bold">{lastCompletedTicket.clienteRif}</span>
              </div>
            </div>

            {/* Receipt Items */}
            <div className="space-y-1.5 py-1 border-b border-dashed border-slate-300 text-[11px]">
              <div className="flex justify-between font-bold text-[10px] text-slate-600 border-b border-slate-200 pb-1">
                <span>DESCRIPCIÓN DEL PRODUCTO</span>
                <span>TOTAL</span>
              </div>
              {lastCompletedTicket.items.map((it, idx) => {
                const isExento = !!it.producto.exento_iva;
                const cantFmt = it.cantidad % 1 === 0 ? it.cantidad : it.cantidad.toFixed(it.cantidad % 1 === 0 ? 0 : 2);
                return (
                  <div key={idx} className="flex justify-between items-baseline gap-2">
                    <div className="flex-1 truncate pr-1">
                      <span className="font-semibold text-slate-800">
                        {it.producto.nombre}
                      </span>
                      {isExento && (
                        <span className="text-[9px] font-bold text-amber-700 ml-1">
                          (E)
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                        {cantFmt} x {formatUSD(it.producto.precio)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-slate-900 font-mono">{formatUSD(it.producto.precio * it.cantidad)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tax & Subtotal Discrimination Box in Receipt Modal */}
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[10.5px] space-y-1">
              <div className="font-bold text-[9.5px] text-slate-700 uppercase tracking-wider">
                Discriminación Fiscal / IVA:
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Neto:</span>
                <span>{formatUSD(lastCompletedTicket.subtotalNeto)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Imponible (16%):</span>
                <span>{formatUSD(lastCompletedTicket.baseImponible)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Monto Exento (0%):</span>
                <span>{formatUSD(lastCompletedTicket.montoExento)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 border-t border-dashed border-slate-300 pt-1">
                <span>IVA Liquidado (16%):</span>
                <span>+{formatUSD(lastCompletedTicket.montoIva)}</span>
              </div>
            </div>

            {/* Receipt Totals */}
            <div className="space-y-1 pt-1 border-b border-dashed border-slate-300 pb-2">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Tasa Oficial Aplicada:</span>
                <span className="font-bold">1$ = {formatBs(1, lastCompletedTicket.tasa)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-300 pt-1">
                <span>TOTAL FACTURA USD:</span>
                <span>{formatUSD(lastCompletedTicket.totalUsd)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-emerald-700">
                <span>TOTAL FACTURA BS:</span>
                <span>{formatBs(lastCompletedTicket.totalUsd, lastCompletedTicket.tasa)}</span>
              </div>
            </div>

            {/* PAYMENT METHOD DETAILS IN RECEIPT */}
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1 text-[11px]">
              <span className="font-sans font-bold text-slate-800 block text-[10px] uppercase tracking-wider">
                Información de Pago:
              </span>
              {lastCompletedTicket.pagoDetalle.metodo === 'pago_movil' && (
                <div>
                  <p className="font-bold text-indigo-900">MÉTODO: PAGO MÓVIL (BS.)</p>
                  <p className="text-slate-700">Ref: <strong className="font-mono">{lastCompletedTicket.pagoDetalle.referencia_pago_movil}</strong></p>
                  <p className="text-slate-600 font-mono">Monto: {formatBs(lastCompletedTicket.totalUsd, lastCompletedTicket.tasa)}</p>
                </div>
              )}
              {lastCompletedTicket.pagoDetalle.metodo === 'efectivo_usd' && (
                <div>
                  <p className="font-bold text-emerald-900">MÉTODO: EFECTIVO USD ($)</p>
                  <p className="text-slate-700">Recibido: <strong className="font-mono">{formatUSD(lastCompletedTicket.pagoDetalle.efectivo_usd_recibido || lastCompletedTicket.totalUsd)}</strong></p>
                  {(lastCompletedTicket.pagoDetalle.vuelto_usd || 0) > 0 && (
                    <p className="text-emerald-700 font-bold font-mono">
                      Cambio: {formatUSD(lastCompletedTicket.pagoDetalle.vuelto_usd || 0)} ({formatBs(lastCompletedTicket.pagoDetalle.vuelto_usd || 0, lastCompletedTicket.tasa)})
                    </p>
                  )}
                </div>
              )}
              {lastCompletedTicket.pagoDetalle.metodo === 'efectivo_bs' && (
                <div>
                  <p className="font-bold text-slate-900">MÉTODO: EFECTIVO BOLÍVARES</p>
                  <p className="text-slate-700">Recibido: <strong className="font-mono">Bs. {(lastCompletedTicket.pagoDetalle.efectivo_bs_recibido || 0).toFixed(2)}</strong></p>
                  {(lastCompletedTicket.pagoDetalle.vuelto_bs || 0) > 0 && (
                    <p className="text-emerald-700 font-bold font-mono">
                      Cambio: Bs. {(lastCompletedTicket.pagoDetalle.vuelto_bs || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              )}
              {lastCompletedTicket.pagoDetalle.metodo === 'tarjeta' && (
                <div>
                  <p className="font-bold text-indigo-900">MÉTODO: TARJETA / PUNTO DE VENTA</p>
                  <p className="text-slate-700">
                    Tipo: <strong className="font-sans">{lastCompletedTicket.pagoDetalle.tarjeta_tipo === 'debito' ? 'Débito' : lastCompletedTicket.pagoDetalle.tarjeta_tipo === 'credito' ? 'Crédito' : 'Internacional'}</strong>
                  </p>
                  {lastCompletedTicket.pagoDetalle.tarjeta_banco && (
                    <p className="text-slate-600">POS: {lastCompletedTicket.pagoDetalle.tarjeta_banco}</p>
                  )}
                  <p className="text-slate-700">Ref / Aprob: <strong className="font-mono">{lastCompletedTicket.pagoDetalle.tarjeta_referencia}</strong></p>
                  {lastCompletedTicket.pagoDetalle.tarjeta_lote && (
                    <p className="text-slate-600">Lote: <span className="font-mono">{lastCompletedTicket.pagoDetalle.tarjeta_lote}</span></p>
                  )}
                  <p className="text-slate-700 font-mono">Monto: {formatBs(lastCompletedTicket.totalUsd, lastCompletedTicket.tasa)}</p>
                </div>
              )}
              {lastCompletedTicket.pagoDetalle.metodo === 'mixto' && (
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-900">MÉTODO: PAGO MIXTO</p>
                  {(lastCompletedTicket.pagoDetalle.efectivo_usd_recibido || 0) > 0 && (
                    <p className="text-slate-700">• Efectivo USD: {formatUSD(lastCompletedTicket.pagoDetalle.efectivo_usd_recibido || 0)}</p>
                  )}
                  {(lastCompletedTicket.pagoDetalle.pago_movil_monto_bs || 0) > 0 && (
                    <p className="text-slate-700">
                      • Pago Móvil: Bs. {(lastCompletedTicket.pagoDetalle.pago_movil_monto_bs || 0).toFixed(2)}{' '}
                      {lastCompletedTicket.pagoDetalle.referencia_pago_movil && `(Ref: ${lastCompletedTicket.pagoDetalle.referencia_pago_movil})`}
                    </p>
                  )}
                  {(lastCompletedTicket.pagoDetalle.tarjeta_monto_bs || 0) > 0 && (
                    <p className="text-slate-700">
                      • Tarjeta POS: Bs. {(lastCompletedTicket.pagoDetalle.tarjeta_monto_bs || 0).toFixed(2)}{' '}
                      {lastCompletedTicket.pagoDetalle.tarjeta_referencia && `(Ref: ${lastCompletedTicket.pagoDetalle.tarjeta_referencia})`}
                    </p>
                  )}
                  {(lastCompletedTicket.pagoDetalle.efectivo_bs_recibido || 0) > 0 && (
                    <p className="text-slate-700">• Efectivo Bs.: Bs. {(lastCompletedTicket.pagoDetalle.efectivo_bs_recibido || 0).toFixed(2)}</p>
                  )}
                </div>
              )}
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-2 border-t border-dashed border-slate-300">
              ¡Gracias por su compra! • Sistema Multi-Tienda
            </div>

            <div className="flex gap-2 pt-2 no-print">
              <button
                type="button"
                onClick={handlePrintTicket}
                className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-2.5 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Printer className="w-3.5 h-3.5" /> Imprimir Ticket
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="bg-slate-200 text-slate-800 hover:bg-slate-300 py-2.5 px-4 rounded-xl font-sans font-bold text-xs cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FISCAL REPORT MODAL (CORTE X / CORTE Z) */}
      {showFiscalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-5xl w-full p-4 sm:p-7 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    Módulo de Auditoría Fiscal y Arqueo de Caja
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sucursal activa: <strong className="text-emerald-400">{tiendaActual.nombre}</strong> • Cajero: <strong className="text-slate-200">{currentUser?.nombre_completo}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowFiscalModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <FiscalCortesView
              ventas={ventas}
              sucursales={sucursales}
              empresaConfig={empresaConfig}
              usuarios={currentUser ? [currentUser] : []}
              currentUser={currentUser}
              defaultTipo={fiscalModalTipo}
              initialBranchId={selectedSucursalId}
            />

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowFiscalModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl cursor-pointer"
              >
                Volver al Punto de Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
