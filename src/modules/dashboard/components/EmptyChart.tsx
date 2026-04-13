import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";

type Props = {
  title: string;
  subtitle: string;
};

export default function EmptyChart({ title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons
        name="bar-chart-outline"
        size={42}
        color={colors.textMuted}
        style={styles.icon}
      />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  icon: {
    opacity: 0.35,
    marginBottom: 10,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    textAlign: "center",
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    fontFamily: typography.fontFamily.medium,
  },
});