import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold">Esta página no existe</h1>
      <p className="mt-3 text-text">Puede que el enlace esté incompleto o que el registro ya no esté disponible.</p>
      <Link href="/inicio" className="mt-6 inline-flex h-11 items-center self-start rounded-control bg-brand-900 px-5 font-semibold text-white hover:bg-brand-950">
        Volver a Inicio
      </Link>
    </div>
  );
}
