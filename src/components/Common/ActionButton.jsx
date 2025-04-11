import React from 'react';
import { Link } from 'react-router-dom';

const ActionButton = ({ to, onClick, children, icon: Icon, variant = 'primary', size = 'md' }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150";

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary/90 focus:ring-primary/50',
    secondary: 'bg-secondary text-white hover:bg-secondary/90 focus:ring-secondary/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    orange: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400',
    light: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300',
    outline: 'bg-white text-primary border border-primary hover:bg-primary/5 focus:ring-primary/50',
    // Add more variants as needed
  };

  const className = `${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary}`;

  const content = (
    <>
      {Icon && <Icon className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${children ? 'mr-2' : ''}`} aria-hidden="true" />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick}>
      {content}
    </button>
  );
};

export default ActionButton; 