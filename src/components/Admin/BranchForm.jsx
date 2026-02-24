import React, { useState, useEffect } from 'react';
import Button from '../UI/Button';
import BranchMap from './BranchMap';
import branchService from '../../services/branchService';

const BranchForm = ({ initialData, onSuccess, onCancel }) => {
    const isEditMode = !!initialData;

    // Initial Form State
    const [formData, setFormData] = useState({
        name: '',
        timezone: 'Asia/Kolkata',
        latitude: '',
        longitude: '',
        radiusInMeters: 100
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Populate form if modifying existing branch
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                timezone: initialData.timezone || 'Asia/Kolkata',
                latitude: initialData.latitude || '',
                longitude: initialData.longitude || '',
                radiusInMeters: initialData.radiusInMeters || 100
            });
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMapLocationChange = (lat, lng) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat.toFixed(6), // Keep precision reasonable
            longitude: lng.toFixed(6)
        }));
    };

    const validateForm = () => {
        const lat = parseFloat(formData.latitude);
        const lng = parseFloat(formData.longitude);

        if (isNaN(lat) || lat < -90 || lat > 90) return "Latitude must be between -90 and 90";
        if (isNaN(lng) || lng < -180 || lng > 180) return "Longitude must be between -180 and 180";
        if (formData.radiusInMeters <= 0) return "Radius must be greater than 0 meters";
        if (!formData.name.trim()) return "Branch Name is required";

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
            const payload = {
                ...formData,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                radiusInMeters: parseInt(formData.radiusInMeters)
            };

            if (isEditMode) {
                // Use _id for MongoDB updates
                if (branchService.updateBranch) {
                    await branchService.updateBranch(initialData._id, payload);
                } else {
                    await branchService.updateBranch(initialData._id, payload);
                }
            } else {
                await branchService.createBranch(payload);
            }

            onSuccess();
        } catch (err) {
            console.error("Form Submission Error:", err);
            setError(err.response?.data?.error || "Failed to save branch");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">{error}</div>}

            <div>
                <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Headquarters"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Timezone</label>
                <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white"
                >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                </select>
            </div>

            {/* Map Integration */}
            <BranchMap
                lat={parseFloat(formData.latitude) || null}
                lng={parseFloat(formData.longitude) || null}
                radius={parseInt(formData.radiusInMeters) || 100}
                onChange={handleMapLocationChange}
            />

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Latitude</label>
                    <input
                        type="number" step="any"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="28.6139"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Longitude</label>
                    <input
                        type="number" step="any"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="77.2090"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Geofence Radius (Meters)</label>
                <input
                    type="number"
                    name="radiusInMeters"
                    value={formData.radiusInMeters}
                    onChange={handleInputChange}
                    required
                    min="10"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <p className="mt-1 text-xs text-gray-500">Employees must be within this radius to mark attendance via mobile app.</p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : (isEditMode ? 'Update Branch' : 'Create Branch')}
                </Button>
            </div>
        </form>
    );
};

export default BranchForm;
