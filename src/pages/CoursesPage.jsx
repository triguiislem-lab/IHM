import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  Clock,
  Star,
  Library,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { fetchCoursesFromDatabase } from "../utils/firebaseUtils";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const levels = ["Débutant", "Intermédiaire", "Avancé"];

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const coursesData = await fetchCoursesFromDatabase();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Get unique categories from courses
  const categories = [
    ...new Set(
      courses
        .map((course) => course.category || "Uncategorized")
        .filter(Boolean)
    ),
  ];

  const filteredCourses = courses.filter((course) => {
    // Vérifier si le cours a un titre ou utiliser un titre alternatif (titre ou "")
    const title = (course.title || course.titre || "").toLowerCase();
    // Vérifier si le cours a une description ou utiliser une chaîne vide
    const description = (course.description || "").toLowerCase();
    // Convertir le terme de recherche en minuscules
    const term = searchTerm.toLowerCase();

    const matchesSearch =
      term === "" || title.includes(term) || description.includes(term);
    const matchesLevel =
      selectedLevel === "" || (course.level || "Beginner") === selectedLevel;
    const matchesCategory =
      selectedCategory === "" ||
      (course.category || "Uncategorized") === selectedCategory;

    return matchesSearch && matchesLevel && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <section className="bg-[#f9f9f9] py-14 md:py-24">
      <div className="container">
        {/* Header */}
        <div className="space-y-4 text-center max-w-[600px] mx-auto mb-12">
          <h3 className="uppercase font-semibold text-orange-500">Nos Cours</h3>
          <h2 className="text-4xl font-semibold">
            Explorez Nos Cours Populaires
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Rechercher des cours..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={20}
            />
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="">Tous les niveaux</option>
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <SlidersHorizontal
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-secondary/20"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Toutes les catégories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <Library
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <img
                  src={
                    course.image ||
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80"
                  }
                  alt={course.title || course.titre || "Course"}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80";
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span className="text-sm">
                    {course.duration || "40 heures"}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <span className="inline-block bg-primary/10 text-secondary px-4 py-1 rounded-full text-sm font-medium mb-4">
                  {course.level || "Intermédiaire"}
                </span>

                <Link to={`/course/${course.id}`}>
                  <h3 className="text-xl font-bold mb-4 hover:text-secondary transition-colors duration-300">
                    {course.title || course.titre || "Cours"}
                  </h3>
                </Link>

                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-primary">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(course.rating || 4.5)
                            ? "fill-current"
                            : ""
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    ({course.rating || 4.5}/{course.totalRatings || 10}{" "}
                    Évaluations)
                  </p>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-secondary">
                    ${(course.price || 29.99).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Library className="w-4 h-4" />
                    <span className="text-sm">
                      {course.lessons || 8} Leçons
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {course.students || 20} Étudiants
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600">
              No courses found
            </h3>
            <p className="text-gray-500 mt-2">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesPage;
