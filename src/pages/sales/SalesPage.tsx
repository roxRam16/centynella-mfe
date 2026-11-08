import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import RemoveIcon from '@mui/icons-material/RemoveOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import { Alert, Button, Card, Chip, IconButton, Spinner, TextField } from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { listProducts } from '@/services/productsService';
import type { Product, Sale } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { formatCurrency } from '@/utils/format';
import { CheckoutDialog } from './CheckoutDialog';
import { SaleReceiptDialog } from './SaleReceiptDialog';

export interface CartLine {
  product: Product;
  quantity: number;
}

/** Punto de venta: busca/escanea productos, arma el carrito y cobra. Vive dentro del shell
 * (como Inventario): necesita el catálogo y el fiado de clientes todo el tiempo y en vivo. */
export function SalesPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState<Sale | null>(null);

  const q = useDebouncedValue(search.trim());
  const fetchProducts = useCallback(
    (signal: AbortSignal) =>
      q
        ? listProducts({ q, status: 'active', page: 1, page_size: 20 }, signal)
        : Promise.resolve(null),
    [q],
  );
  const results = useAsyncResource(fetchProducts);

  const total = cart.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const itemCount = cart.reduce((sum, line) => sum + line.quantity, 0);

  const inCart = (productId: string) => cart.find((line) => line.product.id === productId);

  const addToCart = (product: Product) => {
    const existing = inCart(product.id);
    const nextQuantity = (existing?.quantity ?? 0) + 1;
    if (nextQuantity > product.quantity) {
      toast.warning(`Ya no hay más existencia de "${product.name}" para agregar.`);
      return;
    }
    setCart((current) =>
      existing
        ? current.map((line) =>
            line.product.id === product.id ? { ...line, quantity: nextQuantity } : line,
          )
        : [...current, { product, quantity: 1 }],
    );
  };

  const setQuantity = (productId: string, quantity: number) => {
    setCart((current) => {
      if (quantity <= 0) return current.filter((line) => line.product.id !== productId);
      return current.map((line) =>
        line.product.id === productId
          ? { ...line, quantity: Math.min(quantity, line.product.quantity) }
          : line,
      );
    });
  };

  const removeLine = (productId: string) =>
    setCart((current) => current.filter((line) => line.product.id !== productId));

  const handleSaleCreated = (sale: Sale) => {
    setCheckoutOpen(false);
    setCart([]);
    setReceipt(sale);
    toast.success('Venta registrada correctamente.');
  };

  const matches = results.status === 'success' && results.data ? results.data.items : [];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
        Ventas
      </Typography>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems="flex-start">
        <Box sx={{ flex: 2, width: '100%' }}>
          <Card padding={2}>
            <Stack spacing={1.5}>
              <TextField
                label="Buscar productos"
                placeholder="Nombre, SKU o escanea el código de barras…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                maxLength={100}
                autoFocus
              />

              {results.status === 'loading' && q && <Spinner label="Buscando…" showLabel />}
              {results.status === 'error' && (
                <Alert severity="error">{getErrorMessage(results.error)}</Alert>
              )}
              {!q && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 4, textAlign: 'center' }}
                >
                  Escribe para buscar un producto por nombre, SKU o código de barras.
                </Typography>
              )}
              {q && results.status === 'success' && matches.length === 0 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 4, textAlign: 'center' }}
                >
                  No hay productos que coincidan con "{q}".
                </Typography>
              )}

              <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                {matches.map((product) => {
                  const line = inCart(product.id);
                  const outOfStock = product.quantity <= 0;
                  const maxedOut = Boolean(line) && line!.quantity >= product.quantity;
                  return (
                    <Stack
                      key={product.id}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ py: 1 }}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {product.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontFamily: 'monospace' }}
                        >
                          {product.sku} · {formatCurrency(product.price)}
                        </Typography>
                      </Box>
                      {outOfStock ? (
                        <Chip label="Sin existencia" tone="error" icon={<WarningIcon />} />
                      ) : (
                        <Chip label={`${product.quantity} ${product.unit}`} tone="neutral" />
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => addToCart(product)}
                        disabled={outOfStock || maxedOut}
                      >
                        Agregar
                      </Button>
                    </Stack>
                  );
                })}
              </Stack>
            </Stack>
          </Card>
        </Box>

        <Box sx={{ flex: 1, width: '100%', position: { lg: 'sticky' }, top: { lg: 16 } }}>
          <Card padding={2}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ShoppingCartIcon color="primary" />
                <Typography variant="h6" component="h2">
                  Venta actual
                </Typography>
              </Stack>

              {cart.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ py: 3, textAlign: 'center' }}
                >
                  Tu carrito está vacío. Agrega productos de la lista.
                </Typography>
              ) : (
                <Stack divider={<Box sx={{ borderBottom: '1px solid', borderColor: 'divider' }} />}>
                  {cart.map((line) => (
                    <Stack
                      key={line.product.id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ py: 1 }}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {line.product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(line.product.price)} c/u
                        </Typography>
                      </Box>
                      <IconButton
                        label={`Quitar una unidad de ${line.product.name}`}
                        icon={<RemoveIcon fontSize="small" />}
                        onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                      />
                      <Typography variant="body2" sx={{ minWidth: '1.5rem', textAlign: 'center' }}>
                        {line.quantity}
                      </Typography>
                      <IconButton
                        label={`Agregar una unidad más de ${line.product.name}`}
                        icon={<AddIcon fontSize="small" />}
                        disabled={line.quantity >= line.product.quantity}
                        onClick={() => setQuantity(line.product.id, line.quantity + 1)}
                      />
                      <Typography variant="body2" sx={{ minWidth: '4.5rem', textAlign: 'right' }}>
                        {formatCurrency(line.product.price * line.quantity)}
                      </Typography>
                      <IconButton
                        label={`Quitar ${line.product.name} de la venta`}
                        icon={<DeleteIcon fontSize="small" />}
                        tone="danger"
                        onClick={() => removeLine(line.product.id)}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ pt: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {formatCurrency(total)}
                </Typography>
              </Stack>

              <Button disabled={cart.length === 0} onClick={() => setCheckoutOpen(true)}>
                Cobrar {formatCurrency(total)}
              </Button>
            </Stack>
          </Card>
        </Box>
      </Stack>

      {checkoutOpen && (
        <CheckoutDialog
          cart={cart}
          total={total}
          onClose={() => setCheckoutOpen(false)}
          onSuccess={handleSaleCreated}
        />
      )}

      {receipt && <SaleReceiptDialog sale={receipt} onClose={() => setReceipt(null)} />}
    </Box>
  );
}
