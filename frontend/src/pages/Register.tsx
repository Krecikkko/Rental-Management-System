import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { Input, Button, Card } from "../components/UI";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // DODANO
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("tenant");
  const [error, setError] = useState(""); // ZMIANA: Z `msg` na `error` i `success`
  const [success, setSuccess] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // ZMIANA: Wysyłamy dane w ciele żądania jako JSON
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
        role,
      });
      setSuccess(`Użytkownik ${response.data.username} został pomyślnie zarejestrowany! Możesz się teraz zalogować.`);
      
      // Opcjonalnie: przekieruj po chwili
      setTimeout(() => {
        nav("/login");
      }, 3000);

    } catch (err: any) {
      setError(err.response?.data?.detail || "Wystąpił nieznany błąd.");
    }
  };

  return (
    <div
      className="flex min-h-screen flex-col justify-start pt-24 px-6 py-12 lg:px-8 
        bg-gradient-to-b from-indigo-50 to-white 
        dark:from-slate-900 dark:to-slate-800 
        transition-colors duration-300"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("login.sign_up")}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            {error && (
              <div className="p-2 border rounded-lg bg-red-50 text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="p-2 border rounded-lg bg-green-50 text-green-700">
                {success}
              </div>
            )}
            <Input
              label={t("login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label={t("login.email")} // DODANO
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              label={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <select
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-700 text-gray-900 dark:text-gray-200"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="tenant">Tenant</option>
              <option value="owner">Owner</option>
            </select>
            <Button>{t("login.create_account")}</Button>
            <p className="text-sm text-center text-gray-500">
              {t("login.have_account")}{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                {t("login.sign_in")}
              </Link>
            </p>
          </Card>
        </form>
      </div>
    </div>
  );
}
