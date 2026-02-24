import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // AuthContext.jsx
    useEffect(() => {
        const checkOnboarding = (u) => {
            if (u && u.role === 'EMPLOYEE' && u.status === 'ONBOARDING') {
                const step = u.onboardingStep || 1;
                const currentPath = window.location.pathname;
                if (!currentPath.startsWith(`/onboarding/step/`)) {
                    window.location.href = `/onboarding/step/${step}`;
                }
            }
        };

        const fetchUser = async () => {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const { data } = await api.get("/auth/me");
                    const userData = data.data; // Backend returns { success: true, data: user }
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                    checkOnboarding(userData);
                } catch (e) {
                    console.error("Error restoring session", e);
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, []);

    const login = async (credentials) => {
        try {
            const { data } = await api.post("/auth/login", credentials);
            localStorage.setItem("token", data.token);

            let userData = data.user;
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            return { user: userData, redirectTo: data.redirectTo };
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        window.location.href = "/login";
    };

    const setAuthenticatedUser = (token, userData) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, setAuthenticatedUser, isAuthenticated: !!user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
