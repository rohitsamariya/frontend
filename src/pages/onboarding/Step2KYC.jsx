import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/UI/Button';

const Step2KYC = ({ user, onSuccess, onBack }) => {
    const [formData, setFormData] = useState({
        aadhaarNumber: user?.aadhaarNumber || '',
        panNumber: user?.panNumber || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value.toUpperCase() });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Frontend validation
        if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
            setError("Aadhaar must be 12 digits");
            setLoading(false);
            return;
        }

        if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
            setError("Invalid PAN format (e.g. ABCDE1234F)");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/onboarding/step/2', formData);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">KYC Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Aadhaar Number (12 Digits)</label>
                        <input
                            type="text"
                            name="aadhaarNumber"
                            value={formData.aadhaarNumber}
                            onChange={(e) => {
                                if (/^\d*$/.test(e.target.value) && e.target.value.length <= 12) {
                                    handleChange(e);
                                }
                            }}
                            required
                            placeholder="0000 0000 0000"
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                        <input
                            type="text"
                            name="panNumber"
                            value={formData.panNumber}
                            onChange={handleChange}
                            required
                            maxLength="10"
                            placeholder="ABCDE1234F"
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border uppercase"
                        />
                    </div>
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

export default Step2KYC;
