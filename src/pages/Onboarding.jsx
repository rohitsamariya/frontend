import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import OnboardingLayout from '../layouts/OnboardingLayout';
import Step1BasicInfo from './onboarding/Step1BasicInfo';
import Step2KYC from './onboarding/Step2KYC';
import Step3BankDetails from './onboarding/Step3BankDetails';
import Step4PF from './onboarding/Step4PF';
import Step5Emergency from './onboarding/Step5Emergency';
import Step6Documents from './onboarding/Step6Documents';
import Step7Declaration from './onboarding/Step7Declaration';
import Loader from '../components/UI/Loader';
import api from '../services/api';

const Onboarding = () => {
    const { stepNumber } = useParams();
    const navigate = useNavigate();
    const { user, loading, logout } = useAuth();
    const [localUser, setLocalUser] = useState(user || null);

    const stepNum = parseInt(stepNumber) || 1;

    useEffect(() => {
        if (!loading && user && !localUser) {
            setLocalUser(user);
        }
    }, [user, loading, localUser]);

    useEffect(() => {
        if (localUser) {
            // Security: If already ACTIVE, go to dashboard
            if (localUser.status === 'ACTIVE') {
                navigate('/employee/dashboard');
                return;
            }

            // Security: Prevent skipping steps
            const allowedStep = localUser.onboardingStep || 1;
            if (stepNum > allowedStep) {
                navigate(`/onboarding/step/${allowedStep}`);
            }
        }
    }, [localUser, stepNum, navigate]);

    // Use localUser if available, otherwise fall back to user from auth
    const activeUser = localUser || user;

    const handleSaveAndClose = async () => {
        try {
            await api.post('/onboarding/save-and-close');
            logout();
        } catch (err) {
            console.error("Failed to save and close:", err);
            // Even if email fails, logout the user to protect state
            logout();
        }
    };

    if (loading) return <Loader />;

    if (!activeUser) {
        // If we have a token but no user yet, wait a bit (race condition)
        if (localStorage.getItem('token')) {
            return <Loader />;
        }
        return <Navigate to="/login" replace />;
    }

    const renderStep = () => {
        const props = {
            user: activeUser,
            onSuccess: (updatedUser) => {
                setLocalUser(updatedUser);
                if (stepNum < 7) {
                    navigate(`/onboarding/step/${stepNum + 1}`);
                }
            },
            onBack: () => {
                if (stepNum > 1) {
                    navigate(`/onboarding/step/${stepNum - 1}`);
                }
            }
        };

        switch (stepNum) {
            case 1: return <Step1BasicInfo {...props} />;
            case 2: return <Step2KYC {...props} />;
            case 3: return <Step3BankDetails {...props} />;
            case 4: return <Step4PF {...props} />;
            case 5: return <Step5Emergency {...props} />;
            case 6: return <Step6Documents {...props} />;
            case 7: return <Step7Declaration {...props} />;
            default: return <Step1BasicInfo {...props} />;
        }
    };

    return (
        <OnboardingLayout currentStep={stepNum} onSaveAndClose={handleSaveAndClose}>
            {renderStep()}
        </OnboardingLayout>
    );
};

export default Onboarding;
