import React from 'react';

const DocumentPreviewModal = ({ isOpen, onClose, docUrl, docType }) => {
    if (!isOpen) return null;

    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(docUrl);

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{docType} Preview</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
                    {isImage ? (
                        <img
                            src={docUrl.startsWith('http') ? docUrl : `${(import.meta.env.VITE_API_URL || '').replace('/api', '')}${docUrl}`}
                            alt={docType}
                            className="max-w-full max-h-full object-contain shadow-lg"
                        />
                    ) : (
                        <div className="text-center py-12">
                            <div className="bg-indigo-100 p-6 rounded-full inline-block mb-4">
                                <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-800 mb-2">PDF Document</h4>
                            <p className="text-gray-600 mb-6">This document cannot be previewed directly here.</p>
                            <a
                                href={docUrl.startsWith('http') ? docUrl : `${(import.meta.env.VITE_API_URL || '').replace('/api', '')}${docUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                                </svg>
                                Open in New Tab
                            </a>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
