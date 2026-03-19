import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import type { Bodega } from "../types/bodega.types";

type Props = {
  bodega: Bodega;
};

export default function BodegaCard({ bodega }: Props) {
  const municipio = bodega.municipios?.nombre_municipio ?? "Sin municipio";
  const departamento =
    bodega.municipios?.departamentos?.nombre_departamento ?? "Sin departamento";

  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.headerContent}>
          <Text style={styles.title} numberOfLines={2}>
            {bodega.nombre_bodega}
          </Text>

          <Text style={styles.locationText} numberOfLines={1}>
            {municipio}, {departamento}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            bodega.estado ? styles.statusActive : styles.statusInactive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              bodega.estado ? styles.statusTextActive : styles.statusTextInactive,
            ]}
          >
            {bodega.estado ? "Activa" : "Inactiva"}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="location-outline"
          size={16}
          color={colors.textMuted}
          style={styles.infoIcon}
        />
        <Text style={styles.infoText} numberOfLines={2}>
          {bodega.direccion || "Sin dirección registrada"}
        </Text>
      </View>
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
    marginBottom: 14,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 6,
  },
  locationText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.semibold,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: "#DDF4E5",
  },
  statusInactive: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  statusTextActive: {
    color: "#1F9D55",
  },
  statusTextInactive: {
    color: "#6B7280",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
});