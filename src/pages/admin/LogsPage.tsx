import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import { Alert, Button, Chip, Dialog, IconButton, ModulePage } from '@/components';
import type { ChipTone, Column, FilterField, FilterValues } from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { listLogModules, searchLogs } from '@/services/logsService';
import type { LogEntry, LogLevel } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { formatTimestamp } from '@/utils/format';

/** Tamaño de página inicial (el selector ofrece 10, 20, 50 y 100). */
const DEFAULT_PAGE_SIZE = 10;

const LEVEL_OPTIONS = [
  { value: 'DEBUG', label: 'Debug y superiores' },
  { value: 'INFO', label: 'Info y superiores' },
  { value: 'WARNING', label: 'Advertencias y errores' },
  { value: 'ERROR', label: 'Solo errores' },
  { value: 'CRITICAL', label: 'Solo críticos' },
];

/** Periodos rápidos: minutos hacia atrás desde ahora. */
const PERIOD_OPTIONS = [
  { value: '15', label: 'Últimos 15 minutos' },
  { value: '60', label: 'Última hora' },
  { value: '1440', label: 'Últimas 24 horas' },
  { value: '10080', label: 'Últimos 7 días' },
];

const LEVEL_TONE: Record<LogLevel, ChipTone> = {
  DEBUG: 'neutral',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'error',
};

/** Ids largos: se muestran los 8 primeros y el resto va en el `title`. */
const shortId = (id: string) => (id.length > 10 ? `${id.slice(0, 8)}…` : id);

/** "Desde" para un periodo relativo a ahora (minutos hacia atrás). Se llama desde manejadores. */
const sinceFor = (minutes: string | undefined) =>
  minutes ? new Date(Date.now() - Number(minutes) * 60_000).toISOString() : undefined;

/**
 * Bitácora del sistema (solo lectura) sobre la plantilla `ModulePage`: buscador principal por
 * mensaje; módulo, nivel, periodo y los ids de usuario, sesión y petición viven en el filtro
 * avanzado. Un clic en un usuario, sesión o petición filtra por él para seguir el hilo.
 */
export function LogsPage() {
  const [search, setSearch] = useState('');
  const [advanced, setAdvanced] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  // ISO de "desde": se calcula al aplicar el periodo o al pulsar Actualizar (nunca durante el render).
  const [since, setSince] = useState<string | undefined>(undefined);

  const q = useDebouncedValue(search.trim());
  const filters = useMemo(
    () => ({
      module: advanced.module ?? '',
      level: (advanced.level ?? '') as LogLevel | '',
      user_id: advanced.user_id ?? '',
      session_id: advanced.session_id ?? '',
      request_id: advanced.request_id ?? '',
      q,
      since,
      page,
      page_size: pageSize,
    }),
    [advanced, q, since, page, pageSize],
  );

  const fetchLogs = useCallback((signal: AbortSignal) => searchLogs(filters, signal), [filters]);
  const logs = useAsyncResource(fetchLogs);
  const modules = useAsyncResource(listLogModules);

  const moduleOptions = useMemo(
    () =>
      (modules.status === 'success' ? modules.data : []).map((name) => ({
        value: name,
        label: name,
      })),
    [modules],
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      { key: 'module', label: 'Módulo', type: 'select', options: moduleOptions },
      { key: 'level', label: 'Nivel', type: 'select', options: LEVEL_OPTIONS },
      {
        key: 'period',
        label: 'Periodo',
        type: 'select',
        options: PERIOD_OPTIONS,
        placeholder: 'Todo el historial',
      },
      { key: 'user_id', label: 'Usuario (id)' },
      { key: 'session_id', label: 'Sesión (id)' },
      { key: 'request_id', label: 'Petición (id)' },
    ],
    [moduleOptions],
  );

  const applyFilters = (values: FilterValues) => {
    setAdvanced(values);
    setSince(sinceFor(values.period));
    setPage(1);
  };

  /** Un clic en un id filtra por él, conservando el resto de los filtros. */
  const filterById = (key: string, id: string) => applyFilters({ ...advanced, [key]: id });

  const idButton = (id: string | null, label: string, key: string) =>
    id ? (
      <Button
        variant="text"
        title={id}
        aria-label={`Filtrar por ${label} ${id}`}
        onClick={() => filterById(key, id)}
        sx={{ fontFamily: 'monospace', fontSize: '0.75rem', px: 0.5, minHeight: 0 }}
      >
        {shortId(id)}
      </Button>
    ) : (
      <Typography variant="caption" color="text.secondary">
        —
      </Typography>
    );

  const columns: Column<LogEntry>[] = [
    {
      key: 'time',
      header: 'Fecha',
      render: (row) => (
        <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
          {formatTimestamp(row.timestamp)}
        </Typography>
      ),
    },
    {
      key: 'level',
      header: 'Nivel',
      render: (row) => <Chip label={row.level} tone={LEVEL_TONE[row.level]} />,
    },
    { key: 'module', header: 'Módulo', render: (row) => row.module },
    {
      key: 'message',
      header: 'Evento',
      primary: true,
      render: (row) => (
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="body2">{row.message}</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {row.event}
          </Typography>
        </Stack>
      ),
    },
    {
      key: 'user',
      header: 'Usuario',
      render: (row) => idButton(row.user_id, 'usuario', 'user_id'),
    },
    {
      key: 'session',
      header: 'Sesión',
      render: (row) => idButton(row.session_id, 'sesión', 'session_id'),
    },
    {
      key: 'request',
      header: 'Petición',
      render: (row) => idButton(row.request_id, 'petición', 'request_id'),
    },
    {
      key: 'detail',
      header: 'Detalle',
      align: 'right',
      kind: 'actions',
      render: (row) => (
        <IconButton
          label={`Ver detalle de ${row.event}`}
          icon={<VisibilityIcon fontSize="small" />}
          tone="primary"
          onClick={() => setSelected(row)}
        />
      ),
    },
  ];

  const rows = logs.status === 'success' ? logs.data.items : [];
  const total = logs.status === 'success' ? logs.data.total : 0;

  return (
    <ModulePage
      moduleKey="logs"
      title="Bitácora"
      description="Todo lo que ocurre en el sistema, por módulo, usuario y sesión."
      search={{
        label: 'Buscar en el mensaje',
        placeholder: 'Buscar en el mensaje del evento…',
        value: search,
        onChange: (value) => {
          setSearch(value);
          setPage(1);
        },
      }}
      onRefresh={() => {
        setSince(sinceFor(advanced.period));
        logs.reload();
      }}
      refreshing={logs.status === 'loading'}
      filters={{ fields: filterFields, values: advanced, onApply: applyFilters }}
      notice={
        logs.status === 'error' && (
          <Alert
            severity="error"
            title="No se pudo cargar la bitácora"
            action={
              <Button variant="text" onClick={logs.reload}>
                Reintentar
              </Button>
            }
          >
            {getErrorMessage(logs.error)}
          </Alert>
        )
      }
      table={{
        caption: 'Eventos de la bitácora',
        columns,
        rows,
        getRowId: (row) => row.id,
        getRowLabel: (row) => row.event,
        loading: logs.status === 'loading',
        emptyMessage: 'No hay eventos que coincidan con los filtros.',
        pagination: {
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        },
      }}
    >
      <Dialog
        open={selected !== null}
        title="Detalle del evento"
        maxWidth="md"
        onClose={() => setSelected(null)}
        actions={<Button onClick={() => setSelected(null)}>Cerrar</Button>}
      >
        {selected && (
          <Stack spacing={1.5}>
            <Typography variant="body2">
              <strong>{selected.message}</strong>
            </Typography>
            {/* React escapa el contenido: aunque un evento traiga HTML se muestra como texto. */}
            <Box
              component="pre"
              tabIndex={0}
              aria-label="Datos del evento en formato JSON"
              sx={{
                m: 0,
                p: 2,
                overflow: 'auto',
                maxHeight: 360,
                fontSize: '0.75rem',
                borderRadius: 1,
                backgroundColor: 'background.default',
              }}
            >
              {JSON.stringify(
                {
                  fecha: selected.timestamp,
                  nivel: selected.level,
                  servicio: selected.service,
                  modulo: selected.module,
                  evento: selected.event,
                  ambiente: selected.environment,
                  usuario: selected.user_id,
                  sesion: selected.session_id,
                  peticion: selected.request_id,
                  ip: selected.ip,
                  detalles: selected.details,
                },
                null,
                2,
              )}
            </Box>
          </Stack>
        )}
      </Dialog>
    </ModulePage>
  );
}
