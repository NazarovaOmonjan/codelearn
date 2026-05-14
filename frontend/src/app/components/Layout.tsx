import { Outlet, Link, useLocation } from "react-router";
import { useTheme } from "next-themes";
import { Moon, Sun, User, LogIn, LogOut, Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import { useLanguage, type Language } from "../i18n";
import { useAuth } from "../auth";
import { AuthModal } from "./AuthModal";

export function Layout() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/tasks", label: t("nav.tasks") },
    ...(!isAdmin ? [{ path: "/profile", label: t("nav.profile") }] : []),
    { path: "/leaderboard", label: t("nav.leaderboard") },
    { path: "/olympiads", label: t("nav.olympiads") },
    { path: "/tests", label: t("nav.tests") },
    { path: "/courses", label: t("nav.courses") },
    { path: "/contacts", label: t("nav.contacts") },
    ...(isAdmin ? [{ path: "/admin", label: t("nav.admin") }] : []),
  ];

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "ru", label: "Русский", flag: "🇷🇺" },
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "uz", label: "O'zbek", flag: "🇺🇿" },
  ];

  const currentLang = languages.find((l) => l.code === language)!;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="font-bold text-xl text-blue-600 dark:text-blue-400">
                CodeLearn
              </Link>
              <div className="hidden lg:flex gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-md text-sm transition-colors ${
                      location.pathname === link.path
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language switcher */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                  <span className="hidden sm:inline text-gray-700 dark:text-gray-300">{currentLang.flag}</span>
                </button>
                {langMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px]">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setLangMenuOpen(false); }}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                          language === lang.code
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        } first:rounded-t-lg last:rounded-b-lg`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>

              {/* Auth */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={isAdmin ? "/admin" : "/profile"}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                  >
                    <User className="w-4 h-4" />
                    {user?.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Выйти"
                  >
                    <LogOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  {t("nav.login")}
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 border-t border-gray-200 dark:border-gray-700 pt-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    location.pathname === link.path
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <main className="min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  );
}
