import { useId, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { Button } from '@/components/Button';
import { IconButton } from '@/components/IconButton';
import { palette } from '@/theme/palette';
import { radius } from '@/theme/tokens';

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export interface ImageUploadProps {
  label: string;
  /** URL para previsualizar (la foto ya guardada, o un `blob:` local recién elegido). */
  value?: string | null;
  /** `file` = se eligió una foto nueva; `null` = se quitó. */
  onChange: (file: File | null) => void;
  error?: string;
  helperText?: string;
  accept?: string;
  /** Tamaño máximo en bytes (por defecto 5 MB); más grande se rechaza antes de subir nada. */
  maxBytes?: number;
}

/** Subir (o quitar) una foto: vista previa cuadrada + "Añadir imagen" / botón de quitar. */
export function ImageUpload({
  label,
  value,
  onChange,
  error,
  helperText,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
}: ImageUploadProps) {
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const message = localError ?? error ?? helperText;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // permite elegir el mismo archivo otra vez tras quitarlo
    if (!file) return;
    if (!accept.split(',').includes(file.type)) {
      setLocalError('Formato no soportado. Usa JPG, PNG o WEBP.');
      return;
    }
    if (file.size > maxBytes) {
      setLocalError(`La imagen supera el máximo de ${Math.round(maxBytes / (1024 * 1024))} MB.`);
      return;
    }
    setLocalError(null);
    onChange(file);
  };

  const handleRemove = () => {
    setLocalError(null);
    onChange(null);
  };

  return (
    <Box>
      <FormLabel htmlFor={inputId} sx={{ mb: 0.75, display: 'block' }}>
        {label}
      </FormLabel>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: '5rem',
            height: '5rem',
            flexShrink: 0,
            borderRadius: `${radius.medium}px`,
            border: `1px dashed ${palette.neutral.border}`,
            backgroundColor: palette.neutral.background,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {value ? (
            <Box
              component="img"
              src={value}
              alt=""
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <ImageOutlinedIcon aria-hidden sx={{ color: palette.neutral.textSecondary }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
          <Button
            type="button"
            variant="outlined"
            onClick={() => inputRef.current?.click()}
            aria-describedby={message ? messageId : undefined}
          >
            {value ? 'Cambiar imagen' : 'Añadir imagen'}
          </Button>
          {value && (
            <IconButton
              label="Quitar imagen"
              tone="danger"
              icon={<ImageOutlinedIcon fontSize="small" />}
              onClick={handleRemove}
            />
          )}
        </Box>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </Box>
      {message && (
        <FormHelperText
          id={messageId}
          role={(localError ?? error) ? 'alert' : undefined}
          sx={{ mx: 0 }}
        >
          {message}
        </FormHelperText>
      )}
    </Box>
  );
}
