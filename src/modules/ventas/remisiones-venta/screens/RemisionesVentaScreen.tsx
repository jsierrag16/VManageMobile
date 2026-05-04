import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import { useBodegaStore } from "@/modules/existencias/bodegas/store/bodega.store";
import RemisionVentaCard from "../components/RemisionVentaCard";
import { getRemisionesVenta } from "../services/remisionesVenta.service";
import type {
  RemisionVentaEstadoFilter,
  RemisionVentaItem,
} from "../types/remisionesVenta.types";

const FILTERS: Array<{ label: string; value: RemisionVentaEstadoFilter }> = [
  { label: "Todas", value: "all" },
  { label: "Pendientes", value: "Pendiente" },
  { label: "Despachadas", value: "Despachado" },
  { label: "Entregadas", value: "Entregado" },
  { label: "Facturadas", value: "Facturada" },
  { label: "Anuladas", value: "Anulada" },
];

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message;

    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string" && message.trim()) return message.trim();

    return "Error de conexión con la API";
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Revisa la conexión o intenta nuevamente.";
}

export default function RemisionesVentaScreen() {
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] =
    useState<RemisionVentaEstadoFilter>("all");

  const selectedBodegaId = useBodegaStore((state) => state.selectedBodegaId);
  const selectedBodegaLabel = useBodegaStore((state) => state.selectedBodegaLabel);

  const query = useQuery({
    queryKey: ["remisiones-venta-mobile", selectedBodegaId],
    queryFn: () =>
      getRemisionesVenta({
        page: 1,
        limit: 1000,
        idBodega: selectedBodegaId ?? undefined,
        includeRefs: true,
      }),
    retry: 0,
    staleTime: 30000,
  });

  const filteredData = useMemo(() => {
    const data = query.data ?? [];
    const term = normalizeText(search);

    return data.filter((remision: RemisionVentaItem) => {
      const matchesEstado =
        estadoFilter === "all" || remision.estado === estadoFilter;

      if (!matchesEstado) return false;

      const bucket = [
        remision.codigo,
        remision.cliente,
        remision.numeroDocumentoCliente,
        remision.tipoDocumentoCliente,
        remision.bodega,
        remision.estado,
        remision.descripcion,
      ]
        .map((value) => normalizeText(value))
        .join(" ");

      if (!term) return true;
      return bucket.includes(term);
    });
  }, [query.data, search, estadoFilter]);

  const stats = useMemo(() => {
    const data = query.data ?? [];

    return {
      visibles: filteredData.length,
      pendientes: data.filter((item) => item.estado === "Pendiente").length,
      entregadas: data.filter((item) => item.estado === "Entregado").length,
      total: filteredData.reduce((acc, item) => acc + (item.total || 0), 0),
    };
  }, [query.data, filteredData]);

  if (query.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando remisiones de venta...</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>
          No fue posible cargar remisiones de venta
        </Text>
        <Text style={styles.errorText}>{getErrorMessage(query.error)}</Text>
      </AppCard>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={query.refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Remisiones de venta</Text>
        <Text style={styles.subtitle}>
          Visualiza tus remisiones y consulta el detalle completo
        </Text>

        <View style={styles.contextChip}>
          <Ionicons
            name="business-outline"
            size={14}
            color={colors.primary}
            style={styles.contextChipIcon}
          />
          <Text style={styles.contextChipText}>
            {selectedBodegaLabel || "Todas las bodegas"}
          </Text>
        </View>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons
          name="search-outline"
          size={20}
          color={colors.textMuted}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por código, cliente o documento..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {FILTERS.map((filter) => {
          const active = estadoFilter === filter.value;

          return (
            <Pressable
              key={filter.value}
              onPress={() => setEstadoFilter(filter.value)}
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  active && styles.filterChipTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Visibles</Text>
          <Text style={styles.summaryValue}>{stats.visibles}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pendientes</Text>
          <Text style={styles.summaryValue}>{stats.pendientes}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Entregadas</Text>
          <Text style={styles.summaryValue}>{stats.entregadas}</Text>
        </AppCard>
      </View>

      <AppCard style={styles.totalCard}>
        <Text style={styles.totalCardLabel}>Total visible</Text>
        <Text style={styles.totalCardValue}>
          {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
          }).format(stats.total)}
        </Text>
      </AppCard>

      <View style={styles.listSection}>
        {filteredData.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No encontramos remisiones de venta para ese criterio.
            </Text>
          </AppCard>
        ) : (
          filteredData.map((remision) => (
            <RemisionVentaCard key={remision.id} remision={remision} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
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

  header: {
    marginBottom: 16,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },
  contextChip: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  contextChipIcon: {
    marginRight: 6,
  },
  contextChipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },

  searchWrap: {
    position: "relative",
    marginBottom: 14,
  },
  searchIcon: {
    position: "absolute",
    left: 14,
    top: 14,
    zIndex: 1,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingLeft: 42,
    paddingRight: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },

  filtersRow: {
    paddingBottom: 8,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  filterChipTextActive: {
    color: colors.white,
  },

  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 14,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: typography.fontFamily.extrabold,
  },

  totalCard: {
    marginBottom: 14,
    backgroundColor: colors.primarySoft,
    borderColor: "#D9E6FF",
  },
  totalCardLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 6,
  },
  totalCardValue: {
    color: colors.primaryDark,
    fontSize: 24,
    fontFamily: typography.fontFamily.extrabold,
  },

  listSection: {
    marginTop: 2,
  },

  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },

  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },
});