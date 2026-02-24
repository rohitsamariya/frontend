import React, { useEffect, useState } from "react";
import employeeService from "../services/employeeService";
import { DateTime } from "luxon";

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const Icons = {
    MapPin: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    Clock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Globe: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    ShieldCheck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
};

const EmployeeBranch = () => {
    const [branchData, setBranchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBranch();
    }, []);

    const fetchBranch = async () => {
        try {
            setLoading(true);
            const data = await employeeService.getMyBranch();
            setBranchData(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Failed to load branch data.");
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

    const position = branchData.latitude && branchData.longitude
        ? [parseFloat(branchData.latitude), parseFloat(branchData.longitude)]
        : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Branch</h1>
                <p className="text-gray-500 mt-1 font-medium italic">View details about your assigned workplace and shift constraints.</p>
            </div>

            {/* Main Info Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">

                {/* Decorative Header */}
                <div className="h-32 bg-linear-to-r from-indigo-500 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                </div>

                <div className="px-8 pb-8 -mt-12 relative z-10 space-y-8">

                    {/* Title Banner */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-5 w-full sm:w-auto">
                            <div className="w-16 h-16 min-w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                                <Icons.MapPin />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{branchData.name}</h2>
                                <p className="text-indigo-600 font-black text-[10px] tracking-widest uppercase">Assigned Location</p>
                            </div>
                        </div>
                        <div className="mt-2 sm:mt-0 w-full sm:w-auto text-left sm:text-right">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black rounded-xl border-2 border-emerald-100 uppercase tracking-wider shadow-xs">
                                <Icons.ShieldCheck />
                                {branchData.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Location Constraints */}
                        <div className="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 space-y-5">
                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-3 mb-4">Location Constraints</h3>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 shadow-sm shrink-0"><Icons.Globe /></div>
                                <div>
                                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">Timezone</p>
                                    <p className="font-bold text-gray-900 tracking-tight">{branchData.timezone}</p>
                                    <p className="text-xs text-indigo-500 font-bold mt-0.5">Local Time: {DateTime.now().setZone(branchData.timezone).toFormat("hh:mm a")}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm shrink-0"><Icons.MapPin /></div>
                                <div>
                                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-tighter">Check-In Radius</p>
                                    <p className="font-bold text-gray-900 tracking-tight">{branchData.radius} Meters</p>
                                    <p className="text-xs text-gray-500 font-medium italic mt-0.5 leading-tight">Punch-ins outside this radius are blocked.</p>
                                </div>
                            </div>
                        </div>

                        {/* Shift Assignment */}
                        {branchData.shift && (
                            <div className="p-6 rounded-2xl bg-indigo-50/30 border border-indigo-100 space-y-5 shadow-inner">
                                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest border-b border-indigo-100 pb-3 mb-4">Assigned Shift</h3>

                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200 shadow-sm shrink-0"><Icons.Clock /></div>
                                    <div className="space-y-2">
                                        <p className="font-black text-gray-900 tracking-tight">{branchData.shift.name || 'Standard Shift'}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border-2 border-indigo-100 shadow-xs tracking-tighter">{branchData.shift.startTime}</span>
                                            <span className="text-gray-400 text-xs font-black italic">to</span>
                                            <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-1 rounded-lg border-2 border-indigo-100 shadow-xs tracking-tighter">{branchData.shift.endTime}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pl-16">
                                    <p className="text-xs text-gray-600 font-bold bg-white/50 inline-block px-3 py-1.5 rounded-lg border border-indigo-50 shadow-xs">
                                        <span className="text-indigo-600 font-black">{branchData.shift.requiredHours}</span> Required Daily Hours
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Leaflet Map Integration */}
                    {position && (
                        <div className="border-4 border-white rounded-3xl overflow-hidden h-80 bg-gray-100 relative shadow-2xl z-0">
                            <MapContainer
                                center={position}
                                zoom={15}
                                scrollWheelZoom={false}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={position}>
                                    <Popup>
                                        <div className="text-center font-bold p-1">
                                            {branchData.name}<br />
                                            <span className="text-[10px] text-gray-500 font-normal">Branch Office</span>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>

                            {/* Overlay Badge */}
                            <div className="absolute bottom-4 left-4 z-500 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-indigo-100 flex items-center gap-3 animate-fade-in">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-200"></div>
                                <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest transition-all">Live Branch Coordinates</span>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default EmployeeBranch;
