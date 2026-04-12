export type CompraProveedor = {
  id_proveedor: number;
  nombre_empresa: string;
  id_tipo_doc: number;
  num_documento: string;
  telefono: string | null;
  tipo_documento?: {
    id_tipo_doc: number;
    nombre_doc: string;
  } | null;
} | null;

export type CompraEstado = {
  id_estado_compra: number;
  nombre_estado: string;
} | null;

export type CompraTerminoPago = {
  id_termino_pago: number;
  nombre_termino: string;
} | null;

export type CompraBodega = {
  id_bodega: number;
  nombre_bodega: string;
} | null;

export type CompraDetalleCount = {
  detalle_compra: number;
};

export type CompraListItem = {
  id_compra: number;
  codigo_compra: string;
  fecha_solicitud: string;
  fecha_entrega: string | null;
  descripcion: string | null;
  subtotal: string | number;
  total_iva: string | number;
  total: string | number;
  id_bodega: number;
  id_estado_compra: number;
  id_proveedor: number;
  id_termino_pago: number;
  id_usuario_creador: number;
  proveedor: CompraProveedor;
  estado_compra: CompraEstado;
  termino_pago: CompraTerminoPago;
  bodega: CompraBodega;
  _count: CompraDetalleCount;
};

export type CompraDetalleItem = {
  id_producto: number;
  cantidad: string | number;
  precio_unitario: string | number;
  id_iva: number;
  producto?: {
    id_producto: number;
    nombre_producto: string;
  } | null;
  iva?: {
    id_iva: number;
    porcentaje: string | number;
  } | null;
};

export type CompraDetail = CompraListItem & {
  detalle_compra: CompraDetalleItem[];
};

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}
