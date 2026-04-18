import { http } from "@/core/api/http";
import type { AxiosRequestConfig } from "axios";
import {
  mapCatalogOption,
  mapClienteOption,
  mapFactura,
  mapRemisionPendiente,
  type ClienteOption,
  type FacturaItem,
  type PagosAbonosCatalogos,
  type RemisionPendienteItem,
} from "../types/pagosAbonos.types";

type RequestCandidate = {
  url: string;
  config?: AxiosRequestConfig;
};

export type CreateFacturaPayload = {
  id_cliente: number;
  id_remisiones: number[];
  fecha_factura: string;
  fecha_vencimiento?: string | null;
  nota?: string;
};

export type CreateAbonoPayload = {
  fecha_pago: string;
  valor: number;
  id_metodo: number;
};

const cleanParams = (params?: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params ?? {}).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

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

const getFirstSuccess = async <T = any>(
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

export async function getClientesActivos(): Promise<ClienteOption[]> {
  const response = await getFirstSuccess<any>([
    {
      url: "/clientes",
      config: {
        params: cleanParams({
          incluirInactivos: false,
        }),
      },
    },
  ]);

  return extractArray(response).map(mapClienteOption).filter((c) => c.estado);
}

export async function getPagosAbonosCatalogos(): Promise<PagosAbonosCatalogos> {
  const response = await getFirstSuccess<any>([
    { url: "/pagos-abonos/catalogos" },
  ]);

  const source = unwrapResponse(response) ?? {};

  return {
    metodosPago: extractArray(source?.metodos_pago).map(mapCatalogOption),
    estadosFactura: extractArray(source?.estados_factura).map(mapCatalogOption),
  };
}

export async function getFacturasPagosAbonos(
  idBodega?: number | null
): Promise<FacturaItem[]> {
  const response = await getFirstSuccess<any>([
    {
      url: "/pagos-abonos/facturas",
      config: {
        params: cleanParams({
          id_bodega: idBodega ?? undefined,
        }),
      },
    },
  ]);

  return extractArray(response).map(mapFactura);
}

export async function getFacturasPorCliente(
  idCliente: number,
  idBodega?: number | null
): Promise<FacturaItem[]> {
  const response = await getFirstSuccess<any>([
    {
      url: `/pagos-abonos/clientes/${idCliente}/facturas`,
      config: {
        params: cleanParams({
          id_bodega: idBodega ?? undefined,
        }),
      },
    },
  ]);

  return extractArray(response).map(mapFactura);
}

export async function getRemisionesPendientesPorCliente(
  idCliente: number,
  idBodega?: number | null
): Promise<RemisionPendienteItem[]> {
  const response = await getFirstSuccess<any>([
    {
      url: `/pagos-abonos/clientes/${idCliente}/remisiones-pendientes`,
      config: {
        params: cleanParams({
          id_bodega: idBodega ?? undefined,
        }),
      },
    },
  ]);

  return extractArray(response).map(mapRemisionPendiente);
}

export async function createFacturaDesdeRemisiones(
  payload: CreateFacturaPayload
): Promise<FacturaItem> {
  const response = await http.post("/pagos-abonos/facturas", payload);
  return mapFactura(unwrapResponse(response.data));
}

export async function addAbonoFactura(
  idFactura: number,
  payload: CreateAbonoPayload
): Promise<FacturaItem> {
  const response = await http.post(
    `/pagos-abonos/facturas/${idFactura}/abonos`,
    payload
  );

  return mapFactura(unwrapResponse(response.data));
}

export async function anularAbonoFactura(idPago: number): Promise<FacturaItem> {
  const response = await http.patch(`/pagos-abonos/abonos/${idPago}/anular`);
  const source = unwrapResponse(response.data);

  return mapFactura(source?.factura ?? source);
}