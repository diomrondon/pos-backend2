import { EmpresaConfig } from '../types';

export const DEFAULT_EMPRESA_CONFIG: EmpresaConfig = {
  nombreEmpresa: 'Inversiones y Distribuciones Venezolanas C.A.',
  rif: 'J-40982341-2',
  direccionFiscal: 'Av. Francisco de Miranda, Centro Empresarial Plaza, Nivel PB, Local 04, Caracas',
  telefono: '+58 (212) 555-0199 / +58 (414) 332-8890',
  logoUrl: '',
  tasaCambio: 36.50,
  fechaTasa: new Date().toLocaleDateString('es-VE'),
  nombreTienda1: 'Tienda 1 - Centro',
  nombreTienda2: 'Tienda 2 - Norte',
  nombreOficina: 'Oficina Central & Almacén',
};

export const CLEAN_EMPRESA_CONFIG: EmpresaConfig = {
  nombreEmpresa: '',
  rif: '',
  direccionFiscal: '',
  telefono: '',
  logoUrl: '',
  tasaCambio: 0,
  fechaTasa: new Date().toLocaleDateString('es-VE'),
  nombreTienda1: 'Tienda 1',
  nombreTienda2: 'Tienda 2',
  nombreOficina: 'Oficina Central / Almacén',
};

const STORAGE_KEY_EMPRESA = 'pos_empresa_config_v1';
const STORAGE_KEY_TASA_SET_DATE = 'pos_tasa_date_v1';

export function getStoredEmpresaConfig(): EmpresaConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EMPRESA);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading empresa config:', e);
  }
  return { ...DEFAULT_EMPRESA_CONFIG };
}

export function saveStoredEmpresaConfig(config: EmpresaConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_EMPRESA, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving empresa config:', e);
  }
}

export const saveEmpresaConfig = saveStoredEmpresaConfig;

export function hasSetTasaToday(): boolean {
  try {
    const storedDate = localStorage.getItem(STORAGE_KEY_TASA_SET_DATE);
    const today = new Date().toISOString().split('T')[0];
    return storedDate === today;
  } catch (e) {
    return false;
  }
}

export function markTasaSetToday(): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEY_TASA_SET_DATE, today);
  } catch (e) {
    console.error('Error saving tasa date:', e);
  }
}

/**
 * Format currency in USD and Bolívares with safe fallbacks
 */
export function formatUSD(amount?: number | null): string {
  const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatBs(amountUsd?: number | null, tasaCambio?: number | null): string {
  const val = typeof amountUsd === 'number' && !isNaN(amountUsd) ? amountUsd : 0;
  const rate = typeof tasaCambio === 'number' && !isNaN(tasaCambio) && tasaCambio > 0 ? tasaCambio : 36.5;
  const bs = val * rate;
  return `Bs. ${bs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDual(amountUsd?: number | null, tasaCambio?: number | null, separator = ' • '): string {
  return `${formatUSD(amountUsd)}${separator}${formatBs(amountUsd, tasaCambio)}`;
}
