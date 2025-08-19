import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useTranslation } from "react-i18next";
import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar logo=".../public/logo.png" />
    </div>
  );
}
