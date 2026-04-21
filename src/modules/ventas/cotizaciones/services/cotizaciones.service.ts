import type { AxiosRequestConfig } from "axios";
import { http } from "@/core/api/http";
import {
  mapCotizacion,
  mapCotizacionDetail,
  type CotizacionDetail,
  type CotizacionItem,
} from "../types/cotizaciones.types";

export type { CotizacionItem, CotizacionDetail };

export type GetCotizacionesParams = {
  page?: number;
  limit?: number;
  q?: string;
  idBodega?: number | null;
  includeRefs?: boolean;
};

type RequestCandidate = {
  url: string;
  config?: AxiosRequestConfig;
};

const DEFAULT_LIMIT = 1000;

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

export const getCotizaciones = async (
  params: GetCotizacionesParams = {}
): Promise<CotizacionItem[]> => {
  const queryParams = cleanParams({
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIMIT,
    q: params.q,
    id_bodega: params.idBodega ?? undefined,
    idBodega: params.idBodega ?? undefined,
    includeRefs: params.includeRefs ?? true ? "true" : undefined,
  });

  const raw = await getRequestFirstSuccess<any>([
    { url: "/ventas/cotizaciones", config: { params: queryParams } },
    { url: "/cotizaciones", config: { params: queryParams } },
    { url: "/cotizacion", config: { params: queryParams } },
  ]);

  return extractArray(raw).map(mapCotizacion);
};

export const getCotizacionById = async (
  id: number
): Promise<CotizacionDetail> => {
  const raw = await getRequestFirstSuccess<any>([
    {
      url: `/ventas/cotizaciones/${id}`,
      config: { params: { includeRefs: "true" } },
    },
    {
      url: `/cotizaciones/${id}`,
      config: { params: { includeRefs: "true" } },
    },
    {
      url: `/cotizacion/${id}`,
      config: { params: { includeRefs: "true" } },
    },
    { url: `/ventas/cotizaciones/${id}` },
    { url: `/cotizaciones/${id}` },
    { url: `/cotizacion/${id}` },
  ]);

  return mapCotizacionDetail(unwrapResponse(raw));
};