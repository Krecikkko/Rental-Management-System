import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [error, setError] = useState("");

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
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm p-6 rounded-2xl border shadow-sm space-y-4">
        <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
        {error && <div className="p-2 text-sm border rounded bg-red-50">{error}</div>}
        <div>
          <label className="block mb-1">{t("login.username")}</label>
          <input className="w-full border rounded px-3 py-2" value={username} onChange={e=>setU(e.target.value)} />
        </div>
        <div>
          <label className="block mb-1">{t("login.password")}</label>
          <input type="password" className="w-full border rounded px-3 py-2" value={password} onChange={e=>setP(e.target.value)} />
        </div>
        <button className="w-full py-2 rounded bg-black text-white"> {t("login.submit")} </button>
      </form>
    </div>
  );
}
