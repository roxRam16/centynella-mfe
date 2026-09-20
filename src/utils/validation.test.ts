import {
  PASSWORD_RULES,
  changePasswordSchema,
  emailSchema,
  evaluatePasswordRules,
  loginSchema,
  nameSchema,
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

  it.each(['ana.perez+inv@mail.example.co', 'A_b-c%d@sub.dominio.org'])('acepta "%s"', (email) => {
    expect(emailSchema.safeParse(email).success).toBe(true);
  });

  it('exige el @ con un mensaje claro', () => {
    expect(firstError(emailSchema.safeParse('sin-arroba.com'))).toBe('El correo debe incluir @');
  });

  it('exige un valor', () => {
    expect(firstError(emailSchema.safeParse(''))).toBe('Ingresa tu correo electrónico');
  });

  it.each([
    '@example.com',
    'ana@',
    'ana@example',
    'ana @example.com',
    'ana@exa mple.com',
    '<script>@example.com',
    'ana<b>@example.com',
    '"ana"@example.com',
    "o'brien@example.com",
    'ana@example..com',
    `${'a'.repeat(65)}@example.com`,
    `ana@${'a'.repeat(260)}.com`,
  ])('rechaza "%s"', (email) => {
    expect(emailSchema.safeParse(email).success).toBe(false);
  });
});

describe('newPasswordSchema (misma política que el backend)', () => {
  it('acepta una contraseña que cumple todo', () => {
    expect(newPasswordSchema.safeParse('Segura#12345').success).toBe(true);
    expect(newPasswordSchema.safeParse('<Sc#ript>alert(1)Aa9').success).toBe(true); // se guarda solo como hash
  });

  it.each([
    ['Ab#1', 'Usa al menos 8 caracteres'],
    ['sinmayuscula#1', 'Incluye al menos una mayúscula'],
    ['SINMINUSCULA#1', 'Incluye al menos una minúscula'],
    ['SinNumero#Aqui', 'Incluye al menos un número'],
    ['SinSimbolo123', 'Incluye al menos un símbolo (! @ # $ % …)'],
    ['Con Espacio#123', 'No puede contener espacios'],
    ['Tab\tulador#123', 'No puede contener espacios'],
    [`Aa#1${'x'.repeat(130)}`, 'Máximo 128 caracteres'],
  ])('rechaza "%s"', (password, message) => {
    expect(
      newPasswordSchema.safeParse(password).error?.issues.map((issue) => issue.message),
    ).toContain(message);
  });

  it('cada regla del checklist coincide con la validación', () => {
    const results = evaluatePasswordRules('Segura#123');

    expect(results).toHaveLength(PASSWORD_RULES.length);
    expect(results.every(({ met }) => met)).toBe(true);
    expect(evaluatePasswordRules('').filter(({ met }) => !met)).toHaveLength(5);
  });
});

describe('nameSchema (sin HTML ni símbolos peligrosos)', () => {
  it.each(['José Núñez', "Ana-María O'Brien", 'Dr. Ana Pérez', '李小龍', 'Zoë'])(
    'acepta "%s"',
    (name) => {
      expect(nameSchema.safeParse(name).success).toBe(true);
    },
  );

  it.each([
    '<script>alert(1)</script>',
    'Ana<b>',
    'Ana" onmouseover="alert(1)',
    'Ana; DROP TABLE users',
    '{{7*7}}',
    '$(whoami)',
    '123 Ana',
    ' A ',
    'x'.repeat(81),
  ])('rechaza "%s"', (name) => {
    expect(nameSchema.safeParse(name).success).toBe(false);
  });
});

describe('formularios', () => {
  it('login exige correo y contraseña, y acota la longitud', () => {
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x'.repeat(129) }).success).toBe(
      false,
    );
    expect(loginSchema.safeParse({ email: 'sin-arroba', password: 'x' }).success).toBe(false);
  });

  it('registro exige que las contraseñas coincidan', () => {
    const base = { name: 'Ana', email: 'ana@example.com', password: 'Segura#12345' };

    expect(registerSchema.safeParse({ ...base, confirmPassword: 'Segura#12345' }).success).toBe(
      true,
    );
    const mismatch = registerSchema.safeParse({ ...base, confirmPassword: 'Otra#12345' });
    expect(mismatch.error?.issues[0]).toMatchObject({
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    });
  });

  it('registro rechaza nombre con HTML y contraseña débil', () => {
    const invalid = registerSchema.safeParse({
      name: '<img src=x onerror=alert(1)>',
      email: 'ana@example.com',
      password: 'debil',
      confirmPassword: 'debil',
    });

    const paths = invalid.error?.issues.map((issue) => issue.path[0]);
    expect(paths).toContain('name');
    expect(paths).toContain('password');
  });

  it('restablecer y cambiar contraseña validan coincidencia', () => {
    expect(
      resetPasswordSchema.safeParse({ password: 'Segura#12345', confirmPassword: 'Distinta#1234' })
        .success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'x',
        password: 'Segura#12345',
        confirmPassword: 'Segura#12345',
      }).success,
    ).toBe(true);
  });

  it('crear usuario exige rol y estado válido', () => {
    const valid = {
      name: 'Luis',
      email: 'luis@example.com',
      password: 'Segura#12345',
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

  it.each(['name', 'description'] as const)('los roles rechazan HTML en %s', (field) => {
    const payload = {
      key: 'riesgoso',
      name: 'Rol Seguro',
      description: 'ok',
      [field]: '<img src=x onerror=alert(1)>',
    };

    expect(roleCreateSchema.safeParse(payload).success).toBe(false);
  });
});
