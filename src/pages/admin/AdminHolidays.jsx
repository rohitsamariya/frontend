import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { DateTime } from 'luxon';

const Icons = {
    Calendar: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    List: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    MapPin: () => <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Sparkles: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Cake: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.5v.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-.5a7 7 0 0 1 18 0zM18 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM10 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 7v5m0-9a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" /></svg>,
    Plus: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    Edit: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
    Trash: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

const getHolidayTypeStyles = (type, name) => {
    if (name?.toLowerCase().includes('birthday')) return 'bg-pink-50 text-pink-700 border-pink-100';
    switch (type) {
        case 'National': return 'bg-rose-50 text-rose-700 border-rose-100';
        case 'Festival': return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'Company': return 'bg-blue-50 text-blue-700 border-blue-100';
        case 'Regional': return 'bg-purple-50 text-purple-700 border-purple-100';
        case 'Optional': return 'bg-teal-50 text-teal-700 border-teal-100';
        default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
};

const AdminHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
    const [calendarDate, setCalendarDate] = useState(DateTime.now().startOf('month'));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentHoliday, setCurrentHoliday] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        type: 'National',
        description: ''
    });

    const todayStr = DateTime.now().toISODate();

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const res = await api.get('/holidays');
            const data = (res.data.data || []).sort((a, b) => new Date(a.date) - new Date(b.date));
            setHolidays(data);
        } catch (error) {
            console.error("Failed to fetch holidays", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openModal = (holiday = null) => {
        if (holiday) {
            setCurrentHoliday(holiday);
            setFormData({
                name: holiday.name,
                date: new Date(holiday.date).toISOString().split('T')[0],
                type: holiday.type || 'National',
                description: holiday.description || ''
            });
        } else {
            setCurrentHoliday(null);
            setFormData({
                name: '',
                date: '',
                type: 'National',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentHoliday(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentHoliday) {
                await api.put(`/holidays/${currentHoliday._id}`, formData);
            } else {
                await api.post('/holidays', formData);
            }
            fetchHolidays();
            closeModal();
        } catch (error) {
            console.error("Failed to save holiday", error);
            alert(error.response?.data?.error || "Failed to save holiday");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this holiday?')) {
            try {
                await api.delete(`/holidays/${id}`);
                fetchHolidays();
            } catch (error) {
                console.error("Failed to delete holiday", error);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const todayHoliday = holidays.find(h => DateTime.fromISO(h.date).toISODate() === todayStr);

    // Split into upcoming and past
    const upcomingHolidays = holidays.filter(h => DateTime.fromISO(h.date).toISODate() >= todayStr);
    const pastHolidays = holidays.filter(h => DateTime.fromISO(h.date).toISODate() < todayStr).reverse(); // Most recent past first

    // Calendar logic
    const startOfMonth = calendarDate.startOf('month');
    const endOfMonth = calendarDate.endOf('month');
    const daysInMonth = calendarDate.daysInMonth;
    const startDayOfWeek = startOfMonth.weekday;

    const calendarDays = [];
    const prevMonthEnd = startOfMonth.minus({ days: 1 });
    const prevMonthDaysToShow = startDayOfWeek - 1;
    for (let i = prevMonthDaysToShow - 1; i >= 0; i--) {
        calendarDays.push({ date: prevMonthEnd.minus({ days: i }), isCurrentMonth: false });
    }
    for (let i = 0; i < daysInMonth; i++) {
        calendarDays.push({ date: startOfMonth.plus({ days: i }), isCurrentMonth: true });
    }
    const remainingSlots = 42 - calendarDays.length;
    for (let i = 0; i < remainingSlots; i++) {
        calendarDays.push({ date: endOfMonth.plus({ days: i + 1 }), isCurrentMonth: false });
    }

    const getHolidaysForDay = (day) => {
        const dateStr = day.toISODate();
        return holidays.filter(h => DateTime.fromISO(h.date).toISODate() === dateStr);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Holiday Management</h1>
                    <p className="text-gray-500 mt-1 font-medium">Configure company-wide and regional holidays.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 shrink-0">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Icons.List /> List View
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 text-sm font-bold flex items-center gap-2 rounded-lg transition-all duration-200 ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            <Icons.Calendar /> Calendar
                        </button>
                    </div>

                    <button
                        onClick={() => openModal()}
                        className="flex-1 sm:flex-none px-4 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                        <Icons.Plus /> Add Holiday
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <>
                    {/* Today's Holiday Highlight */}
                    {todayHoliday && (
                        <div className="bg-linear-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 flex items-center justify-between gap-6 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full mix-blend-overlay filter blur-2xl opacity-20 transform translate-x-1/2 -translate-y-1/2 transition-transform duration-500 group-hover:scale-110"></div>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm shadow-inner">
                                    <Icons.Sparkles />
                                </div>
                                <div>
                                    <span className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1 block">Active Holiday</span>
                                    <h2 className="text-xl sm:text-2xl font-black">{todayHoliday.name} is Today!</h2>
                                </div>
                            </div>
                        </div>
                    )}

                    {holidays.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm animate-fade-in">
                            <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                                <Icons.Calendar />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">No Holidays Found</h3>
                            <p className="text-gray-500 max-w-md mx-auto font-medium mb-6">You haven't added any holidays to the system yet.</p>
                            <button
                                onClick={() => openModal()}
                                className="px-6 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
                            >
                                <Icons.Plus /> Add First Holiday
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Upcoming Holidays (Main) */}
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-xl font-black text-gray-900 border-b-2 border-indigo-100 pb-2 mb-4 inline-block">Upcoming Holidays</h2>

                                {upcomingHolidays.length === 0 ? (
                                    <p className="text-gray-400 italic font-medium mt-4">No upcoming holidays scheduled.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingHolidays.map(holiday => {
                                            const isBirthday = holiday.name?.toLowerCase().includes('birthday');
                                            return (
                                                <div key={holiday._id} className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-400 hover:shadow-md transition-all duration-300 group">
                                                    <div className="flex items-center gap-4 sm:gap-5">
                                                        {/* Date Block */}
                                                        <div className={`rounded-xl p-3 text-center min-w-[64px] border shadow-xs shrink-0 transition-transform duration-300 group-hover:scale-105 ${isBirthday ? 'bg-pink-50 border-pink-100' : 'bg-gray-50 border-gray-100'}`}>
                                                            <span className={`block text-[10px] font-bold uppercase tracking-tighter ${isBirthday ? 'text-pink-500' : 'text-gray-400'}`}>{DateTime.fromISO(holiday.date).toFormat('MMM')}</span>
                                                            <span className={`block text-2xl font-black leading-tight ${isBirthday ? 'text-pink-700' : 'text-gray-900'}`}>{DateTime.fromISO(holiday.date).toFormat('dd')}</span>
                                                        </div>

                                                        <div>
                                                            <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 group-hover:text-indigo-700 transition-colors">
                                                                {holiday.name}
                                                                {isBirthday && <Icons.Cake className="text-pink-500 animate-bounce" />}
                                                            </h3>
                                                            <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                                <span className="text-sm font-semibold text-gray-500 flex items-center gap-1">
                                                                    <Icons.Calendar className="w-4 h-4 text-indigo-400" /> {DateTime.fromISO(holiday.date).toFormat('cccc')}
                                                                </span>
                                                                <span className={`px-2 py-0.5 text-[10px] font-black rounded border uppercase tracking-widest flex items-center gap-1 ${getHolidayTypeStyles(holiday.type, holiday.name)}`}>
                                                                    {holiday.type}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 mt-1 sm:mt-0 w-full sm:w-auto justify-end">
                                                        <button
                                                            onClick={() => openModal(holiday)}
                                                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-2 sm:gap-0"
                                                            title="Edit"
                                                        >
                                                            <Icons.Edit /> <span className="sm:hidden text-xs font-bold">Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(holiday._id)}
                                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 sm:gap-0"
                                                            title="Delete"
                                                        >
                                                            <Icons.Trash /> <span className="sm:hidden text-xs font-bold">Delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Past Holidays */}
                            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10">
                                <h2 className="text-lg font-black text-gray-900 pb-2 mb-4 border-b border-gray-100">Past Holidays</h2>

                                {pastHolidays.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic font-medium">No past holidays yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {pastHolidays.map(holiday => (
                                            <div key={holiday._id} className="flex items-center justify-between gap-5 opacity-70 hover:opacity-100 transition-all duration-200 group">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-center shrink-0 w-14 text-[11px] text-gray-400 font-black border-r-2 border-indigo-50 pr-4 group-hover:border-indigo-400 transition-colors">
                                                        {DateTime.fromISO(holiday.date).toFormat('dd LLL')}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-700 text-sm group-hover:text-gray-900">{holiday.name}</h4>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{holiday.type}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => openModal(holiday)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded"><Icons.Edit /></button>
                                                    <button onClick={() => handleDelete(holiday._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Icons.Trash /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up">
                    {/* Calendar Header */}
                    <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {calendarDate.toFormat('MMMM')} <span className="text-indigo-600 tracking-normal">{calendarDate.year}</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCalendarDate(calendarDate.minus({ months: 1 }))}
                                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <button
                                onClick={() => setCalendarDate(DateTime.now().startOf('month'))}
                                className="px-4 py-2.5 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => setCalendarDate(calendarDate.plus({ months: 1 }))}
                                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Weekday Names */}
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-white">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="py-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-widest border-r border-gray-50 last:border-0">{day}</div>
                        ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 border-gray-100 bg-gray-50/30">
                        {calendarDays.map((day, idx) => {
                            const isToday = day.date.toISODate() === todayStr;
                            const dayHolidays = getHolidaysForDay(day.date);

                            return (
                                <div
                                    key={idx}
                                    className={`min-h-[120px] sm:min-h-32 p-3 border-r border-b border-gray-100 relative transition-colors group ${!day.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-indigo-50/20'}`}
                                    onClick={() => {
                                        if (day.isCurrentMonth) {
                                            setFormData({ ...formData, date: day.date.toISODate() });
                                            setIsModalOpen(true);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-sm font-black flex items-center justify-center w-8 h-8 rounded-full ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                                            {day.date.day}
                                        </span>
                                        {day.isCurrentMonth && (
                                            <button className="text-indigo-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Icons.Plus />
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-1.5">
                                        {dayHolidays.map(hol => {
                                            const isBirthday = hol.name?.toLowerCase().includes('birthday');
                                            return (
                                                <div
                                                    key={hol._id}
                                                    onClick={(e) => { e.stopPropagation(); openModal(hol); }}
                                                    className={`px-2 py-1.5 rounded-lg border text-[10px] sm:text-xs font-bold leading-tight shadow-sm flex flex-col gap-0.5 wrap-break-word cursor-pointer hover:shadow-md transition-shadow ${isBirthday ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}
                                                >
                                                    <span className="truncate">{hol.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
                            <h3 className="text-xl font-black text-gray-900">{currentHoliday ? 'Edit Holiday' : 'Add New Holiday'}</h3>
                            <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Holiday Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        placeholder="e.g. Diwali, Christmas, Independence Day"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Type</label>
                                        <select
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-gray-700 bg-white"
                                        >
                                            <option value="National">National</option>
                                            <option value="Festival">Festival</option>
                                            <option value="Optional">Optional</option>
                                            <option value="Regional">Regional</option>
                                            <option value="Company">Company</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Description (Optional)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none"
                                        rows="3"
                                        placeholder="Add any additional details about this holiday..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
                                >
                                    Save Holiday
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHolidays;
