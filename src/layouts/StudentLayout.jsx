import React from 'react';
import { Outlet } from 'react-router-dom';
// Navbar is handled globally or by public routes now
import StudentSidebar from '../components/Sidebar/StudentSidebar';
import Breadcrumbs from '../components/Common/Breadcrumbs';

const StudentLayout = () => {
  return (
    <div className="relative min-h-screen"> {/* Use relative */}
      {/* Sidebar is fixed */}
      <StudentSidebar />
      {/* Main content area with padding for fixed navbar and margin for fixed sidebar */}
      <main className="flex-1 ml-64 pt-20 p-6 bg-gray-100 min-h-screen">
        <Breadcrumbs />
        <Outlet /> {/* Child routes will render here */}
      </main>
    </div>
  );
};

export default StudentLayout; 