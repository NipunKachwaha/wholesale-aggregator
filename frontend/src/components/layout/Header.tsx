import type { RootState } from "../../store";
import { useSelector } from "react-redux";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center px-6 z-40 transition-all duration-300 ${sidebarOpen ? "left-64" : "left-16"}`}
    >
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <button className="relative text-slate-500 hover:text-slate-800">
          <span className="text-xl">🔔</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>
        <button className="text-slate-500 hover:text-slate-800 text-xl">
          ⚙️
        </button>
      </div>
    </header>
  );
}
