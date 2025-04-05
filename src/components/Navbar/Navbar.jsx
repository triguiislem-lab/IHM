import React, { useState, useEffect } from "react";
import { NavbarMenu } from "../../mockData/data.js";
import {
  MdComputer,
  MdMenu,
  MdLogout,
  MdPerson,
  MdBook,
  MdSettings,
  MdMessage,
  MdSchool,
} from "react-icons/md";
import { getAvatarUrl } from "../../utils/avatarUtils";
import { motion } from "framer-motion";
import ResponsiveMenu from "./ResponsiveMenu.jsx";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { fetchCompleteUserInfo } from "../../utils/firebaseUtils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch user type from database
          const db = getDatabase();
          const userRef = ref(db, `users/${currentUser.uid}`);
          const snapshot = await get(userRef);
          const userData = snapshot.val();
          setUserType(userData?.userType);

          // Fetch complete user info
          const completeInfo = await fetchCompleteUserInfo(currentUser.uid);
          setUserInfo(completeInfo);
          console.log("Complete user info:", completeInfo);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      } else {
        setUserType(null);
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserMenuOpen(false);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="container flex justify-between items-center py-6">
          {/* Logo section */}
          <div className="text-2xl flex items-center gap-2 font-bold">
            <MdComputer className="text-3xl text-secondary" />
            <Link to="/">E-Tutor</Link>
          </div>

          {/* Menu section */}
          <div className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {NavbarMenu.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.link}
                    className="inline-block text-gray-600 text-sm xl:text-base py-1 px-2 xl:px-3 hover:text-secondary transition-all duration-300 font-semibold"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {/* CTA Button section */}
          <div className="hidden lg:flex items-center space-x-6">
            {user ? (
              <div className="relative">
                <div className="flex items-center space-x-4">
                  {userType && (
                    <Link
                      to={`/dashboard/${userType.toLowerCase()}`}
                      className="font-semibold hover:text-secondary transition-colors duration-300"
                    >
                      Tableau de bord
                    </Link>
                  )}
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-2 hover:text-secondary transition-colors duration-300"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-secondary">
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
                    <span className="font-medium">
                      {userInfo
                        ? `${userInfo.prenom || ""} ${userInfo.nom || ""}`
                        : "Utilisateur"}
                    </span>
                  </button>
                </div>

                {/* User Menu Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <MdPerson className="mr-2 h-5 w-5" />
                      Mon profil
                    </Link>
                    <Link
                      to="/my-courses"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <MdBook className="mr-2 h-5 w-5" />
                      Mes formations
                    </Link>
                    {userType && (
                      <Link
                        to={`/dashboard/${userType.toLowerCase()}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <MdSettings className="mr-2 h-5 w-5" />
                        Tableau de bord
                      </Link>
                    )}
                    <Link
                      to="/messages"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <MdMessage className="mr-2 h-5 w-5" />
                      {userType === "formateur" || userType === "instructor"
                        ? "Messages des étudiants"
                        : "Contacter les formateurs"}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <MdLogout className="mr-2 h-5 w-5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="font-semibold hover:text-secondary transition-colors duration-300"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="text-white bg-secondary font-semibold rounded-full px-6 py-2 hover:bg-secondary/90 transition-colors duration-300"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden" onClick={() => setIsOpen(!isOpen)}>
            <MdMenu className="text-4xl" />
          </div>
        </div>
      </motion.div>

      {/* mobile Sidebar section */}
      <ResponsiveMenu
        isOpen={isOpen}
        user={user}
        userType={userType}
        userInfo={userInfo}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
