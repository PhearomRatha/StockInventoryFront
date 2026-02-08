import React from "react";

/**
 * Reusable Page Header Component
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle
 * @param {React.ReactNode} icon - Icon component
 * @param {React.ReactNode} action - Action button
 * @param {string} iconBg - Icon background gradient class
 */
const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  action,
  iconBg = "from-indigo-500 to-purple-600"
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-14 h-14 bg-gradient-to-br ${iconBg} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && action}
    </div>
  );
};

export default PageHeader;
