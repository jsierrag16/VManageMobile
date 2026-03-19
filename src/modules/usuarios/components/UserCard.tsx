import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import type { UsuarioItem } from "../types/usuarios.types";

type Props = {
  usuario: UsuarioItem;
};

function getInitials(usuario: UsuarioItem) {
  const first = usuario.nombre?.trim()?.charAt(0) ?? "";
  const second = usuario.apellido?.trim()?.charAt(0) ?? "";
  return `${first}${second}`.toUpperCase() || "U";
}

function formatDate(value?: string | null) {
  if (!value) return "No registrada";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No registrada";

  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

export default function UserCard({ usuario }: Props) {
  const [expanded, setExpanded] = useState(false);

  const fullName = `${usuario.nombre ?? ""} ${usuario.apellido ?? ""}`.trim();
  const roleName = usuario.roles?.nombre_rol ?? "Sin rol";
  const genero = usuario.genero?.nombre_genero ?? "No registrado";
  const tipoDocumento = usuario.tipo_documento?.nombre_doc ?? "Sin tipo";
  const initials = getInitials(usuario);

  const bodegas = useMemo(
    () =>
      (usuario.bodegas_por_usuario ?? [])
        .filter((item) => item?.bodega?.nombre_bodega)
        .map((item) => item.bodega.nombre_bodega),
    [usuario.bodegas_por_usuario]
  );

  return (
    <AppCard style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.topRow}>
          <View style={styles.identityWrap}>
            {usuario.img_url ? (
              <Image source={{ uri: usuario.img_url }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}

            <View style={styles.headerContent}>
              <Text style={styles.title} numberOfLines={2}>
                {fullName || "Usuario"}
              </Text>

              <Text style={styles.roleText} numberOfLines={1}>
                {roleName}
              </Text>

              <Text style={styles.emailText} numberOfLines={1}>
                {usuario.email}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              usuario.estado ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                usuario.estado ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {usuario.estado ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Documento</Text>
            <Text style={styles.summaryValue} numberOfLines={1}>
              {usuario.num_documento}
            </Text>
          </View>

          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Bodegas</Text>
            <Text style={styles.summaryValue}>{bodegas.length}</Text>
          </View>

          <View style={styles.expandWrap}>
            <Text style={styles.expandText}>
              {expanded ? "Ocultar" : "Ver detalle"}
            </Text>

            <View style={styles.chevronWrap}>
              <Ionicons
                name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
                size={20}
                color={colors.primary}
              />
            </View>
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.detailPanel}>
          <ScrollView
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.detailGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Tipo de documento</Text>
                <Text style={styles.detailValue}>{tipoDocumento}</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Número de documento</Text>
                <Text style={styles.detailValue}>{usuario.num_documento}</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Teléfono</Text>
                <Text style={styles.detailValue}>
                  {usuario.telefono?.trim() || "No registrado"}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Género</Text>
                <Text style={styles.detailValue}>{genero}</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Nacimiento</Text>
                <Text style={styles.detailValue}>
                  {formatDate(usuario.fecha_nacimiento)}
                </Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Bodegas asignadas</Text>

              {bodegas.length === 0 ? (
                <Text style={styles.emptyText}>
                  Este usuario no tiene bodegas activas asignadas.
                </Text>
              ) : (
                <View style={styles.bodegasWrap}>
                  {bodegas.map((bodega) => (
                    <View key={bodega} style={styles.bodegaChip}>
                      <Text style={styles.bodegaChipText}>{bodega}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>
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
    gap: 12,
    marginBottom: 14,
  },
  identityWrap: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E8EEF9",
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 4,
  },
  roleText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 4,
  },
  emailText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
  },
  statusBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusActive: {
    backgroundColor: "#DDF4E5",
  },
  statusInactive: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
  },
  statusTextActive: {
    color: "#1F9D55",
  },
  statusTextInactive: {
    color: "#6B7280",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
  expandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  expandText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  chevronWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FF",
  },
  detailPanel: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  scrollArea: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  detailGrid: {
    gap: 10,
    marginBottom: 12,
  },
  detailBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  detailLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 6,
  },
  detailValue: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.bold,
  },
  sectionBlock: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 10,
  },
  bodegasWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  bodegaChip: {
    backgroundColor: "#EEF3FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bodegaChipText: {
    color: "#3467EB",
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: typography.fontFamily.regular,
  },
});