import '@testing-library/jest-dom/vitest';

// jsdom conserva localStorage entre pruebas del mismo archivo: sin esto, una preferencia que
// quede guardada (p. ej. "ver como tarjetas") se filtra a las pruebas siguientes.
afterEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    /* almacenamiento no disponible: nada que limpiar */
  }
});
