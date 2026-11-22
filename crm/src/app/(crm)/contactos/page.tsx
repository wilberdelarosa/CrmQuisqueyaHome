import type { Metadata } from "next";
import Link from "next/link";
import { consultarListadoContactos, TAMANIO_PAGINA_CONTACTOS } from "@/application/contactos/consultas";
import { requireActor } from "@/infrastructure/auth/actor";
import { contactosParaLectura } from "@/infrastructure/contenedor/contactos";
import { empresa } from "@/infrastructure/empresa";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { fechaCorta } from "../_ui/formato";
import { BOTON_SECUNDARIO, Encabezado, PANEL, Vacio } from "../_ui/pagina";

export const metadata: Metadata = { title: "Contactos" };

const uno = (valor: string | string[] | undefined) => (Array.isArray(valor) ? valor[0] : valor);

export default async function Contactos({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireActor();
  const alcance = requireScopeInPage(actor, "contacts", "view");
  const params = await searchParams;
  const q = (uno(params.q) ?? "").slice(0, 80);
  const pagina = Math.max(1, Math.min(500, Number(uno(params.pagina)) || 1));
  const { contactos, total } = await consultarListadoContactos(contactosParaLectura(), actor, alcance, { q, pagina, incluirBrokers: false });
  const regional = empresa();
  const paginas = Math.max(1, Math.ceil(total / TAMANIO_PAGINA_CONTACTOS));
  const ruta = (numero: number) => `/contactos?${new URLSearchParams({ ...(q ? { q } : {}), pagina: String(numero) })}`;

  return (
    <div className="space-y-6">
      <Encabezado titulo="Contactos" detalle={`${total} ${total === 1 ? "persona" : "personas"} en tu cartera`} />

      <form action="/contactos" className="flex max-w-md gap-2" role="search">
        <label className="sr-only" htmlFor="buscar-contacto">Buscar por nombre, teléfono o correo</label>
        <input id="buscar-contacto" name="q" type="search" defaultValue={q} placeholder="Buscar por nombre, teléfono o correo"
          className="h-11 min-w-0 flex-1 rounded-control border border-input-line bg-surface px-3 text-ink" />
        <button type="submit" className={BOTON_SECUNDARIO}>Buscar</button>
      </form>

      {contactos.length === 0 ? (
        <Vacio>{q ? "Ningún contacto coincide con la búsqueda." : "Aún no hay contactos. Se crean solos cuando llega un lead."}</Vacio>
      ) : (
        <ul className={`${PANEL} divide-y divide-line`}>
          {contactos.map((contacto) => (
            <li key={contacto.id} className="grid gap-x-6 gap-y-1 px-5 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)] sm:items-center">
              <span className="min-w-0">
                <span className="block truncate font-medium text-ink">{contacto.fullName}</span>
                <span className="block truncate text-sm text-ink-muted">{contacto.sourceName ?? "Origen sin registrar"}</span>
              </span>
              <span className="min-w-0 text-sm">
                <span className="block truncate text-text">{contacto.phoneDisplay ?? contacto.phone ?? "Sin teléfono"}</span>
                <span className="block truncate text-ink-muted">{contacto.email ?? "Sin correo"}</span>
              </span>
              <span className="min-w-0 text-sm">
                <span className="block truncate text-text">{contacto.brokerName ?? "Sin responsable"}</span>
                <span className="block truncate text-ink-muted">
                  {contacto.lastInteractionAt ? `Último contacto ${fechaCorta(contacto.lastInteractionAt, regional)}` : "Sin contacto registrado"}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {paginas > 1 ? (
        <nav aria-label="Páginas" className="flex items-center gap-3">
          {pagina > 1 ? <Link href={ruta(pagina - 1)} className={BOTON_SECUNDARIO}>Anterior</Link> : null}
          <span className="text-sm text-ink-muted">Página {pagina} de {paginas}</span>
          {pagina < paginas ? <Link href={ruta(pagina + 1)} className={BOTON_SECUNDARIO}>Siguiente</Link> : null}
        </nav>
      ) : null}
    </div>
  );
}
