export type DashboardAgrupacion = "dia" | "mes";

export type DashboardResumenResponse = {
  bodega: {
    id_bodega: number | null;
    nombre_bodega: string;
    ids_bodegas: number[];
    total_bodegas: number;
  };
  periodo: {
    etiqueta: string;
    fecha_inicio: string;
    fecha_fin: string;
  };
  ventas: {
    total_mes_actual: number;
    cotizaciones_pendientes: number;
    ordenes_pendientes: number;
    remisiones_pendientes_facturar: number;
    facturas_pendientes_cobro: number;
    saldo_pendiente_cobro: number;
  };
  compras: {
    total_mes_actual: number;
    ordenes_pendientes: number;
    remisiones_pendientes: number;
  };
  inventario: {
    productos_con_stock: number;
    productos_stock_bajo: number;
    lotes_por_vencer: number;
    umbral_stock_bajo: number;
  };
  terceros: {
    clientes_activos: number;
    proveedores_activos: number;
  };
  logistica: {
    traslados_pendientes: number;
  };
};

export type DashboardSeriesResponse = {
  periodo: string;
  agrupacion: DashboardAgrupacion | string;
  labels: string[];
  ventas: number[];
  compras: number[];
};

export type DashboardRankingItem = {
  label: string;
  total: number;
};

export type DashboardRankingResponse = {
  periodo: string;
  items: DashboardRankingItem[];
};

export type DashboardResumenParams = {
  idBodega?: number | null;
  fechaInicio?: string;
  fechaFin?: string;
};

export type DashboardChartParams = {
  idBodega?: number | null;
  fechaInicio?: string;
  fechaFin?: string;
  agrupacion?: DashboardAgrupacion;
};