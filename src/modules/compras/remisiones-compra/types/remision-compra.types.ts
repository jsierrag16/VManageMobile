export type RemisionCompraProveedor = {
  id_proveedor: number;
  nombre_empresa: string;
  num_documento: string;
  id_tipo_doc: number;
  tipo_documento?: {
    id_tipo_doc: number;
    nombre_doc: string;
  } | null;
} | null;

export type RemisionCompraBodega = {
  id_bodega: number;
  nombre_bodega: string;
} | null;

export type RemisionCompraEstado = {
  id_estado_remision_compra: number;
  nombre_estado: string;
} | null;

export type RemisionCompraCompra = {
  id_compra: number;
  codigo_compra: string;
  id_bodega: number;
} | null;

export type RemisionCompraUsuario = {
  id_usuario: number;
  nombre: string;
  apellido: string;
} | null;

export type RemisionCompraCount = {
  detalle_remision_compra: number;
};

export type RemisionCompraListItem = {
  id_remision_compra: number;
  codigo_remision_compra: string;
  fecha_creacion: string;
  fecha_vencimiento: string | null;
  observaciones: string | null;
  id_compra: number;
  id_proveedor: number;
  id_estado_remision_compra: number;
  id_usuario_creador: number;
  id_factura: number | null;
  afecta_existencias: boolean;
  fecha_aplicacion_existencias: string | null;
  id_usuario_aplico_existencias: number | null;
  id_bodega: number;

  compras: RemisionCompraCompra;
  proveedor: RemisionCompraProveedor;
  bodega: RemisionCompraBodega;
  estado_remision_compra: RemisionCompraEstado;
  usuario: RemisionCompraUsuario;
  usuario_remision_compra_id_usuario_aplico_existenciasTousuario?: RemisionCompraUsuario;
  _count: RemisionCompraCount;
};

export type RemisionCompraDetalleItem = {
  id_detalle_remision_compra: number;
  id_producto: number;
  cantidad: string | number;
  precio_unitario: string | number;
  id_iva: number;
  lote: string | null;
  fecha_vencimiento: string | null;
  codigo_barras: string | null;
  nota: string | null;
  producto?: {
    id_producto: number;
    nombre_producto: string;
  } | null;
  iva?: {
    id_iva: number;
    porcentaje: string | number;
  } | null;
};

export type RemisionCompraDetail = RemisionCompraListItem & {
  firma_digital?: string | null;
  nombre_firmante?: string | null;
  fecha_firma?: string | null;
  detalle_remision_compra: RemisionCompraDetalleItem[];
};

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}
