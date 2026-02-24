import React from 'react';
import Card from './Card';

const StatCard = ({ title, value, icon, trend, trendValue, color = 'primary' }) => {
    const colors = {
        primary: 'text-indigo-600 bg-indigo-50',
        success: 'text-emerald-600 bg-emerald-50',
        warning: 'text-amber-600 bg-amber-50',
        danger: 'text-red-600 bg-red-50',
    };

    return (
        <Card padding="p-5">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colors[color]}`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-sm font-medium text-neutral-500">{title}</p>
                    <p className="text-2xl font-semibold text-neutral-900">{value}</p>
                </div>
            </div>
            {trend && (
                <div className="mt-4 flex items-center text-sm">
                    <span className={trend === 'up' ? 'text-emerald-600' : 'text-red-600'}>
                        {trend === 'up' ? '↑' : '↓'} {trendValue}
                    </span>
                    <span className="text-neutral-500 ml-2">vs last month</span>
                </div>
            )}
        </Card>
    );
};

export default StatCard;
