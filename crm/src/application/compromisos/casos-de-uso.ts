import { createHash } from "node:crypto";
import { ForbiddenError } from "../../domain/errors.ts";
import { reaches, type Actor, type PermissionScope } from "../../domain/rbac.ts";
import type { UnidadDeTrabajo } from "../compartido/unidad-de-trabajo.ts";
import type {
  EntradaCancelarHold,
  EntradaCrearHold,
  EntradaExtenderHold,
  Hold,
  ReposCompromisos,
} from "./puertos.ts";

export type DepsCompromisos = {
  unidad: UnidadDeTrabajo<ReposCompromisos>;
};

export async function crearHold(
  deps: DepsCompromisos,
  actor: Actor,
  scope: PermissionScope,
  entrada: Omit<EntradaCrearHold, "actorId" | "requestHash" | "puedeOperarNegocio">,
): Promise<Hold> {
  // Apartar a nombre de otro solo vale si ese titular está al alcance del actor.
  if (entrada.holderId !== undefined && entrada.holderId !== actor.userId && !reaches(actor, scope, entrada.holderId)) {
    throw new ForbiddenError("No puedes apartar a nombre de ese usuario.");
  }
  const canonicalPayload = JSON.stringify({
    operacion: "HOLD_CREAR",
    dealId: entrada.dealId,
    holderId: entrada.holderId ?? actor.userId,
    units: entrada.units
      .map(u => ({
        unitId: u.unitId,
        priceVersion: u.priceVersion,
        priceCents: u.priceCents?.toString() ?? null,
        currency: u.currency ?? null,
        componentRole: u.componentRole,
      }))
      .sort((a, b) => a.unitId - b.unitId),
    reason: entrada.reason,
    policyVersion: entrada.policyVersion ?? 1,
    durationHours: entrada.durationHours ?? 48,
  });
  const requestHash = createHash("sha256").update(canonicalPayload).digest("hex");

  return deps.unidad.ejecutar(async ({ compromisos }) => {
    return compromisos.crearHold({
      ...entrada,
      holderId: entrada.holderId ?? actor.userId,
      actorId: actor.userId,
      requestHash,
      puedeOperarNegocio: (brokerId) => reaches(actor, scope, brokerId),
    });
  });
}

export async function extenderHold(
  deps: DepsCompromisos,
  actor: Actor,
  scope: PermissionScope,
  id: number | string,
  entrada: Omit<EntradaExtenderHold, "id" | "actorId" | "requestHash" | "puedeOperarNegocio">,
): Promise<Hold> {
  const canonicalPayload = JSON.stringify({
    operacion: "HOLD_EXTENDER",
    id,
    expectedVersion: entrada.expectedVersion,
    reason: entrada.reason,
    additionalHours: entrada.additionalHours ?? 24,
  });
  const requestHash = createHash("sha256").update(canonicalPayload).digest("hex");

  return deps.unidad.ejecutar(async ({ compromisos }) => {
    return compromisos.extenderHold({
      ...entrada,
      id,
      actorId: actor.userId,
      requestHash,
      puedeOperarNegocio: (brokerId) => reaches(actor, scope, brokerId),
    });
  });
}

export async function cancelarHold(
  deps: DepsCompromisos,
  actor: Actor,
  scope: PermissionScope,
  id: number | string,
  entrada: Omit<EntradaCancelarHold, "id" | "actorId" | "requestHash" | "puedeOperarNegocio">,
): Promise<Hold> {
  const canonicalPayload = JSON.stringify({
    operacion: "HOLD_CANCELAR",
    id,
    expectedVersion: entrada.expectedVersion,
    reason: entrada.reason,
  });
  const requestHash = createHash("sha256").update(canonicalPayload).digest("hex");

  return deps.unidad.ejecutar(async ({ compromisos }) => {
    return compromisos.cancelarHold({
      ...entrada,
      id,
      actorId: actor.userId,
      requestHash,
      puedeOperarNegocio: (brokerId) => reaches(actor, scope, brokerId),
    });
  });
}
