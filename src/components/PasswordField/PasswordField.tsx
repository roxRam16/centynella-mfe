import { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOffOutlined';
import { TextField } from '@/components/TextField';
import type { TextFieldProps } from '@/components/TextField';

export type PasswordFieldProps = Omit<TextFieldProps, 'type' | 'endAdornment'>;

/**
 * Campo de contraseña con botón para mostrar/ocultar (icono de ojo del diseño).
 * El botón expone su estado con `aria-pressed` y no roba el foco del tabulador del formulario.
 */
export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            edge="end"
            size="small"
            onClick={() => setVisible((current) => !current)}
            aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={visible}
            disabled={props.disabled}
          >
            {visible ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </IconButton>
        </InputAdornment>
      }
    />
  );
}
