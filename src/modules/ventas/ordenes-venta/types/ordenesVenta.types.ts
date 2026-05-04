export type OrdenVentaEstadoFilter =
  | "all"
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "Anulada"
  | "Despachado"
  | "Entregado"
  | "Facturada";

export type OrdenVentaEstado =
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "Anulada"
  | "Despachado"
  | "Entregado"
  | "Facturada"
  | "Sin estado";

export type OrdenVentaDetalleItem = {
  idDetalle: number;
  idProducto: number;
  codigoProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  porcentajeIva: number;
  subtotal: number;
  totalIva: number;
  total: number;
};

export type OrdenVentaItem = {
  id: number;
  codigo: string;
  fecha: string;
  fechaVencimiento: string;
  descripcion: string;

  idCliente: number;
  cliente: string;
  numeroDocumentoCliente: string;
  tipoDocumentoCliente: string;

  idBodega: number | null;
  bodega: string;

  idEstado: number | null;
  estado: OrdenVentaEstado;

  subtotal: number;
  totalIva: number;
  total: number;

  totalItems: number;
};

export type OrdenVentaDetail = OrdenVentaItem & {
  productos: OrdenVentaDetalleItem[];
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toText = (value: unknown, fallback = ""): string => {
  if (value == null) return fallback;
  return String(value).trim();
};

const toIsoDate = (value: unknown): string => {
  if (!value) return "";

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return "";
};

const normalizeEstado = (value: unknown): OrdenVentaEstado => {
  const raw = toText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalized = raw.toLowerCase();

  if (normalized.includes("pend")) return "Pendiente";
  if (normalized.includes("aprob")) return "Aprobada";
  if (normalized.includes("rech")) return "Rechazada";
  if (normalized.includes("anul")) return "Anulada";
  if (normalized.includes("desp")) return "Despachado";
  if (normalized.includes("entreg")) return "Entregado";
  if (normalized.includes("fact")) return "Facturada";

  return raw ? (raw[0].toUpperCase() + raw.slice(1).toLowerCase()) as OrdenVentaEstado : "Sin estado";
};

const getClienteRef = (raw: any) =>
  raw?.cliente ??
  raw?.clientes ??
  raw?.clienteRef ??
  null;

const getBodegaRef = (raw: any) =>
  raw?.bodega ??
  raw?.bodegas ??
  raw?.bodegaRef ??
  null;

const getEstadoRef = (raw: any) =>
  raw?.estado_orden_venta ??
  raw?.estadoOrdenVenta ??
  raw?.estado ??
  null;

const getProductoRef = (raw: any) =>
  raw?.producto ??
  raw?.productos ??
  raw?.productoRef ??
  null;

const getIvaRateFromProducto = (productoRef: any): number => {
  return toNumber(
    productoRef?.iva_venta ??
      productoRef?.porcentaje_iva_venta ??
      productoRef?.iva?.porcentaje ??
      productoRef?.ivaVenta?.porcentaje ??
      productoRef?.id_iva_venta?.porcentaje ??
      0
  );
};

export const mapOrdenVentaDetalleItem = (raw: any): OrdenVentaDetalleItem => {
  const productoRef = getProductoRef(raw);

  const cantidad = toNumber(raw?.cantidad);
  const precioUnitario = toNumber(raw?.precio_unitario ?? raw?.precioUnitario);
  const porcentajeIva = toNumber(
    raw?.iva_porcentaje ??
      raw?.porcentaje_iva ??
      raw?.porcentajeIva ??
      getIvaRateFromProducto(productoRef)
  );

  const subtotal =
    toNumber(raw?.subtotal) ||
    Number((cantidad * precioUnitario).toFixed(2));

  const totalIva =
    toNumber(raw?.total_iva ?? raw?.totalIva) ||
    Number((subtotal * (porcentajeIva / 100)).toFixed(2));

  const total =
    toNumber(raw?.total) ||
    Number((subtotal + totalIva).toFixed(2));

  return {
    idDetalle: toNumber(
      raw?.id_orden_detalle_venta ?? raw?.idDetalle ?? raw?.id
    ),
    idProducto: toNumber(
      raw?.id_producto ?? raw?.idProducto ?? productoRef?.id_producto ?? productoRef?.id
    ),
    codigoProducto: toText(
      productoRef?.codigo_producto ??
        productoRef?.codigo ??
        raw?.codigo_producto ??
        raw?.codigoProducto
    ),
    nombreProducto: toText(
      productoRef?.nombre_producto ??
        productoRef?.nombre ??
        raw?.nombre_producto ??
        raw?.nombreProducto
    ),
    cantidad,
    precioUnitario,
    porcentajeIva,
    subtotal,
    totalIva,
    total,
  };
};

export const mapOrdenVenta = (raw: any): OrdenVentaItem => {
  const clienteRef = getClienteRef(raw);
  const bodegaRef = getBodegaRef(raw);
  const estadoRef = getEstadoRef(raw);

  const detallesRaw =
    raw?.detalle_orden_venta ??
    raw?.detalleOrdenVenta ??
    raw?.detalles ??
    raw?.items ??
    [];

  const detalles = Array.isArray(detallesRaw)
    ? detallesRaw.map(mapOrdenVentaDetalleItem)
    : [];

  const subtotalCalculado = detalles.reduce((acc, item) => acc + item.subtotal, 0);
  const totalIvaCalculado = detalles.reduce((acc, item) => acc + item.totalIva, 0);
  const totalCalculado = detalles.reduce((acc, item) => acc + item.total, 0);

  return {
    id: toNumber(raw?.id_orden_venta ?? raw?.id),
    codigo: toText(raw?.codigo_orden_venta ?? raw?.codigo),
    fecha: toIsoDate(raw?.fecha_creacion ?? raw?.fecha),
    fechaVencimiento: toIsoDate(raw?.fecha_vencimiento ?? raw?.fechaVencimiento),
    descripcion: toText(raw?.descripcion ?? raw?.observaciones),

    idCliente: toNumber(
      raw?.id_cliente ?? raw?.idCliente ?? clienteRef?.id_cliente ?? clienteRef?.id
    ),
    cliente: toText(
      clienteRef?.nombre_cliente ??
        clienteRef?.nombre ??
        raw?.nombre_cliente ??
        raw?.clienteNombre
    ),
    numeroDocumentoCliente: toText(
      clienteRef?.num_documento ??
        raw?.num_documento_cliente ??
        raw?.numeroDocumentoCliente
    ),
    tipoDocumentoCliente: toText(
      clienteRef?.tipo_documento?.nombre_doc ??
        clienteRef?.tipoDocumento?.nombre_doc ??
        clienteRef?.tipoDocumento ??
        raw?.tipo_documento_cliente ??
        raw?.tipoDocumentoCliente
    ),

    idBodega: toNullableNumber(
      raw?.id_bodega ?? raw?.idBodega ?? bodegaRef?.id_bodega ?? bodegaRef?.id
    ),
    bodega: toText(
      bodegaRef?.nombre_bodega ??
        raw?.nombre_bodega ??
        raw?.bodegaNombre
    ),

    idEstado: toNullableNumber(
      raw?.id_estado_orden_venta ??
        raw?.idEstadoOrdenVenta ??
        estadoRef?.id_estado_orden_venta ??
        estadoRef?.id
    ),
    estado: normalizeEstado(
      estadoRef?.nombre_estado ??
        raw?.nombre_estado ??
        raw?.estado
    ),

    subtotal: toNumber(raw?.subtotal, subtotalCalculado),
    totalIva: toNumber(raw?.total_iva ?? raw?.totalIva, totalIvaCalculado),
    total: toNumber(raw?.total, totalCalculado),

    totalItems: detalles.length,
  };
};

export const mapOrdenVentaDetail = (raw: any): OrdenVentaDetail => {
  const base = mapOrdenVenta(raw);

  const detallesRaw =
    raw?.detalle_orden_venta ??
    raw?.detalleOrdenVenta ??
    raw?.detalles ??
    raw?.items ??
    [];

  const productos = Array.isArray(detallesRaw)
    ? detallesRaw.map(mapOrdenVentaDetalleItem)
    : [];

  const subtotal = productos.reduce((acc, item) => acc + item.subtotal, 0);
  const totalIva = productos.reduce((acc, item) => acc + item.totalIva, 0);
  const total = productos.reduce((acc, item) => acc + item.total, 0);

  return {
    ...base,
    subtotal: base.subtotal || subtotal,
    totalIva: base.totalIva || totalIva,
    total: base.total || total,
    totalItems: base.totalItems || productos.length,
    productos,
  };
};