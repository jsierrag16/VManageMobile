import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CalendarDays,
  CircleDollarSign,
  FileText,
  Receipt,
  UserRound,
  X,
} from "lucide-react-native";
import type { OrdenVentaDetail } from "../types/ordenesVenta.types";
import { colors } from "@/core/theme/colors";

type Props = {
  visible: boolean;
  orden: OrdenVentaDetail | null;
  onClose: () => void;
};

function getValue(value?: string | null) {
  return value && value.trim() ? value : "N/A";
}

function formatCurrency(value?: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function getEstadoStyles(estado: string) {
  const value = estado.trim().toLowerCase();

  if (value === "aprobada") {
    return {
      bg: "#D1FADF",
      text: "#067647",
    };
  }

  if (value === "anulada") {
    return {
      bg: "#FEE4E2",
      text: "#B42318",
    };
  }

  return {
    bg: "#FEF3F2",
    text: "#B54708",
  };
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        {icon}
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function OrdenVentaDetailModal({
  visible,
  orden,
  onClose,
}: Props) {
  const estadoStyles = getEstadoStyles(orden?.estadoNombre || "Pendiente");

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.topBar}>
            <View style={styles.topTextBlock}>
              <View style={styles.titleRow}>
                <FileText size={22} color={colors.primary} />
                <Text style={styles.title}>Detalle de la Orden</Text>
              </View>
              <Text style={styles.subtitle}>
                Información completa de la orden de venta
              </Text>
            </View>

            <Pressable onPress={onClose} style={styles.closeIconButton}>
              <X size={24} color="#667085" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.heroCard}>
              <Text style={styles.orderCode}>{orden?.codigo || "Sin código"}</Text>

              <View style={styles.badgesRow}>
                <View style={[styles.badge, styles.dateBadge]}>
                  <Text style={styles.dateBadgeText}>{orden?.fecha || "Sin fecha"}</Text>
                </View>

                <View style={[styles.badge, { backgroundColor: estadoStyles.bg }]}>
                  <Text style={[styles.estadoBadgeText, { color: estadoStyles.text }]}>
                    {orden?.estadoNombre || "Pendiente"}
                  </Text>
                </View>
              </View>
            </View>

            <DetailRow
              icon={<UserRound size={20} color={colors.primary} />}
              label="Cliente"
              value={getValue(orden?.clienteNombre)}
            />

            <DetailRow
              icon={<Receipt size={20} color={colors.primary} />}
              label="Documento"
              value={getValue(orden?.clienteDocumento)}
            />

            <DetailRow
              icon={<CalendarDays size={20} color={colors.primary} />}
              label="Fecha"
              value={getValue(orden?.fecha)}
            />

            <DetailRow
              icon={<CircleDollarSign size={20} color={colors.primary} />}
              label="Total"
              value={formatCurrency(orden?.total)}
            />

            <DetailRow
              icon={<CircleDollarSign size={20} color={colors.primary} />}
              label="Subtotal"
              value={formatCurrency(orden?.subtotal)}
            />

            <DetailRow
              icon={<CircleDollarSign size={20} color={colors.primary} />}
              label="IVA"
              value={formatCurrency(orden?.totalIva)}
            />

            <DetailRow
              icon={<FileText size={20} color={colors.primary} />}
              label="Observaciones"
              value={getValue(orden?.observaciones)}
            />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Productos</Text>

              {!orden?.productos?.length ? (
                <View style={styles.emptyProductsBox}>
                  <Text style={styles.emptyProductsText}>
                    No hay productos para mostrar.
                  </Text>
                </View>
              ) : (
                orden.productos.map((producto, index) => (
                  <View key={`${producto.id}-${index}`} style={styles.productCard}>
                    <View style={styles.productTopRow}>
                      <Text style={styles.productName}>{producto.producto}</Text>
                      <Text style={styles.productQty}>x{producto.cantidad}</Text>
                    </View>

                    <Text style={styles.productCode}>
                      {producto.codigoProducto || "Sin código"}
                    </Text>

                    <View style={styles.productAmounts}>
                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Precio unitario</Text>
                        <Text style={styles.amountValue}>
                          {formatCurrency(producto.precioUnitario)}
                        </Text>
                      </View>

                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>IVA</Text>
                        <Text style={styles.amountValue}>
                          {formatCurrency(producto.iva)}
                        </Text>
                      </View>

                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Subtotal</Text>
                        <Text style={styles.amountValue}>
                          {formatCurrency(producto.subtotal)}
                        </Text>
                      </View>

                      <View style={styles.amountRow}>
                        <Text style={styles.amountLabel}>Total</Text>
                        <Text style={styles.amountValueStrong}>
                          {formatCurrency(producto.total)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
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
    padding: 18,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    maxHeight: "88%",
    padding: 18,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
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
    fontSize: 20,
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
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D9E6FF",
  },
  orderCode: {
    fontSize: 22,
    fontWeight: "800",
    color: "#101828",
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
  dateBadge: {
    backgroundColor: "#F2F4F7",
  },
  dateBadgeText: {
    color: "#344054",
    fontSize: 13,
    fontWeight: "800",
  },
  estadoBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: "#FCFCFD",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
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
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
    marginBottom: 14,
  },
  emptyProductsBox: {
    backgroundColor: "#FCFCFD",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 18,
    padding: 18,
  },
  emptyProductsText: {
    color: "#667085",
    textAlign: "center",
    fontWeight: "600",
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EAECF0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  productTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 6,
  },
  productName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
    color: "#101828",
  },
  productQty: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },
  productCode: {
    fontSize: 12,
    color: "#667085",
    marginBottom: 12,
    fontWeight: "600",
  },
  productAmounts: {
    gap: 8,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  amountLabel: {
    fontSize: 13,
    color: "#667085",
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 13,
    color: "#344054",
    fontWeight: "700",
  },
  amountValueStrong: {
    fontSize: 14,
    color: "#101828",
    fontWeight: "800",
  },
  footer: {
    alignItems: "flex-end",
    marginTop: 16,
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