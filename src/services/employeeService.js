import api from './api';

const employeeService = {
    getProfile: async () => {
        const response = await api.get('/employee/profile');
        return response.data.data;
    },

    updateProfile: async (data) => {
        const response = await api.put('/employee/profile', data);
        return response.data.data;
    },

    uploadProfileImage: async (data) => {
        const response = await api.put('/employee/profile/image', data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    },

    getTodayDashboard: async () => {
        const response = await api.get('/employee/dashboard/today');
        return response.data.data;
    },

    getMonthlySummary: async () => {
        const response = await api.get('/employee/dashboard/monthly-summary');
        return response.data.data;
    },

    getLiveStatus: async () => {
        const response = await api.get('/employee/dashboard/live-status');
        return response.data.data;
    },

    getAttendanceHistory: async (page = 1, limit = 10, month = null, year = null, status = null) => {
        let url = `/employee/dashboard/attendance-history?page=${page}&limit=${limit}`;
        if (month && year) {
            url += `&month=${month}&year=${year}`;
        }
        if (status) {
            url += `&status=${status}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    getViolations: async (page = 1, limit = 10, month = null, year = null) => {
        let url = `/employee/dashboard/violations?page=${page}&limit=${limit}`;
        if (month && year) {
            url += `&month=${month}&year=${year}`;
        }
        const response = await api.get(url);
        return response.data;
    },

    getPayrollSummary: async (month, year) => {
        let url = '/employee/payroll';
        if (month && year) {
            url += `?month=${month}&year=${year}`;
        }
        const response = await api.get(url);
        return response.data.data;
    },

    getMyBranch: async () => {
        const response = await api.get('/employee/branch');
        return response.data.data;
    },

    getHolidays: async () => {
        const response = await api.get('/employee/holidays');
        return response.data;
    },

    // Extracted from attendance controller (via attendanceRoutes) just in case checkIn logic is needed here
    checkIn: async (data) => {
        const response = await api.post('/attendance/check-in', data);
        return response.data;
    },

    checkOut: async (data) => {
        const response = await api.post('/attendance/check-out', data);
        return response.data;
    }
};

export default employeeService;
