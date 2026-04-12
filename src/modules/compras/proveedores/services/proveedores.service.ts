import { http } from "@/core/api/http";

export type ProveedorItem = {
  id_proveedor: number;
  codigo_proveedor: string | null;
  num_documento: string;
  nombre_empresa: string;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  nombre_contacto: string | null;
  id_tipo_proveedor: number;
  id_tipo_doc: number;
  id_municipio: number;
  estado: boolean | string | number | null;
  tipo_documento?: {
    id_tipo_doc: number;
    nombre_doc: string;
  } | null;
  tipo_proveedor?: {
    id_tipo_proveedor: number;
    nombre_tipo_proveedor: string;
  } | null;
  municipios?: {
    id_municipio: number;
    nombre_municipio: string;
    id_departamento?: number;
    departamentos?: {
      id_departamento?: number;
      nombre_departamento: string;
    } | null;
  } | null;
};

type ProveedoresFindAllResponse =
  | ProveedorItem[]
  | {
      page: number;
      limit: number;
      total: number;
      pages: number;
      data: ProveedorItem[];
    };

type GetProveedoresParams = {
  q?: string;
  estado?: "true" | "false";
  id_tipo_proveedor?: number;
  id_tipo_doc?: number;
  id_municipio?: number;
  page?: number;
  limit?: number;
};

function cleanParams(params: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
}

function extractArrayResponse(
  response: ProveedoresFindAllResponse
): ProveedorItem[] {
  if (Array.isArray(response)) return response;
  return Array.isArray(response.data) ? response.data : [];
}

export async function getProveedores(
  params: GetProveedoresParams = {}
): Promise<ProveedorItem[]> {
  const safeParams = cleanParams({
    q: params.q,
    estado: params.estado,
    id_tipo_proveedor: params.id_tipo_proveedor,
    id_tipo_doc: params.id_tipo_doc,
    id_municipio: params.id_municipio,
    page: params.page ?? 1,
    limit: params.limit ?? 50,
    includeRefs: "true",
  });

  const { data } = await http.get<ProveedoresFindAllResponse>("/proveedor", {
    params: safeParams,
  });

  return extractArrayResponse(data);
}

export async function getProveedorById(id: number): Promise<ProveedorItem> {
  const { data } = await http.get<ProveedorItem>(`/proveedor/${id}`, {
    params: { includeRefs: "true" },
  });

  return data;
}
