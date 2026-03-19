export type EstadoRolFilter = "all" | "true" | "false";

export type RolPermiso = {
  id_permiso: number;
  nombre_permiso: string;
};

export type RolPermisoLink = {
  permisos: RolPermiso;
};

export type RolItem = {
  id_rol: number;
  nombre_rol: string;
  descripcion: string;
  estado: boolean;
  _count?: {
    usuario: number;
  };
  roles_permisos: RolPermisoLink[];
};