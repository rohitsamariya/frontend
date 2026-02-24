import React from 'react';

const variants = {
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
    primary: 'bg-indigo-100 text-indigo-800'
};

const Badge = ({ children, variant = 'neutral', className = '' }) => {
    const variantClass = variants[variant] || variants.neutral;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
