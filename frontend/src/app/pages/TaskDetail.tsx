import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Play, CheckCircle2, XCircle, Circle, Loader2 } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../auth";
import { useLanguage } from "../i18n";

interface TaskData {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  points: number;
  languages: string[];
  _count: { submissions: number };
}

export function TaskDetail() {
  const { taskId } = useParams();
  const [task, setTask] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("SQL");
  const [code, setCode] = useState("-- Напишите ваш SQL запрос здесь\n");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{ result: string; points: number; output?: string; error?: string } | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const { isLoggedIn } = useAuth();
  const { t } = useLanguage();

  const langMap: Record<string, string> = {
    "SQL": "SQL",
    "Python": "PYTHON",
    "Node.js": "NODEJS",
    "Java": "JAVA",
    "C++": "CPP",
  };

  const reverseLangMap: Record<string, string> = {
    "SQL": "SQL",
    "PYTHON": "Python",
    "NODEJS": "Node.js",
    "JAVA": "Java",
    "CPP": "C++",
  };

  useEffect(() => {
    loadTask();
    if (isLoggedIn) loadSubmissions();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const res = await api.tasks.get(parseInt(taskId!));
      const data = res.data;
      // Normalize languages
      if (typeof data.languages === 'string') {
        data.languages = data.languages.startsWith('[') ? JSON.parse(data.languages) : [data.languages];
      }
      setTask(data);
      if (data.languages.length > 0) {
        const firstLang = reverseLangMap[data.languages[0]] || data.languages[0];
        setSelectedLanguage(firstLang);
      }
    } catch (err) {
      console.error("Failed to load task:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const res = await api.submissions.list({ taskId: parseInt(taskId!) });
      setSubmissions(res.data.submissions);
    } catch (err) {
      // Not logged in or error
    }
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      alert("Войдите в аккаунт чтобы отправить решение");
      return;
    }

    setIsSubmitting(true);
    setSubmissionResult(null);

    try {
      const apiLang = langMap[selectedLanguage] || selectedLanguage;
      const res = await api.submissions.submit(parseInt(taskId!), apiLang, code);
      setSubmissionResult(res.data);
      loadSubmissions();
    } catch (err: any) {
      setSubmissionResult({ result: "ERROR", points: 0, error: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Задача не найдена</p>
        <Link to="/tasks" className="text-blue-600 hover:underline mt-2 inline-block">Назад к задачам</Link>
      </div>
    );
  }

  const correctCount = submissions.filter((s) => s.result === "CORRECT").length;
  const incorrectCount = submissions.filter((s) => s.result === "INCORRECT").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/tasks" className="inline-flex items-center gap-2 mb-6 text-blue-600 dark:text-blue-400 hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Назад к задачам
      </Link>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Task info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  #{task.id} {task.title}
                </h1>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">
                    {task.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    task.difficulty <= 30 ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300" :
                    task.difficulty <= 60 ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300" :
                    "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                  }`}>
                    {task.difficulty}% {t("tasks.difficulty").toLowerCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{task.points}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("task.points")}</div>
              </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
              <h3 className="text-gray-900 dark:text-white">{t("task.description")}</h3>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                {task.description}
              </pre>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Статистика</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("tasks.difficulty")}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{task.difficulty}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("task.points")}</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{task.points}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Решений</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{task._count.submissions}</div>
              </div>
            </div>
          </div>

          {/* Submission history */}
          {submissions.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-bold mb-4 text-gray-900 dark:text-white">Мои попытки</h3>
              <div className="flex gap-2 mb-4">
                {submissions.slice(0, 10).map((s, i) => (
                  <div
                    key={s.id}
                    className={`w-8 h-8 rounded flex items-center justify-center ${
                      s.result === "CORRECT" ? "bg-green-100 dark:bg-green-900" :
                      s.result === "INCORRECT" ? "bg-red-100 dark:bg-red-900" :
                      "bg-gray-100 dark:bg-gray-700"
                    }`}
                  >
                    {s.result === "CORRECT" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> :
                     s.result === "INCORRECT" ? <XCircle className="w-4 h-4 text-red-600" /> :
                     <Circle className="w-4 h-4 text-gray-400" />}
                  </div>
                ))}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                ✅ {correctCount} правильных • ❌ {incorrectCount} неправильных
              </div>
            </div>
          )}
        </div>

        {/* Right: Code editor */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                {t("task.language")}
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {task.languages.map((lang) => {
                  const displayLang = reverseLangMap[lang] || lang;
                  return <option key={lang} value={displayLang}>{displayLang}</option>;
                })}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                Редактор кода
              </label>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-64 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                placeholder="Введите ваш код здесь..."
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !code.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              {isSubmitting ? "Проверка..." : t("task.submit")}
            </button>
          </div>

          {/* Submission result */}
          {submissionResult && (
            <div className={`rounded-lg shadow-sm border p-6 ${
              submissionResult.result === "CORRECT"
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                {submissionResult.result === "CORRECT" ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className={`text-lg font-bold ${
                    submissionResult.result === "CORRECT" ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"
                  }`}>
                    {submissionResult.result === "CORRECT" ? "Правильно!" : "Неправильно"}
                  </h3>
                  {submissionResult.points > 0 && (
                    <p className="text-green-600 dark:text-green-400 text-sm">+{submissionResult.points} баллов</p>
                  )}
                </div>
              </div>
              {submissionResult.output && (
                <p className="text-sm text-gray-700 dark:text-gray-300">{submissionResult.output}</p>
              )}
              {submissionResult.error && (
                <p className="text-sm text-red-600 dark:text-red-400">{submissionResult.error}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
