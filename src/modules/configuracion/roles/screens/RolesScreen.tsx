import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import AppCard from "@/components/ui/AppCard";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import RoleCard from "../components/RoleCard";
import { getRoles } from "../services/roles.service";
import type { EstadoRolFilter, RolItem } from "../types/roles.types";

const FILTERS: Array<{ label: string; value: EstadoRolFilter }> = [
    { label: "Todos", value: "all" },
    { label: "Activos", value: "true" },
    { label: "Inactivos", value: "false" },
];

export default function RolesScreen() {
    const [search, setSearch] = useState("");
    const [estadoFilter, setEstadoFilter] = useState<EstadoRolFilter>("all");

    const query = useQuery({
        queryKey: ["roles-mobile"],
        queryFn: getRoles,
    });

    const filteredData = useMemo(() => {
        const data = query.data ?? [];
        const term = search.trim().toLowerCase();

        return data.filter((rol: RolItem) => {
            const nombre = rol.nombre_rol?.toLowerCase() ?? "";
            const descripcion = rol.descripcion?.toLowerCase() ?? "";
            const permisos = (rol.roles_permisos ?? [])
                .map((item) => item.permisos?.nombre_permiso?.toLowerCase() ?? "")
                .join(" ");

            const matchesSearch =
                !term ||
                nombre.includes(term) ||
                descripcion.includes(term) ||
                permisos.includes(term);

            const matchesEstado =
                estadoFilter === "all"
                    ? true
                    : estadoFilter === "true"
                        ? rol.estado
                        : !rol.estado;

            return matchesSearch && matchesEstado;
        });
    }, [query.data, search, estadoFilter]);

    const totalActivos = useMemo(() => {
        const data = query.data ?? [];
        return data.filter((item) => item.estado).length;
    }, [query.data]);

    const totalInactivos = useMemo(() => {
        const data = query.data ?? [];
        return data.filter((item) => !item.estado).length;
    }, [query.data]);

    if (query.isLoading) {
        return (
            <View style={styles.centerState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.stateText}>Cargando roles...</Text>
            </View>
        );
    }

    if (query.isError) {
        return (
            <AppCard>
                <Text style={styles.errorTitle}>No fue posible cargar roles</Text>
                <Text style={styles.errorText}>
                    Revisa la conexión o intenta nuevamente.
                </Text>
            </AppCard>
        );
    }

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
                <RefreshControl
                    refreshing={query.isRefetching}
                    onRefresh={query.refetch}
                    tintColor={colors.primary}
                />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Roles</Text>
                <Text style={styles.subtitle}>
                    Consulta de roles y permisos del sistema
                </Text>
            </View>

            <View style={styles.searchWrap}>
                <Ionicons
                    name="search-outline"
                    size={20}
                    color={colors.textMuted}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar roles..."
                    placeholderTextColor={colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtersRow}
            >
                {FILTERS.map((filter) => {
                    const active = estadoFilter === filter.value;

                    return (
                        <Pressable
                            key={filter.value}
                            onPress={() => setEstadoFilter(filter.value)}
                            style={[styles.filterChip, active && styles.filterChipActive]}
                        >
                            <Text
                                style={[
                                    styles.filterChipText,
                                    active && styles.filterChipTextActive,
                                ]}
                            >
                                {filter.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>

            <View style={styles.summaryRow}>
                <AppCard style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Activos</Text>
                    <Text style={styles.summaryValue}>{totalActivos}</Text>
                </AppCard>

                <AppCard style={styles.summaryCard}>
                    <Text style={styles.summaryLabel}>Inactivos</Text>
                    <Text style={styles.summaryValue}>{totalInactivos}</Text>
                </AppCard>
            </View>

            <View style={styles.listSection}>
                {filteredData.length === 0 ? (
                    <AppCard>
                        <Text style={styles.emptyTitle}>Sin resultados</Text>
                        <Text style={styles.emptyText}>
                            No encontramos roles para ese criterio de búsqueda.
                        </Text>
                    </AppCard>
                ) : (
                    filteredData.map((rol) => <RoleCard key={rol.id_rol} rol={rol} />)
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    centerState: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    stateText: {
        marginTop: 12,
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.medium,
    },
    header: {
        marginBottom: 16,
    },
    title: {
        color: colors.textPrimary,
        fontSize: 28,
        fontFamily: typography.fontFamily.extrabold,
        marginBottom: 8,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.medium,
        marginBottom: 12,
    },
    contextChip: {
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
        maxWidth: "100%",
        backgroundColor: "#EEF3FF",
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    contextChipText: {
        color: "#3467EB",
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
    },
    searchWrap: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        marginBottom: 14,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 15,
        fontFamily: typography.fontFamily.medium,
        paddingVertical: 14,
    },
    filtersRow: {
        gap: 10,
        marginBottom: 14,
        paddingRight: 6,
    },
    filterChip: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: typography.fontFamily.bold,
    },
    filterChipTextActive: {
        color: "#FFFFFF",
    },
    summaryRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 14,
    },
    summaryCard: {
        flex: 1,
    },
    summaryLabel: {
        color: colors.textMuted,
        fontSize: 12,
        fontFamily: typography.fontFamily.medium,
        marginBottom: 6,
    },
    summaryValue: {
        color: colors.textPrimary,
        fontSize: 26,
        fontFamily: typography.fontFamily.extrabold,
    },
    listSection: {
        marginTop: 4,
    },
    errorTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontFamily: typography.fontFamily.extrabold,
        marginBottom: 8,
    },
    errorText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: typography.fontFamily.regular,
    },
    emptyTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontFamily: typography.fontFamily.extrabold,
        marginBottom: 8,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: typography.fontFamily.regular,
    },
});