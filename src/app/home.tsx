import { Redirect, useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import ClientesScreen from "@/modules/ventas/clientes/screens/ClientesScreen";
import CotizacionesScreen from "@/modules/ventas/cotizaciones/screens/CotizacionesScreen";
import OrdenesVentaScreen from "@/modules/ventas/ordenes-venta/screens/OrdenesVentaScreen";
import RemisionesVentaScreen from "@/modules/ventas/remisiones-venta/screens/RemisionesVentaScreen";
import PagosAbonosScreen from "@/modules/ventas/pagos-abonos/screens/PagosAbonosScreen";
import type {
  AdminMacroModuleKey,
  AdminSubmoduleKey,
} from "@/modules/navigation/config/admin-navigation";
import {
  canAccessSubmodule,
  getDefaultNavigationForUser,
} from "@/modules/navigation/utils/permissions";
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

  const defaultNavigation = useMemo(
    () => getDefaultNavigationForUser(usuario),
    [usuario]
  );

  useEffect(() => {
    if (!usuario) return;

    if (!canAccessSubmodule(usuario, currentSubmodule)) {
      setCurrentMacro(defaultNavigation.macro);
      setCurrentSubmodule(defaultNavigation.submodule);
    }
  }, [usuario, currentSubmodule, defaultNavigation]);

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

  const renderNoAccess = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sin acceso</Text>
        <Text style={styles.sectionSubtitle}>
          Contexto: {selectedBodegaLabel}
        </Text>
      </View>

      <AppCard>
        <Text style={styles.moduleTitle}>No tienes permiso para este módulo</Text>
        <Text style={styles.moduleText}>
          Tu menú se construye automáticamente con los permisos del rol. Si
          necesitas acceso a otro módulo, debe asignarse desde la versión
          administrativa.
        </Text>
      </AppCard>
    </>
  );

  const renderCurrentContent = () => {
    if (!canAccessSubmodule(usuario, currentSubmodule)) {
      return renderNoAccess();
    }

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
        return <ClientesScreen />;

      case "cotizaciones":
        return <CotizacionesScreen />;

      case "ordenes_venta":
        return <OrdenesVentaScreen />;

      case "remisiones_venta":
        return <RemisionesVentaScreen />;

      case "pagos":
        return <PagosAbonosScreen />;

      case "roles":
        return <RolesScreen />;

      case "usuarios":
        return <UsuariosScreen />;

      default:
        return canAccessSubmodule(usuario, defaultNavigation.submodule) ? (
          defaultNavigation.submodule === "dashboard" ? (
            <DashboardScreen />
          ) : (
            renderNoAccess()
          )
        ) : (
          <ProfileScreen />
        );
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
              setCurrentMacro(defaultNavigation.macro);
              setCurrentSubmodule(defaultNavigation.submodule);
            }}
          />

          {renderCurrentContent()}
        </ScrollView>

        <BottomNav
          currentMacro={currentMacro}
          currentSubmodule={currentSubmodule}
          onSelectDashboard={() => {
            setCurrentMacro(defaultNavigation.macro);
            setCurrentSubmodule(defaultNavigation.submodule);
          }}
          onOpenMacro={(macro) => {
            setCurrentMacro(macro);
          }}
          onSelectSubmodule={(macro, submodule) => {
            if (!canAccessSubmodule(usuario, submodule)) return;
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