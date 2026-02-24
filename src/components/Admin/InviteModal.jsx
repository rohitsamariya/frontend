import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import branchService from '../../services/branchService';
import Button from '../UI/Button';

const InviteModal = ({ isOpen, onClose, onSuccess, initialData }) => {
    const isEditing = !!initialData;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'EMPLOYEE',
        branchId: '',
        shiftId: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                role: initialData.role || 'EMPLOYEE',
                branchId: initialData.branch?._id || initialData.branch || '',
                shiftId: initialData.shift?._id || initialData.shift || ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                role: 'EMPLOYEE',
                branchId: '',
                shiftId: ''
            });
        }
    }, [initialData, isOpen]);
    const [branches, setBranches] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [inviteLink, setInviteLink] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchDependencies();
        }
    }, [isOpen]);

    const fetchDependencies = async () => {
        try {
            // Fetch Branches (using branchService which we updated)
            const branchData = await branchService.getBranches('active');
            setBranches(branchData || []);

            // Fetch Shifts
            const shiftRes = await api.get('/shifts');
            setShifts(shiftRes.data.data || []);

            // Set defaults if creating new and options exist
            if (!initialData) {
                if (branchData && branchData.length > 0) {
                    setFormData(prev => ({ ...prev, branchId: branchData[0]._id }));
                }
                if (shiftRes.data.data && shiftRes.data.data.length > 0) {
                    setFormData(prev => ({ ...prev, shiftId: shiftRes.data.data[0]._id }));
                }
            }

        } catch (err) {
            console.error("Failed to load branches/shifts", err);
            setError("Failed to load options. Please try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setInviteLink(null);

        try {
            let res;
            if (isEditing) {
                res = await api.put(`/admin/invite/${initialData._id}`, formData);
            } else {
                res = await api.post('/admin/invite', formData);
            }

            if (res.data.success) {
                if (!isEditing) {
                    setInviteLink(res.data.registrationLink);
                } else {
                    alert("Invite updated successfully!");
                    onClose();
                }
                onSuccess && onSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to process invite");
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        alert("Link copied to clipboard!");
    };

    const resetAndClose = () => {
        setFormData({
            name: '',
            email: '',
            role: 'EMPLOYEE',
            branchId: '',
            shiftId: ''
        });
        setInviteLink(null);
        setError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Invite' : 'Invite Employee'}</h2>

                {inviteLink ? (
                    <div className="text-center">
                        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
                            <p className="font-bold">Invite Sent Successfully!</p>
                            <p className="text-sm mt-1">An email has been sent to {formData.email}.</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">You can also copy the link manually:</p>
                        <div className="flex bg-gray-100 p-2 rounded mb-4 items-center justify-between">
                            <code className="text-xs truncate mr-2">{inviteLink}</code>
                            <Button size="sm" onClick={copyLink}>Copy</Button>
                        </div>
                        <Button onClick={resetAndClose} className="w-full">Done</Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            >
                                <option value="EMPLOYEE">Employee</option>
                                <option value="MANAGER">Manager</option>
                                <option value="HR">HR</option>
                                <option value="ADMIN">Admin</option>
                                <option value="TEAM_LEADER">Team Leader</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Branch</label>
                                <select
                                    name="branchId"
                                    value={formData.branchId}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                >
                                    <option value="" disabled>Select Branch</option>
                                    {branches.map(b => (
                                        <option key={b._id} value={b._id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Shift</label>
                                <select
                                    name="shiftId"
                                    value={formData.shiftId}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    required
                                >
                                    <option value="" disabled>Select Shift</option>
                                    {shifts.map(s => (
                                        <option key={s._id} value={s._id}>{s.name} ({s.startTime}-{s.endTime})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (isEditing ? 'Update Invite' : 'Send Invite')}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default InviteModal;
