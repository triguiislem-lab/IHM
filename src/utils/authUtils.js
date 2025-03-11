import {
	getAuth,
	createUserWithEmailAndPassword,
	signInWithEmailAndPassword,
	updateProfile,
	sendPasswordResetEmail,
} from 'firebase/auth';
import { getDatabase, ref, set, get } from 'firebase/database';
import { database } from '../../firebaseConfig';

const auth = getAuth();

export const registerUser = async (email, password, fullName, userType) => {
	// Create user with email and password
	const userCredential = await createUserWithEmailAndPassword(
		auth,
		email,
		password,
	);
	const user = userCredential.user;

	// Update user profile with full name
	await updateProfile(user, {
		displayName: fullName,
	});

	// Store additional user data in Realtime Database
	const userRef = ref(database, `users/${user.uid}`);
	await set(userRef, {
		fullName,
		email,
		userType,
		createdAt: new Date().toISOString(),
	});

	return user;
};

export const loginUser = async (email, password) => {
	const userCredential = await signInWithEmailAndPassword(
		auth,
		email,
		password,
	);
	const user = userCredential.user;

	// Fetch user type from database
	const userRef = ref(database, `users/${user.uid}`);
	const snapshot = await get(userRef);
	const userData = snapshot.val();

	return {
		user,
		userType: userData?.userType,
	};
};

export const resetPassword = async (email) => {
	try {
		await sendPasswordResetEmail(auth, email);
		return { success: true, message: 'Password reset email sent successfully!' };
	} catch (error) {
		let errorMessage = 'Failed to send password reset email';
		
		switch (error.code) {
			case 'auth/user-not-found':
				errorMessage = 'No account exists with this email address';
				break;
			case 'auth/invalid-email':
				errorMessage = 'Please enter a valid email address';
				break;
			case 'auth/too-many-requests':
				errorMessage = 'Too many attempts. Please try again later';
				break;
			default:
				errorMessage = error.message;
		}
		
		throw new Error(errorMessage);
	}
};
