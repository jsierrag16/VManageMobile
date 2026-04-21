export type CotizacionEstadoFilter =
  | "all"
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "Vencida"
  | "Anulada";

export type CotizacionEstado =
  | "Pendiente"
  | "Aprobada"
  | "Rechazada"
  | "Vencida"
  | "Anulada"
  | "Sin estado";

export type CotizacionDetalleItem = {
  idDetalle: number;
  idProducto: number;
  codigoProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  idIva: number | null;
  porcentajeIva: number;
  subtotal: number;
  totalIva: number;
  total: number;
};

export type CotizacionItem = {
  id: number;
  codigo: string;
  fecha: string;
  fechaVencimiento: string;
  observaciones: string;

  idCliente: number;
  cliente: string;
  numeroDocumentoCliente: string;
  tipoDocumentoCliente: string;

  idBodega: number | null;
  bodega: string;

  idEstado: number | null;
  estado: CotizacionEstado;

  subtotal: number;
  totalIva: number;
  total: number;

  totalItems: number;
};

export type CotizacionDetail = CotizacionItem & {
  productos: CotizacionDetalleItem[];
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

const normalizeEstado = (value: unknown): CotizacionEstado => {
  const raw = toText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const normalized = raw.trim().toLowerCase();

  if (normalized.includes("pend")) return "Pendiente";
  if (normalized.includes("aprob")) return "Aprobada";
  if (normalized.includes("rech")) return "Rechazada";
  if (normalized.includes("venc")) return "Vencida";
  if (normalized.includes("anul")) return "Anulada";

  return raw ? (raw[0].toUpperCase() + raw.slice(1).toLowerCase()) as CotizacionEstado : "Sin estado";
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
  raw?.estado_cotizacion ??
  raw?.estadoCotizacion ??
  raw?.estado ??
  null;

const getProductoRef = (raw: any) =>
  raw?.producto ??
  raw?.productos ??
  raw?.productoRef ??
  null;

const getIvaRef = (raw: any) =>
  raw?.iva ??
  raw?.ivaRef ??
  null;

export const mapCotizacionDetalleItem = (raw: any): CotizacionDetalleItem => {
  const productoRef = getProductoRef(raw);
  const ivaRef = getIvaRef(raw);

  const cantidad = toNumber(raw?.cantidad);
  const precioUnitario = toNumber(raw?.precio_unitario ?? raw?.precioUnitario);
  const porcentajeIva = toNumber(
    raw?.iva_porcentaje ??
      raw?.porcentaje_iva ??
      ivaRef?.porcentaje ??
      raw?.porcentajeIva
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
      raw?.id_detalle_cotizacion ?? raw?.idDetalle ?? raw?.id
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
    idIva: toNullableNumber(
      raw?.id_iva ?? raw?.idIva ?? ivaRef?.id_iva ?? ivaRef?.id
    ),
    porcentajeIva,
    subtotal,
    totalIva,
    total,
  };
};

export const mapCotizacion = (raw: any): CotizacionItem => {
  const clienteRef = getClienteRef(raw);
  const bodegaRef = getBodegaRef(raw);
  const estadoRef = getEstadoRef(raw);

  const detallesRaw =
    raw?.detalle_cotizacion ??
    raw?.detalleCotizacion ??
    raw?.detalles ??
    raw?.items ??
    [];

  const detalles = Array.isArray(detallesRaw)
    ? detallesRaw.map(mapCotizacionDetalleItem)
    : [];

  const subtotalCalculado = detalles.reduce((acc, item) => acc + item.subtotal, 0);
  const totalIvaCalculado = detalles.reduce((acc, item) => acc + item.totalIva, 0);
  const totalCalculado = detalles.reduce((acc, item) => acc + item.total, 0);

  return {
    id: toNumber(raw?.id_cotizacion ?? raw?.id),
    codigo: toText(raw?.codigo_cotizacion ?? raw?.codigo),
    fecha: toIsoDate(raw?.fecha),
    fechaVencimiento: toIsoDate(raw?.fecha_vencimiento ?? raw?.fechaVencimiento),
    observaciones: toText(raw?.observaciones),

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
      raw?.id_estado_cotizacion ??
        raw?.idEstadoCotizacion ??
        estadoRef?.id_estado_cotizacion ??
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

export const mapCotizacionDetail = (raw: any): CotizacionDetail => {
  const base = mapCotizacion(raw);

  const detallesRaw =
    raw?.detalle_cotizacion ??
    raw?.detalleCotizacion ??
    raw?.detalles ??
    raw?.items ??
    [];

  const productos = Array.isArray(detallesRaw)
    ? detallesRaw.map(mapCotizacionDetalleItem)
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