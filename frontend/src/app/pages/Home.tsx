import { Link } from "react-router";
import { Code, Trophy, BookOpen, Target } from "lucide-react";
import { useLanguage } from "../i18n";

export function Home() {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-gray-900 dark:text-white">
            {t("home.title")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            {t("home.subtitle")}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/tasks"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t("home.start")}
            </Link>
            <Link
              to="/courses"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t("home.view_courses")}
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{t("home.tasks_card")}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t("home.tasks_desc")}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{t("home.olympiads_card")}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t("home.olympiads_desc")}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{t("home.courses_card")}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t("home.courses_desc")}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{t("home.rating_card")}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t("home.rating_desc")}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {t("home.languages_title")}
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
            {["SQL", "Python", "Node.js", "Java", "C++"].map((lang) => (
              <div
                key={lang}
                className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-center font-medium text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600"
              >
                {lang}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
