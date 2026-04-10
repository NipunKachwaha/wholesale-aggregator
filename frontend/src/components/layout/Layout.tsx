import { useSelector } from "react-redux";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { RootState } from "../../store";

// Route ke hisaab se title
const PAGE_TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/products": "Products",
  "/orders": "Orders",
  "/vendors": "Vendors",
  "/analytics": "Analytics",
};

export default function Layout() {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || "Wholesale";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`
          transition-all duration-300 min-h-screen
          ${sidebarOpen ? "ml-64" : "ml-16"}
        `}
      >
        {/* Header */}
        <Header title={title} />

        {/* Page Content */}
        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
