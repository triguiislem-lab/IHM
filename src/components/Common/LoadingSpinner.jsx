import React from "react";
import OptimizedLoadingSpinner from "./OptimizedLoadingSpinner";

// Composant de compatibilité pour remplacer l'ancien LoadingSpinner
const LoadingSpinner = ({ text = "Chargement en cours..." }) => {
  return <OptimizedLoadingSpinner size="large" text={text} />;
};

export default LoadingSpinner;
