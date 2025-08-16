import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: {
    app: { title: "Property Manager" },
    login: { title: "Sign in", username: "Username", password: "Password", submit: "Log in" },
    errors: { invalid_credentials: "Invalid credentials" }
  }},
  pl: { translation: {
    app: { title: "Zarządzanie mieszkaniami" },
    login: { title: "Zaloguj się", username: "Użytkownik", password: "Hasło", submit: "Zaloguj" },
    errors: { invalid_credentials: "Błędne dane logowania" }
  }},
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pl",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
