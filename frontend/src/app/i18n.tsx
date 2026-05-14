import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "ru" | "en" | "uz";

type Translations = Record<string, Record<Language, string>>;

const translations: Translations = {
  // Navigation
  "nav.home": { ru: "Главная", en: "Home", uz: "Bosh sahifa" },
  "nav.tasks": { ru: "Задачи", en: "Tasks", uz: "Topshiriqlar" },
  "nav.profile": { ru: "Личный кабинет", en: "Profile", uz: "Shaxsiy kabinet" },
  "nav.leaderboard": { ru: "Рейтинг", en: "Leaderboard", uz: "Reyting" },
  "nav.olympiads": { ru: "Олимпиады", en: "Olympiads", uz: "Olimpiadalar" },
  "nav.tests": { ru: "Тесты", en: "Tests", uz: "Testlar" },
  "nav.courses": { ru: "Курсы", en: "Courses", uz: "Kurslar" },
  "nav.contacts": { ru: "Контакты", en: "Contacts", uz: "Kontaktlar" },
  "nav.admin": { ru: "Админ", en: "Admin", uz: "Admin" },
  "nav.login": { ru: "Войти", en: "Login", uz: "Kirish" },
  "nav.profile_btn": { ru: "Профиль", en: "Profile", uz: "Profil" },

  // Home page
  "home.title": { ru: "Образовательная платформа для изучения программирования", en: "Educational platform for learning programming", uz: "Dasturlashni o'rganish uchun ta'lim platformasi" },
  "home.subtitle": { ru: "Изучайте SQL, Python, Java, C++ и Node.js через практические задачи", en: "Learn SQL, Python, Java, C++ and Node.js through practical tasks", uz: "SQL, Python, Java, C++ va Node.js ni amaliy topshiriqlar orqali o'rganing" },
  "home.start": { ru: "Начать решать задачи", en: "Start solving tasks", uz: "Topshiriqlarni yechishni boshlash" },
  "home.view_courses": { ru: "Смотреть курсы", en: "View courses", uz: "Kurslarni ko'rish" },
  "home.tasks_card": { ru: "500+ задач", en: "500+ tasks", uz: "500+ topshiriqlar" },
  "home.tasks_desc": { ru: "Практические задачи по SQL и другим языкам программирования", en: "Practical tasks in SQL and other programming languages", uz: "SQL va boshqa dasturlash tillarida amaliy topshiriqlar" },
  "home.olympiads_card": { ru: "Олимпиады", en: "Olympiads", uz: "Olimpiadalar" },
  "home.olympiads_desc": { ru: "Участвуйте в олимпиадах и соревнуйтесь с другими учениками", en: "Participate in olympiads and compete with other students", uz: "Olimpiadalarda ishtirok eting va boshqa o'quvchilar bilan raqobatlashing" },
  "home.courses_card": { ru: "Курсы", en: "Courses", uz: "Kurslar" },
  "home.courses_desc": { ru: "Структурированные курсы от базового до продвинутого уровня", en: "Structured courses from basic to advanced level", uz: "Boshlang'ich darajadan yuqori darajagacha tuzilgan kurslar" },
  "home.rating_card": { ru: "Рейтинг", en: "Leaderboard", uz: "Reyting" },
  "home.rating_desc": { ru: "Отслеживайте свой прогресс и сравнивайте с другими участниками", en: "Track your progress and compare with other participants", uz: "O'z progressingizni kuzating va boshqa ishtirokchilar bilan solishtiring" },
  "home.languages_title": { ru: "Поддерживаемые языки программирования", en: "Supported programming languages", uz: "Qo'llab-quvvatlanadigan dasturlash tillari" },

  // Tasks page
  "tasks.title": { ru: "Задачи", en: "Tasks", uz: "Topshiriqlar" },
  "tasks.subtitle": { ru: "Решайте задачи по программированию и улучшайте свои навыки", en: "Solve programming tasks and improve your skills", uz: "Dasturlash topshiriqlarini yeching va ko'nikmalaringizni oshiring" },
  "tasks.search": { ru: "Поиск задач...", en: "Search tasks...", uz: "Topshiriqlarni qidirish..." },
  "tasks.difficulty": { ru: "Сложность", en: "Difficulty", uz: "Qiyinlik" },
  "tasks.category": { ru: "Категория", en: "Category", uz: "Kategoriya" },
  "tasks.open": { ru: "Открыть задачу", en: "Open task", uz: "Topshiriqni ochish" },
  "tasks.all": { ru: "Все", en: "All", uz: "Hammasi" },
  "tasks.filters": { ru: "Фильтры", en: "Filters", uz: "Filtrlar" },
  "tasks.sort": { ru: "Сортировка", en: "Sort", uz: "Saralash" },
  "tasks.language": { ru: "Язык", en: "Language", uz: "Til" },
  "tasks.not_found": { ru: "Задачи не найдены. Попробуйте изменить фильтры.", en: "No tasks found. Try changing filters.", uz: "Topshiriqlar topilmadi. Filtrlarni o'zgartirib ko'ring." },
  "tasks.shown": { ru: "Показано задач", en: "Tasks shown", uz: "Ko'rsatilgan topshiriqlar" },
  "tasks.of": { ru: "из", en: "of", uz: "dan" },

  // Task detail
  "task.submit": { ru: "Отправить", en: "Submit", uz: "Yuborish" },
  "task.language": { ru: "Язык программирования", en: "Programming language", uz: "Dasturlash tili" },
  "task.description": { ru: "Описание задачи", en: "Task description", uz: "Topshiriq tavsifi" },
  "task.points": { ru: "Баллы", en: "Points", uz: "Ballar" },
  "task.rating": { ru: "Рейтинг", en: "Rating", uz: "Reyting" },
  "task.back": { ru: "Назад к задачам", en: "Back to tasks", uz: "Topshiriqlarga qaytish" },
  "task.stats": { ru: "Статистика", en: "Statistics", uz: "Statistika" },
  "task.solutions_count": { ru: "Решений", en: "Solutions", uz: "Yechimlar" },
  "task.my_attempts": { ru: "Мои попытки", en: "My attempts", uz: "Mening urinishlarim" },
  "task.correct": { ru: "правильных", en: "correct", uz: "to'g'ri" },
  "task.incorrect": { ru: "неправильных", en: "incorrect", uz: "noto'g'ri" },
  "task.code_editor": { ru: "Редактор кода", en: "Code editor", uz: "Kod muharriri" },
  "task.checking": { ru: "Проверка...", en: "Checking...", uz: "Tekshirilmoqda..." },
  "task.result_correct": { ru: "Правильно!", en: "Correct!", uz: "To'g'ri!" },
  "task.result_incorrect": { ru: "Неправильно", en: "Incorrect", uz: "Noto'g'ri" },
  "task.login_required": { ru: "Войдите в аккаунт чтобы отправить решение", en: "Login to submit a solution", uz: "Yechim yuborish uchun tizimga kiring" },

  // Profile
  "profile.title": { ru: "Личный кабинет", en: "Profile", uz: "Shaxsiy kabinet" },
  "profile.level": { ru: "Уровень", en: "Level", uz: "Daraja" },
  "profile.points": { ru: "Баллы", en: "Points", uz: "Ballar" },
  "profile.solved": { ru: "Решено задач", en: "Tasks solved", uz: "Yechilgan topshiriqlar" },
  "profile.city": { ru: "Город", en: "City", uz: "Shahar" },
  "profile.school": { ru: "Школа", en: "School", uz: "Maktab" },
  "profile.registered": { ru: "Дата регистрации", en: "Registration date", uz: "Ro'yxatdan o'tgan sana" },
  "profile.login_required": { ru: "Войдите в аккаунт чтобы увидеть свой профиль", en: "Login to see your profile", uz: "Profilingizni ko'rish uchun tizimga kiring" },
  "profile.progress": { ru: "Прогресс уровня", en: "Level progress", uz: "Daraja progressi" },
  "profile.max_level": { ru: "Максимальный уровень достигнут!", en: "Maximum level reached!", uz: "Maksimal daraja erishildi!" },
  "profile.contacts": { ru: "Контакты", en: "Contacts", uz: "Kontaktlar" },

  // Leaderboard
  "leaderboard.title": { ru: "Рейтинг участников", en: "Leaderboard", uz: "Ishtirokchilar reytingi" },
  "leaderboard.subtitle": { ru: "Лучшие участники платформы CodeLearn", en: "Top participants of CodeLearn platform", uz: "CodeLearn platformasining eng yaxshi ishtirokchilari" },
  "leaderboard.rank": { ru: "Место", en: "Rank", uz: "O'rin" },
  "leaderboard.name": { ru: "Имя", en: "Name", uz: "Ism" },
  "leaderboard.points": { ru: "Баллы", en: "Points", uz: "Ballar" },
  "leaderboard.level": { ru: "Уровень", en: "Level", uz: "Daraja" },
  "leaderboard.solutions": { ru: "Решений", en: "Solutions", uz: "Yechimlar" },
  "leaderboard.status": { ru: "Статус", en: "Status", uz: "Holat" },
  "leaderboard.empty": { ru: "Пока нет участников в рейтинге", en: "No participants in leaderboard yet", uz: "Reytingda hali ishtirokchilar yo'q" },

  // Olympiads
  "olympiads.title": { ru: "Олимпиады", en: "Olympiads", uz: "Olimpiadalar" },
  "olympiads.subtitle": { ru: "Участвуйте в олимпиадах и соревнуйтесь с другими программистами", en: "Participate in olympiads and compete with other programmers", uz: "Olimpiadalarda ishtirok eting va boshqa dasturchilar bilan raqobatlashing" },
  "olympiads.upcoming": { ru: "Скоро", en: "Upcoming", uz: "Tez kunda" },
  "olympiads.active": { ru: "Активна", en: "Active", uz: "Faol" },
  "olympiads.completed": { ru: "Завершена", en: "Completed", uz: "Tugallangan" },
  "olympiads.register": { ru: "Зарегистрироваться", en: "Register", uz: "Ro'yxatdan o'tish" },
  "olympiads.participate": { ru: "Участвовать", en: "Participate", uz: "Ishtirok etish" },
  "olympiads.start": { ru: "Начало", en: "Start", uz: "Boshlanishi" },
  "olympiads.end": { ru: "Окончание", en: "End", uz: "Tugashi" },
  "olympiads.participants": { ru: "Участников", en: "Participants", uz: "Ishtirokchilar" },
  "olympiads.prize": { ru: "Приз", en: "Prize", uz: "Mukofot" },

  // Tests
  "tests.title": { ru: "Тесты", en: "Tests", uz: "Testlar" },
  "tests.subtitle": { ru: "Проверьте свои знания с помощью тестов по различным темам", en: "Test your knowledge with quizzes on various topics", uz: "Turli mavzulardagi testlar yordamida bilimlaringizni tekshiring" },
  "tests.start": { ru: "Начать тест", en: "Start test", uz: "Testni boshlash" },
  "tests.retake": { ru: "Пройти снова", en: "Retake", uz: "Qayta topshirish" },
  "tests.passed": { ru: "Пройден", en: "Passed", uz: "O'tilgan" },
  "tests.questions": { ru: "Вопросов", en: "Questions", uz: "Savollar" },
  "tests.minutes": { ru: "Минут", en: "Minutes", uz: "Daqiqa" },
  "tests.easy": { ru: "Легкий", en: "Easy", uz: "Oson" },
  "tests.medium": { ru: "Средний", en: "Medium", uz: "O'rtacha" },
  "tests.hard": { ru: "Сложный", en: "Hard", uz: "Qiyin" },

  // Courses
  "courses.title": { ru: "Курсы", en: "Courses", uz: "Kurslar" },
  "courses.subtitle": { ru: "Структурированные курсы для систематического изучения программирования", en: "Structured courses for systematic programming learning", uz: "Dasturlashni tizimli o'rganish uchun tuzilgan kurslar" },
  "courses.lessons": { ru: "уроков", en: "lessons", uz: "darslar" },
  "courses.start": { ru: "Начать курс", en: "Start course", uz: "Kursni boshlash" },
  "courses.continue": { ru: "Продолжить", en: "Continue", uz: "Davom ettirish" },
  "courses.completed": { ru: "Завершен", en: "Completed", uz: "Tugallangan" },
  "courses.locked": { ru: "Заблокирован", en: "Locked", uz: "Bloklangan" },
  "courses.progress": { ru: "Прогресс", en: "Progress", uz: "Progress" },
  "courses.beginner": { ru: "Начальный", en: "Beginner", uz: "Boshlang'ich" },
  "courses.intermediate": { ru: "Средний", en: "Intermediate", uz: "O'rtacha" },
  "courses.advanced": { ru: "Продвинутый", en: "Advanced", uz: "Yuqori" },

  // Contacts
  "contacts.title": { ru: "Контакты", en: "Contacts", uz: "Kontaktlar" },
  "contacts.subtitle": { ru: "Свяжитесь с нами, если у вас есть вопросы или предложения", en: "Contact us if you have questions or suggestions", uz: "Savollaringiz yoki takliflaringiz bo'lsa, biz bilan bog'laning" },
  "contacts.info": { ru: "Контактная информация", en: "Contact information", uz: "Aloqa ma'lumotlari" },
  "contacts.email": { ru: "Электронная почта", en: "Email", uz: "Elektron pochta" },
  "contacts.phone": { ru: "Телефон", en: "Phone", uz: "Telefon" },
  "contacts.address": { ru: "Адрес", en: "Address", uz: "Manzil" },
  "contacts.social": { ru: "Социальные сети", en: "Social media", uz: "Ijtimoiy tarmoqlar" },
  "contacts.send_message": { ru: "Отправить сообщение", en: "Send message", uz: "Xabar yuborish" },
  "contacts.name": { ru: "Имя", en: "Name", uz: "Ism" },
  "contacts.subject": { ru: "Тема", en: "Subject", uz: "Mavzu" },
  "contacts.message": { ru: "Сообщение", en: "Message", uz: "Xabar" },
  "contacts.send": { ru: "Отправить", en: "Send", uz: "Yuborish" },
  "contacts.sent": { ru: "Сообщение отправлено!", en: "Message sent!", uz: "Xabar yuborildi!" },

  // Common
  "common.save": { ru: "Сохранить", en: "Save", uz: "Saqlash" },
  "common.cancel": { ru: "Отмена", en: "Cancel", uz: "Bekor qilish" },
  "common.search": { ru: "Поиск...", en: "Search...", uz: "Qidirish..." },
  "common.loading": { ru: "Загрузка...", en: "Loading...", uz: "Yuklanmoqda..." },
  "common.not_found": { ru: "Страница не найдена", en: "Page not found", uz: "Sahifa topilmadi" },
  "common.back_home": { ru: "На главную", en: "Back to home", uz: "Bosh sahifaga" },
  "common.back": { ru: "Назад", en: "Back", uz: "Orqaga" },

  // Admin
  "admin.title": { ru: "Панель администратора", en: "Admin Panel", uz: "Admin paneli" },
  "admin.subtitle": { ru: "Управление задачами, пользователями и контентом платформы", en: "Manage tasks, users and platform content", uz: "Topshiriqlar, foydalanuvchilar va platforma kontentini boshqarish" },
  "admin.tasks": { ru: "Задачи", en: "Tasks", uz: "Topshiriqlar" },
  "admin.users": { ru: "Пользователи", en: "Users", uz: "Foydalanuvchilar" },
  "admin.settings": { ru: "Настройки", en: "Settings", uz: "Sozlamalar" },
  "admin.add_task": { ru: "Добавить задачу", en: "Add task", uz: "Topshiriq qo'shish" },
  "admin.search_tasks": { ru: "Поиск задач...", en: "Search tasks...", uz: "Topshiriqlarni qidirish..." },
  "admin.search_users": { ru: "Поиск по имени, школе или городу...", en: "Search by name, school or city...", uz: "Ism, maktab yoki shahar bo'yicha qidirish..." },
  "admin.edit_task": { ru: "Редактирование задачи", en: "Edit task", uz: "Topshiriqni tahrirlash" },
  "admin.manage_user": { ru: "Управление пользователем", en: "Manage user", uz: "Foydalanuvchini boshqarish" },
  "admin.send_message": { ru: "Отправить сообщение", en: "Send message", uz: "Xabar yuborish" },
  "admin.select_user": { ru: "Выберите пользователя для управления", en: "Select a user to manage", uz: "Boshqarish uchun foydalanuvchini tanlang" },
  "admin.save_changes": { ru: "Сохранить изменения", en: "Save changes", uz: "O'zgarishlarni saqlash" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "ru",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "ru";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
