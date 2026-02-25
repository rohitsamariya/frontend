import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import DataTable from "../../components/UI/DataTable";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import InviteModal from "../../components/Admin/InviteModal";
import EditUserModal from "../../components/Admin/EditUserModal";
import { CircleDot } from 'lucide-react';

const UserList = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('active');

    const [activeUsers, setActiveUsers] = useState([]);
    const [deactivatedUsers, setDeactivatedUsers] = useState([]);
    const [invitedUsers, setInvitedUsers] = useState([]);
    const [onboardingUsers, setOnboardingUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedInvite, setSelectedInvite] = useState(null);

    useEffect(() => {
        if (activeTab === 'active') fetchActiveUsers();
        else if (activeTab === 'deactivated') fetchDeactivatedUsers();
        else if (activeTab === 'invited') fetchInvites();
        else if (activeTab === 'onboarding') fetchOnboardingUsers();
    }, [activeTab]);

    const fetchActiveUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users?status=active');
            setActiveUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch active users", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDeactivatedUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users?status=deactivated');
            setDeactivatedUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch deactivated users", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvites = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/invites');
            setInvitedUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch invites", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOnboardingUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users?status=onboarding');
            setOnboardingUsers(res.data.data);
        } catch (error) {
            console.error("Failed to fetch onboarding users", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReactivate = async (id) => {
        if (!window.confirm("Are you sure you want to reactivate this user?")) return;
        try {
            await api.patch(`/admin/users/${id}/reactivate`);
            fetchDeactivatedUsers();
            alert("User reactivated successfully!");
        } catch (error) {
            alert(error.response?.data?.error || "Failed to reactivate user");
        }
    };

    const handleCancelInvite = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this invite? The link will become invalid.")) return;
        try {
            await api.delete(`/admin/invite/${id}`);
            fetchInvites();
        } catch (error) {
            alert(error.response?.data?.error || "Failed to cancel invite");
        }
    };

    const handleResendInvite = async (id, isInviteModel = true) => {
        try {
            if (isInviteModel) {
                await api.post(`/admin/invite/${id}/resend`);
            } else {
                // For users in onboarding, we might need a different endpoint or use the user ID
                // But since invite uses OfferInvite ID, let's stick to that for now if possible
                // Actually, let's just implement it for the Invited tab first as requested
                alert("Resend feature primarily for invited tab currently.");
                return;
            }
            alert("Invitation email resent successfully!");
        } catch (error) {
            alert(error.response?.data?.error || "Failed to resend invite");
        }
    };

    const handleDeactivate = async (id) => {
        if (!window.confirm("Are you sure you want to deactivate this user?")) return;
        try {
            await api.patch(`/admin/users/${id}/deactivate`);
            if (activeTab === 'active') fetchActiveUsers();
            else if (activeTab === 'onboarding') fetchOnboardingUsers();
            alert("User deactivated successfully!");
        } catch (error) {
            alert(error.response?.data?.error || "Failed to deactivate user");
        }
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditInvite = (invite) => {
        setSelectedInvite(invite);
        setIsInviteModalOpen(true);
    };

    const handleEditSuccess = () => {
        if (activeTab === 'active') fetchActiveUsers();
        else if (activeTab === 'onboarding') fetchOnboardingUsers();
    };

    const handleInviteSuccess = () => {
        if (activeTab === 'invited') fetchInvites();
        setSelectedInvite(null);
    };

    // ─── Column Definitions ────────────────────────────

    const activeColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email', className: 'hidden md:table-cell' },
        { header: 'Role', accessor: 'role', className: 'hidden sm:table-cell' },
        { header: 'Branch', accessor: 'branch', render: (row) => row.branch?.name || 'N/A', className: 'hidden lg:table-cell' },
        {
            header: 'System Access',
            accessor: 'isActive',
            render: () => <Badge variant="success">Active</Badge>
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (row) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/users/${row._id}`)}>View</Button>
                    <Button size="sm" variant="primary" onClick={() => handleEditUser(row)} className="hidden sm:inline-block">Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeactivate(row._id)} className="hidden sm:inline-block">Deactivate</Button>
                </div>
            )
        }
    ];

    const deactivatedColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        { header: 'Branch', accessor: 'branch', render: (row) => row.branch?.name || 'N/A' },
        {
            header: 'Status',
            accessor: 'status',
            render: () => <Badge variant="danger">Deactivated</Badge>
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (row) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="success" onClick={() => handleReactivate(row._id)}>Reactivate</Button>
                </div>
            )
        }
    ];

    const invitedColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        { header: 'Branch', accessor: 'branch', render: (row) => row.branch?.name || 'N/A' },
        {
            header: 'Status',
            accessor: 'isActive',
            render: () => <Badge variant="warning">Pending</Badge>
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (row) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => {
                        const link = `${window.location.origin}/register?token=${row.rawToken}&email=${row.email}`;
                        navigator.clipboard.writeText(link);
                        alert('Link copied!');
                    }}>Link</Button>
                    <Button size="sm" variant="success" onClick={() => handleResendInvite(row._id)}>Resend</Button>
                    <Button size="sm" variant="primary" onClick={() => handleEditInvite(row)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleCancelInvite(row._id)}>Cancel</Button>
                </div>
            )
        }
    ];

    const onboardingColumns = [
        { header: 'Name', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', accessor: 'role' },
        { header: 'Branch', accessor: 'branch', render: (row) => row.branch?.name || 'N/A' },
        {
            header: 'Onboarding Progress',
            accessor: 'onboardingStep',
            render: (row) => {
                const step = row.onboardingStep || 1;
                const percentage = Math.round((step / 7) * 100);
                return (
                    <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-yellow-500 h-2 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                            Step {step} / 7
                        </span>
                    </div>
                );
            }
        },
        {
            header: 'Status',
            accessor: 'status',
            render: () => (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <CircleDot size={12} className="text-amber-500" /> In Progress
                </span>
            )
        },
        {
            header: 'Actions',
            accessor: '_id',
            render: (row) => (
                <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/users/${row._id}`)}>View</Button>
                    <Button size="sm" variant="primary" onClick={() => handleEditUser(row)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeactivate(row._id)}>Deactivate</Button>
                </div>
            )
        }
    ];

    // ─── Tab Config ────────────────────────────────────

    const tabs = [
        { key: 'active', label: 'Active Users' },
        { key: 'deactivated', label: 'Deactivated Users' },
        { key: 'onboarding', label: 'Onboarding Incomplete' },
        { key: 'invited', label: 'Invited (Pending Registration)' },
    ];

    const tabContent = {
        active: { columns: activeColumns, data: activeUsers },
        deactivated: { columns: deactivatedColumns, data: deactivatedUsers },
        invited: { columns: invitedColumns, data: invitedUsers },
        onboarding: { columns: onboardingColumns, data: onboardingUsers },
    };

    const currentTab = tabContent[activeTab];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <PageHeader title="User Management" />
                <Button onClick={() => setIsInviteModalOpen(true)}>+ Invite Employee</Button>
            </div>

            <div className="mb-4 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`${activeTab === tab.key
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <Card>
                {loading ? (
                    <div className="p-8 text-center">Loading...</div>
                ) : (
                    <DataTable columns={currentTab.columns} data={currentTab.data} />
                )}
            </Card>

            <InviteModal
                isOpen={isInviteModalOpen}
                onClose={() => {
                    setIsInviteModalOpen(false);
                    setSelectedInvite(null);
                }}
                onSuccess={handleInviteSuccess}
                initialData={selectedInvite}
            />

            <EditUserModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(null);
                }}
                onSuccess={handleEditSuccess}
                user={selectedUser}
            />
        </div>
    );
};

export default UserList;
