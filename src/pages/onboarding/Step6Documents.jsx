import React, { useState } from 'react';
import api from '../../services/api';
import { getMediaUrl } from '../../utils/url';
import Button from '../../components/UI/Button';

const Step6Documents = ({ user, onSuccess, onBack }) => {
    const [files, setFiles] = useState({
        aadhaarPhoto: null,
        panPhoto: null,
        bankProof: null,
        educationCert: null,
        profilePhoto: null,
        licenceCert: null
    });
    const [previews, setPreviews] = useState({
        aadhaarPhoto: user?.documents?.find(d => d.type === 'AADHAAR')?.fileUrl || null,
        panPhoto: user?.documents?.find(d => d.type === 'PAN')?.fileUrl || null,
        bankProof: user?.documents?.find(d => d.type === 'BANK_PROOF')?.fileUrl || null,
        educationCert: user?.documents?.find(d => d.type === 'EDUCATION')?.fileUrl || null,
        profilePhoto: user?.profileImage || null,
        licenceCert: user?.documents?.find(d => d.type === 'LICENCE')?.fileUrl || null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const name = e.target.name;

        if (file) {
            setFiles({ ...files, [name]: file });
            setPreviews({ ...previews, [name]: URL.createObjectURL(file) });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Validation - at least ensure we have required docs either in new files or already uploaded
        const hasDoc = (type) => user?.documents?.some(d => d.type === type);

        if ((!files.aadhaarPhoto && !hasDoc('AADHAAR')) ||
            (!files.panPhoto && !hasDoc('PAN')) ||
            (!files.bankProof && !hasDoc('BANK_PROOF')) ||
            (!files.educationCert && !hasDoc('EDUCATION'))) {
            setError("Please upload all mandatory documents (Aadhaar, PAN, Bank Proof, Education Certificate)");
            setLoading(false);
            return;
        }

        const formData = new FormData();
        if (files.aadhaarPhoto) formData.append('aadhaarPhoto', files.aadhaarPhoto);
        if (files.panPhoto) formData.append('panPhoto', files.panPhoto);
        if (files.bankProof) formData.append('bankProof', files.bankProof);
        if (files.educationCert) formData.append('educationCert', files.educationCert);
        if (files.profilePhoto) formData.append('profilePhoto', files.profilePhoto);
        if (files.licenceCert) formData.append('licenceCert', files.licenceCert);

        try {
            const res = await api.post('/onboarding/step/6', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                onSuccess(res.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to upload documents");
        } finally {
            setLoading(false);
        }
    };

    const docFields = [
        { name: 'aadhaarPhoto', label: 'Aadhaar Card Photo (Front)', required: true },
        { name: 'panPhoto', label: 'PAN Card Photo', required: true },
        { name: 'bankProof', label: 'Bank Proof (Cheque/Passbook)', required: true },
        { name: 'educationCert', label: 'Education Certificate', required: true },
        { name: 'profilePhoto', label: 'Profile Image', required: false },
        { name: 'licenceCert', label: 'Licence / Certificates (Optional)', required: false }
    ];

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Document Uploads</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                {error && <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {docFields.map(({ name, label, required }) => (
                        <div key={name} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {label} {required && <span className="text-red-500">*</span>}
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                {previews[name] ? (
                                    <img src={previews[name].startsWith('blob:') ? previews[name] : getMediaUrl(previews[name])} alt={label} className={`mx-auto h-32 object-cover mb-2 ${name === 'profilePhoto' ? 'rounded-full' : ''}`} />
                                ) : (
                                    <div className="text-gray-400 py-4 italic">
                                        {required ? 'No file selected' : 'Optional'}
                                    </div>
                                )}
                                <input type="file" name={name} onChange={handleFileChange} className="mt-2 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between pt-4">
                    <Button variant="secondary" onClick={onBack} type="button">Back</Button>
                    <Button type="submit" disabled={loading} className="px-10 py-3">
                        {loading ? 'Uploading...' : 'Next Step'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default Step6Documents;
