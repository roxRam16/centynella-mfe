import { useId } from 'react';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import CheckIcon from '@mui/icons-material/Check';
import { palette } from '@/theme/palette';
import { radius } from '@/theme/tokens';
import { visuallyHidden } from '@/utils/a11y';

export interface ChipSelectOption {
  value: string;
  label: string;
}

export interface ChipSelectProps {
  /** Nombre del grupo (leyenda para lectores de pantalla y texto visible). */
  label: string;
  options: readonly ChipSelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}

/**
 * Selección única con chips redondeados (alternativa visual a una lista desplegable cuando hay
 * pocas opciones). Por debajo son botones de opción nativos (`radio` dentro de un `fieldset`):
 * flechas del teclado, lectores de pantalla y formularios funcionan sin código extra.
 * La opción elegida lleva degradado de marca, texto blanco Y una marca de verificación (no solo color).
 */
export function ChipSelect({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
}: ChipSelectProps) {
  const name = useId();
  const messageId = `${name}-message`;
  const message = error ?? helperText;

  return (
    <Box
      component="fieldset"
      disabled={disabled}
      aria-describedby={message ? messageId : undefined}
      aria-invalid={Boolean(error) || undefined}
      sx={{ border: 0, m: 0, p: 0, minWidth: 0 }}
    >
      <Box
        component="legend"
        sx={{ p: 0, mb: 0.75, fontSize: '0.78125rem', fontWeight: 500, color: 'text.primary' }}
      >
        {label}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Box
              key={option.value}
              component="label"
              sx={{
                position: 'relative',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <Box
                component="input"
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                sx={visuallyHidden}
              />
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.75,
                  py: 0.625,
                  borderRadius: `${radius.full}px`,
                  fontSize: '0.8125rem',
                  fontWeight: selected ? 700 : 500,
                  border: `1px solid ${selected ? 'transparent' : palette.info.border}`,
                  color: selected ? palette.primary.contrastText : palette.neutral.textPrimary,
                  backgroundImage: selected ? palette.gradient.primary : palette.gradient.soft,
                  boxShadow: selected ? '0 4px 14px rgba(125, 88, 224, 0.35)' : 'none',
                  transition: 'box-shadow 200ms ease, transform 200ms ease',
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
                  'label:hover > &': {
                    boxShadow: disabled ? undefined : palette.gradient.glow,
                  },
                  'input:focus-visible + &': {
                    outline: `2px solid ${palette.focus.border}`,
                    outlineOffset: 2,
                  },
                }}
              >
                {selected && <CheckIcon aria-hidden sx={{ fontSize: '1rem' }} />}
                {option.label}
              </Box>
            </Box>
          );
        })}
      </Box>

      {message && (
        <FormHelperText id={messageId} error={Boolean(error)} role={error ? 'alert' : undefined}>
          {message}
        </FormHelperText>
      )}
    </Box>
  );
}
