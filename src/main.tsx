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
import AdminPosters from "./admin/AdminPosters";
import AdminPosterPackages from "./admin/AdminPosterPackages";
import AdminXreviseStudents from "./admin/AdminXreviseStudents";
import AdminCbtStudents from "./admin/AdminCbtStudents";
import AdminXreviseSchedule from "./admin/AdminXreviseSchedule";
import AdminPosterPromos from "./admin/AdminPosterPromos";
import AdminPosterOrders from "./admin/AdminPosterOrders";
import AdminWhatsAppScheduler from "./admin/AdminWhatsAppScheduler";
import AdminXreviseQuestions from "./admin/AdminXreviseQuestions";
import AdminMediaUpload from "./admin/AdminMediaUpload";
import ShopPage from "./pages/ShopPage";
import ReportCardDetail from "./student/ReportCardDetail";
import PendingAttemptsTable from "./admin/ResultGeneratorPage";
import StudentAttemptsList from "./admin/StudentAttemptsList";
import PrivacyPolicy from "./pages/PrivacyPage";
import CbtPage from "./pages/CbtPage";
import CbtRegisterPage from "./pages/CbtRegisterPage";
import XreviseRegisterPage from "./pages/XreviseRegisterPage";
import DailyTests from "./student/DailyTests";
import XReviseResultPage from "./student/XReviseResultPage";
import XReviseAttempts from "./student/XReviseAttempts";
import AdminExamManager from "./admin/AdminExamManager";
import AdminExamEnrollments from "./admin/AdminExamEnrollments";
import AdminExamAnalytics from "./admin/AdminExamAnalytics";
import AdminExamSimulator from "./admin/AdminExamSimulator";
import XRevisePortal from "./student/XRevisePortal";
import XReviseExamInterface from "./student/XReviseExamInterface";
import XReviseResultAnalysis from "./student/XReviseResultAnalysis";
import StudentXReviseExam from "./student/StudentXReviseExam";
import StudentXReviseResult from "./student/StudentXReviseResult";
import XReviseEnroll from "./student/XReviseEnroll";
import AdminXrevisePlans from "./admin/AdminXrevisePlans";
import AdminXreviseCoupons from "./admin/AdminXreviseCoupons";
import AdminXreviseOrders from "./admin/AdminXreviseOrders";
import AdminXrevisePhases from "./admin/AdminXrevisePhases";
import AdminXreviseExams from "./admin/AdminXreviseExams";
import AdminXreviseEnrollments from "./admin/AdminXreviseEnrollments";
import AdminCBTExams from "./admin/AdminCBTExams";
import AdminCBTQuestions from "./admin/AdminCBTQuestions";
import AdminCBTResults from "./admin/AdminCBTResults";
import AdminCBTResultAnalysis from "./admin/AdminCBTResultAnalysis";
import StudentCBTExams from "./student/StudentCBTExams";
import StudentCBTExam from "./student/StudentCBTExam";
import StudentCBTResult from "./student/StudentCBTResult";


const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/shop", element: <ShopPage /> },
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
  { path: "/cbt", element: <CbtPage /> },
  { path: "/cbt-register", element: <CbtRegisterPage /> },
  { path: "/xrevise-register", element: <XreviseRegisterPage /> },
  { path: "/xrevise", element: <XRevisePortal /> },
  { path: "/xrevise/exam/:examId", element: <XReviseExamInterface /> },
  { path: "/xrevise/result/:attemptId", element: <XReviseResultAnalysis /> },
  // Student portal XRevise exam flow (uses student_token)
  { path: "/student/xrevise/exam/:examId", element: <StudentXReviseExam /> },
  { path: "/student/xrevise/result/:attemptId", element: <StudentXReviseResult /> },
  { path: "/student/cbt-exam/:examId/:attemptId", element: <StudentCBTExam /> },
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
      { path: "daily-tests", element: <DailyTests /> },
      { path: "xrevise-result", element: <XReviseResultPage /> },
      { path: "xrevise-attempts", element: <XReviseAttempts /> },
      { path: "xrevise-enroll", element: <XReviseEnroll /> },
      { path: "cbt-exams", element: <StudentCBTExams /> },
      { path: "cbt-result/:examId", element: <StudentCBTResult /> },
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
      { path: "upload-json", element: <AdminJsonUpload /> },
      { path: "posters", element: <AdminPosters /> },
      { path: "poster-packages", element: <AdminPosterPackages /> },
      { path: "poster-promos", element: <AdminPosterPromos /> },
      { path: "poster-orders", element: <AdminPosterOrders /> },
      { path: "whatsapp-scheduler", element: <AdminWhatsAppScheduler /> },
      { path: "xrevise/students", element: <AdminXreviseStudents /> },
      { path: "xrevise/enrollments", element: <AdminXreviseEnrollments /> },
      { path: "xrevise/exams", element: <AdminXreviseExams /> },
      { path: "xrevise/schedule", element: <AdminXreviseSchedule /> },
      { path: "xrevise/questions", element: <AdminXreviseQuestions /> },
      { path: "xrevise/plans", element: <AdminXrevisePlans /> },
      { path: "xrevise/coupons", element: <AdminXreviseCoupons /> },
      { path: "xrevise/orders", element: <AdminXreviseOrders /> },
      { path: "xrevise/phases", element: <AdminXrevisePhases /> },
      { path: "cbt/students", element: <AdminCbtStudents /> },
      { path: "cbt/exams", element: <AdminCBTExams /> },
      { path: "cbt/questions/:examId", element: <AdminCBTQuestions /> },
      { path: "cbt/results/:examId", element: <AdminCBTResults /> },
      { path: "cbt/results/:examId/student/:studentId", element: <AdminCBTResultAnalysis /> },
      { path: "media", element: <AdminMediaUpload /> },
      // Exam Management Module
      { path: "em/exams", element: <AdminExamManager platform="cbt" /> },
      { path: "em/xrevise-exams", element: <AdminExamManager platform="xrevise" /> },
      { path: "em/enrollments", element: <AdminExamEnrollments /> },
      { path: "em/analytics", element: <AdminExamAnalytics /> },
      { path: "em/simulator", element: <AdminExamSimulator /> },
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
