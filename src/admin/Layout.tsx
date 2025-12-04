import Navigation from "./Navigation";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="min-h-screen">
    {/* <Navigation/> */}
    <div className="flex">
      
      <Sidebar />

      <div className="flex-1 bg-gray-100 p-8">
        <Outlet />  {/* renders Dashboard, Coupons, Users */}
      </div>
    </div>
    </div>
  );
}
