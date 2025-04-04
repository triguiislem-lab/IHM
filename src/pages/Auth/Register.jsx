import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser } from '../../utils/authUtils';

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await registerUser(
        formData.email,
        formData.password,
        formData.fullName,
        userType
      );

      // Redirect based on user type
      switch (userType) {
        case 'student':
          navigate('/dashboard/student');
          break;
        case 'instructor':
          navigate('/dashboard/instructor');
          break;
        case 'admin':
          navigate('/dashboard/admin');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const userTypes = [
    { id: 'student', label: 'Student', description: 'Access courses and learn' },
    { id: 'instructor', label: 'Instructor', description: 'Teach and manage courses' },
    { id: 'admin', label: 'Admin', description: 'Manage the platform' },
  ];

  return (
    <section className="bg-[#f9f9f9] py-14 md:py-24">
      <div className="container">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md p-8">
          <div className="text-center mb-8">
            <h3 className="uppercase font-semibold text-orange-500">Join Us</h3>
            <h2 className="text-3xl font-semibold mt-2">Create Your Account</h2>
          </div>

          {!userType ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center mb-6">Select User Type</h3>
              {userTypes.map((type) => (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setUserType(type.id)}
                  className="w-full p-4 border rounded-lg text-left hover:border-secondary transition-colors duration-300"
                >
                  <div className="font-semibold text-lg">{type.label}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </motion.button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 text-sm text-center mb-4">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setUserType('')}
                  className="text-secondary hover:underline"
                >
                  Change User Type
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-secondary text-white font-semibold py-2 rounded-lg hover:bg-secondary/90 transition-colors duration-300"
              >
                Create Account
              </button>

              <p className="text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-secondary hover:underline">
                  Login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Register;