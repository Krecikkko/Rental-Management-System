import { useAuth } from "../auth/AuthContext";
import { Button, Card } from "../components/UI";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto px-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <Button className="w-auto px-4" onClick={logout}>Wyloguj</Button>
        </div>
        <Card>
          <h2 className="text-lg font-medium mb-2">Twoje dane</h2>
          <pre className="p-3 bg-gray-100 rounded-xl text-sm overflow-x-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </Card>
      </div>
    </div>
  );
}
