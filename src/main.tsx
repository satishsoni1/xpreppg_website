import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import "./index.css";
import Enroll from "./pages/Enroll";
import Invoice from "./pages/Invoice";

const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/enroll", element: <Enroll /> },
  { path: "/invoice/:invoiceId", element: <Invoice /> },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
