import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MdLogout,
  MdPerson,
  MdBook,
  MdSettings,
  MdMessage,
  MdDashboard,
  MdAdminPanelSettings,
  MdSchool,
  MdEmail,
} from "react-icons/md";
import { getAvatarUrl } from "../../utils/avatarUtils";

const ResponsiveMenu = ({ isOpen, closeMenu, user, userType, userInfo, handleLogout, menuItems }) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.15 }}
          className="absolute top-20 left-0 w-full h-screen z-20 lg:hidden"
        >
          <div className="text-xl font-semibold bg-primary text-black py-10 m-6 rounded-3xl">
            <ul className="flex flex-col justify-center items-center gap-10">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.link}
                    onClick={closeMenu}
                    className="hover:text-secondary transition-colors duration-300"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
              {user ? (
                <>
                  <li className="flex flex-col items-center mt-6 border-t border-black/20 pt-6 w-4/5">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-secondary mb-2">
                      <img
                        src={
                          userInfo
                            ? getAvatarUrl(userInfo)
                            : "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=256"
                        }
                        alt={
                          userInfo
                            ? `${userInfo.prenom || ""} ${userInfo.nom || ""}`
                            : "User avatar"
                        }
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=256";
                        }}
                      />
                    </div>
                    <span className="font-medium text-lg">
                      {userInfo
                        ? `${userInfo.prenom || ""} ${userInfo.nom || ""}`
                        : "Utilisateur"}
                    </span>
                  </li>
                  <li>
                    <Link
                      to="/profile"
                      className="hover:text-secondary transition-colors duration-300 flex items-center gap-2"
                      onClick={closeMenu}
                    >
                      <MdPerson />
                      Mon profil
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/edit-profile"
                      className="hover:text-secondary transition-colors duration-300 flex items-center gap-2"
                      onClick={closeMenu}
                    >
                      <MdSettings />
                      Éditer Profil
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/messages"
                      className="hover:text-secondary transition-colors duration-300 flex items-center gap-2"
                      onClick={closeMenu}
                    >
                      <MdMessage />
                      Messages
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => { handleLogout(); closeMenu(); }}
                      className="flex items-center gap-2 hover:text-secondary transition-colors duration-300"
                    >
                      <MdLogout />
                      Déconnexion
                    </button>
                  </li>
                </>
              ) : (
                null
              )}
            </ul>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResponsiveMenu;
