import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { useNavigate } from 'react-router-dom';

// Icons (Inline for simplicity & performance)
const Icons = {
    Users: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Office: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
    Clock: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Alert: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Check: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    TrendingUp: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Briefcase: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
};

const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, trend }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            <div className={`p-3 rounded-xl ${colorClass}`}>
                <Icon />
            </div>
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
                <Icons.TrendingUp />
                <span className="ml-1">{trend}</span>
                <span className="text-gray-400 ml-1 font-normal">vs last month</span>
            </div>
        )}
    </div>
);

const SectionTitle = ({ title, action }) => (
    <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        {action}
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeBranches: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        todayAttendance: 0,
        pendingApprovals: 0,
        violationsThisMonth: 0,
        pendingCorrections: 0,
        onboardingPending: 0,
        invitedPending: 0
    });
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [overview, branchPerf] = await Promise.all([
                    adminService.getDashboardStats(),
                    adminService.getBranchPerformance()
                ]);

                setStats({
                    ...overview,
                    pendingApprovals: (overview.onboardingPending || 0) + (overview.pendingCorrections || 0) + (overview.invitedPending || 0)
                });
                setBranches(branchPerf || []);
            } catch (error) {
                console.error("Dashboard Load Failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">{getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
                    <p className="text-gray-500 mt-1">Here's what's happening in your organization today.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/admin/users')} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors text-sm shadow-xs">
                        Manage Users
                    </button>
                    {/* View Reports button removed as Reports page doesn't exist */}
                    {/* Replaced with direct violation link or payroll */}
                    <button onClick={() => navigate('/admin/violations')} className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors text-sm shadow-md shadow-indigo-200">
                        View Violations
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Icons.Users}
                    colorClass="bg-indigo-50 text-indigo-600"
                    subtext={`${stats.activeUsers} Active • ${stats.inactiveUsers} Inactive • ${stats.invitedPending} Invited`}
                />
                <MetricCard
                    title="Attendance Today"
                    value={stats.attendanceToday}
                    icon={Icons.Clock}
                    colorClass="bg-emerald-50 text-emerald-600"
                    subtext={`${Math.round((stats.attendanceToday / (stats.activeUsers || 1)) * 100)}% Participation`}
                />
                <MetricCard
                    title="Violations (Mo)"
                    value={stats.violationsThisMonth}
                    icon={Icons.Alert}
                    colorClass="bg-rose-50 text-rose-600"
                    trend={stats.violationsThisMonth > 0 ? "12%" : "0%"}
                />
                <MetricCard
                    title="Action Items"
                    value={stats.pendingApprovals}
                    icon={Icons.Check}
                    colorClass="bg-amber-50 text-amber-600"
                    subtext={`${stats.onboardingPending} Onboarding • ${stats.invitedPending} Invites • ${stats.pendingCorrections} Corrections`}
                />
            </div>

            {/* Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Branch Performance (2/3) */}
                <div className="lg:col-span-2 space-y-4">
                    <SectionTitle
                        title="Branch Performance"
                        action={<button onClick={() => navigate('/admin/branches')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View All</button>}
                    />
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Branch Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Violations</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">On Time</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Health</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {branches.length > 0 ? branches.map((branch, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 mr-3 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                        <Icons.Office />
                                                    </div>
                                                    <span className="font-semibold text-gray-700">{branch.branchName}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${branch.totalViolations > 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {branch.totalViolations}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-medium text-gray-600">{branch.presentCount}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end">
                                                    {branch.totalViolations > 10 ? (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critical
                                                        </span>
                                                    ) : branch.totalViolations > 5 ? (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div> Warning
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Good
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400 text-sm">No branch data available yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column (1/3) */}
                <div className="space-y-8">

                    {/* Quick Access */}
                    <div>
                        <SectionTitle title="Quick Access" />
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => navigate('/admin/users')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-indigo-100 transition-all text-left group">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-fit mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Icons.Users />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Add Employee</h4>
                            </button>
                            <button onClick={() => navigate('/admin/shifts')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-emerald-100 transition-all text-left group">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <Icons.Clock />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Manage Shifts</h4>
                            </button>
                            <button onClick={() => navigate('/admin/payroll')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-amber-100 transition-all text-left group">
                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg w-fit mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <Icons.Briefcase />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Run Payroll</h4>
                            </button>
                            <button onClick={() => navigate('/admin/violations')} className="p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md hover:border-rose-100 transition-all text-left group">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg w-fit mb-3 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                    <Icons.Alert />
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">Violations</h4>
                            </button>
                        </div>
                    </div>



                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
