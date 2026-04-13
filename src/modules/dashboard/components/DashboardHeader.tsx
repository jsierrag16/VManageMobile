import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import type { DashboardPeriodo } from "../types/dashboard.types";

type Props = {
  selectedBodegaLabel?: string | null;
  periodoLabel?: string | null;
  totalBodegas?: number;
  selectedBodegaId?: number | null;
  selectedPeriodo: DashboardPeriodo;
  onPeriodoChange: (value: DashboardPeriodo) => void;
  onRefresh: () => void;
  refreshing?: boolean;
};

const PERIOD_OPTIONS: Array<{ value: DashboardPeriodo; label: string }> = [
  { value: "30d", label: "30 días" },
  { value: "3m", label: "3 meses" },
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "12 meses" },
];

export default function DashboardHeader({
  selectedBodegaLabel,
  periodoLabel,
  totalBodegas = 0,
  selectedBodegaId,
  selectedPeriodo,
  onPeriodoChange,
  onRefresh,
  refreshing = false,
}: Props) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Resumen ejecutivo, operativo y analítico del sistema según la bodega
            seleccionada.
          </Text>
        </View>

        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.refreshButtonPressed,
          ]}
        >
          <Ionicons
            name="refresh"
            size={16}
            color={colors.primary}
            style={styles.refreshIcon}
          />
          <Text style={styles.refreshText}>
            {refreshing ? "Actualizando..." : "Actualizar"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.chipsWrap}>
        <View style={[styles.chip, styles.chipPurple]}>
          <Ionicons name="business-outline" size={14} color="#6D28D9" />
          <Text style={[styles.chipText, styles.chipTextPurple]}>
            {selectedBodegaLabel?.trim() || "Todas las bodegas"}
          </Text>
        </View>

        {!!periodoLabel && (
          <View style={[styles.chip, styles.chipBlue]}>
            <Text style={[styles.chipText, styles.chipTextBlue]}>
              {periodoLabel}
            </Text>
          </View>
        )}

        {totalBodegas > 1 && (!selectedBodegaId || selectedBodegaId <= 0) && (
          <View style={[styles.chip, styles.chipGreen]}>
            <Text style={[styles.chipText, styles.chipTextGreen]}>
              {totalBodegas} bodegas en vista
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodRow}
      >
        {PERIOD_OPTIONS.map((option) => {
          const active = option.value === selectedPeriodo;

          return (
            <Pressable
              key={option.value}
              onPress={() => onPeriodoChange(option.value)}
              style={[
                styles.periodChip,
                active && styles.periodChipActive,
              ]}
            >
              <Text
                style={[
                  styles.periodChipText,
                  active && styles.periodChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  topRow: {
    gap: 14,
    marginBottom: 14,
  },
  textWrap: {
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontFamily: typography.fontFamily.extrabold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.medium,
  },
  refreshButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF3FF",
    borderWidth: 1,
    borderColor: "#D7E3FF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  refreshButtonPressed: {
    opacity: 0.85,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshText: {
    color: colors.primary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipPurple: {
    backgroundColor: "#F3E8FF",
  },
  chipBlue: {
    backgroundColor: "#EEF3FF",
  },
  chipGreen: {
    backgroundColor: "#ECFDF3",
  },
  chipText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  chipTextPurple: {
    color: "#6D28D9",
  },
  chipTextBlue: {
    color: "#2563EB",
  },
  chipTextGreen: {
    color: "#059669",
  },
  periodRow: {
    gap: 10,
    paddingRight: 6,
  },
  periodChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  periodChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodChipText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  periodChipTextActive: {
    color: "#FFFFFF",
  },
});