export type EstadoTrasladoFilter =
  | "all"
  | "PENDIENTE"
  | "EN TRANSITO"
  | "RECIBIDO"
  | "ANULADO";

export type TrasladoEstado = {
  id_estado_traslado: number;
  nombre_estado: string;
};

export type TrasladoBodegaRef = {
  id_bodega: number;
  nombre_bodega: string;
};

export type TrasladoUsuarioRef = {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
};

export type TrasladoListItem = {
  id_traslado: number;
  codigo_traslado: string;
  id_bodega_origen: number;
  id_bodega_destino: number;
  fecha_traslado: string;
  nota: string | null;
  id_estado_traslado: number;
  id_responsable: number;
  estado_traslado: TrasladoEstado;
  bodega_traslado_id_bodega_origenTobodega: TrasladoBodegaRef;
  bodega_traslado_id_bodega_destinoTobodega: TrasladoBodegaRef;
  usuario: TrasladoUsuarioRef;
};

export type TrasladoDetalleItem = {
  id_detalle: number;
  id_existencia: number;
  cantidad: number | string;
  existencias: {
    id_existencia: number;
    id_producto: number;
    id_bodega: number;
    cantidad: number | string;
    lote: string | null;
    producto: {
      id_producto: number;
      nombre_producto: string;
    };
    bodega: {
      id_bodega: number;
      nombre_bodega: string;
    };
  };
};

export type TrasladoDetail = TrasladoListItem & {
  detalle_traslado: TrasladoDetalleItem[];
};