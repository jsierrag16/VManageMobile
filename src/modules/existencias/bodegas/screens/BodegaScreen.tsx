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
import BodegaCard from "../components/BodegaCard";
import { getBodegas } from "../services/bodegas.service";
import type { EstadoBodegaFilter } from "../types/bodega.types";

const FILTERS: Array<{ label: string; value: EstadoBodegaFilter }> = [
  { label: "Todas", value: "all" },
  { label: "Activas", value: "true" },
  { label: "Inactivas", value: "false" },
];

export default function BodegasScreen() {
  const selectedBodegaLabel = useBodegaStore(
    (state) => state.selectedBodegaLabel
  );

  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoBodegaFilter>("all");

  const query = useQuery({
    queryKey: ["bodegas-mobile"],
    queryFn: () => getBodegas(),
  });

  const filteredData = useMemo(() => {
    const data = query.data ?? [];
    const term = search.trim().toLowerCase();

    return data.filter((bodega) => {
      const nombre = bodega.nombre_bodega?.toLowerCase() ?? "";
      const direccion = bodega.direccion?.toLowerCase() ?? "";
      const municipio = bodega.municipios?.nombre_municipio?.toLowerCase() ?? "";
      const departamento =
        bodega.municipios?.departamentos?.nombre_departamento?.toLowerCase() ??
        "";

      const matchesSearch =
        !term ||
        nombre.includes(term) ||
        direccion.includes(term) ||
        municipio.includes(term) ||
        departamento.includes(term);

      const matchesEstado =
        estadoFilter === "all"
          ? true
          : estadoFilter === "true"
          ? bodega.estado
          : !bodega.estado;

      return matchesSearch && matchesEstado;
    });
  }, [query.data, search, estadoFilter]);

  const totalActivas = useMemo(() => {
    const data = query.data ?? [];
    return data.filter((item) => item.estado).length;
  }, [query.data]);

  if (query.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando bodegas...</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>No fue posible cargar bodegas</Text>
        <Text style={styles.errorText}>
          Revisa la conexión o intenta nuevamente.
        </Text>
      </AppCard>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={query.isRefetching}
          onRefresh={query.refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Bodegas</Text>
        <Text style={styles.subtitle}>
          Vista general de centros de almacenamiento
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
          placeholder="Buscar bodegas..."
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
          <Text style={styles.summaryLabel}>Bodegas visibles</Text>
          <Text style={styles.summaryValue}>{filteredData.length}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Activas</Text>
          <Text style={styles.summaryValue}>{totalActivas}</Text>
        </AppCard>
      </View>

      <View style={styles.listSection}>
        {filteredData.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No encontramos bodegas para ese criterio de búsqueda.
            </Text>
          </AppCard>
        ) : (
          filteredData.map((bodega) => (
            <BodegaCard key={bodega.id_bodega} bodega={bodega} />
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
  contextChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    backgroundColor: "#EEF3FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  contextChipText: {
    flexShrink: 1,
    color: "#3467EB",
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
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
  filtersRow: {
    gap: 10,
    marginBottom: 14,
    paddingRight: 6,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    color: "#FFFFFF",
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