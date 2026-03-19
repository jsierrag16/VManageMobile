export type EstadoBodegaFilter = "all" | "true" | "false";

export type DepartamentoBodega = {
  id_departamento: number;
  nombre_departamento: string;
};

export type MunicipioBodega = {
  id_municipio: number;
  nombre_municipio: string;
  departamentos?: DepartamentoBodega | null;
};

export type Bodega = {
  id_bodega: number;
  nombre_bodega: string;
  direccion: string;
  id_municipio: number;
  estado: boolean;
  municipios?: MunicipioBodega | null;
};

export type BodegaOption = {
  id_bodega: number;
  nombre_bodega: string;
  direccion: string;
  id_municipio: number;
  estado: boolean;
};

export type BodegaContextOption = {
  id: number | null;
  label: string;
};