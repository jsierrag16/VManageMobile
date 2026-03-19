import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { shadows } from "@/core/theme/shadows";
import { typography } from "@/core/theme/typography";

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onCancel} />

        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable style={styles.secondaryButton} onPress={onCancel}>
              <Text style={styles.secondaryText}>{cancelText}</Text>
            </Pressable>

            <Pressable style={styles.primaryButton} onPress={onConfirm}>
              <Text style={styles.primaryText}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    padding: 22,
    ...shadows.floating,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: typography.fontFamily.extrabold,
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
    textAlign: "center",
    marginBottom: 18,
  },
  actions: {
    gap: 10,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.semibold,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: typography.fontFamily.extrabold,
  },
});