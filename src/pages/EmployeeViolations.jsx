import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import employeeService from '../services/employeeService';
import StatusBadge from '../components/UI/StatusBadge';
import PageHeader from '../components/UI/PageHeader';

const Icons = {
    ShieldExclamation: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const EmployeeViolations = () => {
    const [activeTab, setActiveTab] = useState('ABSENCES'); // ABSENCES | TIME_VIOLATIONS
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const now = DateTime.now();
    const [selectedMonth, setSelectedMonth] = useState(now.month);
    const [selectedYear, setSelectedYear] = useState(now.year);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'ABSENCES') {
                const response = await employeeService.getAttendanceHistory(1, 100, selectedMonth, selectedYear, 'ABSENT');
                setData(response.data || []);
                setTotal(response.total || response.data?.length || 0);
            } else {
                const response = await employeeService.getViolations(1, 100, selectedMonth, selectedYear);
                setData(response.data || []);
                setTotal(response.total || response.count || 0);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setData([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedMonth, selectedYear]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        if (name === 'month') setSelectedMonth(parseInt(value));
        if (name === 'year') setSelectedYear(parseInt(value));
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return DateTime.fromISO(dateString).toFormat('EEEE, MMM dd, yyyy');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex items-end justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Violations</h1>
                    <p className="text-gray-500 mt-1 font-medium">Review your absences, late arrivals, and early departures.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                        <select
                            name="month"
                            value={selectedMonth}
                            onChange={handleFilterChange}
                            className="bg-white border text-sm font-semibold text-gray-700 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer shadow-sm hover:border-gray-300"
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
                            className="bg-white border text-sm font-semibold text-gray-700 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all cursor-pointer shadow-sm hover:border-gray-300"
                        >
                            {[...Array(5)].map((_, i) => {
                                const y = now.year - i;
                                return <option key={y} value={y}>{y}</option>;
                            })}
                        </select>
                    </div>

                    <div className="bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3">
                        <div className="p-1.5 bg-red-50 text-red-600 rounded-lg">
                            <Icons.ShieldExclamation />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Records</p>
                            <p className="text-lg font-black text-gray-800 leading-none">{total}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
                <button
                    onClick={() => setActiveTab('ABSENCES')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'ABSENCES'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    Absences
                </button>
                <button
                    onClick={() => setActiveTab('TIME_VIOLATIONS')}
                    className={`px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'TIME_VIOLATIONS'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                        }`}
                >
                    Time Violations
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Record Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Impact</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                                            Loading records...
                                        </div>
                                    </td>
                                </tr>
                            ) : data.length > 0 ? (
                                data.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                                    {activeTab === 'ABSENCES' ? <Icons.Calendar /> : <Icons.Clock />}
                                                </div>
                                                <span className="font-bold text-gray-700">
                                                    {formatDate(item.date)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {activeTab === 'ABSENCES' ? (
                                                <StatusBadge status="ABSENT" />
                                            ) : (
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${item.type === 'LATE'
                                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                    : 'bg-purple-50 text-purple-700 border-purple-200'
                                                    }`}>
                                                    {item.type ? item.type.replace('_', ' ') : 'UNKNOWN'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <span className="text-sm font-bold text-gray-500">
                                                {activeTab === 'ABSENCES' ? 'Full Day Deduction' : 'Every 3rd Violation = Half Day Penalty'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center text-gray-400 font-medium text-sm">
                                        No {activeTab.toLowerCase().replace('_', ' ')} found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmployeeViolations;
