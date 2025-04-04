import { useRef, useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { fetchSiteStatistics } from '../../utils/firebaseUtils';

const NumberCounter = () => {
	const countUpRef = useRef(null);
	const [stats, setStats] = useState({
		instructorCount: 0,
		courseCount: 0,
		contentHours: 0,
		studentCount: 0,
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStatistics = async () => {
			try {
				const statistics = await fetchSiteStatistics();
				setStats(statistics);
			} catch (error) {
				console.error('Error loading statistics:', error);
			} finally {
				setLoading(false);
			}
		};

		loadStatistics();
	}, []);

	return (
		<div className='bg-secondary text-white py-12'>
			<div className='container grid grid-cols-2 md:grid-cols-4 gap-8'>
				<div className='flex flex-col items-center justify-center'>
					<p
						className='text-3xl font-semibold'
						ref={countUpRef}>
						<CountUp
							start={0}
							end={stats.instructorCount}
							duration={3}
							enableScrollSpy
							scrollSpyDelay={200}
						/>
					</p>
					<p>Expert tutors</p>
				</div>
				<div className='flex flex-col items-center justify-center'>
					<p className='text-3xl font-semibold'>
						<CountUp
							end={stats.contentHours}
							separator=','
							suffix='+'
							duration={3}
							enableScrollSpy
							scrollSpyDelay={200}
						/>
					</p>
					<p>Hours content</p>
				</div>
				<div className='flex flex-col items-center justify-center'>
					<p className='text-3xl font-semibold'>
						<CountUp
							end={stats.courseCount}
							duration={3}
							enableScrollSpy
							scrollSpyDelay={200}
						/>
					</p>
					<p>Subject and courses</p>
				</div>
				<div className='flex flex-col items-center justify-center'>
					<p className='text-3xl font-semibold'>
						<CountUp
							end={stats.studentCount}
							separator=','
							suffix='+'
							duration={3}
							enableScrollSpy
							scrollSpyDelay={200}
						/>
					</p>
					<p>Active students</p>
				</div>
			</div>
		</div>
	);
};

export default NumberCounter;
