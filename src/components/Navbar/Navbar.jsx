import React, { useState, useEffect } from "react";
import { NavbarMenu } from "../../mockData/data.js";
import { MdComputer, MdMenu, MdLogout } from "react-icons/md";
import { motion } from "framer-motion";
import ResponsiveMenu from "./ResponsiveMenu.jsx";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user type from database
        const db = getDatabase();
        const userRef = ref(db, `users/${currentUser.uid}`);
        const snapshot = await get(userRef);
        const userData = snapshot.val();
        setUserType(userData?.userType);
      } else {
        setUserType(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
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
              <>
                <Link 
                  to={`/dashboard/${userType}`}
                  className="font-semibold hover:text-secondary transition-colors duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-white bg-secondary font-semibold rounded-full px-6 py-2 hover:bg-secondary/90 transition-colors duration-300"
                >
                  <MdLogout />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="font-semibold hover:text-secondary transition-colors duration-300"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="text-white bg-secondary font-semibold rounded-full px-6 py-2 hover:bg-secondary/90 transition-colors duration-300"
                >
                  Register
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
      <ResponsiveMenu isOpen={isOpen} user={user} userType={userType} handleLogout={handleLogout} />
    </>
  );
};

export default Navbar;
