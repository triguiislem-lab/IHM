import { database } from '../../firebaseConfig';
import { ref, get } from 'firebase/database';

export const fetchCoursesFromDatabase = async () => {
	try {
		const coursesRef = ref(database, 'courses');
		const snapshot = await get(coursesRef);

		if (snapshot.exists()) {
			const coursesData = snapshot.val();
			// Convert object to array if necessary
			return Array.isArray(coursesData)
				? coursesData
				: Object.values(coursesData);
		}
		return [];
	} catch (error) {
		console.error('Error fetching courses:', error);
		throw error;
	}
};
