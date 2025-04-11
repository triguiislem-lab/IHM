import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdSchool,
  MdLibraryBooks, // For courses
  MdMessage,
  MdPerson, // For profile
  MdExitToApp,
} from 'react-icons/md';
import { getAuth, signOut } from 'firebase/auth';

const InstructorSidebar = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const baseLinkClass = "flex items-center px-4 py-3 text-gray-700 hover:bg-gray-200 rounded-md transition-colors duration-150";
  const activeLinkClass = "bg-primary text-white hover:bg-primary/90";

  const getLinkClassName = ({ isActive }) => {
    return isActive ? `${baseLinkClass} ${activeLinkClass}` : baseLinkClass;
  };

  return (
    <div className="w-64 h-screen bg-white shadow-lg fixed top-0 left-0 pt-20 flex flex-col z-40">
      <nav className="flex-grow px-4 py-6 space-y-2 overflow-y-auto">
        <NavLink to="/instructor/dashboard" className={getLinkClassName} end>
          <MdDashboard className="mr-3" size={20} />
          Tableau de Bord
        </NavLink>
        <NavLink to="/instructor/courses" className={getLinkClassName}>
          <MdLibraryBooks className="mr-3" size={20} />
          Mes Formations
        </NavLink>
        <NavLink to="/instructor/profile" className={getLinkClassName}>
          <MdPerson className="mr-3" size={20} />
          Mon Profil
        </NavLink>
        <NavLink to="/instructor/messages" className={getLinkClassName}>
          <MdMessage className="mr-3" size={20} />
          Messages
        </NavLink>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-md transition-colors duration-150"
        >
          <MdExitToApp className="mr-2" size={20} />
          Déconnexion
        </button>
      </div>
    </div>
  );
};

export default InstructorSidebar; 