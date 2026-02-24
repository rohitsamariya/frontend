import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    CalendarCheck,
    AlertTriangle,
    User,
    Wallet,
    Building2,
    CalendarDays,
    PartyPopper,
    Menu,
    X,
    LogOut,
    ChevronRight
} from 'lucide-react';

const EmployeeLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/employee/dashboard', icon: LayoutDashboard },
        { name: 'My Attendance', href: '/employee/attendance', icon: CalendarCheck },
        { name: 'My Violations', href: '/employee/violations', icon: AlertTriangle },
        { name: 'Profile', href: '/employee/profile', icon: User },
        { name: 'Payroll', href: '/employee/payroll', icon: Wallet },
        { name: 'My Branch', href: '/employee/branch', icon: Building2 },
        { name: 'Working Days', href: '/employee/working-days', icon: CalendarDays },
        { name: 'Holidays', href: '/employee/holidays', icon: PartyPopper },
    ];

    const isActive = (path) => location.pathname.startsWith(path);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-gray-800/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0 flex flex-col`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <span className="text-white font-bold text-lg">E</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 tracking-tight">Portal<span className="text-blue-600">.</span></span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* User Profile Summary */}
                <div className="px-6 py-6 border-b border-gray-50 mb-2">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                            {user?.profileImage ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profileImage}`}
                                    alt={user?.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name?.charAt(0) || 'E'
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'Employee'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-2">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Employee Menu</p>
                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${active
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon
                                        size={20}
                                        className={`transition-colors ${active ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'
                                            }`}
                                    />
                                    <span>{item.name}</span>
                                </div>
                                {active && <ChevronRight size={16} className="text-blue-200" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors group"
                    >
                        <LogOut size={20} className="text-red-400 group-hover:text-red-600" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 h-16 flex items-center justify-between px-4 shadow-sm">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-800 text-lg">Employee Portal</span>
                    <div className="w-8"></div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
