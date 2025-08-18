import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
    const { t } = useTranslation();


    return (
        <div className="flex flex-col items-center justify-center text-center min-h-screen bg-gradient-to-b from-indigo-50 to-white px-6 pt-20">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                {t("home.welcome")} <span className="text-indigo-600">{t("app.title")}</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mb-8">
                {t("home.description")}
            </p>
            <div className="flex gap-4">
                <Link
                    to="/register"
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-500 transition"
                >
                    {t("home.start_now")}
                </Link>
                <Link
                    to="/login"
                    className="px-6 py-3 rounded-lg bg-white border border-gray-300 text-gray-700 font-medium shadow hover:bg-gray-50 transition"
                >
                    {t("login.register")}
                </Link>
            </div>
        </div>
    );
}
