import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Search, Filter, Loader2 } from "lucide-react";
import { api } from "../api";
import { useLanguage } from "../i18n";

interface Task {
  id: number;
  title: string;
  category: string;
  difficulty: number;
  points: number;
  _count: { submissions: number };
}

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("Все");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Все");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const { t } = useLanguage();

  const languages = ["Все", "SQL", "Python", "Node.js", "Java", "C++"];
  const difficulties = ["Все", "Легкая (0-30%)", "Средняя (31-60%)", "Сложная (61-100%)"];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await api.tasks.list();
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (selectedLanguage !== "Все" && task.category !== selectedLanguage) return false;
      if (selectedDifficulty !== "Все") {
        if (selectedDifficulty === "Легкая (0-30%)" && task.difficulty > 30) return false;
        if (selectedDifficulty === "Средняя (31-60%)" && (task.difficulty <= 30 || task.difficulty > 60)) return false;
        if (selectedDifficulty === "Сложная (61-100%)" && task.difficulty <= 60) return false;
      }
      if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "difficulty") return a.difficulty - b.difficulty;
      if (sortBy === "points") return b.points - a.points;
      return a.id - b.id;
    });

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 30) return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900";
    if (difficulty <= 60) return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900";
    return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("tasks.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Решайте задачи по программированию и улучшайте свои навыки
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 className="font-bold text-gray-900 dark:text-white">Фильтры</h2>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t("tasks.search")}</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder={t("tasks.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t("task.language")}</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t("tasks.difficulty")}</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Сортировка</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="id">По ID</option>
              <option value="difficulty">По сложности</option>
              <option value="points">По баллам</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Название</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t("tasks.category")}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t("tasks.difficulty")}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t("task.points")}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 text-gray-900 dark:text-white">#{task.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{task.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">
                      {task.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(task.difficulty)}`}>
                      {task.difficulty}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{task.points}</td>
                  <td className="px-6 py-4">
                    <Link
                      to={`/tasks/${task.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block text-sm"
                    >
                      {t("tasks.open")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Задачи не найдены. Попробуйте изменить фильтры.
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Показано задач: {filteredTasks.length} из {tasks.length}
      </div>
    </div>
  );
}
