import { useState } from "react";
import api from "../api";

export default function Register() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [role, setR] = useState("tenant");
  const [msg, setMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await api.post(`/register?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&role=${role}`);
    setMsg(res.data.message);
  };

  return (
    <div className="min-h-screen grid place-items-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm p-6 rounded-2xl border shadow-sm space-y-4">
        <h1 className="text-2xl font-semibold">Register</h1>
        {msg && <div className="p-2 border rounded bg-green-50">{msg}</div>}
        <input className="w-full border rounded px-3 py-2" placeholder="username" value={username} onChange={e=>setU(e.target.value)} />
        <input type="password" className="w-full border rounded px-3 py-2" placeholder="password" value={password} onChange={e=>setP(e.target.value)} />
        <select className="w-full border rounded px-3 py-2" value={role} onChange={e=>setR(e.target.value)}>
          <option value="tenant">tenant</option>
          <option value="owner">owner</option>
        </select>
        <button className="w-full py-2 rounded bg-black text-white">Create</button>
      </form>
    </div>
  );
}
