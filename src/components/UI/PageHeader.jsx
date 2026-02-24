import React from 'react';

const PageHeader = ({ title, actions }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
            {actions && (
                <div className="mt-4 sm:mt-0 flex space-x-3">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
