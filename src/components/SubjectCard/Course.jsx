import React from 'react';
import { Clock, Star, Library, Users, ArrowRight } from 'lucide-react';

const Course = ({ course }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-56 object-cover"
        />
        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm">{course.duration}</span>
        </div>
      </div>

      <div className="p-6">
        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm mb-4">
          {course.level}
        </span>

        <h3 className="text-xl font-bold mb-4 hover:text-primary transition-colors duration-300">
          <a href="#">{course.title}</a>
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < Math.round(course.rating) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <p className="text-sm text-gray-600">
            ({course.rating}/{course.totalRatings} Rating)
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-primary">
            ${course.price.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-gray-600">
            <Library className="w-4 h-4" />
            <span className="text-sm">{course.lessons} Lessons</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">{course.students} Students</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Courses = () => {
  const courses = [
    {
      title: "Build Responsive Real-World Websites with HTML and CSS",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
      level: "Beginner",
      duration: "3 Weeks",
      rating: 5.0,
      totalRatings: 7,
      price: 29,
      lessons: 8,
      students: 20
    },
    {
      title: "Java Programming Masterclass for Software Developers",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
      level: "Advanced",
      duration: "8 Weeks",
      rating: 4.5,
      totalRatings: 9,
      price: 49,
      lessons: 15,
      students: 35
    },
    {
      title: "The Complete Camtasia Course for Content Creators",
      image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80",
      level: "Intermediate",
      duration: "3 Weeks",
      rating: 4.9,
      totalRatings: 7,
      price: 35,
      lessons: 13,
      students: 18
    }
  ];

  return (
    <section id="courses" className="py-20">
      <div className="container mx-auto px-4">
        <p className="text-center text-primary font-medium mb-4">Popular Courses</p>
        
        <h2 className="text-4xl font-bold text-center mb-12">
          Pick A Course To Get Started
        </h2>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, index) => (
            <li key={index}>
              <Course course={course} />
            </li>
          ))}
        </ul>

        <div className="text-center mt-12">
          <a href="#" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-colors duration-300">
            <span>Browse more courses</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};