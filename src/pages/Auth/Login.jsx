import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../../utils/authUtils';

const Login = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { user, userType: roleFromDB } = await loginUser(formData.email, formData.password);
      
      // Verify if user type matches
      if (roleFromDB !== userType) {
        setError('Invalid user type for this account');
        return;
      }

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
            <h3 className="uppercase font-semibold text-orange-500">Welcome Back</h3>
            <h2 className="text-3xl font-semibold mt-2">Login to Your Account</h2>
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
                    placeholder="Enter your password"
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

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setUserType('')}
                  className="text-secondary hover:underline"
                >
                  Change User Type
                </button>
                <a href="#" className="text-secondary hover:underline">
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-secondary text-white font-semibold py-2 rounded-lg hover:bg-secondary/90 transition-colors duration-300"
              >
                Login
              </button>

              <p className="text-center text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-secondary hover:underline">
                  Register
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Login;