import type { ReactElement } from 'react';
import MuiChip from '@mui/material/Chip';
import { palette } from '@/theme/palette';

/** Tono del chip. Los estados usan color + texto (+ icono opcional), nunca solo color. */
export type ChipTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

export interface ChipProps {
  label: string;
  tone?: ChipTone;
  icon?: ReactElement;
  /** Si se pasa, el chip es una entrada eliminable ("Input chip" de la guía). */
  onDelete?: () => void;
}

const TONES: Record<ChipTone, { bg: string; fg: string; border: string }> = {
  neutral: {
    bg: palette.neutral.background,
    fg: palette.neutral.textPrimary,
    border: palette.neutral.border,
  },
  primary: { bg: palette.brand.lightPink, fg: palette.primary.dark, border: palette.brand.iris },
  success: { bg: palette.success.bg, fg: palette.success.main, border: palette.success.border },
  warning: { bg: palette.warning.bg, fg: palette.warning.main, border: palette.warning.border },
  error: { bg: palette.error.bg, fg: palette.error.main, border: palette.error.border },
  info: { bg: palette.info.bg, fg: palette.info.main, border: palette.info.border },
};

/** Etiqueta compacta para estados, roles y filtros. */
export function Chip({ label, tone = 'neutral', icon, onDelete }: ChipProps) {
  const { bg, fg, border } = TONES[tone];

  return (
    <MuiChip
      label={label}
      icon={icon}
      onDelete={onDelete}
      size="small"
      variant="outlined"
      sx={{
        backgroundColor: bg,
        color: fg,
        borderColor: border,
        '& .MuiChip-icon, & .MuiChip-deleteIcon': { color: fg },
      }}
    />
  );
}
