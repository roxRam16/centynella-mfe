import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import ClearIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { IconButton } from '@/components/IconButton';
import { palette } from '@/theme/palette';

export interface SearchBarProps {
  /** Nombre accesible del campo (no se ve; el placeholder es solo una pista). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  /** Contenido a la derecha del campo (p. ej. filtros rápidos del módulo). */
  children?: ReactNode;
}

/**
 * Buscador principal del módulo (estilo Synapsis): barra ancha con lupa a la izquierda, texto
 * de ayuda, botón para limpiar y una zona opcional a la derecha. Ocupa todo el ancho disponible.
 * Es una región `search` para lectores de pantalla.
 */
export function SearchBar({
  label,
  value,
  onChange,
  placeholder,
  maxLength = 100,
  children,
}: SearchBarProps) {
  return (
    <Box
      role="search"
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        minHeight: '3rem',
        px: 1.5,
        gap: 1,
        backgroundColor: palette.neutral.surface,
        border: `1px solid ${palette.neutral.border}`,
        borderRadius: 1.5,
        '&:hover': { borderColor: palette.brand.iris },
        '&:focus-within': {
          borderColor: palette.focus.border,
          boxShadow: `0 0 0 3px ${palette.focus.ring}`,
        },
      }}
    >
      <SearchIcon aria-hidden sx={{ color: palette.neutral.textSecondary }} />
      <InputBase
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        slotProps={{ input: { 'aria-label': label, maxLength } }}
        sx={{
          flexGrow: 1,
          fontSize: '0.875rem',
          '& input::placeholder': { color: palette.neutral.textPlaceholder, opacity: 1 },
          // El icono nativo de "limpiar" del navegador sobra: usamos el nuestro.
          '& input::-webkit-search-cancel-button': { display: 'none' },
        }}
      />
      {value && (
        <IconButton
          label="Limpiar búsqueda"
          icon={<ClearIcon fontSize="small" />}
          onClick={() => onChange('')}
        />
      )}
      {children && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            pl: 1,
            borderLeft: `1px solid ${palette.neutral.border}`,
          }}
        >
          {children}
        </Box>
      )}
    </Box>
  );
}
