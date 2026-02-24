import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RoleProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    // CRITICAL: Block users who haven't finished onboarding from accessing dashboards
    if (['INVITED', 'ONBOARDING'].includes(user.status)) {
        const step = user.onboardingStep || 1;
        return <Navigate to={`/onboarding/step/${step}`} replace />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
};

export default RoleProtectedRoute;
