import MuiAvatar from '@mui/material/Avatar';
import { palette } from '@/theme/palette';
import { getInitials } from '@/utils/text';

export interface AvatarProps {
  /** Nombre completo: de él salen las iniciales y la etiqueta accesible. */
  name: string;
  /** Diámetro en px. */
  size?: number;
}

/** Avatar circular con iniciales, en los colores de marca. */
export function Avatar({ name, size = 36 }: AvatarProps) {
  return (
    <MuiAvatar
      aria-label={name}
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
