import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Mail, MapPin, Phone, UserRound, X } from "lucide-react-native";
import type { ClienteDetail } from "../types/clientes.types";
import { colors } from "@/core/theme/colors";

type Props = {
  visible: boolean;
  cliente: ClienteDetail | null;
  onClose: () => void;
};

function getValue(value?: string | null) {
  return value && value.trim() ? value : "N/A";
}

function InfoCard({
  icon,
  label,
  value,
  fullWidth = false,
  isCompact = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  fullWidth?: boolean;
  isCompact?: boolean;
}) {
  return (
    <View
      style={[
        styles.infoCard,
        isCompact ? styles.infoCardCompact : styles.infoCardDesktop,
        fullWidth && styles.fullWidthCard,
      ]}
    >
      <View style={styles.infoHeader}>
        {icon}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>

      <Text style={styles.infoValue}>{getValue(value)}</Text>
    </View>
  );
}

export default function ClienteDetailModal({ visible, cliente, onClose }: Props) {
  const { width } = useWindowDimensions();
  const isMobile = width < 520;

  const nombre = getValue(cliente?.nombre);
  const documento = getValue(cliente?.numeroDocumento);
  const tipoCliente = getValue(cliente?.tipoDocumento);
  const estado = getValue(cliente?.estado);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, isMobile && styles.containerMobile]}>
          <View style={styles.topBar}>
            <View style={styles.topTextBlock}>
              <View style={styles.titleRow}>
                <UserRound size={22} color={colors.primary} />
                <Text style={styles.title}>Detalles del Cliente</Text>
              </View>
              <Text style={styles.subtitle}>Información completa del cliente</Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeIconButton}>
              <X size={24} color="#666" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={[styles.heroCard, isMobile && styles.heroCardMobile]}>
              <Text style={[styles.clientName, isMobile && styles.clientNameMobile]}>
                {nombre}
              </Text>

              <View style={styles.badgesRow}>
                <View style={[styles.badge, styles.docBadge]}>
                  <Text style={styles.docBadgeText}>NIT: {documento}</Text>
                </View>

                <View style={[styles.badge, styles.typeBadge]}>
                  <Text style={styles.typeBadgeText}>{tipoCliente}</Text>
                </View>

                <View style={[styles.badge, styles.statusBadge]}>
                  <Text style={styles.statusBadgeText}>{estado}</Text>
                </View>
              </View>
            </View>

            <View style={[styles.grid, isMobile && styles.gridMobile]}>
              <InfoCard
                icon={<Mail size={20} color={colors.primary} />}
                label="Email"
                value={cliente?.correo}
                isCompact={isMobile}
              />

              <InfoCard
                icon={<Phone size={20} color={colors.primary} />}
                label="Teléfono"
                value={cliente?.telefono || cliente?.celular}
                isCompact={isMobile}
              />

              <InfoCard
                icon={<MapPin size={20} color={colors.primary} />}
                label="Ciudad"
                value={cliente?.ciudad}
                isCompact={isMobile}
              />

              <InfoCard
                icon={<MapPin size={20} color={colors.primary} />}
                label="Departamento"
                value={cliente?.departamento}
                isCompact={isMobile}
              />

              <InfoCard
                icon={<MapPin size={20} color={colors.primary} />}
                label="Dirección"
                value={cliente?.direccion}
                fullWidth
                isCompact={isMobile}
              />
            </View>
          </ScrollView>

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
    maxHeight: "92%",
    padding: 24,
  },
  containerMobile: {
    padding: 18,
    borderRadius: 22,
    maxHeight: "88%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  topTextBlock: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#667085",
  },
  closeIconButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  heroCard: {
    backgroundColor: "#EEF4FF",
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D9E6FF",
  },
  heroCardMobile: {
    padding: 18,
    marginBottom: 16,
  },
  clientName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#101828",
    marginBottom: 18,
  },
  clientNameMobile: {
    fontSize: 19,
    lineHeight: 24,
    marginBottom: 14,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  docBadge: {
    backgroundColor: "#F2F4F7",
  },
  docBadgeText: {
    color: "#222",
    fontSize: 13,
    fontWeight: "800",
  },
  typeBadge: {
    backgroundColor: "#F4EBFF",
  },
  typeBadgeText: {
    color: "#7A2CBF",
    fontSize: 13,
    fontWeight: "800",
  },
  statusBadge: {
    backgroundColor: "#D1FADF",
  },
  statusBadgeText: {
    color: "#067647",
    fontSize: 13,
    fontWeight: "800",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  gridMobile: {
    flexDirection: "column",
    gap: 12,
  },
  infoCard: {
    backgroundColor: "#FCFCFD",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 20,
  },
  infoCardDesktop: {
    width: "48%",
    padding: 20,
  },
  infoCardCompact: {
    width: "100%",
    padding: 16,
  },
  fullWidthCard: {
    width: "100%",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "700",
  },
  infoValue: {
    fontSize: 17,
    color: "#101828",
    fontWeight: "700",
    lineHeight: 24,
    flexWrap: "wrap",
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