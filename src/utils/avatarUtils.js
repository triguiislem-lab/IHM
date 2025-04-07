/**
 * Génère une URL d'avatar basée sur les initiales de l'utilisateur
 * @param {string} firstName - Prénom de l'utilisateur
 * @param {string} lastName - Nom de l'utilisateur
 * @param {string} email - Email de l'utilisateur (utilisé comme fallback)
 * @returns {string} URL de l'avatar généré
 */
export const generateInitialsAvatar = (firstName, lastName, email) => {
  // Si le prénom et le nom sont disponibles, utiliser les initiales
  if (firstName && lastName) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=0D8ABC&color=fff&size=256`;
  }

  // Si seulement le prénom est disponible
  if (firstName) {
    const initial = firstName.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=0D8ABC&color=fff&size=256`;
  }

  // Si seulement le nom est disponible
  if (lastName) {
    const initial = lastName.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=0D8ABC&color=fff&size=256`;
  }

  // Si l'email est disponible, utiliser la première lettre de l'email
  if (email) {
    const initial = email.charAt(0).toUpperCase();
    return `https://ui-avatars.com/api/?name=${initial}&background=0D8ABC&color=fff&size=256`;
  }

  // Fallback: utiliser un avatar générique
  return `https://ui-avatars.com/api/?name=U&background=0D8ABC&color=fff&size=256`;
};

/**
 * Détermine l'avatar à utiliser en fonction des informations de l'utilisateur
 * @param {Object} userInfo - Informations de l'utilisateur
 * @returns {string} URL de l'avatar à utiliser
 */
export const getAvatarUrl = (userInfo) => {
  // Si l'utilisateur a défini un avatar personnalisé, l'utiliser
  if (userInfo?.roleInfo?.avatar && userInfo.roleInfo.avatar !== "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80") {
    return userInfo.roleInfo.avatar;
  }

  // Si l'utilisateur a un avatar dans le champ principal, l'utiliser
  if (userInfo?.avatar && userInfo.avatar !== "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80") {
    return userInfo.avatar;
  }

  // Sinon, générer un avatar basé sur les initiales
  return generateInitialsAvatar(
    userInfo?.firstName || userInfo?.prenom || "",
    userInfo?.lastName || userInfo?.nom || "",
    userInfo?.email || ""
  );
};
