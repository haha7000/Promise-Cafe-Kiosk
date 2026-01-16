import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Coffee,
  Folder,
  Settings as SettingsIcon,
  Users,
  DollarSign,
  BarChart3,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentAdmin?: { name: string; role: string };
  onLogout?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  currentAdmin = { name: '관리자', role: 'SUPER' },
  onLogout
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { icon: LayoutDashboard, label: '대시보드', path: '/admin' },
    { icon: ShoppingBag, label: '주문 관리', path: '/admin/orders' },
    { icon: Coffee, label: '메뉴 관리', path: '/admin/menus' },
    { icon: Folder, label: '카테고리', path: '/admin/categories' },
    { icon: Users, label: '셀 관리', path: '/admin/cells' },
    { icon: DollarSign, label: '정산 관리', path: '/admin/settlements' },
    { icon: BarChart3, label: '통계', path: '/admin/statistics' },
    { icon: SettingsIcon, label: '시스템 설정', path: '/admin/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`
        bg-[#1A1A1A] text-white transition-all duration-300 flex flex-col
        ${isSidebarOpen ? 'w-64' : 'w-20'}
      `}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2D2D2D]">
          {isSidebarOpen && (
            <h1 className="text-xl font-bold font-serif">P.M CAFE Admin</h1>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-[#2D2D2D] rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 transition-colors
                ${isActive(item.path)
                  ? 'bg-[#C41E3A] text-white'
                  : 'text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white'}
              `}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-[#2D2D2D]">
          {isSidebarOpen ? (
            <div className="mb-3">
              <p className="font-semibold">{currentAdmin.name}</p>
              <p className="text-xs text-[#6B6B6B]">
                {currentAdmin.role === 'SUPER' ? '슈퍼관리자' : '일반관리자'}
              </p>
            </div>
          ) : null}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[#B0B0B0] hover:bg-[#2D2D2D] hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span>로그아웃</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
