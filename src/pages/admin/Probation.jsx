import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { getMediaUrl } from '../../utils/url';
import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import DataTable from "../../components/UI/DataTable";
import { ShieldCheck, ShieldAlert, Calendar, Loader2 } from 'lucide-react';
import { DateTime } from 'luxon';

const Probation = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Fetch all active users
            const res = await api.get('/admin/users?status=active');
            // Filter out ADMIN role
            const filteredUsers = res.data.data.filter(u => u.role !== 'ADMIN');
            setUsers(filteredUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    const getProbationData = (user) => {
        // Use joiningDate if it exists, otherwise fallback to createdAt
        const joinDateJS = user.joiningDate ? new Date(user.joiningDate) : new Date(user.createdAt);
        const joinMeta = DateTime.fromJSDate(joinDateJS);
        const endDate = joinMeta.plus({ months: 6 });
        const now = DateTime.now();

        const isCompleted = now > endDate;

        return {
            joinDateStr: joinMeta.toFormat('dd LLL yyyy'),
            endDateStr: endDate.toFormat('dd LLL yyyy'),
            isCompleted
        };
    };

    const columns = [
        {
            header: 'Employee Name',
            accessor: 'name',
            render: (row) => (
                <div className="flex items-center space-x-3">
                    <div className="shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        {row.profileImage ? (
                            <img src={getMediaUrl(row.profileImage)} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                            row.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <div className="text-sm font-black text-gray-900">{row.name}</div>
                        <div className="text-xs font-semibold text-gray-500">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Role',
            accessor: 'role',
            render: (row) => (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold tracking-wider uppercase">
                    {row.role}
                </span>
            )
        },
        {
            header: 'Joining Date',
            accessor: 'joiningDate',
            render: (row) => {
                const { joinDateStr } = getProbationData(row);
                return (
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                        <Calendar size={14} className="text-gray-400" />
                        {joinDateStr}
                    </div>
                );
            }
        },
        {
            header: 'Probation End Date',
            accessor: 'endDate',
            render: (row) => {
                const { endDateStr } = getProbationData(row);
                return (
                    <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                        <Calendar size={14} className="text-indigo-400" />
                        {endDateStr}
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => {
                const { isCompleted } = getProbationData(row);
                if (isCompleted) {
                    return (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck size={14} /> Completed
                        </div>
                    );
                } else {
                    return (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <ShieldAlert size={14} /> Ongoing
                        </div>
                    );
                }
            }
        }
    ];

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6">
            <PageHeader
                title="Probation Tracking"
                subtitle="Monitor employee probation periods (6 months from joining date)."
            />

            <Card className="shadow-xs border border-gray-100">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                        <p className="text-sm font-bold text-gray-500">Loading probation data...</p>
                    </div>
                ) : (
                    <div className="p-0">
                        <DataTable
                            columns={columns}
                            data={users}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Probation;
