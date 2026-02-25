import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import { DateTime } from 'luxon';
import { Search, Rocket, ClipboardList, Eye, Download, Mail, CheckCircle2, XCircle, AlertCircle, Loader2, Inbox } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Payroll = () => {
    const [branches, setBranches] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [payrolls, setPayrolls] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, pages: 0 });
    const [page, setPage] = useState(1);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [actionLoading, setActionLoading] = useState({});
    const [payslipModal, setPayslipModal] = useState({ open: false, data: null, loading: false });

    const fetchBranches = async () => {
        try {
            const res = await api.get('/branch');
            setBranches(res.data.data || []);
            if (res.data.data?.length > 0) setSelectedBranch(res.data.data[0]._id);
        } catch (e) { console.error(e); }
    };

    const fetchPayrolls = useCallback(async () => {
        // Block future months — clear data and exit
        const _now = new Date();
        if (year > _now.getFullYear() || (year === _now.getFullYear() && month > _now.getMonth() + 1)) {
            setPayrolls([]); setPagination({ total: 0, pages: 0 }); return;
        }
        setLoading(true);
        try {
            const params = new URLSearchParams({
                month, year, page, limit: 10,
                ...(selectedBranch && { branchId: selectedBranch })
            });
            const res = await api.get(`/payroll?${params.toString()}`);
            setPayrolls(res.data.data || []);
            setPagination(res.data.pagination);
        } catch (e) {
            console.error(e);
            showMsg('error', 'Failed to fetch cumulative payroll register');
        } finally { setLoading(false); }
    }, [month, year, selectedBranch, page]);

    useEffect(() => { fetchBranches(); }, []);
    useEffect(() => { fetchPayrolls(); }, [fetchPayrolls]);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleRunPayroll = async () => {
        if (!selectedBranch) return showMsg('error', 'Select a branch');
        setLoading(true);
        try {
            const res = await api.post('/payroll/run-cycle', { branchId: selectedBranch, month, year });
            const type = res.data.data?.failed > 0 ? 'error' : 'success';
            showMsg(type, res.data.message);
            fetchPayrolls();
        } catch (e) {
            showMsg('error', e.response?.data?.error || 'Failed to execute payroll cycle');
        } finally { setLoading(false); }
    };

    const handleDownloadPDF = async (payrollId) => {
        if (!payrollId) return showMsg('error', 'No payroll record for this period');
        setActionLoading(prev => ({ ...prev, [`dl_${payrollId}`]: true }));
        try {
            const res = await api.get(`/payroll/${payrollId}/payslip-pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `payslip-${payrollId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) { showMsg('error', 'Failed to download PDF'); }
        finally { setActionLoading(prev => ({ ...prev, [`dl_${payrollId}`]: false })); }
    };

    const handleResendEmail = async (payrollId) => {
        if (!payrollId) return showMsg('error', 'No payroll record for this period');
        setActionLoading(prev => ({ ...prev, [`email_${payrollId}`]: true }));
        try {
            await api.post(`/payroll/${payrollId}/send-email`);
            showMsg('success', 'Salary slip emailed successfully!');
            fetchPayrolls();
        } catch (e) {
            showMsg('error', e.response?.data?.error || 'Failed to send email');
        } finally { setActionLoading(prev => ({ ...prev, [`email_${payrollId}`]: false })); }
    };

    const handleViewPayslip = async (payrollId) => {
        if (!payrollId) return showMsg('error', 'No payroll record for this period');
        setPayslipModal({ open: true, data: null, loading: true, payrollId });
        try {
            const res = await api.get(`/payroll/payslip/${payrollId}`);
            setPayslipModal({ open: true, data: res.data.data, loading: false, payrollId });
        } catch (e) {
            showMsg('error', 'Failed to load payslip details');
            setPayslipModal({ open: false, data: null, loading: false });
        }
    };

    const fmt = (n) => n != null ? `₹${Number(n).toLocaleString('en-IN')}` : '₹0';
    const formatDate = (date) => date ? DateTime.fromJSDate(new Date(date)).toFormat('dd-MMM-yyyy') : 'N/A';

    // Prevent filtering future months
    const now = new Date();
    const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1);

    return (
        <div className="max-w-[1600px] mx-auto">
            <PageHeader title="Payroll Management" subtitle="Manage branch-wide cumulative payroll and automated payouts." />

            {message.text && (
                <div className={`mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 animate-slide-in ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} className="shrink-0" /> : <XCircle size={20} className="shrink-0" />}
                    {message.text}
                </div>
            )}

            {/* Top Control Bar */}
            <Card className="mb-8 shadow-2xl border-none bg-linear-to-br from-white to-gray-50 p-8 overflow-visible">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Branch Location</label>
                            <select value={selectedBranch} onChange={e => { setSelectedBranch(e.target.value); setPage(1); }}
                                className="input-field w-full h-14 bg-white shadow-xs border-gray-100 font-bold text-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all text-base">
                                <option value="">Select Branch</option>
                                {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Payroll Month</label>
                            <select value={month} onChange={e => { setMonth(Number(e.target.value)); setPage(1); }}
                                className="input-field w-full h-14 bg-white shadow-xs border-gray-100 font-bold text-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all text-base">
                                {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Calendar Year</label>
                            <select value={year} onChange={e => { setYear(Number(e.target.value)); setPage(1); }}
                                className="input-field w-full h-14 bg-white shadow-xs border-gray-100 font-bold text-gray-700 rounded-2xl focus:ring-4 focus:ring-indigo-50 transition-all text-base">
                                {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 lg:w-auto">
                        <Button
                            onClick={() => { setPage(1); fetchPayrolls(); }}
                            disabled={loading || !selectedBranch || isFutureMonth}
                            className="h-14 px-8 bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-200 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 rounded-2xl transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Search size={20} /> FILTER
                        </Button>
                        <Button
                            onClick={handleRunPayroll}
                            disabled={loading || !selectedBranch || isFutureMonth}
                            className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 rounded-2xl transform active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <><Loader2 size={20} className="animate-spin" /> PROCESSING...</>
                            ) : (
                                <><Rocket size={20} /> RUN BRANCH CYCLE</>
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

            {isFutureMonth && (
                <div className="mb-6 p-4 rounded-2xl text-sm font-bold flex items-center gap-3 bg-amber-50 text-amber-700 border border-amber-200 animate-slide-in">
                    <AlertCircle size={20} className="shrink-0" /> You cannot filter or process payroll for future months. Please select the current or a past month.
                </div>
            )}

            {/* Main Register */}
            <Card className="overflow-hidden shadow-3xl border-none p-0 bg-white ring-black/3 rounded-[2.5rem]">
                <div className="bg-linear-to-r from-gray-50 to-white/50 border-b px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                            <span className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200"><ClipboardList size={24} /></span>
                            Monthly Payroll Registry
                        </h3>
                        <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2 ml-1">Automated Multi-Step Calculation & Dispatch Engine</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-indigo-50/50 px-6 py-3 rounded-[1.25rem] border border-indigo-100/50 flex flex-col items-center min-w-[120px]">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1">Eligible Staff</span>
                            <span className="text-2xl font-black text-indigo-700 tabular-nums leading-none">{pagination.total}</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50/30 border-b text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <th className="text-left px-4 sm:px-10 py-6">Employee</th>
                                <th className="text-left px-6 py-6 font-black hidden lg:table-cell">Joining Date</th>
                                <th className="text-right px-6 py-6 hidden md:table-cell">Monthly CTC</th>
                                <th className="text-right px-6 py-6 hidden md:table-cell">Deductions</th>
                                <th className="text-right px-4 sm:px-6 py-6 font-black text-indigo-600">Net Pay</th>
                                <th className="text-center px-6 py-6 hidden lg:table-cell">Processed Date</th>
                                <th className="text-center px-4 sm:px-6 py-6">Status</th>
                                <th className="text-center px-4 sm:px-8 py-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {payrolls.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-32">
                                        <div className="mb-6 flex justify-center opacity-20"><Inbox size={72} /></div>
                                        <h4 className="text-xl font-black text-gray-300 uppercase tracking-widest">No Records Found</h4>
                                        <p className="text-gray-400 font-medium mt-2 italic text-sm">Select a branch to view eligibility.</p>
                                    </td>
                                </tr>
                            ) : (
                                payrolls.map((row, idx) => {
                                    const { user, joiningDate, monthlyCTC, netSalary, totalDeductions, processedAt, status, payrollId } = row;
                                    const isProcessed = status === 'PROCESSED + SENT';
                                    return (
                                        <tr key={user._id} className="hover:bg-indigo-50/30 transition-all duration-300 group">
                                            <td className="px-4 sm:px-10 py-8">
                                                <div className="flex items-center gap-3 sm:gap-5">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={`${(import.meta.env.VITE_API_URL || '').replace('/api', '')}${user.profileImage}`}
                                                            alt={user.name}
                                                            className="w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-full object-cover shadow-xl shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ring-2 ring-white"
                                                        />
                                                    ) : (
                                                        <div className={`w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-full bg-linear-to-br ${idx % 2 === 0 ? 'from-indigo-600 to-indigo-700' : 'from-purple-600 to-purple-700'} text-white flex items-center justify-center font-black text-base sm:text-xl shadow-xl shadow-indigo-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 uppercase`}>
                                                            {user.name?.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-extrabold text-gray-900 leading-tight text-sm sm:text-lg mb-1">{user.name}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] sm:text-[11px] font-black text-gray-400 uppercase tracking-tight bg-gray-100 px-1.5 py-0.5 rounded">{user.employeeId}</span>
                                                            <span className="text-[9px] sm:text-[11px] font-bold text-indigo-500 hidden sm:inline">{user.department}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-gray-600 font-medium hidden lg:table-cell">{formatDate(joiningDate)}</td>
                                            <td className="px-6 py-8 text-right font-bold text-gray-500 tabular-nums hidden md:table-cell">{fmt(monthlyCTC)}</td>
                                            <td className="px-6 py-8 text-right font-bold text-red-400 tabular-nums hidden md:table-cell">{fmt(totalDeductions)}</td>
                                            <td className="px-4 sm:px-6 py-8 text-right font-black text-indigo-600 text-base sm:text-lg tabular-nums tracking-tighter">
                                                {fmt(netSalary)}
                                            </td>
                                            <td className="px-6 py-8 text-center text-gray-500 font-bold hidden lg:table-cell">
                                                {processedAt ? DateTime.fromISO(processedAt).toFormat('dd-MMM-yyyy') : '—'}
                                            </td>
                                            <td className="px-4 sm:px-6 py-8 text-center">
                                                <Badge
                                                    variant={isProcessed ? 'success' : 'warning'}
                                                    className="px-2 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black shadow-xs tracking-wider border-none ring-2 ring-white"
                                                >
                                                    {status}
                                                </Badge>
                                            </td>
                                            <td className="px-4 sm:px-8 py-8 text-center">
                                                {isProcessed && payrollId ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        {/* View Payslip */}
                                                        <button
                                                            onClick={() => handleViewPayslip(payrollId)}
                                                            className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:scale-110 transition-all duration-200 flex items-center justify-center"
                                                            title="View Payslip"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                        {/* Download PDF */}
                                                        <button
                                                            onClick={() => handleDownloadPDF(payrollId)}
                                                            disabled={actionLoading[`dl_${payrollId}`]}
                                                            className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:scale-110 transition-all duration-200 flex items-center justify-center disabled:opacity-40"
                                                            title="Download PDF"
                                                        >
                                                            {actionLoading[`dl_${payrollId}`] ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                                        </button>
                                                        {/* Resend Email */}
                                                        <button
                                                            onClick={() => handleResendEmail(payrollId)}
                                                            disabled={actionLoading[`email_${payrollId}`]}
                                                            className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 hover:scale-110 transition-all duration-200 flex items-center justify-center disabled:opacity-40"
                                                            title="Resend Salary Slip Email"
                                                        >
                                                            {actionLoading[`email_${payrollId}`] ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300 text-xs font-bold">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                }))
                            }
                        </tbody>
                    </table>
                </div>

                {pagination.pages > 1 && (
                    <div className="bg-gray-50/50 px-10 py-8 flex items-center justify-between border-t border-gray-100">
                        <div className="text-[11px] font-black text-gray-400 uppercase tracking-[0.4em]">
                            Page <span className="text-indigo-600 mx-2 text-sm">{page}</span> of {pagination.pages}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0); }} disabled={page === 1}
                                className="h-14 px-10 rounded-2xl bg-white border-2 border-gray-100 text-xs font-black text-gray-500 hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-20 shadow-xs cursor-pointer active:scale-95 flex items-center gap-2">
                                ◀ PREVIOUS
                            </button>
                            <button onClick={() => { setPage(p => Math.min(pagination.pages, p + 1)); window.scrollTo(0, 0); }} disabled={page === pagination.pages}
                                className="h-14 px-10 rounded-2xl bg-white border-2 border-gray-100 text-xs font-black text-gray-500 hover:border-indigo-600 hover:text-indigo-600 transition-all disabled:opacity-20 shadow-xs cursor-pointer active:scale-95 flex items-center gap-2">
                                NEXT ▶
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Payslip Detail Modal */}
            {payslipModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setPayslipModal({ open: false, data: null, loading: false })}>
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4 animate-slide-in" onClick={e => e.stopPropagation()}>
                        <div className="bg-linear-to-r from-indigo-600 to-purple-700 text-white px-8 py-6 rounded-t-3xl flex items-center justify-between">
                            <h3 className="text-xl font-black tracking-tight">Salary Slip</h3>
                            <button onClick={() => setPayslipModal({ open: false, data: null, loading: false })} className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg transition-colors">✕</button>
                        </div>
                        {payslipModal.loading ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center"><Loader2 size={40} className="animate-spin text-indigo-500 mb-4" /><p className="text-gray-400 font-bold">Loading payslip...</p></div>
                        ) : payslipModal.data ? (
                            <div className="p-8">
                                {(() => {
                                    const d = payslipModal.data;
                                    const emp = d.employee || {};
                                    const per = d.period || {};
                                    const earn = d.earnings || {};
                                    const ded = d.deductions || {};
                                    return (
                                        <>
                                            <div className="grid grid-cols-2 gap-6 mb-6">
                                                <div className="bg-gray-50 rounded-2xl p-5">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Employee</p>
                                                    <p className="text-lg font-extrabold text-gray-900">{emp.name || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">{emp.email || ''}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-2xl p-5">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Period</p>
                                                    <p className="text-lg font-extrabold text-gray-900">{MONTHS[(per.month || 1) - 1]} {per.year}</p>
                                                    <p className="text-sm text-gray-500">{d.branch || ''}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-8 mb-6">
                                                <div>
                                                    <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Earnings</h4>
                                                    <div className="space-y-3">
                                                        {[['Basic', earn.basic], ['HRA', earn.hra], ['DA', earn.da], ['Special Allowance', earn.specialAllowance]].map(([label, val]) => (
                                                            <div key={label} className="flex justify-between text-sm"><span className="text-gray-600">{label}</span><span className="font-bold text-gray-800 tabular-nums">{fmt(val)}</span></div>
                                                        ))}
                                                        <div className="border-t pt-3 flex justify-between text-sm font-black"><span className="text-gray-700">Gross Salary</span><span className="text-emerald-600 tabular-nums">{fmt(earn.grossSalary)}</span></div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span>Deductions</h4>
                                                    <div className="space-y-3">
                                                        {[['PF (Employee)', ded.employeePF], ['Professional Tax', ded.professionalTax], ['TDS', ded.tds], ['LOP Deduction', ded.lopDeduction]].map(([label, val]) => (
                                                            <div key={label} className="flex justify-between text-sm"><span className="text-gray-600">{label}</span><span className="font-bold text-red-500 tabular-nums">{fmt(val)}</span></div>
                                                        ))}
                                                        <div className="border-t pt-3 flex justify-between text-sm font-black"><span className="text-gray-700">Total Deductions</span><span className="text-red-600 tabular-nums">{fmt(ded.totalDeductions)}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 flex items-center justify-between">
                                                <span className="text-sm font-black text-gray-700 uppercase tracking-widest">Net Salary</span>
                                                <span className="text-3xl font-black text-indigo-700 tabular-nums">{fmt(d.netSalary)}</span>
                                            </div>
                                            <div className="mt-6 flex gap-3 justify-end">
                                                <button onClick={() => { handleDownloadPDF(payslipModal.payrollId); }} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"><Download size={18} /> Download PDF</button>
                                                <button onClick={() => { handleResendEmail(payslipModal.payrollId); }} className="px-6 py-3 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors flex items-center gap-2"><Mail size={18} /> Resend Email</button>
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slide-in {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .animate-slide-in { animation: slide-in 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .shadow-3xl { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.08); }
            `}} />
        </div>
    );
};

export default Payroll;
