import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { fetchTestimonials } from '../../utils/firebaseUtils';

const Testimonial = () => {
	const [testimonials, setTestimonials] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadTestimonials = async () => {
			try {
				const testimonialData = await fetchTestimonials();
				setTestimonials(testimonialData);
			} catch (error) {
				console.error('Error loading testimonials:', error);
			} finally {
				setLoading(false);
			}
		};

		loadTestimonials();
	}, []);

	const setting = {
		dots: true,
		arrow: false,
		infinite: true,
		speed: 500,
		slidesToScroll: 1,
		// autoplay: true,
		autoplaySpeed: 2000,
		cssEase: 'linear',
		pauseOnHover: true,
		pauseOnFocus: true,
		responsive: [
			{
				breakpoint: 10000,
				settings: {
					slidesToShow: testimonials.length < 3 ? testimonials.length : 3,
					slidesToScroll: 1,
					infinite: true,
				},
			},
			{
				breakpoint: 1024,
				settings: {
					slidesToShow: testimonials.length < 2 ? testimonials.length : 2,
					slidesToScroll: 1,
					initialSlide: 2,
				},
			},
			{
				breakpoint: 640,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
				},
			},
		],
	};

	// Display a loading skeleton while data is being fetched
	if (loading) {
		return (
			<div className='py-14 mb-10'>
				<div className='container'>
					<div className='space-y-4 p-6 text-center max-w-[600px] mx-auto mb-6'>
						<h1 className='uppercase font-semibold text-orange-600'>
							OUR TESTIMONIALS
						</h1>
						<p className='font-semibold text-3xl '>
							What Our Students Say About Us
						</p>
					</div>
					<div className='flex flex-wrap justify-center gap-4'>
						{[1, 2, 3].map((i) => (
							<div
								key={i}
								className='flex flex-col gap-4 p-8 shadow-lg mx-4 rounded-xl bg-secondary/10 w-72 animate-pulse'>
								<div className='flex justify-start items-center gap-5'>
									<div className='w-16 h-16 rounded-full bg-gray-300'></div>
									<div className='space-y-2'>
										<div className='h-4 bg-gray-300 rounded w-24'></div>
										<div className='h-3 bg-gray-200 rounded w-16'></div>
									</div>
								</div>
								<div className='py-6 space-y-4'>
									<div className='h-3 bg-gray-200 rounded w-full'></div>
									<div className='h-3 bg-gray-200 rounded w-full'></div>
									<div className='h-3 bg-gray-200 rounded w-2/3'></div>
									<div className='h-4 bg-gray-300 rounded w-20'></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	// If no testimonials found, display a message or return null
	if (testimonials.length === 0) {
		return (
			<div className='py-14 mb-10'>
				<div className='container'>
					<div className='space-y-4 p-6 text-center max-w-[600px] mx-auto mb-6'>
						<h1 className='uppercase font-semibold text-orange-600'>
							OUR TESTIMONIALS
						</h1>
						<p className='font-semibold text-3xl'>
							What Our Students Say About Us
						</p>
					</div>
					<p className='text-center text-gray-500'>
						No testimonials available yet.
					</p>
				</div>
			</div>
		);
	}

	// Render the star rating based on the rating value
	const renderStars = (rating) => {
		const ratingValue = rating || 5;
		return '⭐'.repeat(Math.min(Math.round(ratingValue), 5));
	};

	return (
		<div className='py-14 mb-10'>
			<div className='container'>
				{/* header section */}
				<div className='space-y-4 p-6 text-center max-w-[600px] mx-auto mb-6'>
					<h1 className='uppercase font-semibold text-orange-600'>
						OUR TESTIMONIALS
					</h1>
					<p className='font-semibold text-3xl '>
						What Our Students Say About Us
					</p>
				</div>
				{/* Testimonial cards section */}
				<div>
					<Slider {...setting}>
						{testimonials.map((item) => {
							return (
								<div key={item.id}>
									<div className='flex flex-col gap-4 p-8 shadow-lg mx-4 rounded-xl bg-secondary/10'>
										{/* upper section */}
										<div className='flex justify-start items-center gap-5'>
											<img
												src={item.img || 'https://picsum.photos/100/100'}
												alt={item.name}
												className='w-16 h-16 rounded-full object-cover'
												onError={(e) => {
													e.target.src = 'https://picsum.photos/100/100';
												}}
											/>
											<div>
												<p className='text-xl font-bold text-black/80'>
													{item.name}
												</p>
												<p>{item.course}</p>
											</div>
										</div>
										{/* bottom section */}
										<div className='py-6 space-y-4'>
											<p className='text-sm text-gray-500'>{item.text}</p>
											<p>{renderStars(item.rating)}</p>
										</div>
									</div>
								</div>
							);
						})}
					</Slider>
				</div>
			</div>
		</div>
	);
};

export default Testimonial;
