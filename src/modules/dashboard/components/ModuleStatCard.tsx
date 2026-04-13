import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";

type Tone = "blue" | "green" | "yellow" | "purple" | "red" | "orange";

type Props = {
  title: string;
  value: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: Tone;
  onPress?: () => void;
};

const toneMap: Record<
  Tone,
  { bg: string; border: string; text: string }
> = {
  blue: {
    bg: "#EEF3FF",
    border: "#D7E3FF",
    text: "#3467EB",
  },
  green: {
    bg: "#ECFDF3",
    border: "#CFF7DD",
    text: "#0F9F6E",
  },
  yellow: {
    bg: "#FFF8E7",
    border: "#FFE7A8",
    text: "#B7791F",
  },
  purple: {
    bg: "#F5ECFF",
    border: "#E7D4FF",
    text: "#7C3AED",
  },
  red: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#DC2626",
  },
  orange: {
    bg: "#FFF1E8",
    border: "#FFD9BF",
    text: "#EA580C",
  },
};

export default function ModuleStatCard({
  title,
  value,
  description,
  icon,
  tone,
  onPress,
}: Props) {
  const toneStyle = toneMap[tone];

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [pressed && onPress ? styles.pressed : null]}
    >
      <AppCard style={styles.card}>
        <View style={styles.row}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>

          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: toneStyle.bg,
                borderColor: toneStyle.border,
              },
            ]}
          >
            <Ionicons name={icon} size={18} color={toneStyle.text} />
          </View>
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.92,
  },
  card: {
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 24,
    marginTop: 8,
    fontFamily: typography.fontFamily.extrabold,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    fontFamily: typography.fontFamily.medium,
  },
  iconWrap: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
  },
});