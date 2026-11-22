import { Circle, icons, type LucideProps } from "lucide-react";

/** Icono por nombre del registro de módulos. Componente de servidor: la tabla de iconos no viaja al navegador. */
export function Icono({ nombre, ...props }: { nombre: string } & LucideProps) {
  const Componente = icons[nombre as keyof typeof icons] ?? Circle;
  return <Componente aria-hidden="true" strokeWidth={1.75} {...props} />;
}
