import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import {
  getProveedorById,
  type ProveedorItem,
} from "../services/proveedores.service";

type Props = {
  proveedor: ProveedorItem;
};

function normalizeText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizeEstado(
  value: unknown
): "ACTIVO" | "INACTIVO" | "SIN_ESTADO" {
  if (typeof value === "boolean") {
    return value ? "ACTIVO" : "INACTIVO";
  }

  if (typeof value === "number") {
    return value === 1 ? "ACTIVO" : "INACTIVO";
  }

  const normalized = normalizeText(value).toUpperCase();

  if (["ACTIVO", "TRUE", "1"].includes(normalized)) return "ACTIVO";
  if (["INACTIVO", "FALSE", "0"].includes(normalized)) return "INACTIVO";

  return "SIN_ESTADO";
}

function getEstadoStyles(value: unknown) {
  const estado = normalizeEstado(value);

  switch (estado) {
    case "ACTIVO":
      return {
        badge: styles.statusActive,
        text: styles.statusTextActive,
        label: "Activo",
      };

    case "INACTIVO":
      return {
        badge: styles.statusInactive,
        text: styles.statusTextInactive,
        label: "Inactivo",
      };

    default:
      return {
        badge: styles.statusNeutral,
        text: styles.statusTextNeutral,
        label: "Sin estado",
      };
  }
}

export default function ProveedorCard({ proveedor }: Props) {
  const [expanded, setExpanded] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["proveedor-detail-mobile", proveedor.id_proveedor],
    queryFn: () => getProveedorById(proveedor.id_proveedor),
    enabled: expanded,
    staleTime: 30000,
  });

  const estadoStyles = useMemo(
    () => getEstadoStyles(proveedor.estado),
    [proveedor.estado]
  );

  const ciudad = proveedor.municipios?.nombre_municipio ?? "";
  const departamento =
    proveedor.municipios?.departamentos?.nombre_departamento ?? "";

  const ciudadDepartamento = [ciudad, departamento].filter(Boolean).join(" · ");

  return (
    <AppCard style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.topRow}>
          <View style={styles.headerContent}>
            <Text style={styles.code}>
              {proveedor.codigo_proveedor || `Proveedor #${proveedor.id_proveedor}`}
            </Text>

            <Text style={styles.name} numberOfLines={2}>
              {proveedor.nombre_empresa || "Sin nombre"}
            </Text>
          </View>

          <View style={[styles.statusBadge, estadoStyles.badge]}>
            <Text style={[styles.statusText, estadoStyles.text]}>
              {estadoStyles.label}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons
              name="card-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {proveedor.tipo_documento?.nombre_doc || "Documento"}:{" "}
              {proveedor.num_documento || "Sin número"}
            </Text>
          </View>

          <View style={styles.metaChip}>
            <Ionicons
              name="briefcase-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {proveedor.tipo_proveedor?.nombre_tipo_proveedor || "Sin tipo"}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.primary}
              style={styles.metaIcon}
            />
            <Text style={styles.metaChipText} numberOfLines={1}>
              {ciudadDepartamento || "Ubicación no registrada"}
            </Text>
          </View>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.bottomInfo}>
            <Text style={styles.bottomLabel}>Contacto</Text>
            <Text style={styles.bottomValue} numberOfLines={1}>
              {proveedor.nombre_contacto ||
                proveedor.email ||
                proveedor.telefono ||
                "Toca para ver"}
            </Text>
          </View>

          <View style={styles.expandButton}>
            <Ionicons
              name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
              size={20}
              color={colors.primary}
            />
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.detailWrap}>
          {detailQuery.isLoading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando detalle...</Text>
            </View>
          ) : detailQuery.isError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>
                No fue posible cargar el detalle
              </Text>
              <Text style={styles.errorText}>Intenta nuevamente.</Text>
            </View>
          ) : (
            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <View style={styles.detailLabelRow}>
                  <Ionicons
                    name="mail-outline"
                    size={14}
                    color={colors.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailLabel}>Email</Text>
                </View>
                <Text style={styles.detailValue}>
                  {detailQuery.data?.email || "No registrado"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailLabelRow}>
                  <Ionicons
                    name="call-outline"
                    size={14}
                    color={colors.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailLabel}>Teléfono</Text>
                </View>
                <Text style={styles.detailValue}>
                  {detailQuery.data?.telefono || "No registrado"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailLabelRow}>
                  <Ionicons
                    name="person-outline"
                    size={14}
                    color={colors.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailLabel}>Contacto principal</Text>
                </View>
                <Text style={styles.detailValue}>
                  {detailQuery.data?.nombre_contacto || "No registrado"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailLabelRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={colors.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailLabel}>Municipio</Text>
                </View>
                <Text style={styles.detailValue}>
                  {detailQuery.data?.municipios?.nombre_municipio || "No registrado"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <View style={styles.detailLabelRow}>
                  <Ionicons
                    name="map-outline"
                    size={14}
                    color={colors.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailLabel}>Departamento</Text>
                </View>
                <Text style={styles.detailValue}>
                  {detailQuery.data?.municipios?.departamentos?.nombre_departamento ||
                    "No registrado"}
                </Text>
              </View>

              <View style={[styles.detailBox, styles.detailBoxFull]}>
                <View style={styles.detailLabelRow}>
                  <Ionicons
                    name="home-outline"
                    size={14}
                    color={colors.primary}
                    style={styles.detailIcon}
                  />
                  <Text style={styles.detailLabel}>Dirección</Text>
                </View>
                <Text style={styles.detailValue}>
                  {detailQuery.data?.direccion || "No registrada"}
                </Text>
              </View>
            </View>
          )}
        </View>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  },
  headerContent: {
    flex: 1,
  },
  code: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 20,
    lineHeight: 28,
    fontFamily: typography.fontFamily.extrabold,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  statusActive: {
    backgroundColor: "#DDF4E5",
  },
  statusTextActive: {
    color: "#1F9D55",
  },
  statusInactive: {
    backgroundColor: "#FEE2E2",
  },
  statusTextInactive: {
    color: "#DC2626",
  },
  statusNeutral: {
    backgroundColor: "#F3F4F6",
  },
  statusTextNeutral: {
    color: "#6B7280",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaIcon: {
    marginRight: 6,
  },
  metaChipText: {
    maxWidth: 220,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
  },
  bottomInfo: {
    flex: 1,
    paddingRight: 12,
  },
  bottomLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  bottomValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
  },
  expandButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },
  detailWrap: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  centerState: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.medium,
  },
  errorBox: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    padding: 14,
  },
  errorTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  errorText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
  },
  detailsGrid: {
    gap: 10,
  },
  detailBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  detailBoxFull: {
    width: "100%",
  },
  detailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
});
