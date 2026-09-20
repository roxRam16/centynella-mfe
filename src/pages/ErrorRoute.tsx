import { useParams } from 'react-router-dom';
import { StatusPage } from './StatusPage';
import { isErrorStatus } from './statusCatalog';

/** `/error/:code` — muestra la pantalla amable de cualquier código HTTP (400-599). Otro valor → 404. */
export function ErrorRoute() {
  const code = Number(useParams().code);
  return <StatusPage code={isErrorStatus(code) ? code : 404} fullPage />;
}
