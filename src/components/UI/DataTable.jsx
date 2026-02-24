import React from 'react';

const DataTable = ({ columns, data, actions }) => {
    if (!data || data.length === 0) {
        return <div className="p-6 text-center text-neutral-500">No data available</div>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                scope="col"
                                className={`px-3 sm:px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider whitespace-nowrap ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                        {actions && <th scope="col" className="relative px-3 sm:px-6 py-3"><span className="sr-only">Actions</span></th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-neutral-50 transition-colors">
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className={`px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-neutral-700 ${col.className || ''}`}>
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}
                            {actions && (
                                <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {actions(row)}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
