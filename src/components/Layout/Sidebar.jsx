import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, Zap, AlertTriangle, Briefcase } from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const role = user?.role;

    const links = [
        { to: '/employee', label: 'Dashboard', icon: <Home size={18} />, roles: ['EMPLOYEE'] },
        { to: '/hr', label: 'HR Dashboard', icon: <Users size={18} />, roles: ['HR', 'ADMIN'] },
        { to: '/admin', label: 'Admin Panel', icon: <Zap size={18} />, roles: ['ADMIN'] },
        { to: '/admin/violations', label: 'Violations', icon: <AlertTriangle size={18} />, roles: ['ADMIN', 'HR'] },
        { to: '/manager', label: 'Manager View', icon: <Briefcase size={18} />, roles: ['MANAGER', 'ADMIN'] },
    ];

    // Filter links based on role
    const filteredLinks = links.filter(link => link.roles.includes(role));

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-neutral-800 bg-opacity-75 z-20 lg:hidden transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-center h-16 border-b border-neutral-200">
                    <span className="text-2xl font-bold text-primary-600">HRMS</span>
                </div>

                <nav className="mt-5 px-4 space-y-1">
                    {filteredLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary-50 text-primary-600' : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'}`}
                            end
                        >
                            <span className="mr-3 text-lg flex items-center">{link.icon}</span>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
