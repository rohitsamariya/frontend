import React, { useEffect, useState } from "react";
import employeeService from "../services/employeeService";
import { DateTime } from "luxon";

const Icons = {
    Calendar: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    List: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>,
    MapPin: () => <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Sparkles: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
    Cake: () => <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.5v.5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-.5a7 7 0 0 1 18 0zM18 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM10 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM12 7v5m0-9a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" /></svg>
};

const getHolidayTypeStyles = (type, name) => {
    if (name?.toLowerCase().includes('birthday')) return 'bg-pink-50 text-pink-700 border-pink-100';
    switch (type) {
        case 'NATIONAL': return 'bg-rose-50 text-rose-700 border-rose-100';
        case 'FESTIVAL': return 'bg-amber-50 text-amber-700 border-amber-100';
        case 'COMPANY': return 'bg-blue-50 text-blue-700 border-blue-100';
        default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
};

const EmployeeHolidays = () => {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
    const [calendarDate, setCalendarDate] = useState(DateTime.now().startOf('month'));
    const todayStr = DateTime.now().toISODate();

    useEffect(() => {
        fetchHolidays();
    }, []);

    const fetchHolidays = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getHolidays();
            setHolidays(response.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load holidays.");
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
            <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center border border-red-100 max-w-4xl mx-auto mt-8 font-bold">
                {error}
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
    const startDayOfWeek = startOfMonth.weekday; // 1 (Mon) to 7 (Sun)

    // Calendar grid generator (7 columns)
    const calendarDays = [];

    // 1. Fill previous month days
    const prevMonthEnd = startOfMonth.minus({ days: 1 });
    const prevMonthDaysToShow = startDayOfWeek - 1; // if Mon, weekday=1, so 0 days
    for (let i = prevMonthDaysToShow - 1; i >= 0; i--) {
        calendarDays.push({
            date: prevMonthEnd.minus({ days: i }),
            isCurrentMonth: false
        });
    }

    // 2. Current month days
    for (let i = 0; i < daysInMonth; i++) {
        calendarDays.push({
            date: startOfMonth.plus({ days: i }),
            isCurrentMonth: true
        });
    }

    // 3. Next month padding
    const remainingSlots = 42 - calendarDays.length; // 6 rows of 7 days
    for (let i = 0; i < remainingSlots; i++) {
        calendarDays.push({
            date: endOfMonth.plus({ days: i + 1 }),
            isCurrentMonth: false
        });
    }

    const getHolidaysForDay = (day) => {
        const dateStr = day.toISODate();
        return holidays.filter(h => DateTime.fromISO(h.date).toISODate() === dateStr);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">

            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Branch Holidays</h1>
                    <p className="text-gray-500 mt-1 font-medium italic">Official holidays scheduled for your assigned workplace location.</p>
                </div>

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
                                    <span className="text-emerald-100 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1 block">Happy Holiday!</span>
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
                            <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-tight">No Holidays Fixed Yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto font-medium">There are no holidays attached to your branch's calendar for this year.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Upcoming Holidays (Main) */}
                            <div className="lg:col-span-2 space-y-4">
                                <h2 className="text-xl font-black text-gray-900 border-b-2 border-indigo-100 pb-2 mb-4 inline-block">Upcoming Holidays</h2>

                                {upcomingHolidays.length === 0 ? (
                                    <p className="text-gray-400 italic font-medium mt-4">No more holidays for the rest of the year.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {upcomingHolidays.map(holiday => {
                                            const isBirthday = holiday.name?.toLowerCase().includes('birthday');
                                            return (
                                                <div key={holiday._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-indigo-400 hover:shadow-md transition-all duration-300 group">
                                                    <div className="flex items-center gap-5">
                                                        {/* Date Block */}
                                                        <div className={`rounded-xl p-3 text-center min-w-16 border shadow-xs shrink-0 transition-all duration-300 group-hover:scale-105 ${isBirthday ? 'bg-pink-50 border-pink-100' : 'bg-gray-50 border-gray-100'}`}>
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
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="shrink-0 text-left sm:text-right mt-2 sm:mt-0">
                                                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-xl border-2 uppercase tracking-widest ${getHolidayTypeStyles(holiday.type, holiday.name)}`}>
                                                            {isBirthday ? 'Personal' : holiday.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Past Holidays (Sidebar equivalent) */}
                            <div className="lg:col-span-1 border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10">
                                <h2 className="text-lg font-black text-gray-900 pb-2 mb-4 border-b border-gray-100">Past Holidays</h2>

                                {pastHolidays.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic font-medium">No past holidays yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {pastHolidays.map(holiday => (
                                            <div key={holiday._id} className="flex items-center gap-5 opacity-60 hover:opacity-100 transition-all duration-200 cursor-default group">
                                                <div className="text-center shrink-0 w-14 text-[11px] text-gray-400 font-black border-r-2 border-indigo-50 pr-4 transition-colors group-hover:border-indigo-400">
                                                    {DateTime.fromISO(holiday.date).toFormat('dd LLL')}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-700 text-sm group-hover:text-gray-900">{holiday.name}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{holiday.type}</p>
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
                                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
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
                                className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
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
                                    className={`min-h-24 sm:min-h-32 p-3 border-r border-b border-gray-100 relative transition-colors ${!day.isCurrentMonth ? 'bg-gray-50/50' : 'bg-white hover:bg-indigo-50/10'}`}
                                >
                                    <span className={`text-sm font-black flex items-center justify-center w-8 h-8 rounded-full mb-2 ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : day.isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                                        {day.date.day}
                                    </span>

                                    <div className="space-y-1.5 scrollbar-hide overflow-y-auto max-h-16 sm:max-h-24 pb-2">
                                        {dayHolidays.map(hol => {
                                            const isBirthday = hol.name?.toLowerCase().includes('birthday');
                                            return (
                                                <div
                                                    key={hol._id}
                                                    className={`px-2 py-1.5 rounded-lg border text-[9px] sm:text-[10px] font-bold leading-tight shadow-xs flex flex-col gap-0.5 wrap-break-word ${isBirthday ? 'bg-pink-50 border-pink-100 text-pink-700' : 'bg-amber-50 border-amber-100 text-amber-700'}`}
                                                >
                                                    <span className="truncate">{hol.name}</span>
                                                    <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter shrink-0">{isBirthday ? 'Birthday' : hol.type}</span>
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
        </div>
    );
};

export default EmployeeHolidays;
