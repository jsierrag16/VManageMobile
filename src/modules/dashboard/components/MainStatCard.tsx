import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { typography } from "@/core/theme/typography";

type Props = {
  title: string;
  value: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: [string, string];
  onPress?: () => void;
};

export default function MainStatCard({
  title,
  value,
  description,
  icon,
  colors,
  onPress,
}: Props) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors[0],
          borderColor: colors[1],
        },
        pressed && onPress ? styles.cardPressed : null,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={22} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    minHeight: 144,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  value: {
    color: "#FFFFFF",
    fontSize: 29,
    marginTop: 10,
    fontFamily: typography.fontFamily.extrabold,
  },
  description: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    fontFamily: typography.fontFamily.medium,
  },
  iconWrap: {
    alignSelf: "flex-start",
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    padding: 12,
  },
});