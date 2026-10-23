import { useCallback, useMemo, useState } from 'react';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import SellIcon from '@mui/icons-material/SellOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import {
  Alert,
  Button,
  Chip,
  ConfirmDialog,
  IconButton,
  ModulePage,
  RecordCard,
} from '@/components';
import type { Column, FilterField, FilterValues } from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useAuth } from '@/hooks/useAuth';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { deleteProduct, listProducts } from '@/services/productsService';
import { PERMISSIONS } from '@/services/types';
import type { Product, ProductStatus } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { formatCurrency } from '@/utils/format';
import { ProductFormDialog } from './ProductFormDialog';

/** Tamaño de página inicial (el selector ofrece 10, 20, 50 y 100). */
const DEFAULT_PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activos' },
  { value: 'discontinued', label: 'Descontinuados' },
];

/** Catálogo de productos: búsqueda, filtros, paginación, crear, editar y eliminar. */
export function InventoryPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const canCreate = hasPermission(PERMISSIONS.PRODUCTS_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.PRODUCTS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PRODUCTS_DELETE);

  const [search, setSearch] = useState('');
  const [advanced, setAdvanced] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const q = useDebouncedValue(search.trim());
  const filters = useMemo(
    () => ({
      q,
      category: advanced.category ?? '',
      status: (advanced.status ?? '') as ProductStatus | '',
      page,
      page_size: pageSize,
    }),
    [q, advanced, page, pageSize],
  );
  const fetchProducts = useCallback(
    (signal: AbortSignal) => listProducts(filters, signal),
    [filters],
  );
  const products = useAsyncResource(fetchProducts);

  const filterFields: FilterField[] = useMemo(
    () => [
      { key: 'category', label: 'Categoría', placeholder: 'Ej. Bebidas' },
      { key: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS },
    ],
    [],
  );

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteProduct(deleting.id);
      setDeleting(null);
      products.reload();
      toast.success(`Producto "${deleting.name}" eliminado correctamente`);
    } catch (error) {
      setDeleting(null);
      toast.error(getErrorMessage(error), { title: 'No se pudo eliminar el producto' });
    } finally {
      setDeleteBusy(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      key: 'product',
      header: 'Producto',
      primary: true,
      render: (row) => (
        <>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {row.sku}
          </Typography>
        </>
      ),
    },
    {
      key: 'category',
      header: 'Categoría',
      render: (row) => row.category || '—',
    },
    {
      key: 'price',
      header: 'Precio',
      render: (row) => formatCurrency(row.price),
    },
    {
      key: 'quantity',
      header: 'Existencia',
      render: (row) =>
        row.quantity <= row.low_stock_threshold ? (
          <Chip label={`${row.quantity} ${row.unit}`} tone="warning" icon={<WarningIcon />} />
        ) : (
          <Typography variant="body2">
            {row.quantity} {row.unit}
          </Typography>
        ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'active' ? (
          <Chip label="Activo" tone="success" />
        ) : (
          <Chip label="Descontinuado" tone="neutral" />
        ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      kind: 'actions',
      render: (row) => (
        <>
          {canUpdate && (
            <IconButton
              label={`Editar a ${row.name}`}
              icon={<EditIcon fontSize="small" />}
              tone="primary"
              onClick={() => setEditing(row)}
            />
          )}
          {canDelete && (
            <IconButton
              label={`Eliminar a ${row.name}`}
              icon={<DeleteIcon fontSize="small" />}
              tone="danger"
              onClick={() => setDeleting(row)}
            />
          )}
        </>
      ),
    },
  ];

  const rows = products.status === 'success' ? products.data.items : [];
  const total = products.status === 'success' ? products.data.total : 0;

  /** Tarjeta de producto (vista "Ver como tarjetas"), a la medida del mockup de referencia. */
  const renderCard = (row: Product) => (
    <RecordCard
      icon={row.status === 'active' ? <CheckCircleIcon /> : <BlockIcon />}
      iconTone={row.status === 'active' ? 'success' : 'neutral'}
      title={row.name}
      subtitle={row.category || undefined}
      badge={row.sku}
      cornerAction={
        canDelete && (
          <IconButton
            label={`Eliminar a ${row.name}`}
            icon={<DeleteIcon fontSize="small" />}
            tone="danger"
            onClick={() => setDeleting(row)}
          />
        )
      }
      metrics={
        <>
          {row.quantity <= row.low_stock_threshold ? (
            <Chip label={`${row.quantity} ${row.unit}`} tone="warning" icon={<WarningIcon />} />
          ) : (
            <Typography variant="body2">
              {row.quantity} {row.unit}
            </Typography>
          )}
          {row.status === 'active' ? (
            <Chip label="Activo" tone="success" />
          ) : (
            <Chip label="Descontinuado" tone="neutral" />
          )}
        </>
      }
      footer={
        <>
          <SellIcon fontSize="inherit" aria-hidden />
          {formatCurrency(row.price)} / {row.unit}
        </>
      }
      action={
        canUpdate
          ? {
              label: 'Editar',
              accessibleLabel: `Editar a ${row.name}`,
              onClick: () => setEditing(row),
            }
          : undefined
      }
    />
  );

  return (
    <ModulePage
      moduleKey="inventory"
      title="Inventario"
      description="Catálogo de productos: existencia, precio y estado."
      search={{
        label: 'Buscar productos',
        placeholder: 'Buscar por nombre o SKU…',
        value: search,
        onChange: (value) => {
          setSearch(value);
          setPage(1);
        },
      }}
      onNew={canCreate ? () => setEditing('new') : undefined}
      newLabel="Nuevo producto"
      onRefresh={products.reload}
      refreshing={products.status === 'loading'}
      filters={{
        fields: filterFields,
        values: advanced,
        onApply: (values) => {
          setAdvanced(values);
          setPage(1);
        },
      }}
      notice={
        products.status === 'error' && (
          <Alert
            severity="error"
            title="No se pudo cargar el catálogo"
            action={
              <Button variant="text" onClick={products.reload}>
                Reintentar
              </Button>
            }
          >
            {getErrorMessage(products.error)}
          </Alert>
        )
      }
      table={{
        caption: 'Catálogo de productos',
        columns,
        rows,
        renderCard,
        getRowId: (row) => row.id,
        getRowLabel: (row) => row.name,
        loading: products.status === 'loading',
        emptyMessage: 'No hay productos que coincidan con los filtros.',
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
      {editing !== null && (
        <ProductFormDialog
          open
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            toast.success(
              `Producto "${saved.name}" ${editing === 'new' ? 'creado' : 'actualizado'} correctamente`,
            );
            setEditing(null);
            products.reload();
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar producto"
        message={`¿Seguro que quieres eliminar "${deleting?.name ?? ''}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </ModulePage>
  );
}
