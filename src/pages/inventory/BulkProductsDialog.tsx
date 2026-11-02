import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import EditNoteIcon from '@mui/icons-material/EditNoteOutlined';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Alert, Button, Card, Chip, Dialog, Spinner, SpreadsheetGrid } from '@/components';
import type { SpreadsheetGridColumn, SpreadsheetGridHandle } from '@/components';
import type { CellValue } from 'jspreadsheet-ce';
import { useToast } from '@/hooks/useToast';
import { bulkUpsertProducts, listProducts } from '@/services/productsService';
import type { Product, ProductBulkRow, ProductBulkRowResult } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import {
  BULK_COLUMNS,
  STATUS_BY_LABEL,
  STATUS_LABELS,
  downloadProductTemplate,
  parseProductTemplateFile,
} from '@/utils/productTemplate';

interface BulkProductsDialogProps {
  open: boolean;
  onClose: () => void;
  /** Se llama cuando al menos una fila se guardó de verdad, para refrescar el catálogo. */
  onSaved: () => void;
}

type Mode = 'choose' | 'loading' | 'grid' | 'results';

/** Columnas de la cuadrícula: ID oculto (liga cada fila con su producto real) + las mismas
 * columnas visibles que la plantilla de Excel, en el mismo orden. */
const GRID_COLUMNS: SpreadsheetGridColumn[] = [
  { title: 'ID', type: 'text', width: 0 },
  ...BULK_COLUMNS.map((column) =>
    column.key === 'status'
      ? ({
          title: column.header,
          width: column.width * 8,
          type: 'dropdown',
          source: ['Activo', 'Descontinuado'],
        } satisfies SpreadsheetGridColumn)
      : ({ title: column.header, width: column.width * 8 } satisfies SpreadsheetGridColumn),
  ),
];

function productToRowValues(product: Product): (string | number)[] {
  return [
    product.id,
    ...BULK_COLUMNS.map((column) => {
      if (column.key === 'status') return STATUS_LABELS[product.status];
      const value = product[column.key as keyof Product];
      return value === null || value === undefined ? '' : (value as string | number);
    }),
  ];
}

function toCellText(value: CellValue): string | number {
  if (typeof value === 'string' || typeof value === 'number') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

interface RowOutcome {
  row: number;
  outcome: 'created' | 'updated' | 'error';
  label: string;
  error?: string;
}

type RowMapResult =
  | { kind: 'blank' }
  | { kind: 'invalid'; label: string; error: string }
  | { kind: 'valid'; label: string; payload: ProductBulkRow };

/** Convierte una fila de la cuadrícula (ID + las columnas de `BULK_COLUMNS`) en una fila para
 * `/products/bulk`. Validación mínima en el cliente: SKU y nombre son obligatorios — lo demás lo
 * valida el backend (igual que el alta de un solo producto). */
function rowToPayload(values: (string | number)[]): RowMapResult {
  const [id, sku, name, barcode, brand, category, unit, cost, price, quantity, lowStock, statusLabel, description] =
    values.map((v) => (v === undefined || v === null ? '' : v));

  const skuStr = String(sku).trim();
  const nameStr = String(name).trim();
  if (!skuStr && !nameStr) return { kind: 'blank' }; // fila en blanco (la cuadrícula siempre trae de sobra)

  const label = nameStr || skuStr || '(fila sin nombre)';
  if (!skuStr || nameStr.length < 2) {
    return {
      kind: 'invalid',
      label,
      error: 'Falta el SKU o el nombre es muy corto (mínimo 2 caracteres).',
    };
  }

  const statusKey = STATUS_BY_LABEL[String(statusLabel).trim().toLowerCase()] ?? 'active';
  return {
    kind: 'valid',
    label,
    payload: {
      id: id ? String(id) : undefined,
      sku: skuStr,
      name: nameStr,
      barcode: barcode ? String(barcode).trim() : undefined,
      brand: brand ? String(brand) : '',
      category: category ? String(category) : '',
      unit: unit ? String(unit) : 'pieza',
      cost: Number(cost) || 0,
      price: Number(price) || 0,
      quantity: Math.trunc(Number(quantity)) || 0,
      low_stock_threshold: Math.trunc(Number(lowStock)) || 5,
      status: statusKey,
      description: description ? String(description) : '',
    },
  };
}

/** Alta/edición masiva de productos: desde una plantilla de Excel o a mano, en una cuadrícula
 * que se ve y se comporta como Excel (jspreadsheet-ce). "Mejor esfuerzo": una fila mala no
 * detiene a las demás — el resumen final muestra qué pasó con cada una. */
export function BulkProductsDialog({ open, onClose, onSaved }: BulkProductsDialogProps) {
  const toast = useToast();
  const [mode, setMode] = useState<Mode>('choose');
  const [gridKey, setGridKey] = useState(0);
  const [gridData, setGridData] = useState<(string | number)[][]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rowOutcomes, setRowOutcomes] = useState<RowOutcome[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<SpreadsheetGridHandle>(null);

  const reset = () => {
    setMode('choose');
    setGridData([]);
    setFileError(null);
    setRowOutcomes([]);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const startManual = async () => {
    setMode('loading');
    try {
      // El API limita `page_size` a 100: se junta el catálogo completo página por página.
      const pageSize = 100;
      const products: Product[] = [];
      let page = 1;
      let total = Infinity;
      while (products.length < total) {
        const result = await listProducts({ page, page_size: pageSize });
        products.push(...result.items);
        total = result.total;
        if (result.items.length === 0) break;
        page += 1;
      }
      setGridData(products.map(productToRowValues));
      setGridKey((k) => k + 1);
      setMode('grid');
    } catch (error) {
      toast.error(getErrorMessage(error), { title: 'No se pudo cargar el catálogo' });
      setMode('choose');
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setFileError(null);
    setMode('loading');
    try {
      const { rows, missingColumns } = await parseProductTemplateFile(file);
      if (missingColumns.length > 0) {
        setFileError(
          `El archivo no tiene las columnas de la plantilla: ${missingColumns.join(', ')}.`,
        );
        setMode('choose');
        return;
      }
      if (rows.length === 0) {
        setFileError('El archivo no tiene filas con datos.');
        setMode('choose');
        return;
      }
      setGridData(rows.map((row) => ['', ...row.values]));
      setGridKey((k) => k + 1);
      setMode('grid');
    } catch {
      setFileError('No se pudo leer el archivo. ¿Es un .xlsx válido?');
      setMode('choose');
    }
  };

  const handleSubmit = async () => {
    const rawRows = (gridRef.current?.getData() ?? []).map((row) => row.map(toCellText));
    const localResults: RowOutcome[] = [];
    const toSend: { originalRow: number; payload: ProductBulkRow }[] = [];

    rawRows.forEach((values, index) => {
      const mapped = rowToPayload(values);
      if (mapped.kind === 'blank') return;
      if (mapped.kind === 'invalid') {
        localResults.push({ row: index, outcome: 'error', label: mapped.label, error: mapped.error });
        return;
      }
      toSend.push({ originalRow: index, payload: mapped.payload });
    });

    if (toSend.length === 0 && localResults.length === 0) {
      toast.info('No hay filas con datos para guardar.');
      return;
    }

    setSubmitting(true);
    try {
      const backendResults = toSend.length
        ? (await bulkUpsertProducts(toSend.map((r) => r.payload))).results
        : ([] as ProductBulkRowResult[]);

      const merged: RowOutcome[] = [...localResults];
      backendResults.forEach((result) => {
        const sent = toSend[result.row];
        merged.push({
          row: sent.originalRow,
          outcome: result.outcome,
          label: result.product?.name ?? sent.payload.name,
          error: result.error ?? undefined,
        });
      });
      merged.sort((a, b) => a.row - b.row);
      setRowOutcomes(merged);
      setMode('results');

      const created = merged.filter((r) => r.outcome === 'created').length;
      const updated = merged.filter((r) => r.outcome === 'updated').length;
      const failed = merged.filter((r) => r.outcome === 'error').length;
      if (created + updated > 0) {
        onSaved();
        toast.success(
          `${created} creado(s), ${updated} editado(s)${failed ? `, ${failed} con error` : ''}.`,
        );
      } else {
        toast.error('Ninguna fila se pudo guardar.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error), { title: 'No se pudo procesar la carga masiva' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Productos múltiples"
      maxWidth="lg"
      actions={
        mode === 'grid' ? (
          <>
            <Button variant="text" onClick={handleClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={() => void handleSubmit()} loading={submitting}>
              Guardar
            </Button>
          </>
        ) : (
          <Button variant="text" onClick={handleClose}>
            {mode === 'results' ? 'Cerrar' : 'Cancelar'}
          </Button>
        )
      }
    >
      {mode === 'choose' && (
        <Stack spacing={2} sx={{ pt: 1 }}>
          {fileError && <Alert severity="error">{fileError}</Alert>}
          <Card interactive padding={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <DownloadIcon color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>Desde una plantilla de Excel</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Descarga nuestra plantilla, llénala y súbela de vuelta.
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                  <Button variant="outlined" onClick={() => void downloadProductTemplate()}>
                    Descargar plantilla
                  </Button>
                  <Button variant="outlined" onClick={() => fileInputRef.current?.click()}>
                    Subir archivo lleno
                  </Button>
                </Stack>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx"
                  style={{ display: 'none' }}
                  onChange={(event) => void handleFileChange(event)}
                />
              </Box>
            </Stack>
          </Card>
          <Card padding={2}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <EditNoteIcon color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>Sin plantilla</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Abre el catálogo actual en una cuadrícula tipo Excel: agrega productos nuevos y
                  edita los que ya existen, todo en el mismo lugar.
                </Typography>
                <Button variant="outlined" onClick={() => void startManual()}>
                  Abrir cuadrícula
                </Button>
              </Box>
            </Stack>
          </Card>
        </Stack>
      )}

      {mode === 'loading' && (
        <Stack alignItems="center" sx={{ py: 6 }}>
          <Spinner label="Cargando…" showLabel />
        </Stack>
      )}

      {mode === 'grid' && (
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Escribe como en Excel: puedes pegar varias celdas a la vez, agregar filas al final y
            borrar las que no necesites. Al guardar, cada fila se procesa por su cuenta.
          </Typography>
          <Box sx={{ overflowX: 'auto' }}>
            <SpreadsheetGrid
              key={gridKey}
              ref={gridRef}
              columns={GRID_COLUMNS}
              data={gridData}
              minRows={25}
            />
          </Box>
        </Stack>
      )}

      {mode === 'results' && (
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          {rowOutcomes.map((result) => (
            <Stack
              key={result.row}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ py: 0.5 }}
            >
              {result.outcome === 'error' ? (
                <ErrorOutlineIcon color="error" fontSize="small" />
              ) : (
                <CheckCircleIcon color="success" fontSize="small" />
              )}
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {result.label}
              </Typography>
              {result.outcome === 'error' ? (
                <Chip label={result.error ?? 'Error'} tone="error" />
              ) : (
                <Chip
                  label={result.outcome === 'created' ? 'Creado' : 'Actualizado'}
                  tone="success"
                />
              )}
            </Stack>
          ))}
        </Stack>
      )}
    </Dialog>
  );
}
