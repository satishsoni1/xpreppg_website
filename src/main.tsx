import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import SchedulePage from "./pages/SchedulePage";
import PostExamPage from "./pages/PostExamPage";
import ContactPage from "./pages/ContactPage";
import StudentLogin from "./student/StudentLogin";
import StudentDashboard from "./student/StudentDashboard";
import StudentLayout from "./student/StudentLayout";
import StudentExamSelection from "./student/StudentExamSelection";
import VideoLibrary from "./student/VideoLibrary";
import VideoPlayer from "./student/VideoPlayer";
import StudentEnroll from "./student/StudentEnroll";
import StudentInvoice from "./student/StudentInvoice";
import StudentAdmitCard from "./student/StudentAdmitCard";
import StudentReportCard from "./student/StudentReportCard";
import StudentProfile from "./student/StudentProfile";
import AdminQuestions from "./admin/AdminQuestions";
import AdminLayout from "./admin/AdminLayout";
import AdminCenters from "./admin/AdminCenters";
import AdminEnrollments from "./admin/AdminEnrollments";
import StudentExamPortal from "./admin/StudentExamPortal";
import AdminStudents from "./admin/AdminStudents";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";
import AdminExams from "./admin/AdminExams";
import AdminPlans from "./admin/AdminPlans";
import AdminCoupons from "./admin/AdminCoupons";
import AdminReports from "./admin/AdminReports";
import AdminJsonUpload from "./admin/AdminJsonUpload";
import ReportCardDetail from "./student/ReportCardDetail";
import PendingAttemptsTable from "./admin/ResultGeneratorPage";
import StudentAttemptsList from "./admin/StudentAttemptsList";
import PrivacyPolicy from "./pages/PrivacyPage";


const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/schedule", element: <SchedulePage /> },
  { path: "/post-exam", element: <PostExamPage /> },
  { path: "/contact", element: <ContactPage /> },
  // 🔐 ADMIN LOGIN (NOT PROTECTED)
  // { path: "/admin/login", element: <AdminLogin /> },
  { path: "/student/login", element: <StudentLogin /> },
  { path: "/exam-portal/:examId", element: <StudentExamPortal /> },
  { path: "/admin/login", element: <AdminLogin /> },
  { path: "/privacy", element: <PrivacyPolicy /> },
  {
    path: "/student",
    element: <StudentLayout />, // Wraps all student pages with Sidebar
    children: [
      { path: "dashboard", element: <StudentDashboard /> },
      { path: "exams", element: <StudentExamSelection /> }, // For Payment & Selection
      { path: "videos", element: <VideoLibrary /> },      // 👈 NEW: List
      { path: "enroll", element: <StudentEnroll /> },
      { path: "videos/:id", element: <VideoPlayer /> },    // 👈 NEW: Player
      { path: "invoice/:invoiceId", element: <StudentInvoice /> },
      { path: "admit-card", element: <StudentAdmitCard /> },
      { path: "report-card", element: <StudentReportCard /> },
      { path: "profile", element: <StudentProfile /> },
      { path: "report-card/:examId", element: <ReportCardDetail /> },
    ]
  },
  // ADMIN ROUTES
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { path: "attempt", element: <StudentAttemptsList /> },
      { path: "result-generate", element: <PendingAttemptsTable /> },
      { path: "exams", element: <AdminExams /> },
      { path: "centers", element: <AdminCenters /> },
      { path: "questions", element: <AdminQuestions /> },
      { path: "plans", element: <AdminPlans /> },
      { path: "coupons", element: <AdminCoupons /> },
      { path: "enrollments", element: <AdminEnrollments /> },
      { path: "students", element: <AdminStudents /> },
      { path: "dashboard", element: <AdminDashboard /> },
      { path: "report", element: <AdminReports /> },
      { path: "upload-json", element: <AdminJsonUpload /> }, // ✅ Added Route
      
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
