import { ChartBarIcon } from "@heroicons/react/24/solid";
import Placeholder from "../components/Placeholder";
import { useTranslation } from "react-i18next";

export default function Statistics() {
  const { t } = useTranslation();
  return <Placeholder title={t('statistics.title')} icon={<ChartBarIcon className="h-16 w-16 text-gray-400" />} />;
}