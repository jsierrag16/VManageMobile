export type EstadoOption = {
    id: number;
    label: string;
  };
  
  export type VentaItemBase = {
    id: number;
    codigo: string;
    fecha: string;
    clienteNombre: string;
    clienteDocumento?: string | null;
    bodegaId?: number | null;
    bodegaNombre?: string | null;
    total?: number;
    subtotal?: number;
    totalIva?: number;
    estadoId: number;
    estadoNombre: string;
    observaciones?: string | null;
  };
  
  export type VentaDetalleProducto = {
    id: number;
    producto: string;
    codigoProducto?: string | null;
    cantidad: number;
    precioUnitario: number;
    iva?: number;
    subtotal?: number;
    total?: number;
  };
  
  export type VentaDetailBase = VentaItemBase & {
    productos: VentaDetalleProducto[];
  };
  
  export type EstadoChangePayload = {
    id: number;
    nuevoEstadoId: number;
  };