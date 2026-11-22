// Normalización de teléfonos (sin conocer a ningún CRM). El portal guarda el número sin código de país
// (el código va en otro campo) y algunos CRM rechazan el lead entero si el teléfono no es válido.
// Regla: un teléfono dudoso NUNCA hace perder el lead: se devuelve `invalido` para guardarlo como texto.
const PAIS_POR_DEFECTO = process.env.PHONE_DEFAULT_CC || "+1";

/** Devuelve { e164 } si es utilizable, { invalido: "texto original" } si no, o {} si venía vacío. */
export function normalizarTelefono(valor, codigoPais = PAIS_POR_DEFECTO) {
  const original = String(valor ?? "").trim();
  if (!original) return {};
  const soloDigitos = original.replace(/\D/g, "");
  if (original.startsWith("+")) return soloDigitos.length >= 8 && soloDigitos.length <= 15 ? { e164: "+" + soloDigitos } : { invalido: original };
  const cc = String(codigoPais).replace(/\D/g, "");
  // Plan de numeración de América del Norte (RD, EE. UU., Canadá): 10 dígitos, o 11 empezando por 1.
  if (cc === "1") {
    if (soloDigitos.length === 10) return { e164: "+1" + soloDigitos };
    if (soloDigitos.length === 11 && soloDigitos.startsWith("1")) return { e164: "+" + soloDigitos };
    return { invalido: original };
  }
  const completo = soloDigitos.startsWith(cc) ? soloDigitos : cc + soloDigitos;
  return completo.length >= 8 && completo.length <= 15 ? { e164: "+" + completo } : { invalido: original };
}
