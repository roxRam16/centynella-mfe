import type { ReactNode, Ref } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import MuiSwitch from '@mui/material/Switch';
import type { SwitchProps as MuiSwitchProps } from '@mui/material/Switch';

export interface SwitchProps extends Omit<MuiSwitchProps, 'color' | 'size' | 'ref'> {
  /** Texto clicable junto al interruptor. Conviene que diga el estado ("Activo" / "Deshabilitado"). */
  label: ReactNode;
  ref?: Ref<HTMLInputElement>;
}

/**
 * Interruptor de encendido/apagado (rol `switch`): pista gris al apagar y con degradado de marca
 * al encender. El estado no depende solo del color: la posición de la perilla y el texto de la
 * etiqueta también lo indican. Compatible con `react-hook-form` (`Controller`).
 */
export function Switch({ label, ref, ...rest }: SwitchProps) {
  return (
    <FormControlLabel
      control={<MuiSwitch inputRef={ref} {...rest} />}
      label={label}
      slotProps={{ typography: { variant: 'body2' } }}
      sx={{ alignSelf: 'flex-start', ml: 0, gap: 1 }}
    />
  );
}
