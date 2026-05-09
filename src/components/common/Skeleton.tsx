import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  circle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width, 
  height, 
  circle = false 
}) => {
  const style: React.CSSProperties = {
    width: width,
    height: height,
    borderRadius: circle ? '50%' : '2px',
  };

  return (
    <div 
      className={`skeleton ${className}`} 
      style={style}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ 
  rows = 10, 
  cols = 4 
}) => {
  return (
    <div className="w-full space-y-2 p-1">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-2">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton 
              key={colIndex} 
              height={24} 
              className="flex-1" 
            />
          ))}
        </div>
      ))}
    </div>
  );
};
