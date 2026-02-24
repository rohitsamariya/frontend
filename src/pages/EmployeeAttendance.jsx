import React, { useEffect, useState } from "react";
import employeeService from "../services/employeeService";
import StatusBadge from "../components/UI/StatusBadge";
import PageHeader from "../components/UI/PageHeader";
import { DateTime } from 'luxon';

const Icons = {
    ChevronLeft: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>,
    ChevronRight: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
    Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const EmployeeAttendance = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [total, setTotal] = useState(0);

    const now = DateTime.now();
    const [selectedMonth, setSelectedMonth] = useState(now.month);
    const [selectedYear, setSelectedYear] = useState(now.year);

    const fetchHistory = async (currentPage, month, year) => {
        try {
            setLoading(true);
            const data = await employeeService.getAttendanceHistory(currentPage, limit, month, year);
            setHistory(data.data || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error("Failed to load attendance", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(page, selectedMonth, selectedYear);
    }, [page, selectedMonth, selectedYear]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'month') setSelectedMonth(parseInt(value));
        if (name === 'year') setSelectedYear(parseInt(value));
        setPage(1); // Reset to page 1 on filter
    };

    const totalPages = Math.ceil(total / limit);

    const formatTime = (timeString) => {
        if (!timeString) return '--:--';
        return DateTime.fromISO(timeString).toFormat('hh:mm a');
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return DateTime.fromISO(dateString).toFormat('EEEE, MMM dd, yyyy');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Attendance Directory</h1>
                    <p className="text-gray-500 mt-1 font-medium">Review your historical attendance logs and work hours.</p>
                </div>
                <div className="flex items-center gap-4">
                    {/* Filters */}
                    <div className="flex gap-2">
                        <select
                            name="month"
                            value={selectedMonth}
                            onChange={handleFilterChange}
                            className="bg-white border text-sm font-semibold text-gray-700 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm hover:border-gray-300"
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {DateTime.fromObject({ month: i + 1 }).toFormat('MMMM')}
                                </option>
                            ))}
                        </select>
                        <select
                            name="year"
                            value={selectedYear}
                            onChange={handleFilterChange}
                            className="bg-white border text-sm font-semibold text-gray-700 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer shadow-sm hover:border-gray-300"
                        >
                            {[...Array(5)].map((_, i) => {
                                const y = now.year - i;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                    </div>

                    <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Icons.Calendar />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Records</p>
                            <p className="text-lg font-black text-gray-800 leading-none">{total}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">First Punch In</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Last Punch Out</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                                            Loading history...
                                        </div>
                                    </td>
                                </tr>
                            ) : history.length > 0 ? (
                                history.map((row, idx) => {
                                    const firstPunch = row.punches && row.punches.length > 0 ? row.punches[0].checkIn : null;
                                    const lastPunch = row.punches && row.punches.length > 0 ? row.punches[row.punches.length - 1].checkOut : null;

                                    const hrs = Math.floor(row.totalWorkingMinutes / 60);
                                    const mins = row.totalWorkingMinutes % 60;

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-bold text-gray-700">{formatDate(row.date)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={row.status} />
                                                {row.autoClosed && (
                                                    <span className="ml-2 inline-flex text-[10px] font-bold uppercase tracking-wider text-amber-600 border border-amber-200 bg-amber-50 px-1.5 py-0.5 rounded">Auto Cls</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-600">{formatTime(firstPunch)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-600">{formatTime(lastPunch)}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-100 text-sm font-bold text-gray-700">
                                                    <Icons.Clock />
                                                    {hrs}h {mins}m
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium text-sm">No attendance records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                            Showing <span className="font-bold text-gray-900">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-bold text-gray-900">{total}</span> records
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1 || loading}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icons.ChevronLeft />
                            </button>
                            <div className="px-4 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-sm">
                                Page {page} of {totalPages}
                            </div>
                            <button
                                disabled={page === totalPages || loading}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Icons.ChevronRight />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeAttendance;
