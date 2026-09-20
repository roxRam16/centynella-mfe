import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { Pagination } from './Pagination';

const renderPagination = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Pagination />', () => {
  it('no se muestra con una sola página', () => {
    renderPagination(<Pagination page={1} pageCount={1} onChange={() => {}} />);

    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('marca la página actual y notifica el cambio', async () => {
    const onChange = vi.fn();
    renderPagination(<Pagination page={1} pageCount={3} onChange={onChange} />);

    expect(screen.getByRole('button', { name: /page 1/i })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(screen.getByRole('button', { name: /page 2/i }));

    expect(onChange).toHaveBeenCalledWith(2);
  });
});
