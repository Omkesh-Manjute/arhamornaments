import React from 'react';

export const GoldSkeletonCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-[#FAF9F5] to-[#FFFDF9] border border-gold/10 p-3 md:p-4 space-y-4 shadow-sm">
      {/* CSS Shimmer Animation */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#E6C687]/15 to-transparent animate-shimmer" />
      
      {/* Image Area Skeleton */}
      <div className="aspect-[4/5] w-full rounded-xl bg-gradient-to-br from-[#F3F1EA] to-[#FCFAF2] animate-pulse" />
      
      {/* Content Skeleton */}
      <div className="space-y-3">
        {/* Category Badge */}
        <div className="h-3 w-1/4 rounded bg-stone-200 animate-pulse" />
        {/* Title */}
        <div className="h-4 w-3/4 rounded bg-stone-200 animate-pulse" />
        
        <div className="flex justify-between items-center pt-2">
          {/* Price */}
          <div className="h-5 w-2/5 rounded bg-amber-100/50 animate-pulse" />
          {/* Action Button */}
          <div className="h-8 w-8 rounded-full bg-stone-200 animate-pulse" />
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}} />
    </div>
  );
};

export const GoldSkeletonGrid: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <GoldSkeletonCard key={i} />
      ))}
    </div>
  );
};
