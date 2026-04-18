import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ClienteListItem } from "../types/clientes.types";
import { colors } from "@/core/theme/colors";

type Props = {
  item: ClienteListItem;
  onPress: () => void;
};

export default function ClienteCard({ item, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{item.codigo || "Sin código"}</Text>
        </View>
        {!!item.estado && <Text style={styles.estado}>{item.estado}</Text>}
      </View>

      <Text style={styles.nombre}>{item.nombre}</Text>

      <Text style={styles.info}>
        {item.tipoDocumento || "Documento"}: {item.numeroDocumento || "Sin número"}
      </Text>

      <Text style={styles.info}>Tel: {item.telefono || item.celular || "Sin teléfono"}</Text>
      <Text style={styles.info}>Correo: {item.correo || "Sin correo"}</Text>

      {!!item.ciudad && <Text style={styles.info}>Ciudad: {item.ciudad}</Text>}

      <View style={styles.footer}>
        <Text style={styles.link}>Ver detalle</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E9EEF5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  codeBadge: {
    backgroundColor: "#EEF4FF",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  codeText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 12,
  },
  estado: {
    color: "#667085",
    fontSize: 12,
    fontWeight: "600",
  },
  nombre: {
    fontSize: 16,
    fontWeight: "800",
    color: "#101828",
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    color: "#475467",
    marginBottom: 4,
  },
  footer: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  link: {
    color: colors.primary,
    fontWeight: "700",
  },
});