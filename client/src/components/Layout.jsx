import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, MapPin, FileCheck, Users, Send,
  BarChart3, Settings, Menu, X, Receipt, BookOpen, Smartphone
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { path: '/', label: 'แดชบอร์ด', icon: LayoutDashboard },
  { path: '/trips', label: 'การเดินทาง', icon: MapPin },
  { path: '/checks', label: 'เช็ครับ', icon: FileCheck },
  { path: '/customers', label: 'ลูกค้า/สถานที่', icon: Users },
  { path: '/line', label: 'ส่ง LINE', icon: Send },
  { path: '/reports', label: 'รายงาน', icon: BarChart3 },
  { path: '/settings', label: 'ตั้งค่า', icon: Settings },
  { path: '/connect', label: 'เชื่อมต่อมือถือ', icon: Smartphone },
  { path: '/guide', label: 'คู่มือใช้งาน', icon: BookOpen },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Receipt className="w-6 h-6 text-primary-600" />
          <h1 className="font-bold text-lg text-primary-600">RebcheckM</h1>
        </div>
        <div className="w-9" />
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Receipt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">RebcheckM</h1>
                <p className="text-xs text-gray-500">ระบบจัดการเช็ครับ</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
