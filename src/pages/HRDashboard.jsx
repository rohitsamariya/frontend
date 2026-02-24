import { useEffect, useState } from "react";
import PageHeader from "../components/UI/PageHeader";
import StatCard from "../components/UI/StatCard";
import DataTable from "../components/UI/DataTable";
import Badge from "../components/UI/Badge";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import { Users, CheckCircle, CalendarDays, XCircle } from 'lucide-react';

const HRDashboard = () => {
    // Mock Data
    const stats = [
        { title: 'Total Employees', value: '1,234', icon: <Users size={20} />, color: 'primary', trend: 'up', trendValue: '12%' },
        { title: 'Present Today', value: '1,100', icon: <CheckCircle size={20} />, color: 'success', trend: 'up', trendValue: '5%' },
        { title: 'On Leave', value: '45', icon: <CalendarDays size={20} />, color: 'warning', trend: 'down', trendValue: '2%' },
        { title: 'Absent', value: '89', icon: <XCircle size={20} />, color: 'danger', trend: 'down', trendValue: '1%' },
    ];

    const attendanceData = [
        { name: 'John Doe', department: 'Engineering', status: 'PRESENT', checkIn: '09:00 AM', checkOut: ' - ' },
        { name: 'Jane Smith', department: 'HR', status: 'LATE', checkIn: '09:45 AM', checkOut: ' - ' },
        { name: 'Robert Johnson', department: 'Sales', status: 'ABSENT', checkIn: '-', checkOut: '-' },
        { name: 'Emily Davis', department: 'Marketing', status: 'PRESENT', checkIn: '08:55 AM', checkOut: '-' },
        { name: 'Michael Brown', department: 'Engineering', status: 'HALF_DAY', checkIn: '01:00 PM', checkOut: '-' },
    ];

    const columns = [
        { header: 'Employee', accessor: 'name' },
        { header: 'Department', accessor: 'department' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <Badge variant={
                    row.status === 'PRESENT' ? 'success' :
                        row.status === 'LATE' ? 'warning' :
                            row.status === 'ABSENT' ? 'danger' : 'neutral'
                }>
                    {row.status}
                </Badge>
            )
        },
        { header: 'Check In', accessor: 'checkIn' },
        { header: 'Check Out', accessor: 'checkOut' },
    ];

    return (
        <div>
            <PageHeader
                title="HR Dashboard"
                actions={<Button>Add Employee</Button>}
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Attendance Table */}
                <div className="lg:col-span-2">
                    <Card>
                        <div className="px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-medium leading-6 text-neutral-900">Today's Attendance</h3>
                        </div>
                        <DataTable columns={columns} data={attendanceData} />
                    </Card>
                </div>

                {/* Side Panel: Quick Requests */}
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <div className="px-6 py-4 border-b border-neutral-200">
                            <h3 className="text-lg font-medium leading-6 text-neutral-900">Pending Requests</h3>
                        </div>
                        <ul className="divide-y divide-neutral-200">
                            {[1, 2, 3].map((i) => (
                                <li key={i} className="px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-neutral-900">Leave Request</p>
                                        <p className="text-sm text-neutral-500">John Doe • Oct 2{i}</p>
                                    </div>
                                    <Button variant="secondary" className="text-xs px-2 py-1">View</Button>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
