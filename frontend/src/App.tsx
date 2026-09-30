import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

import { LoginPage } from "./pages/auth/LoginPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { StudentsPage } from "./pages/StudentsPage";
import { UsersPage } from "./pages/UsersPage";
import { TeachersPage } from "./pages/TeachersPage";
import { ClassesPage } from "./pages/ClassesPage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { AttendancePage } from "./pages/AttendancePage";
import { HistoryPage } from "./pages/HistoryPage";
import { JustificatifsPage } from "./pages/JustificatifsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { TeacherDashboardPage } from "./pages/teacher/TeacherDashboardPage";
import { StudentDashboardPage } from "./pages/student/StudentDashboardPage";
import { StudentHistoryPage } from "./pages/student/StudentHistoryPage";
import { StudentJustificatifsPage } from "./pages/student/StudentJustificatifsPage";

function HomeRouter() {
  const { user } = useAuth();
  if (user?.role === "ADMIN") return <DashboardPage />;
  if (user?.role === "ENSEIGNANT") return <TeacherDashboardPage />;
  return <StudentDashboardPage />;
}

function HistoryRouter() {
  const { user } = useAuth();
  if (user?.role === "ETUDIANT") return <StudentHistoryPage />;
  return <HistoryPage />;
}

function JustificatifsRouter() {
  const { user } = useAuth();
  if (user?.role === "ETUDIANT") return <StudentJustificatifsPage />;
  return <JustificatifsPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRouter />} />
          <Route path="/historique" element={<HistoryRouter />} />
          <Route path="/justificatifs" element={<JustificatifsRouter />} />
          <Route path="/parametres" element={<SettingsPage />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ENSEIGNANT"]} />}>
            <Route path="/presences" element={<AttendancePage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/utilisateurs" element={<UsersPage />} />
            <Route path="/etudiants" element={<StudentsPage />} />
            <Route path="/enseignants" element={<TeachersPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/matieres" element={<SubjectsPage />} />
            <Route path="/rapports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
