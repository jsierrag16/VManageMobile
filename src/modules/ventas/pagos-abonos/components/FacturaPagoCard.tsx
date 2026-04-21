import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { typography } from "@/core/theme/typography";
import {
  formatMoney,
  type FacturaItem,
} from "../types/pagosAbonos.types";

type Props = {
  factura: FacturaItem;
};

function normalizeText(value?: string | null) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getEstadoStyles(estado?: string | null) {
  const value = normalizeText(estado);

  if (value.includes("pagad")) {
    return {
      badge: styles.statusSuccess,
      text: styles.statusSuccessText,
      label: estado || "Pagada",
    };
  }

  if (value.includes("abon")) {
    return {
      badge: styles.statusWarning,
      text: styles.statusWarningText,
      label: estado || "Abonada",
    };
  }

  if (value.includes("anulad")) {
    return {
      badge: styles.statusDanger,
      text: styles.statusDangerText,
      label: estado || "Anulada",
    };
  }

  return {
    badge: styles.statusNeutral,
    text: styles.statusNeutralText,
    label: estado || "Pendiente",
  };
}

export default function FacturaPagoCard({ factura }: Props) {
  const [expanded, setExpanded] = useState(false);

  const estadoStyles = useMemo(
    () => getEstadoStyles(factura.estado),
    [factura.estado]
  );

  return (
    <AppCard style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.topRow}>
          <View style={styles.headerBlock}>
            <Text style={styles.code}>
              {factura.codigo || `Factura #${factura.id}`}
            </Text>
            <Text style={styles.name} numberOfLines={2}>
              {factura.clienteNombre || "Sin cliente"}
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
            <Ionicons name="card-outline" size={14} color={colors.primary} />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {factura.clienteTipoDocumento || "Doc."}:{" "}
              {factura.clienteDocumento || "Sin número"}
            </Text>
          </View>

          <View style={styles.metaChip}>
            <Ionicons name="calendar-outline" size={14} color={colors.primary} />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {factura.fechaFactura?.slice(0, 10) || "Sin fecha"}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total factura</Text>
            <Text style={styles.summaryValue}>
              {formatMoney(factura.resumenPago.total_factura)}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Abonado</Text>
            <Text style={styles.summaryValue}>
              {formatMoney(factura.resumenPago.total_abonado)}
            </Text>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Saldo pendiente</Text>
            <Text style={styles.summaryValue}>
              {formatMoney(factura.resumenPago.saldo_pendiente)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>
            {factura.remisiones.length} remisión(es) · {factura.pagos.length} abono(s)
          </Text>

          <Ionicons
            name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color={colors.primary}
          />
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.detailWrap}>
          <Text style={styles.sectionTitle}>Remisiones asociadas</Text>
          {factura.remisiones.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No hay remisiones asociadas.</Text>
            </View>
          ) : (
            factura.remisiones.map((remision) => (
              <View key={remision.id} style={styles.block}>
                <View style={styles.blockHeader}>
                  <Text style={styles.blockTitle}>
                    {remision.codigo || `Remisión #${remision.id}`}
                  </Text>
                  <Text style={styles.blockSubtitle}>
                    {formatMoney(remision.total)}
                  </Text>
                </View>

                <Text style={styles.blockMeta}>
                  {remision.bodegaNombre || "Sin bodega"} ·{" "}
                  {remision.fecha?.slice(0, 10) || "Sin fecha"}
                </Text>

                {remision.detalles.map((item, index) => (
                  <View key={`${remision.id}-${index}`} style={styles.detailItem}>
                    <Text style={styles.detailItemName}>
                      {item.productoNombre || "Producto"}
                    </Text>
                    <Text style={styles.detailItemMeta}>
                      {item.cantidad} × {formatMoney(item.precio_unitario)} · IVA {item.iva}%
                    </Text>
                  </View>
                ))}
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Abonos registrados</Text>
          {factura.pagos.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Esta factura aún no tiene abonos.</Text>
            </View>
          ) : (
            factura.pagos.map((pago) => (
              <View key={pago.id} style={styles.paymentRow}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentTitle}>
                    {formatMoney(pago.valor)}
                  </Text>
                  <Text style={styles.paymentMeta}>
                    {pago.metodoPago} · {pago.fechaPago?.slice(0, 10) || "Sin fecha"}
                  </Text>
                </View>

                <View style={pago.estado ? styles.activeBadge : styles.annulledBadge}>
                  <Text
                    style={
                      pago.estado ? styles.activeBadgeText : styles.annulledBadgeText
                    }
                  >
                    {pago.estado ? "Activo" : "Anulado"}
                  </Text>
                </View>
              </View>
            ))
          )}

          {factura.nota ? (
            <>
              <Text style={styles.sectionTitle}>Nota</Text>
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>{factura.nota}</Text>
              </View>
            </>
          ) : null}
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
  headerBlock: {
    flex: 1,
  },
  code: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 4,
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
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  statusSuccess: {
    backgroundColor: colors.greenSoft,
  },
  statusSuccessText: {
    color: colors.success,
  },
  statusWarning: {
    backgroundColor: colors.orangeSoft,
  },
  statusWarningText: {
    color: colors.warning,
  },
  statusDanger: {
    backgroundColor: "#FEE2E2",
  },
  statusDangerText: {
    color: colors.danger,
  },
  statusNeutral: {
    backgroundColor: colors.primarySoft,
  },
  statusNeutralText: {
    color: colors.primary,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: "100%",
  },
  metaChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    maxWidth: 220,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  summaryBox: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.backgroundSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 12,
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 6,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.extrabold,
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bottomText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
  },
  detailWrap: {
    marginTop: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    paddingTop: 16,
    gap: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.extrabold,
    marginTop: 4,
  },
  emptyBox: {
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    padding: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  block: {
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    padding: 12,
    gap: 8,
  },
  blockHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  blockTitle: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  blockSubtitle: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.fontFamily.extrabold,
  },
  blockMeta: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
  },
  detailItem: {
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItemName: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  detailItemMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginTop: 4,
  },
  paymentRow: {
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.extrabold,
  },
  paymentMeta: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: colors.greenSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeBadgeText: {
    color: colors.success,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  annulledBadge: {
    backgroundColor: colors.borderSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  annulledBadgeText: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  noteBox: {
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.lg,
    padding: 12,
  },
  noteText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 20,
  },
});