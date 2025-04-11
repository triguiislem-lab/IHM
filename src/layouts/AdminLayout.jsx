import React from 'react';
import { Outlet } from 'react-router-dom';
// Navbar is handled globally or by public routes now
import AdminSidebar from '../components/Sidebar/AdminSidebar';
import Breadcrumbs from '../components/Common/Breadcrumbs';
import Navbar from '../components/Navbar/Navbar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Fixed */}
      <AdminSidebar />

      {/* Main Content Area - Add ml-64 to offset for sidebar width */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {/* Navbar - Fixed within this container now, should adjust automatically */}
        <Navbar />

        {/* Page Content - Scrollable */}
        {/* pt-20 accounts for navbar height */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pt-20 p-6">
          <Breadcrumbs />
          <Outlet /> {/* Child routes will render here */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 