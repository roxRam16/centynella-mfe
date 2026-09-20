import { RequirementsChecklist } from '@/components/RequirementsChecklist';
import { evaluatePasswordRules } from '@/utils/validation';

/** Checklist en vivo con los requisitos de la contraseña nueva (los mismos que valida el formulario). */
export function PasswordRequirements({ password }: { password: string }) {
  return (
    <RequirementsChecklist
      label="Requisitos de la contraseña"
      requirements={evaluatePasswordRules(password).map(({ rule, met }) => ({
        label: rule.label,
        met,
      }))}
    />
  );
}
