import React from 'react';
import ActionButton from '../Common/ActionButton'; // Assuming ActionButton is in Common folder
import LoadingSpinner from '../Common/LoadingSpinner'; // Import LoadingSpinner

const DashboardTable = ({ columns, data, actions, viewAllLink, viewAllText = 'Voir tout', maxRows = 5, isLoading }) => {
  if (isLoading) {
    return (
        <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
        </div>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">Aucune donnée disponible.</p>;
  }

  const visibleData = data.slice(0, maxRows);
  const totalItems = data.length;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {visibleData.map((item, rowIndex) => (
            <tr key={item.id || rowIndex} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td
                  key={`${item.id || rowIndex}-${col.key}`}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                >
                  {typeof col.render === 'function' ? col.render(item) : item[col.key]}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {actions.map((action, actionIndex) => (
                    <ActionButton
                      key={actionIndex}
                      to={typeof action.to === 'function' ? action.to(item) : action.to}
                      onClick={action.onClick ? () => action.onClick(item) : undefined}
                      icon={action.icon}
                      variant={action.variant || 'light'}
                      size={action.size || 'sm'}
                      disabled={typeof action.disabled === 'function' ? action.disabled(item) : action.disabled}
                    >
                      {action.label}
                    </ActionButton>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {totalItems > maxRows && viewAllLink && (
        <div className="text-center mt-4">
          <ActionButton to={viewAllLink} variant="outline" size="sm">
            {viewAllText} ({totalItems})
          </ActionButton>
        </div>
      )}
    </div>
  );
};

export default DashboardTable; 