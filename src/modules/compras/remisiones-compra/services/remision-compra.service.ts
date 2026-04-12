import { http } from "@/core/api/http";
import type {
  RemisionCompraDetail,
  RemisionCompraListItem,
} from "../types/remision-compra.types";

type GetRemisionesCompraParams = {
  selectedBodegaId: number | null;
  idCompra?: number | null;
};

export async function getRemisionesCompra({
  selectedBodegaId,
  idCompra,
}: GetRemisionesCompraParams) {
  const params: Record<string, string | number> = {};

  if (selectedBodegaId !== null) {
    params.id_bodega = selectedBodegaId;
  }

  if (idCompra !== null && idCompra !== undefined) {
    params.idCompra = idCompra;
  }

  const { data } = await http.get<RemisionCompraListItem[]>("/remisiones-compra", {
    params,
  });

  return data;
}

export async function getRemisionCompraById(id: number) {
  const { data } = await http.get<RemisionCompraDetail>(`/remisiones-compra/${id}`);
  return data;
}
