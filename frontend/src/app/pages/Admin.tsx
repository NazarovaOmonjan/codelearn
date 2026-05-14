import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit, Search, Users, Settings, BookOpen,
  Trophy, ClipboardList, Send, Loader2, X, Save, ShieldAlert,
  FileText, GraduationCap
} from "lucide-react";
import { api } from "../api";
import { useLanguage } from "../i18n";
import { useAuth } from "../auth";

// ==================== TYPES ====================

interface Task {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: number;
  points: number;
  solution?: string;
}

interface Test {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  questions: TestQuestion[];
}

interface TestQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: CourseLesson[];
}

interface CourseLesson {
  id: string;
  title: string;
  content: string;
  codeExample: string;
  fileUrl?: string;
}

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

interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  level: number;
  points: number;
  role: string;
  city?: string;
  school?: string;
  createdAt?: string;
  lastLoginAt?: string;
}

interface SiteSettings {
  siteName: string;
  primaryColor: string;
  language: string;
  maintenanceMode: boolean;
  registrationEnabled: boolean;
}

// ==================== HELPERS ====================

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================== MODAL COMPONENT ====================

function Modal({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ==================== TABS ====================

type TabKey = "tasks" | "tests" | "courses" | "olympiads" | "users" | "settings";

const TABS: { key: TabKey; labelKey: string; icon: React.ReactNode }[] = [
  { key: "tasks", labelKey: "Задачи", icon: <ClipboardList className="w-4 h-4" /> },
  { key: "tests", labelKey: "Тесты", icon: <FileText className="w-4 h-4" /> },
  { key: "courses", labelKey: "Курсы", icon: <GraduationCap className="w-4 h-4" /> },
  { key: "olympiads", labelKey: "Олимпиады", icon: <Trophy className="w-4 h-4" /> },
  { key: "users", labelKey: "Пользователи", icon: <Users className="w-4 h-4" /> },
  { key: "settings", labelKey: "Настройки", icon: <Settings className="w-4 h-4" /> },
];

// ==================== MAIN COMPONENT ====================

export function Admin() {
  const { isAdmin } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabKey>("tasks");

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <ShieldAlert className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Доступ запрещён</h1>
        <p className="text-gray-600 dark:text-gray-400">У вас нет прав для доступа к панели администратора.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("admin.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("admin.subtitle")}</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            {tab.icon}
            {tab.labelKey}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "tests" && <TestsTab />}
        {activeTab === "courses" && <CoursesTab />}
        {activeTab === "olympiads" && <OlympiadsTab />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}


// ==================== TASKS TAB ====================

function TasksTab() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "SQL",
    difficulty: 30,
    points: 10,
    solution: "",
  });

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

  const openCreate = () => {
    setEditingTask(null);
    setForm({ title: "", description: "", category: "SQL", difficulty: 30, points: 10, solution: "" });
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || "",
      category: task.category,
      difficulty: task.difficulty,
      points: task.points,
      solution: task.solution || "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: Number(form.difficulty),
        points: Number(form.points),
        solution: form.solution,
      };

      if (editingTask) {
        await api.tasks.update(editingTask.id, payload);
      } else {
        await api.tasks.create(payload);
      }
      setModalOpen(false);
      loadTasks();
    } catch (err) {
      console.error("Failed to save task:", err);
      alert("Ошибка при сохранении задачи");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить эту задачу?")) return;
    try {
      await api.tasks.delete(id);
      loadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
      alert("Ошибка при удалении задачи");
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск задач..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить задачу
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Название</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Категория</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Сложность</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Баллы</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 text-gray-900 dark:text-white">#{task.id}</td>
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{task.title}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs">
                    {task.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{task.difficulty}%</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{task.points}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(task)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Редактировать"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTasks.length === 0 && (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          Задачи не найдены
        </div>
      )}

      {/* Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? "Редактирование задачи" : "Новая задача"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Название</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Категория</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="SQL">SQL</option>
                <option value="Python">Python</option>
                <option value="Node.js">Node.js</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Сложность (%)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Баллы</label>
              <input
                type="number"
                min={1}
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Решение (код)</label>
            <textarea
              value={form.solution}
              onChange={(e) => setForm({ ...form, solution: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
              placeholder="SELECT * FROM users;"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingTask ? "Сохранить" : "Создать"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


// ==================== TESTS TAB ====================

function TestsTab() {
  const [tests, setTests] = useState<Test[]>(() => getFromStorage("admin_tests", []));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [form, setForm] = useState({ title: "", category: "SQL", difficulty: "easy" });
  const [questions, setQuestions] = useState<TestQuestion[]>([]);

  const saveTests = (data: Test[]) => {
    setTests(data);
    saveToStorage("admin_tests", data);
  };

  const openCreate = () => {
    setEditingTest(null);
    setForm({ title: "", category: "SQL", difficulty: "easy" });
    setQuestions([]);
    setModalOpen(true);
  };

  const openEdit = (test: Test) => {
    setEditingTest(test);
    setForm({ title: test.title, category: test.category, difficulty: test.difficulty });
    setQuestions([...test.questions]);
    setModalOpen(true);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: generateId(), text: "", options: ["", "", "", ""], correctIndex: 0 },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      alert("Введите название теста");
      return;
    }
    if (questions.length === 0) {
      alert("Добавьте хотя бы один вопрос");
      return;
    }

    if (editingTest) {
      const updated = tests.map((t) =>
        t.id === editingTest.id ? { ...t, ...form, questions } : t
      );
      saveTests(updated);
    } else {
      const newTest: Test = { id: generateId(), ...form, questions };
      saveTests([...tests, newTest]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Удалить этот тест?")) return;
    saveTests(tests.filter((t) => t.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Тесты ({tests.length})
        </h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать тест
        </button>
      </div>

      {tests.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          Тесты пока не созданы. Нажмите «Создать тест» чтобы добавить первый.
        </div>
      ) : (
        <div className="grid gap-4">
          {tests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{test.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {test.category} • {test.difficulty === "easy" ? "Лёгкий" : test.difficulty === "medium" ? "Средний" : "Сложный"} • {test.questions.length} вопросов
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(test)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(test.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Test Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTest ? "Редактирование теста" : "Новый тест"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Название теста</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Категория</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="SQL">SQL</option>
                <option value="Python">Python</option>
                <option value="Node.js">Node.js</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Сложность</label>
              <select
                value={form.difficulty}
                onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="easy">Лёгкий</option>
                <option value="medium">Средний</option>
                <option value="hard">Сложный</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Вопросы ({questions.length})
              </label>
              <button
                onClick={addQuestion}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3 h-3" />
                Добавить вопрос
              </button>
            </div>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Вопрос {qIdx + 1}</span>
                    <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Текст вопроса"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                    className="w-full px-3 py-1.5 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name={`correct-${q.id}`}
                        checked={q.correctIndex === oIdx}
                        onChange={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                        className="text-blue-600"
                      />
                      <input
                        type="text"
                        placeholder={`Вариант ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingTest ? "Сохранить" : "Создать"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


// ==================== COURSES TAB ====================

function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>(() => getFromStorage("admin_courses", []));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: "", description: "", level: "beginner" });
  const [lessons, setLessons] = useState<CourseLesson[]>([]);

  const saveCourses = (data: Course[]) => {
    setCourses(data);
    saveToStorage("admin_courses", data);
  };

  const openCreate = () => {
    setEditingCourse(null);
    setForm({ title: "", description: "", level: "beginner" });
    setLessons([]);
    setModalOpen(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ title: course.title, description: course.description, level: course.level });
    setLessons([...course.lessons]);
    setModalOpen(true);
  };

  const addLesson = () => {
    setLessons([...lessons, { id: generateId(), title: "", content: "", codeExample: "", fileUrl: "" }]);
  };

  const updateLesson = (index: number, field: keyof CourseLesson, value: string) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      alert("Введите название курса");
      return;
    }

    if (editingCourse) {
      const updated = courses.map((c) =>
        c.id === editingCourse.id ? { ...c, ...form, lessons } : c
      );
      saveCourses(updated);
    } else {
      const newCourse: Course = { id: generateId(), ...form, lessons };
      saveCourses([...courses, newCourse]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Удалить этот курс?")) return;
    saveCourses(courses.filter((c) => c.id !== id));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Курсы ({courses.length})
        </h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать курс
        </button>
      </div>

      {courses.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          Курсы пока не созданы. Нажмите «Создать курс» чтобы добавить первый.
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{course.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {course.level === "beginner" ? "Начальный" : course.level === "intermediate" ? "Средний" : "Продвинутый"} • {course.lessons.length} уроков
                </p>
                {course.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{course.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(course)}
                  className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(course.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Course Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCourse ? "Редактирование курса" : "Новый курс"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Название курса</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Уровень</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="beginner">Начальный</option>
              <option value="intermediate">Средний</option>
              <option value="advanced">Продвинутый</option>
            </select>
          </div>

          {/* Lessons */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Уроки ({lessons.length})
              </label>
              <button
                onClick={addLesson}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3 h-3" />
                Добавить урок
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Урок {idx + 1}</span>
                    <button onClick={() => removeLesson(idx)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Название урока"
                    value={lesson.title}
                    onChange={(e) => updateLesson(idx, "title", e.target.value)}
                    className="w-full px-3 py-1.5 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <textarea
                    placeholder="Содержание урока"
                    value={lesson.content}
                    onChange={(e) => updateLesson(idx, "content", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <textarea
                    placeholder="Пример кода"
                    value={lesson.codeExample}
                    onChange={(e) => updateLesson(idx, "codeExample", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-1.5 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                  />
                  <input
                    type="text"
                    placeholder="https://..."
                    value={lesson.fileUrl || ""}
                    onChange={(e) => updateLesson(idx, "fileUrl", e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <span className="text-xs text-gray-400 dark:text-gray-500">Ссылка на файл/видео</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingCourse ? "Сохранить" : "Создать"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


// ==================== OLYMPIADS TAB ====================

function OlympiadsTab() {
  const [olympiads, setOlympiads] = useState<Olympiad[]>(() => getFromStorage("admin_olympiads", []));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOlympiad, setEditingOlympiad] = useState<Olympiad | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    prize: "",
  });
  const [questions, setQuestions] = useState<OlympiadQuestion[]>([]);
  const [viewingSubmissions, setViewingSubmissions] = useState<string | null>(null);

  const saveOlympiads = (data: Olympiad[]) => {
    setOlympiads(data);
    saveToStorage("admin_olympiads", data);
  };

  const openCreate = () => {
    setEditingOlympiad(null);
    setForm({ name: "", description: "", startDate: "", endDate: "", prize: "" });
    setQuestions([]);
    setModalOpen(true);
  };

  const openEdit = (olympiad: Olympiad) => {
    setEditingOlympiad(olympiad);
    setForm({
      name: olympiad.name,
      description: olympiad.description,
      startDate: olympiad.startDate,
      endDate: olympiad.endDate,
      prize: olympiad.prize,
    });
    setQuestions(olympiad.questions ? [...olympiad.questions] : []);
    setModalOpen(true);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: generateId(), text: "", options: ["", "", "", ""], correctIndex: 0 },
    ]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    (updated[index] as any)[field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      alert("Введите название олимпиады");
      return;
    }

    if (editingOlympiad) {
      const updated = olympiads.map((o) =>
        o.id === editingOlympiad.id ? { ...o, ...form, questions } : o
      );
      saveOlympiads(updated);
    } else {
      const newOlympiad: Olympiad = { id: generateId(), ...form, questions };
      saveOlympiads([...olympiads, newOlympiad]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Удалить эту олимпиаду?")) return;
    saveOlympiads(olympiads.filter((o) => o.id !== id));
  };

  // Get submissions for an olympiad
  const getSubmissions = (olympiadId: string) => {
    try {
      const allAnswers = JSON.parse(localStorage.getItem("olympiad_answers") || "{}");
      return allAnswers[olympiadId] || null;
    } catch {
      return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Олимпиады ({olympiads.length})
        </h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Создать олимпиаду
        </button>
      </div>

      {olympiads.length === 0 ? (
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          Олимпиады пока не созданы. Нажмите «Создать олимпиаду» чтобы добавить первую.
        </div>
      ) : (
        <div className="grid gap-4">
          {olympiads.map((olympiad) => (
            <div
              key={olympiad.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{olympiad.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {olympiad.startDate && olympiad.endDate
                      ? `${olympiad.startDate} — ${olympiad.endDate}`
                      : "Даты не указаны"}
                    {olympiad.prize && ` • Приз: ${olympiad.prize}`}
                    {olympiad.questions && ` • ${olympiad.questions.length} вопросов`}
                  </p>
                  {olympiad.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{olympiad.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewingSubmissions(viewingSubmissions === olympiad.id ? null : olympiad.id)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                    title="Просмотр ответов"
                  >
                    <ClipboardList className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEdit(olympiad)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(olympiad.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Submissions viewer */}
              {viewingSubmissions === olympiad.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ответы участников</h5>
                  {(() => {
                    const submissions = getSubmissions(olympiad.id);
                    if (!submissions) {
                      return <p className="text-sm text-gray-400">Ответов пока нет</p>;
                    }
                    return (
                      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Получены ответы:</p>
                        {olympiad.questions && olympiad.questions.map((q, idx) => {
                          const userAnswer = submissions[q.id];
                          const isCorrect = userAnswer === q.correctIndex;
                          return (
                            <div key={q.id} className="flex items-center gap-2 text-sm py-1">
                              <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                                {isCorrect ? "✓" : "✗"}
                              </span>
                              <span className="text-gray-700 dark:text-gray-300">
                                {idx + 1}. {q.text.substring(0, 50)}{q.text.length > 50 ? "..." : ""}
                              </span>
                              <span className="text-gray-400 text-xs ml-auto">
                                Ответ: {userAnswer !== undefined ? q.options[userAnswer] : "—"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Olympiad Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOlympiad ? "Редактирование олимпиады" : "Новая олимпиада"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Название</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Описание</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Дата начала</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Дата окончания</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Приз</label>
            <input
              type="text"
              value={form.prize}
              onChange={(e) => setForm({ ...form, prize: e.target.value })}
              placeholder="Например: Сертификат, 10000 баллов"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Вопросы ({questions.length})
              </label>
              <button
                onClick={addQuestion}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-3 h-3" />
                Добавить вопрос
              </button>
            </div>
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {questions.map((q, qIdx) => (
                <div key={q.id} className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Вопрос {qIdx + 1}</span>
                    <button onClick={() => removeQuestion(qIdx)} className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Текст вопроса"
                    value={q.text}
                    onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                    className="w-full px-3 py-1.5 mb-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name={`olympiad-correct-${q.id}`}
                        checked={q.correctIndex === oIdx}
                        onChange={() => updateQuestion(qIdx, "correctIndex", oIdx)}
                        className="text-blue-600"
                      />
                      <input
                        type="text"
                        placeholder={`Вариант ${oIdx + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {editingOlympiad ? "Сохранить" : "Создать"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


// ==================== USERS TAB ====================

function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ level: 1, points: 0 });
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.users.list();
      setUsers(res.data.users || res.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({ level: user.level, points: user.points });
    setMessageText("");
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await api.users.update(selectedUser.id, {
        level: Number(editForm.level),
        points: Number(editForm.points),
      });
      // Update local state
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...editForm } : u)));
      setSelectedUser({ ...selectedUser, ...editForm });
      alert("Данные пользователя обновлены");
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Ошибка при обновлении пользователя");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (!confirm(`Удалить пользователя ${selectedUser.name} ${selectedUser.surname}?`)) return;
    try {
      await api.users.delete(selectedUser.id);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setSelectedUser(null);
      alert("Пользователь удалён");
    } catch (err: any) {
      alert("Ошибка: " + (err.message || "Не удалось удалить"));
    }
  };

  const handleSendMessage = async () => {
    if (!selectedUser || !messageText.trim()) return;
    try {
      setSending(true);
      await api.admin.sendMessage(selectedUser.id, messageText);
      setMessageText("");
      alert("Сообщение отправлено");
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Ошибка при отправке сообщения");
    } finally {
      setSending(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.surname.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.school || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по имени, школе или городу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Всего: {users.length} пользователей
        </span>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => selectUser(user)}
                className={`flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 cursor-pointer transition-colors ${
                  selectedUser?.id === user.id
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-medium text-sm">
                  {user.name[0]}{user.surname[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {user.name} {user.surname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Ур. {user.level}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.points} б.</p>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                Пользователи не найдены
              </div>
            )}
          </div>
        </div>

        {/* User Details */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          {selectedUser ? (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedUser.name} {selectedUser.surname}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedUser.city && `${selectedUser.city}`}
                  {selectedUser.school && ` • ${selectedUser.school}`}
                </p>
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  {selectedUser.createdAt && <p>Регистрация: {new Date(selectedUser.createdAt).toLocaleDateString()}</p>}
                  {selectedUser.lastLoginAt && <p>Последний вход: {new Date(selectedUser.lastLoginAt).toLocaleString()}</p>}
                  {!selectedUser.lastLoginAt && <p>Последний вход: никогда</p>}
                </div>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                  selectedUser.role === "ADMIN"
                    ? "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                }`}>
                  {selectedUser.role}
                </span>
              </div>

              {/* Edit Level/Points */}
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Изменить уровень / баллы</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Уровень</label>
                    <input
                      type="number"
                      min={1}
                      value={editForm.level}
                      onChange={(e) => setEditForm({ ...editForm, level: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Баллы</label>
                    <input
                      type="number"
                      min={0}
                      value={editForm.points}
                      onChange={(e) => setEditForm({ ...editForm, points: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateUser}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Save className="w-4 h-4" />
                  Сохранить изменения
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm mt-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Удалить пользователя
                </button>
              </div>

              {/* Send Message */}
              <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">Отправить сообщение</h5>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={3}
                  placeholder="Текст сообщения..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Отправить
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mb-3 opacity-50" />
              <p>Выберите пользователя для управления</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ==================== SETTINGS TAB ====================

function SettingsTab() {
  const [settings, setSettings] = useState<SiteSettings>(() =>
    getFromStorage("admin_settings", {
      siteName: "CodeLearn",
      primaryColor: "#2563eb",
      language: "ru",
      maintenanceMode: false,
      registrationEnabled: true,
    })
  );
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveToStorage("admin_settings", settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Настройки сайта</h3>

      <div className="max-w-2xl space-y-6">
        {/* Site Name */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Название сайта
          </label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Основной цвет
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
            />
            <input
              type="text"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
            />
          </div>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            Язык по умолчанию
          </label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
            <option value="uz">O'zbek</option>
          </select>
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Режим обслуживания</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Сайт будет недоступен для обычных пользователей
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.maintenanceMode ? "bg-red-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.maintenanceMode ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>

          {/* Registration Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Регистрация</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Разрешить новым пользователям регистрироваться
              </p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, registrationEnabled: !settings.registrationEnabled })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.registrationEnabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  settings.registrationEnabled ? "translate-x-6" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Сохранить настройки
          </button>
          {saved && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400">
              ✓ Настройки сохранены
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
