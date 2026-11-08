import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makePage } from '@/test/factories';
import { mockApi } from '@/test/mockApi';
import type { MockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { notifications } from '@/test/toasts';
import type { Customer, Product, Sale } from '@/services/types';
import { SalesPage } from './SalesPage';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p-1',
  sku: 'ABC-001',
  name: 'Refresco de cola 600ml',
  category: 'Bebidas',
  unit: 'pieza',
  price: 18.5,
  quantity: 24,
  low_stock_threshold: 6,
  status: 'active',
  barcode: null,
  brand: '',
  description: '',
  cost: 0,
  image_url: null,
  created_at: '2026-11-01T10:00:00Z',
  updated_at: '2026-11-01T10:00:00Z',
  ...overrides,
});

const makeCustomer = (overrides: Partial<Customer> = {}): Customer => ({
  id: 'c-1',
  name: 'Doña Lupe',
  phone: '2281234567',
  credit_limit: 500,
  balance: 0,
  ...overrides,
});

const makeSale = (overrides: Partial<Sale> = {}): Sale => ({
  id: 's-1',
  customer_id: null,
  items: [
    {
      product_id: 'p-1',
      sku: 'ABC-001',
      name: 'Refresco de cola 600ml',
      unit: 'pieza',
      quantity: 2,
      unit_price: 18.5,
      subtotal: 37,
    },
  ],
  payment_method: 'cash',
  total: 37,
  amount_tendered: 50,
  change_due: 13,
  note: '',
  created_by: 'u-1',
  created_at: '2026-11-08T10:00:00Z',
  ...overrides,
});

const refresco = makeProduct();

function setupApi(extra: Parameters<typeof mockApi>[0] = {}): MockApi {
  return mockApi({
    'GET /api/v1/products': () => ({ json: makePage([refresco]) }),
    ...extra,
  });
}

async function searchAndAdd(name: string) {
  await userEvent.type(screen.getByLabelText('Buscar productos'), name);
  const addButton = await screen.findByRole('button', { name: 'Agregar' });
  await userEvent.click(addButton);
}

describe('<SalesPage />', () => {
  it('busca un producto, lo agrega al carrito y suma el total', async () => {
    setupApi();
    renderWithProviders(<SalesPage />);

    await searchAndAdd('Refresco');

    // Aparece dos veces: en el resultado de búsqueda y en la línea del carrito.
    expect(await screen.findAllByText('Refresco de cola 600ml')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Cobrar \$18\.50/ })).toBeInTheDocument();
  });

  it('sube y baja la cantidad en el carrito, respetando la existencia', async () => {
    setupApi();
    renderWithProviders(<SalesPage />);
    await searchAndAdd('Refresco');

    await userEvent.click(screen.getByRole('button', { name: /Agregar una unidad más/ }));
    expect(screen.getByRole('button', { name: /Cobrar \$37\.00/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Quitar una unidad/ }));
    expect(screen.getByRole('button', { name: /Cobrar \$18\.50/ })).toBeInTheDocument();
  });

  it('quita un producto del carrito', async () => {
    setupApi();
    renderWithProviders(<SalesPage />);
    await searchAndAdd('Refresco');

    await userEvent.click(screen.getByRole('button', { name: /Quitar Refresco de cola 600ml de la venta/ }));

    expect(screen.getByText('Tu carrito está vacío. Agrega productos de la lista.')).toBeInTheDocument();
  });

  it('cobra en efectivo, calcula el cambio y muestra el ticket', async () => {
    const api = setupApi({
      'POST /api/v1/sales': () => ({ status: 201, json: makeSale() }),
    });
    renderWithProviders(<SalesPage />);
    await searchAndAdd('Refresco');
    await userEvent.click(screen.getByRole('button', { name: /Agregar una unidad más/ }));

    await userEvent.click(screen.getByRole('button', { name: /Cobrar \$37\.00/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Cobrar' });
    await userEvent.type(within(dialog).getByLabelText('Efectivo recibido'), '50');
    await userEvent.click(within(dialog).getByRole('button', { name: /^Cobrar \$37\.00$/ }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/sales')).toHaveLength(1));
    expect(api.callsTo('POST /api/v1/sales')[0].body).toMatchObject({
      items: [{ product_id: 'p-1', quantity: 2 }],
      payment_method: 'cash',
      amount_tendered: 50,
    });

    expect(await screen.findByRole('dialog', { name: 'Venta registrada' })).toBeInTheDocument();
    expect(screen.getByText('Tu carrito está vacío. Agrega productos de la lista.')).toBeInTheDocument();
    expect(notifications()).toHaveTextContent(/Venta registrada correctamente/);
  });

  it('cobra a crédito ligado a un cliente existente', async () => {
    const api = setupApi({
      'GET /api/v1/customers': () => ({ json: makePage([makeCustomer()]) }),
      'POST /api/v1/sales': () => ({
        status: 201,
        json: makeSale({
          customer_id: 'c-1',
          payment_method: 'store_credit',
          amount_tendered: null,
          change_due: null,
        }),
      }),
    });
    renderWithProviders(<SalesPage />);
    await searchAndAdd('Refresco');

    await userEvent.click(screen.getByRole('button', { name: /Cobrar \$18\.50/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Cobrar' });
    await userEvent.click(within(dialog).getByRole('radio', { name: 'A crédito' }));
    await userEvent.type(within(dialog).getByLabelText('Buscar cliente'), 'Lupe');
    await userEvent.click(await within(dialog).findByText('Doña Lupe'));
    await userEvent.click(within(dialog).getByRole('button', { name: /^Cobrar \$18\.50$/ }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/sales')).toHaveLength(1));
    expect(api.callsTo('POST /api/v1/sales')[0].body).toMatchObject({
      customer_id: 'c-1',
      payment_method: 'store_credit',
    });
  });

  it('no deja cobrar en efectivo si no alcanza', async () => {
    setupApi();
    renderWithProviders(<SalesPage />);
    await searchAndAdd('Refresco');

    await userEvent.click(screen.getByRole('button', { name: /Cobrar \$18\.50/ }));
    const dialog = await screen.findByRole('dialog', { name: 'Cobrar' });
    await userEvent.type(within(dialog).getByLabelText('Efectivo recibido'), '5');

    expect(within(dialog).getByText('El efectivo no cubre el total.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /^Cobrar \$18\.50$/ })).toBeDisabled();
  });
});
