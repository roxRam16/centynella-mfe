import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Botones de acción a la derecha (se apilan debajo en pantallas pequeñas). */
  actions?: ReactNode;
}

/** Encabezado de página: título (h1), descripción y acciones. Una por pantalla. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}
    >
      <Stack spacing={0.5}>
        <Typography component="h1" variant="h1">
          {title}
        </Typography>
        {description && <Typography color="text.secondary">{description}</Typography>}
      </Stack>
      {actions && (
        <Stack direction="row" spacing={1}>
          {actions}
        </Stack>
      )}
    </Stack>
  );
}
