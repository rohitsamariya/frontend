import React, { useEffect, useState } from "react";
import employeeService from "../services/employeeService";

const Icons = {
    Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    MapPin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const EmployeeWorkingDays = () => {
    const [branchData, setBranchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    useEffect(() => {
        fetchBranch();
    }, []);

    const fetchBranch = async () => {
        try {
            setLoading(true);
            const data = await employeeService.getMyBranch();
            // Fallback to default [Mon-Sat] if strictly missing from the document structure
            if (!data.workingDays) {
                data.workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            }
            setBranchData(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to load branch working days.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center justify-center gap-3 border border-red-100 max-w-4xl mx-auto mt-8">
                <span className="font-bold">{error}</span>
            </div>
        );
    }

    if (!branchData) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Working Days</h1>
                <p className="text-gray-500 mt-1 font-medium">Review your official weekly schedule and assigned off-days.</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
                {/* Decorative Header */}
                <div className="h-24 bg-linear-to-r from-blue-500 to-indigo-600 relative">
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                </div>

                <div className="px-8 pb-8 -mt-8 relative z-10 space-y-8">
                    {/* Branch Banner Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-14 h-14 min-w-14 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                <Icons.Calendar />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Weekly Schedule</h2>
                                <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 text-sm font-medium">
                                    <Icons.MapPin />
                                    <span>{branchData.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold text-gray-600">
                            {branchData.workingDays.length} Working Days
                        </div>
                    </div>

                    {/* Weekly Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {daysOfWeek.map(day => {
                            const isSelected = branchData.workingDays?.includes(day);
                            return (
                                <div
                                    key={day}
                                    className={`
                                        rounded-2xl p-5 text-center border-2 transition-all duration-300 select-none flex flex-col items-center justify-center h-32
                                        ${isSelected
                                            ? 'bg-indigo-50/50 border-indigo-400 shadow-sm relative overflow-hidden'
                                            : 'bg-gray-50 border-gray-200 opacity-70'
                                        }
                                    `}
                                >
                                    {isSelected && (
                                        <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-100 rounded-bl-full -mr-2 -mt-2"></div>
                                    )}
                                    <div className={`text-base font-black mb-1.5 z-10 ${isSelected ? 'text-indigo-900 tracking-wide' : 'text-gray-400'}`}>
                                        {day.substring(0, 3).toUpperCase()}
                                    </div>
                                    <div className={`text-xs font-bold uppercase tracking-wider z-10 px-2 py-1 rounded-md ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
                                        {isSelected ? 'Working' : 'Off'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 flex items-start sm:items-center text-sm text-gray-500 bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                        <svg className="w-5 h-5 text-blue-400 mr-3 shrink-0 mt-0.5 sm:mt-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p><strong>Note:</strong> Days classified as "Off" will safely permit optional punch-ins, but unrecorded attendance on those days will never trigger absence penalties.</p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EmployeeWorkingDays;
