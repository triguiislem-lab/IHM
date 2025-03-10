import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Library, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchCoursesFromDatabase } from '../../utils/firebaseUtils';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const coursesData = await fetchCoursesFromDatabase();
        const foundCourse = coursesData.find(c => c.id === id);
        setCourse(foundCourse);
      } catch (error) {
        console.error('Error loading course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-8">The course you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/')} 
            className="primary-btn flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="bg-[#f9f9f9] py-14 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              {/* Course Header */}
              <div className="mb-8">
                <span className="inline-block bg-primary/10 text-secondary px-4 py-1 rounded-full text-sm font-medium mb-4">
                  {course.category}
                </span>
                <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Library className="w-4 h-4" />
                    <span>{course.lessons} Lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.students} Students</span>
                  </div>
                </div>
              </div>

              {/* Course Image */}
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-[400px] object-cover rounded-xl mb-8"
              />

              <div className="grid md:grid-cols-3 gap-8">
                {/* Course Main Content */}
                <div className="md:col-span-2">
                  {/* Course Description */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">Course Description</h2>
                    <p className="text-gray-600">{course.description}</p>
                  </div>

                  {/* Topics */}
                  <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
                    <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {course.topics.map((topic, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Instructor</h2>
                    <div className="flex items-center gap-4">
                      <img 
                        src={course.instructor.avatar} 
                        alt={course.instructor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold">{course.instructor.name}</h3>
                        <p className="text-gray-600">{course.instructor.bio}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course Sidebar */}
                <div>
                  <div className="bg-white p-6 rounded-xl shadow-lg sticky top-4">
                    <div className="mb-6">
                      <h3 className="text-3xl font-bold mb-4">${course.price.toFixed(2)}</h3>
                      <button className="w-full primary-btn mb-4">Enroll Now</button>
                    </div>

                    <div className="space-y-4 border-t pt-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Level</span>
                        <span className="font-medium">{course.level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating</span>
                        <div className="flex items-center gap-1">
                          <div className="flex text-primary">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.round(course.rating) ? 'fill-current' : ''}`} 
                              />
                            ))}
                          </div>
                          <span>({course.totalRatings})</span>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated</span>
                        <span className="font-medium">
                          {new Date(course.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CourseDetails;
