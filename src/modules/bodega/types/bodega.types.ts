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