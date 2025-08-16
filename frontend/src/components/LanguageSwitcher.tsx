import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex gap-2">
      <button className="px-2 py-1 rounded border" onClick={() => i18n.changeLanguage("pl")}>PL</button>
      <button className="px-2 py-1 rounded border" onClick={() => i18n.changeLanguage("en")}>EN</button>
    </div>
  );
}
