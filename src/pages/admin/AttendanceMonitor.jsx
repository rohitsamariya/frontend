import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import DataTable from "../../components/UI/DataTable";
import Badge from "../../components/UI/Badge";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CircleDot } from 'lucide-react';

const AttendanceMonitor = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Filter state
    const [filterMode, setFilterMode] = useState('date'); // 'date' or 'range'
    const today = new Date().toISOString().split('T')[0];
    const [singleDate, setSingleDate] = useState(today);
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get('/branch');
                setBranches(res.data.data);
                if (res.data.data.length > 0) {
                    setSelectedBranch(res.data.data[0]._id);
                }
            } catch (error) {
                console.error("Failed to fetch branches", error);
            }
        };
        fetchBranches();
    }, []);

    const fetchAttendance = async () => {
        if (!selectedBranch) return;
        setLoading(true);
        try {
            let url;
            // limit=0 to fetch all records for client-side pagination
            if (filterMode === 'date') {
                url = `/attendance/date/${singleDate}?branchId=${selectedBranch}&limit=0`;
            } else {
                url = `/attendance/date/${startDate}?endDate=${endDate}&branchId=${selectedBranch}&limit=0`;
            }

            if (selectedEmployee) {
                url += `&userId=${selectedEmployee}`;
            }

            const res = await api.get(url);
            setAttendanceData(res.data.data);
            setCurrentPage(1); // Reset to first page on new fetch
        } catch (error) {
            console.error("Failed to fetch attendance", error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch on branch, employee change, or filter change
    useEffect(() => {
        if (selectedBranch) {
            fetchAttendance();
        }
    }, [selectedBranch, selectedEmployee, filterMode, singleDate, startDate, endDate]);

    // Fetch Employees when Branch Changes
    useEffect(() => {
        const fetchEmployees = async () => {
            if (!selectedBranch) return;
            try {
                const res = await api.get(`/admin/users?branch=${selectedBranch}&role=EMPLOYEE&status=active`);
                setEmployees(res.data.data);
                setSelectedEmployee('');
            } catch (error) {
                console.error("Failed to fetch employees", error);
                setEmployees([]);
            }
        };
        fetchEmployees();
    }, [selectedBranch]);

    const getDateLabel = () => {
        if (filterMode === 'date') {
            if (singleDate === today) return "Today's Attendance";
            return `Attendance for ${new Date(singleDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`;
        }
        return `Attendance from ${new Date(startDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} to ${new Date(endDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    };

    // --- Export Functions ---
    const getExportData = () => {
        return attendanceData.map(row => {
            const checkIn = row.punches?.[0] ? new Date(row.punches[0].checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
            const lastPunch = row.punches?.[row.punches.length - 1];
            const checkOut = lastPunch?.checkOut ? new Date(lastPunch.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (row.isOpen ? 'Active' : '-');

            return {
                Date: new Date(row.date).toLocaleDateString('en-IN'),
                Employee: row.user?.name || 'Unknown',
                Role: row.user?.role || 'N/A',
                Shift: row.shift?.name || 'N/A',
                Status: row.status || 'N/A',
                'Check In': checkIn,
                'Check Out': checkOut
            };
        });
    };

    const downloadExcel = () => {
        const data = getExportData();
        if (!data.length) return;
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Attendance");
        XLSX.writeFile(wb, `Attendance_${selectedBranch}_${new Date().getTime()}.xlsx`);
    };

    const downloadPDF = () => {
        const data = getExportData();
        if (!data.length) return;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Attendance Report", 14, 22);
        doc.setFontSize(11);
        doc.text(`${getDateLabel()}`, 14, 30);

        const tableColumn = ["Date", "Employee", "Shift", "Status", "Check In", "Check Out"];
        const tableRows = data.map(row => [
            row.Date,
            row.Employee,
            row.Shift,
            row.Status,
            row['Check In'],
            row['Check Out']
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
        });

        doc.save(`Attendance_${new Date().getTime()}.pdf`);
    };

    const exportCSV = () => {
        const data = getExportData();
        if (!data.length) return;

        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], (key, value) => value === null ? '' : value)).join(','));
        const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + rows.join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_${new Date().getTime()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- Pagination Logic ---
    const totalPages = Math.ceil(attendanceData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = attendanceData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const columns = [
        {
            header: 'Date',
            accessor: 'date',
            render: (row) => new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        },
        { header: 'Employee', accessor: 'user', render: (row) => row.user?.name || 'Unknown' },
        { header: 'Role', accessor: 'user', render: (row) => <Badge variant="secondary">{row.user?.role || 'N/A'}</Badge>, className: 'hidden lg:table-cell' },
        { header: 'Shift', accessor: 'shift', render: (row) => row.shift?.name || 'N/A', className: 'hidden md:table-cell' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const v = row.status === 'PRESENT' ? 'success' : row.status === 'HALF_DAY' ? 'warning' : 'danger';
                return <Badge variant={v}>{row.status?.replace('_', ' ') || 'ABSENT'}</Badge>;
            }
        },
        {
            header: 'Check In',
            accessor: 'punches',
            render: (row) => row.punches?.[0] ? new Date(row.punches[0].checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
        },
        {
            header: 'Check Out',
            accessor: 'punches',
            render: (row) => {
                const lastPunch = row.punches?.[row.punches.length - 1];
                return lastPunch?.checkOut ? new Date(lastPunch.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (row.isOpen ? <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200"><CircleDot size={12} className="text-green-500" /> Active</span> : '-');
            },
            className: 'hidden sm:table-cell'
        }
    ];

    return (
        <div>
            <div className="mb-6">
                <PageHeader title="Attendance Monitor" />
            </div>

            {/* FILTER BAR */}
            <Card className="mb-6">
                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                        {/* BRANCH FILTER (3 cols) */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Branch</label>
                            <select
                                className="block w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-white shadow-sm h-[38px]"
                                value={selectedBranch}
                                onChange={(e) => setSelectedBranch(e.target.value)}
                            >
                                {branches.map(b => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* EMPLOYEE FILTER (3 cols) */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Employee</label>
                            <select
                                className="block w-full px-3 py-2 text-sm border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg bg-white shadow-sm h-[38px]"
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                disabled={!selectedBranch}
                            >
                                <option value="">All Employees</option>
                                {employees.map(emp => (
                                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* FILTER MODE (3 cols) */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Filter Type</label>
                            <div className="flex rounded-lg overflow-hidden border border-gray-300 shadow-sm h-[38px]">
                                <button
                                    onClick={() => setFilterMode('date')}
                                    className={`flex-1 px-2 text-sm font-medium transition-colors ${filterMode === 'date' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Specific Date
                                </button>
                                <button
                                    onClick={() => setFilterMode('range')}
                                    className={`flex-1 px-2 text-sm font-medium transition-colors border-l border-gray-300 ${filterMode === 'range' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                >
                                    Range
                                </button>
                            </div>
                        </div>

                        {/* DATE INPUTS (3 cols) */}
                        <div className="md:col-span-3">
                            {filterMode === 'date' ? (
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Date</label>
                                    <input
                                        type="date"
                                        value={singleDate}
                                        onChange={(e) => setSingleDate(e.target.value)}
                                        max={today}
                                        className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-[38px]"
                                    />
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">From</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            max={endDate}
                                            className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-[38px]"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            min={startDate}
                                            max={today}
                                            className="block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-indigo-500 focus:border-indigo-500 shadow-sm h-[38px]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ACTION ROW */}
                    <div className="flex flex-col md:flex-row justify-between items-center pt-2 border-t border-gray-100 mt-2 gap-4">
                        {/* Quick shortcuts */}
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            <span className="text-xs font-semibold text-gray-400 self-center uppercase mr-2">Quick Filters:</span>
                            <button onClick={() => { setFilterMode('date'); setSingleDate(today); }}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${singleDate === today && filterMode === 'date' ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                Today
                            </button>
                            <button onClick={() => {
                                setFilterMode('range');
                                const d = new Date();
                                d.setDate(d.getDate() - 7);
                                setStartDate(d.toISOString().split('T')[0]);
                                setEndDate(today);
                            }}
                                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                Last 7 Days
                            </button>
                            <button onClick={() => {
                                setFilterMode('range');
                                const d = new Date();
                                d.setDate(d.getDate() - 30);
                                setStartDate(d.toISOString().split('T')[0]);
                                setEndDate(today);
                            }}
                                className="px-3 py-1.5 text-xs font-medium rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                Last 30 Days
                            </button>
                        </div>

                        <button
                            onClick={fetchAttendance}
                            disabled={loading}
                            className="w-full md:w-auto px-8 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Fetching...' : 'Fetch Records'}
                        </button>
                    </div>
                </div>
            </Card>

            {/* DATA TABLE */}
            <Card>
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading Attendance...</div>
                ) : (
                    <>
                        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-lg font-semibold text-gray-900">{getDateLabel()}</h3>
                            <div className="flex flex-wrap justify-center space-x-2">
                                <span className="text-sm text-gray-400 font-medium self-center mr-2">{attendanceData.length} record{attendanceData.length !== 1 ? 's' : ''}</span>
                                <button
                                    onClick={exportCSV}
                                    disabled={attendanceData.length === 0}
                                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    CSV
                                </button>
                                <button
                                    onClick={downloadExcel}
                                    disabled={attendanceData.length === 0}
                                    className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-medium disabled:opacity-50"
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={downloadPDF}
                                    disabled={attendanceData.length === 0}
                                    className="text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 font-medium disabled:opacity-50"
                                >
                                    PDF
                                </button>
                            </div>
                        </div>
                        {attendanceData.length > 0 ? (
                            <>
                                <DataTable columns={columns} data={paginatedData} />
                                {/* Pagination Controls */}
                                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, attendanceData.length)}</span> of <span className="font-medium">{attendanceData.length}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-12 text-center text-gray-400">
                                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                                <p className="font-medium">No attendance records found</p>
                                <p className="text-sm mt-1">Try selecting a different date or branch</p>
                            </div>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
};

export default AttendanceMonitor;
