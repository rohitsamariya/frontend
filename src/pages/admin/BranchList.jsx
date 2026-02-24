import React, { useEffect, useState } from 'react';
import branchService from '../../services/branchService';
import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import DataTable from "../../components/UI/DataTable";
import Button from "../../components/UI/Button";
import Badge from "../../components/UI/Badge";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import ErrorAlert from "../../components/UI/ErrorAlert";
import BranchForm from '../../components/Admin/BranchForm';
import ConfirmationModal from '../../components/UI/ConfirmationModal';

const BranchList = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    // Delete State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [branchToDelete, setBranchToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Filter State
    const [filterStatus, setFilterStatus] = useState('active'); // 'active', 'inactive', 'all'

    useEffect(() => {
        fetchBranches();
    }, [filterStatus]);

    const fetchBranches = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await branchService.getBranches(filterStatus);
            setBranches(data || []);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch branches");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setShowModal(true);
    };

    const confirmDelete = (branch) => {
        setBranchToDelete(branch);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!branchToDelete) return;
        setDeleteLoading(true);
        try {
            await branchService.deleteBranch(branchToDelete._id);
            setDeleteModalOpen(false);
            setBranchToDelete(null);
            fetchBranches(); // Refetch to prevent simple filter mismatch
        } catch (err) {
            console.error("Delete failed", err);
            alert(err.response?.data?.error || "Failed to delete branch");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleReactivate = async (branch) => {
        if (!window.confirm(`Are you sure you want to reactivate "${branch.name}"?`)) return;
        try {
            await branchService.reactivateBranch(branch._id);
            fetchBranches();
        } catch (err) {
            console.error("Reactivation failed", err);
            alert(err.response?.data?.error || "Failed to reactivate branch");
        }
    };

    const columns = [
        { header: 'Branch Name', accessor: 'name', render: (row) => <span className="capitalize font-medium">{row.name}</span> },
        { header: 'Timezone', accessor: 'timezone', className: 'hidden md:table-cell' },
        { header: 'Coordinates', accessor: 'latitude', render: (row) => `${row.latitude}, ${row.longitude}`, className: 'hidden lg:table-cell' },
        {
            header: 'Status',
            accessor: 'isActive',
            render: (row) => (
                <Badge variant={row.isActive ? 'success' : 'danger'}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            header: 'Actions',
            accessor: 'id',
            render: (row) => (
                <div className="flex space-x-2">
                    {/* Only show Edit if needed, or disable it for inactive? User said optional, keeping it enabled for flexibility */}
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>Edit</Button>

                    {row.isActive ? (
                        <Button variant="danger" size="sm" onClick={() => confirmDelete(row)}>Delete</Button>
                    ) : (
                        <Button variant="success" size="sm" onClick={() => handleReactivate(row)}>Activate</Button>
                    )}
                </div>
            )
        }
    ];

    if (loading && branches.length === 0) return <LoadingSpinner message="Loading Branches..." />;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <PageHeader title="Branch Management" />
                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {['active', 'inactive', 'all'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${filterStatus === status
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">+ Add Branch</Button>
            </div>

            {error && <ErrorAlert message={error} onRetry={fetchBranches} />}

            <Card>
                {branches.length > 0 ? (
                    <DataTable columns={columns} data={branches} />
                ) : (
                    !loading && <div className="p-8 text-center text-gray-500">No {filterStatus !== 'all' ? filterStatus : ''} branches found.</div>
                )}
            </Card>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={deleteModalOpen}
                title="Delete Branch?"
                message={`Are you sure you want to deactivate "${branchToDelete?.name}"? Existing attendance data will remain intact, but the branch will be hidden from new operations.`}
                confirmText="Deactivate"
                onConfirm={handleDelete}
                onCancel={() => setDeleteModalOpen(false)}
                isLoading={deleteLoading}
            />

            {/* Add/Edit Branch Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-auto relative shadow-xl">
                        <button
                            onClick={() => { setShowModal(false); setEditingBranch(null); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-100">
                            {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                        </h2>

                        <BranchForm
                            initialData={editingBranch}
                            onSuccess={() => {
                                setShowModal(false);
                                setEditingBranch(null);
                                fetchBranches();
                            }}
                            onCancel={() => {
                                setShowModal(false);
                                setEditingBranch(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchList;
