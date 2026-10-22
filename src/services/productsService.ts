/** Catálogo de productos (`/api/v1/products`). */
import { apiRequest } from './apiClient';
import type { Page, Product, ProductFilters, ProductStatus } from './types';

export interface CreateProductInput {
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  status: ProductStatus;
}

export interface UpdateProductInput {
  name?: string;
  category?: string;
  unit?: string;
  price?: number;
  quantity?: number;
  low_stock_threshold?: number;
  status?: ProductStatus;
}

export const listProducts = (
  filters: ProductFilters,
  signal?: AbortSignal,
): Promise<Page<Product>> =>
  apiRequest<Page<Product>>('/products', { query: { ...filters }, signal });

export const createProduct = (input: CreateProductInput): Promise<Product> =>
  apiRequest<Product>('/products', { method: 'POST', body: input });

export const updateProduct = (id: string, input: UpdateProductInput): Promise<Product> =>
  apiRequest<Product>(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });

export const deleteProduct = (id: string): Promise<void> =>
  apiRequest<void>(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
