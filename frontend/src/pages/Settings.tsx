import { CogIcon } from "@heroicons/react/24/solid";
import Placeholder from "../components/Placeholder";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
  return <Placeholder title={t('settings.title')} icon={<CogIcon className="h-16 w-16 text-gray-400" />} />;
}