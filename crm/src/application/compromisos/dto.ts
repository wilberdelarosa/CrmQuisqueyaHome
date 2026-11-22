import { can, type Actor } from "../../domain/rbac.ts";
import type { Hold, UnidadHold } from "./puertos.ts";

export type UnidadHoldDto = {
  id?: number;
  unitId: number;
  projectId: number;
  unitCode: string;
  priceVersion: number;
  /** null cuando el actor no puede ver precios reales. */
  priceCents: string | null;
  currency: "USD" | "DOP";
  componentRole: string;
};

export type HoldDto = {
  id: number;
  publicId: string;
  dealId: number;
  holderId: number;
  status: "activo" | "convertido" | "cancelado" | "expirado";
  expiresAt: string;
  policyVersion: number;
  extensionCount: number;
  reason: string;
  resolvedAt: string | null;
  rowVersion: number;
  createdAt: string;
  updatedAt: string;
  units: UnidadHoldDto[];
};

export function dtoUnidadHold(u: UnidadHold, verPrecio = true): UnidadHoldDto {
  return {
    id: u.id,
    unitId: u.unitId,
    projectId: u.projectId,
    unitCode: u.unitCodeNormalized,
    priceVersion: u.priceVersion,
    priceCents: verPrecio ? u.priceCents.toString() : null,
    currency: u.currency,
    componentRole: u.componentRole,
  };
}

export function dtoHold(actor: Actor, hold: Hold): HoldDto {
  return {
    id: hold.id,
    publicId: hold.publicId,
    dealId: hold.dealId,
    holderId: hold.holderId,
    status: hold.status,
    expiresAt: hold.expiresAt.toISOString(),
    policyVersion: hold.policyVersion,
    extensionCount: hold.extensionCount,
    reason: hold.reason,
    resolvedAt: hold.resolvedAt ? hold.resolvedAt.toISOString() : null,
    rowVersion: hold.rowVersion,
    createdAt: hold.createdAt.toISOString(),
    updatedAt: hold.updatedAt.toISOString(),
    units: (hold.units || []).map((unidad) => dtoUnidadHold(unidad, can(actor, "unit_real_price", "view"))),
  };
}

export function dtoListaHolds(actor: Actor, holds: Hold[]): HoldDto[] {
  return holds.map(h => dtoHold(actor, h));
}
