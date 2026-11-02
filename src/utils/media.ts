import { config } from '@/config/env';
import type { Product } from '@/services/types';

/** URL completa de la foto de un producto, o `null` si no tiene. `image_url` que manda el API
 * es una ruta relativa (`/media/...`), fuera de `/api/v1`: hay que anteponerle la base. */
export function productImageUrl(product: Pick<Product, 'image_url'>): string | null {
  return product.image_url ? `${config.apiBaseUrl}${product.image_url}` : null;
}
