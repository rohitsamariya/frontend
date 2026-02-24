import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import shiftService from '../../services/shiftService';
import branchService from '../../services/branchService';
import { useAuth } from '../../context/AuthContext';

const ShiftForm = ({ initialData, onSuccess, onCancel }) => {
    const isEditMode = !!initialData;
    const { user } = useAuth();

    // Initial Form State
    const [formData, setFormData] = useState({
        name: '',
        startTime: '09:00',
        endTime: '18:00',
        allowedLateMinutes: 15,
        allowedEarlyExitMinutes: 15,
        branch: ''
    });

    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate branches for ADMIN
    useEffect(() => {
        if (user?.role === 'ADMIN') {
            loadBranches();
        } else if (user?.branch) {
            setFormData(prev => ({ ...prev, branch: user.branch }));
        }
    }, [user]);

    const loadBranches = async () => {
        try {
            const data = await branchService.getBranches('active');
            setBranches(data);
        } catch (err) {
            console.error("Failed to load branches", err);
        }
    };

    // Populate form if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                startTime: initialData.startTime || '09:00',
                endTime: initialData.endTime || '18:00',
                allowedLateMinutes: initialData.allowedLateMinutes || 0,
                allowedEarlyExitMinutes: initialData.allowedEarlyExitMinutes || 0,
                branch: initialData.branch?._id || initialData.branch || ''
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Shift Name is required";
        if (!formData.startTime) return "Start Time is required";
        if (!formData.endTime) return "End Time is required";
        if (!formData.branch && user?.role === 'ADMIN') return "Branch is required for Admin";

        const startParts = formData.startTime.split(':').map(Number);
        const endParts = formData.endTime.split(':').map(Number);
        const startMins = startParts[0] * 60 + startParts[1];
        const endMins = endParts[0] * 60 + endParts[1];

        if (startMins >= endMins) {
            return "Start time must be before end time (Overnight shifts not currently supported)";
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            if (isEditMode) {
                await shiftService.updateShift(initialData._id, formData);
            } else {
                await shiftService.createShift(formData);
            }
            onSuccess();
        } catch (err) {
            console.error("Shift Form Error:", err);
            setError(err.response?.data?.error || "Failed to save shift");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700">Shift Name</label>
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="General Shift"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time (HH:mm)</label>
                    <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">End Time (HH:mm)</label>
                    <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Allowed Late (mins)</label>
                    <input
                        type="number"
                        name="allowedLateMinutes"
                        value={formData.allowedLateMinutes}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Allowed Early Exit (mins)</label>
                    <input
                        type="number"
                        name="allowedEarlyExitMinutes"
                        value={formData.allowedEarlyExitMinutes}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    />
                </div>
            </div>

            {user?.role === 'ADMIN' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700">Branch</label>
                    <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                    >
                        <option value="">Select Branch</option>
                        {branches.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (isEditMode ? 'Update Shift' : 'Create Shift')}
                </Button>
            </div>
        </form>
    );
};

export default ShiftForm;
