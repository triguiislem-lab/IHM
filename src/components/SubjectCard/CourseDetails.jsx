import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Book, Clock, Award, Users, CheckCircle, PlayCircle } from 'lucide-react';
import Navbar from "./components/Navbar/Navbar";
import Footer from '../components/Footer';
import { useTypewriter } from '../utils/animations';
import { courses } from '../data/courses';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the course by ID
  const course = courses.find(c => c.id === parseInt(id || '0'));
  
  const { displayText } = useTypewriter(
    course?.title || 'Course Details', 
    50
  );

  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <p className="text-foreground/70 mb-8">The course youlooking for t exist.</p>
          <button 
            onClick={() => navigate('/')} 
            className="button-primary flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Banner */}
        <section className={`${course.colorClass} bg-opacity-10 py-16 md:py-24`}>
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft size={16} />
                Back to Courses
              </button>
              
              <span className={`inline-block ${course.color} text-white px-4 py-1 rounded-full text-sm font-medium mb-4`}>
                {course.level}
              </span>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-6">
                {displayText}
              </h1>
              
              <p className="text-foreground/70 text-lg md:text-xl mb-8">
                {course.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-foreground/70 mb-1">
                    <Users size={16} />
                    <span className="text-sm">Students</span>
                  </div>
                  <span className="font-bold text-lg">{course.students.toLocaleString()}</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-foreground/70 mb-1">
                    <Book size={16} />
                    <span className="text-sm">Lessons</span>
                  </div>
                  <span className="font-bold text-lg">{course.lessons}</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-foreground/70 mb-1">
                    <Clock size={16} />
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="font-bold text-lg">24 hours</span>
                </div>
                
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-foreground/70 mb-1">
                    <Award size={16} />
                    <span className="text-sm">Level</span>
                  </div>
                  <span className="font-bold text-lg">{course.level}</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="button-primary flex-1 flex items-center justify-center gap-2">
                  <PlayCircle size={20} />
                  Enroll Now
                </button>
                <button className="bg-white border border-primary text-primary px-6 py-3 rounded-full font-medium transition-all duration-300 hover:bg-primary/5 flex-1 flex items-center justify-center gap-2">
                  Preview Course
                </button>
              </div>
            </motion.div>
          </div>
        </section>
        
        {/* Course Content */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <div className="lg:w-2/3">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-8">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 font-medium capitalize transition-colors ${
                        activeTab === tab
                          ? 'text-primary border-b-2 border-primary'
                          : 'text-foreground/70 hover:text-primary'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                
                {/* Tab Content */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">Course Overview</h2>
                    
                    <div className="prose max-w-none">
                      <p className="mb-4">
                        This comprehensive course will take you through the fundamentals to advanced concepts of {course.title}. 
                        Whether you're just starting out or looking to enhance your skills, this course provides a structured 
                        learning path with practical projects and hands-on exercises.
                      </p>
                      
                      <h3 className="text-xl font-bold mt-8 mb-4">What You'll Learn</h3>
                      
                      <ul className="space-y-3 mb-8">
                        {['Master fundamental concepts and best practices', 
                          'Build real-world projects to apply your knowledge',
                          'Understand advanced techniques used in the industry',
                          'Develop problem-solving skills through practical exercises',
                          'Receive a certificate upon course completion'].map((item, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h3 className="text-xl font-bold mt-8 mb-4">Prerequisites</h3>
                      <p>
                        {course.level === 'Beginner' 
                          ? 'No prior experience is needed. This course is designed for absolute beginners.' 
                          : course.level === 'Intermediate'
                            ? 'Basic understanding of the fundamentals is recommended.'
                            : 'Intermediate knowledge of the subject is required to get the most from this course.'}
                      </p>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'curriculum' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">Course Curriculum</h2>
                    
                    <div className="space-y-4">
                      {[
                        { title: 'Introduction to the Course', lessons: 3, duration: '45 minutes' },
                        { title: 'Getting Started with the Fundamentals', lessons: 5, duration: '2 hours' },
                        { title: 'Building Your First Project', lessons: 8, duration: '4 hours' },
                        { title: 'Advanced Concepts and Techniques', lessons: 7, duration: '3.5 hours' },
                        { title: 'Real-world Applications', lessons: 6, duration: '5 hours' },
                        { title: 'Final Project and Assessment', lessons: 4, duration: '8 hours' }
                      ].map((module, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-4 flex justify-between items-center">
                            <h3 className="font-bold">Module {index + 1}: {module.title}</h3>
                            <div className="text-sm text-foreground/70">
                              {module.lessons} lessons · {module.duration}
                            </div>
                          </div>
                          <div className="p-4">
                            <ul className="space-y-2">
                              {Array.from({ length: 3 }, (_, i) => (
                                <li key={i} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                                  <div className="flex items-center gap-3">
                                    <PlayCircle size={18} className="text-gray-400" />
                                    <span>Lesson {i + 1}</span>
                                    {i === 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Free</span>}
                                  </div>
                                  <span className="text-sm text-foreground/70">15 min</span>
                                </li>
                              ))}
                              <li className="text-center text-sm text-foreground/70 p-2">
                                + {module.lessons - 3} more lessons (unlock after enrollment)
                              </li>
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'instructor' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">About the Instructor</h2>
                    
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        <img 
                          src="https://randomuser.me/api/portraits/men/32.jpg" 
                          alt="Instructor" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-bold mb-2">Prof. Alex Johnson</h3>
                        <p className="text-foreground/70 mb-4">Senior Developer & Educator</p>
                        
                        <p className="mb-4">
                          Alex has over 10 years of industry experience and has taught more than 50,000 students 
                          worldwide. He specializes in making complex topics easy to understand through 
                          practical, hands-on teaching methods.
                        </p>
                        
                        <div className="flex gap-4 mb-6">
                          <div className="text-center">
                            <div className="font-bold text-xl">15+</div>
                            <div className="text-sm text-foreground/70">Courses</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-xl">50K+</div>
                            <div className="text-sm text-foreground/70">Students</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-xl">4.8</div>
                            <div className="text-sm text-foreground/70">Rating</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {activeTab === 'reviews' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
                    
                    <div className="flex flex-col gap-8">
                      {[
                        { 
                          name: "Sarah L.", 
                          avatar: "https://randomuser.me/api/portraits/women/44.jpg",
                          rating: 5,
                          date: "3 months ago",
                          review: "This course exceeded my expectations. The instructor explains complex concepts in a way that's easy to understand, and the projects helped me apply what I learned immediately."
                        },
                        { 
                          name: "Michael T.", 
                          avatar: "https://randomuser.me/api/portraits/men/22.jpg",
                          rating: 4,
                          date: "1 month ago",
                          review: "Great course with lots of practical examples. I would have liked more advanced content toward the end, but overall it was an excellent investment of my time."
                        },
                        { 
                          name: "Emma R.", 
                          avatar: "https://randomuser.me/api/portraits/women/29.jpg",
                          rating: 5,
                          date: "2 weeks ago",
                          review: "As a complete beginner, I found this course approachable yet comprehensive. The instructor's teaching style made learning enjoyable, and I feel confident in my new skills."
                        }
                      ].map((review, index) => (
                        <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-4 items-center">
                              <div className="w-12 h-12 rounded-full overflow-hidden">
                                <img 
                                  src={review.avatar} 
                                  alt={review.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <div className="font-medium">{review.name}</div>
                                <div className="text-sm text-foreground/70">{review.date}</div>
                              </div>
                            </div>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                              ))}
                            </div>
                          </div>
                          <p>{review.review}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      <button className="w-full border border-gray-300 text-foreground/70 font-medium py-3 rounded-lg hover:bg-gray-50 transition-colors">
                        Load More Reviews
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              
              {/* Sidebar */}
              <div className="lg:w-1/3">
                <div className="sticky top-24 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="aspect-video bg-gray-100">
                    <img 
                      src={`https://source.unsplash.com/random/600x400/?${course.title.toLowerCase().replace(/ /g, ',')}`} 
                      alt={course.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors">
                        <PlayCircle size={32} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-2xl font-bold">€199</div>
                      <div className="text-foreground/70 line-through">€299</div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-4">
                        <Clock size={20} className="text-foreground/70" />
                        <div className="text-sm">Full lifetime access</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Book size={20} className="text-foreground/70" />
                        <div className="text-sm">Access on mobile and desktop</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Award size={20} className="text-foreground/70" />
                        <div className="text-sm">Certificate of completion</div>
                      </div>
                    </div>
                    
                    <button className="button-primary w-full mb-3">
                      Enroll Now
                    </button>
                    
                    <div className="text-center text-sm text-foreground/70">
                      30-day money-back guarantee
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Related Courses */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-bold mb-8 text-center">Related Courses You May Like</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses
                .filter(c => c.id !== course.id)
                .slice(0, 3)
                .map((relatedCourse, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className={`h-2 ${relatedCourse.color}`}></div>
                    <div className="p-6">
                      <div className={`w-12 h-12 rounded-lg ${relatedCourse.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                        <relatedCourse.icon size={24} className={relatedCourse.iconColor} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{relatedCourse.title}</h3>
                      <p className="text-foreground/70 mb-4">{relatedCourse.description}</p>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{relatedCourse.students} students</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/course/${relatedCourse.id}`)} 
                          className="text-primary font-medium hover:underline text-sm"
                        >
                          View Course
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseDetails;
