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
  Pressable,
} from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import { useBodegaStore } from "@/modules/existencias/bodegas/store/bodega.store";
import FacturaPagoCard from "../components/FacturaPagoCard";
import {
  getClientesActivos,
  getFacturasPagosAbonos,
} from "../services/pagosAbonos.service";
import {
  formatMoney,
  type ClienteOption,
} from "../types/pagosAbonos.types";

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

export default function PagosAbonosScreen() {
  const { selectedBodegaId } = useBodegaStore();

  const [search, setSearch] = useState("");
  const [selectedClienteId, setSelectedClienteId] = useState<number | null>(null);

  const clientesQuery = useQuery({
    queryKey: ["clientes-mobile-pagos-abonos"],
    queryFn: getClientesActivos,
    staleTime: 30000,
    retry: 0,
  });

  const facturasQuery = useQuery({
    queryKey: ["facturas-mobile-pagos-abonos", selectedBodegaId],
    queryFn: () => getFacturasPagosAbonos(selectedBodegaId),
    staleTime: 10000,
    retry: 0,
  });

  const selectedCliente = useMemo<ClienteOption | null>(() => {
    return (
      clientesQuery.data?.find((item) => item.id === selectedClienteId) ?? null
    );
  }, [clientesQuery.data, selectedClienteId]);

  const filteredFacturas = useMemo(() => {
    const data = facturasQuery.data ?? [];
    const term = normalizeText(search);

    return data.filter((factura) => {
      const matchesCliente =
        selectedClienteId == null ||
        factura.remisiones.some((r) => r.clienteNombre === selectedCliente?.nombre) ||
        normalizeText(factura.clienteNombre) === normalizeText(selectedCliente?.nombre);

      if (!matchesCliente) return false;

      if (!term) return true;

      const bucket = [
        factura.codigo,
        factura.clienteNombre,
        factura.clienteDocumento,
        factura.clienteTipoDocumento,
        factura.estado,
        ...factura.remisiones.map((r) => r.codigo),
        ...factura.pagos.map((p) => p.metodoPago),
      ]
        .map((item) => normalizeText(item))
        .join(" ");

      return bucket.includes(term);
    });
  }, [facturasQuery.data, search, selectedClienteId, selectedCliente]);

  const totalFacturado = useMemo(
    () =>
      filteredFacturas.reduce(
        (acc, item) => acc + item.resumenPago.total_factura,
        0
      ),
    [filteredFacturas]
  );

  const totalAbonado = useMemo(
    () =>
      filteredFacturas.reduce(
        (acc, item) => acc + item.resumenPago.total_abonado,
        0
      ),
    [filteredFacturas]
  );

  const totalPendiente = useMemo(
    () =>
      filteredFacturas.reduce(
        (acc, item) => acc + item.resumenPago.saldo_pendiente,
        0
      ),
    [filteredFacturas]
  );

  if (clientesQuery.isLoading || facturasQuery.isLoading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.stateText}>Cargando pagos y abonos...</Text>
      </View>
    );
  }

  if (clientesQuery.isError || facturasQuery.isError) {
    return (
      <AppCard>
        <Text style={styles.errorTitle}>No fue posible cargar Pagos y Abonos</Text>
        <Text style={styles.errorText}>
          {getErrorMessage(clientesQuery.error ?? facturasQuery.error)}
        </Text>
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
          refreshing={facturasQuery.isRefetching}
          onRefresh={facturasQuery.refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Pagos y abonos</Text>
        <Text style={styles.subtitle}>
          Consulta facturas, remisiones asociadas y abonos registrados
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
          placeholder="Buscar factura, cliente, remisión o método..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.clientRow}
      >
        <Pressable
          style={[
            styles.clientChip,
            selectedClienteId === null && styles.clientChipActive,
          ]}
          onPress={() => setSelectedClienteId(null)}
        >
          <Text
            style={[
              styles.clientChipText,
              selectedClienteId === null && styles.clientChipTextActive,
            ]}
          >
            Todos
          </Text>
        </Pressable>

        {(clientesQuery.data ?? []).map((cliente) => {
          const active = selectedClienteId === cliente.id;

          return (
            <Pressable
              key={cliente.id}
              style={[styles.clientChip, active && styles.clientChipActive]}
              onPress={() => setSelectedClienteId(cliente.id)}
            >
              <Text
                style={[
                  styles.clientChipText,
                  active && styles.clientChipTextActive,
                ]}
              >
                {cliente.nombre}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.summaryRow}>
        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Facturado</Text>
          <Text style={styles.summaryValue}>{formatMoney(totalFacturado)}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Abonado</Text>
          <Text style={styles.summaryValue}>{formatMoney(totalAbonado)}</Text>
        </AppCard>

        <AppCard style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Pendiente</Text>
          <Text style={styles.summaryValue}>{formatMoney(totalPendiente)}</Text>
        </AppCard>
      </View>

      <View style={styles.listSection}>
        {filteredFacturas.length === 0 ? (
          <AppCard>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No encontramos facturas para ese criterio.
            </Text>
          </AppCard>
        ) : (
          filteredFacturas.map((factura) => (
            <FacturaPagoCard key={factura.id} factura={factura} />
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
    lineHeight: 20,
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
    borderRadius: 16,
    paddingLeft: 42,
    paddingRight: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },
  clientRow: {
    gap: 10,
    paddingBottom: 6,
    marginBottom: 14,
  },
  clientChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  clientChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  clientChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  clientChipTextActive: {
    color: colors.white,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    minWidth: 100,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 8,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.extrabold,
  },
  listSection: {
    marginTop: 4,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },
  errorTitle: {
    color: colors.danger,
    fontSize: 16,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 8,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },
});