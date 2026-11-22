import type { Metadata } from "next";
import { PERMISSION_ACTIONS, PERMISSION_RESOURCES } from "@/domain/catalogs";
import { requireActor } from "@/infrastructure/auth/actor";
import { permissionAdminData } from "@/infrastructure/contenedor/roles";
import { requireScopeInPage } from "@/infrastructure/page-guard";
import { Encabezado, Filtros } from "../../_ui/pagina";
import { MatrizDePermisos } from "./matriz";

export const metadata: Metadata = { title: "Permisos" };

export default async function Permisos({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireActor();
  requireScopeInPage(actor, "settings", "view");
  const datos = await permissionAdminData(actor);
  const pedido = (await searchParams).rol;
  const rol = datos.roles.find((candidato) => candidato.slug === (Array.isArray(pedido) ? pedido[0] : pedido)) ?? datos.roles.find((candidato) => !candidato.isProtected) ?? datos.roles[0];

  return (
    <div className="space-y-6">
      <Encabezado titulo="Permisos por tipo de usuario" volver={{ ruta: "/configuracion", texto: "Configuración" }}
        detalle="Qué puede ver y hacer cada tipo de usuario, y sobre qué datos: los propios, los de su equipo o todos." />

      <Filtros etiqueta="Tipo de usuario" opciones={datos.roles.map((candidato) => ({
        ruta: `/configuracion/permisos?rol=${candidato.slug}`, texto: candidato.name, activa: candidato.id === rol?.id,
        cantidad: datos.users.filter((usuario) => usuario.roleId === candidato.id).length,
      }))} />

      {rol ? (
        <MatrizDePermisos key={rol.id}
          rol={{ id: rol.id, nombre: rol.name, protegido: rol.isProtected }}
          recursos={[...PERMISSION_RESOURCES]} acciones={[...PERMISSION_ACTIONS]}
          permisos={datos.permissions.filter((permiso) => permiso.roleId === rol.id).map(({ resource, action, scope }) => ({ resource, action, scope }))}
          editable={actor.roleSlug === "admin" && !actor.readOnly} />
      ) : null}
    </div>
  );
}
