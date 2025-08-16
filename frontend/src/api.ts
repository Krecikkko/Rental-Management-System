import axios from "axios";
import i18n from "./i18n";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:8000",
  withCredentials: false, // jeśli kiedyś przejdziesz na httpOnly cookie → true
});

// dodajemy język do każdego requestu
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  (config.headers as any)["Accept-Language"] = i18n.language || "en";
  return config;
});

export default api;
