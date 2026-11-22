import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getActor } from "@/infrastructure/auth/actor";
import { hasSupabaseSessionCookie } from "@/infrastructure/auth/session-cookie";
import { perfilDeSesion, rolesDeEvaluacion } from "@/infrastructure/contenedor/sesion";
import { empresa } from "@/infrastructure/empresa";
import { evaluationLoginAllowed, mostrarModulosEnRevision } from "@/infrastructure/env";
import { AvisoDeConexion } from "./_armazon/aviso-de-conexion";
import { BarraLateral } from "./_armazon/barra-lateral";
import { BarraMovil } from "./_armazon/barra-movil";
import { Icono } from "./_armazon/icono";
import { menuPara } from "./_armazon/navegacion";

/**
 * Armazón del CRM: una sola estructura con dos presentaciones. En escritorio, barra de marca a la
 * izquierda; en móvil, cabecera clara y barra inferior como una app. El contenido es el mismo.
 */
export default async function ArmazonDelCrm({ children }: { children: ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const perfil = await perfilDeSesion(actor);
  if (!perfil) redirect("/login");

  const datosEmpresa = empresa();
  const menu = menuPara(actor, mostrarModulosEnRevision());
  // Sesión de evaluación: el entorno la permite Y no hay una sesión real abierta (misma regla que el middleware).
  const sesionDeEvaluacion = evaluationLoginAllowed((await headers()).get("host"))
    && !hasSupabaseSessionCookie((await cookies()).getAll());
  const evaluacion = sesionDeEvaluacion ? { roles: await rolesDeEvaluacion(), actual: actor.roleSlug } : null;

  return (
    <div className="min-h-dvh lg:pl-rail">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:text-ink">
        Ir al contenido
      </a>
      <BarraLateral empresa={datosEmpresa} perfil={perfil} menu={menu} evaluacion={evaluacion} />
      <BarraMovil
        empresa={{ nombre: datosEmpresa.nombre, isotipo: datosEmpresa.marca.isotipo }}
        perfil={perfil}
        evaluacion={evaluacion}
        disponibles={menu.disponibles.map((entrada) => ({
          id: entrada.id, ruta: entrada.ruta, nombre: entrada.nombre, enRevision: entrada.estado === "en_revision",
          icono: <Icono nombre={entrada.icono} className="h-5 w-5" />,
        }))}
        pendientes={menu.pendientes.map(({ id, nombre }) => ({ id, nombre }))}
        iconoMas={<Icono nombre="Menu" className="h-5 w-5" />}
      />
      <AvisoDeConexion />
      <main id="contenido" className="mx-auto w-full max-w-[82rem] px-4 pb-[calc(var(--spacing-dock)+env(safe-area-inset-bottom)+1.5rem)] pt-5 sm:px-6 lg:px-10 lg:pb-12 lg:pt-9">
        {children}
      </main>
    </div>
  );
}
