import PropTypes from "prop-types";

const TourCard = ({ title, description, image }) => (
  <div className="max-w-sm rounded-lg border border-gray-200 overflow-hidden shadow-sm m-4 transition-transform transform hover:scale-105">
    <img className="w-full h-48 object-cover" src={image} alt={title} />
    <div className="p-4">
      <h3 className="font-semibold text-lg text-gray-800 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm mb-1">{description}</p>
      {/* <p className="text-gray-800 text-sm font-medium">
        From: {price} per adult
      </p> */}
    </div>
  </div>
);

TourCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.number.isRequired,
  image: PropTypes.string.isRequired,
};

export default TourCard;
