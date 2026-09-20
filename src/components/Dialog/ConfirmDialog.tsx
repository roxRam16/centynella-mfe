import Typography from '@mui/material/Typography';
import { Button } from '@/components/Button';
import { Dialog } from './Dialog';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Acción destructiva: el botón de confirmar se muestra en rojo. */
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmación de una acción (p. ej. eliminar un usuario). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      title={title}
      onClose={onCancel}
      maxWidth="xs"
      actions={
        <>
          <Button variant="text" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button danger={danger} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Typography>{message}</Typography>
    </Dialog>
  );
}
