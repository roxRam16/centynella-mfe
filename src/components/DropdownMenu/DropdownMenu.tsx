import { useId, useState } from 'react';
import type { MouseEvent, ReactElement, ReactNode } from 'react';
import ButtonBase from '@mui/material/ButtonBase';
import CheckIcon from '@mui/icons-material/Check';
import type { SxProps, Theme } from '@mui/material/styles';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { palette } from '@/theme/palette';

export interface MenuAction {
  label: string;
  onClick: () => void;
  icon?: ReactElement;
  /** Acción destructiva (p. ej. cerrar sesión): se muestra en rojo. */
  danger?: boolean;
  /**
   * Para opciones que se excluyen entre sí (p. ej. tipo de vista): indica cuál está activa. Se
   * anuncia como `menuitemradio` y se marca con una palomita (no solo con color).
   */
  checked?: boolean;
}

export interface DropdownMenuProps {
  /** Nombre accesible del botón que abre el menú. */
  label: string;
  /** Contenido visible del botón (avatar, nombre…). */
  trigger: ReactNode;
  items: readonly MenuAction[];
  /** Estilos extra del botón que abre el menú. */
  triggerSx?: SxProps<Theme>;
}

/**
 * Botón con menú desplegable accesible (`aria-haspopup`, `aria-expanded`, navegación con
 * flechas y cierre con Escape). El menú se cierra al elegir una opción.
 */
export function DropdownMenu({ label, trigger, items, triggerSx }: DropdownMenuProps) {
  const id = useId();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = Boolean(anchor);

  const close = () => setAnchor(null);

  return (
    <>
      <ButtonBase
        onClick={(event: MouseEvent<HTMLElement>) => setAnchor(event.currentTarget)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        sx={[
          { borderRadius: 2, p: 0.5, gap: 1 },
          ...(Array.isArray(triggerSx) ? triggerSx : triggerSx ? [triggerSx] : []),
        ]}
      >
        {trigger}
      </ButtonBase>
      <Menu id={id} anchorEl={anchor} open={open} onClose={close}>
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              close();
              item.onClick();
            }}
            role={item.checked === undefined ? 'menuitem' : 'menuitemradio'}
            aria-checked={item.checked}
            sx={item.danger ? { color: palette.error.main } : undefined}
          >
            {item.icon && (
              <ListItemIcon sx={item.danger ? { color: palette.error.main } : undefined}>
                {item.icon}
              </ListItemIcon>
            )}
            {item.label}
            {item.checked && (
              <CheckIcon
                aria-hidden
                fontSize="small"
                sx={{ ml: 'auto', pl: 2, color: palette.primary.main }}
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
