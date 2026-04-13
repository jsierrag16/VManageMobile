import { Pressable, StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";

export type DashboardQuickAction = {
  label: string;
  onPress?: () => void;
};

type Props = {
  actions: DashboardQuickAction[];
};

export default function QuickActions({ actions }: Props) {
  if (!actions.length) return null;

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Accesos rápidos</Text>
        <Text style={styles.subtitle}>
          Navega rápido a los módulos principales.
        </Text>
      </View>

      <View style={styles.actionsWrap}>
        {actions.map((action) => (
          <Pressable
            key={action.label}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.actionChip,
              pressed && styles.actionChipPressed,
            ]}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: typography.fontFamily.medium,
  },
  actionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  actionChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  actionChipPressed: {
    opacity: 0.88,
  },
  actionText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
});