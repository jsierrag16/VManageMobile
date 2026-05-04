import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { CheckCircle2, X } from "lucide-react-native";
import type { OrdenVentaEstado } from "../types/ordenesVenta.types";
import { colors } from "@/core/theme/colors";

type Props = {
  visible: boolean;
  currentEstado: string;
  options: OrdenVentaEstado[];
  loading?: boolean;
  onClose: () => void;
  onSelect: (estado: OrdenVentaEstado) => void;
};

export default function OrdenVentaEstadoModal({
  visible,
  currentEstado,
  options,
  loading = false,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.titleBox}>
              <Text style={styles.title}>Cambiar estado</Text>
              <Text style={styles.subtitle}>Estado actual: {currentEstado}</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeIconButton}>
              <X size={24} color="#667085" />
            </Pressable>
          </View>

          {!options.length ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                No hay cambios de estado disponibles para esta orden.
              </Text>
            </View>
          ) : (
            <View style={styles.optionsList}>
              {options.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.optionButton}
                  disabled={loading}
                  onPress={() => onSelect(option)}
                >
                  <View style={styles.optionContent}>
                    <CheckCircle2 size={18} color={colors.primary} />
                    <Text style={styles.optionText}>{option.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.18)",
    justifyContent: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 22,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleBox: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#667085",
  },
  closeIconButton: {
    padding: 4,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FCFCFD",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  optionText: {
    fontSize: 15,
    color: "#101828",
    fontWeight: "700",
  },
  emptyBox: {
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 16,
    padding: 18,
    backgroundColor: "#FCFCFD",
  },
  emptyText: {
    color: "#667085",
    textAlign: "center",
    fontWeight: "600",
  },
  footer: {
    alignItems: "flex-end",
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#101828",
  },
});