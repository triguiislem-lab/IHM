import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Récupérer les informations de l'utilisateur depuis la base de données
          const database = getDatabase();
          const userRef = ref(database, `elearning/users/${firebaseUser.uid}`);
          const snapshot = await get(userRef);

          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              ...firebaseUser,
              ...userData
            });
            setUserRole(userData.role || 'student');
          } else {
            // Créer un profil par défaut si l'utilisateur n'existe pas
            setUser({
              ...firebaseUser,
              role: 'student',
              firstName: '',
              lastName: '',
              email: firebaseUser.email
            });
            setUserRole('student');
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (error) {
        setError(error);
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const getDashboardPath = () => {
    if (!userRole) return '/login';
    switch (userRole.toLowerCase()) {
      case 'admin':
        return '/admin/dashboard';
      case 'instructor':
        return '/instructor/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return {
    user,
    userRole,
    loading,
    error,
    getDashboardPath,
    isAuthenticated: !!user,
    isAdmin: userRole === 'admin',
    isInstructor: userRole === 'instructor',
    isStudent: userRole === 'student'
  };
}; 