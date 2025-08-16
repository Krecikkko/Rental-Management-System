import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button className="px-3 py-1 rounded border" onClick={logout}>Wyloguj</button>
      </div>
      <pre className="p-3 bg-gray-50 rounded border">{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}
