import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/** Página 404 del shell. */
export function NotFoundPage() {
  return (
    <Stack component="section" spacing={2} aria-labelledby="titulo-404">
      <Typography id="titulo-404" component="h1" variant="h1">
        Página no encontrada
      </Typography>
      <Typography color="text.secondary">La ruta que buscas no existe.</Typography>
      <Link to="/">Volver al inicio</Link>
    </Stack>
  );
}
