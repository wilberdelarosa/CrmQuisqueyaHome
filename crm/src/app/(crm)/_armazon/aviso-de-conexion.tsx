"use client";

import { useSyncExternalStore } from "react";

function suscribir(avisar: () => void) {
  window.addEventListener("online", avisar);
  window.addEventListener("offline", avisar);
  return () => {
    window.removeEventListener("online", avisar);
    window.removeEventListener("offline", avisar);
  };
}

/** Estado «sin conexión» del armazón: avisa que lo visible puede estar desactualizado. */
export function AvisoDeConexion() {
  const enLinea = useSyncExternalStore(suscribir, () => navigator.onLine, () => true);
  if (enLinea) return null;
  return (
    <p role="status" className="bg-warning-bg px-4 py-2 text-center text-sm font-medium text-warning">
      Sin conexión. Lo que ves puede estar desactualizado. Espera a que vuelva antes de guardar: lo que envíes ahora no se guarda.
    </p>
  );
}
