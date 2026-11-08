/** Contratos de la API de CENTYNELLA-CORE (espejo de sus DTOs). */

export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  providers: string[];
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/** Usuario autenticado + permisos efectivos (`recurso:acción`). */
export interface Profile extends User {
  permissions: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  /** Segundos de vida del access token. */
  expires_in: number;
  user: Profile;
}

export interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
}

export interface PermissionInfo {
  key: string;
  description: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

/** Evento de la bitácora del sistema (`GET /api/v1/logs`). */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  module: string;
  event: string;
  message: string;
  environment: string;
  request_id: string | null;
  user_id: string | null;
  session_id: string | null;
  ip: string | null;
  details: Record<string, unknown>;
}

export interface LogFilters {
  module?: string;
  /** Nivel mínimo. */
  level?: LogLevel | '';
  user_id?: string;
  session_id?: string;
  request_id?: string;
  q?: string;
  since?: string;
  page?: number;
  page_size?: number;
}

export interface UserFilters {
  q?: string;
  role?: string;
  status?: UserStatus | '';
  page?: number;
  page_size?: number;
}

export type ProductStatus = 'active' | 'discontinued';

/** Producto del catálogo (`/api/v1/products`). */
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  quantity: number;
  low_stock_threshold: number;
  status: ProductStatus;
  barcode: string | null;
  brand: string;
  description: string;
  cost: number;
  /** Ruta relativa servida por el API (`/media/...`); `null` sin foto. Usar `productImageUrl()`. */
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

/** Una fila de la carga masiva (`POST /products/bulk`). Sin `id` = alta; con `id` = edición. */
export interface ProductBulkRow {
  id?: string;
  sku: string;
  name: string;
  category?: string;
  unit?: string;
  price: number;
  quantity: number;
  low_stock_threshold?: number;
  status?: ProductStatus;
  barcode?: string;
  brand?: string;
  description?: string;
  cost?: number;
}

export type ProductBulkOutcome = 'created' | 'updated' | 'error';

export interface ProductBulkRowResult {
  row: number;
  outcome: ProductBulkOutcome;
  product: Product | null;
  error: string | null;
  code: string | null;
}

export interface ProductBulkResponse {
  results: ProductBulkRowResult[];
  created: number;
  updated: number;
  failed: number;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  status?: ProductStatus | '';
  page?: number;
  page_size?: number;
}

/** Cliente (fiado), solo lectura — el alta/edición completa vive en el remote de Clientes. Se
 * necesita aquí nada más para el selector de "cobrar a crédito" de Ventas. */
export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  credit_limit: number;
  balance: number;
}

export interface CustomerFilters {
  q?: string;
  page?: number;
  page_size?: number;
}

/** Venta (punto de venta, `/api/v1/sales`). */
export type SalePaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'transfer' | 'store_credit';

export interface SaleItem {
  product_id: string;
  sku: string;
  name: string;
  unit: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  customer_id: string | null;
  items: SaleItem[];
  payment_method: SalePaymentMethod;
  total: number;
  /** Solo con `payment_method: 'cash'`. */
  amount_tendered: number | null;
  /** Solo con `payment_method: 'cash'`. */
  change_due: number | null;
  note: string;
  created_by: string | null;
  created_at: string;
}

export interface SaleLineInput {
  product_id: string;
  quantity: number;
}

export interface CreateSaleInput {
  customer_id?: string | null;
  items: SaleLineInput[];
  payment_method: SalePaymentMethod;
  amount_tendered?: number;
  note?: string;
}

export interface SaleFilters {
  customer_id?: string;
  page?: number;
  page_size?: number;
}

/** Permisos conocidos por el frontend (deben coincidir con `Permission` del backend). */
export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  ROLES_READ: 'roles:read',
  ROLES_MANAGE: 'roles:manage',
  LOGS_READ: 'logs:read',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_CREATE: 'products:create',
  PRODUCTS_UPDATE: 'products:update',
  PRODUCTS_DELETE: 'products:delete',
  SALES_READ: 'sales:read',
  SALES_CREATE: 'sales:create',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
