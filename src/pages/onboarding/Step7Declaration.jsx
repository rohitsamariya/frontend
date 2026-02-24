import React, { useState } from 'react';
import api from '../../services/api';
import Button from '../../components/UI/Button';
import { useAuth } from '../../context/AuthContext';

const Step7Declaration = ({ user, onBack }) => {
    const [acceptedPolicies, setAcceptedPolicies] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const { logout } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await api.post('/onboarding/step/7', { acceptedPolicies });
            if (res.data.success) {
                setShowSuccess(true);
                // The requirement says "Automatically redirect to Login page", "Clear local storage", "Force fresh authentication"
                setTimeout(() => {
                    logout();
                }, 3000);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to complete onboarding");
        } finally {
            setLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6">
                    ✓
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Onboarding Complete!</h2>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                    Your details have been successfully submitted. Your account is now active.
                    You will be redirected to the login page in a few seconds.
                </p>
                <div className="animate-pulse text-indigo-600 font-medium italic">
                    Redirecting...
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Final Declaration</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl text-blue-800 text-sm leading-relaxed">
                    <h3 className="font-bold text-blue-900 mb-2 uppercase text-xs tracking-wider">Terms & Certification</h3>
                    <p>I hereby certify that the information provided in this onboarding form is true, complete, and accurate to the best of my knowledge. I understand that any false statement or omission of material facts may be grounds for disqualification from the onboarding process or termination of employment.</p>
                    <p className="mt-4 font-semibold italic text-blue-700">By checking the box below, you agree to comply with all company policies and the code of conduct.</p>
                </div>

                <div className="flex items-start">
                    <input
                        type="checkbox"
                        role="checkbox"
                        id="acceptedPolicies"
                        checked={acceptedPolicies}
                        onChange={(e) => setAcceptedPolicies(e.target.checked)}
                        required
                        className="mt-1 h-6 w-6 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="acceptedPolicies" className="ml-4 block text-sm text-gray-700 select-none">
                        I have read and agree to all company policies, data privacy terms, and certify that all provided documentation is authentic.
                    </label>
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="secondary" onClick={onBack} type="button">Back</Button>
                    <Button type="submit" disabled={loading || !acceptedPolicies} className="px-12 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg">
                        {loading ? 'Processing...' : 'Complete Onboarding'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Step7Declaration;
