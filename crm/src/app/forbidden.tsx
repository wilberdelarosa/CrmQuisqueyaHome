import Link from "next/link";

/** Estado «sin permiso»: 403 real (`requireScopeInPage`). Dice qué pasó y cómo seguir. */
export default function SinPermiso() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold">Tu rol no tiene acceso a esta sección</h1>
      <p className="mt-3 text-text">
        Si la necesitas para tu trabajo, pídele a la administración que revise tus permisos.
      </p>
      <Link href="/inicio" className="mt-6 inline-flex h-11 items-center self-start rounded-control bg-brand-900 px-5 font-semibold text-white hover:bg-brand-950">
        Volver a Inicio
      </Link>
    </div>
  );
}
