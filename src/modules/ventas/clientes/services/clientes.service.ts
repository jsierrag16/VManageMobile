// import { http } from "@/core/api/http";
// import type { ClienteDetail, ClienteListItem } from "../types/clientes.types";

// type GetClientesParams = {
//   search?: string;
// };

// export const clientesService = {
//   async getAll(params?: GetClientesParams): Promise<ClienteListItem[]> {
//     const { data } = await http.get("/clientes", {
//       params: {
//         q: params?.search || undefined,
//       },
//     });

//     return data?.data ?? data ?? [];
//   },

//   async getById(id: number): Promise<ClienteDetail> {
//     const { data } = await http.get(`/clientes/${id}`);
//     return data?.data ?? data;
//   },
// };

import { http } from "@/core/api/http";
import type { ClienteDetail, ClienteListItem } from "../types/clientes.types";

type GetClientesParams = {
  search?: string;
};

function pickString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
    if (typeof value === "number") {
      return String(value);
    }
  }
  return null;
}

function normalizeCliente(raw: any): ClienteDetail {
  return {
    id: Number(
      raw?.id ??
        raw?.id_cliente ??
        raw?.cliente_id ??
        0
    ),
    codigo: pickString(
      raw?.codigo,
      raw?.codigo_cliente
    ),
    nombre:
      pickString(
        raw?.nombre,
        raw?.nombre_cliente,
        raw?.razon_social,
        raw?.cliente
      ) || "Sin nombre",
    tipoDocumento: pickString(
      raw?.tipoDocumento,
      raw?.tipo_documento,
      raw?.tipoDoc,
      raw?.tipo_identificacion
    ),
    numeroDocumento: pickString(
      raw?.numeroDocumento,
      raw?.numero_documento,
      raw?.documento,
      raw?.num_documento,
      raw?.identificacion
    ),
    telefono: pickString(
      raw?.telefono,
      raw?.telefono_1,
      raw?.tel,
      raw?.phone
    ),
    celular: pickString(
      raw?.celular,
      raw?.movil,
      raw?.mobile
    ),
    correo: pickString(
      raw?.correo,
      raw?.email,
      raw?.correo_electronico
    ),
    direccion: pickString(
      raw?.direccion,
      raw?.direccion_principal,
      raw?.address
    ),
    ciudad: pickString(
      raw?.ciudad,
      raw?.nombre_ciudad
    ),
    departamento: pickString(
      raw?.departamento,
      raw?.nombre_departamento
    ),
    estado: pickString(
      raw?.estado,
      raw?.nombre_estado,
      raw?.status
    ),
    observaciones: pickString(
      raw?.observaciones,
      raw?.observacion,
      raw?.notas,
      raw?.nota
    ),
    contacto: pickString(
      raw?.contacto,
      raw?.nombre_contacto,
      raw?.contacto_principal
    ),
    fechaCreacion: pickString(
      raw?.fechaCreacion,
      raw?.fecha_creacion,
      raw?.createdAt
    ),
    fechaActualizacion: pickString(
      raw?.fechaActualizacion,
      raw?.fecha_actualizacion,
      raw?.updatedAt
    ),
  };
}

function unwrapListResponse(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.clientes)) return data.clientes;
  return [];
}

function unwrapDetailResponse(data: any): any {
  return data?.data ?? data?.cliente ?? data;
}

export const clientesService = {
  async getAll(params?: GetClientesParams): Promise<ClienteListItem[]> {
    const { data } = await http.get("/clientes", {
      params: {
        q: params?.search || undefined,
      },
    });

    return unwrapListResponse(data).map(normalizeCliente);
  },

  async getById(id: number): Promise<ClienteDetail> {
    const { data } = await http.get(`/clientes/${id}`);
    return normalizeCliente(unwrapDetailResponse(data));
  },
};