import { useNavigate } from 'react-router-dom';
import { User, ChevronDown } from 'lucide-react';
import NotificationBell from './NotificationBell';

const SimpleHeader = () => {
  const navigate = useNavigate();
  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100 sticky top-0 z-50">
      <h1
        className="text-2xl font-bold text-indigo-600 tracking-tight cursor-pointer"
        onClick={() => navigate("/")}
      >
        BOOKHAVEN
      </h1>
      <div className="flex items-center gap-5">
        <NotificationBell />
        <button
          className="flex items-center gap-2 p-1 pr-3 hover:bg-gray-100 rounded-full transition-all border border-gray-100"
          onClick={() => navigate("/profile")}
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
            <User size={20} />
          </div>
          <span className="font-semibold text-sm text-gray-700">Toan</span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
      </div>
    </nav>
  );
};

export default SimpleHeader;
