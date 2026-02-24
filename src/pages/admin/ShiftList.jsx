import React, { useEffect, useState } from 'react';
import shiftService from '../../services/shiftService';
import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import DataTable from "../../components/UI/DataTable";
import Button from "../../components/UI/Button";
import ShiftForm from '../../components/Admin/ShiftForm';

const ShiftList = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShift, setEditingShift] = useState(null);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        setLoading(true);
        try {
            const res = await shiftService.getShifts();
            setShifts(res.data);
        } catch (error) {
            console.error("Failed to fetch shifts", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (shift) => {
        setEditingShift(shift);
        setShowModal(true);
    };

    const handleSuccess = () => {
        setShowModal(false);
        setEditingShift(null);
        fetchShifts();
    };

    const columns = [
        { header: 'Shift Name', accessor: 'name' },
        {
            header: 'Time',
            accessor: 'startTime',
            render: (row) => `${row.startTime} - ${row.endTime}`
        },
        { header: 'Branch', accessor: 'branch', render: (row) => row.branch?.name || 'All', className: 'hidden sm:table-cell' },
        { header: 'Late Limit (mins)', accessor: 'allowedLateMinutes', className: 'hidden md:table-cell' },
        {
            header: 'Actions',
            accessor: '_id',
            render: (row) => (
                <div className="flex space-x-2">
                    <Button variant="secondary" size="sm" onClick={() => handleEdit(row)}>Edit</Button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <PageHeader title="Shift Management" />
                <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">+ Create Shift</Button>
            </div>

            <Card>
                {loading ? (
                    <div className="p-8 text-center">Loading Shifts...</div>
                ) : (
                    <DataTable columns={columns} data={shifts} />
                )}
            </Card>

            {/* Add/Edit Shift Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto py-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 my-auto relative shadow-xl">
                        <button
                            onClick={() => { setShowModal(false); setEditingShift(null); }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>

                        <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-100">
                            {editingShift ? 'Edit Shift' : 'Add New Shift'}
                        </h2>

                        <ShiftForm
                            initialData={editingShift}
                            onSuccess={handleSuccess}
                            onCancel={() => {
                                setShowModal(false);
                                setEditingShift(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftList;
