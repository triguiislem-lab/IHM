import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdChevronRight } from 'react-icons/md';

const Breadcrumbs = ({ items = [] }) => {
  const location = useLocation();

  // Default home/dashboard breadcrumb based on current path prefix if items are empty
  const getDefaultBreadcrumb = () => {
    if (location.pathname.startsWith('/admin')) {
      return [{ label: 'Admin Dashboard', path: '/admin/dashboard' }];
    } else if (location.pathname.startsWith('/instructor')) {
      return [{ label: 'Instructor Dashboard', path: '/instructor/dashboard' }];
    } else if (location.pathname.startsWith('/student')) {
      return [{ label: 'Student Dashboard', path: '/student/dashboard' }];
    }
    return [{ label: 'Home', path: '/' }]; // Fallback
  };

  let breadcrumbItems = items;
  if (!breadcrumbItems || breadcrumbItems.length === 0) {
    breadcrumbItems = getDefaultBreadcrumb();
  }

  // Generate items from path if not provided explicitly
  if (items.length === 0 && location.pathname !== breadcrumbItems[0].path) {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let currentPath = '';
    const generatedItems = pathSegments.map((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      // Simple label generation (can be improved with a mapping or lookup)
      const label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return {
        label: label,
        path: isLast ? undefined : currentPath // No link for the current page
      };
    });
    // Combine default dashboard link with generated path segments
    breadcrumbItems = [...breadcrumbItems, ...generatedItems];
  }


  return (
    <nav className="bg-gray-100 p-3 rounded-md mb-6 shadow-sm">
      <ol className="list-none p-0 inline-flex items-center text-sm text-gray-600">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <MdChevronRight className="mx-1 text-gray-400" size={20} />}
            {item.path ? (
              <Link
                to={item.path}
                className="text-secondary hover:text-secondary-dark hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-gray-800">{item.label}</span> // Current page
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs; 