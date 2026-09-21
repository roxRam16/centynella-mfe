/**
 * Oculta un elemento a la vista pero lo deja disponible para lectores de pantalla.
 *
 * Ojo: en `sx` de MUI un número entre 0 y 1 es una FRACCIÓN (`width: 1` = 100 %), por eso los
 * tamaños van como texto ('1px'). Con 100 % el elemento ocupaba todo su contenedor y provocaba
 * barras de desplazamiento fantasma en la página y en los modales.
 */
export const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  border: 0,
  overflow: 'hidden',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
} as const;
