/**
 * Plantilla de Excel para la carga masiva de productos: generarla (para que la gente la llene)
 * y leerla de vuelta. Las mismas columnas, en el mismo orden, arman también la cuadrícula tipo
 * Excel de `BulkProductsDialog` — una sola fuente de verdad para ambos caminos.
 */
import ExcelJS from 'exceljs';
import type { ProductBulkRow, ProductStatus } from '@/services/types';

export interface BulkColumnDef {
  key: keyof ProductBulkRow;
  header: string;
  width: number;
  required?: boolean;
}

export const BULK_COLUMNS: readonly BulkColumnDef[] = [
  { key: 'sku', header: 'SKU', width: 16, required: true },
  { key: 'name', header: 'Nombre', width: 28, required: true },
  { key: 'barcode', header: 'Código de barras', width: 18 },
  { key: 'brand', header: 'Marca', width: 18 },
  { key: 'category', header: 'Categoría', width: 18 },
  { key: 'unit', header: 'Unidad', width: 12 },
  { key: 'cost', header: 'Costo', width: 12 },
  { key: 'price', header: 'Precio', width: 12 },
  { key: 'quantity', header: 'Existencia', width: 12 },
  { key: 'low_stock_threshold', header: 'Avisar cuando queden', width: 14 },
  { key: 'status', header: 'Estado', width: 16 },
  { key: 'description', header: 'Descripción', width: 32 },
];

export const STATUS_LABELS: Record<ProductStatus, string> = {
  active: 'Activo',
  discontinued: 'Descontinuado',
};
export const STATUS_BY_LABEL: Record<string, ProductStatus> = {
  activo: 'active',
  descontinuado: 'discontinued',
};

const STATUS_COLUMN_LETTER = 'K'; // 11.ª columna: Estado (ver BULK_COLUMNS)

function triggerDownload(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Genera y descarga la plantilla: encabezados, una fila de ejemplo y un desplegable en Estado. */
export async function downloadProductTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Productos');

  sheet.columns = BULK_COLUMNS.map((column) => ({
    header: column.header,
    key: column.key,
    width: column.width,
  }));
  sheet.getRow(1).font = { bold: true };

  sheet.addRow({
    sku: 'EJ-001',
    name: 'Producto de ejemplo',
    barcode: '',
    brand: '',
    category: '',
    unit: 'pieza',
    cost: 0,
    price: 0,
    quantity: 0,
    low_stock_threshold: 5,
    status: 'Activo',
    description: '',
  });

  // Desplegable de Estado en 200 filas (de sobra para un lote) — así no se puede escribir
  // cualquier cosa ahí por error.
  for (let row = 2; row <= 200; row += 1) {
    sheet.getCell(`${STATUS_COLUMN_LETTER}${row}`).dataValidation = {
      type: 'list',
      formulae: ['"Activo,Descontinuado"'],
      allowBlank: true,
      showErrorMessage: true,
      errorStyle: 'stop',
      error: 'Elige "Activo" o "Descontinuado".',
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  triggerDownload(buffer, 'centynella-plantilla-productos.xlsx');
}

export interface ParsedBulkRow {
  /** Número de fila EN EL ARCHIVO (para que los errores se puedan ubicar; la fila 1 es el
   * encabezado, así que la primera fila de datos es la 2). */
  sourceRow: number;
  values: (string | number)[];
}

export interface ParseTemplateResult {
  rows: ParsedBulkRow[];
  /** Encabezados esperados que no se encontraron en el archivo (la plantilla se modificó). */
  missingColumns: string[];
}

/** Lee un .xlsx ya llenado y devuelve sus filas en el mismo orden de columnas que `BULK_COLUMNS`,
 * listas para cargar en la cuadrícula (no valida reglas de negocio — eso lo hace el backend). */
export async function parseProductTemplateFile(file: File): Promise<ParseTemplateResult> {
  const workbook = new ExcelJS.Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { rows: [], missingColumns: BULK_COLUMNS.map((c) => c.header) };
  }

  const headerRow = sheet.getRow(1);
  const columnIndexByKey = new Map<string, number>();
  headerRow.eachCell((cell, colNumber) => {
    const header = String(cell.value ?? '').trim();
    const match = BULK_COLUMNS.find((c) => c.header.toLowerCase() === header.toLowerCase());
    if (match) columnIndexByKey.set(match.key, colNumber);
  });

  const missingColumns = BULK_COLUMNS.filter((c) => !columnIndexByKey.has(c.key)).map(
    (c) => c.header,
  );

  const rows: ParsedBulkRow[] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    if (row.cellCount === 0 || row.values === undefined) continue;

    const values = BULK_COLUMNS.map((column) => {
      const colIndex = columnIndexByKey.get(column.key);
      if (!colIndex) return '';
      const raw = row.getCell(colIndex).value;
      if (raw === null || raw === undefined) return '';
      if (column.key === 'status') {
        const label = String(raw).trim().toLowerCase();
        return STATUS_BY_LABEL[label] ? STATUS_LABELS[STATUS_BY_LABEL[label]] : String(raw);
      }
      if (typeof raw === 'string' || typeof raw === 'number') return raw;
      if (typeof raw === 'object') return String((raw as { result?: unknown }).result ?? '');
      return String(raw);
    });

    // Fila totalmente vacía (quedó en blanco entre datos): se ignora.
    if (values.every((v) => v === '' || v === null)) continue;
    rows.push({ sourceRow: rowNumber, values });
  }

  return { rows, missingColumns };
}
