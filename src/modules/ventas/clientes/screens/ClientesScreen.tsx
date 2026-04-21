import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ClienteCard from "../components/ClienteCard";
import ClienteDetailModal from "../components/ClienteDetailModal";
import { clientesService } from "../services/clientes.service";
import type { ClienteDetail, ClienteListItem } from "../types/clientes.types";
import { colors } from "@/core/theme/colors";

export default function ClientesScreen() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ClienteListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteDetail | null>(null);

  const loadClientes = useCallback(async () => {
    try {
      const data = await clientesService.getAll({
        search: search.trim() || undefined,
      });
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando clientes", error);
      setItems([]);
    }
  }, [search]);

  const initialLoad = useCallback(async () => {
    try {
      setLoading(true);
      await loadClientes();
    } finally {
      setLoading(false);
    }
  }, [loadClientes]);

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadClientes();
    } finally {
      setRefreshing(false);
    }
  }, [loadClientes]);

  const openDetail = useCallback(async (id: number) => {
    try {
      setDetailLoading(true);
      setDetailVisible(true);
      const data = await clientesService.getById(id);
      setSelectedCliente(data);
    } catch (error) {
      console.error("Error cargando detalle del cliente", error);
      setSelectedCliente(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  const filteredTitle = useMemo(() => {
    return `${items.length} cliente${items.length === 1 ? "" : "s"}`;
  }, [items.length]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>Consulta y visualización de clientes</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por nombre, código o documento"
          placeholderTextColor="#98A2B3"
          style={styles.input}
          onSubmitEditing={initialLoad}
          returnKeyType="search"
        />
      </View>

      <Text style={styles.counter}>{filteredTitle}</Text>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.helper}>Cargando clientes...</Text>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>No hay clientes disponibles</Text>
          <Text style={styles.helper}>Intenta con otra búsqueda o actualiza la lista.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ClienteCard item={item} onPress={() => openDetail(item.id)} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <ClienteDetailModal
        visible={detailVisible}
        cliente={detailLoading ? null : selectedCliente}
        onClose={() => {
          setDetailVisible(false);
          setSelectedCliente(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#101828",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#667085",
  },
  searchBox: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E4E7EC",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#101828",
  },
  counter: {
    marginBottom: 12,
    fontSize: 13,
    color: "#475467",
    fontWeight: "600",
  },
  listContent: {
    paddingBottom: 24,
  },
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#101828",
    marginBottom: 8,
    textAlign: "center",
  },
  helper: {
    marginTop: 8,
    textAlign: "center",
    color: "#667085",
  },
});