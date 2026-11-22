import type { Metadata } from "next";
import Image from "next/image";
import { empresa } from "@/infrastructure/empresa";
import { FormularioDeAcceso } from "./formulario";

export const metadata: Metadata = { title: "Acceder" };

/** Solo rutas internas: evita redirigir a otro sitio tras entrar. */
function destinoSeguro(valor: string | string[] | undefined): string {
  const destino = Array.isArray(valor) ? valor[0] : valor;
  return destino && /^\/(?!\/)[\w\-./?=&%]*$/.test(destino) ? destino : "/inicio";
}

export default async function PaginaDeAcceso({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { nombre, producto, marca } = empresa();
  const destino = destinoSeguro((await searchParams).destino);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(26rem,30rem)_1fr]">
      <main className="flex flex-col justify-between bg-surface px-6 py-8 sm:px-10 lg:border-r lg:border-line">
        <Image src={marca.logo} alt={nombre} width={160} height={148} priority className="h-16 w-auto self-start" />

        <div className="py-10">
          <h1 className="text-[1.75rem] font-semibold leading-tight">Entra a tu espacio de trabajo</h1>
          <p className="mt-2 text-ink-muted">Usa el correo y la contraseña que te dio la administración de {nombre}.</p>
          <FormularioDeAcceso destino={destino} />
        </div>

        <p className="text-sm text-ink-muted">{producto} · {nombre}</p>
      </main>

      <aside aria-hidden="true" className="relative hidden overflow-hidden bg-canvas lg:block">
        <p className="absolute bottom-10 left-12 right-12 font-display text-[clamp(4rem,9vw,8.5rem)] font-bold leading-[0.92] tracking-tight text-brand-100">
          {nombre}
        </p>
      </aside>
    </div>
  );
}
