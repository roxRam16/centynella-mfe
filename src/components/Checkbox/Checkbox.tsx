import type { ReactNode, Ref } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiCheckbox from '@mui/material/Checkbox';
import type { CheckboxProps as MuiCheckboxProps } from '@mui/material/Checkbox';

export interface CheckboxProps extends Omit<MuiCheckboxProps, 'color' | 'size' | 'ref'> {
  /** Texto clicable junto a la casilla. */
  label: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/** Casilla de verificación con etiqueta asociada (clic en el texto también la activa). */
export function Checkbox({ label, ref, ...rest }: CheckboxProps) {
  return (
    <FormControlLabel
      control={<MuiCheckbox inputRef={ref} {...rest} />}
      label={label}
      slotProps={{ typography: { variant: 'body2' } }}
    />
  );
}
