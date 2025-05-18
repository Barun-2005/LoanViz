import React from 'react';

/**
 * ResponsiveContainer component for wrapping charts, tables, and other content
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Container content
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.enableScroll - Whether to enable horizontal scrolling
 * @param {string} props.minHeight - Minimum height of the container
 * @param {string} props.maxHeight - Maximum height of the container
 * @returns {JSX.Element} Responsive container component
 */
const ResponsiveContainer = ({
  children,
  className = '',
  enableScroll = true,
  minHeight = 'auto',
  maxHeight = 'none',
  ...props
}) => {
  // Base classes for the container
  const baseClasses = 'w-full';
  
  // Scroll classes
  const scrollClasses = enableScroll ? 'overflow-x-auto' : '';
  
  // Style object for height constraints
  const style = {
    minHeight,
    maxHeight
  };
  
  return (
    <div 
      className={`${baseClasses} ${scrollClasses} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
