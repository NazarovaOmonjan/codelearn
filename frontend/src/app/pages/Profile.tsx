import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { User, MapPin, School, Calendar, Trophy, Target, Loader2, Edit, X, Save } from "lucide-react";
import { api } from "../api";
import { useAuth } from "../auth";
import { useLanguage } from "../i18n";

export function Profile() {
  const { userId } = useParams();
  const { user: authUser, isLoggedIn, updateUser } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", surname: "", email: "", city: "", school: "", grade: "", telegram: "", phone: "", password: "" });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = !userId || (authUser && parseInt(userId) === authUser.id);

  useEffect(() => { loadProfile(); }, [userId, authUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      if (isOwnProfile && isLoggedIn) {
        const res = await api.profile.get();
        setProfile(res.data);
        setEditForm({ name: res.data.name || "", surname: res.data.surname || "", email: res.data.email || "", city: res.data.city || "", school: res.data.school || "", grade: res.data.grade || "", telegram: res.data.telegram || "", phone: res.data.phone || "", password: "" });
      } else if (userId) {
        const res = await api.profile.getPublic(parseInt(userId));
        setProfile(res.data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: any = {};
      if (editForm.name) data.name = editForm.name;
      if (editForm.surname) data.surname = editForm.surname;
      if (editForm.email) data.email = editForm.email;
      if (editForm.city) data.city = editForm.city;
      if (editForm.school) data.school = editForm.school;
      if (editForm.grade) data.grade = editForm.grade;
      if (editForm.telegram) data.telegram = editForm.telegram;
      if (editForm.phone) data.phone = editForm.phone;
      if (editForm.password) data.password = editForm.password;

      const res = await api.profile.update(data);
      updateUser(res.data);
      setEditing(false);
      loadProfile();
    } catch (err: any) { alert("Ошибка: " + err.message); }
    finally { setSaving(false); }
  };

  if (!isLoggedIn && !userId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("profile.title")}</h2>
        <p className="text-gray-600 dark:text-gray-400">{t("profile.login_required")}</p>
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  if (!profile) return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><p className="text-gray-500">Профиль не найден</p></div>;

  const getLevelColor = (level: number) => {
    if (level === 1) return "from-green-400 to-green-600";
    if (level === 2) return "from-blue-400 to-blue-600";
    return "from-purple-400 to-purple-600";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center mb-6">
              <div className={`w-24 h-24 mx-auto rounded-full bg-gradient-to-br ${getLevelColor(profile.level)} flex items-center justify-center text-white text-3xl font-bold mb-4`}>
                {profile.name?.[0]}{profile.surname?.[0]}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name} {profile.surname}</h2>
              {profile.email && <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm"><Trophy className="w-4 h-4 text-yellow-500" /><span className="text-gray-600 dark:text-gray-400">{t("profile.level")}:</span><span className="font-bold text-gray-900 dark:text-white">{profile.level}</span></div>
              <div className="flex items-center gap-3 text-sm"><Target className="w-4 h-4 text-blue-500" /><span className="text-gray-600 dark:text-gray-400">{t("profile.points")}:</span><span className="font-bold text-gray-900 dark:text-white">{profile.points}</span></div>
              {profile.city && <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-red-500" /><span className="text-gray-600 dark:text-gray-400">{t("profile.city")}:</span><span className="text-gray-900 dark:text-white">{profile.city}</span></div>}
              {profile.school && <div className="flex items-center gap-3 text-sm"><School className="w-4 h-4 text-green-500" /><span className="text-gray-600 dark:text-gray-400">{t("profile.school")}:</span><span className="text-gray-900 dark:text-white">{profile.school}{profile.grade ? `, ${profile.grade} класс` : ""}</span></div>}
              {profile.createdAt && <div className="flex items-center gap-3 text-sm"><Calendar className="w-4 h-4 text-purple-500" /><span className="text-gray-600 dark:text-gray-400">{t("profile.registered")}:</span><span className="text-gray-900 dark:text-white">{new Date(profile.createdAt).toLocaleDateString()}</span></div>}
            </div>

            {/* Edit button */}
            {isOwnProfile && !editing && (
              <button onClick={() => setEditing(true)} className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="w-4 h-4" />Редактировать профиль
              </button>
            )}
          </div>

          {/* Edit form */}
          {editing && (
            <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Редактирование</h3>
                <button onClick={() => setEditing(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Имя" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  <input type="text" placeholder="Фамилия" value={editForm.surname} onChange={(e) => setEditForm({...editForm, surname: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <input type="text" placeholder="Логин/Email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                <input type="password" placeholder="Новый пароль (оставьте пустым если не менять)" value={editForm.password} onChange={(e) => setEditForm({...editForm, password: e.target.value})} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Город" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  <input type="text" placeholder="Школа" value={editForm.school} onChange={(e) => setEditForm({...editForm, school: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="Класс" value={editForm.grade} onChange={(e) => setEditForm({...editForm, grade: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  <input type="text" placeholder="Telegram" value={editForm.telegram} onChange={(e) => setEditForm({...editForm, telegram: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                  <input type="text" placeholder="Телефон" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm" />
                </div>
                <button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                  <Save className="w-4 h-4" />{saving ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-6">
          {profile.stats && (
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.stats.solvedTasks}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("profile.solved")}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{profile.stats.correct}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Правильных</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{profile.stats.incorrect}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Неправильных</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{profile.points}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{t("profile.points")}</div>
              </div>
            </div>
          )}

          {/* Level progress */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white">{t("profile.progress")}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">{t("profile.level")} {profile.level}</span>
                <span className="text-gray-600 dark:text-gray-400">{profile.level < 3 ? `${t("profile.level")} ${profile.level + 1}` : "Max"}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div className={`h-3 rounded-full bg-gradient-to-r ${getLevelColor(profile.level)} transition-all`}
                  style={{ width: `${profile.level >= 3 ? 100 : profile.level === 2 ? Math.min(100, ((profile.points - 2000) / 3000) * 100) : Math.min(100, (profile.points / 2000) * 100)}%` }} />
              </div>
              <div className="text-xs text-gray-500">
                {profile.level === 1 && `${profile.points} / 2000 баллов до уровня 2`}
                {profile.level === 2 && `${profile.points} / 5000 баллов до уровня 3`}
                {profile.level === 3 && t("profile.max_level")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
