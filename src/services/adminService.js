import api from './api';

const adminService = {
    // Dashboard Stats
    getDashboardStats: async () => {
        try {
            const response = await api.get('/admin/dashboard/overview');
            return response.data.data;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    },

    // Branch Performance
    getBranchPerformance: async () => {
        try {
            const response = await api.get('/admin/dashboard/branch-performance');
            return response.data.data;
        } catch (error) {
            console.error("Error fetching branch performance:", error);
            throw error;
        }
    },

    // Pending User Approvals
    getPendingUsers: async () => {
        try {
            const response = await api.get('/admin/pending');
            return response.data.data;
        } catch (error) {
            console.error("Error fetching pending users:", error);
            throw error;
        }
    },

    // Approve User
    approveUser: async (userId) => {
        try {
            const response = await api.put(`/admin/approve/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error approving user:", error);
            throw error;
        }
    },

    // Reject User
    rejectUser: async (userId) => {
        try {
            const response = await api.put(`/admin/reject/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error rejecting user:", error);
            throw error;
        }
    }
};

export default adminService;
