import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { shadows } from "@/core/theme/shadows";
import type { EstadoOption } from "../types/ventas.types";

type Props = {
  visible: boolean;
  title: string;
  currentLabel: string;
  options: EstadoOption[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (option: EstadoOption) => void;
};

export default function EstadoActionSheet({
  visible,
  title,
  currentLabel,
  options,
  loading = false,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Estado actual: {currentLabel}</Text>

          {options.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No hay cambios de estado disponibles.</Text>
            </View>
          ) : (
            options.map((option) => (
              <Pressable
                key={option.id}
                style={styles.optionButton}
                disabled={loading}
                onPress={() => onSelect(option)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            ))
          )}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cerrar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: 20,
    ...shadows.floating,
  },
  handle: {
    width: 56,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: colors.backgroundSoft,
  },
  optionText: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 14,
  },
  cancelText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "700",
  },
  emptyBox: {
    paddingVertical: 18,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
  },
});