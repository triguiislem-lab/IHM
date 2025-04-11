import React, { useState, useEffect } from "react";
import {
  MdComputer,
  MdMenu,
  MdLogout,
  MdPerson,
  MdBook,
  MdSettings,
  MdMessage,
  MdSchool,
  MdDashboard,
  MdAdminPanelSettings,
  MdEmail,
} from "react-icons/md";
import { getAvatarUrl } from "../../utils/avatarUtils";
import { motion } from "framer-motion";
import ResponsiveMenu from "./ResponsiveMenu.jsx";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getDatabase, ref, get } from "firebase/database";
import { fetchCompleteUserInfo } from "../../utils/firebaseUtils";

// Define Navigation Menus based on role
const loggedOutMenu = [
  { id: 1, title: "Home", link: "/" },
  { id: 2, title: "Courses", link: "/courses" },
  { id: 3, title: "About", link: "/about" },
  { id: 4, title: "Contact", link: "/contact" },
];

const studentMenu = [
  { id: 1, title: "Home", link: "/" },
  { id: 2, title: "My Courses", link: "/student/enrollments" }, // Link to student's enrolled courses
  { id: 3, title: "Explore Courses", link: "/courses" },
];

const instructorMenu = [
  { id: 1, title: "Dashboard", link: "/instructor/dashboard" },
  { id: 2, title: "My Courses", link: "/instructor/courses" }, // Link to courses managed by instructor
  { id: 3, title: "Create Course", link: "/instructor/course-form" },
];

const adminMenu = [
  { id: 1, title: "Dashboard", link: "/admin/dashboard" },
  { id: 2, title: "Courses", link: "/admin/courses" }, // Link to course management
  { id: 3, title: "Users", link: "/admin/users" },     // Link to user management
  { id: 4, title: "Settings", link: "/admin/settings" },
];

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
          // Fetch user type from database (new structure)
          const db = getDatabase();
          const userRef = ref(db, `elearning/users/${currentUser.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            const role = userData.role || "student"; // Default to student if role missing
            setUserType(role); 
            setUserInfo(userData);
             
          } else {
            // Try legacy path
            const legacyUserRef = ref(db, `users/${currentUser.uid}`);
            const legacySnapshot = await get(legacyUserRef);

            if (legacySnapshot.exists()) {
              const legacyUserData = legacySnapshot.val();
              // Map old userType to new role format
              const role =
                legacyUserData.userType === "admin"
                  ? "admin"
                  : legacyUserData.userType === "instructor" ||
                    legacyUserData.userType === "formateur"
                  ? "instructor"
                  : "student";
              setUserType(role);

              // Fetch complete user info as fallback
              const completeInfo = await fetchCompleteUserInfo(currentUser.uid);
              setUserInfo(completeInfo);
               
            } else {
              // Default to student if no user data found
               
              setUserType("student"); 
              setUserInfo({
                id: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || "Utilisateur",
                role: "student",
              });
            }
          }
        } catch (error) {
           
          // Default values in case of error
           
          setUserType("student"); 
          setUserInfo({
            id: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName || "Utilisateur",
            role: "student",
          });
        }
      } else {
        setUserType(null);
        setUserInfo(null);
      }
    });

    return () => unsubscribe();
  }, [auth]); // Added auth dependency

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };
  
  const closeUserMenu = () => {
      setUserMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeUserMenu(); // Close user menu on logout
      setIsOpen(false); // Close responsive menu if open
      navigate("/");
    } catch (error) {
       
    }
  };
  
  // Determine which menu to display
  let currentMenu = loggedOutMenu; // Default to logged out
  if (userType === 'student') {
    currentMenu = studentMenu;
  } else if (userType === 'instructor') {
    currentMenu = instructorMenu;
  } else if (userType === 'admin') {
    currentMenu = adminMenu;
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 0.1 }}
      >
        <div className="container flex justify-between items-center py-6">
          {/* Logo section */}
          <div className="text-2xl flex items-center gap-2 font-bold">
            <MdComputer className="text-3xl text-secondary" />
            <Link to="/">E-Tutor</Link>
          </div>

          {/* Menu section - Conditionally render links */}
          <div className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {currentMenu.map((item) => ( // Use the determined currentMenu
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
                 {/* Removed the extra dashboard link here as it's now in the role-specific menus */}
                <div className="flex items-center space-x-4">
                  {/* User Avatar/Name Button */}
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
                    {/* Links common to logged-in users or specific roles */}
                    <Link
                      to="/profile" // Redirects handled by ProfileRedirect
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { console.log('[Navbar] Clicked Mon profil link'); closeUserMenu(); }}
                    >
                      <MdPerson className="mr-2 h-5 w-5" />
                      Mon profil
                    </Link>
                    {/* Add role specific links if needed, e.g., Edit Profile */}
                     <Link
                      to="/edit-profile" // Redirects handled by EditProfileRedirect
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { console.log('[Navbar] Clicked Éditer Profil link'); closeUserMenu(); }}
                    >
                      <MdSettings className="mr-2 h-5 w-5" />
                      Éditer Profil
                    </Link>
                     <Link
                      to="/messages" // Redirects handled by MessagesRedirect
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => { console.log('[Navbar] Clicked Messages link'); closeUserMenu(); }}
                    >
                      <MdMessage className="mr-2 h-5 w-5" />
                      Messages
                    </Link>
                    {/* Separator */}
                     <hr className="my-1" /> 
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <MdLogout className="mr-2 h-5 w-5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login/Register Buttons for logged-out users
              <>
                <Link
                  to="/login"
                  className="font-semibold hover:text-secondary transition-colors duration-300"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-secondary text-white font-semibold px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors duration-300"
                >
                  Inscription
                </Link>
              </>
            )}
          </div>
          {/* Mobile menu Button */}
           <div className="lg:hidden">
             <button onClick={() => setIsOpen(!isOpen)}>
               <MdMenu className="h-8 w-8 text-secondary" />
             </button>
           </div>
        </div>
      </motion.div>

      {/* Responsive Menu Component - Needs updates to reflect role-based menus */}
      <ResponsiveMenu
        isOpen={isOpen}
        closeMenu={() => setIsOpen(false)}
        user={user}
        userType={userType}
        userInfo={userInfo}
        handleLogout={handleLogout}
        // Pass the correct menu based on role
        menuItems={currentMenu} 
      />
    </>
  );
};

export default Navbar;
