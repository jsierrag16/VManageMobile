import { useMemo, useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import AuthInput from "@/components/ui/AuthInput";
import BrandLoader from "@/components/ui/BrandLoader";
import { createPasswordRequest } from "@/modules/auth/services/auth.service";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();

  const token = useMemo(() => {
    const raw = params.token;
    return typeof raw === "string" ? raw : "";
  }, [params.token]);

  const [contrasena, setContrasena] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const mutation = useMutation({
    mutationFn: createPasswordRequest,
    onSuccess: (data) => {
      setSuccessMessage(data.message || "Contraseña creada correctamente");
      setFormError("");
      setPasswordError("");
      setConfirmError("");
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "No fue posible restablecer la contraseña";
      setFormError(Array.isArray(message) ? message[0] : message);
      setSuccessMessage("");
    },
  });

  const validate = () => {
    let ok = true;

    if (!token) {
      setFormError("El enlace no es válido o no contiene token");
      ok = false;
    }

    if (!contrasena.trim()) {
      setPasswordError("La contraseña es obligatoria");
      ok = false;
    } else if (contrasena.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      ok = false;
    } else {
      setPasswordError("");
    }

    if (!confirmar.trim()) {
      setConfirmError("Debes confirmar la contraseña");
      ok = false;
    } else if (confirmar !== contrasena) {
      setConfirmError("Las contraseñas no coinciden");
      ok = false;
    } else {
      setConfirmError("");
    }

    return ok;
  };

  const handleSubmit = () => {
    setFormError("");
    setSuccessMessage("");

    if (!validate()) return;

    mutation.mutate({
      token,
      contrasena,
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/login-bg.jpg")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Restablecer contraseña</Text>
          <Text style={styles.subtitle}>
            Crea una nueva contraseña para recuperar el acceso a tu cuenta.
          </Text>

          <AuthInput
            label="Nueva contraseña:"
            placeholder="Ingrese la nueva contraseña"
            value={contrasena}
            onChangeText={(text) => {
              setContrasena(text);
              if (passwordError) setPasswordError("");
              if (formError) setFormError("");
            }}
            leftIconName="lock-closed-outline"
            rightIconName={passwordVisible ? "eye-off-outline" : "eye-outline"}
            onRightPress={() => setPasswordVisible((prev) => !prev)}
            secureTextEntry={!passwordVisible}
            error={passwordError}
          />

          <AuthInput
            label="Confirmar contraseña:"
            placeholder="Repita la nueva contraseña"
            value={confirmar}
            onChangeText={(text) => {
              setConfirmar(text);
              if (confirmError) setConfirmError("");
              if (formError) setFormError("");
            }}
            leftIconName="shield-checkmark-outline"
            rightIconName={confirmVisible ? "eye-off-outline" : "eye-outline"}
            onRightPress={() => setConfirmVisible((prev) => !prev)}
            secureTextEntry={!confirmVisible}
            error={confirmError}
          />

          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          {successMessage ? (
            <Text style={styles.successText}>{successMessage}</Text>
          ) : null}

          <Pressable
            style={[styles.primaryButton, mutation.isPending && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            <Text style={styles.primaryButtonText}>Guardar contraseña</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.replace("/" as Href)}
          >
            <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {mutation.isPending ? (
        <View style={styles.loadingOverlay}>
          <BrandLoader text="Actualizando contraseña..." fullscreen={false} />
        </View>
      ) : null}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
    transform: [{ scale: 1.1 }, { translateX: -12 }, { translateY: -8 }],
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 18, 37, 0.64)",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  title: {
    color: "#111827",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginBottom: 14,
  },
  errorText: {
    marginTop: 12,
    color: "#FF4D4F",
    fontSize: 13,
    lineHeight: 18,
  },
  successText: {
    marginTop: 12,
    color: "#0F9D58",
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(8, 18, 37, 0.82)",
    alignItems: "center",
    justifyContent: "center",
  },
});