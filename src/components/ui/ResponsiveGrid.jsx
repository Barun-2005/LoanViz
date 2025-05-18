import React from 'react';

/**
 * ResponsiveGrid component for creating responsive grid layouts
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Grid content
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.cols - Number of columns on desktop
 * @param {number} props.tabletCols - Number of columns on tablet
 * @param {number} props.mobileCols - Number of columns on mobile
 * @param {string} props.gap - Gap between grid items
 * @returns {JSX.Element} Responsive grid component
 */
const ResponsiveGrid = ({
  children,
  className = '',
  cols = 3,
  tabletCols = 2,
  mobileCols = 1,
  gap = '4',
  ...props
}) => {
  // Base classes for the grid
  const baseClasses = 'grid';
  
  // Responsive column classes
  const colClasses = `grid-cols-${mobileCols} sm:grid-cols-${tabletCols} lg:grid-cols-${cols}`;
  
  // Gap classes
  const gapClasses = `gap-${gap}`;
  
  return (
    <div 
      className={`${baseClasses} ${colClasses} ${gapClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveGrid;
