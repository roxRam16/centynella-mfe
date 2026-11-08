/** Ventas (punto de venta, `/api/v1/sales`). */
import { apiRequest } from './apiClient';
import type { CreateSaleInput, Page, Sale, SaleFilters } from './types';

export const listSales = (filters: SaleFilters, signal?: AbortSignal): Promise<Page<Sale>> =>
  apiRequest<Page<Sale>>('/sales', { query: { ...filters }, signal });

export const getSale = (id: string): Promise<Sale> =>
  apiRequest<Sale>(`/sales/${encodeURIComponent(id)}`);

/** Cobra un carrito. "Todo o nada": si falla, no se descontó existencia ni se cobró nada. */
export const createSale = (input: CreateSaleInput): Promise<Sale> =>
  apiRequest<Sale>('/sales', { method: 'POST', body: input });
