export type ProductoCategoria = {
  id_categoria_producto: number;
  nombre_categoria: string;
} | null;

export type ProductoIva = {
  id_iva: number;
  porcentaje: number;
} | null;

export type ProductoLote = {
  id_existencia: number;
  lote: string;
  cantidad: number;
  fecha_vencimiento: string | null;
  id_bodega: number;
  nombre_bodega: string;
};

export type ProductoVista = {
  id_producto: number;
  nombre_producto: string;
  descripcion: string | null;
  id_categoria_producto: number;
  id_iva: number;
  estado: boolean;
  categoria_producto: ProductoCategoria;
  iva: ProductoIva;
  stock_total: number;
  lotes: ProductoLote[];
};