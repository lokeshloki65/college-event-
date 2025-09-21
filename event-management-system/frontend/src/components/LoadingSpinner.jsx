import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'md', 
  className = '', 
  color = 'primary',
  text = null 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-500',
    kongu: 'text-kongu-600'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <Loader2 
        className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]}`} 
      />
      {text && (
        <p className={`mt-2 text-sm ${colorClasses[color]}`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
