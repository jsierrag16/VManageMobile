import { Redirect, useRouter, type Href } from "expo-router";
import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AppHeader from "@/components/layout/AppHeader";
import BottomNav from "@/components/layout/BottomNav";
import AppCard from "@/components/ui/AppCard";
import BrandLoader from "@/components/ui/BrandLoader";

import { setAccessToken } from "@/core/api/http";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import { removeAccessToken } from "@/core/storage/session";

import { useAuthStore } from "@/modules/auth/store/auth.store";
import RolesScreen from "@/modules/configuracion/roles/screens/RolesScreen";
import OrdenesCompraScreen from "@/modules/compras/ordenes-compra/screens/ordenCompraScreen";
import ProveedoresScreen from "@/modules/compras/proveedores/screens/proveedoresScreen";
import RemisionesCompraScreen from "@/modules/compras/remisiones-compra/screens/remisionCompraScreen";
import DashboardScreen from "@/modules/dashboard/screens/DashboardScreen";
import BodegasScreen from "@/modules/existencias/bodegas/screens/BodegaScreen";
import { useBodegaStore } from "@/modules/existencias/bodegas/store/bodega.store";
import ProductosScreen from "@/modules/existencias/productos/screens/ProductosScreen";
import TrasladosScreen from "@/modules/existencias/traslados/screens/TrasladoScreen";
import type {
  AdminMacroModuleKey,
  AdminSubmoduleKey,
} from "@/modules/navigation/config/admin-navigation";
import ProfileScreen from "@/modules/profile/screens/ProfileScreen";
import UsuariosScreen from "@/modules/usuarios/screens/UsuariosScreen";

export default function HomeScreen() {
  const router = useRouter();
  const usuario = useAuthStore((state) => state.usuario);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const selectedBodegaLabel = useBodegaStore(
    (state) => state.selectedBodegaLabel
  );

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

    await removeAccessToken();
    setAccessToken(null);
    clearAuth();
    useBodegaStore.getState().clearBodegaContext();

    router.replace("/" as Href);
  };

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
        return <DashboardScreen />;

      case "productos":
        return <ProductosScreen />;

      case "perfil":
        return <ProfileScreen />;

      case "bodegas":
        return <BodegasScreen />;

      case "traslados":
        return <TrasladosScreen />;

      case "proveedores":
        return <ProveedoresScreen />;

      case "ordenes_compra":
        return <OrdenesCompraScreen />;

      case "remisiones_compra":
        return <RemisionesCompraScreen />;

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
        return <RolesScreen />;

      case "usuarios":
        return <UsuariosScreen />;

      default:
        return <DashboardScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            onLogout={handleLogout}
            onOpenProfile={() => {
              setCurrentMacro("administracion");
              setCurrentSubmodule("perfil");
            }}
            onGoHome={() => {
              setCurrentMacro("dashboard");
              setCurrentSubmodule("dashboard");
            }}
          />

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
            <BrandLoader text="" fullscreen={false} />
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 18, 37, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 999,
  },
});