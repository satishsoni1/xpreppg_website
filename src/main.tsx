import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import Enroll from "./pages/Enroll";
import Invoice from "./pages/Invoice";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import FeaturesPage from "./pages/FeaturesPage";
import SchedulePage from "./pages/SchedulePage";
import PostExamPage from "./pages/PostExamPage";
import ContactPage from "./pages/ContactPage";
import AdminLogin from "./admin/Login";
import ProtectedRoute from "./admin/ProtectedRoute";
import AdminLayout from "./admin/Layout";
import AdminUsers from "./admin/UsersDashboard";
import AdminDashboard from "./admin/Dashboard";
import AdminCouponDashboard from "./admin/CouponDashboard";
import ManagePlans from "./admin/ManagePlans";
import CitiesAdmin from "./admin/Cities";
import AdminExams from "./admin/AdminExams";
import AdminCentres from "./admin/AdminCentres";
import AdminCandidates from "./admin/AdminCandidates";
import AdminOfflineRegistration from "./admin/AdminOfflineRegistration";
import AdmitCardPage from "./admin/AdmitCardPage";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/schedule", element: <SchedulePage /> },
  { path: "/post-exam", element: <PostExamPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/enroll", element: <Enroll /> },
  { path: "/invoice/:invoiceId", element: <Invoice /> },
  // 🔐 ADMIN LOGIN (NOT PROTECTED)
  { path: "/admin/login", element: <AdminLogin /> },

  // 🔐 PROTECTED ADMIN AREA
  {
    path: "/admin",
    element: <ProtectedRoute />,  // ← NOT a wrapper!
    children: [
      {
        path: "",
        element: <AdminLayout/>,  // main admin layout
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "coupons", element: <AdminCouponDashboard /> },
          
          { path: "plans", element: <ManagePlans />},
          { path: "cities", element: <CitiesAdmin />},
          { path: "exams", element: <AdminExams />},
          { path: "centre", element: <AdminCentres /> },
          { path: "online_registration", element: <AdminUsers /> },
          { path: "offline_registration", element: <AdminOfflineRegistration /> },
          { path: "candidates", element: <AdminCandidates /> },
          { path: "admit-card", element: <AdmitCardPage /> }

        ]
      }
    ]
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
