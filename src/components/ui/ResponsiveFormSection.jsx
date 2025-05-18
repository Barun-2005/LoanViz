import React from 'react';

/**
 * ResponsiveFormSection component for creating responsive form layouts
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Form section content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.direction - Direction of the form section ('row', 'column')
 * @param {string} props.gap - Gap between form elements
 * @param {boolean} props.fullWidth - Whether the form section should take full width
 * @returns {JSX.Element} Responsive form section component
 */
const ResponsiveFormSection = ({
  children,
  className = '',
  direction = 'row',
  gap = '4',
  fullWidth = false,
  ...props
}) => {
  // Base classes for the form section
  const baseClasses = 'flex';
  
  // Direction classes
  const directionClasses = {
    row: 'flex-col sm:flex-row',
    column: 'flex-col'
  };
  
  // Gap classes
  const gapClasses = {
    row: `space-y-${gap} sm:space-y-0 sm:space-x-${gap}`,
    column: `space-y-${gap}`
  };
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  return (
    <div 
      className={`${baseClasses} ${directionClasses[direction]} ${gapClasses[direction]} ${widthClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveFormSection;
