import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import PageHeader from '../../components/UI/PageHeader';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';

const AdminProfile = () => {
    const { user, updateUserContext } = useAuth();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user && user._id) {
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users/${user._id}`);
            const data = res.data.data;
            setUserData(data);
            setEditData({
                phoneNumber: data.phoneNumber || '',
                address: {
                    line1: data.address?.line1 || '',
                    city: data.address?.city || '',
                    state: data.address?.state || '',
                    pincode: data.address?.pincode || ''
                },
                emergencyContact: {
                    name: data.emergencyContact?.name || '',
                    relation: data.emergencyContact?.relation || '',
                    phone: data.emergencyContact?.phone || ''
                }
            });
        } catch (error) {
            console.error("Error fetching profile data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setEditData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: value } }));
        } else {
            setEditData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        try {
            await api.patch(`/admin/users/${user._id}`, editData);
            setIsEditing(false);
            fetchUserData();
        } catch (error) {
            console.error("Error updating profile", error);
            alert(error.response?.data?.error || "Failed to update profile");
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file");
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        setUploading(true);
        try {
            const res = await api.post(`/admin/users/${user._id}/profile-image`, formData);
            if (res.data && res.data.success) {
                updateUserContext({ profileImage: res.data.data }); // Update context to trigger sidebar update
            }
            await fetchUserData(); // Refresh to show new image
        } catch (error) {
            console.error("Error uploading image", error);
            alert(error.response?.data?.error || "Failed to upload image");
        } finally {
            setUploading(false);
        }
    };

    const formatAddress = (addr) => {
        if (!addr?.line1) return 'N/A';
        const parts = [addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean);
        return parts.join(', ');
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;
    if (!userData) return <div className="p-8 text-center text-red-500">Profile data not available</div>;

    const apiBase = (import.meta.env.VITE_API_URL || '').replace('/api', '');

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* TOP BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader title="Admin Profile" />
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none">Edit Profile</Button>
                    ) : (
                        <div className="inline-flex space-x-2 flex-1 sm:flex-none justify-end">
                            <Button variant="secondary" onClick={() => { setIsEditing(false); fetchUserData(); }}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* PROFILE HEADER */}
            <Card className="p-0 overflow-hidden border-none shadow-lg bg-indigo-50/30">
                <div className="px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-xl cursor-pointer relative ${uploading ? 'opacity-50' : 'hover:ring-4 hover:ring-indigo-200 transition-all'}`}
                            >
                                {userData.profileImage ? (
                                    <img src={`${apiBase}${userData.profileImage}`} alt={userData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-linear-to-br from-indigo-100 to-purple-100 text-indigo-700">
                                        {userData.name.charAt(0)}
                                    </div>
                                )}

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                    <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span className="text-[8px] text-white font-black uppercase tracking-widest">Change</span>
                                </div>

                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1 pt-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-2xl font-extrabold text-gray-900">{userData.name}</h2>
                                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wide">
                                    {userData.role}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">{userData.email}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* DETAILS */}
            <Card title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isEditing ? (
                        <>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                                <input name="phoneNumber" value={editData.phoneNumber || ''} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" />
                            </div>
                            <div className="lg:col-span-2"></div>
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                    <input name="address.line1" value={editData.address?.line1 || ''} onChange={handleEditChange} placeholder="Address" className="col-span-1 sm:col-span-2 border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                    <input name="address.city" value={editData.address?.city || ''} onChange={handleEditChange} placeholder="City" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                    <input name="address.state" value={editData.address?.state || ''} onChange={handleEditChange} placeholder="State" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                    <input name="address.pincode" value={editData.address?.pincode || ''} onChange={handleEditChange} placeholder="Pincode" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                </div>
                            </div>
                            <div className="md:col-span-2 lg:col-span-3 space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase">Emergency Contact</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <input name="emergencyContact.name" value={editData.emergencyContact?.name || ''} onChange={handleEditChange} placeholder="Name" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                    <input name="emergencyContact.relation" value={editData.emergencyContact?.relation || ''} onChange={handleEditChange} placeholder="Relation" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                    <input name="emergencyContact.phone" value={editData.emergencyContact?.phone || ''} onChange={handleEditChange} placeholder="Phone" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <DetailItem label="Full Name" value={userData.name} />
                            <DetailItem label="Email Address" value={userData.email} />
                            <DetailItem label="Phone" value={userData.phoneNumber || 'N/A'} />
                            <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem label="Address" value={formatAddress(userData.address)} />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <DetailItem label="Emergency Contact" value={userData.emergencyContact?.name ? `${userData.emergencyContact.name} (${userData.emergencyContact.relation}) - ${userData.emergencyContact.phone}` : 'N/A'} />
                            </div>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="space-y-0.5">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
);

export default AdminProfile;
