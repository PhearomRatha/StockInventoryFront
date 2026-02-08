import React from "react";

/**
 * Reusable Stats Card Component
 * @param {string} label - Card label
 * @param {string|number} value - Card value
 * @param {React.ReactNode} icon - Icon component
 * @param {string} valueColor - Value text color class
 * @param {string} iconBg - Icon background color class
 */
const StatsCard = ({ 
  label, 
  value, 
  icon: Icon, 
  valueColor = "text-gray-900",
  iconBg = "bg-indigo-50"
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-2 ${valueColor}`}>{value}</p>
        </div>
        {Icon && (
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Pre-configured Stats Cards for Products Page
 */
export const TotalProductsCard = ({ value }) => (
  <StatsCard 
    label="Total Products" 
    value={value} 
    icon={(props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>}
    valueColor="text-gray-900"
    iconBg="bg-indigo-50"
  />
);

export const TotalStockCard = ({ value }) => (
  <StatsCard 
    label="Total In Stock" 
    value={value} 
    icon={(props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>}
    valueColor="text-blue-600"
    iconBg="bg-blue-50"
  />
);

export const LowStockCard = ({ value }) => (
  <StatsCard 
    label="Low Stock" 
    value={value} 
    icon={(props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>}
    valueColor="text-rose-600"
    iconBg="bg-rose-50"
  />
);

export const AvgPriceCard = ({ value, prefix = "$" }) => (
  <StatsCard 
    label="Avg. Price" 
    value={`${prefix}${value}`} 
    icon={(props) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
    valueColor="text-emerald-600"
    iconBg="bg-emerald-50"
  />
);

export default StatsCard;
