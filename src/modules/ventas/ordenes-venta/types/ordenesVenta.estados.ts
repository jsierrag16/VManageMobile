import type { OrdenVentaEstado } from "./ordenesVenta.types";

export const ORDENES_VENTA_ESTADOS: OrdenVentaEstado[] = [
  { id: 1, label: "Pendiente" },
  { id: 2, label: "Aprobada" },
  { id: 3, label: "Anulada" },
];

export function getAllowedNextEstados(currentEstadoId: number): OrdenVentaEstado[] {
  if (currentEstadoId === 1) {
    return ORDENES_VENTA_ESTADOS.filter((estado) =>
      [2, 3].includes(estado.id)
    );
  }

  return [];
}