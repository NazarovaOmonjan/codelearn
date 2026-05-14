import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Trophy, Medal, Loader2 } from "lucide-react";
import { api } from "../api";
import { useLanguage } from "../i18n";

interface LeaderboardUser {
  rank: number;
  id: number;
  name: string;
  surname: string;
  city: string | null;
  school: string | null;
  level: number;
  points: number;
  totalSubmissions: number;
  isOnline: boolean;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await api.leaderboard.get();
      setUsers(res.data.leaderboard);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
  };

  const getLevelBadge = (level: number) => {
    const colors = {
      1: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
      2: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
      3: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    };
    return colors[level as keyof typeof colors] || colors[1];
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t("leaderboard.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Лучшие участники платформы CodeLearn
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t("leaderboard.rank")}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t("leaderboard.name")}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t("leaderboard.level")}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">{t("leaderboard.points")}</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Решений</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4">{getRankIcon(user.rank)}</td>
                  <td className="px-6 py-4">
                    <Link to={`/profile/${user.id}`} className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {user.name[0]}{user.surname[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.name} {user.surname}</div>
                        {user.city && <div className="text-xs text-gray-500 dark:text-gray-400">{user.city}</div>}
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadge(user.level)}`}>
                      {t("leaderboard.level")} {user.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{user.points}</td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{user.totalSubmissions}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 text-xs ${user.isOnline ? "text-green-600" : "text-gray-400"}`}>
                      <span className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-gray-400"}`} />
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="py-12 text-center text-gray-500 dark:text-gray-400">
            Пока нет участников в рейтинге
          </div>
        )}
      </div>
    </div>
  );
}
