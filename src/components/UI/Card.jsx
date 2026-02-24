import React from 'react';

const Card = ({ children, className = '', padding = 'p-6' }) => {
    return (
        <div className={`bg-white rounded-2xl shadow-card border border-neutral-200 overflow-hidden ${padding} ${className}`}>
            {children}
        </div>
    );
};

export default Card;
