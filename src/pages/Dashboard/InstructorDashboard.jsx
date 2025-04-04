// src/pages/Dashboard/InstructorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, TrendingUp, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { fetchInstructorCourses } from '../../utils/firebaseUtils';
import { getAuth } from 'firebase/auth';

const InstructorDashboard = () => {
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    publishedCourses: 0
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) return;

    setUser(currentUser);

    const loadInstructorData = async () => {
      try {
        // Fetch instructor's courses
        const instructorCourses = await fetchInstructorCourses(currentUser.uid);
        setCourses(instructorCourses);
        
        // Calculate stats
        const published = instructorCourses.filter(course => course.isPublished).length;
        const totalStudentsEnrolled = instructorCourses.reduce(
          (sum, course) => sum + (course.enrolledStudents || 0), 0
        );
        const totalRevenueGenerated = instructorCourses.reduce(
          (sum, course) => sum + (course.revenue || 0), 0
        );

        setStats({
          totalCourses: instructorCourses.length,
          totalStudents: totalStudentsEnrolled,
          totalRevenue: totalRevenueGenerated,
          publishedCourses: published
        });
      } catch (error) {
        console.error('Error loading instructor data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInstructorData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userType="instructor">
        <div className='flex justify-center items-center h-[calc(100vh-200px)]'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-secondary'></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="instructor">
      {/* Welcome Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold'>
          Welcome, {user?.displayName || 'Instructor'}
        </h1>
        <p className='text-gray-600'>
          Manage your courses and track your performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className='bg-white p-6 rounded-xl shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm'>Total Courses</p>
              <h3 className='text-3xl font-bold'>{stats.totalCourses}</h3>
            </div>
            <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
              <BookOpen className='text-blue-600' />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className='bg-white p-6 rounded-xl shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm'>Published</p>
              <h3 className='text-3xl font-bold'>{stats.publishedCourses}</h3>
            </div>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center'>
              <BookOpen className='text-green-600' />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className='bg-white p-6 rounded-xl shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm'>Total Students</p>
              <h3 className='text-3xl font-bold'>{stats.totalStudents}</h3>
            </div>
            <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center'>
              <Users className='text-purple-600' />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className='bg-white p-6 rounded-xl shadow-sm'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-gray-500 text-sm'>Revenue</p>
              <h3 className='text-3xl font-bold'>${stats.totalRevenue}</h3>
            </div>
            <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center'>
              <TrendingUp className='text-yellow-600' />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Courses List */}
      <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-xl font-semibold'>Your Courses</h2>
          <Link
            to='/dashboard/instructor/courses/new'
            className='flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition'>
            <PlusCircle size={16} />
            <span>Create New Course</span>
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='min-w-full bg-white'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>Course</th>
                  <th className='py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                  <th className='py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>Students</th>
                  <th className='py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>Revenue</th>
                  <th className='py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>Last Updated</th>
                  <th className='py-3 px-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {courses.map((course) => (
                  <tr key={course.id} className='hover:bg-gray-50'>
                    <td className='py-4 px-4'>
                      <div className='flex items-center'>
                        <img 
                          src={course.image || 'https://via.placeholder.com/150'} 
                          alt={course.title} 
                          className='w-10 h-10 rounded object-cover mr-3'
                        />
                        <div>
                          <p className='font-medium'>{course.title}</p>
                          <p className='text-sm text-gray-500'>{course.category || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className='py-4 px-4'>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className='py-4 px-4'>{course.enrolledStudents || 0}</td>
                    <td className='py-4 px-4'>${course.revenue || 0}</td>
                    <td className='py-4 px-4'>{new Date(course.updatedAt || Date.now()).toLocaleDateString()}</td>
                    <td className='py-4 px-4'>
                      <Link 
                        to={`/dashboard/instructor/courses/${course.id}`}
                        className='text-blue-600 hover:text-blue-800 mr-3'>
                        Edit
                      </Link>
                      <Link 
                        to={`/dashboard/instructor/courses/${course.id}/analytics`}
                        className='text-purple-600 hover:text-purple-800'>
                        Analytics
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='text-center py-12'>
            <BookOpen className='mx-auto h-12 w-12 text-gray-400 mb-4' />
            <h3 className='text-lg font-medium text-gray-900 mb-2'>No courses yet</h3>
            <p className='text-gray-500 mb-6'>Get started by creating your first course</p>
            <Link
              to='/dashboard/instructor/courses/new'
              className='bg-secondary text-white px-4 py-2 rounded-lg hover:bg-secondary/90 transition'>
              Create Your First Course
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;