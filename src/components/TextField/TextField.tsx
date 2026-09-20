import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';

export interface TextFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'color' | 'prefix'
> {
  /** Etiqueta visible ARRIBA del campo (diseño del login). Obligatoria por accesibilidad. */
  label: string;
  helperText?: string;
  /** Mensaje de error: si existe, el campo pasa a estado de error y se anuncia al lector de pantalla. */
  error?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  /** Compatible con `register()` de react-hook-form (React 19: `ref` es una prop normal). */
  ref?: Ref<HTMLInputElement>;
}

/**
 * Campo de texto de CENTYNELLA: etiqueta arriba, borde sutil, foco violet con halo iris y
 * estado de error (borde rojo + mensaje). Asocia etiqueta, ayuda y error con ARIA.
 */
export function TextField({
  label,
  helperText,
  error,
  startAdornment,
  endAdornment,
  ref,
  id: idProp,
  required,
  disabled,
  ...inputProps
}: TextFieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const messageId = `${id}-message`;
  const message = error ?? helperText;

  return (
    <FormControl fullWidth error={Boolean(error)} required={required} disabled={disabled}>
      <FormLabel htmlFor={id} sx={{ mb: 0.75 }}>
        {label}
      </FormLabel>
      <OutlinedInput
        id={id}
        inputRef={ref}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        inputProps={{
          ...inputProps,
          'aria-describedby': message ? messageId : undefined,
          'aria-invalid': error ? true : undefined,
        }}
      />
      {message && (
        <FormHelperText id={messageId} role={error ? 'alert' : undefined}>
          {message}
        </FormHelperText>
      )}
    </FormControl>
  );
}
