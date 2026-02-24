import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Topbar = ({ onMenuClick }) => {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-neutral-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="text-neutral-500 hover:text-neutral-700 focus:outline-none lg:hidden"
                >
                    <span className="sr-only">Open sidebar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-sm font-medium text-neutral-900">{user?.name}</span>
                    <span className="text-xs text-neutral-500">{user?.role}</span>
                </div>
                <button
                    onClick={logout}
                    className="p-2 rounded-full text-neutral-400 hover:text-danger-500 focus:outline-none transition-colors"
                    title="Logout"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
            </div>
        </header>
    );
};

export default Topbar;
