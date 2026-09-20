import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { Grid, GridItem } from './Grid';

describe('<Grid /> / <GridItem />', () => {
  it('renderiza los hijos dentro de la grilla', () => {
    render(
      <ThemeProvider>
        <Grid>
          <GridItem>Uno</GridItem>
          <GridItem md={6}>Dos</GridItem>
        </Grid>
      </ThemeProvider>,
    );

    expect(screen.getByText('Uno')).toBeInTheDocument();
    expect(screen.getByText('Dos')).toBeInTheDocument();
  });

  it('marca el contenedor y aplica el tamaño por breakpoint', () => {
    render(
      <ThemeProvider>
        <Grid>
          <GridItem xs={12} md={4}>
            Celda
          </GridItem>
        </Grid>
      </ThemeProvider>,
    );

    const item = screen.getByText('Celda');
    expect(item).toHaveClass('MuiGrid-root');
    expect(item.parentElement).toHaveClass('MuiGrid-container');
  });
});
