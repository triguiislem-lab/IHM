import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

// Layout for public-facing pages
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* pt-16 or pt-20 depending on navbar height */}
      <main className="flex-grow pt-20">
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout; 