import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Button, ChipSelect, Dialog, TextField } from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { listCustomers } from '@/services/customersService';
import { createSale } from '@/services/salesService';
import type { Customer, Sale, SalePaymentMethod } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { formatCurrency } from '@/utils/format';
import type { CartLine } from './SalesPage';

const PAYMENT_METHODS: { value: SalePaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'credit_card', label: 'Tarjeta de crédito' },
  { value: 'debit_card', label: 'Tarjeta de débito' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'store_credit', label: 'A crédito' },
];

const CASH_DENOMINATIONS = [100, 200, 500, 1000];

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

interface CheckoutDialogProps {
  cart: CartLine[];
  total: number;
  onClose: () => void;
  onSuccess: (sale: Sale) => void;
}

/** Cobra el carrito: elige forma de pago y, según cuál, pide el efectivo recibido (calcula el
 * cambio) o el cliente al que se le anota el fiado. */
export function CheckoutDialog({ cart, total, onClose, onSuccess }: CheckoutDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>('cash');
  const [amountTendered, setAmountTendered] = useState('');
  const [customerQuery, setCustomerQuery] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tendered = Number(amountTendered) || 0;
  const changeDue = paymentMethod === 'cash' ? round2(tendered - total) : null;
  const cashCovers = paymentMethod !== 'cash' || tendered >= total;
  const hasCustomer = paymentMethod !== 'store_credit' || customer !== null;
  const canSubmit = cashCovers && hasCustomer;

  const customerSearch = useDebouncedValue(customerQuery.trim());
  const fetchCustomers = useCallback(
    (signal: AbortSignal) =>
      customerSearch
        ? listCustomers({ q: customerSearch, page_size: 10 }, signal)
        : Promise.resolve(null),
    [customerSearch],
  );
  const customerResults = useAsyncResource(fetchCustomers);
  const customerMatches =
    customerResults.status === 'success' && customerResults.data ? customerResults.data.items : [];

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const sale = await createSale({
        customer_id: paymentMethod === 'store_credit' ? customer?.id : undefined,
        items: cart.map((line) => ({ product_id: line.product.id, quantity: line.quantity })),
        payment_method: paymentMethod,
        amount_tendered: paymentMethod === 'cash' ? tendered : undefined,
      });
      onSuccess(sale);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title="Cobrar"
      actions={
        <>
          <Button variant="text" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={() => void handleSubmit()} loading={submitting} disabled={!canSubmit}>
            Cobrar {formatCurrency(total)}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Typography variant="h4" sx={{ textAlign: 'center' }}>
          {formatCurrency(total)}
        </Typography>

        <ChipSelect
          label="Forma de pago"
          value={paymentMethod}
          onChange={(value) => setPaymentMethod(value as SalePaymentMethod)}
          options={PAYMENT_METHODS}
        />

        {paymentMethod === 'cash' && (
          <Stack spacing={1}>
            <TextField
              label="Efectivo recibido"
              type="number"
              inputMode="decimal"
              step="0.01"
              value={amountTendered}
              onChange={(event) => setAmountTendered(event.target.value)}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {CASH_DENOMINATIONS.map((amount) => (
                <Button
                  key={amount}
                  variant="outlined"
                  shape="rounded"
                  onClick={() => setAmountTendered(String(amount))}
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </Stack>
            {amountTendered && (
              <Typography
                variant="body2"
                color={cashCovers ? 'text.secondary' : 'error.main'}
                sx={{ textAlign: 'right' }}
              >
                {cashCovers
                  ? `Cambio: ${formatCurrency(changeDue ?? 0)}`
                  : 'El efectivo no cubre el total.'}
              </Typography>
            )}
          </Stack>
        )}

        {paymentMethod === 'store_credit' && (
          <Stack spacing={1}>
            {customer ? (
              <Alert severity="info" onClose={() => setCustomer(null)}>
                Se anotará el fiado a <strong>{customer.name}</strong> (saldo actual:{' '}
                {formatCurrency(customer.balance)}).
              </Alert>
            ) : (
              <>
                <TextField
                  label="Buscar cliente"
                  placeholder="Nombre del cliente…"
                  value={customerQuery}
                  onChange={(event) => setCustomerQuery(event.target.value)}
                  maxLength={100}
                />
                <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                  {customerMatches.map((match) => (
                    <Box
                      key={match.id}
                      component="button"
                      type="button"
                      onClick={() => setCustomer(match)}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        textAlign: 'left',
                        py: 1,
                        border: 0,
                        background: 'none',
                        cursor: 'pointer',
                        font: 'inherit',
                        color: 'inherit',
                      }}
                    >
                      <Typography variant="body2">{match.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Saldo: {formatCurrency(match.balance)}
                      </Typography>
                    </Box>
                  ))}
                  {customerSearch && customerMatches.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                      No hay clientes que coincidan con "{customerSearch}".
                    </Typography>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        )}
      </Stack>
    </Dialog>
  );
}
