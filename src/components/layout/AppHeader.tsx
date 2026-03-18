import { useMemo, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import { useBodegaStore } from "@/modules/bodega/store/bodega.store";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { shadows } from "@/core/theme/shadows";
import { typography } from "@/core/theme/typography";

type AppHeaderProps = {
  onLogout: () => void;
};

export default function AppHeader({ onLogout }: AppHeaderProps) {
  const usuario = useAuthStore((state) => state.usuario);

  const {
    bodegas,
    selectedBodegaId,
    selectedBodegaLabel,
    setSelectedBodega,
  } = useBodegaStore();

  const [isBodegaModalOpen, setIsBodegaModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const hasMultipleBodegas = bodegas.length > 1;

  const initials = useMemo(() => {
    const nombre = usuario?.nombre?.[0] ?? "";
    const apellido = usuario?.apellido?.[0] ?? "";
    return `${nombre}${apellido}`.toUpperCase();
  }, [usuario]);

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.topRow}>
          <View style={styles.leftBlock}>
            <View style={styles.logoBox}>
              <Image
                source={require("../../../assets/images/logo-v-icon.png")}
                style={styles.logoIcon}
                resizeMode="contain"
              />
            </View>

            <Pressable
              style={styles.bodegaSelector}
              onPress={() => {
                if (hasMultipleBodegas) {
                  setIsBodegaModalOpen(true);
                }
              }}
            >
              <View style={styles.bodegaTextWrap}>
                <Text style={styles.bodegaLabel}>Bodega</Text>
                <Text style={styles.bodegaValue} numberOfLines={1}>
                  {selectedBodegaLabel}
                </Text>
              </View>

              {hasMultipleBodegas ? (
                <Ionicons
                  name="chevron-down-outline"
                  size={16}
                  color={colors.textPrimary}
                />
              ) : (
                <Ionicons
                  name="business-outline"
                  size={16}
                  color={colors.primary}
                />
              )}
            </Pressable>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => setIsProfileModalOpen(true)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials || "VM"}</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <Modal
        visible={isBodegaModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsBodegaModalOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsBodegaModalOpen(false)}
          />

          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>Seleccionar bodega</Text>

            <Pressable
              style={styles.optionButton}
              onPress={() => {
                setSelectedBodega({
                  id: null,
                  label: "Todas las bodegas",
                });
                setIsBodegaModalOpen(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedBodegaId === null && styles.optionTextActive,
                ]}
              >
                Todas las bodegas
              </Text>
            </Pressable>

            {bodegas.map((bodega) => (
              <Pressable
                key={bodega.id_bodega}
                style={styles.optionButton}
                onPress={() => {
                  setSelectedBodega({
                    id: bodega.id_bodega,
                    label: bodega.nombre_bodega,
                  });
                  setIsBodegaModalOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedBodegaId === bodega.id_bodega &&
                      styles.optionTextActive,
                  ]}
                >
                  {bodega.nombre_bodega}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      <Modal
        visible={isProfileModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsProfileModalOpen(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsProfileModalOpen(false)}
          />

          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{initials || "VM"}</Text>
            </View>

            <Text style={styles.profileName}>
              {usuario?.nombre} {usuario?.apellido}
            </Text>
            <Text style={styles.profileRole}>
              {usuario?.roles?.nombre_rol ?? "Sin rol"}
            </Text>

            <View style={styles.profileInfoCard}>
              <Text style={styles.profileInfoLabel}>Correo</Text>
              <Text style={styles.profileInfoValue}>{usuario?.email}</Text>

              <Text style={styles.profileInfoLabel}>Bodega seleccionada</Text>
              <Text style={styles.profileInfoValue}>{selectedBodegaLabel}</Text>
            </View>

            <Pressable style={styles.secondaryActionButton}>
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.secondaryActionText}>Editar perfil</Text>
            </Pressable>

            <Pressable
              style={styles.logoutButton}
              onPress={() => {
                setIsProfileModalOpen(false);
                onLogout();
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.white} />
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 18,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leftBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  logoIcon: {
    width: 26,
    height: 26,
  },
  bodegaSelector: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.card,
  },
  bodegaTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  bodegaLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
    fontFamily: typography.fontFamily.medium,
  },
  bodegaValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.extrabold,
  },
  profileButton: {
    padding: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.card,
  },
  avatarText: {
    color: colors.white,
    fontSize: 14,
    fontFamily: typography.fontFamily.extrabold,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.backdrop,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: 22,
    paddingTop: 14,
    paddingBottom: 28,
    ...shadows.floating,
  },
  handle: {
    width: 54,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: typography.fontFamily.extrabold,
    textAlign: "center",
    marginBottom: 14,
  },
  optionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
  },
  optionTextActive: {
    color: colors.primary,
    fontFamily: typography.fontFamily.extrabold,
  },
  profileCard: {
    backgroundColor: colors.surface,
    marginHorizontal: 18,
    marginBottom: 26,
    borderRadius: radius.xxl,
    padding: 22,
    ...shadows.floating,
  },
  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  profileAvatarText: {
    color: colors.white,
    fontSize: 24,
    fontFamily: typography.fontFamily.extrabold,
  },
  profileName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontFamily: typography.fontFamily.extrabold,
    textAlign: "center",
  },
  profileRole: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
    fontFamily: typography.fontFamily.medium,
  },
  profileInfoCard: {
    backgroundColor: colors.backgroundSoft,
    borderRadius: radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 14,
  },
  profileInfoLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
    marginTop: 10,
    fontFamily: typography.fontFamily.medium,
  },
  profileInfoValue: {
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: typography.fontFamily.semibold,
  },
  secondaryActionButton: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  secondaryActionText: {
    color: colors.primary,
    fontSize: 15,
    fontFamily: typography.fontFamily.semibold,
  },
  logoutButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: typography.fontFamily.extrabold,
  },
});