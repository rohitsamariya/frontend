import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const Icons = {
    Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    MapPin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
};

const AdminWorkingDays = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const res = await api.get('/branch');
            const branchesData = res?.data?.data || [];
            const data = branchesData.map(b => ({
                ...b,
                workingDays: b.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] // Default
            }));
            setBranches(data);
        } catch (error) {
            console.error("Failed to fetch branches", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDay = (branchId, day) => {
        setBranches(prev => prev.map(b => {
            if (b._id === branchId) {
                const currentDays = b.workingDays || [];
                const newDays = currentDays.includes(day)
                    ? currentDays.filter(d => d !== day)
                    : [...currentDays, day];
                return { ...b, workingDays: newDays, _modified: true };
            }
            return b;
        }));
    };

    const handleSave = async (branchId) => {
        const branch = branches.find(b => b._id === branchId);
        if (!branch || !branch._modified) return;

        setSaving(true);
        try {
            await api.put(`/branch/${branchId}`, { workingDays: branch.workingDays });
            alert(`Working days updated for ${branch.name}`);
            setBranches(prev => prev.map(b => b._id === branchId ? { ...b, _modified: false } : b));
        } catch (error) {
            console.error("Failed to update branch", error);
            alert("Failed to update working days");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">Working Days Configuration</h1>
                <p className="text-gray-500 mt-1 font-medium">Configure weekly schedules and off-days for each branch.</p>
            </div>

            {branches.map(branch => (
                <div key={branch._id} className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
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
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight capitalize">{branch.name} Setup</h2>
                                        {branch._modified && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                                                Unsaved Changes
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-gray-500 text-sm font-medium">
                                        <Icons.MapPin />
                                        <span>{branch.workingDays?.length} Working Days Configured</span>
                                    </div>
                                </div>
                            </div>

                            {branch._modified && (
                                <button
                                    onClick={() => handleSave(branch._id)}
                                    disabled={saving}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            )}
                        </div>

                        {/* Weekly Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                            {daysOfWeek.map(day => {
                                const isSelected = branch.workingDays?.includes(day);
                                return (
                                    <div
                                        key={day}
                                        onClick={() => handleToggleDay(branch._id, day)}
                                        className={`
                                            cursor-pointer rounded-2xl p-5 text-center border-2 transition-all duration-300 select-none flex flex-col items-center justify-center h-32 hover:scale-[1.02]
                                            ${isSelected
                                                ? 'bg-indigo-50/50 border-indigo-400 shadow-sm relative overflow-hidden'
                                                : 'bg-gray-50 border-gray-200 opacity-70 hover:opacity-100'
                                            }
                                        `}
                                    >
                                        {isSelected && (
                                            <div className="absolute top-0 right-0 w-12 h-12 bg-indigo-100 rounded-bl-full -mr-2 -mt-2"></div>
                                        )}
                                        <div className={`text-base font-black mb-1.5 z-10 ${isSelected ? 'text-indigo-900 tracking-wide' : 'text-gray-400'}`}>
                                            {day.substring(0, 3).toUpperCase()}
                                        </div>
                                        <div className={`text-xs font-bold uppercase tracking-wider z-10 px-2 py-1 rounded-md transition-colors ${isSelected ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-200 text-gray-500'}`}>
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
                            <p><strong>Note:</strong> Days marked as "Off" allow optional punch-ins but won't be counted towards "Present" or "Absent" statistics.</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminWorkingDays;
