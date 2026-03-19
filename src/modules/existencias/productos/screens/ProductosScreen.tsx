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
import ProductoInventoryCard from "../../productos/components/ProductoInventoryCard";
import { getProductosVista } from "../services/existencias.service";
import type { ProductoVista } from "../types/existencias.types";

export default function ProductosScreen() {
  const selectedBodegaId = useBodegaStore((state) => state.selectedBodegaId);
  const selectedBodegaLabel = useBodegaStore(
    (state) => state.selectedBodegaLabel
  );

  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["productos-vista", selectedBodegaId],
    queryFn: () =>
      getProductosVista({
        selectedBodegaId,
      }),
  });

  const filteredData = useMemo(() => {
    const data = query.data ?? [];
    const term = search.trim().toLowerCase();

    if (!term) return data;

    return data.filter((producto: ProductoVista) => {
      const nombre = producto.nombre_producto?.toLowerCase() ?? "";
      const categoria =
        producto.categoria_producto?.nombre_categoria?.toLowerCase() ?? "";

      return nombre.includes(term) || categoria.includes(term);
    });
  }, [query.data, search]);

  if (query.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando productos...</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>No fue posible cargar productos</Text>
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
        <Text style={styles.title}>Productos</Text>
        <Text style={styles.subtitle}>
          Existencias en cada una de las Bodegas
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
          placeholder="Buscar productos..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Productos visibles</Text>
          <Text style={styles.summaryValue}>{filteredData.length}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Bodega actual</Text>
          <Text style={styles.summaryValueSmall} numberOfLines={1}>
            {selectedBodegaLabel}
          </Text>
        </AppCard>
      </View>

      <View style={styles.listSection}>
        {filteredData.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No encontramos productos para ese criterio de búsqueda.
            </Text>
          </AppCard>
        ) : (
          filteredData.map((producto) => (
            <ProductoInventoryCard
              key={producto.id_producto}
              producto={producto}
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