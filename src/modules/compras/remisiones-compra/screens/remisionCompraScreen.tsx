import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import RemisionCompraCard from "../components/remisionCompraCard";
import { getRemisionesCompra } from "../services/remision-compra.service";
import type { RemisionCompraListItem } from "../types/remision-compra.types";

function normalizeText(value: string | null | undefined) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function RemisionesCompraScreen() {
  const selectedBodegaId = useBodegaStore((state) => state.selectedBodegaId);

  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["remisiones-compra", selectedBodegaId],
    queryFn: () =>
      getRemisionesCompra({
        selectedBodegaId,
      }),
  });

  const filteredData = useMemo(() => {
    const data = query.data ?? [];
    const term = normalizeText(search);

    if (!term) return data;

    return data.filter((remision: RemisionCompraListItem) => {
      const bucket = [
        remision.codigo_remision_compra,
        remision.proveedor?.nombre_empresa,
        remision.proveedor?.num_documento,
        remision.compras?.codigo_compra,
        remision.estado_remision_compra?.nombre_estado,
        remision.bodega?.nombre_bodega,
        remision.observaciones,
      ]
        .map((value) => normalizeText(value))
        .join(" ");

      return bucket.includes(term);
    });
  }, [query.data, search]);

  const totalPendientes = useMemo(() => {
    return (query.data ?? []).filter(
      (item) =>
        normalizeText(item.estado_remision_compra?.nombre_estado) === "pendiente"
    ).length;
  }, [query.data]);

  const totalAplicadas = useMemo(() => {
    return (query.data ?? []).filter((item) => {
      const estado = normalizeText(item.estado_remision_compra?.nombre_estado);
      return estado === "aplicada" || estado === "recibida";
    }).length;
  }, [query.data]);

  const totalAnuladas = useMemo(() => {
    return (query.data ?? []).filter(
      (item) =>
        normalizeText(item.estado_remision_compra?.nombre_estado) === "anulada"
    ).length;
  }, [query.data]);

  if (query.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando remisiones de compra...</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>
          No fue posible cargar las remisiones de compra
        </Text>
        <Text style={styles.errorText}>
          Revisa la conexión o intenta nuevamente.
        </Text>
      </AppCard>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={query.refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Remisiones de compra</Text>
        <Text style={styles.subtitle}>
          Consulta por bodega las remisiones registradas
        </Text>
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
          placeholder="Buscar remisiones..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Remisiones visibles</Text>
          <Text style={styles.summaryValue}>{filteredData.length}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pendientes</Text>
          <Text style={styles.summaryValue}>{totalPendientes}</Text>
        </AppCard>
      </View>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Aplicadas</Text>
          <Text style={styles.summaryValue}>{totalAplicadas}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Anuladas</Text>
          <Text style={styles.summaryValue}>{totalAnuladas}</Text>
        </AppCard>
      </View>

      <View style={styles.listSection}>
        {filteredData.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No encontramos remisiones de compra para ese criterio de búsqueda.
            </Text>
          </AppCard>
        ) : (
          filteredData.map((remision) => (
            <RemisionCompraCard
              key={remision.id_remision_compra}
              remision={remision}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 12,
  },
  searchWrap: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    paddingVertical: 14,
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 26,
    fontFamily: typography.fontFamily.extrabold,
  },
  listSection: {
    marginTop: 4,
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
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
});