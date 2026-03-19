import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { typography } from "@/core/theme/typography";
import type { ProductoVista } from "../types/existencias.types";

type ProductoInventoryCardProps = {
  producto: ProductoVista;
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

function isNearExpiry(dateString: string | null) {
  if (!dateString) return false;

  const today = new Date();
  const expiry = new Date(dateString);

  const diffMs = expiry.getTime() - today.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays <= 90;
}

export default function ProductoInventoryCard({
  producto,
}: ProductoInventoryCardProps) {
  const [expanded, setExpanded] = useState(false);

  const categoryLabel =
    producto.categoria_producto?.nombre_categoria ?? "Sin categoría";

  const ivaLabel = producto.iva ? `${producto.iva.porcentaje}%` : "N/A";

  const lotesCount = producto.lotes.length;

  const bodegasResumen = useMemo(() => {
    const unique = Array.from(
      new Set(producto.lotes.map((lote) => lote.nombre_bodega).filter(Boolean))
    );

    if (unique.length === 0) return "Sin bodega";
    if (unique.length === 1) return unique[0];
    return `${unique.length} bodegas`;
  }, [producto.lotes]);

  return (
    <AppCard style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.topRow}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{producto.nombre_producto}</Text>
            <Text style={styles.subtitle}>{bodegasResumen}</Text>
          </View>

          <View
            style={[
              styles.statusChip,
              producto.estado ? styles.activeChip : styles.inactiveChip,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                producto.estado ? styles.activeText : styles.inactiveText,
              ]}
            >
              {producto.estado ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>{categoryLabel}</Text>
          </View>

          <View style={styles.metaChip}>
            <Text style={styles.metaChipText}>IVA {ivaLabel}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Stock total</Text>
            <Text style={styles.statValue}>{producto.stock_total}</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Lotes</Text>
            <Text style={styles.statValue}>{lotesCount}</Text>
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
        <View style={styles.lotesSection}>
          <Text style={styles.lotesTitle}>
            Lotes disponibles ({producto.lotes.length})
          </Text>

          {producto.lotes.map((lote) => {
            const nearExpiry = isNearExpiry(lote.fecha_vencimiento);

            return (
              <View key={lote.id_existencia} style={styles.loteCard}>
                <View style={styles.loteTop}>
                  <Text style={styles.loteCode}>{lote.lote || "Sin lote"}</Text>

                  <View style={styles.bodegaChip}>
                    <Text style={styles.bodegaChipText}>
                      {lote.nombre_bodega || "Sin bodega"}
                    </Text>
                  </View>
                </View>

                <View style={styles.loteInfoRow}>
                  <View>
                    <Text style={styles.loteInfoLabel}>Cantidad</Text>
                    <Text style={styles.loteInfoValue}>{lote.cantidad}</Text>
                  </View>

                  <View>
                    <Text style={styles.loteInfoLabel}>Vencimiento</Text>
                    <Text
                      style={[
                        styles.loteInfoValue,
                        nearExpiry && styles.expiryWarningText,
                      ]}
                    >
                      {formatDate(lote.fecha_vencimiento)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
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
  activeChip: {
    backgroundColor: "#DDF4E4",
  },
  inactiveChip: {
    backgroundColor: "#FEE2E2",
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  activeText: {
    color: colors.success,
  },
  inactiveText: {
    color: colors.danger,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  metaChip: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  metaChipText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
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
  lotesSection: {
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  lotesTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 12,
  },
  loteCard: {
    backgroundColor: colors.backgroundSoft,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 10,
  },
  loteTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  loteCode: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
    flex: 1,
  },
  bodegaChip: {
    backgroundColor: colors.white,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bodegaChipText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: typography.fontFamily.semibold,
  },
  loteInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  loteInfoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  loteInfoValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
  },
  expiryWarningText: {
    color: colors.danger,
  },
});