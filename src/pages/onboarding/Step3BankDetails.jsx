import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/UI/Button';

const Step3BankDetails = ({ user, onSuccess, onBack }) => {
    const [formData, setFormData] = useState({
        accountHolderName: user?.bankDetails?.accountHolderName || user?.accountHolderName || '',
        bankAccountNumber: user?.bankAccountNumber || '',
        ifscCode: user?.ifscCode || '',
        bankName: user?.bankName || ''
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

        // IFSC Validation
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
            setError("Invalid IFSC format (e.g. SBIN0012345)");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post('/onboarding/step/3', {
                ...formData,
                ifscCode: formData.ifscCode.toUpperCase()
            });
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Bank Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Holder Name</label>
                        <input
                            type="text"
                            name="accountHolderName"
                            value={formData.accountHolderName}
                            onChange={handleChange}
                            required
                            placeholder="Full name as per bank account"
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                        <input
                            type="text"
                            name="bankName"
                            value={formData.bankName}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Number</label>
                        <input
                            type="text"
                            name="bankAccountNumber"
                            value={formData.bankAccountNumber}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
                        <input
                            type="text"
                            name="ifscCode"
                            value={formData.ifscCode}
                            onChange={handleChange}
                            required
                            placeholder="ABCD0123456"
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

export default Step3BankDetails;
