import type { Metadata } from "next";
import { scopeFor } from "@/domain/rbac";
import { requireActor } from "@/infrastructure/auth/actor";
import { permissionAdminData } from "@/infrastructure/contenedor/roles";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { Encabezado, Etiqueta, Filtros, PANEL, Vacio } from "../_ui/pagina";
import { NuevoUsuario } from "./usuarios";

export const metadata: Metadata = { title: "Configuración" };

export default async function Configuracion() {
  const actor = await requireActor();
  requireScopeInPage(actor, "settings", "view");
  const datos = await permissionAdminData(actor);
  const porRol = datos.roles.map((rol) => ({ rol, usuarios: datos.users.filter((usuario) => usuario.roleId === rol.id) }));
  const equipoDe = (id: number) => datos.teams.filter((equipo) => equipo.memberIds.includes(id) || equipo.leaderId === id).map((equipo) => equipo.name);
  const supervisa = (id: number) => datos.teams.filter((equipo) => equipo.supervisorIds.includes(id)).map((equipo) => equipo.name);

  return (
    <div className="space-y-6">
      <Encabezado titulo="Configuración" detalle={`${datos.users.length} usuarios en ${datos.roles.length} tipos de usuario`}>
        {scopeFor(actor, "users", "create") === "all" && !actor.readOnly
          ? <NuevoUsuario roles={datos.roles.map(({ id, name, slug }) => ({ id, name, slug }))} />
          : null}
      </Encabezado>

      <Filtros etiqueta="Secciones de configuración" opciones={[
        { ruta: "/configuracion", texto: "Usuarios", activa: true },
        { ruta: "/configuracion/permisos", texto: "Permisos por tipo de usuario", activa: false },
      ]} />

      {porRol.map(({ rol, usuarios }) => (
        <section key={rol.id} aria-labelledby={`rol-${rol.id}`}>
          <h2 id={`rol-${rol.id}`} className="text-lg font-semibold">{rol.name} <span className="cifra font-normal text-ink-muted">{usuarios.length}</span></h2>
          {usuarios.length === 0 ? (
            <div className="mt-3"><Vacio>Nadie tiene este tipo de usuario todavía.</Vacio></div>
          ) : (
            <ul className={`${PANEL} mt-3 divide-y divide-line`}>
              {usuarios.map((usuario) => {
                const equipos = equipoDe(usuario.id);
                const supervisados = supervisa(usuario.id);
                return (
                  <li key={usuario.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-5 py-3.5">
                    <span className="min-w-0">
                      <span className="block font-medium text-ink">{usuario.fullName}</span>
                      <span className="block text-sm text-ink-muted">
                        {[equipos.length ? `Equipo: ${equipos.join(", ")}` : null, supervisados.length ? `Supervisa: ${supervisados.join(", ")}` : null].filter(Boolean).join(". ") || "Sin equipo"}
                      </span>
                    </span>
                    {usuario.isProtected ? <Etiqueta tono="neutro">Cuenta protegida</Etiqueta> : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
