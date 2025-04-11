import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAuth } from "firebase/auth";
import { fetchCompleteUserInfo } from "../../utils/firebaseUtils";
import { Link } from "react-router-dom";
import {
  MdEdit,
  MdSchool,
  MdPerson,
  MdEmail,
  MdCalendarToday,
  MdStar,
  MdDashboard,
} from "react-icons/md";
import { getAvatarUrl } from "../../utils/avatarUtils";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import ProgressDashboard from "../../components/Progress/ProgressDashboard";

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const auth = getAuth();

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const info = await fetchCompleteUserInfo(user.uid);
          if (info) {
            const role = info.role || info.userType || 'student';
            setUserInfo({ ...info, role });
            setActiveTab('profile');
          } else {
            setUserInfo({
              firstName: "Utilisateur", lastName: "", email: user.email || "",
              role: "student", roleInfo: { avatar: "" }, enrollments: [],
              createdAt: new Date().toISOString(),
            });
            setActiveTab('profile');
          }
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        if (auth.currentUser) {
          setUserInfo({
            firstName: "Utilisateur", lastName: "", email: auth.currentUser.email || "",
            role: "student", roleInfo: { avatar: "" }, enrollments: [],
            createdAt: new Date().toISOString(),
          });
          setActiveTab('profile');
        } else {
          setUserInfo(null);
        }
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadUserInfo();
      } else {
        setUserInfo(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Utilisateur non connecté</h1>
        <p className="text-gray-600 mb-8">
          Veuillez vous connecter pour accéder à votre profil.
        </p>
        <Link
          to="/login"
          className="bg-secondary text-white px-6 py-2 rounded-full hover:bg-secondary/90 transition-colors duration-300"
        >
          Connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-secondary to-primary h-48 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img
                    src={getAvatarUrl(userInfo)}
                    alt={`${userInfo.prenom || userInfo.firstName || ""} ${userInfo.nom || userInfo.lastName || ""}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=256";
                    }}
                  />
                </div>
              </div>
              <div className="absolute bottom-4 right-8">
                <Link
                  to={`/edit-profile`}
                  className="bg-white text-secondary px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-100 transition-colors duration-300"
                >
                  <MdEdit />
                  Modifier le profil
                </Link>
              </div>
            </div>

            <div className="flex border-b pt-20 px-8">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "profile"
                    ? "text-secondary border-b-2 border-secondary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <div className="flex items-center gap-2">
                  <MdPerson />
                  Profil
                </div>
              </button>

              {userInfo.role === 'student' && (
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "progress"
                      ? "text-secondary border-b-2 border-secondary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("progress")}
                >
                  <div className="flex items-center gap-2">
                    <MdDashboard />
                    Progression
                  </div>
                </button>
              )}

              {(userInfo.role === 'student' || userInfo.role === 'instructor') && (
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "courses"
                      ? "text-secondary border-b-2 border-secondary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("courses")}
                >
                  <div className="flex items-center gap-2">
                    <MdSchool />
                    Mes cours
                  </div>
                </button>
              )}
            </div>

            <div className="py-8 px-8">
              {activeTab === "profile" && (
                <div>
                  <h1 className="text-3xl font-bold">
                    {userInfo.firstName || userInfo.prenom} {" "}
                    {userInfo.lastName || userInfo.nom}
                  </h1>
                  <p className="text-gray-600 mt-1 capitalize">
                    {userInfo.role === "student"
                      ? "Apprenant"
                      : userInfo.role === "instructor"
                      ? "Formateur"
                      : userInfo.role === "admin"
                      ? "Administrateur"
                      : userInfo.userType || userInfo.role || "Utilisateur"}
                  </p>
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h2 className="text-xl font-semibold border-b pb-2">
                        Informations personnelles
                      </h2>

                      <div className="flex items-center gap-3">
                        <MdPerson className="text-secondary text-xl" />
                        <div>
                          <p className="text-sm text-gray-500">Nom complet</p>
                          <p>
                            {userInfo.firstName || userInfo.prenom} {" "}
                            {userInfo.lastName || userInfo.nom}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MdEmail className="text-secondary text-xl" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p>{userInfo.email || 'N/A'}</p>
                        </div>
                      </div>
                      {userInfo.createdAt && (
                        <div className="flex items-center gap-3">
                          <MdCalendarToday className="text-secondary text-xl" />
                          <div>
                            <p className="text-sm text-gray-500">Membre depuis</p>
                            <p>{new Date(userInfo.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {userInfo.role === 'student' && (
                      <div className="space-y-4">
                        <h2 className="text-xl font-semibold border-b pb-2">
                          Formations inscrites
                        </h2>
                        {userInfo.enrollments && userInfo.enrollments.length > 0 ? (
                          <div className="space-y-3">
                            {userInfo.enrollments.map((enrollment, index) => (
                              <Link
                                key={enrollment.courseId || index}
                                to={`/course/${enrollment.courseId}`}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                              >
                                <MdSchool className="text-secondary text-xl" />
                                <div>
                                  <p className="font-medium">
                                    {enrollment.courseName || `Cours ID: ${enrollment.courseId}`}
                                  </p>
                                  {enrollment.enrolledAt && (
                                    <p className="text-sm text-gray-500">
                                      Inscrit le{" "}
                                      {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-40 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-4">
                              Vous n'êtes inscrit à aucune formation
                            </p>
                            <Link
                              to="/courses"
                              className="bg-secondary text-white px-4 py-2 rounded-full hover:bg-secondary/90 transition-colors duration-300"
                            >
                              Parcourir les formations
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "progress" && userInfo.role === 'student' && <ProgressDashboard />}

              {activeTab === "courses" && (userInfo.role === 'student' || userInfo.role === 'instructor') && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    {userInfo.role === 'student' ? 'Voir vos cours inscrits' : 'Gérer vos cours créés'}
                  </p>
                  <Link
                    to={userInfo.role === 'student' ? '/student/enrollments' : '/instructor/courses'}
                    className="bg-secondary text-white px-6 py-2 rounded-md hover:bg-secondary/90 transition-colors duration-300"
                  >
                    {userInfo.role === 'student' ? 'Voir mes inscriptions' : 'Gérer mes cours'}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
