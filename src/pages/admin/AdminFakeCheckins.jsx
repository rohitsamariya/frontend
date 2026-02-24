import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/UI/PageHeader';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import DataTable from '../../components/UI/DataTable';
import { MapPinOff, AlertOctagon, Map as MapIcon, AlertCircle, LucideMousePointerClick } from 'lucide-react';

const AdminFakeCheckins = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('All');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('All');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const [loading, setLoading] = useState(false);
    const [attempts, setAttempts] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get('/branch');
                setBranches(res.data.data);
            } catch (err) {
                console.error("Failed to fetch branches", err);
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (selectedBranch === 'All') {
                setEmployees([]);
                return;
            }
            try {
                const res = await api.get(`/admin/users?branch=${selectedBranch}&role=EMPLOYEE`);
                setEmployees(res.data.data);
                setSelectedEmployee('All');
            } catch (err) {
                console.error("Failed to fetch employees", err);
                setEmployees([]);
            }
        };
        fetchEmployees();
    }, [selectedBranch]);

    const fetchReports = async (page = 1) => {
        setLoading(true);
        try {
            let queryParams = `page=${page}&limit=20&month=${month}&year=${year}`;
            if (selectedBranch !== 'All') queryParams += `&branchId=${selectedBranch}`;
            if (selectedEmployee !== 'All') queryParams += `&employeeId=${selectedEmployee}`;

            const res = await api.get(`/admin/fake-checkins?${queryParams}`);
            setAttempts(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error("Failed to fetch fake check-ins", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports(1);
    }, [selectedBranch, selectedEmployee, month, year]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchReports(newPage);
        }
    };

    const columns = [
        {
            header: "Employee",
            accessor: "user",
            render: (row) => {
                const user = row.user;
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0 overflow-hidden">
                            {user?.profileImage ? (
                                <img
                                    src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profileImage}`}
                                    alt={user?.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                user?.name?.charAt(0) || 'U'
                            )}
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">{user?.name || 'Unknown User'}</div>
                            <div className="text-xs text-gray-500">{user?.email || 'N/A'}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            header: "Branch",
            accessor: "branch",
            render: (row) => <span className="text-gray-600">{row.branch?.name || 'N/A'}</span>
        },
        {
            header: "Attempt Time",
            accessor: "date",
            render: (row) => {
                const dateStr = row.date;
                if (!dateStr) return <span className="text-gray-500">N/A</span>;
                try {
                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return <span className="text-gray-500">Invalid Date</span>;
                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-xs text-gray-500">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        </div>
                    );
                } catch (e) {
                    return <span>Error</span>;
                }
            }
        },
        {
            header: "Distance from Office",
            accessor: "distanceMeters",
            render: (row) => {
                const val = row.distanceMeters;
                if (val == null || typeof val !== 'number') return <span className="text-gray-500">N/A</span>;
                return (
                    <span className="font-semibold text-red-600">
                        {val > 1000 ? `${(val / 1000).toFixed(2)} km away` : `${val.toFixed(0)} meters away`}
                    </span>
                );
            }
        },
        {
            header: "Failure Reason",
            accessor: "failureReason",
            render: (row) => {
                const reason = row.failureReason;
                let color = "red";
                let text = "Out of Bounds";
                if (reason === 'NULL_ISLAND_SPOOF') { color = "orange"; text = "Location Spoofing Detected"; }
                if (reason === 'IMPOSSIBLE_TRAVEL') { color = "red"; text = "Impossible Travel Jump"; }

                return <Badge color={color}>{text}</Badge>;
            }
        },
        {
            header: "Map Link",
            accessor: "attemptLocation",
            render: (row) => {
                const loc = row.attemptLocation;
                if (!loc || loc.latitude == null || loc.longitude == null) {
                    return <span className="text-gray-400 text-sm">No GPS</span>;
                }
                return (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                        <MapIcon size={14} />
                        View Map
                    </a>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Fake Check-In Reports"
                subtitle="Monitor and investigate failed check-in attempts occurring outside branch geofences or using spoofed locations."
                icon={<MapPinOff size={28} className="text-red-600" />}
            />

            {/* Filters */}
            <Card className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all"
                        >
                            {[...Array(5)].map((_, i) => (
                                <option key={i} value={new Date().getFullYear() - i}>{new Date().getFullYear() - i}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 transition-all"
                        >
                            <option value="All">All Branches</option>
                            {branches.map(b => (
                                <option key={b._id} value={b._id}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            disabled={selectedBranch === 'All'}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
                        >
                            <option value="All">All Employees</option>
                            {employees.map(e => (
                                <option key={e._id} value={e._id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {/* List */}
            <Card className="overflow-hidden">
                <DataTable
                    columns={columns}
                    data={attempts}
                    loading={loading}
                    emptyMessage={
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 border border-green-100">
                                <AlertOctagon size={32} className="text-green-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No Fake Check-Ins Detected!</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-1">Excellent! There are no recorded out-of-bounds check-in attempts for the selected filters.</p>
                        </div>
                    }
                />

                {/* Pagination */}
                {!loading && pagination.pages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <div className="text-sm text-gray-500 font-medium">
                            Showing <span className="text-gray-900">{(pagination.page - 1) * 20 + 1}</span> to <span className="text-gray-900">{Math.min(pagination.page * 20, pagination.total)}</span> of <span className="text-gray-900">{pagination.total}</span> entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.page - 1)}
                                disabled={pagination.page === 1}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminFakeCheckins;
