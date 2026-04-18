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
import { typography } from "@/core/theme/typography";
import {
  getCotizacionById,
  type CotizacionDetail,
} from "../services/cotizaciones.service";
import type { CotizacionItem } from "../types/cotizaciones.types";

type Props = {
  cotizacion: CotizacionItem;
};

function formatCurrency(value?: number | null) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value?: string | null) {
  if (!value) return "No registrada";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getEstadoStyles(value?: string | null) {
  const normalized = (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  switch (normalized) {
    case "pendiente":
      return {
        badge: styles.statusPending,
        text: styles.statusTextPending,
        label: "Pendiente",
      };

    case "aprobada":
      return {
        badge: styles.statusApproved,
        text: styles.statusTextApproved,
        label: "Aprobada",
      };

    case "rechazada":
      return {
        badge: styles.statusRejected,
        text: styles.statusTextRejected,
        label: "Rechazada",
      };

    case "vencida":
      return {
        badge: styles.statusExpired,
        text: styles.statusTextExpired,
        label: "Vencida",
      };

    case "anulada":
      return {
        badge: styles.statusCancelled,
        text: styles.statusTextCancelled,
        label: "Anulada",
      };

    default:
      return {
        badge: styles.statusNeutral,
        text: styles.statusTextNeutral,
        label: value || "Sin estado",
      };
  }
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailBox}>
      <View style={styles.detailLabelRow}>
        <Ionicons
          name={icon}
          size={14}
          color={colors.primary}
          style={styles.detailIcon}
        />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value || "No registrado"}</Text>
    </View>
  );
}

export default function CotizacionCard({ cotizacion }: Props) {
  const [expanded, setExpanded] = useState(false);

  const detailQuery = useQuery<CotizacionDetail>({
    queryKey: ["cotizacion-detail-mobile", cotizacion.id],
    queryFn: () => getCotizacionById(cotizacion.id),
    enabled: expanded,
    staleTime: 30000,
  });

  const estadoStyles = useMemo(
    () => getEstadoStyles(cotizacion.estado),
    [cotizacion.estado]
  );

  const detailData = detailQuery.data;

  return (
    <AppCard style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.topRow}>
          <View style={styles.headerContent}>
            <Text style={styles.code}>
              {cotizacion.codigo || `Cotización #${cotizacion.id}`}
            </Text>

            <Text style={styles.name} numberOfLines={2}>
              {cotizacion.cliente || "Cliente no disponible"}
            </Text>
          </View>

          <View style={[styles.statusBadge, estadoStyles.badge]}>
            <Text style={[styles.statusText, estadoStyles.text]}>
              {estadoStyles.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText}>
              {formatDate(cotizacion.fecha)}
            </Text>
          </View>

          <View style={styles.metaChip}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText}>
              Vence: {formatDate(cotizacion.fechaVencimiento)}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons
              name="business-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {cotizacion.bodega || "Sin bodega"}
            </Text>
          </View>

          <View style={styles.metaChip}>
            <Ionicons
              name="basket-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText}>
              {cotizacion.totalItems} item{cotizacion.totalItems === 1 ? "" : "s"}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomValue}>{formatCurrency(cotizacion.total)}</Text>
          </View>

          <View style={styles.expandButton}>
            <Ionicons
              name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
              size={20}
              color={colors.primary}
            />
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.detailWrap}>
          {detailQuery.isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando detalle...</Text>
            </View>
          ) : detailQuery.isError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>
                No fue posible cargar el detalle
              </Text>
              <Text style={styles.errorText}>Intenta nuevamente.</Text>
            </View>
          ) : (
            <>
              <View style={styles.detailsGrid}>
                <DetailRow
                  icon="person-outline"
                  label="Cliente"
                  value={detailData?.cliente || cotizacion.cliente}
                />

                <DetailRow
                  icon="card-outline"
                  label="Documento"
                  value={
                    [
                      detailData?.tipoDocumentoCliente || cotizacion.tipoDocumentoCliente,
                      detailData?.numeroDocumentoCliente || cotizacion.numeroDocumentoCliente,
                    ]
                      .filter(Boolean)
                      .join(": ") || "No registrado"
                  }
                />

                <DetailRow
                  icon="business-outline"
                  label="Bodega"
                  value={detailData?.bodega || cotizacion.bodega}
                />

                <DetailRow
                  icon="document-text-outline"
                  label="Observaciones"
                  value={
                    detailData?.observaciones ||
                    cotizacion.observaciones ||
                    "Sin observaciones"
                  }
                />
              </View>

              <View style={styles.productsSection}>
                <Text style={styles.sectionTitle}>Productos</Text>

                {(detailData?.productos ?? []).length === 0 ? (
                  <View style={styles.emptyProductsBox}>
                    <Text style={styles.emptyProductsText}>
                      Esta cotización no tiene productos visibles en el detalle.
                    </Text>
                  </View>
                ) : (
                  (detailData?.productos ?? []).map((item) => (
                    <View key={`${item.idDetalle}-${item.idProducto}`} style={styles.productRow}>
                      <View style={styles.productHeader}>
                        <Text style={styles.productName} numberOfLines={2}>
                          {item.nombreProducto || `Producto #${item.idProducto}`}
                        </Text>
                        <Text style={styles.productTotal}>
                          {formatCurrency(item.total)}
                        </Text>
                      </View>

                      <View style={styles.productMetaRow}>
                        <Text style={styles.productMetaText}>
                          Cantidad: {item.cantidad}
                        </Text>
                        <Text style={styles.productMetaText}>
                          P. unitario: {formatCurrency(item.precioUnitario)}
                        </Text>
                      </View>

                      <View style={styles.productMetaRow}>
                        <Text style={styles.productMetaText}>
                          IVA: {item.porcentajeIva}%
                        </Text>
                        <Text style={styles.productMetaText}>
                          Subtotal: {formatCurrency(item.subtotal)}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>

              <View style={styles.resumeSection}>
                <View style={styles.resumeRow}>
                  <Text style={styles.resumeLabel}>Subtotal</Text>
                  <Text style={styles.resumeValue}>
                    {formatCurrency(detailData?.subtotal ?? cotizacion.subtotal)}
                  </Text>
                </View>

                <View style={styles.resumeRow}>
                  <Text style={styles.resumeLabel}>Total IVA</Text>
                  <Text style={styles.resumeValue}>
                    {formatCurrency(detailData?.totalIva ?? cotizacion.totalIva)}
                  </Text>
                </View>

                <View style={[styles.resumeRow, styles.resumeRowStrong]}>
                  <Text style={styles.resumeLabelStrong}>Total</Text>
                  <Text style={styles.resumeValueStrong}>
                    {formatCurrency(detailData?.total ?? cotizacion.total)}
                  </Text>
                </View>
              </View>
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
    padding: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  headerContent: {
    flex: 1,
  },
  code: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    lineHeight: 24,
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },

  statusPending: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
  },
  statusTextPending: {
    color: "#92400E",
  },

  statusApproved: {
    backgroundColor: "#DCFCE7",
    borderColor: "#BBF7D0",
  },
  statusTextApproved: {
    color: "#166534",
  },

  statusRejected: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  statusTextRejected: {
    color: "#991B1B",
  },

  statusExpired: {
    backgroundColor: "#EDE9FE",
    borderColor: "#DDD6FE",
  },
  statusTextExpired: {
    color: "#5B21B6",
  },

  statusCancelled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  statusTextCancelled: {
    color: "#374151",
  },

  statusNeutral: {
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.border,
  },
  statusTextNeutral: {
    color: colors.textSecondary,
  },

  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    maxWidth: "100%",
  },
  metaIcon: {
    marginRight: 6,
  },
  metaChipText: {
    color: colors.primaryDark,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
    maxWidth: 220,
  },

  bottomRow: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomInfo: {
    flex: 1,
  },
  bottomLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  bottomValue: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
  },
  expandButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },

  detailWrap: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: 16,
  },
  centerState: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  errorTitle: {
    color: "#991B1B",
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 4,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },

  detailsGrid: {
    gap: 10,
  },
  detailBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },

  productsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 10,
  },
  emptyProductsBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 14,
  },
  emptyProductsText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  productRow: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 12,
    marginBottom: 10,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  productName: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    lineHeight: 20,
  },
  productTotal: {
    color: colors.primary,
    fontSize: 14,
    fontFamily: typography.fontFamily.extrabold,
  },
  productMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  productMetaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
  },

  resumeSection: {
    marginTop: 12,
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D9E6FF",
  },
  resumeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  resumeRowStrong: {
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#D9E6FF",
    marginBottom: 0,
  },
  resumeLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  resumeValue: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.semibold,
  },
  resumeLabelStrong: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },
  resumeValueStrong: {
    color: colors.primaryDark,
    fontSize: 16,
    fontFamily: typography.fontFamily.extrabold,
  },
});