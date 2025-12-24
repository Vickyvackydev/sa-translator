/* eslint-disable import/no-cycle */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState } from "../store";
import { UserPayload } from "../../types";

export interface AuthenticationState {
  user: UserPayload | null;
  token: string | null;
  refreshToken?: string;
  role: string | null;
  globalLoading: boolean;
  authType: "REGISTER" | "PASSWORD_RESET" | "EMAIL_RESET";
  storedEmail: string;
}

const initialState: AuthenticationState = {
  user: null,
  token: null,
  refreshToken: "",
  role: "",
  globalLoading: false,
  authType: "REGISTER",
  storedEmail: "",
};

export const AuthSlice = createSlice({
  initialState,
  name: "auths",
  reducers: {
    setUser: (state, action: PayloadAction<UserPayload>) => {
      state.user = action.payload;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    setAuthType: (
      state,
      action: PayloadAction<"REGISTER" | "PASSWORD_RESET" | "EMAIL_RESET">
    ) => {
      state.authType = action.payload;
    },
    reset: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = "";
      state.role = "";
      state.globalLoading = false;
      state.authType = "REGISTER";
      state.storedEmail = "";
    },
    setStoredEmail: (state, action: PayloadAction<string>) => {
      state.storedEmail = action.payload;
    },
  },
});

export const {
  setUser,
  setToken,
  reset,
  setRefreshToken,
  setRole,
  setGlobalLoading,
  setAuthType,
  setStoredEmail,
} = AuthSlice.actions;

export const selectUser = (state: RootState) => state.auths.user;
export const selectToken = (state: RootState) => state.auths.token;
export const selectRefreshToken = (state: RootState) =>
  state.auths.refreshToken;
export const selectRole = (state: RootState) => state.auths.role;
export const globalLoading = (state: RootState) => state.auths.globalLoading;
export const authType = (state: RootState) => state.auths.authType;
export const storedEmail = (state: RootState) => state.auths.storedEmail;
export const authReducer = AuthSlice.reducer;
