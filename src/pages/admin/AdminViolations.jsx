import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import PageHeader from '../../components/UI/PageHeader';
import Card from '../../components/UI/Card';
import Badge from '../../components/UI/Badge';
import DataTable from '../../components/UI/DataTable';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminViolations = () => {
    // Shared State
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Tab State
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history'

    // Data State
    const [overviewData, setOverviewData] = useState([]); // Employee breakdown
    const [summaryStats, setSummaryStats] = useState({ totalLate: 0, totalEarlyExit: 0, totalHalfDays: 0, totalAbsents: 0 });
    const [historyData, setHistoryData] = useState([]); // Detailed log

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const res = await api.get('/branch');
                setBranches(res.data.data);
                if (res.data.data.length > 0) setSelectedBranch(res.data.data[0]._id);
            } catch (err) {
                console.error("Failed to fetch branches", err);
            }
        };
        fetchBranches();
    }, []);

    useEffect(() => {
        const fetchEmployees = async () => {
            if (!selectedBranch) {
                setEmployees([]);
                return;
            }
            try {
                // Fetch active employees for this branch
                const res = await api.get(`/admin/users?branch=${selectedBranch}&role=EMPLOYEE&status=ACTIVE`);
                setEmployees(res.data.data);
                setSelectedEmployee(''); // Reset employee selection when branch changes
            } catch (err) {
                console.error("Failed to fetch employees", err);
                setEmployees([]);
            }
        };
        fetchEmployees();
    }, [selectedBranch]);

    const fetchReport = async () => {
        if (!selectedBranch) return;
        setLoading(true);
        try {
            let queryParams = `branchId=${selectedBranch}&month=${month}&year=${year}`;
            if (selectedEmployee) {
                queryParams += `&employeeId=${selectedEmployee}`;
            }

            // Fetch Overview
            const resOverview = await api.get(`/admin/violations?${queryParams}`);
            setOverviewData(resOverview.data.data.employees);
            setSummaryStats(resOverview.data.data.summary);

            // Fetch History (Detailed)
            const resHistory = await api.get(`/admin/violations?${queryParams}&format=detailed`);
            if (Array.isArray(resHistory.data.data)) {
                setHistoryData(resHistory.data.data);
            } else {
                setHistoryData([]);
            }

        } catch (err) {
            console.error("Failed to fetch violations", err);
        } finally {
            setLoading(false);
        }
    };

    const downloadExcel = () => {
        const isOverview = activeTab === 'overview';
        const data = isOverview ? overviewData : historyData;

        if (!data.length) return;

        const wb = XLSX.utils.book_new();
        let ws;

        if (isOverview) {
            const exportData = data.map(v => ({
                'Employee Name': v.name,
                'Late': v.totalLate,
                'Early Exit': v.totalEarlyExit,
                'Half Day': v.totalHalfDays,
                'Absent': v.totalAbsents,
                'Total LOP (Days)': v.totalDeductionDays
            }));
            ws = XLSX.utils.json_to_sheet(exportData);
        } else {
            const exportData = data.map(v => ({
                'Date': new Date(v.date).toLocaleDateString(),
                'Employee': v.employeeName,
                'Violation Type': v.type,
                'Check In': v.checkIn,
                'Check Out': v.checkOut,
                'Total Time': v.duration
            }));
            ws = XLSX.utils.json_to_sheet(exportData);
        }

        XLSX.utils.book_append_sheet(wb, ws, "Violations");
        XLSX.writeFile(wb, `violations_${activeTab}_${month}_${year}.xlsx`);
    };

    const downloadPDF = () => {
        const isOverview = activeTab === 'overview';
        const data = isOverview ? overviewData : historyData;

        if (!data.length) return;

        const doc = new jsPDF();

        // Title
        doc.setFontSize(18);
        doc.text("Violations Report", 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Branch: ${branches.find(b => b._id === selectedBranch)?.name || 'All'}`, 14, 30);
        doc.text(`Period: ${month}/${year}`, 14, 36);

        if (selectedEmployee) {
            const empName = employees.find(e => e._id === selectedEmployee)?.name || 'Unknown';
            doc.text(`Employee: ${empName}`, 14, 42);
        }

        if (isOverview) {
            // Summary Stats in PDF
            const startY = selectedEmployee ? 52 : 46;
            doc.text(`Total Late: ${summaryStats.totalLate}`, 14, startY);
            doc.text(`Total Early: ${summaryStats.totalEarlyExit}`, 60, startY);
            doc.text(`Total Half Days: ${summaryStats.totalHalfDays}`, 110, startY);
            doc.text(`Total Absent: ${summaryStats.totalAbsents}`, 160, startY);
            doc.text(`Total LOP: ${summaryStats.totalDeductions} Days`, 14, startY + 6);

            const tableColumn = ["Employee", "Late", "Early", "Half Day", "Absent", "LOP (Days)"];
            const tableRows = [];

            data.forEach(v => {
                const violationData = [
                    v.name,
                    v.totalLate,
                    v.totalEarlyExit,
                    v.totalHalfDays,
                    v.totalAbsents,
                    v.totalDeductionDays.toFixed(1)
                ];
                tableRows.push(violationData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: startY + 10,
            });
        } else {
            const tableColumn = ["Date", "Employee", "Type", "Check In", "Check Out", "Total Time"];
            const tableRows = [];

            data.forEach(v => {
                const violationData = [
                    new Date(v.date).toLocaleDateString(),
                    v.employeeName,
                    v.type,
                    v.checkIn,
                    v.checkOut,
                    v.duration
                ];
                tableRows.push(violationData);
            });

            const startY = selectedEmployee ? 52 : 46;
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: startY,
            });
        }

        doc.save(`violations_${activeTab}_${month}_${year}.pdf`);
    };

    const exportCSV = () => {
        let headers = [];
        let rows = [];
        let filename = '';

        if (activeTab === 'overview') {
            if (!overviewData.length) return;
            headers = ['Employee Name', 'Late', 'Early Exit', 'Half Day', 'Absent', 'Total LOP (Days)'];
            rows = overviewData.map(v => [
                v.name,
                v.totalLate,
                v.totalEarlyExit,
                v.totalHalfDays,
                v.totalAbsents,
                v.totalDeductionDays
            ]);
            filename = `violations_summary_${month}_${year}.csv`;
        } else {
            if (!historyData.length) return;
            headers = ['Date', 'Employee', 'Violation Type', 'Check In', 'Check Out', 'Total Time'];
            rows = historyData.map(v => [
                v.date,
                v.employeeName,
                v.type,
                v.checkIn,
                v.checkOut,
                v.duration
            ]);
            filename = `violation_history_${month}_${year}.csv`;
        }

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Reset pagination when filters or tab change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, selectedBranch, selectedEmployee, month, year]);

    // Pagination Logic
    const currentTableData = activeTab === 'overview' ? overviewData : historyData;
    const totalPages = Math.ceil(currentTableData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = currentTableData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Columns for Overview
    const overviewColumns = [
        { header: 'Employee', accessor: 'name' },
        { header: 'Late', accessor: 'totalLate', render: (row) => <span className="text-orange-600 font-bold">{row.totalLate}</span>, className: 'hidden sm:table-cell' },
        { header: 'Early Exit', accessor: 'totalEarlyExit', render: (row) => <span className="text-purple-600 font-bold">{row.totalEarlyExit}</span>, className: 'hidden sm:table-cell' },
        {
            header: 'Half Day',
            accessor: 'totalHalfDays',
            render: (row) => (
                <span className="text-yellow-600 font-bold">
                    {row.totalHalfDays + (row.penaltyHalfDays || 0)}
                </span>
            ),
            className: 'hidden md:table-cell'
        },
        { header: 'Absent', accessor: 'totalAbsents', render: (row) => <span className="text-red-600 font-bold">{row.totalAbsents}</span>, className: 'hidden md:table-cell' },
        {
            header: 'Total LOP',
            accessor: 'totalDeductionDays',
            render: (row) => (
                <Badge variant="danger">
                    {row.totalDeductionDays.toFixed(1)} Days
                </Badge>
            )
        }
    ];

    // Columns for History
    const historyColumns = [
        { header: 'Date', accessor: 'date' },
        { header: 'Employee', accessor: 'employeeName', render: (row) => <span className="font-medium text-gray-900">{row.employeeName}</span> },
        {
            header: 'Violation Type',
            accessor: 'type',
            render: (row) => {
                let color = 'gray';
                if (row.type === 'LATE') color = 'orange';
                if (row.type === 'EARLY_EXIT') color = 'purple';
                if (row.type === 'HALF_DAY') color = 'yellow';
                if (row.type === 'ABSENT') color = 'red';

                return (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${color}-100 text-${color}-800 border border-${color}-200`}>
                        {row.type.replace('_', ' ')}
                    </span>
                );
            }
        },
        { header: 'Check In', accessor: 'checkIn', className: 'hidden sm:table-cell' },
        { header: 'Check Out', accessor: 'checkOut', className: 'hidden sm:table-cell' },
        { header: 'Total Time', accessor: 'duration', render: (row) => <span className="text-gray-500 font-mono text-xs">{row.duration}</span>, className: 'hidden md:table-cell' }
    ];

    return (
        <div>
            <PageHeader title="Monthly Violations Report" />

            {/* FILTERS */}
            <Card className="mb-6 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Branch</label>
                        <select
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value)}
                        >
                            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Employee (Optional)</label>
                        <select
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            disabled={!selectedBranch}
                        >
                            <option value="">All Employees</option>
                            {employees.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Month</label>
                        <select
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {Array.from({ length: 12 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Year</label>
                        <select
                            className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                        >
                            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchReport}
                            disabled={loading || !selectedBranch}
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium shadow-sm disabled:opacity-50"
                        >
                            {loading ? 'Fetching...' : 'Fetch Report'}
                        </button>
                    </div>
                </div>
            </Card>

            {/* TABS */}
            <div className="flex space-x-1 rounded-xl bg-gray-200 p-1 mb-6 w-fit">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-32 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                        ${activeTab === 'overview'
                            ? 'bg-white text-indigo-700 shadow'
                            : 'text-gray-600 hover:bg-white/12 hover:text-indigo-600'
                        }`}
                >
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`w-40 rounded-lg py-2.5 text-sm font-medium leading-5 transition-all
                        ${activeTab === 'history'
                            ? 'bg-white text-indigo-700 shadow'
                            : 'text-gray-600 hover:bg-white/12 hover:text-indigo-600'
                        }`}
                >
                    Detailed History
                </button>
            </div>

            {/* CONTENT AREA */}
            {activeTab === 'overview' ? (
                <>
                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
                        <Card className="p-5 border-l-4 border-orange-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Late</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{summaryStats.totalLate}</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-purple-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Early Exit</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{summaryStats.totalEarlyExit}</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-yellow-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Half Days</h3>
                            <div className="flex items-baseline gap-2 mt-2">
                                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalHalfDays + (summaryStats.penaltyHalfDays || 0)}</p>
                                {summaryStats.penaltyHalfDays > 0 && (
                                    <span className="text-xs text-gray-500 font-medium">(inc. {summaryStats.penaltyHalfDays} from violations)</span>
                                )}
                            </div>
                        </Card>
                        <Card className="p-5 border-l-4 border-red-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Absents</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{summaryStats.totalAbsents}</p>
                        </Card>
                        <Card className="p-5 border-l-4 border-blue-500">
                            <h3 className="text-gray-500 text-sm font-medium uppercase">Total Deductions</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {summaryStats.totalDeductions || 0}
                                <span className="text-sm text-gray-500 font-normal ml-1">Days</span>
                            </p>
                        </Card>
                    </div>

                    <Card>
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Employee Breakdown</h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={exportCSV}
                                    disabled={overviewData.length === 0}
                                    className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium disabled:opacity-50"
                                >
                                    CSV
                                </button>
                                <button
                                    onClick={downloadExcel}
                                    disabled={overviewData.length === 0}
                                    className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-medium disabled:opacity-50"
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={downloadPDF}
                                    disabled={overviewData.length === 0}
                                    className="text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 font-medium disabled:opacity-50"
                                >
                                    PDF
                                </button>
                            </div>
                        </div>
                        {overviewData.length > 0 ? (
                            <>
                                <DataTable columns={overviewColumns} data={paginatedData} />
                                {/* Pagination Controls */}
                                <div className="flex justify-between items-center p-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, overviewData.length)}</span> of <span className="font-medium">{overviewData.length}</span> results
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-10 text-center text-gray-500">
                                No violation data found. Select filters and click "Fetch Report".
                            </div>
                        )}
                    </Card>
                </>
            ) : (
                <Card>
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">All Violations Log</h3>
                        <div className="flex space-x-2">
                            <button
                                onClick={exportCSV}
                                disabled={historyData.length === 0}
                                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 font-medium disabled:opacity-50"
                            >
                                CSV
                            </button>
                            <button
                                onClick={downloadExcel}
                                disabled={historyData.length === 0}
                                className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-medium disabled:opacity-50"
                            >
                                Excel
                            </button>
                            <button
                                onClick={downloadPDF}
                                disabled={historyData.length === 0}
                                className="text-sm bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 font-medium disabled:opacity-50"
                            >
                                PDF
                            </button>
                        </div>
                    </div>
                    {historyData.length > 0 ? (
                        <>
                            <DataTable columns={historyColumns} data={paginatedData} />
                            {/* Pagination Controls */}
                            <div className="flex justify-between items-center p-4 border-t border-gray-200">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + ITEMS_PER_PAGE, historyData.length)}</span> of <span className="font-medium">{historyData.length}</span> results
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            No violations found for this period.
                        </div>
                    )}
                </Card>
            )}
        </div >
    );
};

export default AdminViolations;
