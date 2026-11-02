import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { SpreadsheetGrid } from './SpreadsheetGrid';
import type { SpreadsheetGridHandle } from './SpreadsheetGrid';

describe('<SpreadsheetGrid />', () => {
  it('dibuja los encabezados de las columnas', () => {
    render(<SpreadsheetGrid columns={[{ title: 'SKU' }, { title: 'Nombre' }]} data={[]} />);

    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('expone los datos iniciales por `getData()`', () => {
    const ref = createRef<SpreadsheetGridHandle>();
    render(
      <SpreadsheetGrid
        ref={ref}
        columns={[{ title: 'SKU' }, { title: 'Nombre' }]}
        data={[['ABC-1', 'Agua']]}
        minRows={3}
      />,
    );

    const rows = ref.current?.getData() ?? [];
    expect(rows[0]).toEqual(['ABC-1', 'Agua']);
  });
});
