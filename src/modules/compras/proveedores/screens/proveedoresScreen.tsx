import axios from "axios";
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
import ProveedorCard from "../components/proveedorCard";
import {
  getProveedores,
  type ProveedorItem,
} from "../services/proveedores.service";

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
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

export default function ProveedoresScreen() {
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["proveedores-mobile"],
    queryFn: () =>
      getProveedores({
        page: 1,
        limit: 50,
      }),
    retry: 0,
    staleTime: 30000,
  });

  const filteredData = useMemo(() => {
    const data = query.data ?? [];
    const term = normalizeText(search);

    if (!term) return data;

    return data.filter((proveedor: ProveedorItem) => {
      const bucket = [
        proveedor.codigo_proveedor,
        proveedor.num_documento,
        proveedor.nombre_empresa,
        proveedor.email,
        proveedor.telefono,
        proveedor.nombre_contacto,
        proveedor.tipo_documento?.nombre_doc,
        proveedor.tipo_proveedor?.nombre_tipo_proveedor,
        proveedor.municipios?.nombre_municipio,
        proveedor.municipios?.departamentos?.nombre_departamento,
      ]
        .map((value) => normalizeText(value))
        .join(" ");

      return bucket.includes(term);
    });
  }, [query.data, search]);

  if (query.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando proveedores...</Text>
      </View>
    );
  }

  if (query.isError) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>No fue posible cargar proveedores</Text>
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
        <Text style={styles.title}>Proveedores</Text>
        <Text style={styles.subtitle}>
          Consulta y visualiza la información de tus proveedores
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
          placeholder="Buscar proveedores..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Proveedores visibles</Text>
          <Text style={styles.summaryValue}>{filteredData.length}</Text>
        </AppCard>
      </View>

      <View style={styles.listSection}>
        {filteredData.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No encontramos proveedores para ese criterio de búsqueda.
            </Text>
          </AppCard>
        ) : (
          filteredData.map((proveedor) => (
            <ProveedorCard
              key={proveedor.id_proveedor}
              proveedor={proveedor}
            />
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
