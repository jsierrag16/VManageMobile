import { http } from "@/core/api/http";
import type { UsuarioItem } from "../types/usuarios.types";

type UsuariosApiResponse =
  | UsuarioItem[]
  | {
      page: number;
      limit: number;
      total: number;
      pages: number;
      data: UsuarioItem[];
    };

export async function getUsuarios(): Promise<UsuarioItem[]> {
  const { data } = await http.get<UsuariosApiResponse>("/usuario");

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data?.data) ? data.data : [];
}