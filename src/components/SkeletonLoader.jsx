import React from 'react';

export const SkeletonLoader = ({ type = 'cards', count = 6 }) => {
  if (type === 'cards') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-4 border border-mint-100 shadow-sm flex flex-col items-center space-y-3">
            <div className="w-16 h-16 bg-mint-100 rounded-full"></div>
            <div className="h-4 bg-mint-100 rounded w-3/4"></div>
            <div className="h-3 bg-mint-50 rounded w-1/2"></div>
            <div className="flex space-x-2 w-full pt-2">
              <div className="h-9 bg-mint-100 rounded-xl flex-1"></div>
              <div className="h-9 bg-coral-100 rounded-xl flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl p-4 border border-mint-100 shadow-sm space-y-3 animate-pulse">
        <div className="h-6 bg-mint-100 rounded w-1/4 mb-4"></div>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-mint-50">
            <div className="flex items-center space-x-3 w-1/3">
              <div className="w-10 h-10 bg-mint-100 rounded-full"></div>
              <div className="h-4 bg-mint-100 rounded w-full"></div>
            </div>
            <div className="h-4 bg-mint-50 rounded w-1/4"></div>
            <div className="h-4 bg-coral-100 rounded w-1/6"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-mint-100 animate-pulse space-y-4">
      <div className="h-8 bg-mint-100 rounded w-1/3"></div>
      <div className="h-4 bg-mint-50 rounded w-2/3"></div>
      <div className="h-24 bg-mint-50 rounded-xl"></div>
    </div>
  );
};
