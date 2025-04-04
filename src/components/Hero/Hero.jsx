import React, { useState, useEffect } from 'react';
import HeroImg from '../../assets/hero.png';
import { FaPlay } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { SlideRight } from '../../utility/animation';
import { fetchHeroContent } from '../../utils/firebaseUtils';
import { Link } from 'react-router-dom';

const Hero = () => {
	const [heroData, setHeroData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadHeroContent = async () => {
			try {
				const data = await fetchHeroContent();
				setHeroData(data);
			} catch (error) {
				console.error('Error loading hero content:', error);
			} finally {
				setLoading(false);
			}
		};

		loadHeroContent();
	}, []);

	// Use default content during loading or if there was an error
	const content = heroData || {
		title: "Find Your Perfect <span class='text-primary'>Tutor</span>",
		subtitle:
			'We help you find perfect tutor for 1-on-1 lessons. It is completely free and private',
		tagline: '100% Satisfaction Guarantee',
		primaryButton: 'Get Started',
		secondaryButton: 'See how it works',
		primaryButtonLink: '/courses',
		secondaryButtonLink: '#how-it-works',
		imageUrl: '',
	};

	return (
		<>
			<div className='container grid grid-cols-1 md:grid-cols-2 min-h-[650px] relative'>
				{/* brand info */}
				<div className='flex flex-col justify-center py-14 md:pr-16 xl:pr-40 md:py-0'>
					<div className='text-center md:text-left space-y-6'>
						<motion.p
							variants={SlideRight(0.4)}
							initial='hidden'
							animate='visible'
							className='text-orange-600 uppercase font-semibold'>
							{content.tagline}
						</motion.p>
						<motion.h1
							variants={SlideRight(0.6)}
							initial='hidden'
							animate='visible'
							className='text-5xl font-semibold lg:text-6xl !leading-tight'
							dangerouslySetInnerHTML={{ __html: content.title }}></motion.h1>
						<motion.p
							variants={SlideRight(0.8)}
							initial='hidden'
							animate='visible'>
							{content.subtitle}
						</motion.p>
						{/* button section */}
						<motion.div
							variants={SlideRight(1.0)}
							initial='hidden'
							animate='visible'
							className='flex gap-8 justify-center md:justify-start !mt-8 items-center'>
							<Link to={content.primaryButtonLink || '/courses'}>
								<button className='primary-btn'>{content.primaryButton}</button>
							</Link>
							<Link to={content.secondaryButtonLink || '#how-it-works'}>
								<button className='flex justify-end items-center gap-2 font-semibold'>
									<span className='w-10 h-10 bg-secondary/15 rounded-full flex justify-center items-center'>
										<FaPlay className='text-secondary' />
									</span>
									{content.secondaryButton}
								</button>
							</Link>
						</motion.div>
					</div>
				</div>
				{/* Hero image */}
				<div className='flex justify-center items-center'>
					<motion.img
						initial={{ opacity: 0, x: 200 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
						src={content.imageUrl || HeroImg}
						alt='Hero Image'
						onError={(e) => {
							e.target.src = HeroImg; // Fallback to local image if remote image fails to load
						}}
						className='w-[350px] md:w-[550px] xl:w-[700px]'
					/>
				</div>
			</div>
		</>
	);
};

export default Hero;
