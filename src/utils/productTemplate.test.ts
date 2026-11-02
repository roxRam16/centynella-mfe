import ExcelJS from 'exceljs';
import {
  BULK_COLUMNS,
  downloadProductTemplate,
  parseProductTemplateFile,
} from './productTemplate';

/** `File.prototype.arrayBuffer` no existe en jsdom; se rellena con el buffer real del archivo. */
async function toFile(buffer: ArrayBuffer | Buffer, name = 'productos.xlsx'): Promise<File> {
  const file = new File([buffer as never], name);
  Object.defineProperty(file, 'arrayBuffer', { value: async () => buffer });
  return file;
}

describe('downloadProductTemplate', () => {
  it('descarga un .xlsx llamando a click() sobre un enlace temporal', async () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const createObjectURL = vi.fn(() => 'blob:fake');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    await downloadProductTemplate();

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake');

    clickSpy.mockRestore();
    vi.unstubAllGlobals();
  });
});

describe('parseProductTemplateFile', () => {
  async function buildWorkbookFile(
    rows: Record<string, string | number>[],
    headers: string[] = BULK_COLUMNS.map((c) => c.header),
  ): Promise<File> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Productos');
    sheet.addRow(headers);
    rows.forEach((row) => sheet.addRow(headers.map((h) => row[h] ?? '')));
    const buffer = await workbook.xlsx.writeBuffer();
    return toFile(buffer);
  }

  it('lee las filas de un archivo lleno en el mismo orden que BULK_COLUMNS', async () => {
    const file = await buildWorkbookFile([
      { SKU: 'ABC-1', Nombre: 'Agua 600ml', Estado: 'Activo' },
    ]);

    const { rows, missingColumns } = await parseProductTemplateFile(file);

    expect(missingColumns).toEqual([]);
    expect(rows).toHaveLength(1);
    const [sku, name] = rows[0].values;
    expect(sku).toBe('ABC-1');
    expect(name).toBe('Agua 600ml');
  });

  it('reporta las columnas de la plantilla que faltan', async () => {
    const file = await buildWorkbookFile([{ SKU: 'ABC-1' }], ['SKU']);

    const { missingColumns } = await parseProductTemplateFile(file);

    expect(missingColumns).toContain('Nombre');
  });

  it('ignora las filas completamente vacías', async () => {
    const file = await buildWorkbookFile([
      { SKU: 'ABC-1', Nombre: 'Agua 600ml' },
      {},
      { SKU: 'ABC-2', Nombre: 'Refresco' },
    ]);

    const { rows } = await parseProductTemplateFile(file);

    expect(rows).toHaveLength(2);
  });
});
