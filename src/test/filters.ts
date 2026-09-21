import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

/** Botón de la botonera que abre/cierra el filtro avanzado (su nombre suma "(n aplicados)"). */
export const filterToggle = () => screen.getByRole('button', { name: /^Filtros avanzados/ });

/** Panel del filtro avanzado ("Refina tu búsqueda"), si está abierto. */
export const filterPanel = () => screen.getByRole('form', { name: 'Refina tu búsqueda' });

/** Abre el filtro avanzado si no lo está. */
export async function openAdvancedFilter() {
  if (!screen.queryByRole('form', { name: 'Refina tu búsqueda' })) {
    await userEvent.click(filterToggle());
  }
  return filterPanel();
}

/**
 * Escribe/elige el valor de un campo del filtro avanzado (abriendo el panel y el campo si hace
 * falta). No pulsa "Buscar": llamar a `applyAdvancedFilter()` después.
 */
export async function setAdvancedFilter(label: string, value: string) {
  const panel = await openAdvancedFilter();
  const escaped = label.replace(/[()[\]\\.*+?^${}|]/g, '\\$&');
  const header = within(panel).getByRole('button', { name: new RegExp(`^${escaped}`) });
  if (header.getAttribute('aria-expanded') === 'false') await userEvent.click(header);

  const select = within(panel).queryByRole('combobox', { name: label });
  if (select) {
    await userEvent.selectOptions(select, value);
  } else {
    const input = within(panel).getByRole('textbox', { name: label });
    await userEvent.clear(input);
    await userEvent.type(input, value);
  }
}

/** Pulsa "Buscar" del filtro avanzado. */
export async function applyAdvancedFilter() {
  await userEvent.click(within(filterPanel()).getByRole('button', { name: 'Buscar' }));
}
