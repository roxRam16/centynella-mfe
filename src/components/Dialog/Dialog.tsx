import { useId } from 'react';
import type { ReactNode } from 'react';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MuiDialog from '@mui/material/Dialog';
import { radius } from '@/theme/tokens';

export interface DialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  /** Botones del pie (el principal a la derecha). */
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md';
  children: ReactNode;
}

/**
 * Ventana modal accesible: atrapa el foco, cierra con Escape y se rotula con su título
 * (`aria-labelledby`). En móvil ocupa todo el ancho disponible.
 */
export function Dialog({ open, title, onClose, actions, maxWidth = 'sm', children }: DialogProps) {
  const titleId = useId();

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: `${radius.large}px`,
            m: 2,
            width: 'calc(100% - 32px)',
            // El foco cae en el contenedor (para atrapar el teclado): sin anillo, los controles sí lo tienen.
            '&:focus, &:focus-visible': { outline: 'none' },
          },
        },
      }}
    >
      <DialogTitle id={titleId} component="h2" sx={{ fontWeight: 600 }}>
        {title}
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions sx={{ px: 3, pb: 2.5 }}>{actions}</DialogActions>}
    </MuiDialog>
  );
}
