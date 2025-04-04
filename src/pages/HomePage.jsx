import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero/Hero';
import WhyChooseUs from '../components/WhyChooseUs/WhyChooseUs';
import SubjectCard from '../components/SubjectCard/SubjectCard';
import Banner from '../components/Banner/Banner';
import Testimonial from '../components/Testimonial/Testimonial';
import { Courses } from '../components/SubjectCard/Course';
import Img1 from '../assets/banner1.png';
import Img2 from '../assets/banner2.png';
import NumberCounter from '../components/NumberCounter/NumberCounter';
import { fetchBannerContent } from '../utils/firebaseUtils';

const HomePage = () => {
	const [banners, setBanners] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadBanners = async () => {
			try {
				const bannerData = await fetchBannerContent();
				setBanners(bannerData);
			} catch (error) {
				console.error('Error loading banner content:', error);
				// Fallback to default banners if there's an error
				setBanners([
					{
						id: 'banner1',
						image: Img1,
						tag: 'CUSTOMIZE WITH YOUR SCHEDULE',
						title: 'Personalized Professional Online Tutor on Your Schedule',
						subtitle:
							'Our scheduling system allows you to select based on your free time.',
						link: '#',
					},
					{
						id: 'banner2',
						image: Img2,
						tag: 'QUALIFIED INSTRUCTORS',
						title: 'Talented and Qualified Tutors to Serve You',
						subtitle:
							'Learn from industry experts who are passionate about teaching.',
						link: '#',
						reverse: true,
					},
				]);
			} finally {
				setLoading(false);
			}
		};

		loadBanners();
	}, []);

	return (
		<>
			<Hero />
			<NumberCounter />
			<WhyChooseUs />

			{/* Render banners dynamically */}
			{banners.map((banner, index) => (
				<Banner
					key={banner.id || index}
					image={banner.image || (index % 2 === 0 ? Img1 : Img2)}
					tag={banner.tag}
					title={banner.title}
					subtitle={banner.subtitle}
					link={banner.link}
					reverse={banner.reverse || index % 2 !== 0}
				/>
			))}

			<SubjectCard />
			<Courses />
			<Testimonial />
		</>
	);
};

export default HomePage;
