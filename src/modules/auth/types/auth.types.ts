export type Permiso = {
  id_permiso: number;
  nombre_permiso: string;
};

export type Bodega = {
  id_bodega: number;
  nombre_bodega: string;
  direccion: string;
  id_municipio: number;
  estado: boolean;
};

export type Rol = {
  id_rol: number;
  nombre_rol: string;
  estado: boolean;
};

export type TipoDocumento = {
  id_tipo_doc: number;
  nombre_doc: string;
} | null;

export type Genero = {
  id_genero: number;
  nombre_genero: string;
} | null;

export type AuthUser = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  id_tipo_doc: number;
  num_documento: string;
  email: string;
  id_rol: number;
  estado: boolean;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  img_url?: string | null;
  id_genero?: number | null;
  id_bodega_activa: number | null;
  requiereSeleccion: boolean;
  roles: Rol;
  bodegas: Bodega[];
  permisos: Permiso[];
  tipo_documento?: TipoDocumento;
  genero?: Genero;
};

export type LoginPayload = {
  email: string;
  contrasena: string;
};

export type LoginResponse = {
  access_token: string;
  user: AuthUser;
};