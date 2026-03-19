import type { Bodega } from "../types/bodega.types";
import { http } from "@/core/api/http";

type GetBodegasParams = {
  q?: string;
  estado?: "true" | "false";
};

type BodegasApiResponse =
  | Bodega[]
  | {
      page: number;
      limit: number;
      total: number;
      pages: number;
      data: Bodega[];
    };

export async function getBodegas(
  params?: GetBodegasParams
): Promise<Bodega[]> {
  const response = await http.get<BodegasApiResponse>("/bodega", {
    params: {
      includeMunicipio: "true",
      ...(params?.q?.trim() ? { q: params.q.trim() } : {}),
      ...(params?.estado ? { estado: params.estado } : {}),
    },
  });

  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return Array.isArray(payload?.data) ? payload.data : [];
}