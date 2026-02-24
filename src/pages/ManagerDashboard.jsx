import React from 'react';
import PageHeader from "../components/UI/PageHeader";
import StatCard from "../components/UI/StatCard";
import Card from "../components/UI/Card";
import DataTable from "../components/UI/DataTable";
import Badge from "../components/UI/Badge";
import { Users, CheckCircle, Clock, Rocket } from 'lucide-react';

const ManagerDashboard = () => {
    const stats = [
        { title: 'Team Members', value: '12', icon: <Users size={20} />, color: 'primary' },
        { title: 'Present Today', value: '10', icon: <CheckCircle size={20} />, color: 'success' },
        { title: 'Pending Leaves', value: '2', icon: <Clock size={20} />, color: 'warning' },
        { title: 'Projects', value: '4', icon: <Rocket size={20} />, color: 'info' },
    ];

    const teamData = [
        { name: 'Alice Williams', role: 'Senior Dev', status: 'Working', project: 'HRMS' },
        { name: 'Bob Smith', role: 'QA Engineer', status: 'Break', project: 'E-com' },
        { name: 'Charlie Brown', role: 'Designer', status: 'Offline', project: 'Marketing' },
    ];

    const columns = [
        { header: 'Member', accessor: 'name' },
        { header: 'Role', accessor: 'role' },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <Badge variant={
                    row.status === 'Working' ? 'success' :
                        row.status === 'Break' ? 'warning' : 'neutral'
                }>
                    {row.status}
                </Badge>
            )
        },
        { header: 'Current Project', accessor: 'project' },
    ];

    return (
        <div>
            <PageHeader title="Manager Dashboard" />

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h3 className="text-lg font-medium leading-6 text-neutral-900">Team Status</h3>
                    </div>
                    <DataTable columns={columns} data={teamData} />
                </Card>

                <Card className="lg:col-span-1">
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h3 className="text-lg font-medium leading-6 text-neutral-900">Notifications</h3>
                    </div>
                    <div className="p-6">
                        <p className="text-sm text-neutral-500">No new notifications.</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ManagerDashboard;
