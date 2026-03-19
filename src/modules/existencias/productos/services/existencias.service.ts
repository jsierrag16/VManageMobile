import { http } from "@/core/api/http";
import type { ProductoVista } from "../types/existencias.types";

type GetProductosVistaParams = {
  selectedBodegaId: number | null;
};

export async function getProductosVista({
  selectedBodegaId,
}: GetProductosVistaParams) {
  const params =
    selectedBodegaId === null
      ? { scope: "all" }
      : { scope: "active", id_bodega: selectedBodegaId };

  const { data } = await http.get<ProductoVista[]>("/existencias/productos-vista", {
    params,
  });

  return data;
}