import api from './api';

const shiftService = {
    // Get all shifts (with optional branch filter)
    getShifts: async (branchId) => {
        try {
            const url = branchId ? `/shifts?branch=${branchId}` : '/shifts';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.error("Error fetching shifts:", error);
            throw error;
        }
    },

    // Create a new shift
    createShift: async (shiftData) => {
        try {
            const response = await api.post('/shifts', shiftData);
            return response.data;
        } catch (error) {
            console.error("Error creating shift:", error);
            throw error;
        }
    },

    // Update shift
    updateShift: async (id, shiftData) => {
        try {
            const response = await api.put(`/shifts/${id}`, shiftData);
            return response.data;
        } catch (error) {
            console.error("Error updating shift:", error);
            throw error;
        }
    }
};

export default shiftService;
