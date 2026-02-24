import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/UI/Button';

const Step4PF = ({ user, onSuccess, onBack }) => {
    const [formData, setFormData] = useState({
        uanNumber: user?.uanNumber || '',
        pfAccountNumber: user?.pfAccountNumber || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/onboarding/step/4', formData);
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">PF & UAN Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm">
                    These fields are optional. Fill them only if you have existing PF/UAN details.
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">UAN Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                        <input
                            type="text"
                            value={formData.uanNumber}
                            onChange={(e) => setFormData({ ...formData, uanNumber: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            placeholder="12 digit UAN (if available)"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">PF Account Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                        <input
                            type="text"
                            value={formData.pfAccountNumber}
                            onChange={(e) => setFormData({ ...formData, pfAccountNumber: e.target.value })}
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                            placeholder="PF Account Number (if available)"
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

export default Step4PF;
