import { useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Input, Card } from "../components/UI";
import { Button } from "../components/Button";

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      // user is already logged in? redirect him to dashboard
      nav("/dashboard");
    }
  }, [user, nav]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      nav("/dashboard");
    } catch (e: any) {
      setError(e?.response?.data?.detail || t("errors.invalid_credentials"));
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
        {/* <img
          className="mx-auto h-10 w-auto"
          src="../public/logo.png"
          alt="Your Company"
        /> */}
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t("login.title")}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            {error && (
              <div className="p-2 text-sm border rounded-lg bg-red-50 text-red-600">
                {error}
              </div>
            )}
            <Input
              label={t("login.username")}
              value={username}
              onChange={(e) => setU(e.target.value)}
            />
            <Input
              label={t("login.password")}
              type="password"
              value={password}
              onChange={(e) => setP(e.target.value)}
            />
            <div className="flex justify-end text-sm">
              <Link
                to="#"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                {t("login.forgot_password")}
              </Link>
            </div>
            <Button>{t("login.submit")}</Button>
            <p className="text-sm text-center text-gray-500">
              {t("login.no_account")}{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                {t("login.register")}
              </Link>
            </p>
          </Card>
        </form>
      </div>
    </div>
  );
}
