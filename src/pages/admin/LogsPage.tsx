import { useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Alert,
  Button,
  Chip,
  DataTable,
  Dialog,
  PageHeader,
  Pagination,
  Select,
  TextField,
} from '@/components';
import type { ChipTone, Column, SelectOption } from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { listLogModules, searchLogs } from '@/services/logsService';
import type { LogEntry, LogLevel } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { formatTimestamp } from '@/utils/format';

const PAGE_SIZE = 25;

const LEVEL_OPTIONS: SelectOption[] = [
  { value: 'DEBUG', label: 'Debug y superiores' },
  { value: 'INFO', label: 'Info y superiores' },
  { value: 'WARNING', label: 'Advertencias y errores' },
  { value: 'ERROR', label: 'Solo errores' },
  { value: 'CRITICAL', label: 'Solo críticos' },
];

/** Periodos rápidos: minutos hacia atrás desde ahora. */
const PERIOD_OPTIONS: SelectOption[] = [
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

/**
 * Bitácora del sistema (solo lectura): qué pasó, en qué módulo, con qué usuario y en qué sesión.
 * Un clic en un usuario, sesión o petición filtra por él para seguir el hilo de lo ocurrido.
 */
export function LogsPage() {
  const [module, setModule] = useState('');
  const [level, setLevel] = useState<LogLevel | ''>('');
  const [period, setPeriod] = useState('');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [requestId, setRequestId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<LogEntry | null>(null);
  // ISO de "desde": se calcula al elegir el periodo o al pulsar Actualizar (nunca durante el render).
  const [since, setSince] = useState<string | undefined>(undefined);

  const q = useDebouncedValue(search.trim());
  const filters = useMemo(
    () => ({
      module,
      level,
      user_id: userId.trim(),
      session_id: sessionId.trim(),
      request_id: requestId.trim(),
      q,
      since,
      page,
      page_size: PAGE_SIZE,
    }),
    [module, level, userId, sessionId, requestId, q, since, page],
  );

  const fetchLogs = useCallback((signal: AbortSignal) => searchLogs(filters, signal), [filters]);
  const logs = useAsyncResource(fetchLogs);
  const modules = useAsyncResource(listLogModules);

  const moduleOptions = useMemo<SelectOption[]>(
    () =>
      (modules.status === 'success' ? modules.data : []).map((name) => ({
        value: name,
        label: name,
      })),
    [modules],
  );

  /** "Desde" para un periodo relativo a ahora (minutos hacia atrás). */
  const sinceFor = (minutes: string) =>
    minutes ? new Date(Date.now() - Number(minutes) * 60_000).toISOString() : undefined;

  /** Aplica un filtro y vuelve a la página 1. */
  const filterBy = (apply: () => void) => {
    apply();
    setPage(1);
  };

  const clearFilters = () => {
    setModule('');
    setLevel('');
    setPeriod('');
    setSince(undefined);
    setUserId('');
    setSessionId('');
    setRequestId('');
    setSearch('');
    setPage(1);
  };

  const idButton = (id: string | null, label: string, apply: (value: string) => void) =>
    id ? (
      <Button
        variant="text"
        title={id}
        aria-label={`Filtrar por ${label} ${id}`}
        onClick={() => filterBy(() => apply(id))}
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
      render: (row) => (
        <Stack>
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
      render: (row) => idButton(row.user_id, 'usuario', setUserId),
    },
    {
      key: 'session',
      header: 'Sesión',
      render: (row) => idButton(row.session_id, 'sesión', setSessionId),
    },
    {
      key: 'request',
      header: 'Petición',
      render: (row) => idButton(row.request_id, 'petición', setRequestId),
    },
    {
      key: 'detail',
      header: 'Detalle',
      align: 'right',
      render: (row) => (
        <Button
          variant="text"
          aria-label={`Ver detalle de ${row.event}`}
          onClick={() => setSelected(row)}
        >
          Ver
        </Button>
      ),
    },
  ];

  const rows = logs.status === 'success' ? logs.data.items : [];
  const total = logs.status === 'success' ? logs.data.total : 0;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="Bitácora"
        description="Todo lo que ocurre en el sistema, por módulo, usuario y sesión."
        actions={
          <Button
            variant="outlined"
            onClick={() => {
              setSince(sinceFor(period));
              logs.reload();
            }}
          >
            Actualizar
          </Button>
        }
      />

      <Stack spacing={2}>
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          }}
        >
          <Select
            label="Módulo"
            options={moduleOptions}
            placeholder="Todos"
            value={module}
            onChange={(event) => filterBy(() => setModule(event.target.value))}
          />
          <Select
            label="Nivel"
            options={LEVEL_OPTIONS}
            placeholder="Todos"
            value={level}
            onChange={(event) => filterBy(() => setLevel(event.target.value as LogLevel | ''))}
          />
          <Select
            label="Periodo"
            options={PERIOD_OPTIONS}
            placeholder="Todo el historial"
            value={period}
            onChange={(event) =>
              filterBy(() => {
                setPeriod(event.target.value);
                setSince(sinceFor(event.target.value));
              })
            }
          />
          <TextField
            label="Buscar en el mensaje"
            type="search"
            maxLength={100}
            value={search}
            onChange={(event) => filterBy(() => setSearch(event.target.value))}
          />
          <TextField
            label="Usuario (id)"
            maxLength={100}
            value={userId}
            onChange={(event) => filterBy(() => setUserId(event.target.value))}
          />
          <TextField
            label="Sesión (id)"
            maxLength={100}
            value={sessionId}
            onChange={(event) => filterBy(() => setSessionId(event.target.value))}
          />
          <TextField
            label="Petición (id)"
            maxLength={100}
            value={requestId}
            onChange={(event) => filterBy(() => setRequestId(event.target.value))}
          />
          <Box sx={{ alignSelf: 'end' }}>
            <Button variant="text" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </Box>
        </Box>

        {logs.status === 'error' && (
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
        )}

        <Typography variant="body2" color="text.secondary" aria-live="polite">
          {logs.status === 'success' ? `${total} evento(s)` : ' '}
        </Typography>

        <DataTable
          caption="Eventos de la bitácora"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          loading={logs.status === 'loading'}
          emptyMessage="No hay eventos que coincidan con los filtros."
        />
        <Stack sx={{ alignItems: 'center' }}>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </Stack>
      </Stack>

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
    </>
  );
}
