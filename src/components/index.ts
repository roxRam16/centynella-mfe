/**
 * Librería de componentes propia de CENTYNELLA (sobre MUI).
 * Toda la app —y los remotes— importan de aquí, nunca de MUI directamente,
 * para mantener consistencia visual y poder cambiar de librería en un solo lugar.
 * Al crear un componente reutilizable nuevo: carpeta propia + index.ts + prueba, y exportarlo aquí.
 */

// Acciones
export { Button } from './Button';
export type { ButtonProps, ButtonShape, ButtonVariant } from './Button';
export { GoogleButton } from './GoogleButton';
export type { GoogleButtonProps } from './GoogleButton';
export { Link } from './Link';
export type { LinkProps } from './Link';

// Formularios
export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';
export { PasswordField } from './PasswordField';
export type { PasswordFieldProps } from './PasswordField';
export { Select } from './Select';
export type { SelectOption, SelectProps } from './Select';
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

// Feedback y estados
export { Alert } from './Alert';
export type { AlertProps, AlertSeverity } from './Alert';
export { Spinner } from './Spinner';
export type { SpinnerProps } from './Spinner';
export { Chip } from './Chip';
export type { ChipProps, ChipTone } from './Chip';
export { Dialog, ConfirmDialog } from './Dialog';
export type { DialogProps, ConfirmDialogProps } from './Dialog';
export { DropdownMenu } from './DropdownMenu';
export type { DropdownMenuProps, MenuAction } from './DropdownMenu';

// Estructura y datos
export { Card } from './Card';
export type { CardProps } from './Card';
export { Grid, GridItem } from './Grid';
export type { GridProps, GridItemProps, GridSpan } from './Grid';
export { Tabs } from './Tabs';
export type { TabItem, TabsProps } from './Tabs';
export { DataTable } from './DataTable';
export type { Column, DataTableProps } from './DataTable';
export { Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';
export { PageHeader } from './PageHeader';
export type { PageHeaderProps } from './PageHeader';

// Identidad
export { Logo } from './Logo';
export type { LogoProps } from './Logo';
export { Avatar } from './Avatar';
export type { AvatarProps } from './Avatar';
