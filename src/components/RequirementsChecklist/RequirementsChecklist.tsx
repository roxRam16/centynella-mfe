import Box from '@mui/material/Box';
import CheckIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/RadioButtonUnchecked';
import { palette } from '@/theme/palette';
import { visuallyHidden } from '@/utils/a11y';

export interface Requirement {
  label: string;
  met: boolean;
}

export interface RequirementsChecklistProps {
  /** Nombre accesible de la lista (ej. "Requisitos de la contraseña"). */
  label: string;
  requirements: readonly Requirement[];
}

/**
 * Lista de requisitos que se marcan en vivo mientras la persona escribe (p. ej. la contraseña).
 * Cada requisito se comunica con icono + color + texto ("cumplido"/"pendiente" para lectores
 * de pantalla): nunca solo con el color.
 */
export function RequirementsChecklist({ label, requirements }: RequirementsChecklistProps) {
  return (
    <Box
      component="ul"
      aria-label={label}
      sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.5 }}
    >
      {requirements.map(({ label: text, met }) => (
        <Box
          component="li"
          key={text}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.8125rem',
            color: met ? palette.success.main : palette.neutral.textSecondary,
          }}
        >
          {met ? (
            <CheckIcon fontSize="inherit" aria-hidden />
          ) : (
            <PendingIcon fontSize="inherit" aria-hidden />
          )}
          <span>{text}</span>
          <Box component="span" sx={visuallyHidden}>
            {met ? ' — cumplido' : ' — pendiente'}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
