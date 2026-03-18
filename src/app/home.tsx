import { useState } from "react";
import { Redirect, useRouter, type Href } from "expo-router";
import { typography } from "@/core/theme/typography";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import BrandLoader from "@/components/ui/BrandLoader";
import AppCard from "@/components/ui/AppCard";
import AppStatCard from "@/components/ui/AppStatCard";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import { clearAccessToken } from "@/core/storage/session";
import { setAccessToken } from "@/core/api/http";
import { useBodegaStore } from "@/modules/bodega/store/bodega.store";

import { colors } from "@/core/theme/colors";
import type {
  AdminMacroModuleKey,
  AdminSubmoduleKey,
} from "@/modules/navigation/config/admin-navigation";

export default function HomeScreen() {
  const router = useRouter();
  const usuario = useAuthStore((state) => state.usuario);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const selectedBodegaLabel = useBodegaStore(
    (state) => state.selectedBodegaLabel
  );
  const selectedBodegaId = useBodegaStore((state) => state.selectedBodegaId);

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentMacro, setCurrentMacro] =
    useState<AdminMacroModuleKey>("dashboard");
  const [currentSubmodule, setCurrentSubmodule] =
    useState<AdminSubmoduleKey>("dashboard");

  if (!usuario) {
    return <Redirect href={"/" as Href} />;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);

    await clearAccessToken();
    setAccessToken(null);
    clearAuth();
    useBodegaStore.getState().clearBodegaContext();

    router.replace("/" as Href);
  };

  const renderDashboard = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Dashboard</Text>
        <Text style={styles.sectionSubtitle}>
          Bodega seleccionada: {selectedBodegaLabel}
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.gridItem}>
          <AppStatCard
            title="Total ventas"
            value="$ 4.494.000"
            trend="+18.5%"
            accent="blue"
          />
        </View>
        <View style={styles.gridItem}>
          <AppStatCard
            title="Clientes"
            value="12"
            trend="+12.3%"
            accent="green"
          />
        </View>
        <View style={styles.gridItem}>
          <AppStatCard
            title="Órdenes venta"
            value="3"
            trend="+7.8%"
            accent="orange"
          />
        </View>
        <View style={styles.gridItem}>
          <AppStatCard
            title="Productos"
            value="15"
            trend="+5.2%"
            accent="purple"
          />
        </View>
      </View>

      <AppCard style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen actual</Text>
        <Text style={styles.summaryText}>
          Este home ya quedó alineado con la identidad de VManage. Ahora cada
          macro módulo del menú inferior abrirá sus submódulos desde abajo.
        </Text>
      </AppCard>
    </>
  );

  const renderModulePlaceholder = (title: string, text: string) => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>
          Contexto: {selectedBodegaLabel}
        </Text>
      </View>

      <AppCard>
        <Text style={styles.moduleTitle}>{title}</Text>
        <Text style={styles.moduleText}>{text}</Text>
      </AppCard>
    </>
  );

  const renderCurrentContent = () => {
    switch (currentSubmodule) {
      case "dashboard":
        return renderDashboard();

      case "productos":
        return renderModulePlaceholder(
          "Productos",
          "Aquí conectaremos el catálogo de productos y su comportamiento con existencias por bodega."
        );

      case "traslados":
        return renderModulePlaceholder(
          "Traslados",
          "Aquí irá el listado de traslados, usando el contexto global de bodega y permisos del usuario."
        );

      case "bodegas":
        return renderModulePlaceholder(
          "Bodegas",
          "Aquí se visualizarán las bodegas del sistema en modo solo lectura para administrador."
        );

      case "proveedores":
        return renderModulePlaceholder(
          "Proveedores",
          "Aquí se mostrará el módulo de proveedores en vista administrativa."
        );

      case "ordenes_compra":
        return renderModulePlaceholder(
          "Órdenes de compra",
          "Aquí conectaremos el listado de órdenes de compra."
        );

      case "remisiones_compra":
        return renderModulePlaceholder(
          "Remisiones de compra",
          "Aquí conectaremos el listado de remisiones de compra."
        );

      case "clientes":
        return renderModulePlaceholder(
          "Clientes",
          "Aquí se mostrará el módulo de clientes en solo lectura."
        );

      case "cotizaciones":
        return renderModulePlaceholder(
          "Cotizaciones",
          "Aquí conectaremos el módulo de cotizaciones."
        );

      case "ordenes_venta":
        return renderModulePlaceholder(
          "Órdenes de venta",
          "Aquí conectaremos el módulo de órdenes de venta."
        );

      case "remisiones_venta":
        return renderModulePlaceholder(
          "Remisiones de venta",
          "Aquí conectaremos el módulo de remisiones de venta."
        );

      case "pagos":
        return renderModulePlaceholder(
          "Pagos",
          "Aquí conectaremos el módulo de pagos."
        );

      case "roles":
        return renderModulePlaceholder(
          "Roles",
          "Aquí se mostrará el módulo de roles del sistema."
        );

      case "usuarios":
        return renderModulePlaceholder(
          "Usuarios",
          "Aquí se mostrará el módulo de usuarios, y luego podremos evaluar acciones puntuales como restablecer contraseña."
        );

      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader onLogout={handleLogout} />
          {renderCurrentContent()}
        </ScrollView>

        <BottomNav
          currentMacro={currentMacro}
          currentSubmodule={currentSubmodule}
          onSelectDashboard={() => {
            setCurrentMacro("dashboard");
            setCurrentSubmodule("dashboard");
          }}
          onOpenMacro={(macro) => {
            setCurrentMacro(macro);
          }}
          onSelectSubmodule={(macro, submodule) => {
            setCurrentMacro(macro);
            setCurrentSubmodule(submodule);
          }}
        />

        {isLoggingOut ? (
          <View style={styles.loadingOverlay}>
            <BrandLoader text="Cerrando sesión..." fullscreen={false} />
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 120,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 28,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 8,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
  },
  summaryTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 10,
  },
  summaryText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
  moduleTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: typography.fontFamily.extrabold,
    marginBottom: 10,
  },
  moduleText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.regular,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  gridItem: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  summaryCard: {
    marginTop: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 18, 37, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 999,
  },
});