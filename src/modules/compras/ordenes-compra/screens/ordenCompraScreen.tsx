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
import OrdenCompraCard from "../components/ordenCompraCard";
import { getCompras } from "../services/orden-compra.service";
import type { CompraListItem } from "../types/ordenes-compra.types";

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export default function OrdenesCompraScreen() {
  const selectedBodegaId = useBodegaStore((state) => state.selectedBodegaId);

  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["ordenes-compra", selectedBodegaId],
    queryFn: () =>
      getCompras({
        selectedBodegaId,
      }),
  });

  const filteredData = useMemo(() => {
    const data = query.data ?? [];
    const term = normalizeText(search);

    if (!term) return data;

    return data.filter((compra: CompraListItem) => {
      const bucket = [
        compra.codigo_compra,
        compra.proveedor?.nombre_empresa,
        compra.proveedor?.num_documento,
        compra.proveedor?.telefono ?? "",
        compra.estado_compra?.nombre_estado,
        compra.termino_pago?.nombre_termino,
        compra.bodega?.nombre_bodega,
        compra.descripcion,
      ]
        .map((value) => normalizeText(value))
        .join(" ");

      return bucket.includes(term);
    });
  }, [query.data, search]);

  const totalPendientes = useMemo(() => {
    return (query.data ?? []).filter(
      (item) =>
        normalizeText(item.estado_compra?.nombre_estado) === "pendiente"
    ).length;
  }, [query.data]);

  const totalAprobadas = useMemo(() => {
    return (query.data ?? []).filter(
      (item) =>
        normalizeText(item.estado_compra?.nombre_estado) === "aprobada"
    ).length;
  }, [query.data]);

    const totalAnuladas = useMemo(() => {
    return (query.data ?? []).filter(
      (item) =>
        normalizeText(item.estado_compra?.nombre_estado) === "anulada"
    ).length;
  }, [query.data]);

  if (query.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando órdenes de compra...</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>
          No fue posible cargar las órdenes de compra
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
        <Text style={styles.title}>Órdenes de compra</Text>
        <Text style={styles.subtitle}>
          Consulta por bodega las órdenes registradas
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
          placeholder="Buscar órdenes..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Órdenes visibles</Text>
          <Text style={styles.summaryValue}>{filteredData.length}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pendientes</Text>
          <Text style={styles.summaryValue}>{totalPendientes}</Text>
        </AppCard>
      </View>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Aprobadas</Text>
          <Text style={styles.summaryValue}>{totalAprobadas}</Text>
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
              No encontramos órdenes de compra para ese criterio de búsqueda.
            </Text>
          </AppCard>
        ) : (
          filteredData.map((compra) => (
            <OrdenCompraCard key={compra.id_compra} compra={compra} />
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
  summaryValueSmall: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
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
