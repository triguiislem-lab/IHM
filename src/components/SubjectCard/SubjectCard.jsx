import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaComputer, FaBook } from "react-icons/fa6";
import {
  fetchFormationsFromDatabase,
  testFirebasePaths,
} from "../../utils/firebaseUtils";
import { Link } from "react-router-dom";

const SubjectCard = () => {
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tester les chemins Firebase disponibles
        console.log("Testing Firebase paths...");
        await testFirebasePaths();

        // Récupérer les formations
        console.log("Fetching formations...");
        const formationsData = await fetchFormationsFromDatabase();
        console.log("Formations data:", formationsData);
        setFormations(formationsData);
      } catch (error) {
        console.error("Error fetching formations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonction pour déterminer l'icône à afficher
  const getIcon = (iconName) => {
    if (iconName === "FaComputer") return <FaComputer />;
    return <FaBook />;
  };

  if (loading) {
    return (
      <div className="container py-14 md:py-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="container py-14 md:py-24">
      {/* header section */}
      <div className="space-y-4 p-6 text-center max-w-[600px] mx-auto mb-5">
        <h1 className="uppercase font-semibold text-orange-500">
          Nos formations
        </h1>
        <p className="font-semibold text-3xl">
          Trouvez la formation qui vous convient
        </p>
      </div>
      {/* cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {formations.map((formation, index) => (
          <Link to={`/course/${formation.id}`} key={formation.id}>
            <motion.div
              initial={{ opacity: 0, x: -200 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 100,
                delay: index * 0.1,
              }}
              className="border rounded-lg border-secondary/20 p-4 flex justify-start items-center gap-4 hover:!scale-105 hover:!shadow-xl duration-200 cursor-pointer"
            >
              <div
                style={{
                  color: formation.color || "#0063ff",
                  backgroundColor: `${formation.color || "#0063ff"}20`,
                }}
                className="w-10 h-10 rounded-md flex justify-center items-center"
              >
                {getIcon(formation.icon)}
              </div>
              <p>{formation.titre}</p>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SubjectCard;
