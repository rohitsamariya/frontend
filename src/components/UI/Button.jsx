import React from 'react';

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const variantClass = variants[variant] || variants.primary;
    return (
        <button className={`btn ${variantClass} ${className}`} {...props}>
            {children}
        </button>
    );
};

export default Button;
