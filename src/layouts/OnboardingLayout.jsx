import React from 'react';
import { useAuth } from '../context/AuthContext';

const OnboardingLayout = ({ children, currentStep, onSaveAndClose }) => {
    const { logout } = useAuth();
    const totalSteps = 7;

    const steps = [
        "Basic Info",
        "KYC",
        "Bank Details",
        "PF Details",
        "Emergency",
        "Documents",
        "Declaration"
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        HRMS Company Onboarding
                    </h1>
                    <p className="mt-2 text-gray-600">Please complete all 7 steps to activate your account.</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="relative">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -translate-y-1/2 rounded-full transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                        ></div>

                        <div className="relative flex justify-between">
                            {steps.map((step, index) => {
                                const stepNum = index + 1;
                                const isCompleted = stepNum < currentStep;
                                const isActive = stepNum === currentStep;

                                return (
                                    <div key={stepNum} className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center border-4 z-10 transition-colors duration-300 ${isCompleted ? 'bg-indigo-600 border-indigo-600 text-white' :
                                                isActive ? 'bg-white border-indigo-600 text-indigo-600' :
                                                    'bg-white border-gray-200 text-gray-400'
                                                }`}
                                        >
                                            {isCompleted ? '✓' : stepNum}
                                        </div>
                                        <span className={`mt-2 text-xs font-medium hidden sm:block ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden min-h-[400px]">
                    {children}
                </div>

                {/* Footer */}
                <div className="mt-8 flex flex-col items-center space-y-2">
                    <button
                        onClick={onSaveAndClose || logout}
                        className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-6 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all"
                    >
                        Save Progress and Close
                    </button>
                    <p className="text-gray-400 text-xs italic text-center">
                        Your progress will be saved. You'll receive an email with your resume link.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
