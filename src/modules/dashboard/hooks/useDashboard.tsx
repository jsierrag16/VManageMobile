import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useBodegaStore } from "@/modules/existencias/bodegas/store/bodega.store";
import { dashboardService } from "../services/dashboard.service";

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

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function useDashboard() {
  const selectedBodegaId = useBodegaStore((state) => state.selectedBodegaId);
  const selectedBodegaLabel = useBodegaStore(
    (state) => state.selectedBodegaLabel
  );

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => formatDateInput(today), [today]);

  const currentMonthStart = useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  );

  const [fechaInicio, setFechaInicioState] = useState(
    formatDateInput(currentMonthStart)
  );
  const [fechaFin, setFechaFinState] = useState(todayString);

  const isDateRangeValid = useMemo(() => {
    if (!fechaInicio || !fechaFin) return false;
    return fechaInicio <= fechaFin;
  }, [fechaInicio, fechaFin]);

  const fechaInicioDate = useMemo(
    () => parseLocalDate(fechaInicio),
    [fechaInicio]
  );

  const fechaFinDate = useMemo(() => parseLocalDate(fechaFin), [fechaFin]);

  const maxFechaInicio = useMemo(() => {
    return fechaFin < todayString ? fechaFin : todayString;
  }, [fechaFin, todayString]);

  const setFechaInicio = useCallback(
    (value: string) => {
      if (!value) return;

      const nextValue = value > maxFechaInicio ? maxFechaInicio : value;
      setFechaInicioState(nextValue);

      if (fechaFin < nextValue) {
        setFechaFinState(nextValue);
      }
    },
    [fechaFin, maxFechaInicio]
  );

  const setFechaFin = useCallback(
    (value: string) => {
      if (!value) return;

      let nextValue = value;

      if (nextValue > todayString) {
        nextValue = todayString;
      }

      if (nextValue < fechaInicio) {
        nextValue = fechaInicio;
      }

      setFechaFinState(nextValue);
    },
    [fechaInicio, todayString]
  );

  const agrupacion = useMemo<"dia" | "mes">(() => {
    const diffMs = fechaFinDate.getTime() - fechaInicioDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return diffDays <= 45 ? "dia" : "mes";
  }, [fechaInicioDate, fechaFinDate]);

  const resumenQuery = useQuery({
    queryKey: [
      "dashboard-resumen-mobile",
      selectedBodegaId,
      fechaInicio,
      fechaFin,
    ],
    queryFn: () =>
      dashboardService.getResumen({
        idBodega: selectedBodegaId,
        fechaInicio,
        fechaFin,
      }),
    enabled: isDateRangeValid,
  });

  const chartsQuery = useQuery({
    queryKey: [
      "dashboard-charts-mobile",
      selectedBodegaId,
      fechaInicio,
      fechaFin,
      agrupacion,
    ],
    queryFn: async () => {
      const [series, ventasPorCategoria, comprasPorProveedor] =
        await Promise.all([
          dashboardService.getSeries({
            idBodega: selectedBodegaId,
            fechaInicio,
            fechaFin,
            agrupacion,
          }),
          dashboardService.getVentasPorCategoria({
            idBodega: selectedBodegaId,
            fechaInicio,
            fechaFin,
          }),
          dashboardService.getComprasPorProveedor({
            idBodega: selectedBodegaId,
            fechaInicio,
            fechaFin,
          }),
        ]);

      return {
        series,
        ventasPorCategoria,
        comprasPorProveedor,
      };
    },
    enabled: isDateRangeValid,
  });

  const refreshAll = async () => {
    if (!isDateRangeValid) return;
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
    fechaInicio,
    fechaFin,
    fechaInicioDate,
    fechaFinDate,
    todayString,
    maxFechaInicio,
    setFechaInicio,
    setFechaFin,
    agrupacion,
    isDateRangeValid,
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