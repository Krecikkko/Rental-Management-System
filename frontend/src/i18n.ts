import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: { translation: {
    app: { 
      title: "Property Manager", 
      home : "Home", 
      dashboard : "Dashboard",
    },
    login: { 
      title: "Sign in", 
      username: "Username", 
      password: "Password", 
      submit: "Log in", 
      no_account: "Don't have an account?", 
      register: "Register now", 
      forgot_password: "Forgot password?",
      logout : "Logout", 
      change_password: "Change password",
      sign_in: "Sign in",
      sign_up: "Sign up",
    },
    errors: { invalid_credentials: "Invalid credentials" },
    home: {
      welcome: "Welcome to ",
      description: "Manage your properties easily and intuitively. Monitor data, control access, and have full control – all in one place.",
      start_now: "Start now",
    }
  }},
  pl: { translation: {
    app: { 
      title: "Property Manager", 
      home : "Strona główna", 
      dashboard : "Panel" },
    login: { 
      title: "Zaloguj się", 
      username: "Nazwa użytkownika", 
      password: "Hasło", 
      submit: "Zaloguj", 
      no_account: "Nie masz konta?", 
      register: "Zarejestruj się",
      forgot_password: "Zapomniałeś hasła?", 
      logout : "Wyloguj się",
      change_password: "Zmień hasło",
      sign_in: "Zaloguj się",
      sign_up: "Zarejestruj się",
    },
    errors: { invalid_credentials: "Błędne dane logowania" },
    home: {
      welcome: "Witamy w ",
      description: "Zarządzaj swoimi nieruchomościami w prosty i intuicyjny sposób. Monitoruj dane, kontroluj dostęp i miej pełną kontrolę – wszystko w jednym miejscu.",
      start_now: "Rozpocznij teraz",
    }
  }},
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pl",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
