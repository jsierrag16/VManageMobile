import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { typography } from "@/core/theme/typography";
import { getRemisionCompraById } from "../services/remision-compra.service";
import type { RemisionCompraListItem } from "../types/remision-compra.types";
import { toNumber } from "../types/remision-compra.types";

type Props = {
  remision: RemisionCompraListItem;
};

function formatDate(dateString: string | null) {
  if (!dateString) return "Sin fecha";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatCurrency(value: string | number | null | undefined) {
  const amount = toNumber(value, 0);

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
  }).format(amount);
}

function normalizeEstado(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function getEstadoStyles(value?: string | null) {
  const estado = normalizeEstado(value);

  switch (estado) {
    case "PENDIENTE":
      return {
        chip: styles.pendingChip,
        text: styles.pendingText,
        label: "Pendiente",
      };
    case "RECIBIDA":
    case "APLICADA":
      return {
        chip: styles.approvedChip,
        text: styles.approvedText,
        label: value || "Aplicada",
      };
    case "ANULADA":
      return {
        chip: styles.cancelledChip,
        text: styles.cancelledText,
        label: "Anulada",
      };
    default:
      return {
        chip: styles.neutralChip,
        text: styles.neutralText,
        label: value || "Sin estado",
      };
  }
}

export default function RemisionCompraCard({ remision }: Props) {
  const [expanded, setExpanded] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["remision-compra-detail-mobile", remision.id_remision_compra],
    queryFn: () => getRemisionCompraById(remision.id_remision_compra),
    enabled: expanded,
    staleTime: 30000,
  });

  const estadoStyles = useMemo(
    () => getEstadoStyles(remision.estado_remision_compra?.nombre_estado),
    [remision.estado_remision_compra?.nombre_estado]
  );

  const proveedorLabel = remision.proveedor?.nombre_empresa || "Sin proveedor";
  const compraLabel = remision.compras?.codigo_compra || "Sin compra asociada";

  return (
    <AppCard style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.code}>{remision.codigo_remision_compra}</Text>
            <Text style={styles.title} numberOfLines={2}>
              {proveedorLabel}
            </Text>
            <Text style={styles.subtitle}>
              Creación: {formatDate(remision.fecha_creacion)}
            </Text>
          </View>

          <View style={[styles.statusChip, estadoStyles.chip]}>
            <Text style={[styles.statusText, estadoStyles.text]}>
              {estadoStyles.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons
              name="document-text-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText} numberOfLines={1}>
              Compra: {compraLabel}
            </Text>
          </View>

          <View style={styles.metaChip}>
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {remision.bodega?.nombre_bodega || "Sin bodega"}
            </Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Items</Text>
            <Text style={styles.statValue}>
              {remision._count?.detalle_remision_compra ?? 0}
            </Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Existencias</Text>
            <Text style={styles.statValue}>
              {remision.afecta_existencias ? "Sí" : "No"}
            </Text>
          </View>

          <View style={styles.expandWrap}>
            <Ionicons
              name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
              size={20}
              color={colors.primary}
            />
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.detailSection}>
          {detailQuery.isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando detalle...</Text>
            </View>
          ) : detailQuery.isError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>No fue posible cargar el detalle</Text>
              <Text style={styles.errorText}>Intenta nuevamente.</Text>
            </View>
          ) : (
            <>
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Fecha de vencimiento</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(detailQuery.data?.fecha_vencimiento ?? null)}
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Factura</Text>
                  <Text style={styles.infoValue}>
                    {detailQuery.data?.id_factura ?? "No asociada"}
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Aplicó existencias</Text>
                  <Text style={styles.infoValue}>
                    {detailQuery.data?.afecta_existencias ? "Sí" : "No"}
                  </Text>
                </View>

                <View style={styles.infoCard}>
                  <Text style={styles.infoLabel}>Fecha aplicación</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(detailQuery.data?.fecha_aplicacion_existencias ?? null)}
                  </Text>
                </View>

                <View style={[styles.infoCard, styles.fullWidth]}>
                  <Text style={styles.infoLabel}>Observaciones</Text>
                  <Text style={styles.infoValue}>
                    {detailQuery.data?.observaciones || "Sin observaciones"}
                  </Text>
                </View>
              </View>

              <Text style={styles.itemsTitle}>
                Detalle ({detailQuery.data?.detalle_remision_compra?.length ?? 0})
              </Text>

              {(detailQuery.data?.detalle_remision_compra ?? []).map((item) => (
                <View
                  key={item.id_detalle_remision_compra}
                  style={styles.itemCard}
                >
                  <View style={styles.itemTop}>
                    <Text style={styles.itemName}>
                      {item.producto?.nombre_producto || `Producto #${item.id_producto}`}
                    </Text>

                    <View style={styles.itemIvaChip}>
                      <Text style={styles.itemIvaChipText}>
                        IVA {toNumber(item.iva?.porcentaje, 0)}%
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemRow}>
                    <View>
                      <Text style={styles.itemLabel}>Cantidad</Text>
                      <Text style={styles.itemValue}>{toNumber(item.cantidad, 0)}</Text>
                    </View>

                    <View>
                      <Text style={styles.itemLabel}>Precio unitario</Text>
                      <Text style={styles.itemValue}>
                        {formatCurrency(item.precio_unitario)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.itemRowSecondary}>
                    <Text style={styles.itemSecondaryText}>
                      Lote: {item.lote || "Sin lote"}
                    </Text>
                    <Text style={styles.itemSecondaryText}>
                      Vence: {formatDate(item.fecha_vencimiento)}
                    </Text>
                  </View>

                  <View style={styles.itemRowSecondary}>
                    <Text style={styles.itemSecondaryText}>
                      Código barras: {item.codigo_barras || "No registrado"}
                    </Text>
                  </View>

                  {item.nota ? (
                    <View style={styles.noteBox}>
                      <Text style={styles.noteLabel}>Nota</Text>
                      <Text style={styles.noteText}>{item.nota}</Text>
                    </View>
                  ) : null}
                </View>
              ))}
            </>
          )}
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  code: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  statusChip: {
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pendingChip: {
    backgroundColor: "#FEF3C7",
  },
  pendingText: {
    color: "#B45309",
  },
  approvedChip: {
    backgroundColor: "#DDF4E4",
  },
  approvedText: {
    color: colors.success,
  },
  cancelledChip: {
    backgroundColor: "#FEE2E2",
  },
  cancelledText: {
    color: colors.danger,
  },
  neutralChip: {
    backgroundColor: "#EEF2F7",
  },
  neutralText: {
    color: colors.textSecondary,
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaChipText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
    maxWidth: 220,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  statBox: {
    marginRight: 20,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  statValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
  },
  expandWrap: {
    marginLeft: "auto",
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detailSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  centerState: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  errorBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 14,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
  },
  infoGrid: {
    gap: 10,
  },
  infoCard: {
    backgroundColor: colors.backgroundSoft,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  fullWidth: {
    width: "100%",
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: typography.fontFamily.bold,
  },
  itemsTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
    marginTop: 16,
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: colors.backgroundSoft,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 10,
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  itemName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
    flex: 1,
  },
  itemIvaChip: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemIvaChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 8,
  },
  itemRowSecondary: {
    marginTop: 2,
  },
  itemLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  itemValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
  },
  itemSecondaryText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: typography.fontFamily.medium,
  },
  noteBox: {
    marginTop: 10,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  noteLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  noteText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
  },
});
