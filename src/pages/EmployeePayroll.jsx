import React, { useEffect, useState } from "react";
import employeeService from "../services/employeeService";
import { getMediaUrl } from "../utils/url";
import { DateTime } from "luxon";

const Icons = {
    Download: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    Calendar: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    CheckCircle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    AlertTriangle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    Currency: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
};

const EmployeePayroll = () => {
    const [payroll, setPayroll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter states
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    useEffect(() => {
        fetchPayrollData();
    }, [selectedMonth, selectedYear]);

    const fetchPayrollData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await employeeService.getPayrollSummary(selectedMonth, selectedYear);
            setPayroll(data);
        } catch (err) {
            console.error("Payroll fetch error:", err);
            // Ignore 404s (just means no payroll generated yet month), show specific limits
            if (err.response?.status === 404) {
                setPayroll(null);
            } else {
                setError(err.response?.data?.error || "Failed to load payroll data");
            }
        } finally {
            setLoading(false);
        }
    };

    // Construct array of last 5 years
    const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
    const months = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount || 0);
    };

    const handleDownloadPDF = async () => {
        if (!payroll || !payroll.salarySlipUrl) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(getMediaUrl(payroll.salarySlipUrl), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to download PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `payslip-${months.find(m => m.value === selectedMonth)?.label}-${selectedYear}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download PDF');
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">My Payroll</h1>
                    <p className="text-gray-500 mt-1 font-medium">Download salary slips and view your earnings breakdown.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-100">
                        <Icons.Calendar />
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="bg-transparent text-sm font-bold text-gray-800 outline-none cursor-pointer"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>

                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-gray-50 text-sm font-bold text-gray-800 px-3 py-2 rounded-lg border border-gray-100 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error ? (
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center justify-center gap-3 border border-red-100">
                    <Icons.AlertTriangle />
                    <span className="font-bold">{error}</span>
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : !payroll ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icons.Currency />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No Payroll Available</h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                        We couldn't find a finalized payroll slip for {months.find(m => m.value === selectedMonth)?.label} {selectedYear}. Note that records before your joining date will not appear.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Primary Net Salary Card */}
                    <div className="lg:col-span-1 border border-emerald-100 bg-linear-to-br from-emerald-500 to-emerald-700 text-white rounded-2xl p-8 shadow-lg shadow-emerald-200 relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
                        <div className="relative z-10">
                            <p className="text-emerald-100 font-bold tracking-wider text-sm uppercase mb-1">Net Take Home Pay</p>
                            <h2 className="text-5xl font-black mb-4">{formatCurrency(payroll.netPay)}</h2>

                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-lg border border-white/30 uppercase tracking-wider">
                                {payroll.status === 'PROCESSED' || payroll.status === 'PAID' ? (
                                    <><Icons.CheckCircle /> PAID & DISBURSED</>
                                ) : (
                                    <span className="opacity-80">PENDING FINALIZATION</span>
                                )}
                            </div>
                        </div>

                        <div className="relative z-10 mt-8">
                            <button
                                disabled={!payroll.salarySlipUrl}
                                onClick={handleDownloadPDF}
                                className="w-full flex items-center justify-center gap-2 bg-white text-emerald-700 px-4 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors disabled:bg-white/50 disabled:text-emerald-800/50 disabled:cursor-not-allowed shadow-sm"
                            >
                                <Icons.Download /> {payroll.salarySlipUrl ? 'Download Payslip PDF' : 'No PDF Uploaded Yet'}
                            </button>
                        </div>
                    </div>

                    {/* Breakdown Details */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">Salary Breakdown</h3>
                            <p className="text-sm text-gray-500">For {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</p>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">

                            {/* Earnings Column */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Earnings
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-gray-700 font-medium">
                                        <span>Basic Salary</span>
                                        <span>{formatCurrency(payroll.basicSalary)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700 font-medium">
                                        <span>HRA</span>
                                        <span>{formatCurrency(payroll.hra)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700 font-medium">
                                        <span>Dearness Allowance</span>
                                        <span>{formatCurrency(payroll.da)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700 font-medium">
                                        <span>Special Allowance</span>
                                        <span>{formatCurrency(payroll.specialAllowance)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700 font-medium">
                                        <span>Other Allowances</span>
                                        <span>{formatCurrency(payroll.otherAllowances)}</span>
                                    </div>
                                    {payroll.arrears > 0 && (
                                        <div className="flex justify-between items-center font-medium text-indigo-600">
                                            <span>Arrears</span>
                                            <span>{formatCurrency(payroll.arrears)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Gross Earnings</span>
                                    <span className="font-bold text-emerald-600">{formatCurrency(payroll.totalEarnings)}</span>
                                </div>
                            </div>

                            {/* Deductions Column */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Deductions
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-gray-700 font-medium">
                                        <span>PF Contribution</span>
                                        <span>{formatCurrency(payroll.pfDeduction)}</span>
                                    </div>
                                    {payroll.professionalTax > 0 && (
                                        <div className="flex justify-between items-center text-gray-700 font-medium">
                                            <span>Professional Tax</span>
                                            <span>{formatCurrency(payroll.professionalTax)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-gray-700 font-medium">
                                        <span>Tax (TDS)</span>
                                        <span>{formatCurrency(payroll.taxDeduction)}</span>
                                    </div>
                                    {payroll.lopDeduction > 0 && (
                                        <div className="flex justify-between items-center text-gray-700 font-medium">
                                            <span>Loss of Pay (LOP)</span>
                                            <span className="text-rose-600">
                                                {formatCurrency(payroll.lopDeduction)}
                                            </span>
                                        </div>
                                    )}
                                    {payroll.otherDeductions > 0 && (
                                        <div className="flex justify-between items-center text-gray-700 font-medium">
                                            <span>Other Deductions</span>
                                            <span className="text-rose-600">{formatCurrency(payroll.otherDeductions)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total Deductions</span>
                                    <span className="font-bold text-rose-600">{formatCurrency(payroll.totalDeductions)}</span>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeePayroll;
