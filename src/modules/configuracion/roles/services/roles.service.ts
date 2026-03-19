import { http } from "@/core/api/http";
import type { RolItem } from "../types/roles.types";

export async function getRoles(): Promise<RolItem[]> {
  const { data } = await http.get<RolItem[]>("/roles", {
    params: {
      incluirInactivos: "true",
    },
  });

  return Array.isArray(data) ? data : [];
}