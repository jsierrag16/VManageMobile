import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import AppCard from "./AppCard";
import { colors } from "@/core/theme/colors";

type AccentVariant = "blue" | "green" | "orange" | "purple";

type AppStatCardProps = {
  title: string;
  value: string;
  trend?: string;
  accent?: AccentVariant;
  iconName?: keyof typeof Ionicons.glyphMap;
};

const accentMap: Record<
  AccentVariant,
  { bg: string; iconBg: string; iconColor: string }
> = {
  blue: {
    bg: colors.blueSoft,
    iconBg: "#DCEBFF",
    iconColor: colors.primary,
  },
  green: {
    bg: colors.greenSoft,
    iconBg: "#DDF4E4",
    iconColor: colors.success,
  },
  orange: {
    bg: colors.orangeSoft,
    iconBg: "#FFE7D6",
    iconColor: colors.warning,
  },
  purple: {
    bg: colors.purpleSoft,
    iconBg: "#EBD9FF",
    iconColor: "#8B5CF6",
  },
};

export default function AppStatCard({
  title,
  value,
  trend,
  accent = "blue",
  iconName = "chevron-forward-outline",
}: AppStatCardProps) {
  const accentStyle = accentMap[accent];

  return (
    <AppCard style={styles.card}>
      <View style={[styles.circle, { backgroundColor: accentStyle.bg }]} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>

      <View style={styles.footer}>
        <Text style={styles.trend}>{trend ?? ""}</Text>

        <View
          style={[
            styles.iconWrap,
            { backgroundColor: accentStyle.iconBg },
          ]}
        >
          <Ionicons
            name={iconName}
            size={16}
            color={accentStyle.iconColor}
          />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 142,
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  circle: {
    position: "absolute",
    width: 92,
    height: 92,
    borderRadius: 999,
    top: -26,
    right: -24,
    opacity: 0.95,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 14,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 20,
  },
  footer: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trend: {
    color: colors.success,
    fontSize: 15,
    fontWeight: "700",
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});