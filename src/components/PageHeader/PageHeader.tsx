import { useId, useState } from 'react';
import type { ReactNode } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import HelpIcon from '@mui/icons-material/HelpOutline';
import { IconButton } from '@/components/IconButton';

export interface PageHeaderProps {
  title: string;
  /** Leyenda de la pantalla: NO se ve de entrada, se muestra con el icono "?" junto al título. */
  description?: string;
  /** Botones de acción a la derecha (se apilan debajo en pantallas pequeñas). */
  actions?: ReactNode;
}

/**
 * Encabezado de página: título (h1, compacto), icono "?" que muestra u oculta la descripción, y
 * acciones. Una por pantalla.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  const descriptionId = useId();
  const [showDescription, setShowDescription] = useState(false);

  return (
    <Stack spacing={0.5} sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Typography
            component="h1"
            variant="h1"
            sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 700 }}
          >
            {title}
          </Typography>
          {description && (
            <IconButton
              label={showDescription ? 'Ocultar la descripción' : 'Ver la descripción'}
              icon={<HelpIcon fontSize="small" />}
              aria-expanded={showDescription}
              aria-controls={showDescription ? descriptionId : undefined}
              onClick={() => setShowDescription((current) => !current)}
              sx={{ p: 0.25 }}
            />
          )}
        </Stack>
        {actions && (
          <Stack direction="row" spacing={1}>
            {actions}
          </Stack>
        )}
      </Stack>
      {description && showDescription && (
        <Typography id={descriptionId} variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Stack>
  );
}
