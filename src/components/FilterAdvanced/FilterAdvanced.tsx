import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Collapse from '@mui/material/Collapse';
import NativeSelect from '@mui/material/NativeSelect';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Button } from '@/components/Button';
import type { SelectOption } from '@/components/Select';
import { palette } from '@/theme/palette';
import { visuallyHidden } from '@/utils/a11y';

export interface FilterField {
  /** Clave del valor dentro de `FilterValues`. */
  key: string;
  label: string;
  /** `text` (por defecto) o `select` (requiere `options`). */
  type?: 'text' | 'select';
  options?: readonly SelectOption[];
  /** Texto de la opción vacía de un `select` (por defecto "Todos"). */
  placeholder?: string;
  maxLength?: number;
}

/** Valores de los filtros por clave. Un filtro vacío simplemente no aparece. */
export type FilterValues = Record<string, string>;

export interface FilterAdvancedProps {
  fields: readonly FilterField[];
  /** Filtros ya aplicados (lo que está buscando el módulo ahora). */
  values: FilterValues;
  onApply: (values: FilterValues) => void;
  title?: string;
}

/** Quita los filtros vacíos y los espacios sobrantes. */
const clean = (values: FilterValues): FilterValues =>
  Object.fromEntries(
    Object.entries(values)
      .map(([key, value]) => [key, value.trim()] as const)
      .filter(([, value]) => value !== ''),
  );

/**
 * Filtro avanzado ("Refina tu búsqueda", estilo Synapsis): un panel con un campo por fila; cada
 * fila se despliega para escribir o elegir el valor. "Buscar" (o Enter) aplica todo junto y
 * "Restaurar" lo limpia. Cada módulo decide QUÉ campos muestra (`fields`): así el buscador
 * principal queda simple y lo demás vive aquí, oculto hasta activarlo con el botón de filtro.
 */
export function FilterAdvanced({
  fields,
  values,
  onApply,
  title = 'Refina tu búsqueda',
}: FilterAdvancedProps) {
  const baseId = useId();
  const [draft, setDraft] = useState<FilterValues>(values);
  const [seen, setSeen] = useState(values);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(
    () => new Set(fields.filter((field) => values[field.key]).map((field) => field.key)),
  );

  // Si los filtros aplicados cambian desde fuera (p. ej. un clic en una celda), el borrador los sigue.
  if (values !== seen) {
    setSeen(values);
    setDraft(values);
  }

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onApply(clean(draft));
  };

  const restore = () => {
    setDraft({});
    onApply({});
  };

  return (
    <Box
      component="form"
      aria-label={title}
      onSubmit={submit}
      noValidate
      sx={{
        backgroundColor: palette.neutral.surface,
        border: `1px solid ${palette.neutral.border}`,
        borderRadius: 1.5,
        overflow: 'hidden',
      }}
    >
      <Typography
        component="h2"
        variant="h3"
        sx={{
          px: 2,
          py: 1.5,
          fontSize: '0.9375rem',
          borderBottom: `1px solid ${palette.neutral.border}`,
        }}
      >
        {title}
      </Typography>

      {fields.map((field) => {
        const isOpen = expanded.has(field.key);
        const value = draft[field.key] ?? '';
        const panelId = `${baseId}-${field.key}`;
        const selectedLabel =
          field.type === 'select'
            ? (field.options?.find((option) => option.value === value)?.label ?? value)
            : value;

        return (
          <Box key={field.key} sx={{ borderBottom: `1px solid ${palette.neutral.border}` }}>
            <Box component="h3" sx={{ m: 0 }}>
              <ButtonBase
                onClick={() => toggle(field.key)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  gap: 1,
                  px: 2,
                  py: 1.25,
                  textAlign: 'left',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  fontWeight: value ? 700 : 500,
                  color: palette.neutral.textPrimary,
                  '&:hover': { backgroundColor: palette.brand.lightBlue },
                  '&.Mui-focusVisible': {
                    outline: `2px solid ${palette.focus.border}`,
                    outlineOffset: -2,
                  },
                }}
              >
                <span>{field.label}</span>
                <Box
                  component="span"
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}
                >
                  {value && !isOpen && (
                    <>
                      <Box
                        component="span"
                        aria-hidden
                        sx={{
                          width: '0.5rem',
                          height: '0.5rem',
                          flexShrink: 0,
                          borderRadius: '50%',
                          backgroundImage: palette.gradient.primary,
                        }}
                      />
                      <Typography
                        component="span"
                        variant="caption"
                        noWrap
                        sx={{ maxWidth: '7rem', color: palette.neutral.textSecondary }}
                      >
                        <Box component="span" sx={visuallyHidden}>
                          Filtro activo:{' '}
                        </Box>
                        {selectedLabel}
                      </Typography>
                    </>
                  )}
                  <ExpandMoreIcon
                    aria-hidden
                    sx={{
                      color: palette.neutral.textSecondary,
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 150ms',
                      '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                    }}
                  />
                </Box>
              </ButtonBase>
            </Box>
            <Collapse in={isOpen} unmountOnExit id={panelId}>
              <Box sx={{ px: 2, pb: 1.5 }}>
                {field.type === 'select' ? (
                  <NativeSelect
                    fullWidth
                    value={value}
                    onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                    input={<OutlinedInput />}
                    inputProps={{ 'aria-label': field.label }}
                  >
                    <option value="">{field.placeholder ?? 'Todos'}</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </NativeSelect>
                ) : (
                  <OutlinedInput
                    fullWidth
                    value={value}
                    placeholder={field.placeholder}
                    onChange={(event) => setDraft({ ...draft, [field.key]: event.target.value })}
                    inputProps={{ 'aria-label': field.label, maxLength: field.maxLength ?? 100 }}
                  />
                )}
              </Box>
            </Collapse>
          </Box>
        );
      })}

      <Box sx={{ display: 'flex', gap: 1, p: 2 }}>
        <Button variant="outlined" onClick={restore} sx={{ flex: 1 }}>
          Restaurar
        </Button>
        <Button type="submit" sx={{ flex: 1 }}>
          Buscar
        </Button>
      </Box>
    </Box>
  );
}
