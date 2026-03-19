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
import { getTrasladoById } from "../services/traslados.service";
import type { TrasladoListItem } from "../types/traslados.types";
import TrasladoDetailRow from "./TrasladoDetailRow";

type Props = {
    traslado: TrasladoListItem;
};

function formatDate(value?: string | null) {
    if (!value) return "Sin fecha";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sin fecha";

    return new Intl.DateTimeFormat("es-CO", {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(date);
}

function normalizeEstado(nombre?: string | null) {
    return (nombre ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();
}

function getEstadoStyles(nombre?: string | null) {
    const estado = normalizeEstado(nombre);

    switch (estado) {
        case "PENDIENTE":
            return {
                badge: styles.statusDraft,
                text: styles.statusTextDraft,
                label: "Pendiente",
            };
        case "EN TRANSITO":
            return {
                badge: styles.statusTransit,
                text: styles.statusTextTransit,
                label: "En tránsito",
            };
        case "RECIBIDO":
            return {
                badge: styles.statusReceived,
                text: styles.statusTextReceived,
                label: "Recibido",
            };
        case "ANULADO":
            return {
                badge: styles.statusCancelled,
                text: styles.statusTextCancelled,
                label: "Anulado",
            };
        default:
            return {
                badge: styles.statusNeutral,
                text: styles.statusTextNeutral,
                label: nombre || "Sin estado",
            };
    }
}

export default function TrasladoCard({ traslado }: Props) {
    const [expanded, setExpanded] = useState(false);

    const detailQuery = useQuery({
        queryKey: ["traslado-detail", traslado.id_traslado],
        queryFn: () => getTrasladoById(traslado.id_traslado),
        enabled: expanded,
    });

    const estadoStyles = useMemo(
        () => getEstadoStyles(traslado.estado_traslado?.nombre_estado),
        [traslado.estado_traslado?.nombre_estado]
    );

    const origen =
        traslado.bodega_traslado_id_bodega_origenTobodega?.nombre_bodega ??
        "Sin origen";
    const destino =
        traslado.bodega_traslado_id_bodega_destinoTobodega?.nombre_bodega ??
        "Sin destino";
    const responsable = `${traslado.usuario?.nombre ?? ""} ${traslado.usuario?.apellido ?? ""
        }`.trim();

    const totalItems = detailQuery.data?.detalle_traslado?.length;

    return (
        <AppCard style={styles.card}>
            <Pressable onPress={() => setExpanded((prev) => !prev)}>
                <View style={styles.topRow}>
                    <View style={styles.headerContent}>
                        <Text style={styles.code}>{traslado.codigo_traslado}</Text>
                        <Text style={styles.route} numberOfLines={2}>
                            {origen} → {destino}
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
                            name="calendar-outline"
                            size={14}
                            color={colors.primary}
                            style={styles.metaIcon}
                        />
                        <Text style={styles.metaChipText}>
                            {formatDate(traslado.fecha_traslado)}
                        </Text>
                    </View>

                    <View style={styles.metaChip}>
                        <Ionicons
                            name="person-outline"
                            size={14}
                            color={colors.primary}
                            style={styles.metaIcon}
                        />
                        <Text style={styles.metaChipText} numberOfLines={1}>
                            {responsable || "Sin responsable"}
                        </Text>
                    </View>
                </View>

                <View style={styles.bottomRow}>
                    <View>
                        <Text style={styles.bottomLabel}>Detalle</Text>
                        <Text style={styles.bottomValue}>
                            {detailQuery.data
                                ? `${totalItems ?? 0} ítems`
                                : "Toca para ver ítems"}
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
                            <Text style={styles.errorTitle}>No fue posible cargar el detalle</Text>
                            <Text style={styles.errorText}>Intenta nuevamente.</Text>
                        </View>
                    ) : (
                        <>
                            {detailQuery.data?.nota ? (
                                <View style={styles.noteBox}>
                                    <Text style={styles.noteLabel}>Nota</Text>
                                    <Text style={styles.noteText}>{detailQuery.data.nota}</Text>
                                </View>
                            ) : null}

                            <View style={styles.itemsWrap}>
                                {(detailQuery.data?.detalle_traslado ?? []).length === 0 ? (
                                    <View style={styles.emptyBox}>
                                        <Text style={styles.emptyText}>
                                            Este traslado no tiene ítems visibles.
                                        </Text>
                                    </View>
                                ) : (
                                    detailQuery.data?.detalle_traslado.map((item) => (
                                        <TrasladoDetailRow key={item.id_detalle} item={item} />
                                    ))
                                )}
                            </View>
                        </>
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
        color: colors.textPrimary,
        fontSize: 20,
        fontFamily: typography.fontFamily.extrabold,
        marginBottom: 6,
    },
    route: {
        color: colors.textSecondary,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: typography.fontFamily.semibold,
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
    statusDraft: {
        backgroundColor: "#EEF3FF",
    },
    statusTextDraft: {
        color: "#3467EB",
    },
    statusTransit: {
        backgroundColor: "#FEF3C7",
    },
    statusTextTransit: {
        color: "#B45309",
    },
    statusReceived: {
        backgroundColor: "#DDF4E5",
    },
    statusTextReceived: {
        color: "#1F9D55",
    },
    statusCancelled: {
        backgroundColor: "#FEE2E2",
    },
    statusTextCancelled: {
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
        marginBottom: 16,
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
        maxWidth: 180,
        color: colors.textSecondary,
        fontSize: 12,
        fontFamily: typography.fontFamily.bold,
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    bottomLabel: {
        color: colors.textMuted,
        fontSize: 12,
        fontFamily: typography.fontFamily.medium,
        marginBottom: 4,
    },
    bottomValue: {
        color: colors.textPrimary,
        fontSize: 16,
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
    noteBox: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
        marginBottom: 12,
    },
    noteLabel: {
        color: colors.textMuted,
        fontSize: 12,
        fontFamily: typography.fontFamily.medium,
        marginBottom: 6,
    },
    noteText: {
        color: colors.textPrimary,
        fontSize: 14,
        lineHeight: 22,
        fontFamily: typography.fontFamily.regular,
    },
    itemsWrap: {
        gap: 10,
    },
    emptyBox: {
        backgroundColor: "#F8FAFC",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 14,
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: typography.fontFamily.regular,
    },
});