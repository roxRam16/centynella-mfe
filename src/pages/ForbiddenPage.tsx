import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link } from '@/components';

/** Página 403: sesión válida pero sin permiso para esta sección. */
export function ForbiddenPage() {
  return (
    <Stack component="section" spacing={2} aria-labelledby="titulo-403">
      <Typography id="titulo-403" component="h1" variant="h1">
        Acceso restringido
      </Typography>
      <Typography color="text.secondary">
        No tienes permiso para ver esta sección. Si crees que es un error, contacta a un
        administrador.
      </Typography>
      <Link to="/">Volver al inicio</Link>
    </Stack>
  );
}
