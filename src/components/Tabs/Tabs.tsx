import { useId, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import MuiTab from '@mui/material/Tab';
import MuiTabs from '@mui/material/Tabs';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

export interface TabsProps {
  items: readonly TabItem[];
  /** Descripción del grupo para lectores de pantalla. */
  ariaLabel: string;
  /** Pestaña inicial (por defecto la primera). */
  defaultId?: string;
}

/**
 * Pestañas accesibles (roles tablist/tab/tabpanel, flechas del teclado y `aria-controls`).
 * En pantallas pequeñas las pestañas hacen scroll horizontal en lugar de romper el diseño.
 */
export function Tabs({ items, ariaLabel, defaultId }: TabsProps) {
  const baseId = useId();
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const current = items.find((item) => item.id === active) ?? items[0];

  return (
    <Box>
      <MuiTabs
        value={current?.id}
        onChange={(_event: SyntheticEvent, value: string) => setActive(value)}
        aria-label={ariaLabel}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        {items.map((item) => (
          <MuiTab
            key={item.id}
            value={item.id}
            label={item.label}
            id={`${baseId}-tab-${item.id}`}
            aria-controls={`${baseId}-panel-${item.id}`}
          />
        ))}
      </MuiTabs>
      {current && (
        <Box
          role="tabpanel"
          id={`${baseId}-panel-${current.id}`}
          aria-labelledby={`${baseId}-tab-${current.id}`}
          sx={{ pt: 3 }}
        >
          {current.content}
        </Box>
      )}
    </Box>
  );
}
