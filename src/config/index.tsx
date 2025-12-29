import axios, { AxiosError } from "axios";
import { QueryClient } from "@tanstack/react-query";
import { Store } from "../state/store";
import { reset } from "../state/slices/authReducer";
// import { reset } from "../state/slices/authReducer";

export const API = axios.create({
  baseURL: "https://lang-translator.rentangoafrica.com/api/v1",
});

API.defaults.headers.common.Accept = "application/json";
API.defaults.headers.common["Content-Type"] = "application/json";

//  request interceptor
API.interceptors.request.use(
  async (config: any) => {
    const { token } = Store.getState().auths;
    // const token = useSelector(selectToken);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor
API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const isAuthRequest = error?.config?.url?.includes("auth/");
    if (error.response?.status === 401 && !isAuthRequest) {
      Store.dispatch(reset());
      // restore initial auth state
      window.location.href = "/login";
    }
    throw error;
  }
);

// Create a QueryClient instance
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }: any) => {
        const response = await API.get(queryKey[0]);
        return response.data;
      },
    },
  },
});
