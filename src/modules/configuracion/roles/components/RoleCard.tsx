import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import type { RolItem } from "../types/roles.types";

type Props = {
  rol: RolItem;
};

type PermissionSection = {
  title: string | null;
  actions: string[];
};

type PermissionGroup = {
  module: string;
  sections: PermissionSection[];
};

const TOKEN_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  administracion: "Administración",
  configuracion: "Administración",
  existencias: "Existencias",
  compras: "Compras",
  ventas: "Ventas",
  productos: "Productos",
  traslados: "Traslados",
  bodegas: "Bodegas",
  usuarios: "Usuarios",
  roles: "Roles",
  clientes: "Clientes",
  proveedores: "Proveedores",
  cotizaciones: "Cotizaciones",
  pagos: "Pagos",
  ordenes: "Órdenes",
  remisiones: "Remisiones",
  ordenes_compra: "Órdenes de compra",
  ordenes_venta: "Órdenes de venta",
  remisiones_compra: "Remisiones de compra",
  remisiones_venta: "Remisiones de venta",
  ver: "Ver",
  crear: "Crear",
  editar: "Editar",
  acceder: "Acceder",
  anular: "Anular",
  eliminar: "Eliminar",
  activar: "Activar",
  desactivar: "Desactivar",
  cambiar_estado: "Cambiar estado",
  cambiarestado: "Cambiar estado",
};

function prettifyToken(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[\s-]+/g, "_");

  if (TOKEN_LABELS[normalized]) {
    return TOKEN_LABELS[normalized];
  }

  return value
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatPermissionName(permissionName: string) {
  const parts = permissionName
    .split(".")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return {
      module: "General",
      section: null as string | null,
      action: permissionName,
    };
  }

  if (parts.length === 1) {
    return {
      module: prettifyToken(parts[0]),
      section: null as string | null,
      action: "Acceder",
    };
  }

  if (parts.length === 2) {
    return {
      module: prettifyToken(parts[0]),
      section: null as string | null,
      action: prettifyToken(parts[1]),
    };
  }

  return {
    module: prettifyToken(parts[0]),
    section: prettifyToken(parts.slice(1, -1).join("_")),
    action: prettifyToken(parts[parts.length - 1]),
  };
}

function buildPermissionGroups(rol: RolItem): PermissionGroup[] {
  const map = new Map<string, Map<string, string[]>>();

  for (const link of rol.roles_permisos ?? []) {
    const rawName = link.permisos?.nombre_permiso;
    if (!rawName) continue;

    const parsed = formatPermissionName(rawName);

    if (!map.has(parsed.module)) {
      map.set(parsed.module, new Map<string, string[]>());
    }

    const sectionMap = map.get(parsed.module)!;
    const sectionKey = parsed.section ?? "__root__";

    if (!sectionMap.has(sectionKey)) {
      sectionMap.set(sectionKey, []);
    }

    sectionMap.get(sectionKey)!.push(parsed.action);
  }

  return Array.from(map.entries()).map(([module, sectionsMap]) => {
    const sections: PermissionSection[] = Array.from(sectionsMap.entries()).map(
      ([sectionKey, actions]) => ({
        title: sectionKey === "__root__" ? null : sectionKey,
        actions: Array.from(new Set(actions)),
      })
    );

    return {
      module,
      sections,
    };
  });
}

export default function RoleCard({ rol }: Props) {
  const [expanded, setExpanded] = useState(false);

  const permissionGroups = useMemo(() => buildPermissionGroups(rol), [rol]);

  const totalPermissions = useMemo(
    () =>
      (rol.roles_permisos ?? []).filter((item) => item.permisos?.nombre_permiso)
        .length,
    [rol.roles_permisos]
  );

  return (
    <AppCard style={styles.card}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <View style={styles.topRow}>
          <View style={styles.headerContent}>
            <Text style={styles.title} numberOfLines={2}>
              {rol.nombre_rol}
            </Text>

            <Text style={styles.description} numberOfLines={expanded ? 4 : 2}>
              {rol.descripcion || "Sin descripción registrada"}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              rol.estado ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                rol.estado ? styles.statusTextActive : styles.statusTextInactive,
              ]}
            >
              {rol.estado ? "Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Permisos</Text>
            <Text style={styles.summaryValue}>{totalPermissions}</Text>
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
          <Text style={styles.permissionsTitle}>Permisos del rol</Text>

          {permissionGroups.length === 0 ? (
            <Text style={styles.emptyText}>Este rol no tiene permisos visibles.</Text>
          ) : (
            <ScrollView
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
            >
              {permissionGroups.map((group) => (
                <View key={group.module} style={styles.groupBlock}>
                  <Text style={styles.groupTitle}>{group.module}</Text>

                  {group.sections.map((section, index) => (
                    <View
                      key={`${group.module}-${section.title ?? "root"}-${index}`}
                      style={styles.sectionBlock}
                    >
                      {section.title ? (
                        <Text style={styles.sectionTitle}>{section.title}:</Text>
                      ) : null}

                      <View style={styles.actionsWrap}>
                        {section.actions.map((action) => (
                          <View
                            key={`${group.module}-${section.title ?? "root"}-${action}`}
                            style={styles.actionRow}
                          >
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.actionText}>{action}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
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
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
  statusBadge: {
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
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 4,
  },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontFamily: typography.fontFamily.extrabold,
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
  permissionsTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: typography.fontFamily.medium,
    marginBottom: 10,
  },
  scrollArea: {
    maxHeight: 300,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  groupBlock: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  groupTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 10,
  },
  sectionBlock: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  actionsWrap: {
    gap: 4,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 2,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    marginRight: 8,
  },
  actionText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.regular,
  },
});