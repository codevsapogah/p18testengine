import React from 'react';

/**
 * Progress bar component to show test completion percentage
 * 
 * @param {Object} props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {string} props.color - Optional custom color for the progress bar
 */
const ProgressBar = ({ progress, color = 'blue' }) => {
  // Ensure progress is within valid range
  const validProgress = Math.max(0, Math.min(100, progress));
  
  // Map color string to Tailwind classes
  const colorMap = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    orange: 'bg-orange-500',
    purple: 'bg-purple-600',
  };
  
  const barColor = colorMap[color] || 'bg-blue-600';
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <div className="text-sm font-medium text-gray-700">
          {Math.round(validProgress)}%
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-300 ease-out ${barColor}`}
          style={{ width: `${validProgress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(validProgress)}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

export default ProgressBar;