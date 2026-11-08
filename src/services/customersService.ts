/** Clientes, solo lectura (`/api/v1/customers`). El alta/edición completa del cliente y su
 * fiado vive en el microfrontend de Clientes; aquí solo se necesita buscar uno para el
 * selector de "cobrar a crédito" de Ventas. */
import { apiRequest } from './apiClient';
import type { Customer, CustomerFilters, Page } from './types';

export const listCustomers = (
  filters: CustomerFilters,
  signal?: AbortSignal,
): Promise<Page<Customer>> =>
  apiRequest<Page<Customer>>('/customers', { query: { ...filters }, signal });
