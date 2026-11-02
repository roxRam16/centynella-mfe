import MuiAvatar from '@mui/material/Avatar';
import { palette } from '@/theme/palette';
import { getInitials } from '@/utils/text';

export interface AvatarProps {
  /** Nombre completo: de él salen las iniciales (si no hay foto) y la etiqueta accesible. */
  name: string;
  /** Diámetro en px. */
  size?: number;
  /** Foto (p. ej. de un producto); si falta o no carga, cae a las iniciales. */
  src?: string | null;
}

/** Avatar circular: con `src` muestra la foto; si no, iniciales en los colores de marca. */
export function Avatar({ name, size = 36, src }: AvatarProps) {
  return (
    <MuiAvatar
      aria-label={name}
      src={src ?? undefined}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 600,
        backgroundColor: palette.brand.lightPink,
        color: palette.primary.dark,
      }}
    >
      {getInitials(name)}
    </MuiAvatar>
  );
}
