import { useState, useEffect } from "react";
import { BookOpen, Play, CheckCircle, ArrowLeft, Code, ExternalLink } from "lucide-react";
import { useLanguage } from "../i18n";
import { useAuth } from "../auth";

interface Lesson {
  id: string;
  title: string;
  content: string;
  codeExample: string;
  fileUrl?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  lessons: Lesson[];
}

export function Courses() {
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const data = localStorage.getItem("admin_courses");
      if (data) setCourses(JSON.parse(data));
    } catch {
      setCourses([]);
    }
  }, []);

  const markComplete = (courseId: string, lessonId: string) => {
    setCompletedLessons({ ...completedLessons, [`${courseId}-${lessonId}`]: true });
    if (activeLesson < (activeCourse?.lessons.length || 0) - 1) {
      setActiveLesson(activeLesson + 1);
    }
  };

  const getCourseProgress = (course: Course) => {
    const completed = course.lessons.filter((l) => completedLessons[`${course.id}-${l.id}`]).length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  const getLevelColor = (level: string) => {
    if (level === "beginner") return "bg-green-500";
    if (level === "intermediate") return "bg-yellow-500";
    return "bg-red-500";
  };

  const getLevelLabel = (level: string) => {
    if (level === "beginner") return t("courses.beginner");
    if (level === "intermediate") return t("courses.intermediate");
    return t("courses.advanced");
  };

  // Lesson view
  if (activeCourse) {
    const lesson = activeCourse.lessons[activeLesson];
    const isCompleted = completedLessons[`${activeCourse.id}-${lesson.id}`];

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => setActiveCourse(null)} className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />Назад к курсам
        </button>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - lesson list */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <h3 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">{activeCourse.title}</h3>
              <div className="space-y-1">
                {activeCourse.lessons.map((l, i) => (
                  <button key={l.id} onClick={() => setActiveLesson(i)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors flex items-center gap-2 ${
                      i === activeLesson ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                    {completedLessons[`${activeCourse.id}-${l.id}`] ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" /> : <Play className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <span className="truncate">{l.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{lesson.title}</h2>
                <span className="text-sm text-gray-500">{activeLesson + 1}/{activeCourse.lessons.length}</span>
              </div>

              <div className="prose dark:prose-invert max-w-none mb-6">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{lesson.content}</p>
              </div>

              {lesson.codeExample && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Пример кода:</span>
                  </div>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{lesson.codeExample}</code>
                  </pre>
                </div>
              )}

              {lesson.fileUrl && (
                <div className="mb-6">
                  <a
                    href={lesson.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Открыть файл / видео
                  </a>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))} disabled={activeLesson === 0}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white text-sm">
                  ← Предыдущий
                </button>
                {!isCompleted ? (
                  <button onClick={() => markComplete(activeCourse.id, lesson.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    ✓ Урок пройден
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4" />Пройден</span>
                )}
                <button onClick={() => setActiveLesson(Math.min(activeCourse.lessons.length - 1, activeLesson + 1))} disabled={activeLesson === activeCourse.lessons.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm">
                  Следующий →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No courses
  if (courses.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("courses.title")}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t("courses.subtitle")}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">Курсы пока не добавлены</p>
        </div>
      </div>
    );
  }

  // Course list
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("courses.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("courses.subtitle")}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const progress = getCourseProgress(course);
          return (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{course.title}</h3>
                  <div className={`inline-block px-2 py-1 rounded-full text-white text-xs mt-1 ${getLevelColor(course.level)}`}>
                    {getLevelLabel(course.level)}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
              <div className="flex gap-4 mb-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1"><Play className="w-4 h-4 text-gray-400" />{course.lessons.length} {t("courses.lessons")}</div>
              </div>
              {progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{t("courses.progress")}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
              <button onClick={() => { setActiveCourse(course); setActiveLesson(0); }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                {progress === 100 ? (<><CheckCircle className="w-4 h-4" />{t("courses.completed")}</>) :
                 progress > 0 ? t("courses.continue") : t("courses.start")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
