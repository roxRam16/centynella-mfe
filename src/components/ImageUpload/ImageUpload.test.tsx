import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { ImageUpload } from './ImageUpload';

function renderUpload(props: Partial<React.ComponentProps<typeof ImageUpload>> = {}) {
  const onChange = vi.fn();
  render(
    <ThemeProvider>
      <ImageUpload label="Foto del producto" onChange={onChange} {...props} />
    </ThemeProvider>,
  );
  return { onChange };
}

const pngFile = (name = 'foto.png', size = 100) => {
  const file = new File([new Uint8Array(size)], name, { type: 'image/png' });
  return file;
};

describe('<ImageUpload />', () => {
  it('sin foto muestra "Añadir imagen" y el icono de marcador', () => {
    renderUpload();

    expect(screen.getByRole('button', { name: 'Añadir imagen' })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('con `value` muestra la vista previa y "Cambiar imagen"', () => {
    renderUpload({ value: 'https://example.com/foto.jpg' });

    expect(screen.getByRole('button', { name: 'Cambiar imagen' })).toBeInTheDocument();
    expect(document.querySelector('img')).toHaveAttribute('src', 'https://example.com/foto.jpg');
  });

  it('al elegir un archivo válido llama a onChange con el archivo', async () => {
    const { onChange } = renderUpload();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, pngFile());

    expect(onChange).toHaveBeenCalledWith(expect.any(File));
  });

  it('rechaza un formato no soportado sin llamar a onChange', () => {
    // `userEvent.upload` respeta el `accept` del input y no deja elegir un archivo que no
    // calza; el `accept` es solo una pista del navegador, así que probamos el cinturón propio
    // (la validación de `handleChange`) disparando el evento directo, como si `accept` fallara.
    const { onChange } = renderUpload();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const textFile = new File(['hola'], 'nota.txt', { type: 'text/plain' });

    fireEvent.change(input, { target: { files: [textFile] } });

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/Formato no soportado/)).toBeInTheDocument();
  });

  it('rechaza un archivo demasiado grande sin llamar a onChange', async () => {
    const { onChange } = renderUpload({ maxBytes: 10 });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await userEvent.upload(input, pngFile('grande.png', 20));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/supera el máximo/)).toBeInTheDocument();
  });

  it('el botón de quitar llama a onChange con `null`', async () => {
    const { onChange } = renderUpload({ value: 'https://example.com/foto.jpg' });

    await userEvent.click(screen.getByRole('button', { name: 'Quitar imagen' }));

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
