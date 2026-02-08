import React from "react";

/**
 * Reusable Skeleton Loader Component
 * Provides various skeleton variations for loading states
 */

// Base skeleton wrapper with animation
const SkeletonBase = ({ className = "", children }) => (
  <div className={`animate-pulse ${className}`}>{children}</div>
);

// Single line skeleton
export const SkeletonLine = ({ width = "100%", height = "16px", className = "" }) => (
  <div
    className={`bg-gray-200 rounded ${className}`}
    style={{ width, height }}
  />
);

// Circle skeleton (for avatars, icons)
export const SkeletonCircle = ({ size = "40px", className = "" }) => (
  <div
    className={`bg-gray-200 rounded-full ${className}`}
    style={{ width: size, height: size }}
  />
);

// Rounded rectangle skeleton
export const SkeletonRounded = ({ width = "100%", height = "60px", className = "" }) => (
  <div
    className={`bg-gray-200 rounded-lg ${className}`}
    style={{ width, height }}
  />
);

// Card skeleton
export const SkeletonCard = ({ className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm p-5 ${className}`}>
    <div className="flex justify-between items-start">
      <div className="space-y-2 flex-1 mr-4">
        <SkeletonLine width="40%" height="12px" />
        <SkeletonLine width="60%" height="24px" />
      </div>
      <SkeletonCircle size="48px" />
    </div>
  </div>
);

// Stats card skeleton
export const SkeletonStatsCard = ({ className = "" }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 ${className}`}>
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <SkeletonLine width="80px" height="12px" />
        <SkeletonLine width="60px" height="28px" />
      </div>
      <SkeletonCircle size="48px" />
    </div>
  </div>
);

// Table row skeleton
export const SkeletonTableRow = ({ columns = 7, className = "" }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-6">
        <div className="flex items-center gap-3">
          <SkeletonCircle size="56px" />
          <div className="space-y-2 flex-1">
            <SkeletonLine width={i === 0 ? "70%" : "50%"} height="14px" />
            {i === 0 && <SkeletonLine width="40%" height="12px" />}
          </div>
        </div>
      </td>
    ))}
  </tr>
);

// Table skeleton with header
export const SkeletonTable = ({ rows = 5, columns = 7, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 ${className}`}>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px]">
        <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="py-4 px-6 text-left">
                <SkeletonLine width="60px" height="14px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Header skeleton (title + subtitle)
export const SkeletonHeader = ({ className = "" }) => (
  <div className={`flex items-center gap-4 mb-8 ${className}`}>
    <SkeletonCircle size="56px" />
    <div className="space-y-2">
      <SkeletonLine width="150px" height="32px" />
      <SkeletonLine width="250px" height="16px" />
    </div>
  </div>
);

// Stats grid skeleton (4 cards like Products page)
export const SkeletonStatsGrid = ({ count = 4, className = "" }) => (
  <div className={`grid grid-cols-1 md:grid-cols-${count} gap-4 mb-8 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStatsCard key={i} />
    ))}
  </div>
);

// Controls skeleton (search + filters)
export const SkeletonControls = ({ className = "" }) => (
  <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6 ${className}`}>
    <div className="flex flex-col lg:flex-row gap-4 justify-between">
      <SkeletonRounded height="48px" width="100%" className="lg:w-96" />
      <div className="flex gap-3">
        <SkeletonRounded height="48px" width="160px" />
        <SkeletonRounded height="48px" width="140px" />
      </div>
    </div>
  </div>
);

// Full page loading skeleton
export const SkeletonPage = ({ 
  showHeader = true,
  showStats = true,
  showControls = true,
  showTable = true,
  statsCount = 4,
  tableRows = 5,
  tableColumns = 7,
  className = ""
}) => (
  <div className={`p-4 md:p-6 lg:p-8 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen ${className}`}>
    {showHeader && <SkeletonHeader />}
    
    {showStats && <SkeletonStatsGrid count={statsCount} />}
    
    {showControls && <SkeletonControls />}
    
    {showTable && (
      <SkeletonTable rows={tableRows} columns={tableColumns} />
    )}
  </div>
);

// Button skeleton
export const SkeletonButton = ({ width = "120px", height = "40px", className = "" }) => (
  <div
    className={`bg-gray-200 rounded-xl ${className}`}
    style={{ width, height }}
  />
);

// Avatar list skeleton
export const SkeletonAvatarList = ({ count = 5, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <SkeletonCircle size="40px" />
        <div className="space-y-2 flex-1">
          <SkeletonLine width="60%" height="14px" />
          <SkeletonLine width="40%" height="12px" />
        </div>
      </div>
    ))}
  </div>
);

// Modal skeleton
export const SkeletonModal = ({ className = "" }) => (
  <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 ${className}`}>
    <div className="bg-white rounded-2xl p-6 w-full max-w-lg animate-pulse">
      <SkeletonLine width="40%" height="28px" className="mb-6" />
      <div className="space-y-4">
        <SkeletonLine width="100%" height="48px" />
        <SkeletonLine width="100%" height="48px" />
        <SkeletonLine width="100%" height="100px" />
        <SkeletonLine width="100%" height="48px" />
      </div>
      <div className="flex gap-3 mt-6">
        <SkeletonButton width="80px" height="44px" />
        <SkeletonButton width="100px" height="44px" />
      </div>
    </div>
  </div>
);

// Export the base component as default
export default SkeletonBase;
