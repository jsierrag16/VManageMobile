import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";

import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AppCard from "@/components/ui/AppCard";
import AuthInput from "@/components/ui/AuthInput";
import {
    getMyProfileRequest,
    sendPasswordResetToMyEmail,
    updateMyProfileRequest,
    uploadMyProfilePhotoRequest,
} from "../services/profile.service";
import { useAuthStore } from "@/modules/auth/store/auth.store";
import { colors } from "@/core/theme/colors";
import { typography } from "@/core/theme/typography";
import { radius } from "@/core/theme/radius";
import BrandLoader from "@/components/ui/BrandLoader";

function formatDateForInput(dateString?: string | null) {
    if (!dateString) return "";
    return String(dateString).split("T")[0];
}

function getErrorMessage(error: unknown) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as
            | { message?: string | string[] }
            | undefined;

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

export default function ProfileScreen() {
    const queryClient = useQueryClient();
    const authUser = useAuthStore((state) => state.usuario);
    const updateUsuario = useAuthStore((state) => state.updateUsuario);

    const [isEditing, setIsEditing] = useState(false);

    const [nombre, setNombre] = useState("");
    const [apellido, setApellido] = useState("");
    const [telefono, setTelefono] = useState("");
    const [fechaNacimiento, setFechaNacimiento] = useState("");

    const [nombreError, setNombreError] = useState("");
    const [apellidoError, setApellidoError] = useState("");
    const [formError, setFormError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [securityMessage, setSecurityMessage] = useState("");

    const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
    const [securityConfirmOpen, setSecurityConfirmOpen] = useState(false);

    const profileQuery = useQuery({
        queryKey: ["mi-perfil"],
        queryFn: getMyProfileRequest,
    });

    useEffect(() => {
        const source = profileQuery.data ?? authUser;
        if (!source) return;

        setNombre(source.nombre ?? "");
        setApellido(source.apellido ?? "");
        setTelefono(source.telefono ?? "");
        setFechaNacimiento(formatDateForInput(source.fecha_nacimiento));
    }, [profileQuery.data, authUser]);

    const mutation = useMutation({
        mutationFn: updateMyProfileRequest,
        onSuccess: (data) => {
            updateUsuario(data);
            queryClient.setQueryData(["mi-perfil"], data);

            setNombre(data.nombre ?? "");
            setApellido(data.apellido ?? "");
            setTelefono(data.telefono ?? "");
            setFechaNacimiento(formatDateForInput(data.fecha_nacimiento));

            setSuccessMessage("Perfil actualizado correctamente");
            setFormError("");
            setNombreError("");
            setApellidoError("");
            setIsEditing(false);
        },
        onError: (error) => {
            setSuccessMessage("");
            setFormError(getErrorMessage(error));
        },
    });

    const securityMutation = useMutation({
        mutationFn: sendPasswordResetToMyEmail,
        onSuccess: (data) => {
            setSecurityMessage(
                data.message ||
                "Si el correo existe en el sistema, el enlace se enviará en breve."
            );
        },
        onError: (error) => {
            setSecurityMessage(getErrorMessage(error));
        },
    });

    const photoMutation = useMutation({
        mutationFn: uploadMyProfilePhotoRequest,
        onSuccess: (data) => {
            updateUsuario(data);
            queryClient.setQueryData(["mi-perfil"], data);
            setSuccessMessage("Foto de perfil actualizada correctamente");
            setFormError("");
        },
        onError: (error) => {
            setFormError(getErrorMessage(error));
        },
    });

    const profile = profileQuery.data ?? authUser;

    const initials = useMemo(() => {
        const n = (profile?.nombre ?? "")[0] ?? "";
        const a = (profile?.apellido ?? "")[0] ?? "";
        return `${n}${a}`.toUpperCase();
    }, [profile]);

    const validate = () => {
        let ok = true;

        if (!nombre.trim()) {
            setNombreError("El nombre es obligatorio");
            ok = false;
        } else {
            setNombreError("");
        }

        if (!apellido.trim()) {
            setApellidoError("El apellido es obligatorio");
            ok = false;
        } else {
            setApellidoError("");
        }

        return ok;
    };

    const handleSave = () => {
        setFormError("");
        setSuccessMessage("");

        if (!validate()) return;

        mutation.mutate({
            nombre: nombre.trim(),
            apellido: apellido.trim(),
            telefono: telefono.trim() || null,
            fecha_nacimiento: fechaNacimiento.trim() || null,
        });
    };

    const handleConfirmSave = () => {
        setSaveConfirmOpen(true);
    };

    const handleCancel = () => {
        if (!profile) return;

        setNombre(profile.nombre ?? "");
        setApellido(profile.apellido ?? "");
        setTelefono(profile.telefono ?? "");
        setFechaNacimiento(formatDateForInput(profile.fecha_nacimiento));

        setNombreError("");
        setApellidoError("");
        setFormError("");
        setSuccessMessage("");
        setIsEditing(false);
    };

    const handleSendSecurityLink = () => {
        if (!profile?.email) return;
        setSecurityMessage("");
        securityMutation.mutate(profile.email);
    };

    const handleConfirmSecurityLink = () => {
        setSecurityConfirmOpen(true);
    };

    const handlePickProfilePhoto = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            if (Platform.OS === "web") {
                window.alert(
                    "Debes permitir acceso a la galería para cambiar la foto."
                );
            }
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets?.length) return;

        const asset = result.assets[0];

        photoMutation.mutate({
            uri: asset.uri,
            name: asset.fileName ?? "perfil.jpg",
            type: asset.mimeType ?? "image/jpeg",
            webFile: (asset as any).file,
        });
    };

    if (profileQuery.isLoading && !authUser) {
        return (
            <View style={styles.centerState}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.stateText}>Cargando perfil...</Text>
            </View>
        );
    }

    if (!profile) {
        return (
            <AppCard>
                <Text style={styles.errorTitle}>No encontramos el perfil</Text>
                <Text style={styles.errorText}>
                    Intenta cerrar sesión y volver a ingresar.
                </Text>
            </AppCard>
        );
    }

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.title}>Mi perfil</Text>
                <Text style={styles.subtitle}>Actualiza tu información personal</Text>
            </View>

            <AppCard style={styles.heroCard}>
                <View style={styles.avatarWrap}>
                    <View style={styles.avatar}>
                        {profile.img_url ? (
                            <Image
                                source={{ uri: profile.img_url }}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <Text style={styles.avatarText}>{initials || "VM"}</Text>
                        )}
                    </View>

                    <Pressable
                        style={styles.cameraButton}
                        onPress={handlePickProfilePhoto}
                    >
                        <Ionicons name="camera-outline" size={18} color={colors.white} />
                    </Pressable>
                </View>

                <Text style={styles.name}>
                    {profile.nombre} {profile.apellido}
                </Text>

                <View style={styles.roleChip}>
                    <Ionicons name="shield-outline" size={16} color={colors.primary} />
                    <Text style={styles.roleChipText}>
                        {profile.roles?.nombre_rol ?? "Sin rol"}
                    </Text>
                </View>

                <Text style={styles.assignedTitle}>Bodegas asignadas</Text>
                <View style={styles.bodegasWrap}>
                    {profile.bodegas?.length ? (
                        profile.bodegas.map((bodega) => (
                            <View key={bodega.id_bodega} style={styles.bodegaChip}>
                                <Text style={styles.bodegaChipText}>
                                    {bodega.nombre_bodega}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noBodegaText}>Sin bodegas asignadas</Text>
                    )}
                </View>
            </AppCard>

            <AppCard style={styles.infoCard}>
                <Text style={styles.sectionTitle}>Información personal</Text>

                {!isEditing ? (
                    <View>
                        <Text style={styles.infoLabel}>Nombre</Text>
                        <Text style={styles.infoValue}>{profile.nombre}</Text>

                        <Text style={styles.infoLabel}>Apellido</Text>
                        <Text style={styles.infoValue}>{profile.apellido}</Text>

                        <Text style={styles.infoLabel}>Correo electrónico</Text>
                        <Text style={styles.infoValue}>{profile.email}</Text>

                        <Text style={styles.infoLabel}>Teléfono</Text>
                        <Text style={styles.infoValue}>
                            {profile.telefono || "No registrado"}
                        </Text>

                        <Text style={styles.infoLabel}>Tipo de documento</Text>
                        <Text style={styles.infoValue}>
                            {profile.tipo_documento?.nombre_doc || "No registrado"}
                        </Text>

                        <Text style={styles.infoLabel}>Documento de identidad</Text>
                        <Text style={styles.infoValue}>{profile.num_documento}</Text>

                        <Text style={styles.infoLabel}>Fecha de nacimiento</Text>
                        <Text style={styles.infoValue}>
                            {profile.fecha_nacimiento
                                ? formatDateForInput(profile.fecha_nacimiento)
                                : "No registrada"}
                        </Text>

                        <Text style={styles.infoLabel}>Género</Text>
                        <Text style={styles.infoValue}>
                            {profile.genero?.nombre_genero || "No registrado"}
                        </Text>

                        <Pressable
                            style={styles.editButton}
                            onPress={() => setIsEditing(true)}
                        >
                            <Ionicons name="create-outline" size={18} color={colors.primary} />
                            <Text style={styles.editButtonText}>Editar perfil</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View>
                        <AuthInput
                            label="Nombre:"
                            placeholder="Ingrese su nombre"
                            value={nombre}
                            onChangeText={(text) => {
                                setNombre(text);
                                if (nombreError) setNombreError("");
                                if (formError) setFormError("");
                            }}
                            leftIconName="person-outline"
                            error={nombreError}
                        />

                        <AuthInput
                            label="Apellido:"
                            placeholder="Ingrese su apellido"
                            value={apellido}
                            onChangeText={(text) => {
                                setApellido(text);
                                if (apellidoError) setApellidoError("");
                                if (formError) setFormError("");
                            }}
                            leftIconName="person-outline"
                            error={apellidoError}
                        />

                        <AuthInput
                            label="Correo electrónico:"
                            placeholder="Correo"
                            value={profile.email}
                            onChangeText={() => { }}
                            leftIconName="mail-outline"
                            editable={false}
                        />

                        <AuthInput
                            label="Teléfono:"
                            placeholder="Ingrese su teléfono"
                            value={telefono}
                            onChangeText={(text) => {
                                setTelefono(text);
                                if (formError) setFormError("");
                            }}
                            leftIconName="call-outline"
                            keyboardType="phone-pad"
                        />

                        <AuthInput
                            label="Tipo de documento:"
                            placeholder="Tipo de documento"
                            value={profile.tipo_documento?.nombre_doc || ""}
                            onChangeText={() => { }}
                            leftIconName="card-outline"
                            editable={false}
                        />

                        <AuthInput
                            label="Documento de identidad:"
                            placeholder="Documento"
                            value={profile.num_documento}
                            onChangeText={() => { }}
                            leftIconName="document-text-outline"
                            editable={false}
                        />

                        <AuthInput
                            label="Fecha de nacimiento:"
                            placeholder="YYYY-MM-DD"
                            value={fechaNacimiento}
                            onChangeText={(text) => {
                                setFechaNacimiento(text);
                                if (formError) setFormError("");
                            }}
                            leftIconName="calendar-outline"
                            autoCapitalize="none"
                        />

                        <AuthInput
                            label="Género:"
                            placeholder="Género"
                            value={profile.genero?.nombre_genero || ""}
                            onChangeText={() => { }}
                            leftIconName="person-circle-outline"
                            editable={false}
                        />

                        {formError ? <Text style={styles.formError}>{formError}</Text> : null}
                        {successMessage ? (
                            <Text style={styles.successMessage}>{successMessage}</Text>
                        ) : null}

                        <View style={styles.actionsRow}>
                            <Pressable
                                style={styles.primaryButton}
                                onPress={handleConfirmSave}
                                disabled={mutation.isPending}
                            >
                                <Text style={styles.primaryButtonText}>Guardar cambios</Text>
                            </Pressable>

                            <Pressable
                                style={styles.secondaryButton}
                                onPress={handleCancel}
                                disabled={mutation.isPending}
                            >
                                <Text style={styles.secondaryButtonText}>Cancelar</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </AppCard>

            <AppCard style={styles.securityCard}>
                <Text style={styles.sectionTitle}>Seguridad</Text>

                <Pressable
                    style={styles.securityButton}
                    onPress={handleConfirmSecurityLink}
                    disabled={securityMutation.isPending}
                >
                    <Ionicons name="key-outline" size={18} color={colors.textPrimary} />
                    <Text style={styles.securityButtonText}>
                        Enviar cambio de contraseña al correo
                    </Text>
                </Pressable>

                {securityMessage ? (
                    <Text style={styles.securityMessage}>{securityMessage}</Text>
                ) : null}
            </AppCard>

            <ConfirmDialog
                visible={saveConfirmOpen}
                title="Guardar cambios"
                message="¿Estás seguro de guardar los cambios?"
                confirmText="Guardar"
                cancelText="Cancelar"
                onCancel={() => setSaveConfirmOpen(false)}
                onConfirm={() => {
                    setSaveConfirmOpen(false);
                    handleSave();
                }}
            />

            <ConfirmDialog
                visible={securityConfirmOpen}
                title="Cambio de contraseña"
                message="¿Estás seguro de que deseas enviar el correo de cambio de contraseña?"
                confirmText="Enviar"
                cancelText="Cancelar"
                onCancel={() => setSecurityConfirmOpen(false)}
                onConfirm={() => {
                    setSecurityConfirmOpen(false);
                    handleSendSecurityLink();
                }}
            />

            {mutation.isPending ||
                securityMutation.isPending ||
                photoMutation.isPending ? (
                <View style={styles.loadingOverlay}>
                    <BrandLoader
                        text={
                            mutation.isPending
                                ? "Guardando perfil..."
                                : securityMutation.isPending
                                    ? "Enviando enlace de seguridad..."
                                    : "Actualizando foto..."
                        }
                        fullscreen={false}
                    />
                </View>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 16,
    },
    title: {
        color: colors.textPrimary,
        fontSize: 28,
        fontFamily: typography.fontFamily.extrabold,
        marginBottom: 8,
    },
    subtitle: {
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.medium,
    },
    heroCard: {
        alignItems: "center",
        marginBottom: 14,
    },
    avatarWrap: {
        position: "relative",
        marginBottom: 14,
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: {
        width: "100%",
        height: "100%",
        borderRadius: radius.full,
    },
    cameraButton: {
        position: "absolute",
        right: -2,
        bottom: -2,
        width: 34,
        height: 34,
        borderRadius: radius.full,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.white,
    },
    avatarText: {
        color: colors.white,
        fontSize: 24,
        fontFamily: typography.fontFamily.extrabold,
    },
    name: {
        color: colors.textPrimary,
        fontSize: 22,
        fontFamily: typography.fontFamily.extrabold,
        textAlign: "center",
    },
    roleChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.lg,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 14,
        marginBottom: 18,
    },
    roleChipText: {
        color: colors.primary,
        fontSize: 15,
        fontFamily: typography.fontFamily.bold,
    },
    assignedTitle: {
        color: colors.textSecondary,
        fontSize: 13,
        fontFamily: typography.fontFamily.medium,
        marginBottom: 10,
    },
    bodegasWrap: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        justifyContent: "center",
    },
    bodegaChip: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.full,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    bodegaChipText: {
        color: colors.textPrimary,
        fontSize: 13,
        fontFamily: typography.fontFamily.medium,
    },
    noBodegaText: {
        color: colors.textMuted,
        fontSize: 13,
        fontFamily: typography.fontFamily.medium,
    },
    infoCard: {
        marginBottom: 14,
    },
    securityCard: {
        marginBottom: 14,
    },
    sectionTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontFamily: typography.fontFamily.extrabold,
        marginBottom: 10,
    },
    infoLabel: {
        color: colors.textMuted,
        fontSize: 12,
        fontFamily: typography.fontFamily.medium,
        marginTop: 12,
        marginBottom: 4,
    },
    infoValue: {
        color: colors.textPrimary,
        fontSize: 15,
        fontFamily: typography.fontFamily.semibold,
    },
    editButton: {
        marginTop: 18,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.lg,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    editButtonText: {
        color: colors.primary,
        fontSize: 15,
        fontFamily: typography.fontFamily.semibold,
    },
    formError: {
        marginTop: 12,
        color: colors.danger,
        fontSize: 13,
        fontFamily: typography.fontFamily.medium,
    },
    successMessage: {
        marginTop: 12,
        color: colors.success,
        fontSize: 13,
        fontFamily: typography.fontFamily.medium,
    },
    actionsRow: {
        gap: 12,
        marginTop: 18,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        borderRadius: radius.lg,
        paddingVertical: 14,
        alignItems: "center",
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 15,
        fontFamily: typography.fontFamily.extrabold,
    },
    secondaryButton: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.lg,
        paddingVertical: 14,
        alignItems: "center",
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.textPrimary,
        fontSize: 15,
        fontFamily: typography.fontFamily.semibold,
    },
    securityButton: {
        backgroundColor: colors.surfaceMuted,
        borderRadius: radius.lg,
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    securityButtonText: {
        color: colors.textPrimary,
        fontSize: 15,
        fontFamily: typography.fontFamily.semibold,
    },
    securityMessage: {
        marginTop: 12,
        color: colors.textSecondary,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: typography.fontFamily.medium,
    },
    centerState: {
        paddingVertical: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    stateText: {
        marginTop: 12,
        color: colors.textSecondary,
        fontSize: 14,
        fontFamily: typography.fontFamily.medium,
    },
    errorTitle: {
        color: colors.textPrimary,
        fontSize: 18,
        fontFamily: typography.fontFamily.extrabold,
        marginBottom: 8,
    },
    errorText: {
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