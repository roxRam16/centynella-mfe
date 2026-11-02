import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExcelJS from 'exceljs';
import { makePage } from '@/test/factories';
import { mockApi } from '@/test/mockApi';
import type { MockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { notifications } from '@/test/toasts';
import type { Product, ProductBulkRow } from '@/services/types';
import { BULK_COLUMNS } from '@/utils/productTemplate';
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

/** Responde con el resultado de cada fila según si trae `id` (edición) o no (alta): ninguna
 * prueba de este archivo necesita simular errores del backend, así que siempre "sale bien". */
const bulkOkHandler = (request: { body: unknown }) => {
  const items = (request.body as { items: ProductBulkRow[] }).items;
  return {
    status: 207,
    json: {
      results: items.map((item, row) => ({
        row,
        outcome: item.id ? 'updated' : 'created',
        product: makeProduct({ id: item.id ?? 'new-1', sku: item.sku, name: item.name }),
        error: null,
        code: null,
      })),
      created: items.filter((i) => !i.id).length,
      updated: items.filter((i) => i.id).length,
      failed: 0,
    },
  };
};

function setupApi(extra: Parameters<typeof mockApi>[0] = {}): MockApi {
  return mockApi({
    'GET /api/v1/products': () => ({ json: makePage([refresco]) }),
    'POST /api/v1/products/bulk': bulkOkHandler,
    ...extra,
  });
}

async function buildTemplateFile(rows: Record<string, string | number>[]): Promise<File> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Productos');
  sheet.columns = BULK_COLUMNS.map((column) => ({ header: column.header, key: column.key }));
  rows.forEach((row) => sheet.addRow(row));
  const buffer = await workbook.xlsx.writeBuffer();
  const file = new File([buffer as never], 'productos.xlsx');
  Object.defineProperty(file, 'arrayBuffer', { value: async () => buffer });
  return file;
}

async function openBulkDialog() {
  await userEvent.click(screen.getByRole('button', { name: 'Acciones' }));
  await userEvent.click(await screen.findByRole('menuitem', { name: /Productos múltiples/ }));
  return screen.findByRole('dialog', { name: 'Productos múltiples' });
}

describe('<BulkProductsDialog />', () => {
  it('sube una plantilla llena y da de alta las filas válidas', async () => {
    const api = setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    const dialog = await openBulkDialog();
    const file = await buildTemplateFile([
      { sku: 'NEW-1', name: 'Producto plantilla', unit: 'pieza', price: 10, quantity: 5, status: 'Activo' },
    ]);
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/products/bulk')).toHaveLength(1));
    const sentItems = api.callsTo('POST /api/v1/products/bulk')[0].body as { items: ProductBulkRow[] };
    expect(sentItems.items).toHaveLength(1);
    expect(sentItems.items[0]).toMatchObject({ sku: 'NEW-1', name: 'Producto plantilla' });
    expect(sentItems.items[0].id).toBeUndefined();

    expect(await within(dialog).findByText('Producto plantilla')).toBeInTheDocument();
    expect(within(dialog).getByText('Creado')).toBeInTheDocument();
    expect(notifications()).toHaveTextContent(/1 creado/);
  });

  it('sin plantilla: abre el catálogo y edita un producto existente', async () => {
    const api = setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    const dialog = await openBulkDialog();
    await userEvent.click(within(dialog).getByRole('button', { name: 'Abrir cuadrícula' }));

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/products/bulk')).toHaveLength(1));
    const sentItems = api.callsTo('POST /api/v1/products/bulk')[0].body as { items: ProductBulkRow[] };
    expect(sentItems.items).toHaveLength(1);
    expect(sentItems.items[0]).toMatchObject({ id: 'p-1', sku: 'ABC-001' });

    expect(within(dialog).getByText('Actualizado')).toBeInTheDocument();
  });

  it('mejor esfuerzo: una fila sin nombre no impide guardar las demás', async () => {
    const api = setupApi();
    renderWithProviders(<InventoryPage />);
    await screen.findByRole('row', { name: /Refresco de cola/ });

    const dialog = await openBulkDialog();
    const file = await buildTemplateFile([
      { sku: 'NEW-1', name: 'Producto bueno', status: 'Activo' },
      { sku: 'NEW-2', name: '', status: 'Activo' },
    ]);
    const fileInput = dialog.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await userEvent.click(await within(dialog).findByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/products/bulk')).toHaveLength(1));
    const sentItems = api.callsTo('POST /api/v1/products/bulk')[0].body as { items: ProductBulkRow[] };
    expect(sentItems.items).toHaveLength(1);
    expect(sentItems.items[0].sku).toBe('NEW-1');

    expect(await within(dialog).findByText('Producto bueno')).toBeInTheDocument();
    expect(within(dialog).getByText(/Falta el SKU o el nombre/)).toBeInTheDocument();
  });
});
