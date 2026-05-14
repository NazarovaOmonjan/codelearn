import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Tasks } from "./pages/Tasks";
import { TaskDetail } from "./pages/TaskDetail";
import { Profile } from "./pages/Profile";
import { Leaderboard } from "./pages/Leaderboard";
import { Admin } from "./pages/Admin";
import { Olympiads } from "./pages/Olympiads";
import { Tests } from "./pages/Tests";
import { Courses } from "./pages/Courses";
import { Contacts } from "./pages/Contacts";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "tasks", Component: Tasks },
      { path: "tasks/:taskId", Component: TaskDetail },
      { path: "profile", Component: Profile },
      { path: "profile/:userId", Component: Profile },
      { path: "leaderboard", Component: Leaderboard },
      { path: "admin", Component: Admin },
      { path: "olympiads", Component: Olympiads },
      { path: "tests", Component: Tests },
      { path: "courses", Component: Courses },
      { path: "contacts", Component: Contacts },
      { path: "*", Component: NotFound },
    ],
  },
]);
