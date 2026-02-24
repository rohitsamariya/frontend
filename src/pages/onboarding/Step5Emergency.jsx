import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/UI/Button';

const Step5Emergency = ({ user, onSuccess, onBack }) => {
    const [formData, setFormData] = useState({
        name: user?.emergencyContact?.name || '',
        relationship: user?.emergencyContact?.relationship || '',
        phone: user?.emergencyContact?.phone || ''
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

        // Mobile validation
        if (!/^\d{10}$/.test(formData.phone)) {
            setError("Phone number must be 10 digits");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/onboarding/step/5', { emergencyContact: formData });
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Contact</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Relationship</label>
                        <input
                            type="text"
                            name="relationship"
                            value={formData.relationship}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            placeholder="e.g. Spouse, Parent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Number (10 Digits)</label>
                    <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => {
                            if (/^\d*$/.test(e.target.value) && e.target.value.length <= 10) {
                                handleChange(e);
                            }
                        }}
                        required
                        className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                    />
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="secondary" onClick={onBack} type="button">Back</Button>
                    <Button type="submit" disabled={loading} className="px-10 py-3">
                        {loading ? 'Saving...' : 'Next Step'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Step5Emergency;
