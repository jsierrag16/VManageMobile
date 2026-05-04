import type { AxiosRequestConfig } from "axios";
import { http } from "@/core/api/http";
import {
  mapRemisionVenta,
  mapRemisionVentaDetail,
  type RemisionVentaDetail,
  type RemisionVentaItem,
} from "../types/remisionesVenta.types";

export type { RemisionVentaItem, RemisionVentaDetail };

export type GetRemisionesVentaParams = {
  page?: number;
  limit?: number;
  q?: string;
  idBodega?: number | null;
  includeRefs?: boolean;
};

const DEFAULT_LIMIT = 1000;

type RequestCandidate = {
  url: string;
  config?: AxiosRequestConfig;
};

const cleanParams = (params?: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
};

const unwrapResponse = (raw: any) => {
  if (raw == null) return raw;
  if (Array.isArray(raw)) return raw;
  if (typeof raw !== "object") return raw;

  if ("data" in raw && raw.data != null) return raw.data;
  if ("payload" in raw && raw.payload != null) return raw.payload;
  if ("result" in raw && raw.result != null) return raw.result;

  return raw;
};

const extractArray = <T = any>(raw: any): T[] => {
  const source = unwrapResponse(raw);

  if (Array.isArray(source)) return source;
  if (Array.isArray(source?.data)) return source.data;
  if (Array.isArray(source?.items)) return source.items;
  if (Array.isArray(source?.results)) return source.results;
  if (Array.isArray(source?.rows)) return source.rows;

  return [];
};

const getRequestFirstSuccess = async <T = any>(
  candidates: RequestCandidate[]
): Promise<T> => {
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      const response = await http.get<T>(candidate.url, candidate.config);
      return response.data;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

export const getRemisionesVenta = async (
  params: GetRemisionesVentaParams = {}
): Promise<RemisionVentaItem[]> => {
  const queryParams = cleanParams({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIMIT,
    q: params.q,
    id_bodega: params.idBodega ?? undefined,
    idBodega: params.idBodega ?? undefined,
    includeRefs: params.includeRefs ?? true ? "true" : undefined,
  });

  const raw = await getRequestFirstSuccess<any>([
    { url: "/ventas/remisiones-venta", config: { params: queryParams } },
    { url: "/remisiones-venta", config: { params: queryParams } },
    { url: "/remision-venta", config: { params: queryParams } },
  ]);

  return extractArray(raw).map(mapRemisionVenta);
};

export const getRemisionVentaById = async (
  id: number
): Promise<RemisionVentaDetail> => {
  const raw = await getRequestFirstSuccess<any>([
    {
      url: `/ventas/remisiones-venta/${id}`,
      config: { params: { includeRefs: "true" } },
    },
    {
      url: `/remisiones-venta/${id}`,
      config: { params: { includeRefs: "true" } },
    },
    {
      url: `/remision-venta/${id}`,
      config: { params: { includeRefs: "true" } },
    },
    { url: `/ventas/remisiones-venta/${id}` },
    { url: `/remisiones-venta/${id}` },
    { url: `/remision-venta/${id}` },
  ]);

  return mapRemisionVentaDetail(unwrapResponse(raw));
};