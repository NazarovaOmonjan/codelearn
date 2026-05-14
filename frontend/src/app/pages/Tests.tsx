import { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../i18n";
import { useAuth } from "../auth";

interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface Test {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  questions: Question[];
}

export function Tests() {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTest, setActiveTest] = useState<Test | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [completedTests, setCompletedTests] = useState<Record<string, number>>({});

  useEffect(() => {
    try {
      const data = localStorage.getItem("admin_tests");
      if (data) setTests(JSON.parse(data));
    } catch {
      setTests([]);
    }
  }, []);

  const startTest = (test: Test) => {
    setActiveTest(test);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const finishTest = () => {
    if (!activeTest) return;
    let correct = 0;
    activeTest.questions.forEach((q) => {
      if (answers[q.id] === q.correctIndex) correct++;
    });
    const score = Math.round((correct / activeTest.questions.length) * 100);
    setCompletedTests({ ...completedTests, [activeTest.id]: score });
    setShowResults(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "easy") return "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900";
    if (difficulty === "medium") return "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900";
    return "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900";
  };

  const getDifficultyLabel = (difficulty: string) => {
    if (difficulty === "easy") return t("tests.easy");
    if (difficulty === "medium") return t("tests.medium");
    return t("tests.hard");
  };

  // Test in progress
  if (activeTest && !showResults) {
    const question = activeTest.questions[currentQuestion];
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setActiveTest(null)} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />Выйти из теста
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{activeTest.title}</h2>
            <span className="text-sm text-gray-500">{currentQuestion + 1} / {activeTest.questions.length}</span>
          </div>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${((currentQuestion + 1) / activeTest.questions.length) * 100}%` }} />
          </div>

          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">{question.text}</h3>

          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button key={index} onClick={() => selectAnswer(question.id, index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[question.id] === index
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
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
            {currentQuestion < activeTest.questions.length - 1 ? (
              <button onClick={() => setCurrentQuestion(currentQuestion + 1)} disabled={answers[question.id] === undefined}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                Далее<ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={finishTest} disabled={Object.keys(answers).length < activeTest.questions.length}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                Завершить тест
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Test results
  if (activeTest && showResults) {
    const correct = activeTest.questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const score = Math.round((correct / activeTest.questions.length) * 100);

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center mb-8">
            <div className={`text-6xl font-bold mb-2 ${score >= 70 ? "text-green-600" : score >= 50 ? "text-yellow-600" : "text-red-600"}`}>{score}%</div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeTest.title}</h2>
            <p className="text-gray-500 mt-1">{correct} из {activeTest.questions.length} правильных</p>
          </div>

          <div className="space-y-4 mb-6">
            {activeTest.questions.map((q, i) => {
              const isCorrect = answers[q.id] === q.correctIndex;
              return (
                <div key={q.id} className={`p-4 rounded-lg border ${isCorrect ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800" : "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800"}`}>
                  <div className="flex items-start gap-2">
                    {isCorrect ? <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" /> : <span className="w-5 h-5 text-red-600 mt-0.5 font-bold">✗</span>}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{i + 1}. {q.text}</p>
                      {!isCorrect && <p className="text-sm text-green-600 dark:text-green-400 mt-1">Правильный ответ: {q.options[q.correctIndex]}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button onClick={() => startTest(activeTest)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Пройти снова</button>
            <button onClick={() => setActiveTest(null)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600">К списку тестов</button>
          </div>
        </div>
      </div>
    );
  }

  // No tests
  if (tests.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("tests.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("tests.subtitle")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Тесты пока не добавлены</p>
        </div>
      </div>
    );
  }

  // Test list
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("tests.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("tests.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{test.title}</h3>
                {completedTests[test.id] !== undefined && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />{t("tests.passed")} ({completedTests[test.id]}%)
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("tests.questions")}</div>
                <div className="font-bold text-gray-900 dark:text-white">{test.questions.length}</div>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                  {getDifficultyLabel(test.difficulty)}
                </span>
              </div>
            </div>
            <div className="mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">
                {test.category}
              </span>
            </div>
            <button onClick={() => startTest(test)} className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              {completedTests[test.id] !== undefined ? t("tests.retake") : t("tests.start")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
