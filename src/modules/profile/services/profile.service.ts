import { http } from "@/core/api/http";
import type { AuthUser } from "@/modules/auth/types/auth.types";

export type UpdateProfilePayload = {
    nombre?: string;
    apellido?: string;
    telefono?: string | null;
    fecha_nacimiento?: string | null;
};

export async function getMyProfileRequest() {
    const { data } = await http.get<AuthUser>("/auth/mi-perfil");
    return data;
}

export async function updateMyProfileRequest(payload: UpdateProfilePayload) {
    const { data } = await http.patch<AuthUser>("/auth/mi-perfil", payload);
    return data;
}

export async function sendPasswordResetToMyEmail(email: string) {
    const { data } = await http.post<{ message: string }>(
        "/auth/solicitar-restablecimiento",
        { email }
    );
    return data;
}

export async function uploadMyProfilePhotoRequest(file: {
    uri?: string;
    name?: string;
    type?: string;
    webFile?: File;
}) {
    const formData = new FormData();

    if (file.webFile) {
        formData.append("file", file.webFile);
    } else {
        formData.append("file", {
            uri: file.uri!,
            name: file.name ?? "perfil.jpg",
            type: file.type ?? "image/jpeg",
        } as any);
    }

    const { data } = await http.post<AuthUser>("/auth/mi-perfil/foto", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return data;
}