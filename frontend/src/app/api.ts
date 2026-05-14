// @ts-ignore
const API_BASE: string = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

// Auth
export const api = {
  auth: {
    login: (email: string, password: string) =>
      request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

    register: (data: { name: string; surname: string; email: string; password: string; city?: string; school?: string; grade?: string; language?: string }) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    forgotPassword: (email: string) =>
      request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

    resetPassword: (email: string, code: string, newPassword: string) =>
      request("/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code, newPassword }) }),
  },

  tasks: {
    list: (params?: { category?: string; language?: string; difficulty?: string; sort?: string; page?: number }) => {
      const query = new URLSearchParams();
      if (params?.category) query.set("category", params.category);
      if (params?.language) query.set("language", params.language);
      if (params?.difficulty) query.set("difficulty", params.difficulty);
      if (params?.sort) query.set("sort", params.sort);
      if (params?.page) query.set("page", params.page.toString());
      return request(`/tasks?${query.toString()}`);
    },

    get: (id: number) => request(`/tasks/${id}`),

    create: (data: any) => request("/tasks", { method: "POST", body: JSON.stringify(data) }),

    update: (id: number, data: any) => request(`/tasks/${id}`, { method: "PUT", body: JSON.stringify(data) }),

    delete: (id: number) => request(`/tasks/${id}`, { method: "DELETE" }),
  },

  submissions: {
    submit: (taskId: number, language: string, code: string) =>
      request("/submissions", { method: "POST", body: JSON.stringify({ taskId, language, code }) }),

    list: (params?: { taskId?: number; page?: number }) => {
      const query = new URLSearchParams();
      if (params?.taskId) query.set("taskId", params.taskId.toString());
      if (params?.page) query.set("page", params.page.toString());
      return request(`/submissions?${query.toString()}`);
    },
  },

  users: {
    list: (params?: { search?: string; page?: number }) => {
      const query = new URLSearchParams();
      if (params?.search) query.set("search", params.search);
      if (params?.page) query.set("page", params.page.toString());
      return request(`/users?${query.toString()}`);
    },

    get: (id: number) => request(`/users/${id}`),

    update: (id: number, data: any) => request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

    delete: (id: number) => request(`/users/${id}`, { method: "DELETE" }),
  },

  leaderboard: {
    get: (page?: number) => request(`/leaderboard?page=${page || 1}`),
  },

  profile: {
    get: () => request("/profile"),
    update: (data: any) => request("/profile", { method: "PUT", body: JSON.stringify(data) }),
    getPublic: (userId: number) => request(`/profile/${userId}`),
  },

  admin: {
    logs: (page?: number) => request(`/admin/logs?page=${page || 1}`),
    stats: () => request("/admin/stats"),
    sendMessage: (userId: number, message: string) =>
      request("/admin/message", { method: "POST", body: JSON.stringify({ userId, message }) }),
    submissions: (taskId: number) => request(`/admin/submissions/${taskId}`),
  },

  health: () => request("/health"),

  upload: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
  },
};
