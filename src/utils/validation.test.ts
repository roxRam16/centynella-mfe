import {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  newPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  roleCreateSchema,
  userCreateSchema,
} from './validation';

const firstError = (result: { success: boolean; error?: { issues: { message: string }[] } }) =>
  result.error?.issues[0]?.message;

describe('emailSchema', () => {
  it('acepta un correo válido y lo recorta', () => {
    expect(emailSchema.parse('  ana@example.com ')).toBe('ana@example.com');
  });

  it.each([
    ['', 'Ingresa tu correo electrónico'],
    ['no-es-correo', 'Ingresa un correo válido'],
  ])('rechaza "%s"', (value, message) => {
    expect(firstError(emailSchema.safeParse(value))).toBe(message);
  });
});

describe('newPasswordSchema (misma política que el backend)', () => {
  it('acepta 8+ caracteres con letra y número', () => {
    expect(newPasswordSchema.safeParse('Segura12345').success).toBe(true);
  });

  it.each([
    ['corta1', 'Usa al menos 8 caracteres'],
    ['soloLetrasAqui', 'Incluye al menos un número'],
    ['1234567890', 'Incluye al menos una letra'],
  ])('rechaza "%s"', (value, message) => {
    expect(firstError(newPasswordSchema.safeParse(value))).toBe(message);
  });
});

describe('formularios', () => {
  it('login exige correo y contraseña', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });

  it('registro exige que las contraseñas coincidan', () => {
    const base = { name: 'Ana', email: 'ana@example.com', password: 'Segura12345' };

    expect(registerSchema.safeParse({ ...base, confirmPassword: 'Segura12345' }).success).toBe(
      true,
    );
    const mismatch = registerSchema.safeParse({ ...base, confirmPassword: 'Otra12345' });
    expect(mismatch.error?.issues[0]).toMatchObject({
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    });
  });

  it('restablecer y cambiar contraseña validan coincidencia', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'Segura12345', confirmPassword: 'Distinta1234' })
        .success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'x',
        password: 'Segura12345',
        confirmPassword: 'Segura12345',
      }).success,
    ).toBe(true);
  });

  it('crear usuario exige rol y estado válido', () => {
    const valid = {
      name: 'Luis',
      email: 'luis@example.com',
      password: 'Segura12345',
      role: 'viewer',
      status: 'active',
    };

    expect(userCreateSchema.safeParse(valid).success).toBe(true);
    expect(userCreateSchema.safeParse({ ...valid, role: '' }).success).toBe(false);
    expect(userCreateSchema.safeParse({ ...valid, status: 'raro' }).success).toBe(false);
  });

  it.each(['Auditor', '1auditor', 'a', 'con espacio'])(
    'la clave de rol "%s" es inválida',
    (key) => {
      expect(roleCreateSchema.safeParse({ key, name: 'Rol', description: '' }).success).toBe(false);
    },
  );

  it('acepta una clave de rol válida', () => {
    expect(
      roleCreateSchema.safeParse({ key: 'auditor-1', name: 'Auditor', description: '' }).success,
    ).toBe(true);
  });
});
