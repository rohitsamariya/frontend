import React from 'react';

const Icons = {
    TrendingUp: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
};

const MetricCard = ({ title, value, subtext, icon: Icon, colorClass, trend, trendText = "vs last month" }) => (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{value}</h3>
                {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
            </div>
            {Icon && (
                <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon />
                </div>
            )}
        </div>
        {trend && (
            <div className="mt-4 flex items-center text-sm font-medium text-emerald-600">
                <Icons.TrendingUp />
                <span className="ml-1">{trend}</span>
                <span className="text-gray-400 ml-1 font-normal">{trendText}</span>
            </div>
        )}
    </div>
);

export default MetricCard;
