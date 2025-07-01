
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3 } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: '홈' },
    { path: '/record', icon: PlusCircle, label: '기록' },
    { path: '/statistics', icon: BarChart3, label: '통계' },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'text-blue-600 bg-blue-50 scale-105' 
                  : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50'
              }`}
            >
              <Icon size={24} className={`${isActive ? 'text-blue-600' : ''}`} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
