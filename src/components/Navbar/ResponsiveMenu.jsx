import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { NavbarMenu } from "../../mockData/data.js";
import { MdLogout } from "react-icons/md";

const ResponsiveMenu = ({ isOpen, user, userType, handleLogout }) => {
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
            <ul className="flex flex-col justify-center items-center gap-10">
              {NavbarMenu.map((item) => (
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
