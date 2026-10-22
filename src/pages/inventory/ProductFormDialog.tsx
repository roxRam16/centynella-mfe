import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import { Alert, Button, Dialog, Switch, TextField } from '@/components';
import { createProduct, updateProduct } from '@/services/productsService';
import type { Product } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { productCreateSchema, productEditSchema } from '@/utils/validation';
import type { z } from 'zod';

type CreateForm = z.infer<typeof productCreateSchema>;
type EditForm = z.infer<typeof productEditSchema>;

interface ProductFormDialogProps {
  open: boolean;
  /** `null` = dar de alta un producto nuevo; un producto = editarlo. */
  product: Product | null;
  onClose: () => void;
  onSaved: (saved: Product) => void;
}

/** Dar de alta o editar un producto del catálogo. El SKU no se puede cambiar una vez creado. */
export function ProductFormDialog({ open, product, onClose, onSaved }: ProductFormDialogProps) {
  const isEdit = product !== null;
  const formId = 'product-form';
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(isEdit ? productEditSchema : productCreateSchema) as never,
    defaultValues: {
      sku: product?.sku ?? '',
      name: product?.name ?? '',
      category: product?.category ?? '',
      unit: product?.unit ?? 'pieza',
      price: product?.price ?? 0,
      quantity: product?.quantity ?? 0,
      low_stock_threshold: product?.low_stock_threshold ?? 5,
      status: product?.status ?? 'active',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      let saved: Product;
      if (isEdit) {
        const changes: EditForm = {
          name: values.name,
          category: values.category,
          unit: values.unit,
          price: values.price,
          quantity: values.quantity,
          low_stock_threshold: values.low_stock_threshold,
          status: values.status,
        };
        saved = await updateProduct(product.id, changes);
      } else {
        saved = await createProduct(values);
      }
      onSaved(saved);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar "${product.name}"` : 'Nuevo producto'}
      actions={
        <>
          <Button variant="text" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </>
      }
    >
      <Stack id={formId} component="form" spacing={2} noValidate onSubmit={onSubmit} sx={{ pt: 1 }}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <TextField
          label="SKU"
          placeholder="Ej. REFR-600"
          maxLength={40}
          disabled={isEdit}
          error={errors.sku?.message}
          {...register('sku')}
        />
        <TextField
          label="Nombre"
          maxLength={120}
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Categoría"
          maxLength={60}
          placeholder="Ej. Bebidas"
          error={errors.category?.message}
          {...register('category')}
        />
        <TextField
          label="Unidad"
          maxLength={20}
          placeholder="Ej. pieza, kg, caja"
          error={errors.unit?.message}
          {...register('unit')}
        />
        <TextField
          label="Precio"
          type="number"
          inputMode="decimal"
          step="0.01"
          error={errors.price?.message}
          {...register('price')}
        />
        <TextField
          label="Existencia"
          type="number"
          inputMode="numeric"
          error={errors.quantity?.message}
          {...register('quantity')}
        />
        <TextField
          label="Avisar cuando queden"
          type="number"
          inputMode="numeric"
          helperText="Umbral de alerta de stock bajo"
          error={errors.low_stock_threshold?.message}
          {...register('low_stock_threshold')}
        />
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Switch
              inputRef={field.ref}
              checked={field.value === 'active'}
              onChange={(event) => field.onChange(event.target.checked ? 'active' : 'discontinued')}
              onBlur={field.onBlur}
              label={field.value === 'active' ? 'Producto activo' : 'Producto descontinuado'}
            />
          )}
        />
      </Stack>
    </Dialog>
  );
}
