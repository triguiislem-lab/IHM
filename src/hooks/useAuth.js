import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, get } from 'firebase/database';
import { getCachedData, setCachedData } from '../utils/cacheUtils';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les informations de l'utilisateur avec mise en cache
  const fetchUserInfo = useCallback(async (firebaseUser) => {
    try {
      // Vérifier si les données sont en cache
      const cacheKey = `user_info_${firebaseUser.uid}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        
        setUser(cachedData);
        return;
      }

      // Récupérer les informations de l'utilisateur depuis la base de données
      const database = getDatabase();
      const userRef = ref(database, `elearning/users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();

        // Déterminer le rôle de l'utilisateur (plusieurs formats possibles)
        let role = 'student';
        if (userData.role) {
          role = userData.role;
        } else if (userData.userType) {
          // Mapper userType vers role
          if (userData.userType === 'formateur') {
            role = 'instructor';
          } else if (userData.userType === 'administrateur') {
            role = 'admin';
          } else if (userData.userType === 'etudiant') {
            role = 'student';
          }
        }

        const userInfo = {
          ...firebaseUser,
          ...userData,
          normalizedRole: role
        };

        // Mettre en cache les informations de l'utilisateur
        setCachedData(cacheKey, userInfo);

        setUser(userInfo);
      } else {
        // Créer un profil par défaut si l'utilisateur n'existe pas
        const defaultUser = {
          ...firebaseUser,
          role: 'student',
          normalizedRole: 'student',
          firstName: '',
          lastName: '',
          email: firebaseUser.email
        };

        setUser(defaultUser);
      }
    } catch (error) {
      setError(error);
      
    }
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);

        if (firebaseUser) {
          await fetchUserInfo(firebaseUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        
        setError(error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserInfo]);

  const getDashboardPath = () => {
    const role = user?.normalizedRole;
    if (!role) return '/login';
    switch (role.toLowerCase()) {
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
    loading,
    error,
    getDashboardPath,
    isAuthenticated: !!user,
    isAdmin: user?.normalizedRole === 'admin',
    isInstructor: user?.normalizedRole === 'instructor',
    isStudent: user?.normalizedRole === 'student'
  };
};