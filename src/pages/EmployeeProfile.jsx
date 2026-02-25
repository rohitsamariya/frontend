import React, { useState, useEffect } from 'react';
import employeeService from '../services/employeeService';
import PageHeader from "../components/UI/PageHeader";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import DocumentPreviewModal from '../components/Admin/DocumentPreviewModal';

const DOC_LABELS = {
    AADHAAR: 'Aadhaar Card',
    PAN: 'PAN Card',
    BANK_PROOF: 'Bank Proof',
    EDUCATION: 'Education Certificate',
    LICENCE: 'Licence / Certificate'
};

const DOC_ICONS = {
    AADHAAR: '🪪',
    PAN: '💳',
    BANK_PROOF: '🏦',
    EDUCATION: '🎓',
    LICENCE: '📜'
};

const EmployeeProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});
    const [preview, setPreview] = useState({ isOpen: false, url: '', type: '' });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const data = await employeeService.getProfile();
            setUserData(data);
            const profileData = data.profile || data;
            setEditData({
                phoneNumber: profileData.phoneNumber || '',
                address: {
                    line1: profileData.address?.line1 || '',
                    city: profileData.address?.city || '',
                    state: profileData.address?.state || '',
                    pincode: profileData.address?.pincode || ''
                },
                emergencyContact: {
                    name: profileData.emergencyContact?.name || '',
                    relation: profileData.emergencyContact?.relation || '',
                    phone: profileData.emergencyContact?.phone || ''
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
            await employeeService.updateProfile(editData);
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

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file");
            return;
        }

        const formData = new FormData();
        formData.append('profileImage', file);

        setUploading(true);
        try {
            await employeeService.uploadProfileImage(formData);
            await fetchUserData(); // Refresh to show new image
            alert("Profile image updated successfully!");
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
    if (!userData || !userData.profile) return <div className="p-8 text-center text-red-500">Profile data not available</div>;

    const stats = userData.attendance || { totalPresent: 0, totalHalfDays: 0, totalAbsent: 0 };
    const apiBase = (import.meta.env.VITE_API_URL || '').replace('/api', '');
    const profile = userData.profile;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* TOP BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader title="My Profile" />
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none">Edit Contact Info</Button>
                    ) : (
                        <div className="inline-flex space-x-2 flex-1 sm:flex-none justify-end">
                            <Button variant="secondary" onClick={() => { setIsEditing(false); fetchUserData(); }}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* PROFILE HEADER */}
            <Card className="p-0 overflow-hidden border-none shadow-lg">
                <div className="px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative group shrink-0">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl cursor-pointer relative ${uploading ? 'opacity-50' : 'hover:ring-4 hover:ring-indigo-100 transition-all'}`}
                            >
                                {profile.profileImage ? (
                                    <img src={`${apiBase}${profile.profileImage}`} alt={profile.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-linear-to-br from-slate-100 to-teal-100 text-slate-700">
                                        {profile.name.charAt(0)}
                                    </div>
                                )}

                                {/* Overlay on Hover */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                                    <svg className="w-6 h-6 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    <span className="text-[8px] text-white font-black uppercase tracking-widest">Change</span>
                                </div>

                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
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
                                <h1 className="text-3xl font-black tracking-tight text-gray-900">{profile.name}</h1>
                                {profile.isActive && profile.status === 'ACTIVE' && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ml-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                        Active
                                    </span>
                                )}
                            </div>
                            <p className="text-sm font-medium text-gray-500 mb-6">{profile.email} &bull; Employee ID: {profile.employeeId || profile._id.substring(profile._id.length - 6).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT COLUMN (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* PERSONAL INFORMATION */}
                    <Card title="Personal Information">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                                        <input name="phoneNumber" value={editData.phoneNumber || ''} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" />
                                    </div>
                                    <div className="md:col-span-2">
                                        {/* Spacer to push Address down nicely */}
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Address</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                                            <input name="address.line1" value={editData.address?.line1 || ''} onChange={handleEditChange} placeholder="Address" className="col-span-1 sm:col-span-2 border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                            <input name="address.city" value={editData.address?.city || ''} onChange={handleEditChange} placeholder="City" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                            <input name="address.state" value={editData.address?.state || ''} onChange={handleEditChange} placeholder="State" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                            <input name="address.pincode" value={editData.address?.pincode || ''} onChange={handleEditChange} placeholder="Pincode" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-3 space-y-2">
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
                                    <DetailItem label="Full Name" value={profile.name} />
                                    <DetailItem label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                    <DetailItem label="Gender" value={profile.gender || 'N/A'} />
                                    <DetailItem label="Phone" value={profile.phoneNumber || 'N/A'} />
                                    <DetailItem label="Aadhaar" value={profile.aadhaarNumber || 'N/A'} />
                                    <DetailItem label="PAN" value={profile.panNumber || 'N/A'} />
                                    <div className="md:col-span-3">
                                        <DetailItem label="Address" value={formatAddress(profile.address)} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <DetailItem label="Emergency Contact" value={profile.emergencyContact?.name ? `${profile.emergencyContact.name} (${profile.emergencyContact.relation}) - ${profile.emergencyContact.phone}` : 'N/A'} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* PAYROLL & BANKING */}
                    <Card title="Payroll & Banking">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <DetailItem label="Gross Salary" value={`₹${profile.monthlyCTC?.toLocaleString() || 0}`} />
                            <DetailItem label="PF Eligible" value={profile.isPfEligible ? '✅ Yes' : '❌ No'} />
                            <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                <DetailItem label="Bank Name" value={profile.bankDetails?.bankName || 'N/A'} />
                                <DetailItem label="Account Holder" value={profile.bankDetails?.accountHolderName || 'N/A'} />
                                <DetailItem label="Account Number" value={profile.bankDetails?.accountNumber || 'N/A'} />
                                <DetailItem label="IFSC Code" value={profile.bankDetails?.ifscCode || 'N/A'} />
                            </div>
                            {(profile.uanNumber || profile.pfAccountNumber) && (
                                <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-4 border-t">
                                    <DetailItem label="UAN Number" value={profile.uanNumber || 'N/A'} />
                                    <DetailItem label="PF Account Number" value={profile.pfAccountNumber || 'N/A'} />
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* DOCUMENTS */}
                    <Card title="Uploaded Documents">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {['AADHAAR', 'PAN', 'BANK_PROOF', 'EDUCATION', 'LICENCE'].map(type => {
                                const doc = userData.documents?.find(d => d.type === type);
                                return (
                                    <div key={type} className={`border rounded-xl p-4 flex items-center gap-3 transition-all hover:shadow-md ${doc ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-dashed border-gray-300'}`}>
                                        <div className="text-2xl shrink-0">{DOC_ICONS[type]}</div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{DOC_LABELS[type]}</p>
                                            {doc ? (
                                                <p className="text-[10px] text-gray-400">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                            ) : (
                                                <p className="text-[10px] text-amber-500 font-semibold">Not uploaded</p>
                                            )}
                                        </div>
                                        <div className="flex gap-0.5 shrink-0">
                                            {doc && (
                                                <>
                                                    <button onClick={() => setPreview({ isOpen: true, url: doc.fileUrl, type })}
                                                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg" title="Preview">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                                    </button>
                                                    <a href={`${apiBase}${doc.fileUrl}`} download className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="Download">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                                    </a>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN (1/3) */}
                <div className="space-y-6">

                    {/* ATTENDANCE SNAPSHOT */}
                    <Card title="Attendance Snapshot">
                        <div className="grid grid-cols-2 gap-3">
                            <StatBox label="Present" value={stats.totalPresent} color="green" />
                            <StatBox label="Half Days" value={stats.totalHalfDays} color="orange" />
                            <StatBox label="Absent" value={stats.totalAbsent} color="red" />
                            <StatBox label="Violations" value={userData.attendance?.totalViolations || 0} color="purple" />
                        </div>
                    </Card>

                    {/* WORK ASSIGNMENT */}
                    <Card title="Work Assignment">
                        <div className="space-y-5">
                            <DetailItem label="Role" value={profile.role} />
                            <DetailItem label="Branch" value={profile.branch?.name || 'Unassigned'} />
                            <DetailItem label="Shift" value={profile.shift?.name ? `${profile.shift.name} (${profile.shift.startTime}-${profile.shift.endTime})` : 'Unassigned'} />
                            <DetailItem label="Joining Date" value={new Date(profile.createdAt).toLocaleDateString()} />

                            <div className="pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xl font-bold text-gray-800">{userData.attendance?.lateCount || 0}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">
                                        {userData.attendance?.isPostProbation ? "Balance Leaves" : "Late Count"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-800">{userData.attendance?.earlyExitCount || 0}</p>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">
                                        {userData.attendance?.isPostProbation ? "Leaves Taken" : "Early Exits"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={preview.isOpen}
                onClose={() => setPreview({ ...preview, isOpen: false })}
                docUrl={preview.url}
                docType={preview.type}
            />
        </div>
    );
};

const DetailItem = ({ label, value }) => (
    <div className="space-y-0.5">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
);

const StatBox = ({ label, value, color }) => {
    const colors = {
        green: 'bg-green-50 text-green-700 border-green-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        red: 'bg-red-50 text-red-700 border-red-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200'
    };
    return (
        <div className={`p-3 rounded-xl border text-center transition-transform hover:scale-105 ${colors[color]}`}>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-[10px] uppercase font-bold tracking-tight">{label}</p>
        </div>
    );
};

export default EmployeeProfile;
