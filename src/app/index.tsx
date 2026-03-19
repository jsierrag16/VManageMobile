import { getAccessToken, removeAccessToken } from "@/core/storage/session";
import { getMeRequest } from "@/modules/auth/services/auth.service";
import { useBodegaStore } from "@/modules/existencias/bodegas/store/bodega.store";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter, type Href } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from "react-native";

import AuthInput from "@/components/ui/AuthInput";
import BrandLoader from "@/components/ui/BrandLoader";
import { setAccessToken } from "@/core/api/http";
import { saveAccessToken } from "@/core/storage/session";
import { loginRequest, requestPasswordReset } from "@/modules/auth/services/auth.service";
import { useAuthStore } from "@/modules/auth/store/auth.store";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;

    if (Array.isArray(data?.message)) {
      return data.message[0] || "No fue posible completar la solicitud";
    }

    return data?.message || "No fue posible completar la solicitud";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
}

export default function AuthScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const initializeBodegaContext = useBodegaStore(
    (state) => state.initializeBodegaContext
  );

  const [isBooting, setIsBooting] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailError, setForgotEmailError] = useState("");
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState("");

  const sheetHeight = Math.min(Math.max(height * 0.58, 455), 590);
  const hiddenTranslateY = sheetHeight + 40;

  const sheetTranslateY = useRef(new Animated.Value(hiddenTranslateY)).current;
  const heroOpacity = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(0.34)).current;


  useEffect(() => {
    const bootstrap = async () => {
      try {
        const rawToken = await getAccessToken();
        const token =
          typeof rawToken === "string"
            ? rawToken.replace(/^"|"$/g, "").trim()
            : null;

        if (!token || token === "null" || token === "undefined") {
          setAccessToken(null);
          clearAuth();
          return;
        }

        setAccessToken(token);

        const user = await getMeRequest();

        setAuth({
          usuario: user,
          accessToken: token,
        });

        initializeBodegaContext(user.bodegas ?? []);
        router.replace("/home" as Href);
      } catch (error) {
        setAccessToken(null);
        await removeAccessToken();
        clearAuth();
      } finally {
        setIsBooting(false);
      }
    };

    bootstrap();
  }, [clearAuth, initializeBodegaContext, router, setAuth]);

  useEffect(() => {
    if (!isSheetOpen) {
      sheetTranslateY.setValue(hiddenTranslateY);
    }
  }, [hiddenTranslateY, isSheetOpen, sheetTranslateY]);

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: async (data) => {
      setAccessToken(data.access_token);
      await saveAccessToken(data.access_token);

      setAuth({
        usuario: data.user,
        accessToken: data.access_token,
      });

      initializeBodegaContext(data.user.bodegas ?? []);

      router.replace("/home" as Href);
    },
    onError: (error) => {
      setFormError(getErrorMessage(error));
    },
  });

  const forgotMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setForgotSuccessMessage(
        "Te enviamos un enlace de recuperación a tu correo."
      );
      setForgotEmailError("");
    },
    onError: (error) => {
      setForgotSuccessMessage("");
      setForgotEmailError(getErrorMessage(error));
    },
  });

  const isLoadingOverlay = loginMutation.isPending || forgotMutation.isPending;

  const loaderText = loginMutation.isPending
    ? "Iniciando sesión..."
    : "Enviando enlace...";

  const openLogin = () => {
    setFormError("");
    setEmailError("");
    setPasswordError("");
    setIsSheetOpen(true);

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 340,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacity, {
        toValue: 0.18,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.58,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closeLogin = () => {
    if (isLoadingOverlay) return;

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: hiddenTranslateY,
        duration: 280,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0.34,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIsSheetOpen(false);
    });
  };

  const validateLogin = () => {
    let valid = true;

    if (!email.trim()) {
      setEmailError("El correo es requerido");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!password.trim()) {
      setPasswordError("La contraseña es requerida");
      valid = false;
    } else {
      setPasswordError("");
    }

    return valid;
  };

  const handleLogin = () => {
    if (loginMutation.isPending) return;

    setFormError("");

    const isValid = validateLogin();
    if (!isValid) return;

    loginMutation.mutate({
      email: email.trim(),
      contrasena: password,
    });
  };

  const openForgotPassword = () => {
    setForgotSuccessMessage("");
    setForgotEmailError("");
    setForgotEmail(email.trim());
    setIsForgotModalOpen(true);
  };

  const closeForgotPassword = () => {
    if (forgotMutation.isPending) return;
    setIsForgotModalOpen(false);
    setForgotSuccessMessage("");
    setForgotEmailError("");
  };

  const handleForgotPassword = () => {
    if (forgotMutation.isPending) return;

    if (!forgotEmail.trim()) {
      setForgotEmailError("El correo es requerido");
      setForgotSuccessMessage("");
      return;
    }

    setForgotEmailError("");
    setForgotSuccessMessage("");

    forgotMutation.mutate({
      email: forgotEmail.trim(),
    });
  };

  const isLoginButtonDisabled = useMemo(() => {
    return loginMutation.isPending;
  }, [loginMutation.isPending]);

  if (isBooting) {
    return <BrandLoader text="" />;
  }

  return (
    <View style={[styles.screen, { height }]}>
      <ImageBackground
        source={require("../../assets/images/login-bg.jpg")}
        style={styles.background}
        imageStyle={styles.backgroundImage}
        resizeMode="cover"
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Animated.View
            pointerEvents={isSheetOpen ? "none" : "auto"}
            style={[
              styles.heroContent,
              {
                opacity: heroOpacity,
              },
            ]}
          >
            <View style={styles.brandBlock}>
              <Image
                source={require("../../assets/images/logo-vmanage.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.title}>Bienvenido a VETMANAGE</Text>
              <Text style={styles.subtitle}>
                Gestiona tu operación de forma ágil, profesional y centralizada.
              </Text>
            </View>

            <View style={styles.ctaBlock}>
              <Pressable style={styles.ctaButton} onPress={openLogin}>
                <Text style={styles.ctaButtonText}>Comenzar</Text>
              </Pressable>

              <Image
                source={require("../../assets/images/logo-gvm.png")}
                style={styles.gvmLogo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.sheet,
              {
                height: sheetHeight,
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <View style={styles.handle} />

            <AuthInput
              label="Correo electrónico:"
              placeholder="Ingrese su correo"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
                if (formError) setFormError("");
              }}
              leftIconName="person-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              error={emailError}
            />

            <AuthInput
              label="Contraseña:"
              placeholder="Ingrese su contraseña"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError("");
                if (formError) setFormError("");
              }}
              leftIconName="lock-closed-outline"
              rightIconName={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
              onRightPress={() => setIsPasswordVisible((prev) => !prev)}
              secureTextEntry={!isPasswordVisible}
              error={passwordError}
            />

            <Pressable style={styles.forgotLinkWrap} onPress={openForgotPassword}>
              <Text style={styles.forgotLink}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

            <Pressable
              style={[
                styles.loginButton,
                isLoginButtonDisabled && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              disabled={isLoginButtonDisabled}
            >
              <Text style={styles.loginButtonText}>Iniciar sesión</Text>
            </Pressable>

            <Pressable style={styles.backButton} onPress={closeLogin}>
              <Text style={styles.backButtonText}>Volver</Text>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>

        {isLoadingOverlay ? (
          <View style={styles.loadingOverlay}>
            <BrandLoader text={loaderText} fullscreen={false} />
          </View>
        ) : null}
      </ImageBackground>

      <Modal
        visible={isForgotModalOpen}
        transparent
        animationType="fade"
        onRequestClose={closeForgotPassword}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={closeForgotPassword} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Restablecer contraseña</Text>
              <Text style={styles.modalSubtitle}>
                Ingresa tu correo y te enviaremos un enlace para recuperar el acceso.
              </Text>

              <AuthInput
                label="Correo electrónico:"
                placeholder="Ingrese su correo"
                value={forgotEmail}
                onChangeText={(text) => {
                  setForgotEmail(text);
                  if (forgotEmailError) setForgotEmailError("");
                  if (forgotSuccessMessage) setForgotSuccessMessage("");
                }}
                leftIconName="mail-outline"
                keyboardType="email-address"
                autoCapitalize="none"
                error={forgotEmailError}
              />

              {forgotSuccessMessage ? (
                <Text style={styles.successText}>{forgotSuccessMessage}</Text>
              ) : null}

              <Pressable
                style={[
                  styles.modalPrimaryButton,
                  forgotMutation.isPending && styles.loginButtonDisabled,
                ]}
                onPress={handleForgotPassword}
                disabled={forgotMutation.isPending}
              >
                <Text style={styles.modalPrimaryButtonText}>Enviar enlace</Text>
              </Pressable>

              <Pressable style={styles.modalSecondaryButton} onPress={closeForgotPassword}>
                <Text style={styles.modalSecondaryButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: "100%",
    backgroundColor: "#0B1020",
    overflow: "hidden",
  },
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.1 }, { translateX: -12 }, { translateY: -8 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#081225",
  },
  heroContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 44,
    paddingBottom: 30,
    justifyContent: "space-between",
    alignItems: "center",
  },
  brandBlock: {
    alignItems: "center",
    marginTop: 10,
  },
  logo: {
    width: 210,
    height: 78,
    marginBottom: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: "#F3F4F6",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300,
  },
  ctaBlock: {
    width: "100%",
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginBottom: 18,
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  gvmLogo: {
    width: 90,
    height: 64,
    opacity: 0.95,
  },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handle: {
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginBottom: 12,
  },
  forgotLinkWrap: {
    alignSelf: "flex-end",
    marginTop: 14,
  },
  forgotLink: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },
  formErrorText: {
    marginTop: 12,
    color: "#FF4D4F",
    fontSize: 13,
    lineHeight: 18,
  },
  loginButton: {
    marginTop: 22,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonDisabled: {
    opacity: 0.72,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  backButton: {
    marginTop: 16,
    alignItems: "center",
  },
  backButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 18, 37, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 999,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8,18,37,0.68)",
  },
  modalKeyboard: {
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  modalSubtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 12,
  },
  successText: {
    marginTop: 12,
    color: "#0F9D58",
    fontSize: 13,
    lineHeight: 18,
  },
  modalPrimaryButton: {
    marginTop: 18,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  modalPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  modalSecondaryButton: {
    marginTop: 14,
    alignItems: "center",
  },
  modalSecondaryButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
});