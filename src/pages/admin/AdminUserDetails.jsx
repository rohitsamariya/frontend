import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import branchService from '../../services/branchService';
import PageHeader from "../../components/UI/PageHeader";
import Card from "../../components/UI/Card";
import Button from "../../components/UI/Button";
import { useAuth } from '../../context/AuthContext';
import DocumentPreviewModal from '../../components/Admin/DocumentPreviewModal';
import { IdCard, CreditCard, Landmark, GraduationCap, FileText, CheckCircle2, XCircle } from 'lucide-react';

const DOC_LABELS = {
    AADHAAR: 'Aadhaar Card',
    PAN: 'PAN Card',
    BANK_PROOF: 'Bank Proof',
    EDUCATION: 'Education Certificate',
    LICENCE: 'Licence / Certificate'
};

const DOC_ICONS = {
    AADHAAR: <IdCard size={24} className="text-indigo-500" />,
    PAN: <CreditCard size={24} className="text-blue-500" />,
    BANK_PROOF: <Landmark size={24} className="text-emerald-500" />,
    EDUCATION: <GraduationCap size={24} className="text-amber-500" />,
    LICENCE: <FileText size={24} className="text-gray-500" />
};

const AdminUserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({});

    const [branches, setBranches] = useState([]);
    const [shifts, setShifts] = useState([]);

    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingDoc, setUploadingDoc] = useState(null);
    const [preview, setPreview] = useState({ isOpen: false, url: '', type: '' });

    const imageInputRef = useRef(null);
    const docInputRef = useRef(null);

    useEffect(() => {
        fetchUserData();
        loadFormData();
    }, [id]);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/users/${id}`);
            setUserData(res.data.data);
            setEditData(res.data.data);
        } catch (error) {
            console.error("Error fetching user data", error);
        } finally {
            setLoading(false);
        }
    };

    const loadFormData = async () => {
        try {
            const [bRes, sRes] = await Promise.all([
                branchService.getBranches('active'),
                api.get('/shifts')
            ]);
            setBranches(bRes);
            setShifts(sRes.data.data || []);
        } catch (err) {
            console.error("Error loading form dependencies", err);
        }
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setEditData(prev => ({ ...prev, [parent]: { ...prev[parent], [child]: val } }));
        } else {
            setEditData(prev => ({ ...prev, [name]: val }));
        }
    };

    const handleSave = async () => {
        try {
            const payload = {
                name: editData.name, role: editData.role,
                branch: editData.branch?._id || editData.branch,
                shift: editData.shift?._id || editData.shift,
                phoneNumber: editData.phoneNumber, dateOfBirth: editData.dateOfBirth,
                gender: editData.gender, address: editData.address,
                emergencyContact: editData.emergencyContact, bankDetails: editData.bankDetails,
                aadhaarNumber: editData.aadhaarNumber, panNumber: editData.panNumber,
                isPfEligible: editData.isPfEligible, monthlyCTC: editData.monthlyCTC // treating monthlyCTC as Gross Salary
            };
            await api.patch(`/admin/users/${id}`, payload);
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
        const formData = new FormData();
        formData.append('profileImage', file);
        setUploadingImage(true);
        try {
            await api.post(`/admin/users/${id}/profile-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            fetchUserData();
        } catch (error) { alert("Failed to upload image"); }
        finally { setUploadingImage(false); }
    };

    const handleDocUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingDoc) return;
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', uploadingDoc);
        try {
            await api.post(`/admin/users/${id}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploadingDoc(null);
            fetchUserData();
        } catch (error) { alert("Failed to upload document"); }
    };

    const maskValue = (value, type) => {
        if (!value) return 'Not Provided';
        if (type === 'aadhaar') return `XXXX-XXXX-${value.slice(-4)}`;
        if (type === 'bank') return `XXXX-XXXX-${value.slice(-4)}`;
        return value;
    };

    const formatAddress = (addr) => {
        if (!addr?.line1) return 'N/A';
        const parts = [addr.line1, addr.city, addr.state, addr.pincode].filter(Boolean);
        return parts.join(', ');
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Profile Dossier...</div>;
    if (!userData) return <div className="p-8 text-center text-red-500">User not found</div>;

    const stats = userData.attendanceSummary || { totalPresent: 0, totalHalfDays: 0, totalAbsent: 0 };
    const apiBase = import.meta.env.VITE_API_URL.replace('/api', '');

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* TOP BAR */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <PageHeader title="Employee Dossier" />
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="secondary" onClick={() => navigate('/admin/users')} className="flex-1 sm:flex-none">Back to List</Button>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} className="flex-1 sm:flex-none">Edit Profile</Button>
                    ) : (
                        <div className="inline-flex space-x-2 flex-1 sm:flex-none justify-end">
                            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
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
                            <div className="w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl">
                                {userData.profileImage ? (
                                    <img src={`${apiBase}${userData.profileImage}`} alt={userData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-linear-to-br from-slate-100 to-teal-100 text-slate-700">
                                        {userData.name.charAt(0)}
                                    </div>
                                )}
                                {uploadingImage && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}
                            </div>
                            <button onClick={() => imageInputRef.current.click()}
                                className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-lg shadow-md text-gray-500 hover:text-indigo-600 transition-colors border border-gray-200">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </button>
                            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        {/* Name & Info */}
                        <div className="flex-1 pt-2">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h2 className="text-2xl font-extrabold text-gray-900">{userData.name}</h2>
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${userData.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {userData.status}
                                </span>
                                <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-bold uppercase tracking-wide">
                                    {userData.role}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm">{userData.email}</p>
                        </div>

                        {/* Quick Info Pills */}
                        <div className="flex flex-wrap gap-2 pb-1">
                            {userData.branch?.name && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    {userData.branch.name}
                                </span>
                            )}
                            {userData.shift?.name && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {userData.shift.name} ({userData.shift.startTime}-{userData.shift.endTime})
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                Joined {new Date(userData.createdAt).toLocaleDateString()}
                            </span>
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
                                        <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                        <input name="name" value={editData.name} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Phone Number</label>
                                        <input name="phoneNumber" value={editData.phoneNumber || ''} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Date of Birth</label>
                                        <input type="date" name="dateOfBirth" value={editData.dateOfBirth ? new Date(editData.dateOfBirth).toISOString().split('T')[0] : ''} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Gender</label>
                                        <select name="gender" value={editData.gender || ''} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 bg-transparent text-sm">
                                            <option value="">Select</option>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Aadhaar Number</label>
                                        <input name="aadhaarNumber" value={editData.aadhaarNumber || ''} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" maxLength="12" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">PAN Number</label>
                                        <input name="panNumber" value={editData.panNumber || ''} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" />
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
                                    <DetailItem label="Date of Birth" value={userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : 'N/A'} />
                                    <DetailItem label="Gender" value={userData.gender || 'N/A'} />
                                    <DetailItem label="Phone" value={userData.phoneNumber || 'N/A'} />
                                    <DetailItem label="Aadhaar" value={userData.aadhaarNumber || 'N/A'} />
                                    <DetailItem label="PAN" value={userData.panNumber || 'N/A'} />
                                    <div></div>
                                    <div className="md:col-span-3">
                                        <DetailItem label="Address" value={formatAddress(userData.address)} />
                                    </div>
                                    <div className="md:col-span-3">
                                        <DetailItem label="Emergency Contact" value={userData.emergencyContact?.name ? `${userData.emergencyContact.name} (${userData.emergencyContact.relation}) - ${userData.emergencyContact.phone}` : 'N/A'} />
                                    </div>
                                </>
                            )}
                        </div>
                    </Card>

                    {/* PAYROLL & BANKING */}
                    <Card title="Payroll & Banking">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Gross Salary</label>
                                        <input type="number" name="monthlyCTC" value={editData.monthlyCTC || 0} onChange={handleEditChange} className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 text-sm" />
                                        <p className="text-[10px] text-gray-400 mt-1">Basic(50%), HRA(25%), DA(12.5%), Special(12.5%)</p>
                                    </div>
                                    <div className="flex items-center space-x-2 pt-4">
                                        <input type="checkbox" name="isPfEligible" checked={!!editData.isPfEligible} onChange={handleEditChange} className="w-5 h-5 text-indigo-600 rounded" />
                                        <label className="text-sm font-bold text-gray-700">PF Eligible</label>
                                    </div>
                                    <div className="md:col-span-2 space-y-4 pt-4 border-t">
                                        <h4 className="text-xs font-bold text-indigo-500 uppercase">Bank Account Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <input name="bankDetails.accountHolderName" value={editData.bankDetails?.accountHolderName || ''} onChange={handleEditChange} placeholder="Account Holder Name" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                            <input name="bankDetails.bankName" value={editData.bankDetails?.bankName || ''} onChange={handleEditChange} placeholder="Bank Name" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                            <input name="bankDetails.accountNumber" value={editData.bankDetails?.accountNumber || ''} onChange={handleEditChange} placeholder="Account Number" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                            <input name="bankDetails.ifscCode" value={editData.bankDetails?.ifscCode || ''} onChange={handleEditChange} placeholder="IFSC Code" className="border-b-2 border-gray-200 outline-none py-1.5 text-sm" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <DetailItem label="Gross Salary" value={`₹${userData.monthlyCTC?.toLocaleString() || 0}`} />
                                    <DetailItem label="PF Eligible" value={userData.isPfEligible ? <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-500" /> Yes</span> : <span className="flex items-center gap-1.5"><XCircle size={16} className="text-red-500" /> No</span>} />
                                    <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                                        <DetailItem label="Bank Name" value={userData.bankDetails?.bankName || 'N/A'} />
                                        <DetailItem label="Account Holder" value={userData.bankDetails?.accountHolderName || 'N/A'} />
                                        <DetailItem label="Account Number" value={userData.bankDetails?.accountNumber || 'N/A'} />
                                        <DetailItem label="IFSC Code" value={userData.bankDetails?.ifscCode || 'N/A'} />
                                    </div>
                                    {(userData.uanNumber || userData.pfAccountNumber) && (
                                        <div className="md:col-span-2 grid grid-cols-2 gap-4 pt-4 border-t">
                                            <DetailItem label="UAN Number" value={userData.uanNumber || 'N/A'} />
                                            <DetailItem label="PF Account Number" value={userData.pfAccountNumber || 'N/A'} />
                                        </div>
                                    )}
                                </>
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
                                            <button onClick={() => { setUploadingDoc(type); docInputRef.current.click(); }}
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg" title={doc ? 'Replace' : 'Upload'}>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            <input type="file" ref={docInputRef} className="hidden" accept=".pdf,image/*" onChange={handleDocUpload} />
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
                            <StatBox label="Violations" value={userData.totalViolations || 0} color="purple" />
                        </div>
                    </Card>

                    {/* WORK ASSIGNMENT */}
                    <Card title="Work Assignment">
                        <div className="space-y-5">
                            {isEditing ? (
                                <>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Role</label>
                                        <select name="role" value={editData.role} onChange={handleEditChange} disabled={userData._id === currentUser._id}
                                            className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 bg-transparent text-sm">
                                            <option value="EMPLOYEE">Employee</option>
                                            <option value="TEAM_LEADER">Team Leader</option>
                                            <option value="HR">HR</option>
                                            <option value="MANAGER">Manager</option>
                                            <option value="ADMIN">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Branch</label>
                                        <select name="branch" value={editData.branch?._id || editData.branch || ''} onChange={handleEditChange} disabled={editData.role === 'ADMIN'}
                                            className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 bg-transparent text-sm">
                                            <option value="">Select Branch</option>
                                            {branches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Shift</label>
                                        <select name="shift" value={editData.shift?._id || editData.shift || ''} onChange={handleEditChange} disabled={editData.role !== 'EMPLOYEE'}
                                            className="w-full border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-1.5 bg-transparent text-sm">
                                            <option value="">Select Shift</option>
                                            {shifts.map(s => <option key={s._id} value={s._id}>{s.name} ({s.startTime}-{s.endTime})</option>)}
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <DetailItem label="Role" value={userData.role} />
                                    <DetailItem label="Branch" value={userData.branch?.name || 'Unassigned'} />
                                    <DetailItem label="Shift" value={userData.shift?.name ? `${userData.shift.name} (${userData.shift.startTime}-${userData.shift.endTime})` : 'Unassigned'} />
                                    <DetailItem label="Joining Date" value={new Date(userData.createdAt).toLocaleDateString()} />

                                    <div className="pt-4 border-t grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <p className="text-xl font-bold text-gray-800">
                                                {userData.isPostProbation ? (userData.availableLeaves || 0) : (userData.lateCount || 0)}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">
                                                {userData.isPostProbation ? "Balance Leaves" : "Late Count"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-gray-800">
                                                {userData.isPostProbation ? (userData.leavesTaken || 0) : (userData.earlyExitCount || 0)}
                                            </p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">
                                                {userData.isPostProbation ? "Leaves Taken" : "Early Exits"}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
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

export default AdminUserDetails;
