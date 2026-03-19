import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import type { TrasladoDetalleItem } from "../types/traslados.types";

type Props = {
  item: TrasladoDetalleItem;
};

export default function TrasladoDetailRow({ item }: Props) {
  const producto = item.existencias?.producto?.nombre_producto ?? "Producto";
  const lote = item.existencias?.lote || "Sin lote";
  const bodega = item.existencias?.bodega?.nombre_bodega ?? "Sin bodega";
  const cantidad = Number(item.cantidad || 0);

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name="cube-outline" size={18} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {producto}
        </Text>

        <View style={styles.metaWrap}>
          <Text style={styles.metaText}>Lote: {lote}</Text>
          <Text style={styles.metaText}>Bodega: {bodega}</Text>
        </View>
      </View>

      <View style={styles.qtyWrap}>
        <Text style={styles.qtyLabel}>Cantidad</Text>
        <Text style={styles.qtyValue}>{cantidad}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 21,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  metaWrap: {
    gap: 4,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
  },
  qtyWrap: {
    alignItems: "flex-end",
    minWidth: 70,
  },
  qtyLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  qtyValue: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: typography.fontFamily.extrabold,
  },
});