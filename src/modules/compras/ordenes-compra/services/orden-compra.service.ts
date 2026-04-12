import { http } from "@/core/api/http";
import type { CompraDetail, CompraListItem } from "../types/ordenes-compra.types";

type GetComprasParams = {
  selectedBodegaId: number | null;
  soloAprobadas?: boolean;
};

export async function getCompras({
  selectedBodegaId,
  soloAprobadas = false,
}: GetComprasParams) {
  const params: Record<string, string | number> = {};

  if (selectedBodegaId !== null) {
    params.id_bodega = selectedBodegaId;
  }

  if (soloAprobadas) {
    params.solo_aprobadas = "true";
  }

  const { data } = await http.get<CompraListItem[]>("/compras", {
    params,
  });

  return data;
}

export async function getCompraById(id: number) {
  const { data } = await http.get<CompraDetail>(`/compras/${id}`);
  return data;
}
