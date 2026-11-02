import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { applyAdvancedFilter, setAdvancedFilter } from '@/test/filters';
import { makePage, makeProfile } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import type { MockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { notifications } from '@/test/toasts';
import type { Product } from '@/services/types';
import { InventoryPage } from './InventoryPage';

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
  created_at: '2026-10-01T10:00:00Z',
  updated_at: '2026-10-01T10:00:00Z',
  ...overrides,
});

const refresco = makeProduct();
const jabon = makeProduct({
  id: 'p-2',
  sku: 'XYZ-002',
  name: 'Jabón en barra',
  category: 'Limpieza',
  quantity: 2,
  low_stock_threshold: 5,
});

function setupApi(extra: Parameters<typeof mockApi>[0] = {}): MockApi {
  return mockApi({
    'GET /api/v1/products': () => ({ json: makePage([refresco, jabon]) }),
    ...extra,
  });
}

const rowOf = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

afterEach(() => vi.unstubAllGlobals());

describe('<InventoryPage />', () => {
  it('lista los productos con su SKU, precio y existencia', async () => {
    setupApi();
    renderWithProviders(<InventoryPage />);

    const row = await screen.findByRole('row', { name: /Refresco de cola/ });
    expect(within(row).getByText('ABC-001')).toBeInTheDocument();
    expect(within(row).getByText(/18\.50/)).toBeInTheDocument();
    expect(within(row).getByText('Bebidas')).toBeInTheDocument();
  });

  it('marca con una alerta (chip + icono) solo el producto bajo su umbral de stock', async () => {
    setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    const lowStock = within(rowOf('Jabón en barra')).getByText('2 pieza');
    const normal = within(rowOf('Refresco de cola')).getByText('24 pieza');
    // El de bajo stock es un Chip (icono + color); el normal es texto plano, no un chip.
    expect(lowStock.closest('.MuiChip-root')).not.toBeNull();
    expect(normal.closest('.MuiChip-root')).toBeNull();
  });

  it('muestra la foto del producto como miniatura en la tabla', async () => {
    setupApi({
      'GET /api/v1/products': () => ({
        json: makePage([makeProduct({ image_url: '/media/products/p-1.png' })]),
      }),
    });
    renderWithProviders(<InventoryPage />);

    const row = await screen.findByRole('row', { name: /Refresco de cola/ });
    expect(within(row).getByRole('img')).toHaveAttribute(
      'src',
      expect.stringContaining('/media/products/p-1.png'),
    );
  });

  it('crea un producto desde el diálogo', async () => {
    const api = setupApi({
      'POST /api/v1/products': () => ({
        status: 201,
        json: makeProduct({ id: 'p-3', sku: 'NEW-1' }),
      }),
    });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' });
    await userEvent.type(within(dialog).getByLabelText('SKU'), 'new-1');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Producto nuevo');
    await userEvent.clear(within(dialog).getByLabelText('Precio'));
    await userEvent.type(within(dialog).getByLabelText('Precio'), '12.5');
    await userEvent.clear(within(dialog).getByLabelText('Existencia'));
    await userEvent.type(within(dialog).getByLabelText('Existencia'), '10');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/products')).toHaveLength(1));
    expect(api.callsTo('POST /api/v1/products')[0].body).toMatchObject({
      sku: 'NEW-1',
      name: 'Producto nuevo',
      price: 12.5,
      quantity: 10,
    });
    expect(await screen.findByRole('region', { name: 'Notificaciones' })).toHaveTextContent(
      /creado correctamente/,
    );
  });

  it('crea un producto con código de barras, marca, costo y descripción', async () => {
    const api = setupApi({
      'POST /api/v1/products': () => ({
        status: 201,
        json: makeProduct({ id: 'p-3', sku: 'NEW-1' }),
      }),
    });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' });
    await userEvent.type(within(dialog).getByLabelText('SKU'), 'new-1');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Producto nuevo');
    await userEvent.type(within(dialog).getByLabelText('Código de barras'), '7501234567890');
    await userEvent.type(within(dialog).getByLabelText('Marca'), 'Coca-Cola');
    await userEvent.clear(within(dialog).getByLabelText('Costo'));
    await userEvent.type(within(dialog).getByLabelText('Costo'), '8.5');
    await userEvent.type(within(dialog).getByLabelText('Descripción'), 'Botella de vidrio.');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/products')).toHaveLength(1));
    expect(api.callsTo('POST /api/v1/products')[0].body).toMatchObject({
      barcode: '7501234567890',
      brand: 'Coca-Cola',
      cost: 8.5,
      description: 'Botella de vidrio.',
    });
  });

  it('un código de barras inválido muestra el error en el campo', async () => {
    setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' });
    await userEvent.type(within(dialog).getByLabelText('SKU'), 'new-1');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Producto nuevo');
    await userEvent.type(within(dialog).getByLabelText('Código de barras'), 'abc');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear producto' }));

    expect(await within(dialog).findByText('De 6 a 20 dígitos')).toBeInTheDocument();
  });

  it('sube la foto al crear un producto', async () => {
    const api = setupApi({
      'POST /api/v1/products': () => ({
        status: 201,
        json: makeProduct({ id: 'p-3', sku: 'NEW-1' }),
      }),
      'POST /api/v1/products/p-3/image': () => ({
        json: makeProduct({ id: 'p-3', sku: 'NEW-1', image_url: '/media/products/p-3.png' }),
      }),
    });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' });
    await userEvent.type(within(dialog).getByLabelText('SKU'), 'new-1');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Producto nuevo');
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
    const photo = new File([new Uint8Array(10)], 'foto.png', { type: 'image/png' });
    await userEvent.upload(fileInput, photo);
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear producto' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/products/p-3/image')).toHaveLength(1));
  });

  it('el SKU no se puede editar', async () => {
    setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Refresco de cola 600ml' }));
    const dialog = await screen.findByRole('dialog', { name: /Editar/ });

    expect(within(dialog).getByLabelText('SKU')).toBeDisabled();
  });

  it('edita la existencia de un producto', async () => {
    const api = setupApi({
      'PATCH /api/v1/products/p-1': () => ({ json: { ...refresco, quantity: 5 } }),
    });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Refresco de cola 600ml' }));
    const dialog = await screen.findByRole('dialog', { name: /Editar/ });
    await userEvent.clear(within(dialog).getByLabelText('Existencia'));
    await userEvent.type(within(dialog).getByLabelText('Existencia'), '5');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(api.callsTo('PATCH /api/v1/products/p-1')).toHaveLength(1));
    expect(api.callsTo('PATCH /api/v1/products/p-1')[0].body).toMatchObject({ quantity: 5 });
  });

  it('elimina un producto tras confirmar', async () => {
    const api = setupApi({ 'DELETE /api/v1/products/p-1': () => undefined });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(
      screen.getByRole('button', { name: 'Eliminar a Refresco de cola 600ml' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Eliminar producto' });
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(api.callsTo('DELETE /api/v1/products/p-1')).toHaveLength(1));
    expect(notifications()).toHaveTextContent(/eliminado correctamente/);
  });

  it('muestra el error si no se puede crear (SKU repetido)', async () => {
    setupApi({ 'POST /api/v1/products': () => problem(409, 'sku_taken', 'x') });
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo producto' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo producto' });
    await userEvent.type(within(dialog).getByLabelText('SKU'), 'ABC-001');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Repetido');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear producto' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/x/);
  });

  it('filtra por categoría y estado desde el filtro avanzado', async () => {
    const api = setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await setAdvancedFilter('Categoría', 'Limpieza');
    await setAdvancedFilter('Estado', 'active');
    await applyAdvancedFilter();

    await waitFor(() =>
      expect(api.callsTo('GET /api/v1/products').at(-1)?.url.searchParams.get('category')).toBe(
        'Limpieza',
      ),
    );
    expect(api.callsTo('GET /api/v1/products').at(-1)?.url.searchParams.get('status')).toBe(
      'active',
    );
  });

  it('busca por nombre o SKU con retraso', async () => {
    const api = setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar productos' }), 'jabón');

    await waitFor(() =>
      expect(api.callsTo('GET /api/v1/products').at(-1)?.url.searchParams.get('q')).toBe('jabón'),
    );
  });

  it('muestra 10 productos por página por defecto', async () => {
    const api = setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    expect(api.callsTo('GET /api/v1/products')[0].url.searchParams.get('page_size')).toBe('10');
  });

  it('muestra el error de carga y permite reintentar', async () => {
    let attempts = 0;
    setupApi({
      'GET /api/v1/products': () =>
        ++attempts === 1 ? problem(500, 'boom', 'x') : { json: makePage([refresco]) },
    });
    renderWithProviders(<InventoryPage />);

    expect(await screen.findByText('No se pudo cargar el catálogo')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('row', { name: /Refresco de cola/ })).toBeInTheDocument();
  });

  it('oculta las acciones que no se pueden realizar', async () => {
    setupApi();
    renderWithProviders(<InventoryPage />, {
      auth: { user: makeProfile({ permissions: ['products:read'] }) },
    });

    const row = await screen.findByRole('row', { name: /Refresco de cola/ });
    expect(screen.queryByRole('button', { name: 'Nuevo producto' })).not.toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /Editar/ })).not.toBeInTheDocument();
    expect(within(row).queryByRole('button', { name: /Eliminar/ })).not.toBeInTheDocument();
  });
});
