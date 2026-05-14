import { useState, useEffect } from "react";
import { Calendar, Trophy, Clock, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { useLanguage } from "../i18n";
import { useAuth } from "../auth";

interface OlympiadQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface Olympiad {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  prize: string;
  questions?: OlympiadQuestion[];
}

function getOlympiadStatus(olympiad: Olympiad): "upcoming" | "active" | "completed" {
  const now = new Date();
  const start = new Date(olympiad.startDate);
  const end = new Date(olympiad.endDate);
  if (now < start) return "upcoming";
  if (now > end) return "completed";
  return "active";
}

export function Olympiads() {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const [olympiads, setOlympiads] = useState<Olympiad[]>([]);
  const [activeOlympiad, setActiveOlympiad] = useState<Olympiad | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedOlympiads, setSubmittedOlympiads] = useState<string[]>([]);

  useEffect(() => {
    try {
      const data = localStorage.getItem("admin_olympiads");
      if (data) setOlympiads(JSON.parse(data));
    } catch {
      setOlympiads([]);
    }
    try {
      const subs = localStorage.getItem("olympiad_submissions");
      if (subs) setSubmittedOlympiads(JSON.parse(subs));
    } catch {
      setSubmittedOlympiads([]);
    }
  }, []);

  const startOlympiad = (olympiad: Olympiad) => {
    if (submittedOlympiads.includes(olympiad.id)) return;
    setActiveOlympiad(olympiad);
    setCurrentQuestion(0);
    setAnswers({});
    setSubmitted(false);
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const submitOlympiad = () => {
    if (!activeOlympiad) return;
    // Save submission
    const updatedSubmissions = [...submittedOlympiads, activeOlympiad.id];
    setSubmittedOlympiads(updatedSubmissions);
    localStorage.setItem("olympiad_submissions", JSON.stringify(updatedSubmissions));
    // Save answers
    const existingAnswers = JSON.parse(localStorage.getItem("olympiad_answers") || "{}");
    existingAnswers[activeOlympiad.id] = answers;
    localStorage.setItem("olympiad_answers", JSON.stringify(existingAnswers));
    setSubmitted(true);
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm">{t("olympiads.active")}</span>;
    if (status === "upcoming") return <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">{t("olympiads.upcoming")}</span>;
    return <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm">{t("olympiads.completed")}</span>;
  };

  // Taking olympiad
  if (activeOlympiad && activeOlympiad.questions && activeOlympiad.questions.length > 0 && !submitted) {
    const question = activeOlympiad.questions[currentQuestion];
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setActiveOlympiad(null)} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />Выйти
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeOlympiad.name}</h2>
            <span className="text-sm text-gray-500">{currentQuestion + 1} / {activeOlympiad.questions.length}</span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div className="bg-yellow-500 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / activeOlympiad.questions.length) * 100}%` }} />
          </div>

          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">{question.text}</h3>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button key={index} onClick={() => selectAnswer(question.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[question.id] === index
                    ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-white"
                }`}>
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <button onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))} disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white">
              <ArrowLeft className="w-4 h-4" />Назад
            </button>
            {currentQuestion < activeOlympiad.questions.length - 1 ? (
              <button onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={answers[question.id] === undefined}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50">
                Далее<ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={submitOlympiad} disabled={Object.keys(answers).length < activeOlympiad.questions.length}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                Отправить ответы
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Submission confirmation
  if (activeOlympiad && submitted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ответы отправлены!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Ваши ответы на олимпиаду «{activeOlympiad.name}» успешно отправлены. Результаты будут опубликованы после проверки администратором.
          </p>
          <button onClick={() => setActiveOlympiad(null)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Вернуться к списку
          </button>
        </div>
      </div>
    );
  }

  // No olympiads
  if (olympiads.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("olympiads.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("olympiads.subtitle")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Олимпиады пока не добавлены</p>
        </div>
      </div>
    );
  }

  // Olympiad list
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("olympiads.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("olympiads.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {olympiads.map((olympiad) => {
          const status = getOlympiadStatus(olympiad);
          const hasSubmitted = submittedOlympiads.includes(olympiad.id);
          const hasQuestions = olympiad.questions && olympiad.questions.length > 0;

          return (
            <div key={olympiad.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                {getStatusBadge(status)}
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{olympiad.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{olympiad.description}</p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{t("olympiads.start")}: {olympiad.startDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{t("olympiads.end")}: {olympiad.endDate}</span>
                </div>
              </div>
              {olympiad.prize && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg mb-4">
                  <div className="text-sm font-medium text-yellow-900 dark:text-yellow-300">{t("olympiads.prize")}: {olympiad.prize}</div>
                </div>
              )}
              {hasSubmitted ? (
                <div className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-center text-sm flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Ответы отправлены
                </div>
              ) : (
                <button
                  onClick={() => hasQuestions && status === "active" ? startOlympiad(olympiad) : undefined}
                  disabled={status === "completed" || status === "upcoming" || !hasQuestions}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {status === "completed" ? t("olympiads.completed") : status === "upcoming" ? t("olympiads.upcoming") : !hasQuestions ? "Нет заданий" : t("olympiads.participate")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
