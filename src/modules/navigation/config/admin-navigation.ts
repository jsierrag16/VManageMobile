export type AdminMacroModuleKey =
  | "dashboard"
  | "existencias"
  | "compras"
  | "ventas"
  | "administracion";

export type AdminSubmoduleKey =
  | "dashboard"
  | "productos"
  | "traslados"
  | "bodegas"
  | "proveedores"
  | "ordenes_compra"
  | "remisiones_compra"
  | "clientes"
  | "cotizaciones"
  | "ordenes_venta"
  | "remisiones_venta"
  | "pagos"
  | "roles"
  | "usuarios";

export type AdminSubmoduleItem = {
  key: AdminSubmoduleKey;
  label: string;
  icon:
    | "home-outline"
    | "cube-outline"
    | "swap-horizontal-outline"
    | "business-outline"
    | "people-outline"
    | "document-text-outline"
    | "receipt-outline"
    | "cart-outline"
    | "wallet-outline"
    | "shield-outline";
};

export const adminMacroModules: {
  key: AdminMacroModuleKey;
  label: string;
  icon:
    | "home-outline"
    | "cube-outline"
    | "cart-outline"
    | "receipt-outline"
    | "settings-outline";
}[] = [
  { key: "dashboard", label: "Inicio", icon: "home-outline" },
  { key: "existencias", label: "Existencias", icon: "cube-outline" },
  { key: "compras", label: "Compras", icon: "cart-outline" },
  { key: "ventas", label: "Ventas", icon: "receipt-outline" },
  { key: "administracion", label: "Admin", icon: "settings-outline" },
];

export const adminSubmodulesByMacro: Record<
  AdminMacroModuleKey,
  AdminSubmoduleItem[]
> = {
  dashboard: [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: "home-outline",
    },
  ],
  existencias: [
    { key: "productos", label: "Productos", icon: "cube-outline" },
    { key: "traslados", label: "Traslados", icon: "swap-horizontal-outline" },
    { key: "bodegas", label: "Bodegas", icon: "business-outline" },
  ],
  compras: [
    { key: "proveedores", label: "Proveedores", icon: "people-outline" },
    {
      key: "ordenes_compra",
      label: "Órdenes de compra",
      icon: "document-text-outline",
    },
    {
      key: "remisiones_compra",
      label: "Remisiones de compra",
      icon: "receipt-outline",
    },
  ],
  ventas: [
    { key: "clientes", label: "Clientes", icon: "people-outline" },
    {
      key: "cotizaciones",
      label: "Cotizaciones",
      icon: "document-text-outline",
    },
    {
      key: "ordenes_venta",
      label: "Órdenes de venta",
      icon: "document-text-outline",
    },
    {
      key: "remisiones_venta",
      label: "Remisiones de venta",
      icon: "receipt-outline",
    },
    { key: "pagos", label: "Pagos", icon: "wallet-outline" },
  ],
  administracion: [
    { key: "roles", label: "Roles", icon: "shield-outline" },
    { key: "usuarios", label: "Usuarios", icon: "people-outline" },
  ],
};