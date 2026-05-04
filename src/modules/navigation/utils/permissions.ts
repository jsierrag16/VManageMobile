import type { AuthUser } from "@/modules/auth/types/auth.types";
import {
  adminMacroModules,
  adminSubmodulesByMacro,
  type AdminMacroModuleKey,
  type AdminSubmoduleKey,
  type AdminSubmoduleItem,
} from "@/modules/navigation/config/admin-navigation";

const SUBMODULE_PERMISSION_MAP: Partial<Record<AdminSubmoduleKey, string>> = {
  dashboard: "dashboard.acceder",
  productos: "existencias.productos.ver",
  traslados: "existencias.traslados.ver",
  bodegas: "existencias.bodegas.ver",
  proveedores: "compras.proveedores.ver",
  ordenes_compra: "compras.ordenes_compra.ver",
  remisiones_compra: "compras.remisiones_compra.ver",
  clientes: "ventas.clientes.ver",
  cotizaciones: "ventas.cotizaciones.ver",
  ordenes_venta: "ventas.ordenes_venta.ver",
  remisiones_venta: "ventas.remisiones_venta.ver",
  pagos: "ventas.pagos.ver",
  roles: "administracion.roles.ver",
  usuarios: "administracion.usuarios.ver",
};

export function getPermissionNames(usuario?: AuthUser | null) {
  return new Set(
    (usuario?.permisos ?? [])
      .map((permiso) => permiso?.nombre_permiso)
      .filter((value): value is string => Boolean(value))
  );
}

export function hasPermission(
  usuario: AuthUser | null | undefined,
  permission: string
) {
  return getPermissionNames(usuario).has(permission);
}

export function canAccessSubmodule(
  usuario: AuthUser | null | undefined,
  submodule: AdminSubmoduleKey
) {
  if (submodule === "perfil") {
    return true;
  }

  const requiredPermission = SUBMODULE_PERMISSION_MAP[submodule];
  if (!requiredPermission) return false;

  return hasPermission(usuario, requiredPermission);
}

export function getVisibleSubmodulesByMacro(
  usuario: AuthUser | null | undefined
): Record<AdminMacroModuleKey, AdminSubmoduleItem[]> {
  return {
    dashboard: adminSubmodulesByMacro.dashboard.filter((item) =>
      canAccessSubmodule(usuario, item.key)
    ),
    existencias: adminSubmodulesByMacro.existencias.filter((item) =>
      canAccessSubmodule(usuario, item.key)
    ),
    compras: adminSubmodulesByMacro.compras.filter((item) =>
      canAccessSubmodule(usuario, item.key)
    ),
    ventas: adminSubmodulesByMacro.ventas.filter((item) =>
      canAccessSubmodule(usuario, item.key)
    ),
    administracion: adminSubmodulesByMacro.administracion.filter((item) =>
      canAccessSubmodule(usuario, item.key)
    ),
  };
}

export function getVisibleMacros(
  usuario: AuthUser | null | undefined
): { key: AdminMacroModuleKey; label: string; icon: any }[] {
  const visibleSubmodules = getVisibleSubmodulesByMacro(usuario);

  return adminMacroModules.filter(
    (macro) => visibleSubmodules[macro.key]?.length > 0
  );
}

export function getDefaultNavigationForUser(
  usuario: AuthUser | null | undefined
): {
  macro: AdminMacroModuleKey;
  submodule: AdminSubmoduleKey;
} {
  const visibleSubmodules = getVisibleSubmodulesByMacro(usuario);

  if (visibleSubmodules.dashboard.length > 0) {
    return {
      macro: "dashboard",
      submodule: "dashboard",
    };
  }

  const firstMacro = adminMacroModules.find(
    (macro) => visibleSubmodules[macro.key]?.length > 0
  );

  if (firstMacro) {
    return {
      macro: firstMacro.key,
      submodule: visibleSubmodules[firstMacro.key][0].key,
    };
  }

  return {
    macro: "dashboard",
    submodule: "perfil",
  };
}