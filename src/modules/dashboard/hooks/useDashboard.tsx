import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useBodegaStore } from "@/modules/existencias/bodegas/store/bodega.store";
import { dashboardService } from "../services/dashboard.service";
import type { DashboardPeriodo } from "../types/dashboard.types";

export function formatMoney(value?: number | string | null) {
  const numberValue = Number(value ?? 0);

  return numberValue.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function formatNumber(value?: number | string | null) {
  const numberValue = Number(value ?? 0);

  return numberValue.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function useDashboard() {
  const selectedBodegaId = useBodegaStore((state) => state.selectedBodegaId);
  const selectedBodegaLabel = useBodegaStore(
    (state) => state.selectedBodegaLabel
  );

  const [selectedPeriodo, setSelectedPeriodo] =
    useState<DashboardPeriodo>("6m");

  const resumenQuery = useQuery({
    queryKey: ["dashboard-resumen-mobile", selectedBodegaId],
    queryFn: () => dashboardService.getResumen(selectedBodegaId),
  });

  const chartsQuery = useQuery({
    queryKey: ["dashboard-charts-mobile", selectedBodegaId, selectedPeriodo],
    queryFn: async () => {
      const agrupacion = selectedPeriodo === "30d" ? "dia" : "mes";

      const [series, ventasPorCategoria, comprasPorProveedor] =
        await Promise.all([
          dashboardService.getSeries({
            idBodega: selectedBodegaId,
            periodo: selectedPeriodo,
            agrupacion,
          }),
          dashboardService.getVentasPorCategoria({
            idBodega: selectedBodegaId,
            periodo: selectedPeriodo,
          }),
          dashboardService.getComprasPorProveedor({
            idBodega: selectedBodegaId,
            periodo: selectedPeriodo,
          }),
        ]);

      return {
        series,
        ventasPorCategoria,
        comprasPorProveedor,
      };
    },
  });

  const refreshAll = async () => {
    await Promise.all([resumenQuery.refetch(), chartsQuery.refetch()]);
  };

  const seriesChartData = useMemo(() => {
    const series = chartsQuery.data?.series;
    if (!series) return [];

    return series.labels.map((label, index) => ({
      label,
      ventas: series.ventas[index] ?? 0,
      compras: series.compras[index] ?? 0,
    }));
  }, [chartsQuery.data?.series]);

  const ventasPorCategoriaChartData = useMemo(() => {
    return chartsQuery.data?.ventasPorCategoria?.items ?? [];
  }, [chartsQuery.data?.ventasPorCategoria]);

  const comprasPorProveedorChartData = useMemo(() => {
    return chartsQuery.data?.comprasPorProveedor?.items ?? [];
  }, [chartsQuery.data?.comprasPorProveedor]);

  return {
    selectedBodegaId,
    selectedBodegaLabel,
    selectedPeriodo,
    setSelectedPeriodo,
    resumen: resumenQuery.data ?? null,
    series: chartsQuery.data?.series ?? null,
    ventasPorCategoria: chartsQuery.data?.ventasPorCategoria ?? null,
    comprasPorProveedor: chartsQuery.data?.comprasPorProveedor ?? null,
    seriesChartData,
    ventasPorCategoriaChartData,
    comprasPorProveedorChartData,
    isLoading: resumenQuery.isLoading,
    isChartsLoading: chartsQuery.isLoading,
    isRefreshing: resumenQuery.isRefetching || chartsQuery.isRefetching,
    isError: resumenQuery.isError,
    isChartsError: chartsQuery.isError,
    refetchResumen: resumenQuery.refetch,
    refetchCharts: chartsQuery.refetch,
    refreshAll,
  };
}