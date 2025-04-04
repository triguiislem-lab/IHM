import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile,
	sendPasswordResetEmail,
} from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { database } from '../../firebaseConfig';

const auth = getAuth();

export const registerUser = async (email, password, fullName, userType) => {
	console.log('authUtils.js - Starting registration with user type:', userType);

	if (!userType) {
		throw new Error('User type is required');
	}

	// Validate user type
	if (!['apprenant', 'formateur', 'administrateur'].includes(userType)) {
		console.error('authUtils.js - Invalid user type:', userType);
		throw new Error('Invalid user type');
	}

	// Create user with email and password
	const userCredential = await createUserWithEmailAndPassword(
		auth,
		email,
		password,
	);
	const user = userCredential.user;
	console.log('authUtils.js - User created with ID:', user.uid);

	// Split fullName into first and last name
	const nameParts = fullName.split(' ');
	const prenom = nameParts[0] || '';
	const nom = nameParts.slice(1).join(' ') || '';

	// Store user in Utilisateurs collection
	const userRef = ref(database, `Elearning/Utilisateurs/${user.uid}`);
	await set(userRef, {
		id: user.uid,
		email,
		nom,
		prenom,
		userType,
		createdAt: new Date().toISOString(),
	});

	// If user is a student, create entry in Apprenants
	if (userType === 'apprenant') {
		const apprenantRef = ref(database, `Elearning/Apprenants/${user.uid}`);
		await set(apprenantRef, {
			id: user.uid,
			utilisateurId: user.uid,
			progression: 0,
			inscriptions: [],
			avatar:
				'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
		});
	}
	// If user is an instructor, create entry in Formateurs
	else if (userType === 'formateur') {
		const formateurRef = ref(database, `Elearning/Formateurs/${user.uid}`);
		await set(formateurRef, {
			id: user.uid,
			utilisateurId: user.uid,
			specialite: 'New Instructor',
			formations: [],
			bio: '',
			avatar:
				'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
		});
	}
	// If user is an admin, create entry in Administrateurs
	else if (userType === 'administrateur') {
		const adminRef = ref(database, `Elearning/Administrateurs/${user.uid}`);
		await set(adminRef, {
			id: user.uid,
			utilisateurId: user.uid,
		});
	}

	// Update user profile with full name
	await updateProfile(user, {
		displayName: fullName,
	});

	console.log(
		'authUtils.js - Registration completed successfully for user type:',
		userType,
	);

	// Return user object with userType
	return {
		...user,
		userType,
	};
};

export const loginUser = async (email, password) => {
	const userCredential = await signInWithEmailAndPassword(
		auth,
		email,
		password,
	);
	const user = userCredential.user;

	// Fetch user type from database
	const userRef = ref(database, `Elearning/Utilisateurs/${user.uid}`);
	const snapshot = await get(userRef);

	console.log('authUtils.js - User ID:', user.uid);
	console.log(
		'authUtils.js - Database path:',
		`Elearning/Utilisateurs/${user.uid}`,
	);
	console.log('authUtils.js - Snapshot exists:', snapshot.exists());

	if (snapshot.exists()) {
		const userData = snapshot.val();
		console.log('authUtils.js - User data from Firebase:', userData);

		if (!userData.userType) {
			console.error(
				'authUtils.js - User data found but no userType property:',
				userData,
			);

			// If userType is missing, try to determine it based on other collections
			let inferredUserType = null;

			// Check if user exists in Apprenants collection
			const apprenantRef = ref(database, `Elearning/Apprenants/${user.uid}`);
			const apprenantSnapshot = await get(apprenantRef);
			if (apprenantSnapshot.exists()) {
				inferredUserType = 'apprenant';
			}

			// Check if user exists in Formateurs collection
			const formateurRef = ref(database, `Elearning/Formateurs/${user.uid}`);
			const formateurSnapshot = await get(formateurRef);
			if (formateurSnapshot.exists()) {
				inferredUserType = 'formateur';
			}

			// Check if user exists in Administrateurs collection
			const adminRef = ref(database, `Elearning/Administrateurs/${user.uid}`);
			const adminSnapshot = await get(adminRef);
			if (adminSnapshot.exists()) {
				inferredUserType = 'administrateur';
			}

			console.log('authUtils.js - Inferred user type:', inferredUserType);

			// Update the user record with the inferred type if found
			if (inferredUserType) {
				try {
					await set(userRef, { ...userData, userType: inferredUserType });
					console.log(
						'authUtils.js - Updated user record with inferred type:',
						inferredUserType,
					);
				} catch (error) {
					console.error('authUtils.js - Error updating user record:', error);
				}
			}

			return {
				...user,
				userType: inferredUserType,
			};
		}

		return {
			...user,
			userType: userData.userType,
		};
	} else {
		console.error('authUtils.js - No user data found in database');
	}

	// If we reach here, no user type was found
	return {
		...user,
		userType: null,
	};
};

export const sendResetPasswordEmail = async (email) => {
	return sendPasswordResetEmail(auth, email);
};

export const getUserProfile = async (userId) => {
	if (!userId) return null;

	// Get base user data
	const userRef = ref(database, `Elearning/Utilisateurs/${userId}`);
	const snapshot = await get(userRef);

	if (!snapshot.exists()) {
		return null;
	}

	const userData = snapshot.val();
	const userType = userData.userType;

	// Get additional profile data based on user type
	if (userType === 'apprenant') {
		const apprenantRef = ref(database, `Elearning/Apprenants/${userId}`);
		const apprenantSnapshot = await get(apprenantRef);

		if (apprenantSnapshot.exists()) {
			const apprenantData = apprenantSnapshot.val();
			return {
				...userData,
				...apprenantData,
			};
		}
	} else if (userType === 'formateur') {
		const formateurRef = ref(database, `Elearning/Formateurs/${userId}`);
		const formateurSnapshot = await get(formateurRef);

		if (formateurSnapshot.exists()) {
			const formateurData = formateurSnapshot.val();
			return {
				...userData,
				...formateurData,
			};
		}
	} else if (userType === 'administrateur') {
		const adminRef = ref(database, `Elearning/Administrateurs/${userId}`);
		const adminSnapshot = await get(adminRef);

		if (adminSnapshot.exists()) {
			const adminData = adminSnapshot.val();
			return {
				...userData,
				...adminData,
			};
		}
	}

	return userData;
};
