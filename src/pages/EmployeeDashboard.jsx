import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import employeeService from "../services/employeeService";
import { getMediaUrl } from "../utils/url";
import MetricCard from "../components/UI/MetricCard";
import StatusBadge from "../components/UI/StatusBadge";
import Loader from "../components/UI/Loader";
import { DateTime } from 'luxon';

const Icons = {
    Clock: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Calendar: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    CheckCircle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    AlertTriangle: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Download: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    UserEdit: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
    MapPin: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Briefcase: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
};

const SectionTitle = ({ title, action }) => (
    <div className="flex justify-between items-end mb-4">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        {action}
    </div>
);

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Combined Data State
    const [profile, setProfile] = useState(null);
    const [summary, setSummary] = useState(null);
    const [liveStatus, setLiveStatus] = useState(null);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [todayDetailed, setTodayDetailed] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all data concurrently
                const [profileData, summaryData, liveData, todayData, attendanceData] = await Promise.all([
                    employeeService.getProfile(),
                    employeeService.getMonthlySummary(),
                    employeeService.getLiveStatus(),
                    employeeService.getTodayDashboard(),
                    employeeService.getAttendanceHistory(1, 5) // Last 5 days
                ]);

                const safeProfile = profileData.profile || profileData;
                setProfile({
                    ...safeProfile,
                    branchName: safeProfile.branch?.name || 'Unassigned',
                    shiftFormat: safeProfile.shift ? `${safeProfile.shift.name} (${safeProfile.shift.startTime} - ${safeProfile.shift.endTime})` : 'Unassigned',
                });
                setSummary(summaryData);
                setLiveStatus(liveData);
                setTodayDetailed(todayData);
                setRecentAttendance(attendanceData.data || []);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
                setError(err.response?.data?.error || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    // Added generic handler to refresh dashboard without full mounting loading spinner
    const refreshDashboard = async () => {
        try {
            const [profileData, summaryData, liveData, todayData, attendanceData] = await Promise.all([
                employeeService.getProfile(),
                employeeService.getMonthlySummary(),
                employeeService.getLiveStatus(),
                employeeService.getTodayDashboard(),
                employeeService.getAttendanceHistory(1, 5)
            ]);
            const safeProfile = profileData.profile || profileData;
            setProfile({
                ...safeProfile,
                branchName: safeProfile.branch?.name || 'Unassigned',
                shiftFormat: safeProfile.shift ? `${safeProfile.shift.name} (${safeProfile.shift.startTime} - ${safeProfile.shift.endTime})` : 'Unassigned',
            });
            setSummary(summaryData);
            setLiveStatus(liveData);
            setTodayDetailed(todayData);
            setRecentAttendance(attendanceData.data || []);
        } catch (err) {
            console.error("Dashboard Refresh Error:", err);
        }
    };

    const handleCheckInOut = async (type) => {
        setActionLoading(true);
        setActionMessage(null);

        try {
            // Get Geolocation
            if (!navigator.geolocation) {
                throw new Error("Geolocation is not supported by your browser");
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const locationData = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            // Call respective API
            if (type === 'check-in') {
                await employeeService.checkIn(locationData);
                setActionMessage({ type: 'success', text: 'Checked in successfully!' });
            } else if (type === 'check-out') {
                await employeeService.checkOut(locationData);
                setActionMessage({ type: 'success', text: 'Checked out successfully!' });
            }

            // Immediately refresh data
            await refreshDashboard();

        } catch (error) {
            console.error("Check-in/out error:", error);
            const errorMsg = error.response?.data?.error || error.message || "Action failed";
            if (error.code === 1) { // Geolocation Permission Denied
                setActionMessage({ type: 'error', text: 'Location access denied. Please enable location services.' });
            } else {
                setActionMessage({ type: 'error', text: errorMsg });
            }
        } finally {
            setActionLoading(false);
            // Auto hide message after 5 seconds
            setTimeout(() => setActionMessage(null), 5000);
        }
    };

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

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-red-500 font-bold mb-2">Error Loading Dashboard</p>
                <p className="text-gray-500">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Retry</button>
            </div>
        </div>
    );

    // Format Dates properly based on timezone (if available) or locale fallback
    const formatTime = (timeString) => {
        if (!timeString) return '--:--';
        return DateTime.fromISO(timeString).toFormat('hh:mm a');
    };

    const formatDate = (dateString, format = 'MMM dd, yyyy') => {
        if (!dateString) return '-';
        return DateTime.fromISO(dateString).toFormat(format);
    };

    const statusVariant = (liveStatus?.currentState === 'WORKING') ? 'success' : (liveStatus?.currentState === 'COMPLETED' ? 'info' : 'neutral');

    let currentStatusDisplay = 'Not Started';
    if (liveStatus?.currentState === 'WORKING') currentStatusDisplay = 'Working';
    else if (liveStatus?.currentState === 'COMPLETED') currentStatusDisplay = 'Completed';
    else if (liveStatus?.currentState === 'NOT_STARTED') currentStatusDisplay = 'Off Duty';

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">

            {/* 1️⃣ Welcome Section (Hero Card) */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 transform translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm shrink-0 border-4 border-white overflow-hidden">
                            {profile.profileImage ? (
                                <img src={getMediaUrl(profile.profileImage)} alt={profile.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-black">{profile.name.charAt(0)}</span>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black text-gray-900">{getGreeting()}, {profile.name.split(' ')[0]} 👋</h1>
                                <StatusBadge status={profile.status} />
                            </div>
                            <p className="text-gray-500 font-medium">{profile.email}</p>

                            <div className="mt-4 flex flex-wrap gap-4 text-sm font-medium text-gray-600">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Icons.Briefcase /> {profile.role}
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Icons.MapPin /> {profile.branchName}
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <Icons.Clock /> <span className="w-4 h-4" /> {profile.shiftFormat}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:items-end w-full md:w-auto mt-4 md:mt-0">
                        {/* Action Message Alert */}
                        {actionMessage && (
                            <div className={`mb-3 px-4 py-2 rounded-lg text-sm font-bold w-full sm:w-auto ${actionMessage.type === 'success' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'} animate-fade-in`}>
                                {actionMessage.text}
                            </div>
                        )}

                        {/* If Working -> Check Out, If Not Started -> Check In */}
                        {liveStatus?.currentState === 'WORKING' ? (
                            <button
                                onClick={() => handleCheckInOut('check-out')}
                                disabled={actionLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-red-600 justify-center text-white font-bold rounded-xl hover:bg-red-700 focus:ring-4 focus:ring-red-100 transition-all shadow-md shadow-red-200 flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Check Out Now'
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={() => handleCheckInOut('check-in')}
                                disabled={actionLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 justify-center text-white font-bold rounded-xl hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 transition-all shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Icons.CheckCircle />
                                        Web Check-In
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 2️⃣ Attendance Summary Cards */}
            <div>
                <SectionTitle title={`${DateTime.now().toFormat('MMMM yyyy')} Overview`} />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Present Days"
                        value={summary?.presentDays || 0}
                        icon={Icons.CheckCircle}
                        colorClass="bg-emerald-50 text-emerald-600"
                        subtext={`Out of ${summary?.totalDays || 0} scheduled`}
                    />
                    <MetricCard
                        title="Absent"
                        value={summary?.absentDays || 0}
                        icon={Icons.AlertTriangle}
                        colorClass="bg-rose-50 text-rose-600"
                    />
                    <MetricCard
                        title="Total Violations"
                        value={summary?.totalViolations || 0}
                        icon={Icons.Clock}
                        colorClass="bg-orange-50 text-orange-600"
                        subtext={`Warning: Half Day at ${summary?.nextPenaltyAt || 3}`}
                    />
                    <MetricCard
                        title="Half Days / Early"
                        value={summary?.halfDays || 0}
                        icon={Icons.Calendar}
                        colorClass="bg-blue-50 text-blue-600"
                    />
                </div>
            </div>

            {/* Split Section: Today & Quick Actions + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (1/3) */}
                <div className="flex flex-col">

                    {/* 3️⃣ Today's Status Section */}
                    <div className="flex flex-col flex-1">
                        <SectionTitle title="Today's Status" />
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-1">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Current Shift</span>
                                <StatusBadge status={currentStatusDisplay} variant={statusVariant} />
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">First Punch In</p>
                                        <p className="text-lg font-bold text-gray-900">{formatTime(todayDetailed?.checkInTime)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-400">Last Check Out</p>
                                        <p className="text-lg font-bold text-gray-400">{formatTime(todayDetailed?.checkOutTime)}</p>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-gray-100 mt-2">
                                    <p className="text-sm text-gray-500">Worked today: <strong className="text-gray-800">{liveStatus?.minutesWorkedToday || 0} mins</strong> ({Math.floor((liveStatus?.minutesWorkedToday || 0) / 60)}h {(liveStatus?.minutesWorkedToday || 0) % 60}m)</p>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Right Column (2/3) - Recent Attendance */}
                <div className="lg:col-span-2 flex flex-col">
                    <SectionTitle
                        title="Recent Activity"
                        action={<button onClick={() => navigate('/employee/attendance')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View Full History</button>}
                    />
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Check In</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Hours</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {recentAttendance.length > 0 ? recentAttendance.map((row, idx) => {
                                        // Get First Punch
                                        const firstPunch = row.punches && row.punches.length > 0 ? row.punches[0].checkIn : null;

                                        // Format Work Hours
                                        const hrs = Math.floor(row.totalWorkingMinutes / 60);
                                        const mins = row.totalWorkingMinutes % 60;

                                        return (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-gray-700">{formatDate(row.date)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={row.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-600">{formatTime(firstPunch)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm font-medium text-gray-600">{hrs}h {mins}m</span>
                                                </td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-gray-400 text-sm">No recent attendance found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default EmployeeDashboard;
