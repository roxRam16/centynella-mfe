import { useId } from 'react';
import type { ChangeEvent, Ref } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import NativeSelect from '@mui/material/NativeSelect';
import OutlinedInput from '@mui/material/OutlinedInput';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: readonly SelectOption[];
  value?: string;
  defaultValue?: string;
  name?: string;
  id?: string;
  /** Opción vacía inicial (p. ej. "Selecciona un rol"). Si se omite no se muestra. */
  placeholder?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLSelectElement>) => void;
  ref?: Ref<HTMLSelectElement>;
}

/**
 * Lista desplegable. Usa el `<select>` nativo (mejor accesibilidad y teclado, y en móvil abre
 * el selector del sistema) con el mismo aspecto que `TextField`.
 */
export function Select({
  label,
  options,
  placeholder,
  helperText,
  error,
  disabled,
  required,
  ref,
  id: idProp,
  onBlur,
  ...selectProps
}: SelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const messageId = `${id}-message`;
  const message = error ?? helperText;

  return (
    <FormControl fullWidth error={Boolean(error)} disabled={disabled} required={required}>
      <FormLabel htmlFor={id} sx={{ mb: 0.75 }}>
        {label}
      </FormLabel>
      <NativeSelect
        input={<OutlinedInput inputRef={ref} />}
        // `onBlur` va por inputProps: en NativeSelect su tipo es el de input/textarea, no el de select.
        inputProps={{
          id,
          onBlur,
          'aria-describedby': message ? messageId : undefined,
          'aria-invalid': error ? true : undefined,
        }}
        {...selectProps}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </NativeSelect>
      {message && (
        <FormHelperText id={messageId} role={error ? 'alert' : undefined}>
          {message}
        </FormHelperText>
      )}
    </FormControl>
  );
}
