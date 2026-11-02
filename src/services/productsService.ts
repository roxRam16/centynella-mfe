/** Catálogo de productos (`/api/v1/products`). */
import { apiRequest } from './apiClient';
import type {
  Page,
  Product,
  ProductBulkResponse,
  ProductBulkRow,
  ProductFilters,
  ProductStatus,
} from './types';

export interface CreateProductInput {
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  status: ProductStatus;
  barcode?: string;
  brand: string;
  description: string;
  cost: number;
}

export interface UpdateProductInput {
  name?: string;
  category?: string;
  unit?: string;
  price?: number;
  quantity?: number;
  low_stock_threshold?: number;
  status?: ProductStatus;
  barcode?: string;
  brand?: string;
  description?: string;
  cost?: number;
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

/** Sube (o reemplaza) la foto del producto. JPG, PNG o WEBP. */
export const uploadProductImage = (id: string, file: File): Promise<Product> => {
  const body = new FormData();
  body.append('file', file);
  return apiRequest<Product>(`/products/${encodeURIComponent(id)}/image`, {
    method: 'POST',
    body,
  });
};

export const deleteProductImage = (id: string): Promise<Product> =>
  apiRequest<Product>(`/products/${encodeURIComponent(id)}/image`, { method: 'DELETE' });

/** Alta/edición masiva (1-500 filas). Sin `id` = alta, con `id` = edición. "Mejor esfuerzo":
 * una fila con error no detiene a las demás, el resultado viene fila por fila. */
export const bulkUpsertProducts = (items: ProductBulkRow[]): Promise<ProductBulkResponse> =>
  apiRequest<ProductBulkResponse>('/products/bulk', { method: 'POST', body: { items } });
