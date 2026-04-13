import { useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import ChartCard from "../components/ChartCard";
import DashboardHeader from "../components/DashboardHeader";
import EmptyChart from "../components/EmptyChart";
import MainStatCard from "../components/MainStatCard";
import ModuleStatCard from "../components/ModuleStatCard";
import QuickActions from "../components/QuickActions";
import SectionBlock from "../components/SectionBlock";
import { formatMoney, formatNumber, useDashboard } from "../hooks/useDashboard";

const screenWidth = Dimensions.get("window").width;
const chartWidth = Math.max(screenWidth - 64, 320);
const isWeb = Platform.OS === "web";

export default function DashboardScreen() {
  const {
    selectedBodegaId,
    selectedBodegaLabel,
    selectedPeriodo,
    setSelectedPeriodo,
    resumen,
    seriesChartData,
    ventasPorCategoriaChartData,
    comprasPorProveedorChartData,
    isLoading,
    isChartsLoading,
    isRefreshing,
    isError,
    isChartsError,
    refreshAll,
  } = useDashboard();

  const mainCards = useMemo(() => {
    if (!resumen) return [];

    return [
      {
        title: "Ventas del mes",
        value: formatMoney(resumen.ventas.total_mes_actual),
        description: `Periodo actual: ${resumen.periodo.etiqueta}`,
        icon: "cash-outline" as const,
        colors: ["#3B82F6", "#2563EB"] as [string, string],
      },
      {
        title: "Saldo pendiente",
        value: formatMoney(resumen.ventas.saldo_pendiente_cobro),
        description: `${formatNumber(
          resumen.ventas.facturas_pendientes_cobro
        )} facturas pendientes de cobro`,
        icon: "wallet-outline" as const,
        colors: ["#10B981", "#059669"] as [string, string],
      },
      {
        title: "Compras del mes",
        value: formatMoney(resumen.compras.total_mes_actual),
        description: `${formatNumber(
          resumen.compras.ordenes_pendientes
        )} órdenes de compra pendientes`,
        icon: "cart-outline" as const,
        colors: ["#F97316", "#EA580C"] as [string, string],
      },
      {
        title: "Stock bajo",
        value: formatNumber(resumen.inventario.productos_stock_bajo),
        description: `Productos con stock menor a ${formatNumber(
          resumen.inventario.umbral_stock_bajo
        )}`,
        icon: "alert-circle-outline" as const,
        colors: ["#8B5CF6", "#7C3AED"] as [string, string],
      },
    ];
  }, [resumen]);

  const ventasCards = useMemo(() => {
    if (!resumen) return [];

    return [
      {
        title: "Cotizaciones pendientes",
        value: formatNumber(resumen.ventas.cotizaciones_pendientes),
        description: "Cotizaciones por revisar o convertir",
        icon: "document-text-outline" as const,
        tone: "blue" as const,
      },
      {
        title: "Órdenes de venta pendientes",
        value: formatNumber(resumen.ventas.ordenes_pendientes),
        description: "Órdenes aún en estado pendiente",
        icon: "receipt-outline" as const,
        tone: "orange" as const,
      },
      {
        title: "Remisiones por facturar",
        value: formatNumber(resumen.ventas.remisiones_pendientes_facturar),
        description: "Pendientes de asociar a una factura",
        icon: "newspaper-outline" as const,
        tone: "purple" as const,
      },
      {
        title: "Facturas pendientes de cobro",
        value: formatNumber(resumen.ventas.facturas_pendientes_cobro),
        description: "Pendientes o abonadas con saldo",
        icon: "card-outline" as const,
        tone: "green" as const,
      },
    ];
  }, [resumen]);

  const comprasCards = useMemo(() => {
    if (!resumen) return [];

    return [
      {
        title: "Órdenes de compra pendientes",
        value: formatNumber(resumen.compras.ordenes_pendientes),
        description: "Compras aún por aprobar o procesar",
        icon: "cart-outline" as const,
        tone: "orange" as const,
      },
      {
        title: "Remisiones de compra pendientes",
        value: formatNumber(resumen.compras.remisiones_pendientes),
        description: "Pendientes por aplicar o gestionar",
        icon: "document-outline" as const,
        tone: "blue" as const,
      },
      {
        title: "Proveedores activos",
        value: formatNumber(resumen.terceros.proveedores_activos),
        description: "Proveedores con actividad en las bodegas visibles",
        icon: "car-outline" as const,
        tone: "green" as const,
      },
    ];
  }, [resumen]);

  const inventarioCards = useMemo(() => {
    if (!resumen) return [];

    return [
      {
        title: "Productos con stock",
        value: formatNumber(resumen.inventario.productos_con_stock),
        description: "Productos con disponibilidad actual",
        icon: "cube-outline" as const,
        tone: "blue" as const,
      },
      {
        title: "Productos con stock bajo",
        value: formatNumber(resumen.inventario.productos_stock_bajo),
        description: `Stock menor a ${formatNumber(
          resumen.inventario.umbral_stock_bajo
        )}`,
        icon: "alert-circle-outline" as const,
        tone: "red" as const,
      },
      {
        title: "Lotes por vencer",
        value: formatNumber(resumen.inventario.lotes_por_vencer),
        description: "Con vencimiento dentro de 30 días",
        icon: "timer-outline" as const,
        tone: "yellow" as const,
      },
      {
        title: "Traslados pendientes",
        value: formatNumber(resumen.logistica.traslados_pendientes),
        description: "Pendientes o enviados entre bodegas",
        icon: "swap-horizontal-outline" as const,
        tone: "purple" as const,
      },
    ];
  }, [resumen]);

  const tercerosCards = useMemo(() => {
    if (!resumen) return [];

    return [
      {
        title: "Clientes activos",
        value: formatNumber(resumen.terceros.clientes_activos),
        description: "Clientes con actividad en la bodega filtrada",
        icon: "people-outline" as const,
        tone: "green" as const,
      },
      {
        title: "Proveedores activos",
        value: formatNumber(resumen.terceros.proveedores_activos),
        description: "Proveedores con compras registradas",
        icon: "car-outline" as const,
        tone: "blue" as const,
      },
    ];
  }, [resumen]);

  const quickActions = useMemo(
    () => [
      { label: "Clientes" },
      { label: "Cotizaciones" },
      { label: "Órdenes venta" },
      { label: "Remisiones venta" },
      { label: "Pagos y abonos" },
      { label: "Órdenes compra" },
      { label: "Remisiones compra" },
      { label: "Productos" },
      { label: "Traslados" },
    ],
    []
  );

  const lineChartData = useMemo(() => {
    return {
      labels: seriesChartData.map((item) => item.label),
      datasets: [
        {
          data: seriesChartData.map((item) => item.ventas),
          color: () => "#2563EB",
          strokeWidth: 3,
        },
        {
          data: seriesChartData.map((item) => item.compras),
          color: () => "#F97316",
          strokeWidth: 3,
        },
      ],
      legend: ["Ventas", "Compras"],
    };
  }, [seriesChartData]);

  const ventasCategoriaBarData = useMemo(() => {
    return {
      labels: ventasPorCategoriaChartData.map((item) =>
        item.label.length > 12 ? `${item.label.slice(0, 12)}...` : item.label
      ),
      datasets: [
        {
          data: ventasPorCategoriaChartData.map((item) => item.total),
        },
      ],
    };
  }, [ventasPorCategoriaChartData]);

  const comprasProveedorBarData = useMemo(() => {
    return {
      labels: comprasPorProveedorChartData.map((item) =>
        item.label.length > 12 ? `${item.label.slice(0, 12)}...` : item.label
      ),
      datasets: [
        {
          data: comprasPorProveedorChartData.map((item) => item.total),
        },
      ],
    };
  }, [comprasPorProveedorChartData]);

  if (isLoading && !resumen) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando dashboard...</Text>
      </View>
    );
  }

  if (isError && !resumen) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>No fue posible cargar el dashboard</Text>
        <Text style={styles.errorText}>
          Revisa la conexión o intenta nuevamente.
        </Text>
      </AppCard>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refreshAll}
          tintColor={colors.primary}
        />
      }
    >
      <DashboardHeader
        selectedBodegaLabel={
          selectedBodegaLabel ||
          resumen?.bodega?.nombre_bodega ||
          "Todas las bodegas"
        }
        periodoLabel={resumen?.periodo?.etiqueta}
        totalBodegas={resumen?.bodega?.total_bodegas ?? 0}
        selectedBodegaId={selectedBodegaId}
        selectedPeriodo={selectedPeriodo}
        onPeriodoChange={setSelectedPeriodo}
        onRefresh={refreshAll}
        refreshing={isRefreshing}
      />

      <View style={styles.mainCardsWrap}>
        {mainCards.map((card) => (
          <MainStatCard key={card.title} {...card} />
        ))}
      </View>

      {isChartsError ? (
        <AppCard style={styles.errorBlock}>
          <Text style={styles.errorTitle}>No fue posible cargar las gráficas</Text>
          <Text style={styles.errorText}>
            Intenta nuevamente o revisa la conexión con el backend.
          </Text>
        </AppCard>
      ) : (
        <>
          <ChartCard
            title="Evolución de ventas y compras"
            subtitle="Comportamiento comparativo del período seleccionado."
          >
            {isWeb ? (
              <EmptyChart
                title="Gráfica no disponible en navegador"
                subtitle="Visualiza esta gráfica desde Android o Expo Go."
              />
            ) : isChartsLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : seriesChartData.length === 0 ? (
              <EmptyChart
                title="Sin datos en el período seleccionado"
                subtitle="No hay ventas ni compras para construir la serie."
              />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                  data={lineChartData}
                  width={Math.max(chartWidth, seriesChartData.length * 70)}
                  height={260}
                  yAxisLabel="$"
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                  fromZero
                />
              </ScrollView>
            )}
          </ChartCard>

          <ChartCard
            title="Ventas por categoría"
            subtitle="Top categorías de productos vendidas en el período."
          >
            {isWeb ? (
              <EmptyChart
                title="Gráfica no disponible en navegador"
                subtitle="Visualiza esta gráfica desde Android o Expo Go."
              />
            ) : isChartsLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : ventasPorCategoriaChartData.length === 0 ? (
              <EmptyChart
                title="Sin ventas por categoría"
                subtitle="No hay facturación suficiente para agrupar por categoría."
              />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={ventasCategoriaBarData}
                  width={Math.max(
                    chartWidth,
                    ventasPorCategoriaChartData.length * 76
                  )}
                  height={260}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero
                  showValuesOnTopOfBars
                />
              </ScrollView>
            )}
          </ChartCard>

          <ChartCard
            title="Compras por proveedor"
            subtitle="Top proveedores por monto comprado en el período."
          >
            {isWeb ? (
              <EmptyChart
                title="Gráfica no disponible en navegador"
                subtitle="Visualiza esta gráfica desde Android o Expo Go."
              />
            ) : isChartsLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : comprasPorProveedorChartData.length === 0 ? (
              <EmptyChart
                title="Sin compras por proveedor"
                subtitle="No hay compras suficientes para construir el ranking."
              />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={comprasProveedorBarData}
                  width={Math.max(
                    chartWidth,
                    comprasPorProveedorChartData.length * 76
                  )}
                  height={260}
                  yAxisLabel="$"
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  style={styles.chart}
                  fromZero
                  showValuesOnTopOfBars
                />
              </ScrollView>
            )}
          </ChartCard>
        </>
      )}

      <SectionBlock
        title="Ventas"
        subtitle="Indicadores comerciales y de cartera filtrados por bodega."
      >
        {ventasCards.map((card) => (
          <ModuleStatCard key={card.title} {...card} />
        ))}
      </SectionBlock>

      <SectionBlock
        title="Compras"
        subtitle="Seguimiento de órdenes y remisiones de compra."
      >
        {comprasCards.map((card) => (
          <ModuleStatCard key={card.title} {...card} />
        ))}
      </SectionBlock>

      <SectionBlock
        title="Inventario y logística"
        subtitle="Disponibilidad, alertas de stock y movimientos entre bodegas."
      >
        {inventarioCards.map((card) => (
          <ModuleStatCard key={card.title} {...card} />
        ))}
      </SectionBlock>

      <SectionBlock
        title="Terceros"
        subtitle="Clientes y proveedores activos relacionados con la operación visible."
      >
        {tercerosCards.map((card) => (
          <ModuleStatCard key={card.title} {...card} />
        ))}
      </SectionBlock>

      <QuickActions actions={quickActions} />
    </ScrollView>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#FFFFFF",
  backgroundGradientTo: "#FFFFFF",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(52, 103, 235, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#2563EB",
  },
  propsForBackgroundLines: {
    strokeDasharray: "",
    stroke: "#E5E7EB",
  },
  barPercentage: 0.6,
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 24,
  },
  centerState: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  stateText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },
  mainCardsWrap: {
    gap: 12,
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLoading: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBlock: {
    marginBottom: 16,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 8,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
}); 