import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { shadows } from "@/core/theme/shadows";
import {
  adminMacroModules,
  adminSubmodulesByMacro,
  type AdminMacroModuleKey,
  type AdminSubmoduleKey,
} from "@/modules/navigation/config/admin-navigation";

type BottomNavProps = {
  currentMacro: AdminMacroModuleKey;
  currentSubmodule: AdminSubmoduleKey;
  onSelectDashboard: () => void;
  onOpenMacro: (macro: AdminMacroModuleKey) => void;
  onSelectSubmodule: (
    macro: AdminMacroModuleKey,
    submodule: AdminSubmoduleKey
  ) => void;
};

export default function BottomNav({
  currentMacro,
  currentSubmodule,
  onSelectDashboard,
  onOpenMacro,
  onSelectSubmodule,
}: BottomNavProps) {
  const [openedMacro, setOpenedMacro] = useState<AdminMacroModuleKey | null>(
    null
  );

  const currentOptions = openedMacro
    ? adminSubmodulesByMacro[openedMacro]
    : [];

  return (
    <>
      <View style={styles.wrapper}>
        <View style={styles.container}>
          {adminMacroModules.map((item) => {
            const active = currentMacro === item.key;

            return (
              <Pressable
                key={item.key}
                style={styles.item}
                onPress={() => {
                  if (item.key === "dashboard") {
                    onSelectDashboard();
                    return;
                  }

                  onOpenMacro(item.key);
                  setOpenedMacro(item.key);
                }}
              >
                <View style={[styles.iconBox, active && styles.iconBoxActive]}>
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={active ? colors.primary : colors.textMuted}
                  />
                </View>
                <Text style={[styles.label, active && styles.labelActive]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Modal
        visible={!!openedMacro}
        transparent
        animationType="fade"
        onRequestClose={() => setOpenedMacro(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setOpenedMacro(null)}
          />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <Text style={styles.sheetTitle}>
              {openedMacro
                ? adminMacroModules.find((m) => m.key === openedMacro)?.label
                : ""}
            </Text>

            {currentOptions.map((item) => {
              const active = currentSubmodule === item.key;

              return (
                <Pressable
                  key={item.key}
                  style={styles.moduleButton}
                  onPress={() => {
                    if (!openedMacro) return;
                    onSelectSubmodule(openedMacro, item.key);
                    setOpenedMacro(null);
                  }}
                >
                  <View style={styles.moduleLeft}>
                    <View
                      style={[
                        styles.moduleIconWrap,
                        active && styles.moduleIconWrapActive,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={active ? colors.primary : colors.textSecondary}
                      />
                    </View>

                    <View style={styles.moduleTextWrap}>
                      <Text
                        style={[
                          styles.moduleTitle,
                          active && styles.moduleTitleActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={styles.moduleSubtitle}>Solo lectura</Text>
                    </View>
                  </View>

                  <Ionicons
                    name="chevron-forward-outline"
                    size={18}
                    color={colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.floating,
  },
  item: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBoxActive: {
    backgroundColor: colors.primarySoft,
  },
  label: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.primary,
    fontWeight: "800",
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
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
  },
  moduleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  moduleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  moduleIconWrap: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  moduleIconWrapActive: {
    backgroundColor: colors.primarySoft,
  },
  moduleTextWrap: {
    flex: 1,
  },
  moduleTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  moduleTitleActive: {
    color: colors.primary,
  },
  moduleSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
});