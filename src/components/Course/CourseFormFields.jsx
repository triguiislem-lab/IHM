import React from 'react';

// Reusable component for common course form fields
const CourseFormFields = ({
  formData,
  handleChange,
  specialites,
  filteredDisciplines,
  isInstructorForm = false, // Flag to hide instructor selector if needed
  allInstructors = [] // Only needed for admin form
}) => {
  return (
    <>
      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Titre de la Formation <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={formData.title || ''}
          onChange={handleChange}
          required
          minLength={5}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          id="description"
          rows="4"
          value={formData.description || ''}
          onChange={handleChange}
          required
          minLength={10}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        ></textarea>
      </div>

      {/* Image URL */}
      <div className="mb-4">
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          URL de l'image de couverture
        </label>
        <input
          type="url"
          name="image"
          id="image"
          value={formData.image || ''}
          onChange={handleChange}
          placeholder="https://exemple.com/image.jpg"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Level */}
        <div>
          <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
            Niveau <span className="text-red-500">*</span>
          </label>
          <select
            name="level"
            id="level"
            value={formData.level || 'Débutant'}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="Débutant">Débutant</option>
            <option value="Intermédiaire">Intermédiaire</option>
            <option value="Avancé">Avancé</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
            Durée Estimée (heures) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="duration"
            id="duration"
            value={formData.duration || ''}
            onChange={handleChange}
            required
            min="1"
            placeholder="Ex: 40"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
            Prix (€) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={formData.price === undefined ? '' : formData.price} // Handle potential undefined for number input
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Speciality */}
        <div>
          <label htmlFor="specialiteId" className="block text-sm font-medium text-gray-700 mb-1">
            Spécialité <span className="text-red-500">*</span>
          </label>
          <select
            name="specialiteId"
            id="specialiteId"
            value={formData.specialiteId || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>-- Sélectionner --</option>
            {specialites.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Discipline */}
        <div>
          <label htmlFor="disciplineId" className="block text-sm font-medium text-gray-700 mb-1">
            Discipline <span className="text-red-500">*</span>
          </label>
          <select
            name="disciplineId"
            id="disciplineId"
            value={formData.disciplineId || ''}
            onChange={handleChange}
            required
            disabled={!formData.specialiteId || filteredDisciplines.length === 0}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="" disabled>-- Sélectionner d'abord spécialité --</option>
            {filteredDisciplines.map((disc) => (
              <option key={disc.id} value={disc.id}>
                {disc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Instructor Selector (Only shown if not Instructor Form and if instructors provided) */}
      {!isInstructorForm && allInstructors.length > 0 && (
        <div className="mb-4">
          <label htmlFor="instructorId" className="block text-sm font-medium text-gray-700 mb-1">
            Formateur Assigné <span className="text-red-500">*</span>
          </label>
          <select
            name="instructorId"
            id="instructorId"
            value={formData.instructorId || ''}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>-- Sélectionner Formateur --</option>
            {allInstructors.map((instructor) => (
              <option key={instructor.id} value={instructor.id}>
                {instructor.firstName || ''} {instructor.lastName || ''} ({instructor.email})
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
};

export default CourseFormFields; 