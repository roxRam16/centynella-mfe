import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PrintIcon from '@mui/icons-material/PrintOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { Button, Dialog } from '@/components';
import type { Sale } from '@/services/types';
import { formatCurrency } from '@/utils/format';

const PAYMENT_METHOD_LABELS: Record<Sale['payment_method'], string> = {
  cash: 'Efectivo',
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  transfer: 'Transferencia',
  store_credit: 'A crédito',
};

function buildWhatsAppText(sale: Sale): string {
  const lines = sale.items.map(
    (item) => `${item.quantity} x ${item.name} — ${formatCurrency(item.subtotal)}`,
  );
  return [
    'Ticket de venta — CENTYNELLA',
    ...lines,
    `Total: ${formatCurrency(sale.total)}`,
    `Forma de pago: ${PAYMENT_METHOD_LABELS[sale.payment_method]}`,
  ].join('\n');
}

interface SaleReceiptDialogProps {
  sale: Sale;
  onClose: () => void;
}

/** Ticket de la venta que acaba de cobrarse: detalle, total, cambio (si fue en efectivo) e
 * imprimir / compartir por WhatsApp. */
export function SaleReceiptDialog({ sale, onClose }: SaleReceiptDialogProps) {
  return (
    <Dialog
      open
      onClose={onClose}
      title="Venta registrada"
      actions={<Button onClick={onClose}>Cerrar</Button>}
    >
      <Stack spacing={1.5} sx={{ pt: 1 }}>
        <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
          {sale.items.map((item) => (
            <Stack
              key={item.product_id}
              direction="row"
              justifyContent="space-between"
              sx={{ py: 0.75 }}
            >
              <Typography variant="body2">
                {item.quantity} × {item.name}
              </Typography>
              <Typography variant="body2">{formatCurrency(item.subtotal)}</Typography>
            </Stack>
          ))}
        </Stack>

        <Divider />

        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontWeight: 700 }}>Total</Typography>
          <Typography sx={{ fontWeight: 700 }}>{formatCurrency(sale.total)}</Typography>
        </Stack>

        {sale.amount_tendered !== null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Efectivo recibido
            </Typography>
            <Typography variant="body2">{formatCurrency(sale.amount_tendered)}</Typography>
          </Stack>
        )}
        {sale.change_due !== null && (
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" color="text.secondary">
              Cambio
            </Typography>
            <Typography variant="body2">{formatCurrency(sale.change_due)}</Typography>
          </Stack>
        )}

        <Typography variant="caption" color="text.secondary">
          Forma de pago: {PAYMENT_METHOD_LABELS[sale.payment_method]}
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ pt: 1 }}>
          <Button variant="outlined" onClick={() => window.print()} sx={{ flexGrow: 1 }}>
            <PrintIcon fontSize="small" sx={{ mr: 0.75 }} aria-hidden />
            Imprimir
          </Button>
          <Button
            variant="outlined"
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(buildWhatsAppText(sale))}`,
                '_blank',
                'noopener,noreferrer',
              )
            }
            sx={{ flexGrow: 1 }}
          >
            <WhatsAppIcon fontSize="small" sx={{ mr: 0.75 }} aria-hidden />
            Enviar por WhatsApp
          </Button>
        </Stack>
      </Stack>
    </Dialog>
  );
}
