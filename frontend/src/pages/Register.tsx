import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { Input, Button, Card } from "../components/UI";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [role, setR] = useState("tenant");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await api.post(
      `/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${role}`
    );
    setMsg(res.data.message);
  };

  return (
    <div className="flex min-h-full flex-col justify-start pt-24 px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-gray-900">
          {t("login.sign_up")}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            {msg && (
              <div className="p-2 border rounded-lg bg-green-50 text-green-700">{msg}</div>
            )}
            <Input
              label={t("login.username")}
              value={username}
              onChange={e => setU(e.target.value)}
            />
            <Input
              type="password"
              label={t("login.password")}
              value={password}
              onChange={e => setP(e.target.value)}
            />
            <select
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
              value={role}
              onChange={e => setR(e.target.value)}
            >
              <option value="tenant">Tenant</option>
              <option value="owner">Owner</option>
            </select>
            <Button>Create</Button>
            <p className="text-sm text-center text-gray-500">
              Masz już konto?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Zaloguj się
              </Link>
            </p>
          </Card>
        </form>
      </div>
    </div>
  );
}
