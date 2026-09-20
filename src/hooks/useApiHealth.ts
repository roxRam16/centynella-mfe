import { getHealth } from '@/services';
import { useAsyncResource } from './useAsyncResource';

/** Estado de salud de CENTYNELLA-CORE (loading / success / error + reload). */
export function useApiHealth() {
  return useAsyncResource(getHealth);
}
