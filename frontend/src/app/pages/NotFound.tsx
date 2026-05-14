import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";
import { useLanguage } from "../i18n";

export function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="text-center px-4">
        <div className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">{t("common.not_found")}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          {t("common.not_found")}
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Home className="w-5 h-5" />
            {t("common.back_home")}
          </Link>
          <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
}
