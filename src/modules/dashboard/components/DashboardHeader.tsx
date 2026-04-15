import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import AppCard from "@/components/ui/AppCard";

type Props = {
  selectedBodegaLabel?: string | null;
  periodoLabel?: string | null;
  totalBodegas?: number;
  selectedBodegaId?: number | null;
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (value: string) => void;
  onFechaFinChange: (value: string) => void;
  onRefresh: () => void;
  refreshing?: boolean;
};

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLocalDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function formatDateLabel(value: string) {
  const date = parseLocalDate(value);

  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function DashboardHeader({
  selectedBodegaLabel,
  periodoLabel,
  totalBodegas = 0,
  selectedBodegaId,
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  onRefresh,
  refreshing = false,
}: Props) {
  const [showDesdePicker, setShowDesdePicker] = useState(false);
  const [showHastaPicker, setShowHastaPicker] = useState(false);

  const today = useMemo(() => new Date(), []);
  const todayString = useMemo(() => formatDateInput(today), [today]);

  const fechaInicioDate = useMemo(
    () => parseLocalDate(fechaInicio),
    [fechaInicio]
  );
  const fechaFinDate = useMemo(() => parseLocalDate(fechaFin), [fechaFin]);

  const maxFechaInicioDate = useMemo(() => {
    return fechaFin < todayString ? parseLocalDate(fechaFin) : today;
  }, [fechaFin, todayString, today]);

  const handleDesdeChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowDesdePicker(false);
    }

    if (!selectedDate) return;

    const cappedDate =
      selectedDate.getTime() > maxFechaInicioDate.getTime()
        ? maxFechaInicioDate
        : selectedDate;

    onFechaInicioChange(formatDateInput(cappedDate));
  };

  const handleHastaChange = (_event: any, selectedDate?: Date) => {
    if (Platform.OS !== "ios") {
      setShowHastaPicker(false);
    }

    if (!selectedDate) return;

    let nextDate = selectedDate;

    if (nextDate.getTime() > today.getTime()) {
      nextDate = today;
    }

    if (nextDate.getTime() < fechaInicioDate.getTime()) {
      nextDate = fechaInicioDate;
    }

    onFechaFinChange(formatDateInput(nextDate));
  };

  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.textWrap}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Resumen ejecutivo, operativo y analítico del sistema según la bodega
            y el rango de fechas seleccionados.
          </Text>
        </View>

        <Pressable
          onPress={onRefresh}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.refreshButtonPressed,
          ]}
        >
          <Ionicons
            name="refresh"
            size={16}
            color="#2563EB"
            style={styles.refreshIcon}
          />
          <Text style={styles.refreshText}>
            {refreshing ? "Actualizando..." : "Actualizar"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.chipsWrap}>
        <View style={[styles.chip, styles.chipPurple]}>
          <Ionicons name="business-outline" size={14} color="#6D28D9" />
          <Text style={[styles.chipText, styles.chipTextPurple]}>
            {selectedBodegaLabel?.trim() || "Todas las bodegas"}
          </Text>
        </View>

        {!!periodoLabel && (
          <View style={[styles.chip, styles.chipBlue]}>
            <Text style={[styles.chipText, styles.chipTextBlue]}>
              {periodoLabel}
            </Text>
          </View>
        )}

        {totalBodegas > 1 && (!selectedBodegaId || selectedBodegaId <= 0) && (
          <View style={[styles.chip, styles.chipGreen]}>
            <Text style={[styles.chipText, styles.chipTextGreen]}>
              {totalBodegas} bodegas en vista
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dateRow}>
        <Pressable
          onPress={() => setShowDesdePicker(true)}
          style={({ pressed }) => [
            styles.dateButton,
            pressed && styles.dateButtonPressed,
          ]}
        >
          <View style={styles.dateButtonHeader}>
            <Ionicons name="calendar-outline" size={15} color="#2563EB" />
            <Text style={styles.dateLabel}>Desde</Text>
          </View>

          <Text style={styles.dateValue}>{formatDateLabel(fechaInicio)}</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowHastaPicker(true)}
          style={({ pressed }) => [
            styles.dateButton,
            pressed && styles.dateButtonPressed,
          ]}
        >
          <View style={styles.dateButtonHeader}>
            <Ionicons name="calendar-outline" size={15} color="#2563EB" />
            <Text style={styles.dateLabel}>Hasta</Text>
          </View>

          <Text style={styles.dateValue}>{formatDateLabel(fechaFin)}</Text>
        </Pressable>
      </View>

      {showDesdePicker && (
        <DateTimePicker
          value={fechaInicioDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          maximumDate={maxFechaInicioDate}
          onChange={handleDesdeChange}
        />
      )}

      {showHastaPicker && (
        <DateTimePicker
          value={fechaFinDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          minimumDate={fechaInicioDate}
          maximumDate={today}
          onChange={handleHastaChange}
        />
      )}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  textWrap: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 6,
    lineHeight: 20,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  refreshButtonPressed: {
    opacity: 0.72,
  },
  refreshIcon: {
    marginRight: 6,
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  chipPurple: {
    backgroundColor: "#F5F3FF",
    borderColor: "#DDD6FE",
  },
  chipBlue: {
    backgroundColor: "#EFF6FF",
    borderColor: "#BFDBFE",
  },
  chipGreen: {
    backgroundColor: "#ECFDF5",
    borderColor: "#A7F3D0",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },
  chipTextPurple: {
    color: "#6D28D9",
  },
  chipTextBlue: {
    color: "#1D4ED8",
  },
  chipTextGreen: {
    color: "#047857",
  },
  dateRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  dateButtonPressed: {
    opacity: 0.82,
  },
  dateButtonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  dateValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
});