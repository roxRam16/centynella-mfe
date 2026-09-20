import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@mui/material/Link';

interface BaseLinkProps {
  children: ReactNode;
}

interface InternalLinkProps extends BaseLinkProps {
  /** Ruta interna del shell (navegación SPA, sin recargar la página). */
  to: string;
  href?: never;
}

interface ExternalLinkProps extends BaseLinkProps {
  /** URL externa (se abre con `rel` seguro). */
  href: string;
  to?: never;
}

export type LinkProps = InternalLinkProps | ExternalLinkProps;

/** Enlace de marca (color primario, semibold, subrayado al pasar el cursor). */
export function Link({ children, to, href }: LinkProps) {
  if (to !== undefined) {
    return (
      <MuiLink component={RouterLink} to={to}>
        {children}
      </MuiLink>
    );
  }
  return (
    <MuiLink href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </MuiLink>
  );
}
