import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, logout, toggleSidebar } from "../../store";

const navItems = [
  { path: "/", label: "Dashboard", icon: "📊" },
  { path: "/products", label: "Products", icon: "📦" },
  { path: "/orders", label: "Orders", icon: "🛒" },
  { path: "/vendors", label: "Vendors", icon: "🏭" },
  { path: "/analytics", label: "Analytics", icon: "📈" },
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 h-full bg-slate-800 text-white
        transition-all duration-300 z-50 flex flex-col
        ${sidebarOpen ? "w-64" : "w-16"}
      `}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-700">
        <span className="text-2xl">🏪</span>
        {sidebarOpen && (
          <span className="font-bold text-lg whitespace-nowrap">Wholesale</span>
        )}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="ml-auto text-slate-400 hover:text-white text-xl"
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
              transition-colors duration-150 mb-1
              ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            {sidebarOpen && (
              <span className="whitespace-nowrap font-medium">
                {item.label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      <div className="border-t border-slate-700 p-4">
        {sidebarOpen && user && (
          <div className="mb-3">
            <p className="text-sm font-medium text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <span
              className="inline-block mt-1 px-2 py-0.5 bg-blue-600
                             text-xs rounded-full capitalize"
            >
              {user.role}
            </span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-slate-400
                     hover:text-red-400 transition-colors w-full"
        >
          <span className="text-xl">🚪</span>
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
