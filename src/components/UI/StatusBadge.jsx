import React from 'react';

const StatusBadge = ({ status, variant, className = '' }) => {
    // If a variant is explicitly provided, use it.
    // Otherwise, try to infer the variant from the status string.
    let resolvedVariant = variant;

    if (!resolvedVariant && status) {
        const lowerStatus = status.toString().toLowerCase();
        if (lowerStatus === 'active' || lowerStatus === 'present' || lowerStatus === 'approved') {
            resolvedVariant = 'success';
        } else if (lowerStatus === 'warning' || lowerStatus === 'late' || lowerStatus === 'onboarding' || lowerStatus === 'half-day') {
            resolvedVariant = 'warning';
        } else if (lowerStatus === 'danger' || lowerStatus === 'critical' || lowerStatus === 'absent' || lowerStatus === 'deactivated') {
            resolvedVariant = 'danger';
        } else {
            resolvedVariant = 'neutral';
        }
    }

    // Define the styles directly matching the Admin UI badge implementations
    const styles = {
        success: {
            bg: "bg-emerald-50 text-emerald-600 border border-emerald-100",
            dot: "bg-emerald-500"
        },
        warning: {
            bg: "bg-orange-50 text-orange-600 border border-orange-100", // Admin uses orange for warnings/onboarding
            dot: "bg-orange-500"
        },
        danger: {
            bg: "bg-red-50 text-red-600 border border-red-100",
            dot: "bg-red-500"
        },
        info: {
            bg: "bg-blue-50 text-blue-600 border border-blue-100",
            dot: "bg-blue-500"
        },
        neutral: {
            bg: "bg-gray-50 text-gray-600 border border-gray-200",
            dot: "bg-gray-400"
        }
    };

    const variantStyle = styles[resolvedVariant] || styles.neutral;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${variantStyle.bg} ${className}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${variantStyle.dot}`}></div>
            {status}
        </span>
    );
};

export default StatusBadge;
