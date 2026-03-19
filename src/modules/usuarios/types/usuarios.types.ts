export type EstadoUsuarioFilter = "all" | "true" | "false";

export type UsuarioTipoDocumento = {
  id_tipo_doc: number;
  nombre_doc: string;
};

export type UsuarioRol = {
  id_rol: number;
  nombre_rol: string;
};

export type UsuarioGenero = {
  id_genero: number;
  nombre_genero: string;
};

export type UsuarioBodega = {
  id_bodega: number;
  estado: boolean;
  bodega: {
    id_bodega: number;
    nombre_bodega: string;
    direccion: string;
    id_municipio: number;
    estado: boolean;
  };
};

export type UsuarioItem = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  id_tipo_doc: number;
  num_documento: string;
  email: string;
  id_rol: number;
  estado: boolean;
  telefono: string | null;
  fecha_nacimiento: string | null;
  img_url: string | null;
  id_genero: number | null;
  tipo_documento: UsuarioTipoDocumento | null;
  roles: UsuarioRol | null;
  genero: UsuarioGenero | null;
  bodegas_por_usuario: UsuarioBodega[];
};