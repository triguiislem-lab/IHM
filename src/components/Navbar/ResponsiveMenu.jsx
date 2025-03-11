import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { MdLogout, MdPerson } from "react-icons/md";

const UserBadge = ({ userType }) => {
  const badgeColors = {
    student: 'bg-blue-100 text-blue-800',
    instructor: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
  };

  if (!userType) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Guest
      </span>
    );
  }

  const formattedType = userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColors[userType.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
      {formattedType}
    </span>
  );
};

const ResponsiveMenu = ({ isOpen, user, userType, handleLogout, menuItems }) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.3 }}
          className="absolute top-20 left-0 w-full h-screen z-20 lg:hidden"
        >
          <div className="text-xl font-semibold bg-primary text-black py-10 m-6 rounded-3xl">
            {user && (
              <div className="flex flex-col items-center gap-2 mb-6 pb-6 border-b border-gray-200">
                <MdPerson className="text-3xl" />
                <div className="text-center">
                  <div className="font-semibold">{user.displayName || 'User'}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="mt-2">
                    <UserBadge userType={userType} />
                  </div>
                </div>
              </div>
            )}
            
            <ul className="flex flex-col justify-center items-center gap-10">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link 
                    to={item.link}
                    className="hover:text-secondary transition-colors duration-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li>
                    <Link 
                      to={`/dashboard/${userType}`}
                      className="hover:text-secondary transition-colors duration-300"
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 hover:text-secondary transition-colors duration-300"
                    >
                      <MdLogout />
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link 
                      to="/login"
                      className="hover:text-secondary transition-colors duration-300"
                    >
                      Sign in
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/register"
                      className="hover:text-secondary transition-colors duration-300"
                    >
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveMenu;
