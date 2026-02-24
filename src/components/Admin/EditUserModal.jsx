import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import branchService from '../../services/branchService';
import Button from '../UI/Button';

const EditUserModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [formData, setFormData] = useState({
        name: '',
        role: '',
        branch: '',
        shift: ''
    });
    const [branches, setBranches] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initialFormData = useMemo(() => ({
        name: user?.name || '',
        role: user?.role || '',
        branch: user?.branch?._id || user?.branch || '',
        shift: user?.shift?._id || user?.shift || ''
    }), [user]);

    useEffect(() => {
        if (isOpen && user) {
            setFormData(initialFormData);
            fetchDependencies();
        }
    }, [isOpen, user, initialFormData]);

    const fetchDependencies = async () => {
        try {
            const branchData = await branchService.getBranches('active');
            setBranches(branchData || []);

            const shiftRes = await api.get('/shifts');
            setShifts(shiftRes.data.data || []);
        } catch (err) {
            console.error("Failed to load branches/shifts", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isChanged = useMemo(() => {
        return JSON.stringify(formData) !== JSON.stringify(initialFormData);
    }, [formData, initialFormData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.put(`/admin/users/${user._id}`, formData);
            if (res.data.success) {
                onSuccess && onSuccess(res.data.data);
                onClose();
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update user");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Edit User Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-start space-x-2">
                            <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Employee Name"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address (Read-only)</label>
                            <input
                                type="text"
                                value={user?.email}
                                disabled
                                className="w-full px-4 py-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                                required
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="HR">HR</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>

                        {formData.role !== 'ADMIN' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Branch</label>
                                    <select
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                        required
                                    >
                                        <option value="" disabled>Select Branch</option>
                                        {branches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.role === 'EMPLOYEE' && (
                                    <div className="animate-in slide-in-from-right duration-300">
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Shift</label>
                                        <select
                                            name="shift"
                                            value={formData.shift}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                            required
                                        >
                                            <option value="" disabled>Select Shift</option>
                                            {shifts.map(s => (
                                                <option key={s._id} value={s._id}>{s.name} ({s.startTime}-{s.endTime})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                        <Button variant="secondary" onClick={onClose} type="button" className="px-6">Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading || !isChanged}
                            className={`px-8 transition-all ${!isChanged ? 'opacity-50 cursor-not-allowed shadow-none' : 'shadow-lg shadow-indigo-200'}`}
                        >
                            {loading ? (
                                <div className="flex items-center space-x-2">
                                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saving...</span>
                                </div>
                            ) : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditUserModal;
