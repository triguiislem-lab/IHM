import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdSettings,
  MdCategory,
} from 'react-icons/md';

const AdminSidebar = () => {
  const baseLinkClass = "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-150";
  const activeLinkClass = "bg-primary text-white hover:bg-primary/90";

  const getLinkClassName = ({ isActive }) => {
    return isActive ? `${baseLinkClass} ${activeLinkClass}` : baseLinkClass;
  };

  return (
    <div className="w-64 h-screen bg-white shadow-lg fixed top-0 left-0 pt-16 flex flex-col z-40">
      <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
        <NavLink to="/admin/dashboard" className={getLinkClassName} end>
          <MdDashboard className="mr-3" size={20} />
          Tableau de Bord
        </NavLink>
        <NavLink to="/admin/users" className={getLinkClassName}>
          <MdPeople className="mr-3" size={20} />
          Utilisateurs
        </NavLink>
        <NavLink to="/admin/courses" className={getLinkClassName}>
          <MdSchool className="mr-3" size={20} />
          Formations
        </NavLink>
        <NavLink to="/admin/categories" className={getLinkClassName}>
          <MdCategory className="mr-3" size={20} />
          Catégories
        </NavLink>
        <NavLink to="/admin/settings" className={getLinkClassName}>
          <MdSettings className="mr-3" size={20} />
          Paramètres
        </NavLink>
      </nav>
    </div>
  );
};

export default AdminSidebar; 