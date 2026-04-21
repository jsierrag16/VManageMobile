export type CatalogOption = {
    id: number;
    label: string;
  };
  
  export type ClienteOption = {
    id: number;
    codigo: string;
    nombre: string;
    numeroDocumento: string;
    tipoDocumento: string;
    estado: boolean;
  };
  
  export type MetodoPagoItem = {
    id_metodo: number;
    nombre_metodo?: string;
    nombre?: string;
  };
  
  export type EstadoFacturaItem = {
    id_estado_factura: number;
    nombre_estado_factura?: string;
    nombre?: string;
  };
  
  export type RemisionDetalleItem = {
    id_detalle_remision?: number;
    cantidad: number;
    precio_unitario: number;
    iva: number;
    productoNombre: string;
    bodegaNombre: string;
  };
  
  export type RemisionResumen = {
    subtotal: number;
    total_iva: number;
    total: number;
  };
  
  export type RemisionPendienteItem = {
    id: number;
    codigo: string;
    fecha: string;
    estado: string;
    clienteNombre: string;
    bodegaNombre: string;
    subtotal: number;
    totalIva: number;
    total: number;
    detalles: RemisionDetalleItem[];
  };
  
  export type PagoAbonoItem = {
    id: number;
    fechaPago: string;
    valor: number;
    estado: boolean;
    metodoPago: string;
  };
  
  export type FacturaResumenPago = {
    subtotal: number;
    total_iva: number;
    total_factura: number;
    total_abonado: number;
    saldo_pendiente: number;
  };
  
  export type FacturaItem = {
    id: number;
    codigo: string;
    fechaFactura: string;
    fechaVencimiento: string | null;
    nota: string;
    estado: string;
    clienteNombre: string;
    clienteDocumento: string;
    clienteTipoDocumento: string;
    remisiones: RemisionPendienteItem[];
    pagos: PagoAbonoItem[];
    resumenPago: FacturaResumenPago;
  };
  
  export type PagosAbonosCatalogos = {
    metodosPago: CatalogOption[];
    estadosFactura: CatalogOption[];
  };
  
  const toNumber = (value: unknown, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };
  
  const toText = (value: unknown, fallback = "") =>
    typeof value === "string" ? value.trim() : fallback;
  
  const toBool = (value: unknown, fallback = false) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value === 1;
    if (typeof value === "string") {
      const v = value.trim().toLowerCase();
      return ["true", "1", "activo", "activa", "sí", "si"].includes(v);
    }
    return fallback;
  };
  
  export const formatDateInput = (date = new Date()) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  
  export const formatMoney = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 2,
    }).format(toNumber(value));
  
  export const mapCatalogOption = (raw: any): CatalogOption => ({
    id: toNumber(raw?.id ?? raw?.id_metodo ?? raw?.id_estado_factura),
    label: toText(
      raw?.label ??
        raw?.nombre ??
        raw?.nombre_metodo ??
        raw?.nombre_estado_factura ??
        "Sin nombre"
    ),
  });
  
  export const mapClienteOption = (raw: any): ClienteOption => ({
    id: toNumber(raw?.id_cliente ?? raw?.id),
    codigo: toText(raw?.codigo_cliente ?? raw?.codigo),
    nombre: toText(raw?.nombre_cliente ?? raw?.nombre),
    numeroDocumento: toText(raw?.num_documento ?? raw?.numeroDocumento),
    tipoDocumento: toText(
      raw?.tipo_documento?.nombre_doc ??
        raw?.tipoDocumento ??
        raw?.nombre_doc
    ),
    estado: toBool(raw?.estado, true),
  });
  
  export const mapRemisionPendiente = (raw: any): RemisionPendienteItem => {
    const detallesRaw = Array.isArray(raw?.detalle_remision_venta)
      ? raw.detalle_remision_venta
      : [];
  
    const detalles: RemisionDetalleItem[] = detallesRaw.map((item: any) => ({
      id_detalle_remision: toNumber(
        item?.id_detalle_remision_venta ?? item?.id_detalle_remision
      ),
      cantidad: toNumber(item?.cantidad),
      precio_unitario: toNumber(item?.precio_unitario),
      iva: toNumber(item?.iva),
      productoNombre: toText(
        item?.existencias?.producto?.nombre_producto ??
          item?.producto?.nombre_producto ??
          item?.productoNombre
      ),
      bodegaNombre: toText(
        item?.existencias?.bodega?.nombre_bodega ??
          item?.bodega?.nombre_bodega ??
          item?.bodegaNombre
      ),
    }));
  
    const resumen = raw?.resumen ?? {};
  
    return {
      id: toNumber(raw?.id_remision_venta ?? raw?.id),
      codigo: toText(raw?.codigo_remision_venta ?? raw?.codigo),
      fecha: toText(raw?.fecha_remision ?? raw?.fecha),
      estado: toText(
        raw?.estado_remision_venta?.nombre_estado ??
          raw?.estado ??
          "Sin estado"
      ),
      clienteNombre: toText(
        raw?.cliente?.nombre_cliente ?? raw?.clienteNombre ?? raw?.nombre_cliente
      ),
      bodegaNombre: toText(
        raw?.orden_venta?.bodega?.nombre_bodega ??
          raw?.bodega?.nombre_bodega ??
          raw?.bodegaNombre
      ),
      subtotal: toNumber(resumen?.subtotal),
      totalIva: toNumber(resumen?.total_iva),
      total: toNumber(resumen?.total),
      detalles,
    };
  };
  
  export const mapPagoAbono = (raw: any): PagoAbonoItem => ({
    id: toNumber(raw?.id_pago ?? raw?.id),
    fechaPago: toText(raw?.fecha_pago ?? raw?.fechaPago ?? raw?.fecha),
    valor: toNumber(raw?.valor),
    estado: toBool(raw?.estado, true),
    metodoPago: toText(
      raw?.metodo_pago?.nombre_metodo ??
        raw?.metodoPago ??
        raw?.nombre_metodo ??
        "Sin método"
    ),
  });
  
  export const mapFactura = (raw: any): FacturaItem => {
    const remisionesRaw = Array.isArray(raw?.remision_venta)
      ? raw.remision_venta
      : [];
  
    const pagosRaw = Array.isArray(raw?.pagos_abonos) ? raw.pagos_abonos : [];
  
    return {
      id: toNumber(raw?.id_factura ?? raw?.id),
      codigo: toText(raw?.codigo_factura ?? raw?.codigo),
      fechaFactura: toText(raw?.fecha_factura ?? raw?.fechaFactura),
      fechaVencimiento: raw?.fecha_vencimiento
        ? toText(raw?.fecha_vencimiento)
        : null,
      nota: toText(raw?.nota),
      estado: toText(
        raw?.estado_factura?.nombre_estado_factura ??
          raw?.estado ??
          raw?.nombre_estado_factura
      ),
      clienteNombre: toText(
        raw?.cliente?.nombre_cliente ?? raw?.clienteNombre ?? raw?.nombre_cliente
      ),
      clienteDocumento: toText(
        raw?.cliente?.num_documento ??
          raw?.clienteDocumento ??
          raw?.num_documento
      ),
      clienteTipoDocumento: toText(
        raw?.cliente?.tipo_documento?.nombre_doc ??
          raw?.clienteTipoDocumento ??
          raw?.cliente?.nombre_doc
      ),
      remisiones: remisionesRaw.map(mapRemisionPendiente),
      pagos: pagosRaw.map(mapPagoAbono),
      resumenPago: {
        subtotal: toNumber(raw?.resumen_pago?.subtotal),
        total_iva: toNumber(raw?.resumen_pago?.total_iva),
        total_factura: toNumber(raw?.resumen_pago?.total_factura ?? raw?.total),
        total_abonado: toNumber(raw?.resumen_pago?.total_abonado),
        saldo_pendiente: toNumber(raw?.resumen_pago?.saldo_pendiente),
      },
    };
  };