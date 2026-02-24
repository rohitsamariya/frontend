import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    // const { login } = useAuth(); // Context use if needed

    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');

    const [loading, setLoading] = useState(true);
    const [validInvite, setValidInvite] = useState(false);
    const [inviteData, setInviteData] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    useEffect(() => {
        const verifyInvite = async () => {
            if (!token || !emailParam) {
                setError('Invalid registration link. Missing token or email.');
                setLoading(false);
                return;
            }

            try {
                const data = await authService.verifyInvite(token, emailParam);
                setInviteData(data.data);
                setValidInvite(true);
            } catch (err) {
                setError(err.response?.data?.error || 'Invalid or expired invite link.');
            } finally {
                setLoading(false);
            }
        };

        verifyInvite();
    }, [token, emailParam]);

    const { setAuthenticatedUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        try {
            setLoading(true);
            const res = await authService.register({
                token,
                email: emailParam,
                password: formData.password
            });

            if (res.success) {
                // Update Auth Context Immediately
                setAuthenticatedUser(res.token, res.user);

                // Redirect to Onboarding
                if (res.redirectTo) {
                    navigate(res.redirectTo);
                } else {
                    navigate('/onboarding/step/1');
                }
            } else {
                navigate('/');
            }

        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl font-semibold text-gray-600">Verifying Invite...</div>
            </div>
        );
    }

    if (!validInvite) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invite</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                    <div className="text-green-500 text-5xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Submitted</h2>
                    <p className="text-gray-600 mb-6">
                        Your account has been created successfully.
                        Please wait for admin approval before logging in.
                    </p>
                    <button
                        onClick={() => window.location.href = '/onboarding/step/1'}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Continue to Onboarding
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Complete Registration
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create your account for {inviteData?.branch?.name}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                disabled
                                value={inviteData?.name || ''}
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                disabled
                                value={inviteData?.email || ''}
                                className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Role</label>
                                <input
                                    disabled
                                    value={inviteData?.role || ''}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed uppercase font-semibold"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Branch</label>
                                <input
                                    disabled
                                    value={inviteData?.branch?.name || ''}
                                    className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed font-semibold"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Assigned Shift</label>
                            <div className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500">
                                {inviteData?.shift?.name || 'Standard Shift'}
                                <span className="text-xs ml-2">
                                    ({inviteData?.shift?.startTime} - {inviteData?.shift?.endTime})
                                </span>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" class="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="New Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Registering...' : 'Register Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
