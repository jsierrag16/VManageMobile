import { http } from "@/core/api/http";
import type { LoginPayload, LoginResponse, AuthUser } from "../types/auth.types";

export async function loginRequest(payload: LoginPayload) {
  const { data } = await http.post<LoginResponse>("/auth/login", payload);
  return data;
}

export async function getMeRequest() {
  const { data } = await http.get<AuthUser>("/auth/me");
  return data;
}

export async function requestPasswordReset(payload: { email: string }) {
  const { data } = await http.post<{ message: string }>(
    "/auth/solicitar-restablecimiento",
    payload
  );
  return data;
}

export async function createPasswordRequest(payload: {
  token: string;
  contrasena: string;
}) {
  const { data } = await http.post<{ message: string }>(
    "/auth/crear-contrasena",
    payload
  );
  return data;
}