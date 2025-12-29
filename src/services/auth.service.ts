import { API } from "../config";

export const register = async (data: {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  const response = await API.post("/auth/register", data, {
    headers: {
      "Content-Type": "application/json",
      "X-device-Name": "SA-Translator",
      "X-device-Type": "web",
    },
  });
  return response.data;
};
export const login = async (data: { email: string; password: string }) => {
  const response = await API.post("/auth/login", data, {
    headers: {
      "Content-Type": "application/json",
      "X-device-Name": "SA-Translator",
      "X-device-Type": "web",
    },
  });
  return response.data;
};

export const verifyToken = async (data: { token: string; type: string }) => {
  const response = await API.post("/auth/verify-token", data);
  return response.data;
};
export const resendToken = async (data: { email: string; type: string }) => {
  const response = await API.post("/auth/resend-token", data);
  return response.data;
};
export const forgotPassword = async (email: string) => {
  const response = await API.post("/auth/forgot-password", { email });
  return response.data;
};

export const updateProfile = async (data: {
  first_name: string;
  last_name: string;
  location: string;
  bio: string;
}) => {
  const response = await API.patch("/profile/update", data);
  return response.data;
};

export const updatePassword = async (data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) => {
  const response = await API.post("/profile/change-password", data);
  return response.data;
};

export const getSessions = async () => {
  const response = await API.get("/sessions");
  return response.data;
};

export const deleteSession = async (id: string) => {
  const response = await API.delete(`/sessions/${id}/revoke`);
  return response.data;
};
