import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/UI/Button';

const Step1BasicInfo = ({ user, onSuccess }) => {
    const [formData, setFormData] = useState({
        dob: user?.dateOfBirth?.split('T')[0] || user?.dob?.split('T')[0] || '',
        gender: user?.gender || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address?.line1 || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/onboarding/step/1', { ...formData, name: user?.name });
            if (res.data.success) {
                onSuccess(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to save details");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl border border-gray-100 mb-8">
                    <div>
                        <label className="block font-medium text-gray-500 uppercase tracking-wider text-xs">Full Name</label>
                        <div className="mt-1 text-lg font-semibold text-gray-900">{user?.name}</div>
                    </div>
                    <div>
                        <label className="block font-medium text-gray-500 uppercase tracking-wider text-xs">Email Address</label>
                        <div className="mt-1 text-gray-700">{user?.email}</div>
                    </div>
                    <div>
                        <label className="block font-medium text-gray-500 uppercase tracking-wider text-xs">Role</label>
                        <div className="mt-1 text-gray-700 font-medium uppercase tracking-tight">{user?.role}</div>
                    </div>
                    <div>
                        <label className="block font-medium text-gray-500 uppercase tracking-wider text-xs">Branch</label>
                        <div className="mt-1 text-gray-700 font-medium">{user?.branch?.name || 'Main Branch'}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-gray-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                            maxLength="10"
                            placeholder="10-digit mobile number"
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border text-gray-900"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-800">Residential Address</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                            placeholder="House No, Street, Area"
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                placeholder="City"
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                placeholder="State"
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Pincode</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                                maxLength="6"
                                placeholder="6-digit pincode"
                                className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={loading} className="px-10 py-3">
                        {loading ? 'Saving...' : 'Next Step'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Step1BasicInfo;
