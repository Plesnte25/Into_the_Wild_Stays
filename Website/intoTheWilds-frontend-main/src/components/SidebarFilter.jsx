import { useState } from "react";
import PropTypes from "prop-types";
import { MapPin } from "lucide-react"; // Added for location icon

const SidebarFilter = ({ onFilterChange }) => {
  const [selectedLocation, setSelectedLocation] = useState("");

  const handleLocationClick = (location) => {
    const updatedLocation = selectedLocation === location ? "" : location;
    setSelectedLocation(updatedLocation);
    onFilterChange({ location: updatedLocation });
  };

  // Directly define the desired locations array
  const locations = ["Assam", "Dhanolti", "Goa", "Tehri", "Rishikesh"].sort();

  return (
    <div className="sidebar-filter p-6 bg-white rounded-lg shadow-lg w-full sm:w-72 sticky top-4">
      {/* ... rest of your component */}

      Location Filter Section
      <div className="filter-location">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-gray-600" />
          <h4 className="text-black font-medium">Location</h4>
        </div>

        <div className="flex flex-col gap-2">
          {locations?.map((city, index) => (
            <button
              key={index}
              onClick={() => handleLocationClick(city)}
              className={
                "w-full text-left px-4 py-2.5 transition-all duration-200 ease-in-out hover:bg-gray-100 rounded-lg flex items-center justify-between group " +
                (selectedLocation === city
                  ? "bg-gray-800 text-white hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700")
              }
              style={{ cursor: "pointer" }}
              aria-pressed={selectedLocation === city}
              type="button"
            >
              <span className="text-sm font-medium">{city}</span>
              {selectedLocation === city && (
                <span className="h-2 w-2 rounded-full bg-white"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ... rest of your component */}
    </div>
  );
};

SidebarFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  // properties: PropTypes.arrayOf(
  //   PropTypes.shape({
  //     location: PropTypes.string.isRequired,
  //   })
  // ).isRequired,
};

export default SidebarFilter;

// import React from 'react'

// const SidebarFilter = () => {
//   return (
//     <div>
      
//     </div>
//   )
// }

// export default SidebarFilter
