import { HomeIcon } from "@heroicons/react/24/solid";
import Placeholder from "../components/Placeholder";

export default function DashboardHome() {
  return <Placeholder title="Witaj w panelu" icon={<HomeIcon className="h-16 w-16 text-gray-400" />} />;
}