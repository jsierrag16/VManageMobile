import { http } from "@/core/api/http";
import type {
  TrasladoDetail,
  TrasladoListItem,
} from "../types/traslados.types";

type GetTrasladosParams = {
  selectedBodegaId: number | null;
};

export async function getTraslados({
  selectedBodegaId,
}: GetTrasladosParams): Promise<TrasladoListItem[]> {
  const { data } = await http.get<TrasladoListItem[]>("/traslados", {
    params:
      selectedBodegaId === null
        ? undefined
        : {
            id_bodega: selectedBodegaId,
          },
  });

  return Array.isArray(data) ? data : [];
}

export async function getTrasladoById(
  idTraslado: number
): Promise<TrasladoDetail> {
  const { data } = await http.get<TrasladoDetail>(`/traslados/${idTraslado}`);
  return data;
}