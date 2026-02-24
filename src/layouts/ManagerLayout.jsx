import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ManagerLayout = () => {
    const { logout } = useAuth();
    return (
        <div className="min-h-screen bg-green-50 flex">
            <aside className="w-64 bg-white border-r border-green-200 p-4">
                <h1 className="text-xl font-bold text-green-600 mb-6">Manager Portal</h1>
                <nav className="space-y-2">
                    <Link to="/manager/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-green-50 rounded">Dashboard</Link>
                    <Link to="/manager/team" className="block px-4 py-2 text-gray-700 hover:bg-green-50 rounded">My Team</Link>
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded mt-4">Logout</button>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default ManagerLayout;
