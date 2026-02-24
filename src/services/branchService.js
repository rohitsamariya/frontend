import api from './api';

const branchService = {
    // Get all branches with optional status filter
    getBranches: async (status = 'active') => {
        try {
            const response = await api.get(`/branch?status=${status}`);
            return response.data.data;
        } catch (error) {
            console.error("Error fetching branches:", error);
            throw error;
        }
    },

    // Reactivate branch
    reactivateBranch: async (id) => {
        try {
            const response = await api.put(`/branch/${id}/reactivate`);
            return response.data;
        } catch (error) {
            console.error("Error reactivating branch:", error);
            throw error;
        }
    },

    // Create a new branch
    createBranch: async (branchData) => {
        try {
            const response = await api.post('/branch', branchData);
            return response.data.data;
        } catch (error) {
            console.error("Error creating branch:", error);
            throw error;
        }
    },

    // Update branch
    updateBranch: async (id, branchData) => {
        try {
            const response = await api.put(`/branch/${id}`, branchData);
            return response.data.data;
        } catch (error) {
            console.error("Error updating branch:", error);
            throw error;
        }
    },

    // Delete branch (Soft delete)
    deleteBranch: async (id) => {
        try {
            const response = await api.delete(`/branch/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting branch:", error);
            throw error;
        }
    }
};

export default branchService;
