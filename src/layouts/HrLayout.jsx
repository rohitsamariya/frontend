import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HrLayout = () => {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-orange-50 flex">
            <aside className="w-64 bg-white border-r border-orange-200 p-4">
                <h1 className="text-xl font-bold text-orange-600 mb-6">HR Portal</h1>
                <nav className="space-y-2">
                    <Link to="/hr/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded">Dashboard</Link>
                    <Link to="/hr/employees" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 rounded">Employees</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded mt-4">Logout</button>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default HrLayout;
